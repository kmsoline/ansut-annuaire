import { NextRequest, NextResponse } from 'next/server';
import { dbSelectOne } from '@/lib/db';
import type { AfriNomadeDemande, LigneCotation, FormuleCotation, JourItineraire } from '@/lib/afrinomade-types';
import { checkAdminAuth } from '@/lib/api-auth';

// ── Helpers ──────────────────────────────────────────────────────────────────
function parseJSON<T>(v: T | string | undefined): T | undefined {
  if (!v) return undefined;
  if (typeof v === 'string') { try { return JSON.parse(v) as T; } catch { return undefined; } }
  return v;
}

function fmtFCFA(n: number) { return n.toLocaleString('fr-FR') + ' FCFA'; }

// ── Génération Excel (logique partagée GET + POST) ────────────────────────────
async function generateExcel(d: AfriNomadeDemande, id: string): Promise<ArrayBuffer> {
    // ── Récupérer les données ──────────────────────────────────────────────
    const formules  = parseJSON<FormuleCotation[]>(d.formules as unknown as string);
    const itineraire = parseJSON<JourItineraire[]>(d.itineraire as unknown as string) ?? [];
    const legacyCotation = parseJSON<LigneCotation[]>(d.cotation as unknown as string) ?? [];

    // Résoudre les formules
    let lignesStandard: LigneCotation[];
    let lignesPremium:  LigneCotation[];

    if (formules && formules.length > 0) {
      lignesStandard = formules.find(f => f.id === 'standard')?.lignes ?? legacyCotation;
      lignesPremium  = formules.find(f => f.id === 'premium')?.lignes  ?? [];
    } else {
      lignesStandard = legacyCotation;
      lignesPremium  = [];
    }

    const voyageurs     = (d.nb_adultes ?? 1) + (d.nb_enfants ?? 0);
    const totalStd      = lignesStandard.reduce((s, l) => s + (l.total_facture ?? 0), 0);
    const totalPrm      = lignesPremium.reduce ((s, l) => s + (l.total_facture ?? 0), 0);
    const totalStdCout  = lignesStandard.reduce((s, l) => s + (l.total_cout    ?? 0), 0);
    const totalPrmCout  = lignesPremium.reduce ((s, l) => s + (l.total_cout    ?? 0), 0);
    const hasMulti      = lignesPremium.length > 0;

    // ── Workbook ──────────────────────────────────────────────────────────
    const ExcelJS = (await import('exceljs')).default;
    const wb = new ExcelJS.Workbook();
    wb.creator = 'AfriNomade';
    wb.created = new Date();

    // Couleurs
    const C = {
      VERT:       '1B3D2F',
      OR:         'D4903C',
      IVOIRE:     'FFF8EE',
      VERT_DOUX:  'E8F0EC',
      STD:        '0BA5A4',   // turquoise
      PRE:        'CFAE63',   // gold
      GRIS:       'F5F5F5',
      ROUGE:      'EF4444',
      BLANC:      'FFFFFFFF',
    };

    const headerStyle = (ws: InstanceType<typeof ExcelJS.Workbook>['worksheets'][0], row: ReturnType<typeof ws.addRow>, bgArgb: string) => {
      row.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: C.BLANC }, size: 10 };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgArgb } };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      });
    };

    // ── Référence circuit ─────────────────────────────────────────────────
    const ref = d.reference ?? `AN-${(d.pays_destination ?? 'XX').slice(0, 2).toUpperCase()}-${new Date().getFullYear()}-${id.slice(0, 4).toUpperCase()}`;
    const circuitLabel = `Circuit ${d.pays_destination ?? ''}${d.villes?.length ? ` — ${d.villes.join(' / ')}` : ''}`;

    // ─────────────────────────────────────────────────────────────────────
    // ONGLET 1 — RÉCAP CLIENT (si multi-formules, affiche les 2)
    // ─────────────────────────────────────────────────────────────────────
    const buildClientSheet = (
      name: string,
      lignes: LigneCotation[],
      total: number,
      formuleName: string,
      tabColor: string
    ) => {
      const ws = wb.addWorksheet(name, { properties: { tabColor: { argb: tabColor } } });
      ws.columns = [{ width: 36 }, { width: 22 }, { width: 10 }, { width: 12 }, { width: 20 }];

      // En-tête brandé
      ws.mergeCells('A1:E1');
      const h1 = ws.getCell('A1');
      h1.value = '🌍 AfriNomade — Cotation de voyage';
      h1.font  = { size: 18, bold: true, color: { argb: C.BLANC } };
      h1.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.VERT } };
      h1.alignment = { horizontal: 'center', vertical: 'middle' };
      ws.getRow(1).height = 38;

      ws.mergeCells('A2:E2');
      const h2 = ws.getCell('A2');
      h2.value = '"Explore. Ressens. Reviens changé."';
      h2.font  = { italic: true, color: { argb: C.OR }, size: 11 };
      h2.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.VERT } };
      h2.alignment = { horizontal: 'center' };

      ws.addRow([]);

      // Référence + formule
      ws.mergeCells(`A3:E3`);
      const r3 = ws.getCell('A3');
      r3.value = `${formuleName}  ·  Réf. ${ref}  ·  ${circuitLabel}`;
      r3.font  = { bold: true, size: 11, color: { argb: tabColor } };
      r3.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.GRIS } };
      r3.alignment = { horizontal: 'center' };
      ws.getRow(3).height = 20;

      ws.addRow([]);

      // Infos séjour
      const addInfo = (label: string, value: string) => {
        const row = ws.addRow([label, value]);
        row.getCell(1).font = { bold: true, size: 10, color: { argb: C.VERT } };
        row.getCell(2).font = { size: 10 };
      };
      addInfo('Client :', `${d.prenom} ${d.nom}`);
      addInfo('Destination :', `${d.pays_destination ?? '—'}${d.villes?.length ? ` / ${d.villes.join(', ')}` : ''}`);
      addInfo('Dates :', `${d.date_depart ?? '—'} → ${d.date_retour ?? '—'}${d.nb_nuits ? ` (${d.nb_nuits} nuits)` : ''}`);
      addInfo('Voyageurs :', `${d.nb_adultes ?? 1} adulte(s) + ${d.nb_enfants ?? 0} enfant(s)`);
      addInfo('Hébergement :', d.type_hebergement ?? '—');
      addInfo('Transport :', d.type_vehicule ?? '—');
      if (d.langue_guide && d.langue_guide !== 'Pas besoin de guide') {
        addInfo('Guide :', d.langue_guide);
      }
      if (d.activites?.length) addInfo('Activités :', d.activites.join(', '));

      ws.addRow([]);

      // Tableau prestations (sans coûts réels)
      const thRow = ws.addRow(['Prestation', 'Détail', 'Quantité', 'Unité', 'Montant (FCFA)']);
      headerStyle(ws, thRow, C.OR);
      thRow.height = 22;

      lignes.forEach((l) => {
        const row = ws.addRow([l.poste, l.description ?? '', l.quantite, l.unite, l.total_facture]);
        row.getCell(5).numFmt = '#,##0';
        row.eachCell((cell) => { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.IVOIRE } }; });
      });

      ws.addRow([]);

      // Totaux
      const addTotal = (label: string, value: string, bold = false, colorArgb = '333333') => {
        const row = ws.addRow(['', '', '', label, value]);
        row.getCell(4).font = { bold, size: bold ? 12 : 10, color: { argb: colorArgb } };
        row.getCell(5).font = { bold, size: bold ? 12 : 10, color: { argb: colorArgb } };
        row.getCell(4).alignment = { horizontal: 'right' };
        row.getCell(5).alignment = { horizontal: 'right' };
      };
      addTotal('TOTAL', fmtFCFA(total), true, C.OR);
      addTotal('Prix / personne', fmtFCFA(Math.round(total / voyageurs)));
      addTotal('Acompte 50%', fmtFCFA(Math.round(total * 0.5)), false, C.VERT);
      addTotal('Solde restant', fmtFCFA(Math.round(total * 0.5)));

      ws.addRow([]);

      // Inclus / non inclus
      const addSection = (title: string, items: string[], color: string) => {
        const tr = ws.addRow([title]);
        tr.getCell(1).font = { bold: true, color: { argb: color }, size: 11 };
        ws.mergeCells(`A${tr.number}:E${tr.number}`);
        items.forEach((item) => {
          const r = ws.addRow([`   • ${item}`]);
          r.getCell(1).font = { size: 10 };
        });
        ws.addRow([]);
      };

      addSection('✅ CE QUI EST INCLUS', [
        'Transport selon formule choisie',
        'Hébergement pour la durée indiquée',
        'Guide / accompagnateur (si sélectionné)',
        'Activités listées dans la cotation',
        ...(formuleName.toLowerCase().includes('premium') ? ['Accueil VIP aéroport', 'Service conciergerie 24h'] : []),
      ], C.VERT);

      addSection('⚠️ À LA CHARGE DU CLIENT', [
        'Restauration (sauf petit-déjeuner en hôtel)',
        'Carburant du véhicule',
        'Dépenses personnelles',
      ], 'D97706');

      addSection('📋 CONDITIONS', [
        'Validité de la cotation : 7 jours',
        'Acompte de 50% requis pour confirmer',
        'Annulation jusqu\'à J-14 : remboursement total',
        'Annulation J-7 à J-14 : 50% retenus',
        'Annulation moins de 7 jours : non remboursable',
        `Contact : AfriNomade · contact@dimegroupe.ci · Réf. ${ref}`,
      ], C.VERT);

      // Footer
      ws.mergeCells(`A${ws.lastRow!.number + 1}:E${ws.lastRow!.number + 1}`);
      const footer = ws.addRow(['AfriNomade by DIME GROUPE — contact@dimegroupe.ci']);
      ws.mergeCells(`A${footer.number}:E${footer.number}`);
      footer.getCell(1).font      = { italic: true, color: { argb: C.VERT }, size: 10 };
      footer.getCell(1).alignment = { horizontal: 'center' };

      return ws;
    };

    // ── Feuilles cotation client ───────────────────────────────────────────
    if (hasMulti) {
      buildClientSheet('⭐ Standard Confort', lignesStandard, totalStd, '⭐ Standard Confort', C.STD);
      buildClientSheet('👑 Premium Famille',  lignesPremium,  totalPrm, '👑 Premium Famille',  C.PRE);
    } else {
      buildClientSheet('Cotation Client', lignesStandard, totalStd, 'Cotation', C.VERT);
    }

    // ─────────────────────────────────────────────────────────────────────
    // ONGLET ITINÉRAIRE (si présent)
    // ─────────────────────────────────────────────────────────────────────
    if (itineraire.length > 0) {
      const wsItin = wb.addWorksheet('Itinéraire', { properties: { tabColor: { argb: '3B82F6' } } });
      wsItin.columns = [{ width: 16 }, { width: 18 }, { width: 50 }, { width: 24 }, { width: 14 }];

      wsItin.mergeCells('A1:E1');
      const ih = wsItin.getCell('A1');
      ih.value = `🗺️ Itinéraire jour par jour — ${circuitLabel}`;
      ih.font  = { size: 14, bold: true, color: { argb: C.BLANC } };
      ih.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: '3B82F6' } };
      ih.alignment = { horizontal: 'center', vertical: 'middle' };
      wsItin.getRow(1).height = 30;

      wsItin.mergeCells('A2:E2');
      const ir = wsItin.getCell('A2');
      ir.value = `Réf. ${ref}  ·  ${d.nb_nuits ?? '?'} nuits  ·  ${voyageurs} voyageur(s)`;
      ir.font  = { size: 10, color: { argb: '3B82F6' } };
      ir.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'EBF3FF' } };
      ir.alignment = { horizontal: 'center' };

      wsItin.addRow([]);

      const ithRow = wsItin.addRow(['Jour', 'Ville', 'Programme', 'Hébergement', 'Temps route']);
      headerStyle(wsItin, ithRow, '3B82F6');
      ithRow.height = 22;

      itineraire.forEach((j, idx) => {
        const row = wsItin.addRow([j.jour, j.ville, j.programme, j.hebergement ?? '—', j.temps_route ?? '—']);
        row.eachCell((cell) => {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: idx % 2 === 0 ? 'F0F7FF' : C.BLANC } };
          cell.alignment = { wrapText: true, vertical: 'top' };
          cell.font = { size: 10 };
        });
        row.getCell(1).font = { bold: true, size: 10, color: { argb: '3B82F6' } };
        row.height = 30;
      });
    }

    // ─────────────────────────────────────────────────────────────────────
    // ONGLET COMPARATIF (si multi-formules)
    // ─────────────────────────────────────────────────────────────────────
    if (hasMulti) {
      const wsComp = wb.addWorksheet('Comparatif', { properties: { tabColor: { argb: C.OR } } });
      wsComp.columns = [{ width: 36 }, { width: 22 }, { width: 22 }];

      wsComp.mergeCells('A1:C1');
      const ch = wsComp.getCell('A1');
      ch.value = `📊 Comparatif des formules — ${ref}`;
      ch.font  = { size: 14, bold: true, color: { argb: C.BLANC } };
      ch.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.VERT } };
      ch.alignment = { horizontal: 'center', vertical: 'middle' };
      wsComp.getRow(1).height = 30;

      wsComp.addRow([]);

      const compHeader = wsComp.addRow(['Prestation', '⭐ Standard Confort', '👑 Premium Famille']);
      compHeader.eachCell((cell, colIdx) => {
        cell.font  = { bold: true, color: { argb: C.BLANC }, size: 11 };
        cell.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: colIdx === 2 ? C.STD : colIdx === 3 ? C.PRE : C.VERT } };
        cell.alignment = { horizontal: 'center' };
      });
      compHeader.height = 24;

      // Lignes unifiées
      const allPostes = [...new Set([
        ...lignesStandard.map(l => l.poste),
        ...lignesPremium.map(l => l.poste),
      ])];

      allPostes.forEach((poste, idx) => {
        const std = lignesStandard.find(l => l.poste === poste);
        const prm = lignesPremium.find(l => l.poste === poste);
        const row = wsComp.addRow([
          poste,
          std ? std.total_facture : '—',
          prm ? prm.total_facture : '—',
        ]);
        if (typeof row.getCell(2).value === 'number') row.getCell(2).numFmt = '#,##0';
        if (typeof row.getCell(3).value === 'number') row.getCell(3).numFmt = '#,##0';
        row.eachCell((cell) => {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: idx % 2 === 0 ? C.IVOIRE : C.BLANC } };
          cell.font = { size: 10 };
        });
      });

      wsComp.addRow([]);

      // Ligne totaux
      const totRow = wsComp.addRow(['TOTAL', totalStd, totalPrm]);
      totRow.getCell(1).font = { bold: true, size: 12 };
      totRow.getCell(2).font = { bold: true, size: 12, color: { argb: C.STD } };
      totRow.getCell(3).font = { bold: true, size: 12, color: { argb: C.PRE } };
      totRow.getCell(2).numFmt = '#,##0 "FCFA"';
      totRow.getCell(3).numFmt = '#,##0 "FCFA"';

      const ppRow = wsComp.addRow(['Prix / personne',
        Math.round(totalStd / voyageurs),
        Math.round(totalPrm / voyageurs)]);
      ppRow.getCell(2).numFmt = '#,##0 "FCFA"';
      ppRow.getCell(3).numFmt = '#,##0 "FCFA"';

      const acRow = wsComp.addRow(['Acompte 50%',
        Math.round(totalStd * 0.5),
        Math.round(totalPrm * 0.5)]);
      acRow.getCell(2).numFmt = '#,##0 "FCFA"';
      acRow.getCell(3).numFmt = '#,##0 "FCFA"';

      wsComp.addRow([]);
      const ecartRow = wsComp.addRow([
        'Écart Premium / Standard',
        '',
        `+${fmtFCFA(totalPrm - totalStd)} (+${Math.round(((totalPrm - totalStd) / totalStd) * 100)}%)`,
      ]);
      ecartRow.getCell(3).font = { bold: true, italic: true, color: { argb: C.PRE } };
    }

    // ─────────────────────────────────────────────────────────────────────
    // ONGLET ADMIN — CONFIDENTIEL (veryHidden)
    // ─────────────────────────────────────────────────────────────────────
    const wsAdmin = wb.addWorksheet('Admin (confidentiel)', { properties: { tabColor: { argb: C.ROUGE } } });
    wsAdmin.state = 'veryHidden';
    wsAdmin.columns = [{ width: 30 }, { width: 14 }, { width: 14 }, { width: 8 }, { width: 14 }, { width: 14 }, { width: 10 }];

    wsAdmin.mergeCells('A1:G1');
    const ah = wsAdmin.addRow(['🔒 ADMIN CONFIDENTIEL — AfriNomade']);
    ah.getCell(1).font = { bold: true, color: { argb: C.BLANC }, size: 14 };
    ah.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.ROUGE } };
    ah.getCell(1).alignment = { horizontal: 'center' };
    wsAdmin.getRow(1).height = 30;

    const adminInfos = wsAdmin.addRow([`Client : ${d.prenom} ${d.nom}  ·  ${d.email}  ·  Réf. ${ref}  ·  Budget annoncé : ${d.budget ?? '—'}`]);
    wsAdmin.mergeCells(`A2:G2`);
    adminInfos.getCell(1).font = { size: 10 };

    wsAdmin.addRow([]);

    const buildAdminFormule = (label: string, lignes: LigneCotation[], totalCout: number, total: number) => {
      if (lignes.length === 0) return;

      wsAdmin.addRow([]);
      const formuleHeader = wsAdmin.addRow([`— ${label} —`]);
      wsAdmin.mergeCells(`A${formuleHeader.number}:G${formuleHeader.number}`);
      formuleHeader.getCell(1).font = { bold: true, size: 12 };
      formuleHeader.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: label.includes('Premium') ? C.PRE : C.STD } };
      formuleHeader.getCell(1).alignment = { horizontal: 'center' };

      const ah2 = wsAdmin.addRow(['Poste', 'Coût réel', 'Prix client', 'Qté', 'Total coût', 'Total facturé', 'Marge %']);
      ah2.eachCell((c) => {
        c.font = { bold: true, size: 10 };
        c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3E0' } };
      });

      lignes.forEach((l) => {
        const mpc = l.cout_reel > 0 ? Math.round(((l.prix_client - l.cout_reel) / l.cout_reel) * 100) : 0;
        const row = wsAdmin.addRow([
          l.poste, l.cout_reel, l.prix_client, l.quantite,
          l.total_cout, l.total_facture, mpc / 100,
        ]);
        row.getCell(2).numFmt = '#,##0';
        row.getCell(3).numFmt = '#,##0';
        row.getCell(5).numFmt = '#,##0';
        row.getCell(6).numFmt = '#,##0';
        row.getCell(7).numFmt = '0%';
        if (mpc < 15) row.getCell(7).font = { color: { argb: C.ROUGE }, bold: true };
      });

      const margeGlob = totalCout > 0 ? (total - totalCout) / totalCout : 0;
      const totRow = wsAdmin.addRow(['TOTAUX', totalCout, '', '', totalCout, total, margeGlob]);
      totRow.eachCell((c, n) => {
        c.font = { bold: true };
        if (n === 6) c.font = { bold: true, color: { argb: C.OR } };
        if (n === 7) { c.numFmt = '0%'; c.font = { bold: true, color: { argb: C.VERT } }; }
      });
      totRow.getCell(2).numFmt = '#,##0';
      totRow.getCell(5).numFmt = '#,##0';
      totRow.getCell(6).numFmt = '#,##0';
    };

    buildAdminFormule('⭐ Standard Confort', lignesStandard, totalStdCout, totalStd);
    if (hasMulti) buildAdminFormule('👑 Premium Famille', lignesPremium, totalPrmCout, totalPrm);

    if (hasMulti) {
      wsAdmin.addRow([]);
      wsAdmin.addRow([]);
      wsAdmin.addRow([`SYNTHÈSE`, `Standard`, `Premium`]);
      wsAdmin.addRow([`Total facturé`,  totalStd, totalPrm]).eachCell((c, n) => { if (n > 1) c.numFmt = '#,##0'; });
      wsAdmin.addRow([`Marge brute`,    totalStd - totalStdCout, totalPrm - totalPrmCout]).eachCell((c, n) => { if (n > 1) c.numFmt = '#,##0'; });
      const mgRow = wsAdmin.addRow([`Marge %`,
        totalStdCout > 0 ? (totalStd - totalStdCout) / totalStdCout : 0,
        totalPrmCout > 0 ? (totalPrm - totalPrmCout) / totalPrmCout : 0,
      ]);
      mgRow.getCell(2).numFmt = '0.0%';
      mgRow.getCell(3).numFmt = '0.0%';
    }

    // ── Buffer ────────────────────────────────────────────────────────────
    return await wb.xlsx.writeBuffer();
}

// ── Route GET ─────────────────────────────────────────────────────────────────
export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await checkAdminAuth())) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { id } = await params;

  try {
    const d = await dbSelectOne<AfriNomadeDemande>('afrinomade_demandes', `select=*&id=eq.${id}`);
    if (!d) return NextResponse.json({ error: 'Introuvable' }, { status: 404 });

    const formules       = parseJSON<FormuleCotation[]>(d.formules as unknown as string);
    const legacyCotation = parseJSON<LigneCotation[]>(d.cotation as unknown as string) ?? [];
    let lignesStandard: LigneCotation[];
    let lignesPremium:  LigneCotation[];
    if (formules && formules.length > 0) {
      lignesStandard = formules.find(f => f.id === 'standard')?.lignes ?? legacyCotation;
      lignesPremium  = formules.find(f => f.id === 'premium')?.lignes  ?? [];
    } else {
      lignesStandard = legacyCotation;
      lignesPremium  = [];
    }
    if (lignesStandard.length === 0 && lignesPremium.length === 0) {
      return NextResponse.json({ error: 'Aucune cotation' }, { status: 400 });
    }

    const buffer = await generateExcel(d, id);
    const safePrenom = (d.prenom ?? 'client').toLowerCase().replace(/[^a-z0-9]/g, '-');
    const safeNom    = (d.nom    ?? 'demande').toLowerCase().replace(/[^a-z0-9]/g, '-');
    const ref        = d.reference ?? `AN-${(d.pays_destination ?? 'XX').slice(0, 2).toUpperCase()}-${new Date().getFullYear()}-${id.slice(0, 4).toUpperCase()}`;
    const filename   = `afrinomade-${safePrenom}-${safeNom}-${ref.toLowerCase().replace(/[^a-z0-9]/g, '-')}.xlsx`;

    return new NextResponse(buffer as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    console.error('[Excel GET] Erreur:', err);
    return NextResponse.json({ error: 'Erreur génération Excel' }, { status: 500 });
  }
}

// ── Route POST ────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await checkAdminAuth())) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  const { id } = await params;
  try {
    const d: AfriNomadeDemande = await req.json();
    const buffer = await generateExcel(d, id);
    const filename = `afrinomade-cotation-${id.slice(0, 8)}.xlsx`;
    return new NextResponse(buffer as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    console.error('[Excel POST] Erreur:', err);
    return NextResponse.json({ error: 'Erreur génération Excel' }, { status: 500 });
  }
}

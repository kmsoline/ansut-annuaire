/**
 * Export du catalogue AfriNomade en Excel.
 * GET ?mode=data  → exporte les données existantes
 * GET ?mode=template → exporte un template vierge à remplir
 */
import { NextRequest, NextResponse } from 'next/server';
import { checkAdminAuth } from '@/lib/api-auth';
import { dbSelect } from '@/lib/db';
import type { AfriNomadeCatalogue } from '@/lib/afrinomade-types';

const CATEGORIES = [
  'hebergement', 'transport', 'guide', 'repas', 'equipements', 'activites',
] as const;

const COLS = [
  { header: 'ID',              key: 'id',                width: 12 },
  { header: 'Catégorie*',      key: 'categorie',         width: 16 },
  { header: 'Pays',            key: 'pays',              width: 10 },
  { header: 'Libellé*',        key: 'label',             width: 35 },
  { header: 'Unité',           key: 'unite',             width: 12 },
  { header: 'Prix basse sais.', key: 'prix_basse_saison', width: 18 },
  { header: 'Prix haute sais.', key: 'prix_haute_saison', width: 18 },
  { header: 'Prix transfert',  key: 'prix_transfert',   width: 16 },
  { header: 'Prix ½ journée',  key: 'prix_demi_journee', width: 16 },
  { header: 'Prix journée',    key: 'prix_journee',      width: 14 },
  { header: 'Prix/personne',   key: 'prix_par_personne', width: 14 },
  { header: 'Actif (oui/non)', key: 'actif',             width: 16 },
] as const;

export async function GET(req: NextRequest) {
  if (!(await checkAdminAuth())) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const mode = new URL(req.url).searchParams.get('mode') ?? 'data';
  const ExcelJS = (await import('exceljs')).default;
  const wb = new ExcelJS.Workbook();
  wb.creator = 'AfriNomade Admin';
  wb.created = new Date();

  // ─── Feuille principale ──────────────────────────────────────────────────
  const ws = wb.addWorksheet('Catalogue', { views: [{ state: 'frozen', ySplit: 1 }] });
  ws.columns = COLS.map((c) => ({ header: c.header, key: c.key, width: c.width }));

  // Style en-tête
  const headerRow = ws.getRow(1);
  headerRow.eachCell((cell) => {
    cell.fill   = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0B2F6B' } };
    cell.font   = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
    cell.border = {
      bottom: { style: 'medium', color: { argb: 'FFCFAE63' } },
      right:  { style: 'thin',   color: { argb: 'FF1B3D2F' } },
    };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
  });
  headerRow.height = 32;

  if (mode === 'data') {
    // Exporter les données existantes
    const items = await dbSelect<AfriNomadeCatalogue>(
      'afrinomade_catalogue',
      'select=*&order=categorie.asc,pays.asc,label.asc'
    );

    items.forEach((item, i) => {
      const row = ws.addRow({
        id: item.id ?? '',
        categorie: item.categorie,
        pays: item.pays ?? '',
        label: item.label,
        unite: item.unite ?? '',
        prix_basse_saison: item.prix_basse_saison ?? '',
        prix_haute_saison: item.prix_haute_saison ?? '',
        prix_transfert: item.prix_transfert ?? '',
        prix_demi_journee: item.prix_demi_journee ?? '',
        prix_journee: item.prix_journee ?? '',
        prix_par_personne: item.prix_par_personne ?? '',
        actif: item.actif ? 'oui' : 'non',
      });
      row.eachCell((cell) => {
        cell.fill = {
          type: 'pattern', pattern: 'solid',
          fgColor: { argb: i % 2 === 0 ? 'FFFFFFFF' : 'FFF5F7FF' },
        };
        cell.border = { right: { style: 'thin', color: { argb: 'FFDDDDDD' } } };
        cell.alignment = { vertical: 'middle' };
      });
      // Colonne prix en nombre
      for (const k of ['prix_basse_saison','prix_haute_saison','prix_transfert','prix_demi_journee','prix_journee','prix_par_personne'] as const) {
        const colIdx = COLS.findIndex((c) => c.key === k) + 1;
        const cell = row.getCell(colIdx);
        if (cell.value !== '') cell.numFmt = '#,##0 "FCFA"';
      }
    });
  } else {
    // Mode template : 5 lignes vides avec exemples
    const examples: Partial<AfriNomadeCatalogue>[] = [
      { categorie: 'hebergement', pays: 'CI', label: 'Villa 2 chambres piscine', unite: 'nuit', prix_basse_saison: 150000, prix_haute_saison: 200000, actif: true },
      { categorie: 'transport', pays: 'CI', label: 'Transfert aéroport Abidjan', unite: 'trajet', prix_transfert: 25000, actif: true },
      { categorie: 'guide', pays: 'CI', label: 'Guide français - Abidjan', unite: 'jour', prix_journee: 50000, prix_demi_journee: 30000, actif: true },
      { categorie: 'repas', pays: 'CI', label: 'Déjeuner traditionnel', unite: 'personne', prix_par_personne: 15000, actif: true },
      { categorie: 'activites', pays: 'CI', label: 'Excursion Assinie plage', unite: 'personne', prix_par_personne: 45000, actif: true },
    ];
    examples.forEach((ex, i) => {
      const row = ws.addRow({ ...ex, id: '', actif: ex.actif ? 'oui' : 'non' });
      row.eachCell((cell) => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: i % 2 === 0 ? 'FFFFF8EE' : 'FFFFFFFF' } };
        cell.font = { color: { argb: 'FF555555' }, italic: true };
        cell.alignment = { vertical: 'middle' };
      });
    });
  }

  // ─── Feuille de référence des catégories ─────────────────────────────────
  const wsRef = wb.addWorksheet('Référence');
  wsRef.addRow(['Catégories valides', 'Unités suggérées']);
  wsRef.getRow(1).font = { bold: true };
  const refData = [
    ['hebergement', 'nuit'],
    ['transport', 'trajet / aller-retour'],
    ['guide', 'jour / demi-journée'],
    ['repas', 'personne'],
    ['equipements', 'unité / semaine'],
    ['activites', 'personne'],
  ];
  refData.forEach((r) => wsRef.addRow(r));
  wsRef.columns = [{ width: 20 }, { width: 25 }];

  // Validation catégorie sur col B de la feuille principale
  const catList = CATEGORIES.join(',');
  for (let r = 2; r <= 500; r++) {
    ws.getCell(`B${r}`).dataValidation = {
      type: 'list', allowBlank: true, formulae: [`"${catList}"`],
      showErrorMessage: true, errorTitle: 'Catégorie invalide',
      error: `Valeurs acceptées : ${catList}`,
    };
    ws.getCell(`L${r}`).dataValidation = {
      type: 'list', allowBlank: true, formulae: ['"oui,non"'],
    };
  }

  const filename = mode === 'template'
    ? `template-catalogue-afrinomade.xlsx`
    : `catalogue-afrinomade-${new Date().toISOString().slice(0,10)}.xlsx`;

  const buffer = await wb.xlsx.writeBuffer();
  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}

import { NextRequest, NextResponse } from 'next/server';
import { dbInsert } from '@/lib/db';
import { sendAfriNotifications } from '@/lib/afrinomade-email';
import { sanitizeString, isValidEmail, isValidPhone } from '@/lib/security';
import type { AfriNomadeDemande } from '@/lib/afrinomade-types';

export async function POST(req: NextRequest) {
  try {
    // Vérification taille body
    const raw = await req.text();
    if (Buffer.byteLength(raw, 'utf8') > 20_000) {
      return NextResponse.json({ error: 'Requête trop volumineuse' }, { status: 413 });
    }

    let body: Record<string, unknown>;
    try {
      body = JSON.parse(raw);
    } catch {
      return NextResponse.json({ error: 'JSON invalide' }, { status: 400 });
    }

    // ── Champs obligatoires ─────────────────────────────────────────────────
    const nom      = sanitizeString(body.nom,      100);
    const prenom   = sanitizeString(body.prenom,   100);
    const email    = sanitizeString(body.email,    254);
    const telephone = sanitizeString(body.telephone, 30);

    if (!nom || !prenom || !email || !telephone) {
      return NextResponse.json({ error: 'Champs obligatoires manquants' }, { status: 400 });
    }
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Email invalide' }, { status: 400 });
    }
    if (!isValidPhone(telephone)) {
      return NextResponse.json({ error: 'Numéro de téléphone invalide' }, { status: 400 });
    }

    // ── Calcul nb_nuits ─────────────────────────────────────────────────────
    const date_depart = sanitizeString(body.date_depart as string ?? '', 20) || undefined;
    const date_retour = sanitizeString(body.date_retour as string ?? '', 20) || undefined;
    let nb_nuits: number | undefined;
    if (date_depart && date_retour) {
      const dep = new Date(date_depart);
      const ret = new Date(date_retour);
      if (!isNaN(dep.getTime()) && !isNaN(ret.getTime()) && ret > dep) {
        nb_nuits = Math.max(1, Math.round((ret.getTime() - dep.getTime()) / 86400000));
      }
    } else if (typeof body.nb_nuits === 'number' && isFinite(body.nb_nuits)) {
      nb_nuits = Math.max(0, Math.min(365, Math.floor(body.nb_nuits)));
    }

    // ── Whitelist stricte — jamais de statut/id/montant depuis le front ─────
    const payload: Partial<AfriNomadeDemande> = {
      nom,
      prenom,
      email,
      telephone,
      statut: 'nouveau',
      source: 'site',
      pays_destination:        sanitizeString(body.pays_destination as string ?? '', 100) || undefined,
      pays_residence:          sanitizeString(body.pays_residence   as string ?? '', 100) || undefined,
      villes: Array.isArray(body.villes)
        ? (body.villes as unknown[])
            .filter(v => typeof v === 'string')
            .map(v => sanitizeString(v as string, 100))
            .slice(0, 10)
        : undefined,
      type_service:            sanitizeString(body.type_service     as string ?? '', 50) || undefined,
      date_depart,
      date_retour,
      nb_nuits,
      nb_adultes: typeof body.nb_adultes === 'number'
        ? Math.max(1, Math.min(50, Math.floor(body.nb_adultes))) : 1,
      nb_enfants: typeof body.nb_enfants === 'number'
        ? Math.max(0, Math.min(20, Math.floor(body.nb_enfants))) : 0,
      ages_enfants:            sanitizeString(body.ages_enfants     as string ?? '', 200) || undefined,
      type_hebergement:        sanitizeString(body.type_hebergement as string ?? '', 100) || undefined,
      type_vehicule:           sanitizeString(body.type_vehicule    as string ?? '', 100) || undefined,
      budget:                  sanitizeString(body.budget           as string ?? '', 100) || undefined,
      besoins_particuliers:    sanitizeString(body.besoins_particuliers as string ?? '', 2000) || undefined,
      commentaire:             sanitizeString(body.commentaire      as string ?? '', 2000) || undefined,
    };

    const demande = await dbInsert<AfriNomadeDemande>('afrinomade_demandes', payload);
    const demandeAny = demande as unknown as Record<string, unknown>;

    // Envoi emails en arrière-plan (ne bloque pas la réponse)
    sendAfriNotifications(payload as AfriNomadeDemande, (demandeAny.id as string) ?? '').catch(console.error);

    return NextResponse.json({ success: true, id: demandeAny.id }, { status: 201 });
  } catch (err) {
    console.error('[AfriNomade] Erreur soumission:', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

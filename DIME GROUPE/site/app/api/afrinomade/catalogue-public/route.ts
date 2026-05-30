import { NextRequest, NextResponse } from 'next/server';
import { dbSelect } from '@/lib/db';
import type { AfriNomadeCatalogue } from '@/lib/afrinomade-types';

// Normalisation : nom de pays du formulaire → clé catalogue
export const PAYS_CATALOGUE: Record<string, string> = {
  "Côte d'Ivoire": "CI",
  "Cote d'Ivoire": "CI",
  "Sénégal":        "Sénégal",
  "Senegal":        "Sénégal",
  "Ghana":          "Ghana",
  "Maroc":          "Maroc",
  "Bénin":          "Bénin",
  "Togo":           "Togo",
};

/**
 * Route publique — aucune auth requise.
 * Paramètres query :
 *   categorie = hebergement | transport | guide | repas | activites | equipements
 *   pays      = nom du pays tel qu'envoyé par le formulaire (optionnel)
 *
 * Retourne un tableau de { label, prix_basse_saison?, prix_haute_saison?,
 *   prix_journee?, prix_par_personne?, unite }
 */
export async function GET(req: NextRequest) {
  const categorie = req.nextUrl.searchParams.get('categorie') ?? 'activites';
  const pays      = req.nextUrl.searchParams.get('pays') ?? '';
  const paysCat   = PAYS_CATALOGUE[pays] ?? pays;

  const allowedCategories = ['hebergement','transport','guide','repas','activites','equipements'];
  if (!allowedCategories.includes(categorie)) {
    return NextResponse.json([], { status: 400 });
  }

  try {
    let query = `select=label,prix_basse_saison,prix_haute_saison,prix_journee,prix_par_personne,prix_demi_journee,prix_transfert,unite,pays&categorie=eq.${categorie}&actif=eq.true&order=label.asc`;

    // Toutes les catégories sont filtrées par pays (les prix varient par destination)
    if (paysCat) {
      query += `&pays=eq.${encodeURIComponent(paysCat)}`;
    }

    const items = await dbSelect<AfriNomadeCatalogue>('afrinomade_catalogue', query);
    return NextResponse.json(items);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}

/**
 * Route publique — expose uniquement les informations de contact non-sensibles.
 * Pas d'authentification requise.
 */
import { NextResponse } from "next/server";
import { dbSelect } from "@/lib/db";

const DEFAULTS = {
  contactEmail: "contact@dimegroupe.ci",
  phone: "",
  address: "Abidjan, Côte d'Ivoire",
  siteName: "DIME GROUPE",
  siteDescription: "L'expertise digitale au service de vos projets",
  footer_description: "Technologie, créativité et stratégie au service de vos projets en Côte d'Ivoire.",
  footer_copyright_suffix: "Tous droits réservés.",
  newsletter_title: "Newsletter",
  newsletter_subtitle: "Recevez nos actualités et conseils",
  navbar_cta_label: "Demander un devis",
  social_linkedin: "",
  social_instagram: "",
  social_facebook: "",
  social_twitter: "",
  social_youtube: "",
  social_tiktok: "",
  social_snapchat: "",
  social_pinterest: "",
  social_telegram: "",
};

const ALL_KEYS = Object.keys(DEFAULTS).join(",");

export async function GET() {
  try {
    const rows = await dbSelect<{ key: string; value: string }>(
      "site_settings",
      `select=key,value&key=in.(${ALL_KEYS})`
    );
    const map: Record<string, string> = {};
    for (const r of rows) map[r.key] = r.value;

    const result: Record<string, string> = {};
    for (const [key, def] of Object.entries(DEFAULTS)) {
      result[key] = map[key] || def;
    }
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(DEFAULTS);
  }
}

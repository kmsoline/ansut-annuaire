import { NextRequest, NextResponse } from "next/server";
import { checkAdminRole } from "@/lib/api-auth";
import { dbSelect, dbQuery } from "@/lib/db";

// Clés autorisées et leurs valeurs par défaut
const DEFAULTS: Record<string, string> = {
  siteName: "DIME GROUPE",
  siteDescription: "L'expertise digitale au service de vos projets",
  contactEmail: "contact@dimegroupe.ci",
  phone: "",
  address: "",
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP || "2250747555745",
  afri_whatsapp: process.env.NEXT_PUBLIC_AFRI_WHATSAPP || process.env.NEXT_PUBLIC_WHATSAPP || "2250747555745",
  client_logos_height: "36",
  // Footer
  footer_description: "Technologie, créativité et stratégie au service de vos projets en Côte d'Ivoire.",
  footer_copyright_suffix: "Tous droits réservés.",
  newsletter_title: "Newsletter",
  newsletter_subtitle: "Recevez nos actualités et conseils",
  // Navbar
  navbar_cta_label: "Demander un devis",
  // Réseaux sociaux
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

export async function GET(request: NextRequest) {
  if (!(await checkAdminRole())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  try {
    const rows = await dbSelect<{ key: string; value: string }>(
      "site_settings", "select=key,value"
    );
    // Construire l'objet avec les valeurs DB + combler les clés manquantes
    const settings: Record<string, string> = { ...DEFAULTS };
    for (const row of rows) {
      if (row.key in DEFAULTS) settings[row.key] = row.value;
    }
    return NextResponse.json(settings);
  } catch (error) {
    console.error("[GET /api/admin/settings]", error);
    return NextResponse.json({ error: "Erreur lors du chargement" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  if (!(await checkAdminRole())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  try {
    const data = await request.json();
    // Upsert chaque clé autorisée
    for (const [key, value] of Object.entries(data)) {
      if (!(key in DEFAULTS)) continue; // ignorer les clés inconnues
      await dbQuery(
        `INSERT INTO site_settings (key, value, updated_at)
         VALUES ($1, $2, NOW())
         ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()`,
        [key, String(value ?? "")]
      );
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[PATCH /api/admin/settings]", error);
    return NextResponse.json({ error: "Erreur lors de la mise à jour" }, { status: 500 });
  }
}

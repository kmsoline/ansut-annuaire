/**
 * POST /api/admin/client-logos/seed
 * Peuple la table client_logos avec les logos par défaut de content-data.ts
 * quand elle est vide.
 */
import { NextResponse } from "next/server";
import { checkAdminAuth } from "@/lib/api-auth";
import { dbSelect, dbInsert } from "@/lib/db";
import { getClientLogos } from "@/lib/content-data";

export async function POST() {
  if (!(await checkAdminAuth())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const existing = await dbSelect("client_logos", "select=id");
    if (existing.length > 0) {
      return NextResponse.json({
        message: `${existing.length} logo(s) déjà présent(s) en base — seed ignoré`,
        skipped: true,
      });
    }

    const defaults = getClientLogos();
    const results: { success: number; errors: string[] } = { success: 0, errors: [] };

    for (let i = 0; i < defaults.length; i++) {
      const logo = defaults[i];
      try {
        await dbInsert("client_logos", {
          name:        logo.name,
          logo_url:    logo.logoUrl,
          website_url: logo.website ?? "",
          active:      logo.active,
          sort_order:  i + 1,
        });
        results.success++;
      } catch (err) {
        results.errors.push(`${logo.name}: ${String(err)}`);
      }
    }

    return NextResponse.json({
      message: `${results.success} logo(s) créé(s)${results.errors.length ? `, ${results.errors.length} erreur(s)` : ""}`,
      ...results,
    });
  } catch (err) {
    return NextResponse.json({ error: "Erreur serveur", detail: String(err) }, { status: 500 });
  }
}

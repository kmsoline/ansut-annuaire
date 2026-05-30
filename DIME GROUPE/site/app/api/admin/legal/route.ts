import { NextRequest, NextResponse } from "next/server";
import { checkAdminRole } from "@/lib/api-auth";
import { getContentSetting, setContentSetting } from "@/lib/db";
import { legalPages } from "@/lib/content-data";

export async function GET(request: NextRequest) {
  if (!(await checkAdminRole())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  try {
    const db = await getContentSetting<unknown>("legal_pages");
    const pages = db ?? legalPages;
    return NextResponse.json(pages);
  } catch {
    return NextResponse.json(legalPages);
  }
}

export async function PUT(request: NextRequest) {
  if (!(await checkAdminRole())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  try {
    const page = await request.json();
    // Charger toutes les pages, mettre à jour celle concernée
    const db = await getContentSetting<typeof legalPages>("legal_pages");
    const allPages = db ?? [...legalPages];
    const idx = allPages.findIndex((p) => p.slug === page.slug);
    if (idx >= 0) {
      allPages[idx] = { ...allPages[idx], ...page, updatedAt: new Date().toISOString() };
    } else {
      allPages.push({ ...page, updatedAt: new Date().toISOString() });
    }
    await setContentSetting("legal_pages", allPages);
    return NextResponse.json({ success: true, page });
  } catch {
    return NextResponse.json({ error: "Erreur lors de la mise à jour" }, { status: 500 });
  }
}

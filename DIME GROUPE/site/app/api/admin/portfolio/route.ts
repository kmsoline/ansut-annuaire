import { NextRequest, NextResponse } from "next/server";
import { checkAdminRole } from "@/lib/api-auth";
import { dbSelect, dbInsert } from "@/lib/db";
import { sanitizeString } from "@/lib/security";

export async function GET() {
  if (!(await checkAdminRole())) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  try {
    const items = await dbSelect("portfolio_projects", "select=*&order=created_at.desc&limit=500");
    return NextResponse.json(items);
  } catch { return NextResponse.json({ error: "Erreur chargement" }, { status: 500 }); }
}

export async function POST(request: NextRequest) {
  if (!(await checkAdminRole())) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  try {
    const raw = await request.text();
    if (Buffer.byteLength(raw, "utf8") > 200_000) return NextResponse.json({ error: "Requête trop volumineuse" }, { status: 413 });
    const data = JSON.parse(raw);
    const item = await dbInsert("portfolio_projects", {
      slug: sanitizeString(data.slug || data.title?.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "") || String(Date.now()), 200),
      title: sanitizeString(data.title, 300),
      tag: sanitizeString(data.tag || "Web", 50),
      category: sanitizeString(data.category || "Développement", 100),
      description: sanitizeString(data.description || "", 500),
      long_description: sanitizeString(data.longDescription || data.long_description || "", 5000),
      year: sanitizeString(data.year || String(new Date().getFullYear()), 4),
      img: sanitizeString(data.img || "/images/service-dev.jpg", 500),
      sector: sanitizeString(data.sector || "Services", 100),
      technologies: data.technologies || [],
      deliverables: data.deliverables || [],
      results: data.results || [],
      published: Boolean(data.published ?? true),
    });
    return NextResponse.json(item, { status: 201 });
  } catch (e) {
    console.error("[portfolio POST]", e);
    return NextResponse.json({ error: "Erreur création" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { checkAdminRole } from "@/lib/api-auth";
import { dbSelect, dbInsert } from "@/lib/db";
import { sanitizeString } from "@/lib/security";

export async function GET() {
  if (!(await checkAdminRole())) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  try {
    const items = await dbSelect("services", "select=*&order=created_at.asc&limit=200");
    return NextResponse.json(items);
  } catch { return NextResponse.json({ error: "Erreur chargement" }, { status: 500 }); }
}

export async function POST(request: NextRequest) {
  if (!(await checkAdminRole())) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  try {
    const raw = await request.text();
    if (Buffer.byteLength(raw, "utf8") > 200_000) return NextResponse.json({ error: "Requête trop volumineuse" }, { status: 413 });
    const data = JSON.parse(raw);
    const item = await dbInsert("services", {
      slug: sanitizeString(data.slug || data.title?.toLowerCase().replace(/\s+/g, "-") || String(Date.now()), 200),
      title: sanitizeString(data.title, 200),
      icon: sanitizeString(data.icon || "✅", 10),
      description: sanitizeString(data.description || "", 500),
      long_description: sanitizeString(data.longDescription || data.long_description || "", 5000),
      img: sanitizeString(data.img || "/images/service-it.jpg", 500),
      category: sanitizeString(data.category || "", 100),
      items: data.items || [],
      benefits: data.benefits || [],
      process: data.process || [],
      pricing: sanitizeString(data.pricing || "Sur devis", 100),
      active: Boolean(data.active ?? true),
    });
    return NextResponse.json(item, { status: 201 });
  } catch { return NextResponse.json({ error: "Erreur création" }, { status: 500 }); }
}

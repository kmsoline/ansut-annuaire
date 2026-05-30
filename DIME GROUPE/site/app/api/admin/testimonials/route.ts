import { NextRequest, NextResponse } from "next/server";
import { checkAdminRole } from "@/lib/api-auth";
import { dbSelect, dbInsert } from "@/lib/db";
import { sanitizeString } from "@/lib/security";

export async function GET() {
  if (!(await checkAdminRole())) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const items = await dbSelect("testimonials", "select=*&order=sort_order.asc,created_at.desc&limit=200");
  return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
  if (!(await checkAdminRole())) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  try {
    const raw = await request.text();
    if (Buffer.byteLength(raw, "utf8") > 50_000) return NextResponse.json({ error: "Requête trop volumineuse" }, { status: 413 });
    const data = JSON.parse(raw);
    const item = await dbInsert("testimonials", {
      name: sanitizeString(data.name, 100),
      role: sanitizeString(data.role || "", 100),
      company: sanitizeString(data.company || "", 100),
      text: sanitizeString(data.text, 2000),
      rating: Math.min(5, Math.max(1, Number(data.rating ?? 5))),
      active: Boolean(data.active ?? true),
      sort_order: Number(data.sort_order ?? 0),
    });
    return NextResponse.json(item, { status: 201 });
  } catch { return NextResponse.json({ error: "Erreur création" }, { status: 500 }); }
}

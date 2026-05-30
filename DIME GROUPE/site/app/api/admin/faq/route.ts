import { NextRequest, NextResponse } from "next/server";
import { checkAdminRole } from "@/lib/api-auth";
import { dbSelect, dbInsert } from "@/lib/db";
import { sanitizeString } from "@/lib/security";

export async function GET() {
  if (!(await checkAdminRole())) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const items = await dbSelect("faq_items", "select=*&order=sort_order.asc,created_at.asc&limit=500");
  return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
  if (!(await checkAdminRole())) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  try {
    const raw = await request.text();
    if (Buffer.byteLength(raw, "utf8") > 50_000) return NextResponse.json({ error: "Requête trop volumineuse" }, { status: 413 });
    const data = JSON.parse(raw);
    const item = await dbInsert("faq_items", {
      question: sanitizeString(data.question, 500),
      answer: sanitizeString(data.answer, 5000),
      category: sanitizeString(data.category || "Général", 100),
      active: Boolean(data.active ?? true),
      sort_order: Number(data.sort_order ?? data.order ?? 0),
    });
    return NextResponse.json(item, { status: 201 });
  } catch { return NextResponse.json({ error: "Erreur création" }, { status: 500 }); }
}

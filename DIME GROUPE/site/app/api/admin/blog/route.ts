import { NextRequest, NextResponse } from "next/server";
import { checkAdminRole } from "@/lib/api-auth";
import { dbSelect, dbInsert } from "@/lib/db";
import { sanitizeString } from "@/lib/security";

export async function GET() {
  if (!(await checkAdminRole())) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  try {
    const posts = await dbSelect("blog_articles", "select=*&order=created_at.desc&limit=500");
    return NextResponse.json(posts);
  } catch { return NextResponse.json({ error: "Erreur chargement" }, { status: 500 }); }
}

export async function POST(request: NextRequest) {
  if (!(await checkAdminRole())) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  try {
    const raw = await request.text();
    if (Buffer.byteLength(raw, "utf8") > 500_000) return NextResponse.json({ error: "Requête trop volumineuse" }, { status: 413 });
    const data = JSON.parse(raw);
    const post = await dbInsert("blog_articles", {
      slug: sanitizeString(data.slug || data.title?.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "") || String(Date.now()), 200),
      title: sanitizeString(data.title, 300),
      excerpt: sanitizeString(data.excerpt || "", 500),
      category: sanitizeString(data.category || "Général", 100),
      date: data.date || new Date().toISOString().split("T")[0],
      read_time: sanitizeString(data.readTime || data.read_time || "5 min", 20),
      img: sanitizeString(data.img || "/images/service-consulting.jpg", 500),
      author: sanitizeString(data.author || "DIME GROUPE", 100),
      content: data.content || [],
      published: Boolean(data.published ?? false),
    });
    return NextResponse.json(post, { status: 201 });
  } catch (e) {
    console.error("[blog POST]", e);
    return NextResponse.json({ error: "Erreur création" }, { status: 500 });
  }
}

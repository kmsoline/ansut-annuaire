import { NextRequest, NextResponse } from "next/server";
import { checkAdminRole } from "@/lib/api-auth";
import { dbSelectOne, dbUpdate, dbDelete } from "@/lib/db";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await checkAdminRole())) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const { id } = await params;
  try {
    const post = await dbSelectOne("blog_articles", `select=*&id=eq.${id}`);
    if (!post) return NextResponse.json({ error: "Non trouvé" }, { status: 404 });
    return NextResponse.json(post);
  } catch { return NextResponse.json({ error: "Erreur" }, { status: 500 }); }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await checkAdminRole())) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const { id } = await params;
  try {
    const data = await request.json();
    const updated = await dbUpdate("blog_articles", `id=eq.${id}`, {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.slug !== undefined && { slug: data.slug }),
      ...(data.excerpt !== undefined && { excerpt: data.excerpt }),
      ...(data.category !== undefined && { category: data.category }),
      ...(data.date !== undefined && { date: data.date }),
      ...(data.readTime !== undefined && { read_time: data.readTime }),
      ...(data.read_time !== undefined && { read_time: data.read_time }),
      ...(data.img !== undefined && { img: data.img }),
      ...(data.author !== undefined && { author: data.author }),
      ...(data.content !== undefined && { content: data.content }),
      ...(data.published !== undefined && { published: data.published }),
    });
    return NextResponse.json(updated);
  } catch { return NextResponse.json({ error: "Erreur mise à jour" }, { status: 500 }); }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await checkAdminRole())) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const { id } = await params;
  try {
    await dbDelete("blog_articles", `id=eq.${id}`);
    return NextResponse.json({ success: true });
  } catch { return NextResponse.json({ error: "Erreur suppression" }, { status: 500 }); }
}

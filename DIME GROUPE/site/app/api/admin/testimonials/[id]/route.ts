import { NextRequest, NextResponse } from "next/server";
import { checkAdminRole } from "@/lib/api-auth";
import { dbUpdate, dbDelete } from "@/lib/db";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await checkAdminRole())) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const { id } = await params;
  const data = await request.json();
  const payload: Record<string, unknown> = {};
  for (const f of ["name","role","company","text","rating","active","sort_order"]) if (data[f] !== undefined) payload[f] = data[f];
  const updated = await dbUpdate("testimonials", `id=eq.${id}`, payload);
  return NextResponse.json(updated);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await checkAdminRole())) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const { id } = await params;
  await dbDelete("testimonials", `id=eq.${id}`);
  return NextResponse.json({ success: true });
}

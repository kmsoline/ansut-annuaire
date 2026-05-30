import { NextRequest, NextResponse } from "next/server";
import { checkAdminRole } from "@/lib/api-auth";
import { dbUpdate, dbDelete } from "@/lib/db";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await checkAdminRole())) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const { id } = await params;
  const data = await request.json();
  const payload: Record<string, unknown> = {};
  const fields = ["question","answer","category","active","sort_order"];
  for (const f of fields) if (data[f] !== undefined) payload[f] = data[f];
  if (data.order !== undefined) payload.sort_order = data.order;
  const updated = await dbUpdate("faq_items", `id=eq.${id}`, payload);
  return NextResponse.json(updated);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await checkAdminRole())) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const { id } = await params;
  await dbDelete("faq_items", `id=eq.${id}`);
  return NextResponse.json({ success: true });
}

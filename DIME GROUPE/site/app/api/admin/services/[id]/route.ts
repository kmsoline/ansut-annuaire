import { NextRequest, NextResponse } from "next/server";
import { checkAdminRole } from "@/lib/api-auth";
import { dbSelectOne, dbUpdate, dbDelete } from "@/lib/db";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await checkAdminRole())) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const { id } = await params;
  const item = await dbSelectOne("services", `select=*&id=eq.${id}`);
  if (!item) return NextResponse.json({ error: "Non trouvé" }, { status: 404 });
  return NextResponse.json(item);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await checkAdminRole())) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const { id } = await params;
  const data = await request.json();
  const payload: Record<string, unknown> = {};
  const fields = ["slug","title","icon","description","img","category","items","benefits","process","pricing","active"];
  for (const f of fields) if (data[f] !== undefined) payload[f] = data[f];
  if (data.longDescription !== undefined) payload.long_description = data.longDescription;
  const updated = await dbUpdate("services", `id=eq.${id}`, payload);
  return NextResponse.json(updated);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await checkAdminRole())) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const { id } = await params;
  await dbDelete("services", `id=eq.${id}`);
  return NextResponse.json({ success: true });
}

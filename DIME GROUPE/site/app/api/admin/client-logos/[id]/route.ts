import { NextRequest, NextResponse } from "next/server";
import { checkAdminRole } from "@/lib/api-auth";
import { dbUpdate, dbDelete } from "@/lib/db";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await checkAdminRole())) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const { id } = await params;
  const data = await request.json();
  const payload: Record<string, unknown> = {};
  for (const f of ["name","active","sort_order","logo_height","bg_white"]) if (data[f] !== undefined) payload[f] = data[f];
  if (data.logoUrl !== undefined) payload.logo_url = data.logoUrl;
  if (data.logo_url !== undefined) payload.logo_url = data.logo_url;
  if (data.websiteUrl !== undefined) payload.website_url = data.websiteUrl;
  if (data.website_url !== undefined) payload.website_url = data.website_url;
  const updated = await dbUpdate("client_logos", `id=eq.${id}`, payload);
  return NextResponse.json(updated);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await checkAdminRole())) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const { id } = await params;
  await dbDelete("client_logos", `id=eq.${id}`);
  return NextResponse.json({ success: true });
}

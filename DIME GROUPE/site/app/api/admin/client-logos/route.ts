import { NextRequest, NextResponse } from "next/server";
import { checkAdminRole } from "@/lib/api-auth";
import { dbSelect, dbInsert } from "@/lib/db";
import { getClientLogos } from "@/lib/content-data";

export async function GET(request: NextRequest) {
  if (!(await checkAdminRole())) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  try {
    const items = await dbSelect("client_logos", "select=*&order=sort_order.asc");
    // Fallback identique à l'API publique quand la table est vide
    if (items.length === 0) {
      return NextResponse.json(getClientLogos().map((l, i) => ({
        id: l.id,
        name: l.name,
        logo_url: l.logoUrl,
        website_url: l.website ?? "",
        active: l.active,
        sort_order: i + 1,
        _fallback: true,
      })));
    }
    return NextResponse.json(items);
  } catch {
    return NextResponse.json(getClientLogos().map((l, i) => ({
      id: l.id,
      name: l.name,
      logo_url: l.logoUrl,
      website_url: l.website ?? "",
      active: l.active,
      sort_order: i + 1,
      _fallback: true,
    })));
  }
}

export async function POST(request: NextRequest) {
  if (!(await checkAdminRole())) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const data = await request.json();
  const item = await dbInsert("client_logos", {
    name: data.name,
    logo_url: data.logoUrl || data.logo_url,
    website_url: data.websiteUrl || data.website_url || "",
    active: data.active ?? true,
    sort_order: data.sort_order ?? 0,
    logo_height: data.logo_height ?? 32,
    bg_white: data.bg_white ?? false,
  });
  return NextResponse.json(item, { status: 201 });
}

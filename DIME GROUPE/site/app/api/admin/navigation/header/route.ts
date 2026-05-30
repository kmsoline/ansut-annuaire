import { NextRequest, NextResponse } from "next/server";
import { checkAdminRole } from "@/lib/api-auth";
import { getContentSetting, setContentSetting } from "@/lib/db";
import { getHeaderLinks } from "@/lib/navigation-data";
import { sanitizeUrl } from "@/lib/security";

interface NavLink { id: string; href: string; label: string; order: number; active: boolean; }

// C6 — Valider et assainir toutes les URLs de navigation
function sanitizeLinks(links: unknown): NavLink[] {
  if (!Array.isArray(links)) return [];
  return links.map((l: unknown) => {
    const link = l as Record<string, unknown>;
    const href = sanitizeUrl(link.href) ?? "/";
    return {
      id:     String(link.id     ?? Date.now()),
      href,
      label:  String(link.label  ?? "").slice(0, 100),
      order:  Number(link.order  ?? 0),
      active: Boolean(link.active ?? true),
    };
  });
}

export async function GET() {
  if (!(await checkAdminRole())) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  try {
    const db = await getContentSetting<unknown>("nav_header");
    return NextResponse.json(db ?? getHeaderLinks());
  } catch { return NextResponse.json(getHeaderLinks()); }
}

export async function PUT(request: NextRequest) {
  if (!(await checkAdminRole())) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  try {
    const raw = await request.json();
    const links = sanitizeLinks(raw);
    await setContentSetting("nav_header", links);
    return NextResponse.json({ success: true, links });
  } catch { return NextResponse.json({ error: "Erreur lors de la mise à jour" }, { status: 500 }); }
}

import { NextRequest, NextResponse } from "next/server";
import { checkAdminRole } from "@/lib/api-auth";
import { getContentSetting, setContentSetting } from "@/lib/db";
import { getFooterSections } from "@/lib/navigation-data";
import { sanitizeUrl } from "@/lib/security";

interface NavLink { id: string; href: string; label: string; order: number; active: boolean; }
interface FooterSection { id: string; title: string; links: NavLink[]; order: number; active: boolean; }

// C6 — Valider et assainir toutes les URLs dans le footer
function sanitizeSections(sections: unknown): FooterSection[] {
  if (!Array.isArray(sections)) return [];
  return sections.map((s: unknown) => {
    const sec = s as Record<string, unknown>;
    const links = Array.isArray(sec.links) ? sec.links.map((l: unknown) => {
      const link = l as Record<string, unknown>;
      return {
        id:     String(link.id     ?? Date.now()),
        href:   sanitizeUrl(link.href) ?? "/",
        label:  String(link.label  ?? "").slice(0, 100),
        order:  Number(link.order  ?? 0),
        active: Boolean(link.active ?? true),
      } as NavLink;
    }) : [];
    return {
      id:     String(sec.id    ?? Date.now()),
      title:  String(sec.title ?? "").slice(0, 100),
      links,
      order:  Number(sec.order  ?? 0),
      active: Boolean(sec.active ?? true),
    } as FooterSection;
  });
}

export async function GET() {
  if (!(await checkAdminRole())) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  try {
    const db = await getContentSetting<unknown>("nav_footer");
    return NextResponse.json(db ?? getFooterSections());
  } catch { return NextResponse.json(getFooterSections()); }
}

export async function PUT(request: NextRequest) {
  if (!(await checkAdminRole())) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  try {
    const raw = await request.json();
    const sections = sanitizeSections(raw);
    await setContentSetting("nav_footer", sections);
    return NextResponse.json({ success: true, sections });
  } catch { return NextResponse.json({ error: "Erreur lors de la mise à jour" }, { status: 500 }); }
}

import { NextResponse } from "next/server";
import { getContentSetting } from "@/lib/db";
import { legalPages, getLegalPage } from "@/lib/content-data";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    // Chercher dans Neon d'abord
    const db = await getContentSetting<typeof legalPages>("legal_pages");
    const allPages = db ?? legalPages;
    const page = allPages.find((p) => p.slug === slug);
    if (!page) {
      // Fallback vers content-data statique
      const staticPage = getLegalPage(slug);
      if (!staticPage) {
        return NextResponse.json({ error: "Page non trouvée" }, { status: 404 });
      }
      return NextResponse.json(staticPage);
    }
    return NextResponse.json(page);
  } catch {
    const { slug } = await params;
    const page = getLegalPage(slug);
    if (!page) return NextResponse.json({ error: "Page non trouvée" }, { status: 404 });
    return NextResponse.json(page);
  }
}

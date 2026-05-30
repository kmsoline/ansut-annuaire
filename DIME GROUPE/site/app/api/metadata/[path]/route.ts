import { NextResponse } from "next/server";
import { getContentSetting } from "@/lib/db";
import { pageMetadata, getPageMetadata } from "@/lib/content-data";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string }> }
) {
  try {
    const { path } = await params;
    const decodedPath = decodeURIComponent(path);
    // Chercher dans Neon d'abord
    const db = await getContentSetting<typeof pageMetadata>("page_metadata");
    const allMeta = db ?? pageMetadata;
    const meta = allMeta.find((m) => m.path === decodedPath);
    if (!meta) {
      const staticMeta = getPageMetadata(decodedPath);
      if (!staticMeta) {
        return NextResponse.json({ error: "Métadonnées non trouvées" }, { status: 404 });
      }
      return NextResponse.json(staticMeta);
    }
    return NextResponse.json(meta);
  } catch {
    const { path } = await params;
    const meta = getPageMetadata(decodeURIComponent(path));
    if (!meta) return NextResponse.json({ error: "Métadonnées non trouvées" }, { status: 404 });
    return NextResponse.json(meta);
  }
}

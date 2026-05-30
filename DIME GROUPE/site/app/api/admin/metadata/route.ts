import { NextRequest, NextResponse } from "next/server";
import { checkAdminRole } from "@/lib/api-auth";
import { getContentSetting, setContentSetting } from "@/lib/db";
import { pageMetadata } from "@/lib/content-data";

export async function GET(request: NextRequest) {
  if (!(await checkAdminRole())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  try {
    const db = await getContentSetting<unknown>("page_metadata");
    const meta = db ?? pageMetadata;
    return NextResponse.json(meta);
  } catch {
    return NextResponse.json(pageMetadata);
  }
}

export async function PUT(request: NextRequest) {
  if (!(await checkAdminRole())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  try {
    const metadata = await request.json();
    // Si on reçoit un tableau → on remplace tout
    if (Array.isArray(metadata)) {
      await setContentSetting("page_metadata", metadata);
      return NextResponse.json({ success: true, metadata });
    }
    // Si on reçoit un objet unique → mettre à jour l'entrée correspondante
    const db = await getContentSetting<typeof pageMetadata>("page_metadata");
    const allMeta = db ?? [...pageMetadata];
    const idx = allMeta.findIndex((m) => m.path === metadata.path);
    if (idx >= 0) {
      allMeta[idx] = { ...allMeta[idx], ...metadata, updatedAt: new Date().toISOString() };
    } else {
      allMeta.push({ ...metadata, updatedAt: new Date().toISOString() });
    }
    await setContentSetting("page_metadata", allMeta);
    return NextResponse.json({ success: true, metadata });
  } catch {
    return NextResponse.json({ error: "Erreur lors de la mise à jour" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { checkAdminRole } from "@/lib/api-auth";
import { getContentSetting, setContentSetting } from "@/lib/db";
import { getAboutPageContent } from "@/lib/content-data";

export async function GET(request: NextRequest) {
  if (!(await checkAdminRole())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  try {
    const db = await getContentSetting<unknown>("about_content");
    const content = db ?? getAboutPageContent();
    return NextResponse.json(content);
  } catch {
    return NextResponse.json(getAboutPageContent());
  }
}

export async function PUT(request: NextRequest) {
  if (!(await checkAdminRole())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  try {
    const content = await request.json();
    await setContentSetting("about_content", content);
    return NextResponse.json({ success: true, content });
  } catch {
    return NextResponse.json({ error: "Erreur lors de la mise à jour" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { checkAdminRole } from "@/lib/api-auth";
import { getContentSetting, setContentSetting } from "@/lib/db";
import { getSiteLogo } from "@/lib/navigation-data";

export async function GET(request: NextRequest) {
  if (!(await checkAdminRole())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  try {
    const db = await getContentSetting<unknown>("nav_logo");
    const logo = db ?? getSiteLogo();
    return NextResponse.json(logo);
  } catch {
    return NextResponse.json(getSiteLogo());
  }
}

export async function PUT(request: NextRequest) {
  if (!(await checkAdminRole())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  try {
    const logo = await request.json();
    await setContentSetting("nav_logo", logo);
    return NextResponse.json({ success: true, logo });
  } catch {
    return NextResponse.json({ error: "Erreur lors de la mise à jour" }, { status: 500 });
  }
}

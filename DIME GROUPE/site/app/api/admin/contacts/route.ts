import { NextRequest, NextResponse } from "next/server";
import { checkAdminRole } from "@/lib/api-auth";
import { dbSelect } from "@/lib/db";

export async function GET(request: NextRequest) {
  if (!(await checkAdminRole())) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  try {
    const items = await dbSelect("contacts", "select=*&order=created_at.desc&limit=500");
    return NextResponse.json(items);
  } catch { return NextResponse.json({ error: "Erreur chargement" }, { status: 500 }); }
}

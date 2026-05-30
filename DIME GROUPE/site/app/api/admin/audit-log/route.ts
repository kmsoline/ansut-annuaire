import { NextRequest, NextResponse } from "next/server";
import { checkAdminRole } from "@/lib/api-auth";
import { dbSelect } from "@/lib/db";

export async function GET(request: NextRequest) {
  if (!(await checkAdminRole())) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const logs = await dbSelect("audit_logs", "select=*&order=created_at.desc&limit=200");
  return NextResponse.json(logs);
}

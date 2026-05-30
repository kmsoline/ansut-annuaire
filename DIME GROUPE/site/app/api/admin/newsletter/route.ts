import { NextRequest, NextResponse } from "next/server";
import { checkAdminRole } from "@/lib/api-auth";
import { dbSelect, dbDelete, dbQuery } from "@/lib/db";

function isUUID(s: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
}

export async function GET(request: NextRequest) {
  if (!(await checkAdminRole())) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const stats = searchParams.get("stats");

  if (stats === "1") {
    // Retourner uniquement les stats
    try {
      const rows = await dbQuery<{ total: string; this_month: string; last_month: string }>(
        `SELECT
           COUNT(*) FILTER (WHERE active = true)                                          AS total,
           COUNT(*) FILTER (WHERE active = true AND created_at >= date_trunc('month', NOW())) AS this_month,
           COUNT(*) FILTER (WHERE active = true AND created_at >= date_trunc('month', NOW() - INTERVAL '1 month')
                                               AND created_at <  date_trunc('month', NOW()))  AS last_month
         FROM newsletter_subscribers`
      );
      const r = rows[0] ?? { total: "0", this_month: "0", last_month: "0" };
      const total      = parseInt(r.total, 10);
      const thisMonth  = parseInt(r.this_month, 10);
      const lastMonth  = parseInt(r.last_month, 10);
      const growth     = lastMonth > 0 ? Math.round(((thisMonth - lastMonth) / lastMonth) * 100) : null;
      return NextResponse.json({ total, thisMonth, lastMonth, growth });
    } catch (e) {
      console.error("[newsletter stats]", e);
      return NextResponse.json({ error: "Erreur stats" }, { status: 500 });
    }
  }

  try {
    const items = await dbSelect(
      "newsletter_subscribers",
      "select=id,email,name,source,active,created_at&order=created_at.desc"
    );
    return NextResponse.json(items);
  } catch (e) {
    console.error("[newsletter GET]", e);
    return NextResponse.json({ error: "Erreur chargement" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!(await checkAdminRole())) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id") ?? "";

  if (!isUUID(id)) return NextResponse.json({ error: "ID invalide" }, { status: 400 });

  try {
    await dbDelete("newsletter_subscribers", `id=eq.${id}`);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[newsletter DELETE]", e);
    return NextResponse.json({ error: "Erreur suppression" }, { status: 500 });
  }
}

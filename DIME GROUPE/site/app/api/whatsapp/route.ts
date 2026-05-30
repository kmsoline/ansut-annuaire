import { NextRequest, NextResponse } from "next/server";
import { dbSelect } from "@/lib/db";

const FALLBACK_WA   = process.env.NEXT_PUBLIC_WHATSAPP      || "2250747555745";
const FALLBACK_AFRI = process.env.NEXT_PUBLIC_AFRI_WHATSAPP || FALLBACK_WA;

export async function GET(request: NextRequest) {
  try {
    const rows = await dbSelect<{ key: string; value: string }>(
      "site_settings",
      "select=key,value&key=in.(whatsapp,afri_whatsapp)"
    );
    const map: Record<string, string> = {};
    for (const r of rows) map[r.key] = r.value;

    return NextResponse.json({
      whatsapp:      map["whatsapp"]      || FALLBACK_WA,
      afri_whatsapp: map["afri_whatsapp"] || map["whatsapp"] || FALLBACK_AFRI,
    });
  } catch {
    return NextResponse.json({ whatsapp: FALLBACK_WA, afri_whatsapp: FALLBACK_AFRI });
  }
}

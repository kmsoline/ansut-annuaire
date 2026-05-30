import { NextRequest, NextResponse } from "next/server";
import { dbQuery } from "@/lib/db";
import { isValidEmail, sanitizeString, getClientIP } from "@/lib/security";

// Rate limiting (best-effort en mémoire — pour une vraie protection, utiliser Upstash/Vercel Firewall)
interface RLEntry { count: number; windowStart: number }
const newsletterStore = new Map<string, RLEntry>();

function checkNewsletterRL(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const windowMs = 60 * 60 * 1000; // 1 heure
  const entry = newsletterStore.get(ip);
  if (!entry || now - entry.windowStart >= windowMs) {
    newsletterStore.set(ip, { count: 1, windowStart: now });
    return { allowed: true };
  }
  entry.count += 1;
  if (entry.count > 3) {
    const retryAfter = Math.ceil((entry.windowStart + windowMs - now) / 1000);
    return { allowed: false, retryAfter };
  }
  return { allowed: true };
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIP(request);
    const rl = checkNewsletterRL(ip);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Trop de tentatives — réessayez plus tard" },
        { status: 429, headers: { "Retry-After": String(rl.retryAfter ?? 3600) } }
      );
    }

    const rawText = await request.text();
    if (Buffer.byteLength(rawText, "utf8") > 10_000) {
      return NextResponse.json({ error: "Requête trop volumineuse" }, { status: 413 });
    }

    let data: Record<string, unknown>;
    try { data = JSON.parse(rawText); }
    catch { return NextResponse.json({ error: "JSON invalide" }, { status: 400 }); }

    const email = sanitizeString(data.email, 254);
    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: "Email invalide" }, { status: 400 });
    }

    const name = typeof data.name === "string" ? sanitizeString(data.name, 100) : "";

    // H7 — ON CONFLICT DO NOTHING + détection via code d'erreur Postgres 23505
    try {
      await dbQuery(
        `INSERT INTO newsletter_subscribers (email, name, active, source, created_at)
         VALUES ($1, $2, true, 'site', NOW())
         ON CONFLICT (email) DO NOTHING`,
        [email, name]
      );
    } catch (dbErr: unknown) {
      // Erreur inattendue (pas de contrainte UNIQUE ou autre problème)
      const code = (dbErr as { code?: string }).code;
      if (code === "23505") {
        // Doublon explicite (si ON CONFLICT n'est pas déclenché pour une raison quelconque)
        return NextResponse.json({ success: true, message: "Deja inscrit" });
      }
      throw dbErr;
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("[Newsletter API]", error);
    return NextResponse.json({ error: "Erreur inscription" }, { status: 500 });
  }
}

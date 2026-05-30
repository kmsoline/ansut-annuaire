import { NextRequest, NextResponse } from "next/server";
import { dbInsert } from "@/lib/db";
import { sendEmail, buildContactNotificationEmail, buildContactConfirmationEmail } from "@/lib/email";
import { sanitizeString, isValidEmail, isValidPhone, getClientIP } from "@/lib/security";

// ===== RATE LIMITING (redondance côté route, le middleware est la première ligne) =====
interface RLEntry { count: number; windowStart: number }
const contactStore = new Map<string, RLEntry>();

function checkContactRL(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;
  const entry = contactStore.get(ip);
  if (!entry || now - entry.windowStart >= windowMs) {
    contactStore.set(ip, { count: 1, windowStart: now });
    return { allowed: true };
  }
  entry.count += 1;
  if (entry.count > 5) {
    const retryAfter = Math.ceil((entry.windowStart + windowMs - now) / 1000);
    return { allowed: false, retryAfter };
  }
  return { allowed: true };
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = getClientIP(request);
    const rl = checkContactRL(ip);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Trop de tentatives — réessayez plus tard" },
        { status: 429, headers: { "Retry-After": String(rl.retryAfter ?? 900) } }
      );
    }

    // Lecture sécurisée du body (limite 50 KB)
    const rawText = await request.text();
    if (Buffer.byteLength(rawText, "utf8") > 50_000) {
      return NextResponse.json({ error: "Requête trop volumineuse" }, { status: 413 });
    }

    let data: Record<string, unknown>;
    try {
      data = JSON.parse(rawText);
    } catch {
      return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
    }

    // Honeypot : champ caché rempli par les bots (doit rester vide)
    if (data.website || data.hp || data.honeypot) {
      // Silencieux : retourner 200 pour tromper le bot
      return NextResponse.json({ success: true, id: null }, { status: 200 });
    }

    // Validation des champs obligatoires
    const name = sanitizeString(data.name, 200);
    const email = sanitizeString(data.email, 200);
    const message = sanitizeString(data.message, 5000);

    if (!name) {
      return NextResponse.json({ error: "Le nom est requis" }, { status: 400 });
    }
    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: "Email invalide" }, { status: 400 });
    }
    if (!message || message.length < 5) {
      return NextResponse.json({ error: "Le message est requis" }, { status: 400 });
    }

    // Validation optionnelle du téléphone
    const rawPhone = sanitizeString(data.phone, 50);
    const phone = rawPhone && !isValidPhone(rawPhone) ? "" : rawPhone;

    const subject = sanitizeString(data.subject, 200) || "Contact";

    // 1. Sauvegarder dans Supabase
    const contact = await dbInsert("contacts", {
      name,
      email,
      phone,
      subject,
      message,
      read: false,
    });

    // 2. Envoyer les emails en parallèle (non bloquant sur erreur)
    const emailData = { name, email, phone, subject, message };

    await Promise.allSettled([
      sendEmail(buildContactNotificationEmail(emailData)),
      sendEmail(buildContactConfirmationEmail(emailData)),
    ]);

    const c = contact as { id?: string };
    return NextResponse.json({ success: true, id: c.id }, { status: 201 });
  } catch (error) {
    console.error("[Contact API]", error);
    return NextResponse.json({ error: "Erreur lors de l'envoi" }, { status: 500 });
  }
}

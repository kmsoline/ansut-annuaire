/**
 * Envoi d'emails via l'API Resend (HTTP natif, sans SDK).
 * Documentation : https://resend.com/docs/api-reference/emails/send-email
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || "DIME GROUPE <noreply@dimegroupe.ci>";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "contact@dimegroupe.ci";

export interface EmailPayload {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}

/**
 * Envoie un email via Resend.
 * Retourne true si succès, false sinon.
 */
export async function sendEmail(payload: EmailPayload): Promise<boolean> {
  if (!RESEND_API_KEY) {
    console.warn("[Email] RESEND_API_KEY non défini — email non envoyé");
    return false;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: Array.isArray(payload.to) ? payload.to : [payload.to],
        subject: payload.subject,
        html: payload.html,
        reply_to: payload.replyTo,
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      console.error("[Email] Erreur Resend:", err);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[Email] Exception:", err);
    return false;
  }
}

// ===== TEMPLATES =====

/**
 * Email de notification admin lors d'un nouveau contact.
 */
export function buildContactNotificationEmail(data: {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}): EmailPayload {
  return {
    to: ADMIN_EMAIL,
    replyTo: data.email,
    subject: `[DIME GROUPE] Nouveau contact : ${data.subject}`,
    html: `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a1a;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:600px;margin:40px auto;background:#13132a;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.08);">
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#1a237e,#283593);padding:32px 40px;">
      <div style="font-size:24px;font-weight:700;color:#fff;letter-spacing:-0.5px;">DIME GROUPE</div>
      <div style="color:rgba(255,255,255,0.7);font-size:13px;margin-top:4px;">Administration · Nouveau message reçu</div>
    </div>
    <!-- Body -->
    <div style="padding:32px 40px;">
      <h2 style="color:#e0e0e0;font-size:18px;margin:0 0 24px 0;">📬 Nouveau contact</h2>
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="padding:10px 0;color:rgba(255,255,255,0.5);font-size:13px;width:100px;">Nom</td>
          <td style="padding:10px 0;color:#e0e0e0;font-weight:500;">${escapeHtml(data.name)}</td>
        </tr>
        <tr style="border-top:1px solid rgba(255,255,255,0.06);">
          <td style="padding:10px 0;color:rgba(255,255,255,0.5);font-size:13px;">Email</td>
          <td style="padding:10px 0;"><a href="mailto:${escapeHtml(data.email)}" style="color:#7986cb;text-decoration:none;">${escapeHtml(data.email)}</a></td>
        </tr>
        ${data.phone ? `
        <tr style="border-top:1px solid rgba(255,255,255,0.06);">
          <td style="padding:10px 0;color:rgba(255,255,255,0.5);font-size:13px;">Téléphone</td>
          <td style="padding:10px 0;color:#e0e0e0;">${escapeHtml(data.phone)}</td>
        </tr>` : ""}
        <tr style="border-top:1px solid rgba(255,255,255,0.06);">
          <td style="padding:10px 0;color:rgba(255,255,255,0.5);font-size:13px;">Sujet</td>
          <td style="padding:10px 0;color:#e0e0e0;">${escapeHtml(data.subject)}</td>
        </tr>
      </table>
      <div style="margin-top:24px;padding:20px;background:rgba(255,255,255,0.04);border-radius:10px;border-left:3px solid #3f51b5;">
        <div style="color:rgba(255,255,255,0.5);font-size:12px;margin-bottom:10px;text-transform:uppercase;letter-spacing:0.5px;">Message</div>
        <div style="color:#e0e0e0;line-height:1.7;white-space:pre-wrap;">${escapeHtml(data.message)}</div>
      </div>
      <div style="margin-top:28px;text-align:center;">
        <a href="mailto:${escapeHtml(data.email)}?subject=Re: ${encodeURIComponent(data.subject)}"
           style="display:inline-block;padding:12px 28px;background:linear-gradient(135deg,#1a237e,#283593);color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px;">
          Répondre à ${escapeHtml(data.name)}
        </a>
      </div>
    </div>
    <!-- Footer -->
    <div style="padding:20px 40px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;color:rgba(255,255,255,0.3);font-size:12px;">
      DIME GROUPE · www.dimegroupe.ci
    </div>
  </div>
</body>
</html>`,
  };
}

/**
 * Email de confirmation envoyé au client après soumission.
 */
export function buildContactConfirmationEmail(data: {
  name: string;
  email: string;
  subject: string;
}): EmailPayload {
  return {
    to: data.email,
    subject: `Votre message a bien été reçu — DIME GROUPE`,
    html: `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a1a;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:600px;margin:40px auto;background:#13132a;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.08);">
    <div style="background:linear-gradient(135deg,#1a237e,#283593);padding:32px 40px;">
      <div style="font-size:24px;font-weight:700;color:#fff;">DIME GROUPE</div>
      <div style="color:rgba(255,255,255,0.7);font-size:13px;margin-top:4px;">L'expertise digitale au service de vos projets</div>
    </div>
    <div style="padding:40px;">
      <h2 style="color:#e0e0e0;font-size:20px;margin:0 0 16px 0;">Bonjour ${escapeHtml(data.name)}, ✅</h2>
      <p style="color:rgba(255,255,255,0.75);line-height:1.7;margin:0 0 20px 0;">
        Nous avons bien reçu votre message concernant <strong style="color:#e0e0e0;">"${escapeHtml(data.subject)}"</strong>.
        Notre équipe vous répondra dans les plus brefs délais, généralement sous 24 heures ouvrées.
      </p>
      <p style="color:rgba(255,255,255,0.75);line-height:1.7;margin:0 0 32px 0;">
        En attendant, n'hésitez pas à nous contacter via WhatsApp pour une réponse immédiate.
      </p>
      <div style="text-align:center;">
        <a href="https://wa.me/2250747555745"
           style="display:inline-block;padding:12px 28px;background:linear-gradient(135deg,#1a237e,#283593);color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px;">
          💬 Contacter via WhatsApp
        </a>
      </div>
    </div>
    <div style="padding:20px 40px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;color:rgba(255,255,255,0.3);font-size:12px;">
      DIME GROUPE · contact@dimegroupe.ci · www.dimegroupe.ci
    </div>
  </div>
</body>
</html>`,
  };
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

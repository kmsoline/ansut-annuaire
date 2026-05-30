import { sendEmail, type EmailPayload } from './email';
import type { AfriNomadeDemande } from './afrinomade-types';

const AFRI_ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'contact@dimegroupe.ci';
const AFRI_WHATSAPP = process.env.NEXT_PUBLIC_AFRI_WHATSAPP || process.env.NEXT_PUBLIC_WHATSAPP || '2250747555745';

function esc(s: string | undefined | null): string {
  if (!s) return '';
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ── Email de confirmation envoyé au client ──────────────────────────────────
export function buildAfriConfirmationEmail(d: AfriNomadeDemande): EmailPayload {
  return {
    to: d.email,
    subject: `Votre demande AfriNomade a bien été reçue — Réf. voyage`,
    html: `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0d1f1f;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:600px;margin:40px auto;background:#112222;border-radius:16px;overflow:hidden;border:1px solid rgba(11,165,164,0.2);">
    <div style="background:linear-gradient(135deg,#0a2a2a,#0BA5A4);padding:32px 40px;">
      <div style="font-size:22px;font-weight:700;color:#fff;">🌍 AfriNomade</div>
      <div style="color:rgba(255,255,255,0.7);font-size:13px;margin-top:4px;">by DIME GROUPE · Tourisme & Loisirs Premium</div>
    </div>
    <div style="padding:36px 40px;">
      <h2 style="color:#e0e0e0;font-size:18px;margin:0 0 16px;">Bonjour ${esc(d.prenom)} ${esc(d.nom)} ✅</h2>
      <p style="color:rgba(255,255,255,0.75);line-height:1.7;margin:0 0 24px;">
        Votre demande de voyage a bien été reçue. Notre équipe AfriNomade va l'étudier avec soin et vous recontacte sous <strong style="color:#0BA5A4;">24 heures</strong>.
      </p>
      <div style="background:rgba(11,165,164,0.08);border:1px solid rgba(11,165,164,0.2);border-radius:12px;padding:20px;margin-bottom:24px;">
        <div style="color:rgba(255,255,255,0.5);font-size:11px;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;">Récapitulatif de votre demande</div>
        <table style="width:100%;border-collapse:collapse;font-size:13px;">
          ${d.pays_destination ? `<tr><td style="color:rgba(255,255,255,0.5);padding:6px 0;width:140px;">Destination</td><td style="color:#e0e0e0;">${esc(d.pays_destination)}${d.villes?.length ? ` — ${d.villes.join(', ')}` : ''}</td></tr>` : ''}
          ${d.type_service ? `<tr><td style="color:rgba(255,255,255,0.5);padding:6px 0;">Type de séjour</td><td style="color:#e0e0e0;">${esc(d.type_service)}</td></tr>` : ''}
          ${d.date_depart ? `<tr><td style="color:rgba(255,255,255,0.5);padding:6px 0;">Dates</td><td style="color:#e0e0e0;">${esc(d.date_depart)}${d.date_retour ? ` → ${esc(d.date_retour)}` : ''}${d.nb_nuits ? ` (${d.nb_nuits} nuits)` : ''}</td></tr>` : ''}
          <tr><td style="color:rgba(255,255,255,0.5);padding:6px 0;">Voyageurs</td><td style="color:#e0e0e0;">${d.nb_adultes ?? 1} adulte(s)${d.nb_enfants ? `, ${d.nb_enfants} enfant(s)` : ''}</td></tr>
          ${d.budget ? `<tr><td style="color:rgba(255,255,255,0.5);padding:6px 0;">Budget</td><td style="color:#CFAE63;font-weight:600;">${esc(d.budget)}</td></tr>` : ''}
        </table>
      </div>
      <div style="text-align:center;margin-bottom:16px;">
        <a href="https://wa.me/${AFRI_WHATSAPP}" style="display:inline-block;padding:13px 32px;background:linear-gradient(135deg,#0BA5A4,#CFAE63);color:#fff;text-decoration:none;border-radius:50px;font-weight:700;font-size:14px;">
          💬 Discuter sur WhatsApp
        </a>
      </div>
      <p style="color:rgba(255,255,255,0.45);font-size:12px;text-align:center;margin:0;">
        "Explore. Ressens. Reviens changé." — AfriNomade by DIME GROUPE
      </p>
    </div>
    <div style="padding:16px 40px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;color:rgba(255,255,255,0.3);font-size:11px;">
      AfriNomade · contact@dimegroupe.ci · www.dimegroupe.ci
    </div>
  </div>
</body>
</html>`,
  };
}

// ── Email de notification admin ─────────────────────────────────────────────
export function buildAfriAdminNotificationEmail(d: AfriNomadeDemande, id: string): EmailPayload {
  const isResidence = d.type_service === 'residence';
  const subjectPrefix = isResidence ? '[AfriNomade 🏠 RÉSIDENCE]' : '[AfriNomade]';
  return {
    to: AFRI_ADMIN_EMAIL,
    subject: `${subjectPrefix} Nouvelle demande — ${d.prenom} ${d.nom} · ${d.pays_destination ?? 'Non précisé'}`,
    html: `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#0d1f1f;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:600px;margin:40px auto;background:#112222;border-radius:16px;overflow:hidden;border:1px solid rgba(11,165,164,0.2);">
    <div style="background:linear-gradient(135deg,#0a2a2a,#0BA5A4);padding:28px 36px;">
      <div style="font-size:20px;font-weight:700;color:#fff;">🌍 AfriNomade · Admin</div>
      <div style="color:rgba(255,255,255,0.7);font-size:12px;margin-top:4px;">Nouvelle demande reçue</div>
    </div>
    <div style="padding:32px 36px;">
      <table style="width:100%;border-collapse:collapse;font-size:13px;">
        <tr><td style="color:rgba(255,255,255,0.5);padding:8px 0;width:160px;">ID demande</td><td style="color:#0BA5A4;font-family:monospace;">${esc(id)}</td></tr>
        <tr style="border-top:1px solid rgba(255,255,255,0.05);"><td style="color:rgba(255,255,255,0.5);padding:8px 0;">Client</td><td style="color:#e0e0e0;font-weight:600;">${esc(d.prenom)} ${esc(d.nom)}</td></tr>
        <tr style="border-top:1px solid rgba(255,255,255,0.05);"><td style="color:rgba(255,255,255,0.5);padding:8px 0;">Email</td><td><a href="mailto:${esc(d.email)}" style="color:#0BA5A4;">${esc(d.email)}</a></td></tr>
        <tr style="border-top:1px solid rgba(255,255,255,0.05);"><td style="color:rgba(255,255,255,0.5);padding:8px 0;">WhatsApp</td><td><a href="https://wa.me/${esc(d.telephone?.replace(/\s+/g,''))}" style="color:#25D366;">${esc(d.telephone)}</a></td></tr>
        <tr style="border-top:1px solid rgba(255,255,255,0.05);"><td style="color:rgba(255,255,255,0.5);padding:8px 0;">Destination</td><td style="color:#e0e0e0;">${esc(d.pays_destination ?? '—')}${d.villes?.length ? ` / ${d.villes.join(', ')}` : ''}</td></tr>
        <tr style="border-top:1px solid rgba(255,255,255,0.05);"><td style="color:rgba(255,255,255,0.5);padding:8px 0;">Type séjour</td><td style="color:#e0e0e0;">${esc(d.type_service ?? '—')}</td></tr>
        <tr style="border-top:1px solid rgba(255,255,255,0.05);"><td style="color:rgba(255,255,255,0.5);padding:8px 0;">Dates</td><td style="color:#e0e0e0;">${d.date_depart ?? '—'} → ${d.date_retour ?? '—'}${d.nb_nuits ? ` (${d.nb_nuits}n)` : ''}</td></tr>
        <tr style="border-top:1px solid rgba(255,255,255,0.05);"><td style="color:rgba(255,255,255,0.5);padding:8px 0;">Voyageurs</td><td style="color:#e0e0e0;">${d.nb_adultes ?? 1}A + ${d.nb_enfants ?? 0}E</td></tr>
        <tr style="border-top:1px solid rgba(255,255,255,0.05);"><td style="color:rgba(255,255,255,0.5);padding:8px 0;">Budget</td><td style="color:#CFAE63;font-weight:600;">${esc(d.budget ?? '—')}</td></tr>
        ${d.besoins_particuliers ? `<tr style="border-top:1px solid rgba(255,255,255,0.05);"><td style="color:rgba(255,255,255,0.5);padding:8px 0;vertical-align:top;">Besoins</td><td style="color:#e0e0e0;">${esc(d.besoins_particuliers)}</td></tr>` : ''}
      </table>
      ${isResidence && (d.type_hebergement || d.nb_chambres || d.equipements?.length || d.budget) ? `
      <div style="margin-top:20px;background:rgba(207,174,99,0.07);border:1px solid rgba(207,174,99,0.2);border-radius:12px;padding:16px;">
        <div style="color:rgba(255,255,255,0.45);font-size:11px;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px;">🏠 Logement souhaité</div>
        <table style="width:100%;border-collapse:collapse;font-size:13px;">
          ${d.type_hebergement ? `<tr><td style="color:rgba(255,255,255,0.5);padding:5px 0;width:160px;">Type</td><td style="color:#e0e0e0;">${esc(d.type_hebergement)}</td></tr>` : ''}
          ${d.nb_chambres ? `<tr><td style="color:rgba(255,255,255,0.5);padding:5px 0;">Chambres min.</td><td style="color:#e0e0e0;">${d.nb_chambres}</td></tr>` : ''}
          ${d.budget ? `<tr><td style="color:rgba(255,255,255,0.5);padding:5px 0;">Budget / nuit</td><td style="color:#CFAE63;font-weight:600;">${esc(d.budget)}</td></tr>` : ''}
          ${d.preference_localisation?.length ? `<tr><td style="color:rgba(255,255,255,0.5);padding:5px 0;">Localisation</td><td style="color:#e0e0e0;">${esc(d.preference_localisation.join(', '))}</td></tr>` : ''}
          ${d.equipements?.length ? `<tr><td style="color:rgba(255,255,255,0.5);padding:5px 0;vertical-align:top;">Équipements</td><td style="color:#e0e0e0;">${d.equipements.map(esc).join(', ')}</td></tr>` : ''}
        </table>
      </div>` : ''}
      <div style="margin-top:24px;display:flex;gap:12px;flex-wrap:wrap;justify-content:center;">
        <a href="https://dimegroupe.ci/admin/afrinomade/demandes/${esc(id)}" style="display:inline-block;padding:12px 28px;background:linear-gradient(135deg,#0BA5A4,#CFAE63);color:#fff;text-decoration:none;border-radius:50px;font-weight:700;font-size:13px;">
          Voir la demande →
        </a>
        <a href="https://wa.me/${esc(d.telephone?.replace(/\s+/g,''))}" style="display:inline-block;padding:12px 28px;background:#25D366;color:#fff;text-decoration:none;border-radius:50px;font-weight:700;font-size:13px;">
          💬 WhatsApp client
        </a>
      </div>
    </div>
  </div>
</body>
</html>`,
  };
}

// ── Notification WhatsApp admin (CallMeBot) ─────────────────────────────────
// Nécessite CALLMEBOT_APIKEY dans .env.local (inscription gratuite sur callmebot.com)
// Si non configuré, skip silencieux.
export async function sendWhatsAppAdminNotif(d: AfriNomadeDemande, id: string): Promise<void> {
  const apiKey = process.env.CALLMEBOT_APIKEY;
  if (!apiKey) return;

  const phone = (AFRI_WHATSAPP).replace(/\D/g, '');
  const isResidence = d.type_service === 'residence';

  const lines: string[] = [
    isResidence ? '🏠 *NOUVELLE DEMANDE RÉSIDENCE — AfriNomade*' : '🌍 *NOUVELLE DEMANDE VOYAGE — AfriNomade*',
    '',
    `👤 ${d.prenom} ${d.nom}`,
    `📞 ${d.telephone}`,
    `✉️ ${d.email}`,
    '',
    `📍 ${d.pays_destination ?? '—'}`,
  ];

  if (d.date_depart) {
    lines.push(`📅 ${d.date_depart} → ${d.date_retour ?? '?'}${d.nb_nuits ? ` (${d.nb_nuits}n)` : ''}`);
  }
  lines.push(`👥 ${d.nb_adultes ?? 1} adulte(s)${d.nb_enfants ? ` + ${d.nb_enfants} enfant(s)` : ''}`);

  if (isResidence) {
    if (d.type_hebergement) lines.push(`🏡 ${d.type_hebergement} · ${d.nb_chambres ?? 1} ch.`);
    if (d.budget)           lines.push(`💰 ${d.budget}`);
    if (d.equipements?.length) {
      lines.push(`✓ ${d.equipements.slice(0, 4).join(', ')}${d.equipements.length > 4 ? ` +${d.equipements.length - 4}` : ''}`);
    }
    if (d.preference_localisation?.length) {
      lines.push(`📌 ${d.preference_localisation.join(', ')}`);
    }
  } else {
    if (d.type_hebergement) lines.push(`🛏️ ${d.type_hebergement}`);
    if (d.type_vehicule)    lines.push(`🚗 ${d.type_vehicule}`);
    if (d.budget)           lines.push(`💰 ${d.budget}`);
  }

  if (d.besoins_particuliers) lines.push(``, `📝 "${d.besoins_particuliers}"`);
  lines.push(``, `🔗 admin/demandes/${id.slice(0, 8)}`);

  const text = lines.join('\n');
  const url  = `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${encodeURIComponent(text)}&apikey=${apiKey}`;

  const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
  if (!res.ok) throw new Error(`CallMeBot HTTP ${res.status}`);
}

// ── Envoi groupé confirmation + notification ────────────────────────────────
export async function sendAfriNotifications(d: AfriNomadeDemande, id: string) {
  await Promise.allSettled([
    sendEmail(buildAfriConfirmationEmail(d)),
    sendEmail(buildAfriAdminNotificationEmail(d, id)),
    sendWhatsAppAdminNotif(d, id),  // skip silencieux si CALLMEBOT_APIKEY absent
  ]);
}

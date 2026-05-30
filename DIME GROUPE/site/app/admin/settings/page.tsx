"use client";

import { useState, useEffect } from "react";
import { MessageCircle, Mail, Phone, MapPin, Globe, Check, AlertCircle, Type, Layout, Share2 } from "lucide-react";

interface Settings {
  siteName: string; siteDescription: string;
  contactEmail: string; phone: string; address: string;
  whatsapp: string; afri_whatsapp: string;
  footer_description: string; footer_copyright_suffix: string;
  newsletter_title: string; newsletter_subtitle: string;
  navbar_cta_label: string;
  social_linkedin: string; social_instagram: string;
  social_facebook: string; social_twitter: string;
  social_youtube: string; social_tiktok: string;
  social_snapchat: string; social_pinterest: string;
  social_telegram: string;
}

const DEFAULTS: Settings = {
  siteName: "DIME GROUPE", siteDescription: "L'expertise digitale au service de vos projets",
  contactEmail: "contact@dimegroupe.ci", phone: "", address: "",
  whatsapp: "2250747555745", afri_whatsapp: "2250747555745",
  footer_description: "Technologie, créativité et stratégie au service de vos projets en Côte d'Ivoire.",
  footer_copyright_suffix: "Tous droits réservés.",
  newsletter_title: "Newsletter", newsletter_subtitle: "Recevez nos actualités et conseils",
  navbar_cta_label: "Demander un devis",
  social_linkedin: "", social_instagram: "", social_facebook: "",
  social_twitter: "", social_youtube: "", social_tiktok: "",
  social_snapchat: "", social_pinterest: "", social_telegram: "",
};

function Toast({ ok, msg, onDone }: { ok: boolean; msg: string; onDone: () => void }) {
  useEffect(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t); }, [onDone]);
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-3 rounded-full text-sm font-semibold text-white shadow-xl"
      style={{ background: ok ? "var(--royal-blue)" : "rgb(239,68,68)" }}>
      {ok ? <Check size={16} /> : <AlertCircle size={16} />}
      {msg}
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-semibold mb-1">{label}</label>
      {hint && <p className="text-xs mb-2" style={{ color: "color-mix(in oklch, var(--foreground) 50%, transparent)" }}>{hint}</p>}
      {children}
    </div>
  );
}

const IC = "w-full px-4 py-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--royal-blue)] transition-all";
const IS = { background: "color-mix(in oklch, var(--foreground) 5%, transparent)", border: "1px solid color-mix(in oklch, var(--foreground) 12%, transparent)" };

const SEC = "rounded-2xl p-6 space-y-5";
const SECST = { background: "color-mix(in oklch, var(--foreground) 3%, transparent)", border: "1px solid color-mix(in oklch, var(--foreground) 8%, transparent)" };

export default function AdminSettings() {
  const [s, setS] = useState<Settings>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ ok: boolean; msg: string } | null>(null);

  useEffect(() => {
    fetch("/api/admin/settings").then(r => r.json()).then(d => setS({ ...DEFAULTS, ...d })).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const set = (f: keyof Settings) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setS(prev => ({ ...prev, [f]: e.target.value }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(s) });
      setToast(res.ok ? { ok: true, msg: "Paramètres enregistrés" } : { ok: false, msg: "Erreur lors de l'enregistrement" });
    } catch { setToast({ ok: false, msg: "Erreur de connexion" }); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[var(--royal-blue)]" /></div>;

  return (
    <form onSubmit={save} className="space-y-8 max-w-2xl">
      {toast && <Toast ok={toast.ok} msg={toast.msg} onDone={() => setToast(null)} />}
      <div>
        <h1 className="text-3xl font-bold mb-1">Paramètres</h1>
        <p className="text-sm" style={{ color: "color-mix(in oklch, var(--foreground) 55%, transparent)" }}>Informations globales du site</p>
      </div>

      {/* Site */}
      <section className={SEC} style={SECST}>
        <div className="flex items-center gap-2 mb-2"><Globe size={18} style={{ color: "var(--royal-blue)" }} /><h2 className="font-bold text-base">Site</h2></div>
        <Field label="Nom du site"><input value={s.siteName} onChange={set("siteName")} required className={IC} style={IS} /></Field>
        <Field label="Description courte"><textarea value={s.siteDescription} onChange={set("siteDescription")} rows={2} className={IC + " resize-none"} style={IS} /></Field>
      </section>

      {/* Contacts DIME GROUPE */}
      <section className={SEC} style={SECST}>
        <div className="flex items-center gap-2 mb-2"><Mail size={18} style={{ color: "var(--royal-blue)" }} /><h2 className="font-bold text-base">Contacts — DIME GROUPE</h2></div>
        <Field label="Email de contact" hint="Affiché sur la page Contact, utilisé pour les formulaires">
          <input type="email" value={s.contactEmail} onChange={set("contactEmail")} required placeholder="contact@dimegroupe.ci" className={IC} style={IS} />
        </Field>
        <Field label="Numéro WhatsApp" hint="Format international sans + — ex : 2250747555745">
          <div className="relative">
            <MessageCircle size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "color-mix(in oklch, var(--foreground) 40%, transparent)" }} />
            <input value={s.whatsapp} onChange={set("whatsapp")} required placeholder="2250747555745" className={IC + " pl-9"} style={IS} />
          </div>
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Téléphone">
            <div className="relative"><Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "color-mix(in oklch, var(--foreground) 40%, transparent)" }} />
              <input value={s.phone} onChange={set("phone")} placeholder="+225 07 00 00 00 00" className={IC + " pl-9"} style={IS} /></div>
          </Field>
          <Field label="Adresse">
            <div className="relative"><MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "color-mix(in oklch, var(--foreground) 40%, transparent)" }} />
              <input value={s.address} onChange={set("address")} placeholder="Abidjan, Côte d'Ivoire" className={IC + " pl-9"} style={IS} /></div>
          </Field>
        </div>
      </section>

      {/* Contacts AfriNomade */}
      <section className={SEC} style={{ background: "color-mix(in oklch, var(--turquoise) 4%, transparent)", border: "1px solid color-mix(in oklch, var(--turquoise) 18%, transparent)" }}>
        <div className="flex items-center gap-2 mb-2"><MessageCircle size={18} style={{ color: "var(--turquoise)" }} /><h2 className="font-bold text-base">Contacts — AfriNomade</h2></div>
        <Field label="Numéro WhatsApp AfriNomade" hint="Format international sans + — utilisé sur toutes les pages AfriNomade">
          <div className="relative"><MessageCircle size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "color-mix(in oklch, var(--turquoise) 70%, transparent)" }} />
            <input value={s.afri_whatsapp} onChange={set("afri_whatsapp")} required placeholder="2250747555745" className={IC + " pl-9"} style={{ ...IS, borderColor: "color-mix(in oklch, var(--turquoise) 25%, transparent)" }} /></div>
        </Field>
      </section>

      {/* Navigation & Footer */}
      <section className={SEC} style={SECST}>
        <div className="flex items-center gap-2 mb-2"><Layout size={18} style={{ color: "var(--royal-blue)" }} /><h2 className="font-bold text-base">Navigation & Footer</h2></div>
        <Field label="Label du bouton CTA (navbar)" hint="Bouton en haut à droite de la navigation">
          <input value={s.navbar_cta_label} onChange={set("navbar_cta_label")} placeholder="Demander un devis" className={IC} style={IS} />
        </Field>
        <Field label="Description footer" hint="Texte affiché sous le logo dans le pied de page">
          <textarea value={s.footer_description} onChange={set("footer_description")} rows={2} className={IC + " resize-none"} style={IS} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Titre newsletter" hint="Ex : Newsletter">
            <input value={s.newsletter_title} onChange={set("newsletter_title")} className={IC} style={IS} />
          </Field>
          <Field label="Sous-titre newsletter">
            <input value={s.newsletter_subtitle} onChange={set("newsletter_subtitle")} className={IC} style={IS} />
          </Field>
        </div>
        <Field label="Suffixe copyright" hint="Affiché après le nom et l'année — ex : Tous droits réservés.">
          <input value={s.footer_copyright_suffix} onChange={set("footer_copyright_suffix")} className={IC} style={IS} />
        </Field>
      </section>

      {/* Réseaux sociaux */}
      <section className={SEC} style={SECST}>
        <div className="flex items-center gap-2 mb-2"><Share2 size={18} style={{ color: "var(--royal-blue)" }} /><h2 className="font-bold text-base">Réseaux sociaux</h2></div>
        <p className="text-xs" style={{ color: "color-mix(in oklch, var(--foreground) 50%, transparent)" }}>
          Affichés sur la page Contact avec icônes colorées. <strong>Laisser vide pour masquer</strong> un réseau.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {([
            ["LinkedIn",   "social_linkedin",  "#0a66c2", "https://linkedin.com/company/dime-groupe"],
            ["Instagram",  "social_instagram", "#e1306c", "https://instagram.com/dimegroupe"],
            ["Facebook",   "social_facebook",  "#1877f2", "https://facebook.com/dimegroupe"],
            ["Twitter / X","social_twitter",   "#000",    "https://x.com/dimegroupe"],
            ["YouTube",    "social_youtube",   "#ff0000", "https://youtube.com/@dimegroupe"],
            ["TikTok",     "social_tiktok",    "#010101", "https://tiktok.com/@dimegroupe"],
            ["Snapchat",   "social_snapchat",  "#ffbe00", "https://snapchat.com/add/dimegroupe"],
            ["Pinterest",  "social_pinterest", "#e60023", "https://pinterest.com/dimegroupe"],
            ["Telegram",   "social_telegram",  "#2AABEE", "https://t.me/dimegroupe"],
          ] as const).map(([label, key, color, placeholder]) => (
            <div key={key}>
              <label className="block text-sm font-semibold mb-1 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full inline-block shrink-0" style={{ background: color }} />
                {label}
              </label>
              <input
                value={(s as unknown as Record<string, string>)[key] ?? ""}
                onChange={e => setS(prev => ({ ...prev, [key]: e.target.value }))}
                placeholder={placeholder}
                className={IC} style={IS}
              />
            </div>
          ))}
        </div>

        {/* Aperçu */}
        {Object.entries({
          social_linkedin: s.social_linkedin, social_instagram: s.social_instagram,
          social_facebook: s.social_facebook, social_twitter: s.social_twitter,
          social_youtube: s.social_youtube, social_tiktok: s.social_tiktok,
          social_snapchat: s.social_snapchat, social_pinterest: s.social_pinterest,
          social_telegram: s.social_telegram,
        }).some(([, v]) => v) && (
          <div>
            <p className="text-xs font-semibold mb-2" style={{ color: "color-mix(in oklch, var(--foreground) 45%, transparent)" }}>
              Aperçu (réseaux configurés) :
            </p>
            <div className="flex flex-wrap gap-2">
              {([
                ["LinkedIn",    "social_linkedin",  "#0a66c2"],
                ["Instagram",   "social_instagram", "#e1306c"],
                ["Facebook",    "social_facebook",  "#1877f2"],
                ["Twitter / X", "social_twitter",   "#000"],
                ["YouTube",     "social_youtube",   "#ff0000"],
                ["TikTok",      "social_tiktok",    "#010101"],
                ["Snapchat",    "social_snapchat",  "#ffbe00"],
                ["Pinterest",   "social_pinterest", "#e60023"],
                ["Telegram",    "social_telegram",  "#2AABEE"],
              ] as const).filter(([, key]) => !!(s as unknown as Record<string, string>)[key]).map(([label, , color]) => (
                <span key={label} className="px-3 py-1.5 rounded-full text-xs font-semibold text-white"
                  style={{ background: color }}>
                  {label}
                </span>
              ))}
            </div>
          </div>
        )}
      </section>

      <div className="flex items-center gap-4">
        <button type="submit" disabled={saving}
          className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white transition-all hover:scale-105 disabled:opacity-50"
          style={{ background: "linear-gradient(135deg, var(--royal-blue), color-mix(in oklch, var(--royal-blue) 70%, var(--gold-premium)))" }}>
          {saving ? "Enregistrement…" : "Enregistrer les paramètres"}
        </button>
      </div>
    </form>
  );
}

"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useMemo, useState, useEffect } from "react";
import { Check, AlertCircle, Mail, MapPin, Phone, Send, MessageSquare } from "lucide-react";
import ScrollAnimation from "../components/ScrollAnimation";
import { useWhatsApp } from "../components/WhatsAppNumber";

interface SiteSettings {
  contactEmail: string; phone: string; address: string;
  social_linkedin: string; social_instagram: string;
  social_facebook: string; social_twitter: string;
  social_youtube: string; social_tiktok: string;
  social_snapchat: string; social_pinterest: string;
  social_telegram: string;
}

function Toast({ ok, msg, onDone }: { ok: boolean; msg: string; onDone: () => void }) {
  useEffect(() => { const t = setTimeout(onDone, 4000); return () => clearTimeout(t); }, [onDone]);
  return (
    <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white shadow-xl"
      style={{ background: ok ? "var(--royal-blue)" : "rgb(239,68,68)" }}>
      {ok ? <Check size={16} /> : <AlertCircle size={16} />}
      {msg}
    </div>
  );
}

// ── Icônes SVG des réseaux ──────────────────────────────────────────────────

function IconLinkedIn() {
  return <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>;
}
function IconInstagram() {
  return <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>;
}
function IconFacebook() {
  return <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>;
}
function IconTwitter() {
  return <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>;
}
function IconYoutube() {
  return <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>;
}
function IconTiktok() {
  return <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V9.01a8.16 8.16 0 0 0 4.77 1.52V7.08a4.85 4.85 0 0 1-1-.39z"/></svg>;
}
function IconSnapchat() {
  return <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.028.37-.04.545.136.07.542.22 1.177.22.605 0 1.248-.173 1.8-.649.194-.163.432-.225.674-.225.856 0 1.679.528 1.679 1.434 0 .906-.752 1.627-1.84 2.228-.098.054-.208.104-.322.154-.73.33-1.513.686-1.73 1.383-.097.32-.049.661.119 1.038.184.399.427 1.046.427 1.788 0 1.684-1.306 2.58-2.521 2.58-.464 0-.888-.13-1.203-.27-.448-.193-.979-.3-1.497-.3-.505 0-.987.13-1.437.302-.34.135-.788.268-1.262.268-.949 0-2.022-.488-2.405-2.065-.26-1.051-.487-2.176-.487-2.176s-.1-.415-.1-.613c0-.374.173-.7.44-.852.73-.404 2.073-1.217 2.073-3.156 0-1.81-1.46-3.256-3.257-3.256-1.799 0-3.257 1.446-3.257 3.256 0 1.94 1.344 2.753 2.073 3.156.267.152.44.478.44.852 0 .198-.1.613-.1.613s-.227 1.125-.487 2.176c-.383 1.577-1.456 2.065-2.405 2.065-.474 0-.922-.133-1.262-.268a4.195 4.195 0 0 0-1.437-.302c-.518 0-1.049.107-1.497.3-.315.14-.739.27-1.203.27-1.215 0-2.521-.896-2.521-2.58 0-.742.243-1.389.427-1.788.168-.377.216-.718.119-1.038-.217-.697-1-.953-1.73-1.383-.114-.05-.224-.1-.322-.154C1.752 9.815 1 9.094 1 8.188c0-.906.823-1.434 1.679-1.434.242 0 .48.062.674.225.552.476 1.195.649 1.8.649.634 0 1.04-.15 1.177-.22l-.04-.545-.003-.06C6.183 5.14 6.057 3.114 6.586 1.921 8.17 1.069 11.216.793 12.206.793z"/></svg>;
}
function IconPinterest() {
  return <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/></svg>;
}
function IconTelegram() {
  return <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>;
}

// ── Réseaux sociaux configurés ─────────────────────────────────────────────

const SOCIALS: { key: keyof SiteSettings; label: string; Icon: () => React.ReactElement; bg: string; dark?: boolean }[] = [
  { key: "social_linkedin",  label: "LinkedIn",    Icon: IconLinkedIn,  bg: "#0a66c2" },
  { key: "social_instagram", label: "Instagram",   Icon: IconInstagram, bg: "linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)" },
  { key: "social_facebook",  label: "Facebook",    Icon: IconFacebook,  bg: "#1877f2" },
  { key: "social_twitter",   label: "Twitter / X", Icon: IconTwitter,   bg: "#000" },
  { key: "social_youtube",   label: "YouTube",     Icon: IconYoutube,   bg: "#ff0000" },
  { key: "social_tiktok",    label: "TikTok",      Icon: IconTiktok,    bg: "#010101" },
  { key: "social_snapchat",  label: "Snapchat",    Icon: IconSnapchat,  bg: "#fffc00", dark: true },
  { key: "social_pinterest", label: "Pinterest",   Icon: IconPinterest, bg: "#e60023" },
  { key: "social_telegram",  label: "Telegram",    Icon: IconTelegram,  bg: "#2AABEE" },
];

const SUBJECTS = [
  "Demande de devis",
  "Projet web / application",
  "Infrastructure & IT",
  "Communication & Événementiel",
  "Tourisme AfriNomade",
  "Autre demande",
];

function ContactContent() {
  const params = useSearchParams();
  const preset = params.get("type");
  const whatsapp = useWhatsApp();

  const [form, setForm] = useState({
    nom: "", email: "",
    sujet: preset === "devis" ? "Demande de devis" : "Autre demande",
    message: "",
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [toast, setToast] = useState<{ ok: boolean; msg: string } | null>(null);

  const [siteInfo, setSiteInfo] = useState<SiteSettings>({
    contactEmail: "contact@dimegroupe.ci", phone: "", address: "Abidjan, Côte d'Ivoire",
    social_linkedin: "", social_instagram: "", social_facebook: "",
    social_twitter: "", social_youtube: "", social_tiktok: "",
    social_snapchat: "", social_pinterest: "", social_telegram: "",
  });

  useEffect(() => {
    fetch("/api/settings").then(r => r.json()).then(d => {
      if (d && !d.error) setSiteInfo(prev => ({ ...prev, ...d }));
    }).catch(() => {});
  }, []);

  const mailto = useMemo(() => {
    const q = new URLSearchParams({ subject: form.sujet, body: `Nom: ${form.nom}\nEmail: ${form.email}\n\n${form.message}` }).toString();
    return `mailto:${siteInfo.contactEmail}?${q}`;
  }, [form, siteInfo.contactEmail]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.nom, email: form.email, subject: form.sujet, message: form.message }),
      });
      if (res.ok) {
        setSent(true);
        setForm({ nom: "", email: "", sujet: preset === "devis" ? "Demande de devis" : "Autre demande", message: "" });
      } else {
        setToast({ ok: false, msg: "Erreur lors de l'envoi. Essayez par email." });
        setTimeout(() => { window.location.href = mailto; }, 2000);
      }
    } catch {
      setToast({ ok: false, msg: "Erreur de connexion. Redirection email…" });
      setTimeout(() => { window.location.href = mailto; }, 2000);
    } finally { setSending(false); }
  };

  const INP = "w-full px-4 py-3.5 rounded-xl text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-[var(--royal-blue)]"
    + " border border-[color-mix(in_oklch,var(--foreground)_10%,transparent)]"
    + " bg-[color-mix(in_oklch,var(--foreground)_4%,transparent)]"
    + " placeholder:text-[color-mix(in_oklch,var(--foreground)_28%,transparent)]";

  const activeSocials = SOCIALS.filter(s => !!siteInfo[s.key]);

  return (
    <main id="main-content" role="main" className="overflow-x-hidden min-h-screen">
      {toast && <Toast ok={toast.ok} msg={toast.msg} onDone={() => setToast(null)} />}

      <div className="grid lg:grid-cols-[1fr_1.15fr] min-h-screen">

        {/* ── PANNEAU GAUCHE ── */}
        <div className="relative flex flex-col justify-between px-8 py-16 md:px-12 md:py-20 overflow-hidden lg:min-h-screen"
          style={{ background: "linear-gradient(160deg, var(--royal-blue) 0%, color-mix(in oklch, var(--royal-blue) 65%, #000) 100%)" }}>
          {/* Décoration */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10"
              style={{ background: "radial-gradient(circle, var(--gold-premium), transparent)", transform: "translate(30%, -30%)" }} />
            <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full opacity-[0.08]"
              style={{ background: "radial-gradient(circle, white, transparent)", transform: "translate(-40%, 40%)" }} />
            <div className="absolute inset-0 opacity-[0.04]"
              style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
          </div>

          {/* Header */}
          <ScrollAnimation animation="fadeInUp" delay={0}>
            <div className="relative z-10">
              <span className="section-eyebrow text-white/50 block mb-4">Contact</span>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Parlons de votre projet</h1>
              <p className="text-white/65 text-sm leading-relaxed max-w-sm">
                Décrivez votre besoin — nous répondons sous 24h avec une proposition sur-mesure.
              </p>
            </div>
          </ScrollAnimation>

          {/* Coordonnées */}
          <div className="relative z-10 space-y-4 my-10">
            {siteInfo.address && (
              <ScrollAnimation animation="fadeInUp" delay={100}>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(255,255,255,0.12)" }}>
                    <MapPin size={16} className="text-white/80" />
                  </div>
                  <div>
                    <p className="text-[11px] text-white/45 uppercase tracking-widest font-semibold mb-0.5">Adresse</p>
                    <p className="text-sm text-white/85">{siteInfo.address}</p>
                  </div>
                </div>
              </ScrollAnimation>
            )}
            <ScrollAnimation animation="fadeInUp" delay={140}>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(255,255,255,0.12)" }}>
                  <Mail size={16} className="text-white/80" />
                </div>
                <div>
                  <p className="text-[11px] text-white/45 uppercase tracking-widest font-semibold mb-0.5">Email</p>
                  <a href={`mailto:${siteInfo.contactEmail}`} className="text-sm text-white/85 hover:text-white transition-colors">{siteInfo.contactEmail}</a>
                </div>
              </div>
            </ScrollAnimation>
            {siteInfo.phone && (
              <ScrollAnimation animation="fadeInUp" delay={180}>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(255,255,255,0.12)" }}>
                    <Phone size={16} className="text-white/80" />
                  </div>
                  <div>
                    <p className="text-[11px] text-white/45 uppercase tracking-widest font-semibold mb-0.5">Téléphone</p>
                    <a href={`tel:${siteInfo.phone}`} className="text-sm text-white/85 hover:text-white transition-colors">{siteInfo.phone}</a>
                  </div>
                </div>
              </ScrollAnimation>
            )}
            {/* WhatsApp */}
            <ScrollAnimation animation="fadeInUp" delay={220}>
              <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 px-5 py-3.5 rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:bg-white/15"
                style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)" }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#25d366" }}>
                  <MessageSquare size={16} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">WhatsApp Business</p>
                  <p className="text-[11px] text-white/50">Réponse rapide garantie</p>
                </div>
                <span className="ml-auto text-white/40 text-lg">→</span>
              </a>
            </ScrollAnimation>
          </div>

          {/* Réseaux sociaux — icônes colorées */}
          {activeSocials.length > 0 && (
            <ScrollAnimation animation="fadeInUp" delay={260}>
              <div className="relative z-10">
                <p className="text-[11px] text-white/40 uppercase tracking-widest font-semibold mb-4">Nous suivre</p>
                <div className="flex flex-wrap gap-2.5">
                  {activeSocials.map(({ key, label, Icon, bg, dark }) => (
                    <a key={key}
                      href={siteInfo[key]}
                      target="_blank" rel="noopener noreferrer"
                      title={label}
                      className="group flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 hover:scale-105 hover:shadow-lg"
                      style={{ background: bg, color: dark ? "#111" : "#fff" }}>
                      <Icon />
                      <span className="hidden sm:inline">{label}</span>
                    </a>
                  ))}
                </div>
              </div>
            </ScrollAnimation>
          )}
        </div>

        {/* ── PANNEAU DROIT — Formulaire ── */}
        <div className="flex flex-col justify-center px-8 py-16 md:px-12 md:py-20"
          style={{ background: "color-mix(in oklch, var(--background) 98%, transparent)" }}>
          <ScrollAnimation animation="slideInRight" delay={100}>
            {sent ? (
              <div className="flex flex-col items-center justify-center text-center py-16 gap-6 max-w-md mx-auto">
                <div className="w-20 h-20 rounded-full flex items-center justify-center"
                  style={{ background: "color-mix(in oklch, var(--royal-blue) 10%, transparent)" }}>
                  <Check size={36} style={{ color: "var(--royal-blue)" }} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-3">Message envoyé !</h2>
                  <p className="text-sm leading-relaxed" style={{ color: "color-mix(in oklch, var(--foreground) 60%, transparent)" }}>
                    Merci pour votre message. Nous vous répondrons dans les 24 heures avec une proposition personnalisée.
                  </p>
                </div>
                <button onClick={() => setSent(false)} className="px-6 py-2.5 rounded-full text-sm font-semibold text-white" style={{ background: "var(--royal-blue)" }}>
                  Envoyer un autre message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="max-w-lg mx-auto w-full space-y-5">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-2">Envoyez-nous un message</h2>
                  <p className="text-sm" style={{ color: "color-mix(in oklch, var(--foreground) 55%, transparent)" }}>
                    Tous les champs marqués <span style={{ color: "var(--royal-blue)" }}>*</span> sont requis.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: "color-mix(in oklch, var(--foreground) 65%, transparent)" }}>
                      Nom <span style={{ color: "var(--royal-blue)" }}>*</span>
                    </label>
                    <input className={INP} placeholder="Votre nom" value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} required />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: "color-mix(in oklch, var(--foreground) 65%, transparent)" }}>
                      Email <span style={{ color: "var(--royal-blue)" }}>*</span>
                    </label>
                    <input type="email" className={INP} placeholder="votre@email.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: "color-mix(in oklch, var(--foreground) 65%, transparent)" }}>Sujet</label>
                  <div className="flex flex-wrap gap-2">
                    {SUBJECTS.map(s => (
                      <button key={s} type="button" onClick={() => setForm({ ...form, sujet: s })}
                        className="px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200"
                        style={{
                          background: form.sujet === s ? "var(--royal-blue)" : "color-mix(in oklch, var(--foreground) 5%, transparent)",
                          color: form.sujet === s ? "#fff" : "color-mix(in oklch, var(--foreground) 65%, transparent)",
                          border: form.sujet === s ? "1px solid transparent" : "1px solid color-mix(in oklch, var(--foreground) 10%, transparent)",
                        }}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: "color-mix(in oklch, var(--foreground) 65%, transparent)" }}>
                    Message <span style={{ color: "var(--royal-blue)" }}>*</span>
                  </label>
                  <textarea rows={6} className={INP + " resize-none"} placeholder="Décrivez votre projet ou votre question…"
                    value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} required />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button type="submit" disabled={sending}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold text-white transition-all duration-300 hover:scale-[1.02] disabled:opacity-50"
                    style={{ background: "linear-gradient(135deg, var(--royal-blue), color-mix(in oklch, var(--royal-blue) 75%, var(--gold-premium)))", boxShadow: "0 8px 32px color-mix(in oklch, var(--royal-blue) 30%, transparent)" }}>
                    {sending ? <><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />Envoi…</> : <><Send size={15} />Envoyer le message</>}
                  </button>
                  <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold transition-all duration-300 hover:scale-[1.02]"
                    style={{ border: "1.5px solid color-mix(in oklch, var(--foreground) 12%, transparent)", color: "color-mix(in oklch, var(--foreground) 75%, transparent)" }}>
                    <MessageSquare size={15} />
                    WhatsApp
                  </a>
                </div>
                <p className="text-[11px] text-center" style={{ color: "color-mix(in oklch, var(--foreground) 38%, transparent)" }}>
                  Vos données ne sont jamais partagées. Réponse garantie sous 24h.
                </p>
              </form>
            )}
          </ScrollAnimation>
        </div>
      </div>
    </main>
  );
}

export default function ContactPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <ContactContent />
    </Suspense>
  );
}

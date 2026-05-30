"use client";

import { useState, useEffect } from "react";
import { Save, Loader2, Check, AlertCircle, FileText, Image as ImageIcon, BookOpen, HelpCircle, Mail } from "lucide-react";

const DEFAULTS = {
  services:  { title: "Nos services",         subtitle: "Toutes nos expertises",        cta_text: "Besoin d'un devis personnalisé ? Contactez-nous pour discuter de votre projet.", cta_label: "Obtenir un devis",   cta_link: "/contact?type=devis" },
  portfolio: { title: "Nos réalisations",      subtitle: "Portfolio",                    intro: "Découvrez une sélection de nos projets réalisés pour nos clients : sites web, applications mobiles, identités visuelles, événements et expériences touristiques.", cta_text: "Vous avez un projet similaire ? Discutons-en ensemble.", cta_label: "Demander un devis", cta_link: "/contact" },
  blog:      { title: "Blog & Actualités",     subtitle: "Nos articles et conseils",     intro: "Découvrez nos articles, conseils et actualités sur le développement web, le marketing digital, l'IT, le tourisme et bien plus encore." },
  faq:       { title: "Questions Fréquentes",  subtitle: "FAQ",                          intro: "Vous trouverez ci-dessous les réponses aux questions les plus fréquentes sur nos services.", cta_text: "Vous avez encore des questions ? Notre équipe est à votre écoute." },
  contact:   { title: "Contact",               subtitle: "Parlons de votre projet" },
};
type PageId = keyof typeof DEFAULTS;

const TABS: { id: PageId; label: string; icon: React.ReactNode; href: string }[] = [
  { id: "services",  label: "Services",    icon: <FileText size={14} />,    href: "/services" },
  { id: "portfolio", label: "Portfolio",   icon: <ImageIcon size={14} />,   href: "/portfolio" },
  { id: "blog",      label: "Blog",        icon: <BookOpen size={14} />,    href: "/blog" },
  { id: "faq",       label: "FAQ",         icon: <HelpCircle size={14} />,  href: "/faq" },
  { id: "contact",   label: "Contact",     icon: <Mail size={14} />,        href: "/contact" },
];

const F = "w-full px-3 py-2 rounded-lg border text-sm outline-none transition-colors focus:border-[var(--royal-blue)]"
  + " border-[color-mix(in_oklch,var(--foreground)_12%,transparent)]"
  + " bg-[color-mix(in_oklch,var(--foreground)_4%,transparent)]"
  + " text-[color-mix(in_oklch,var(--foreground)_88%,transparent)]"
  + " placeholder:text-[color-mix(in_oklch,var(--foreground)_25%,transparent)]";

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

export default function AdminPagesPage() {
  const [tab, setTab] = useState<PageId>("services");
  const [settings, setSettings] = useState(structuredClone(DEFAULTS));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ ok: boolean; msg: string } | null>(null);

  useEffect(() => {
    fetch("/api/admin/page-settings")
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setSettings(prev => ({ ...prev, ...d })); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const update = (page: PageId, field: string, value: string) =>
    setSettings(prev => ({ ...prev, [page]: { ...prev[page], [field]: value } }));

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/page-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      setToast(res.ok ? { ok: true, msg: "Paramètres des pages enregistrés" } : { ok: false, msg: "Erreur lors de l'enregistrement" });
    } catch { setToast({ ok: false, msg: "Erreur de connexion" }); }
    finally { setSaving(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 size={28} className="animate-spin text-[var(--royal-blue)]" />
    </div>
  );

  return (
    <div className="max-w-3xl space-y-6">
      {toast && <Toast ok={toast.ok} msg={toast.msg} onDone={() => setToast(null)} />}

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold mb-1">En-têtes des pages</h1>
          <p className="text-sm" style={{ color: "color-mix(in oklch, var(--foreground) 55%, transparent)" }}>
            Titres, sous-titres, introductions et boutons CTA de chaque page publique
          </p>
        </div>
        <button onClick={save} disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-60 shrink-0"
          style={{ background: "var(--royal-blue)" }}>
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          {saving ? "Enregistrement…" : "Enregistrer"}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 flex-wrap p-1 rounded-xl"
        style={{ background: "color-mix(in oklch, var(--foreground) 5%, transparent)" }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all"
            style={{
              background: tab === t.id ? "var(--background)" : "transparent",
              color: tab === t.id ? "var(--foreground)" : "color-mix(in oklch, var(--foreground) 55%, transparent)",
              boxShadow: tab === t.id ? "0 1px 3px rgba(0,0,0,0.15)" : "none",
            }}>
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* Panel */}
      <div className="rounded-2xl border p-6 space-y-5"
        style={{ background: "color-mix(in oklch, var(--foreground) 2%, transparent)", borderColor: "color-mix(in oklch, var(--foreground) 9%, transparent)" }}>
        {tab === "services" && <>
          <Field label="Titre de la section"><input className={F} value={settings.services.title} onChange={e => update("services", "title", e.target.value)} /></Field>
          <Field label="Sous-titre"><input className={F} value={settings.services.subtitle} onChange={e => update("services", "subtitle", e.target.value)} /></Field>
          <div className="border-t pt-5" style={{ borderColor: "color-mix(in oklch, var(--foreground) 8%, transparent)" }}>
            <p className="text-xs font-semibold mb-3 uppercase tracking-widest" style={{ color: "color-mix(in oklch, var(--foreground) 45%, transparent)" }}>Bouton CTA bas de page</p>
            <Field label="Texte d'accroche"><textarea className={F + " resize-none"} rows={2} value={settings.services.cta_text} onChange={e => update("services", "cta_text", e.target.value)} /></Field>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <Field label="Label bouton"><input className={F} value={settings.services.cta_label} onChange={e => update("services", "cta_label", e.target.value)} /></Field>
              <Field label="Lien bouton"><input className={F} value={settings.services.cta_link} onChange={e => update("services", "cta_link", e.target.value)} /></Field>
            </div>
          </div>
        </>}

        {tab === "portfolio" && <>
          <Field label="Titre de la section"><input className={F} value={settings.portfolio.title} onChange={e => update("portfolio", "title", e.target.value)} /></Field>
          <Field label="Sous-titre"><input className={F} value={settings.portfolio.subtitle} onChange={e => update("portfolio", "subtitle", e.target.value)} /></Field>
          <Field label="Texte d'introduction"><textarea className={F + " resize-none"} rows={3} value={settings.portfolio.intro} onChange={e => update("portfolio", "intro", e.target.value)} /></Field>
          <div className="border-t pt-5" style={{ borderColor: "color-mix(in oklch, var(--foreground) 8%, transparent)" }}>
            <p className="text-xs font-semibold mb-3 uppercase tracking-widest" style={{ color: "color-mix(in oklch, var(--foreground) 45%, transparent)" }}>Bouton CTA bas de page</p>
            <Field label="Texte d'accroche"><textarea className={F + " resize-none"} rows={2} value={settings.portfolio.cta_text} onChange={e => update("portfolio", "cta_text", e.target.value)} /></Field>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <Field label="Label bouton"><input className={F} value={settings.portfolio.cta_label} onChange={e => update("portfolio", "cta_label", e.target.value)} /></Field>
              <Field label="Lien bouton"><input className={F} value={settings.portfolio.cta_link} onChange={e => update("portfolio", "cta_link", e.target.value)} /></Field>
            </div>
          </div>
        </>}

        {tab === "blog" && <>
          <Field label="Titre de la section"><input className={F} value={settings.blog.title} onChange={e => update("blog", "title", e.target.value)} /></Field>
          <Field label="Sous-titre"><input className={F} value={settings.blog.subtitle} onChange={e => update("blog", "subtitle", e.target.value)} /></Field>
          <Field label="Texte d'introduction"><textarea className={F + " resize-none"} rows={3} value={settings.blog.intro} onChange={e => update("blog", "intro", e.target.value)} /></Field>
        </>}

        {tab === "faq" && <>
          <Field label="Titre de la section"><input className={F} value={settings.faq.title} onChange={e => update("faq", "title", e.target.value)} /></Field>
          <Field label="Sous-titre"><input className={F} value={settings.faq.subtitle} onChange={e => update("faq", "subtitle", e.target.value)} /></Field>
          <Field label="Texte d'introduction"><textarea className={F + " resize-none"} rows={3} value={settings.faq.intro} onChange={e => update("faq", "intro", e.target.value)} /></Field>
          <div className="border-t pt-5" style={{ borderColor: "color-mix(in oklch, var(--foreground) 8%, transparent)" }}>
            <p className="text-xs font-semibold mb-3 uppercase tracking-widest" style={{ color: "color-mix(in oklch, var(--foreground) 45%, transparent)" }}>CTA bas de page</p>
            <Field label="Texte d'accroche CTA"><textarea className={F + " resize-none"} rows={2} value={settings.faq.cta_text} onChange={e => update("faq", "cta_text", e.target.value)} /></Field>
          </div>
        </>}

        {tab === "contact" && <>
          <Field label="Titre de la section"><input className={F} value={settings.contact.title} onChange={e => update("contact", "title", e.target.value)} /></Field>
          <Field label="Sous-titre"><input className={F} value={settings.contact.subtitle} onChange={e => update("contact", "subtitle", e.target.value)} /></Field>
          <div className="px-3 py-2.5 rounded-lg text-xs mt-2" style={{ background: "color-mix(in oklch, var(--royal-blue) 8%, transparent)", color: "color-mix(in oklch, var(--foreground) 65%, transparent)" }}>
            💡 Les informations de contact (email, téléphone, adresse, réseaux sociaux) sont éditables dans <strong>Paramètres</strong>.
          </div>
        </>}

        {/* Lien vers la page */}
        <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: "color-mix(in oklch, var(--foreground) 8%, transparent)" }}>
          <span className="text-xs" style={{ color: "color-mix(in oklch, var(--foreground) 45%, transparent)" }}>Page publique</span>
          <a href={TABS.find(t => t.id === tab)?.href} target="_blank" rel="noopener noreferrer"
            className="text-xs font-medium hover:underline" style={{ color: "var(--royal-blue)" }}>
            Voir la page → {TABS.find(t => t.id === tab)?.href}
          </a>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1.5" style={{ color: "color-mix(in oklch, var(--foreground) 70%, transparent)" }}>{label}</label>
      {children}
    </div>
  );
}

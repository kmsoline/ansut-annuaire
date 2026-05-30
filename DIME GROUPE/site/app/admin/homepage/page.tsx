"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Save, Eye, RotateCcw, Plus, Trash2, GripVertical,
  Home, BarChart2, Layers, GitCommitHorizontal,
  CheckCircle, Megaphone, FolderOpen, Image as ImageIcon,
  MessageSquare, Building2, ExternalLink, Loader2,
} from "lucide-react";
import MediaPicker from "@/app/components/MediaPicker";

// ── Types ─────────────────────────────────────────────────────────────────────

interface FloatStat   { value: string; label: string; }
interface StatItem    { value: string; label: string; }
interface ServiceItem { title: string; description: string; img: string; link: string; }
interface ProcessItem { step: string; icon: string; title: string; description: string; }
interface AdvantageItem { icon: string; title: string; description: string; }

interface HomepageSettings {
  hero: {
    badge: string; title: string; subtitle: string;
    bullets: string[]; image: string;
    cta_primary_label: string; cta_primary_link: string; cta_secondary_label: string;
    floating_stat_1: FloatStat; floating_stat_2: FloatStat;
  };
  logos_band: { enabled: boolean; label: string; };
  stats: { enabled: boolean; items: StatItem[]; };
  services: { enabled: boolean; label: string; title: string; items: ServiceItem[]; };
  process:  { enabled: boolean; label: string; title: string; items: ProcessItem[]; };
  advantages: { enabled: boolean; label: string; title: string; items: AdvantageItem[]; };
  portfolio_preview: { enabled: boolean; label: string; title: string; button_label: string; button_link: string; };
  cta_bottom: { enabled: boolean; eyebrow: string; title: string; description: string; button_label: string; button_link: string; };
  testimonials_section: { enabled: boolean; label: string; title: string; };
}

// ── Onglets ───────────────────────────────────────────────────────────────────

type TabId = "hero" | "logos" | "stats" | "services" | "process" | "advantages" | "portfolio" | "cta" | "testimonials";

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: "hero",         label: "Héro",         icon: <Home size={14} /> },
  { id: "logos",        label: "Logos",        icon: <Building2 size={14} /> },
  { id: "stats",        label: "Statistiques", icon: <BarChart2 size={14} /> },
  { id: "services",     label: "Services",     icon: <Layers size={14} /> },
  { id: "process",      label: "Processus",    icon: <GitCommitHorizontal size={14} /> },
  { id: "advantages",   label: "Avantages",    icon: <CheckCircle size={14} /> },
  { id: "portfolio",    label: "Portfolio",    icon: <FolderOpen size={14} /> },
  { id: "cta",          label: "CTA Final",    icon: <Megaphone size={14} /> },
  { id: "testimonials", label: "Témoignages",  icon: <MessageSquare size={14} /> },
];

// ── Primitives UI ─────────────────────────────────────────────────────────────

const F  = "w-full px-3 py-2 rounded-lg border border-[color-mix(in_oklch,var(--foreground)_12%,transparent)] bg-[color-mix(in_oklch,var(--foreground)_4%,transparent)] text-[color-mix(in_oklch,var(--foreground)_88%,transparent)] text-sm outline-none focus:border-[var(--royal-blue)] transition-colors placeholder:text-[color-mix(in_oklch,var(--foreground)_25%,transparent)]";
const TA = `${F} resize-none`;

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer select-none w-fit">
      <button type="button" role="switch" aria-checked={checked}
        onClick={() => onChange(!checked)}
        className="relative w-10 rounded-full transition-colors focus:outline-none"
        style={{ height: 22, background: checked ? "var(--royal-blue)" : "color-mix(in oklch, var(--foreground) 18%, transparent)" }}>
        <span className={`absolute top-[3px] left-[3px] w-4 h-4 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-[18px]" : ""}`} />
      </button>
      <span className="text-sm text-[color-mix(in_oklch,var(--foreground)_65%,transparent)]">{label}</span>
    </label>
  );
}

function Card({ title, children, noPad = false }: { title: string; children: React.ReactNode; noPad?: boolean }) {
  return (
    <div className="rounded-xl border border-[color-mix(in_oklch,var(--foreground)_10%,transparent)] overflow-hidden"
      style={{ background: "color-mix(in oklch, var(--background) 80%, transparent)" }}>
      <div className="px-5 py-3 border-b border-[color-mix(in_oklch,var(--foreground)_8%,transparent)]">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-[color-mix(in_oklch,var(--foreground)_45%,transparent)]">{title}</h3>
      </div>
      <div className={noPad ? "" : "p-5 space-y-4"}>
        {children}
      </div>
    </div>
  );
}

function Lbl({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs font-medium text-[color-mix(in_oklch,var(--foreground)_50%,transparent)] mb-1">{children}</label>;
}

function SectionRow({ icon, title, note, href }: { icon: React.ReactNode; title: string; note?: string; href: string }) {
  return (
    <a href={href} className="flex items-center gap-3 px-5 py-3.5 hover:bg-[color-mix(in_oklch,var(--foreground)_3%,transparent)] transition-colors group">
      <span className="text-[color-mix(in_oklch,var(--foreground)_35%,transparent)]">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{title}</p>
        {note && <p className="text-xs text-[color-mix(in_oklch,var(--foreground)_40%,transparent)] mt-0.5">{note}</p>}
      </div>
      <ExternalLink size={13} className="text-[color-mix(in_oklch,var(--foreground)_25%,transparent)] group-hover:text-[var(--royal-blue)] transition-colors" />
    </a>
  );
}

// ── Composant image avec mediapicker inline ───────────────────────────────────
function ImageField({
  value, onChange, label = "Image (URL)", placeholder = "/images/hero.jpg",
}: {
  value: string; onChange: (url: string) => void;
  label?: string; placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="space-y-2">
      <Lbl>{label}</Lbl>
      <div className="flex gap-2 items-start">
        {value && (
          <div className="w-20 h-14 rounded-lg overflow-hidden flex-shrink-0 border border-[color-mix(in_oklch,var(--foreground)_12%,transparent)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="" className="w-full h-full object-cover" />
          </div>
        )}
        <div className="flex-1">
          <input type="text" value={value} onChange={e => onChange(e.target.value)} className={F} placeholder={placeholder} />
          <button onClick={() => setOpen(v => !v)}
            className="mt-1.5 flex items-center gap-1 text-xs hover:underline"
            style={{ color: "var(--royal-blue)" }}>
            <ImageIcon size={11} /> {open ? "Fermer" : "Choisir depuis la médiathèque"}
          </button>
        </div>
      </div>
      {open && (
        <MediaPicker
          value={value}
          onChange={url => { onChange(url); setOpen(false); }}
          label={label}
        />
      )}
    </div>
  );
}

// ── Page principale ───────────────────────────────────────────────────────────

export default function AdminHomepage() {
  const [s, setS]       = useState<HomepageSettings | null>(null);
  const [tab, setTab]   = useState<TabId>("hero");
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);
  const [err,    setErr]    = useState("");

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/homepage");
      if (res.ok) setS(await res.json());
    } catch { setErr("Impossible de charger les paramètres"); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!s) return;
    setSaving(true); setErr("");
    try {
      const res = await fetch("/api/admin/homepage", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(s),
      });
      if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 3000); }
      else setErr("Erreur lors de l'enregistrement");
    } catch { setErr("Erreur réseau"); }
    finally { setSaving(false); }
  };

  function patch<K extends keyof HomepageSettings>(section: K, val: Partial<HomepageSettings[K]>) {
    setS(prev => prev ? { ...prev, [section]: { ...prev[section], ...val } } : prev);
  }

  // ── Loading ───────────────────────────────────────────────────────────────
  if (!s) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 size={28} className="animate-spin" style={{ color: "var(--royal-blue)" }} />
    </div>
  );

  return (
    <div className="space-y-6 max-w-3xl">

      {/* ── En-tête ── */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold mb-1">Page d'accueil</h1>
          <p className="text-sm text-[color-mix(in_oklch,var(--foreground)_50%,transparent)]">
            Toutes les sections de la landing page — modifiables ici
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a href="/" target="_blank"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors"
            style={{ background: "color-mix(in oklch, var(--foreground) 5%, transparent)", color: "color-mix(in oklch, var(--foreground) 60%, transparent)" }}>
            <Eye size={14} /> Aperçu
          </a>
          <button onClick={load}
            className="p-2 rounded-lg transition-colors"
            style={{ background: "color-mix(in oklch, var(--foreground) 5%, transparent)" }}
            title="Recharger">
            <RotateCcw size={14} className="text-[color-mix(in_oklch,var(--foreground)_50%,transparent)]" />
          </button>
          <button onClick={save} disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors disabled:opacity-60"
            style={{ background: saved ? "#16a34a" : "var(--royal-blue)" }}>
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {saving ? "Sauvegarde…" : saved ? "✓ Enregistré" : "Enregistrer"}
          </button>
        </div>
      </div>

      {err && (
        <div className="p-3 rounded-xl border text-sm" style={{ background: "color-mix(in oklch, red 8%, transparent)", borderColor: "color-mix(in oklch, red 25%, transparent)", color: "color-mix(in oklch, red 70%, transparent)" }}>
          {err}
        </div>
      )}

      {/* ── Onglets ── */}
      <div className="flex flex-wrap gap-1 p-1 rounded-xl border w-fit"
        style={{ background: "color-mix(in oklch, var(--foreground) 4%, transparent)", borderColor: "color-mix(in oklch, var(--foreground) 8%, transparent)" }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={tab === t.id
              ? { background: "var(--royal-blue)", color: "white" }
              : { color: "color-mix(in oklch, var(--foreground) 55%, transparent)" }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ════════════════════════════════════════════
          HÉRO
         ════════════════════════════════════════════ */}
      {tab === "hero" && (
        <div className="space-y-4">
          <Card title="Badge & textes">
            <div>
              <Lbl>Badge (pastille verte en haut)</Lbl>
              <input type="text" value={s.hero.badge}
                onChange={e => patch("hero", { badge: e.target.value })}
                className={F} placeholder="Agence digitale · Côte d'Ivoire" />
            </div>
            <div>
              <Lbl>Titre principal (géant)</Lbl>
              <textarea value={s.hero.title}
                onChange={e => patch("hero", { title: e.target.value })}
                rows={2} className={TA} placeholder="L'expertise digitale au service de vos projets" />
            </div>
            <div>
              <Lbl>Sous-titre</Lbl>
              <textarea value={s.hero.subtitle}
                onChange={e => patch("hero", { subtitle: e.target.value })}
                rows={2} className={TA} placeholder="Nous accompagnons…" />
            </div>
          </Card>

          <Card title="Points clés (pills sous le sous-titre)">
            <div className="space-y-2">
              {s.hero.bullets.map((b, i) => (
                <div key={i} className="flex items-center gap-2">
                  <GripVertical size={14} className="text-[color-mix(in_oklch,var(--foreground)_20%,transparent)] flex-shrink-0" />
                  <input type="text" value={b}
                    onChange={e => {
                      const arr = [...s.hero.bullets]; arr[i] = e.target.value;
                      patch("hero", { bullets: arr });
                    }}
                    className={`${F} flex-1`} placeholder="Point clé" />
                  <button
                    onClick={() => patch("hero", { bullets: s.hero.bullets.filter((_, j) => j !== i) })}
                    className="p-1.5 rounded-lg hover:bg-red-500/15 text-[color-mix(in_oklch,var(--foreground)_30%,transparent)] hover:text-red-500 transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
              <button
                onClick={() => patch("hero", { bullets: [...s.hero.bullets, ""] })}
                className="flex items-center gap-1.5 text-xs hover:underline"
                style={{ color: "var(--royal-blue)" }}>
                <Plus size={12} /> Ajouter un point
              </button>
            </div>
          </Card>

          <Card title="Image de fond (plein écran)">
            <ImageField
              value={s.hero.image}
              onChange={url => patch("hero", { image: url })}
              label="Image de fond du héro"
              placeholder="/images/hero.jpg"
            />
          </Card>

          <Card title="Cartes flottantes">
            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-2">
                <p className="text-xs font-medium text-[color-mix(in_oklch,var(--foreground)_45%,transparent)]">Carte 1</p>
                <div>
                  <Lbl>Valeur (ex : 50+)</Lbl>
                  <input type="text" value={s.hero.floating_stat_1.value}
                    onChange={e => patch("hero", { floating_stat_1: { ...s.hero.floating_stat_1, value: e.target.value } })}
                    className={F} placeholder="50+" />
                </div>
                <div>
                  <Lbl>Label</Lbl>
                  <input type="text" value={s.hero.floating_stat_1.label}
                    onChange={e => patch("hero", { floating_stat_1: { ...s.hero.floating_stat_1, label: e.target.value } })}
                    className={F} placeholder="Projets livrés" />
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-medium text-[color-mix(in_oklch,var(--foreground)_45%,transparent)]">Carte 2</p>
                <div>
                  <Lbl>Valeur</Lbl>
                  <input type="text" value={s.hero.floating_stat_2.value}
                    onChange={e => patch("hero", { floating_stat_2: { ...s.hero.floating_stat_2, value: e.target.value } })}
                    className={F} placeholder="5 ans" />
                </div>
                <div>
                  <Lbl>Label</Lbl>
                  <input type="text" value={s.hero.floating_stat_2.label}
                    onChange={e => patch("hero", { floating_stat_2: { ...s.hero.floating_stat_2, label: e.target.value } })}
                    className={F} placeholder="D'expérience" />
                </div>
              </div>
            </div>
          </Card>

          <Card title="Boutons CTA">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Lbl>Bouton principal — texte</Lbl>
                <input type="text" value={s.hero.cta_primary_label}
                  onChange={e => patch("hero", { cta_primary_label: e.target.value })}
                  className={F} placeholder="Demander un devis" />
              </div>
              <div>
                <Lbl>Bouton principal — lien</Lbl>
                <input type="text" value={s.hero.cta_primary_link}
                  onChange={e => patch("hero", { cta_primary_link: e.target.value })}
                  className={F} placeholder="/contact?type=devis" />
              </div>
            </div>
            <div>
              <Lbl>Bouton WhatsApp — texte</Lbl>
              <input type="text" value={s.hero.cta_secondary_label}
                onChange={e => patch("hero", { cta_secondary_label: e.target.value })}
                className={F} placeholder="Nous contacter sur WhatsApp" />
              <p className="mt-1.5 text-xs text-[color-mix(in_oklch,var(--foreground)_35%,transparent)]">
                Le numéro WhatsApp est géré dans <strong>Paramètres</strong>.
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* ════════════════════════════════════════════
          LOGOS (bande partenaires)
         ════════════════════════════════════════════ */}
      {tab === "logos" && (
        <div className="space-y-4">
          <Card title="Affichage & texte">
            <Toggle
              checked={s.logos_band.enabled}
              onChange={v => patch("logos_band", { enabled: v })}
              label="Afficher la bande de logos partenaires"
            />
            <div>
              <Lbl>Texte au-dessus des logos</Lbl>
              <input type="text" value={s.logos_band.label}
                onChange={e => patch("logos_band", { label: e.target.value })}
                className={F} placeholder="Ils nous font confiance" />
              <p className="mt-1 text-xs text-[color-mix(in_oklch,var(--foreground)_35%,transparent)]">
                Laisser vide pour masquer le texte.
              </p>
            </div>
          </Card>

          <Card title="Gérer les logos" noPad>
            <SectionRow
              icon={<Building2 size={16} />}
              href="/admin/client-logos"
              title="Logos clients"
              note="Ajouter, modifier, réordonner et activer/désactiver chaque logo"
            />
          </Card>
        </div>
      )}

      {/* ════════════════════════════════════════════
          STATISTIQUES
         ════════════════════════════════════════════ */}
      {tab === "stats" && (
        <div className="space-y-4">
          <Card title="Affichage">
            <Toggle checked={s.stats.enabled} onChange={v => patch("stats", { enabled: v })} label="Afficher la section chiffres clés" />
          </Card>
          <Card title="Chiffres">
            <div className="space-y-3">
              {s.stats.items.map((item, i) => (
                <div key={i} className="flex items-end gap-3 p-3 rounded-lg border border-[color-mix(in_oklch,var(--foreground)_8%,transparent)]"
                  style={{ background: "color-mix(in oklch, var(--foreground) 3%, transparent)" }}>
                  <div className="grid grid-cols-2 gap-3 flex-1">
                    <div>
                      <Lbl>Valeur (ex : 50+)</Lbl>
                      <input type="text" value={item.value} className={F} placeholder="50+"
                        onChange={e => { const a = [...s.stats.items]; a[i] = { ...a[i], value: e.target.value }; patch("stats", { items: a }); }} />
                    </div>
                    <div>
                      <Lbl>Label</Lbl>
                      <input type="text" value={item.label} className={F} placeholder="Projets réalisés"
                        onChange={e => { const a = [...s.stats.items]; a[i] = { ...a[i], label: e.target.value }; patch("stats", { items: a }); }} />
                    </div>
                  </div>
                  <button onClick={() => patch("stats", { items: s.stats.items.filter((_, j) => j !== i) })}
                    className="p-1.5 rounded-lg hover:bg-red-500/15 text-[color-mix(in_oklch,var(--foreground)_30%,transparent)] hover:text-red-500 transition-colors mb-0.5">
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
              <button onClick={() => patch("stats", { items: [...s.stats.items, { value: "", label: "" }] })}
                className="flex items-center gap-1.5 text-xs hover:underline" style={{ color: "var(--royal-blue)" }}>
                <Plus size={12} /> Ajouter un chiffre
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* ════════════════════════════════════════════
          SERVICES
         ════════════════════════════════════════════ */}
      {tab === "services" && (
        <div className="space-y-4">
          <Card title="Section">
            <Toggle checked={s.services.enabled} onChange={v => patch("services", { enabled: v })} label="Afficher la section services" />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Lbl>Étiquette (eyebrow)</Lbl>
                <input type="text" value={s.services.label}
                  onChange={e => patch("services", { label: e.target.value })} className={F} placeholder="Nos pôles" />
              </div>
              <div>
                <Lbl>Titre de section</Lbl>
                <input type="text" value={s.services.title}
                  onChange={e => patch("services", { title: e.target.value })} className={F} placeholder="Des expertises complémentaires" />
              </div>
            </div>
          </Card>

          <Card title="Cartes de service">
            <div className="space-y-4">
              {s.services.items.map((item, i) => (
                <div key={i} className="p-4 rounded-xl border border-[color-mix(in_oklch,var(--foreground)_8%,transparent)] space-y-3"
                  style={{ background: "color-mix(in oklch, var(--foreground) 2.5%, transparent)" }}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-[color-mix(in_oklch,var(--foreground)_40%,transparent)]">Service #{i + 1}</span>
                    <button onClick={() => patch("services", { items: s.services.items.filter((_, j) => j !== i) })}
                      className="p-1 rounded hover:bg-red-500/15 text-[color-mix(in_oklch,var(--foreground)_25%,transparent)] hover:text-red-500 transition-colors">
                      <Trash2 size={13} />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Lbl>Titre</Lbl>
                      <input type="text" value={item.title} className={F} placeholder="Infrastructure & IT"
                        onChange={e => { const a = [...s.services.items]; a[i] = { ...a[i], title: e.target.value }; patch("services", { items: a }); }} />
                    </div>
                    <div>
                      <Lbl>Lien</Lbl>
                      <input type="text" value={item.link} className={F} placeholder="/services"
                        onChange={e => { const a = [...s.services.items]; a[i] = { ...a[i], link: e.target.value }; patch("services", { items: a }); }} />
                    </div>
                  </div>
                  <div>
                    <Lbl>Description courte</Lbl>
                    <textarea value={item.description} rows={2} className={TA} placeholder="Description…"
                      onChange={e => { const a = [...s.services.items]; a[i] = { ...a[i], description: e.target.value }; patch("services", { items: a }); }} />
                  </div>
                  <ImageField
                    value={item.img}
                    onChange={url => { const a = [...s.services.items]; a[i] = { ...a[i], img: url }; patch("services", { items: a }); }}
                    label="Image de la carte"
                    placeholder="/images/service-it.jpg"
                  />
                </div>
              ))}
              <button
                onClick={() => patch("services", { items: [...s.services.items, { title: "", description: "", img: "", link: "/services" }] })}
                className="flex items-center gap-1.5 text-xs hover:underline" style={{ color: "var(--royal-blue)" }}>
                <Plus size={12} /> Ajouter un service
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* ════════════════════════════════════════════
          PROCESSUS
         ════════════════════════════════════════════ */}
      {tab === "process" && (
        <div className="space-y-4">
          <Card title="Section">
            <Toggle checked={s.process.enabled} onChange={v => patch("process", { enabled: v })} label="Afficher la section processus" />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Lbl>Étiquette (eyebrow)</Lbl>
                <input type="text" value={s.process.label}
                  onChange={e => patch("process", { label: e.target.value })} className={F} placeholder="Comment ça marche" />
              </div>
              <div>
                <Lbl>Titre de section</Lbl>
                <input type="text" value={s.process.title}
                  onChange={e => patch("process", { title: e.target.value })} className={F} placeholder="Un accompagnement simple et efficace" />
              </div>
            </div>
          </Card>

          <Card title="Étapes">
            <div className="space-y-3">
              {s.process.items.map((item, i) => (
                <div key={i} className="p-4 rounded-xl border border-[color-mix(in_oklch,var(--foreground)_8%,transparent)] space-y-3"
                  style={{ background: "color-mix(in oklch, var(--foreground) 2.5%, transparent)" }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                        style={{ background: "var(--royal-blue)" }}>{i + 1}</span>
                      <span className="text-xs text-[color-mix(in_oklch,var(--foreground)_40%,transparent)]">Étape</span>
                    </div>
                    <button onClick={() => patch("process", { items: s.process.items.filter((_, j) => j !== i) })}
                      className="p-1 rounded hover:bg-red-500/15 text-[color-mix(in_oklch,var(--foreground)_25%,transparent)] hover:text-red-500 transition-colors">
                      <Trash2 size={13} />
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Lbl>Icône (emoji)</Lbl>
                      <input type="text" value={item.icon} className={F} placeholder="🔍"
                        onChange={e => { const a = [...s.process.items]; a[i] = { ...a[i], icon: e.target.value }; patch("process", { items: a }); }} />
                    </div>
                    <div className="col-span-2">
                      <Lbl>Titre</Lbl>
                      <input type="text" value={item.title} className={F} placeholder="Analyse"
                        onChange={e => { const a = [...s.process.items]; a[i] = { ...a[i], title: e.target.value }; patch("process", { items: a }); }} />
                    </div>
                  </div>
                  <div>
                    <Lbl>Description</Lbl>
                    <textarea value={item.description} rows={2} className={TA} placeholder="Description de l'étape…"
                      onChange={e => { const a = [...s.process.items]; a[i] = { ...a[i], description: e.target.value }; patch("process", { items: a }); }} />
                  </div>
                </div>
              ))}
              <button
                onClick={() => patch("process", { items: [...s.process.items, { step: String(s.process.items.length + 1).padStart(2, "0"), icon: "", title: "", description: "" }] })}
                className="flex items-center gap-1.5 text-xs hover:underline" style={{ color: "var(--royal-blue)" }}>
                <Plus size={12} /> Ajouter une étape
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* ════════════════════════════════════════════
          AVANTAGES
         ════════════════════════════════════════════ */}
      {tab === "advantages" && (
        <div className="space-y-4">
          <Card title="Section">
            <Toggle checked={s.advantages.enabled} onChange={v => patch("advantages", { enabled: v })} label="Afficher la section avantages" />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Lbl>Étiquette (eyebrow)</Lbl>
                <input type="text" value={s.advantages.label}
                  onChange={e => patch("advantages", { label: e.target.value })} className={F} placeholder="Pourquoi nous choisir ?" />
              </div>
              <div>
                <Lbl>Titre de section</Lbl>
                <input type="text" value={s.advantages.title}
                  onChange={e => patch("advantages", { title: e.target.value })} className={F} placeholder="Des résultats concrets, une approche sur-mesure" />
              </div>
            </div>
          </Card>

          <Card title="Cartes avantages">
            <div className="space-y-3">
              {s.advantages.items.map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg border border-[color-mix(in_oklch,var(--foreground)_8%,transparent)]"
                  style={{ background: "color-mix(in oklch, var(--foreground) 2.5%, transparent)" }}>
                  <div className="grid grid-cols-3 gap-3 flex-1">
                    <div>
                      <Lbl>Icône (emoji)</Lbl>
                      <input type="text" value={item.icon} className={F} placeholder="🎯"
                        onChange={e => { const a = [...s.advantages.items]; a[i] = { ...a[i], icon: e.target.value }; patch("advantages", { items: a }); }} />
                    </div>
                    <div>
                      <Lbl>Titre</Lbl>
                      <input type="text" value={item.title} className={F} placeholder="Approche sur-mesure"
                        onChange={e => { const a = [...s.advantages.items]; a[i] = { ...a[i], title: e.target.value }; patch("advantages", { items: a }); }} />
                    </div>
                    <div>
                      <Lbl>Description</Lbl>
                      <input type="text" value={item.description} className={F} placeholder="Description…"
                        onChange={e => { const a = [...s.advantages.items]; a[i] = { ...a[i], description: e.target.value }; patch("advantages", { items: a }); }} />
                    </div>
                  </div>
                  <button onClick={() => patch("advantages", { items: s.advantages.items.filter((_, j) => j !== i) })}
                    className="mt-5 p-1.5 rounded hover:bg-red-500/15 text-[color-mix(in_oklch,var(--foreground)_25%,transparent)] hover:text-red-500 transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
              <button
                onClick={() => patch("advantages", { items: [...s.advantages.items, { icon: "", title: "", description: "" }] })}
                className="flex items-center gap-1.5 text-xs hover:underline" style={{ color: "var(--royal-blue)" }}>
                <Plus size={12} /> Ajouter un avantage
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* ════════════════════════════════════════════
          PORTFOLIO PREVIEW
         ════════════════════════════════════════════ */}
      {tab === "portfolio" && (
        <div className="space-y-4">
          <Card title="Affichage">
            <Toggle checked={s.portfolio_preview.enabled} onChange={v => patch("portfolio_preview", { enabled: v })} label="Afficher la section réalisations" />
          </Card>
          <Card title="Titres et lien">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Lbl>Étiquette (eyebrow)</Lbl>
                <input type="text" value={s.portfolio_preview.label}
                  onChange={e => patch("portfolio_preview", { label: e.target.value })} className={F} placeholder="Nos réalisations" />
              </div>
              <div>
                <Lbl>Titre de section</Lbl>
                <input type="text" value={s.portfolio_preview.title}
                  onChange={e => patch("portfolio_preview", { title: e.target.value })} className={F} placeholder="Ce que nous avons accompli" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Lbl>Texte du bouton "Voir tout"</Lbl>
                <input type="text" value={s.portfolio_preview.button_label}
                  onChange={e => patch("portfolio_preview", { button_label: e.target.value })} className={F} placeholder="Voir tout le portfolio" />
              </div>
              <div>
                <Lbl>Lien du bouton</Lbl>
                <input type="text" value={s.portfolio_preview.button_link}
                  onChange={e => patch("portfolio_preview", { button_link: e.target.value })} className={F} placeholder="/portfolio" />
              </div>
            </div>
          </Card>
          <Card title="Gérer les projets" noPad>
            <SectionRow
              icon={<FolderOpen size={16} />}
              href="/admin/portfolio"
              title="Portfolio"
              note="Les 3 derniers projets publiés s'affichent automatiquement"
            />
          </Card>
        </div>
      )}

      {/* ════════════════════════════════════════════
          CTA FINAL
         ════════════════════════════════════════════ */}
      {tab === "cta" && (
        <div className="space-y-4">
          <Card title="Affichage">
            <Toggle checked={s.cta_bottom.enabled} onChange={v => patch("cta_bottom", { enabled: v })} label="Afficher le bloc CTA final" />
          </Card>
          <Card title="Contenu">
            <div>
              <Lbl>Texte d'accroche (eyebrow, au-dessus du titre)</Lbl>
              <input type="text" value={s.cta_bottom.eyebrow ?? ""}
                onChange={e => patch("cta_bottom", { eyebrow: e.target.value })}
                className={F} placeholder="Passez à l'action" />
            </div>
            <div>
              <Lbl>Titre</Lbl>
              <input type="text" value={s.cta_bottom.title}
                onChange={e => patch("cta_bottom", { title: e.target.value })}
                className={F} placeholder="Prêt à lancer votre projet ?" />
            </div>
            <div>
              <Lbl>Description</Lbl>
              <textarea value={s.cta_bottom.description}
                onChange={e => patch("cta_bottom", { description: e.target.value })}
                rows={3} className={TA} placeholder="Contactez-nous…" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Lbl>Texte du bouton</Lbl>
                <input type="text" value={s.cta_bottom.button_label}
                  onChange={e => patch("cta_bottom", { button_label: e.target.value })}
                  className={F} placeholder="Démarrer mon projet" />
              </div>
              <div>
                <Lbl>Lien du bouton</Lbl>
                <input type="text" value={s.cta_bottom.button_link}
                  onChange={e => patch("cta_bottom", { button_link: e.target.value })}
                  className={F} placeholder="/contact" />
              </div>
            </div>
          </Card>

          {/* Aperçu live */}
          <div className="relative overflow-hidden rounded-2xl px-8 py-10 text-center"
            style={{ background: "linear-gradient(135deg, var(--royal-blue) 0%, color-mix(in oklch, var(--royal-blue) 72%, #000) 100%)" }}>
            <p className="text-[10px] uppercase tracking-widest text-white/40 mb-3">
              {s.cta_bottom.eyebrow || "eyebrow…"}
            </p>
            <h2 className="text-xl font-bold text-white mb-2">
              {s.cta_bottom.title || "Titre…"}
            </h2>
            <p className="text-white/50 text-sm max-w-sm mx-auto mb-5">
              {s.cta_bottom.description || "Description…"}
            </p>
            <span className="inline-block px-6 py-2.5 rounded-full bg-white font-semibold text-sm"
              style={{ color: "var(--royal-blue)" }}>
              {s.cta_bottom.button_label || "Bouton"}
            </span>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════
          TÉMOIGNAGES
         ════════════════════════════════════════════ */}
      {tab === "testimonials" && (
        <div className="space-y-4">
          <Card title="Affichage & titres">
            <Toggle
              checked={s.testimonials_section.enabled}
              onChange={v => patch("testimonials_section", { enabled: v })}
              label="Afficher la section témoignages"
            />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Lbl>Étiquette (eyebrow)</Lbl>
                <input type="text" value={s.testimonials_section.label}
                  onChange={e => patch("testimonials_section", { label: e.target.value })}
                  className={F} placeholder="Ils nous font confiance" />
              </div>
              <div>
                <Lbl>Titre de section</Lbl>
                <input type="text" value={s.testimonials_section.title}
                  onChange={e => patch("testimonials_section", { title: e.target.value })}
                  className={F} placeholder="Témoignages clients" />
              </div>
            </div>
          </Card>

          <Card title="Gérer les témoignages" noPad>
            <SectionRow
              icon={<MessageSquare size={16} />}
              href="/admin/testimonials"
              title="Témoignages clients"
              note="Ajouter, modifier, noter et activer/désactiver chaque avis"
            />
          </Card>

          <div className="p-4 rounded-xl border text-sm text-[color-mix(in_oklch,var(--foreground)_55%,transparent)]"
            style={{ background: "color-mix(in oklch, var(--royal-blue) 5%, transparent)", borderColor: "color-mix(in oklch, var(--royal-blue) 15%, transparent)" }}>
            💡 Les témoignages actifs s'affichent automatiquement dans un carrousel. Gérez leur contenu depuis la page dédiée.
          </div>
        </div>
      )}

      {/* ── Bouton save flottant ── */}
      <div className="sticky bottom-4 flex justify-end pt-4 border-t border-[color-mix(in_oklch,var(--foreground)_8%,transparent)]">
        <button onClick={save} disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white font-medium transition-all shadow-xl disabled:opacity-60"
          style={{ background: saved ? "#16a34a" : "var(--royal-blue)" }}>
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          {saving ? "Sauvegarde…" : saved ? "✓ Enregistré !" : "Enregistrer les modifications"}
        </button>
      </div>
    </div>
  );
}

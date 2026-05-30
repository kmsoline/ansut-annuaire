"use client";
import { useState, useEffect, useMemo } from "react";
import { Search as SearchIcon, Save, Loader2, Check, AlertCircle, ExternalLink, Globe } from "lucide-react";

interface Meta { id: string; path: string; title: string; description: string; keywords?: string[]; ogImage?: string; ogTitle?: string; ogDescription?: string; updatedAt: string; }

const PAGES = [
  { path: "/",            label: "Accueil",    icon: "🏠" },
  { path: "/services",   label: "Services",   icon: "⚙️" },
  { path: "/portfolio",  label: "Portfolio",  icon: "🎨" },
  { path: "/blog",       label: "Blog",       icon: "📝" },
  { path: "/about",      label: "À propos",   icon: "ℹ️" },
  { path: "/contact",    label: "Contact",    icon: "📧" },
  { path: "/faq",        label: "FAQ",        icon: "❓" },
  { path: "/afrinomade", label: "AfriNomade", icon: "🌴" },
];

const CARD = { background: "color-mix(in oklch, var(--foreground) 2%, transparent)", border: "1px solid color-mix(in oklch, var(--foreground) 8%, transparent)" };
const F = "w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[var(--royal-blue)] transition-all border border-[color-mix(in_oklch,var(--foreground)_10%,transparent)] bg-[color-mix(in_oklch,var(--foreground)_3%,transparent)]";

function CharCount({ val, max, warn = max * 0.85 }: { val: string; max: number; warn?: number }) {
  const len = val.length;
  const color = len > max ? "#ef4444" : len > warn ? "#f59e0b" : "#22c55e";
  return (
    <span className="text-[11px] font-semibold tabular-nums" style={{ color }}>
      {len}/{max}
    </span>
  );
}

function Toast({ ok, msg, onDone }: { ok: boolean; msg: string; onDone: () => void }) {
  useEffect(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t); }, [onDone]);
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-3 rounded-full text-sm font-semibold text-white shadow-xl"
      style={{ background: ok ? "var(--royal-blue)" : "rgb(239,68,68)" }}>
      {ok ? <Check size={16} /> : <AlertCircle size={16} />}{msg}
    </div>
  );
}

export default function AdminMetadata() {
  const [metas, setMetas] = useState<Meta[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [active, setActive] = useState("/");
  const [toast, setToast] = useState<{ ok: boolean; msg: string } | null>(null);

  useEffect(() => {
    fetch("/api/admin/metadata").then(r => r.ok ? r.json() : []).then(d => {
      const merged = PAGES.map(p => {
        const found = Array.isArray(d) ? d.find((m: Meta) => m.path === p.path) : null;
        return found || { id: p.path, path: p.path, title: p.label, description: "", keywords: [], ogImage: "", ogTitle: "", ogDescription: "", updatedAt: "" };
      });
      setMetas(merged);
    }).catch(() => { setMetas(PAGES.map(p => ({ id: p.path, path: p.path, title: p.label, description: "", keywords: [], ogImage: "", ogTitle: "", ogDescription: "", updatedAt: "" }))); }).finally(() => setLoading(false));
  }, []);

  const current = useMemo(() => metas.find(m => m.path === active), [metas, active]);
  const update = (field: keyof Meta, val: unknown) => setMetas(prev => prev.map(m => m.path === active ? { ...m, [field]: val } : m));
  const pageMeta = PAGES.find(p => p.path === active);

  const save = async () => {
    if (!current) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/metadata", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...current, updatedAt: new Date().toISOString() }) });
      setToast(res.ok ? { ok: true, msg: "SEO enregistré" } : { ok: false, msg: "Erreur" });
      if (res.ok) setMetas(prev => prev.map(m => m.path === active ? { ...m, updatedAt: new Date().toISOString() } : m));
    } catch { setToast({ ok: false, msg: "Erreur de connexion" }); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 size={24} className="animate-spin text-[var(--royal-blue)]" /></div>;

  return (
    <div className="space-y-5 max-w-4xl">
      {toast && <Toast ok={toast.ok} msg={toast.msg} onDone={() => setToast(null)} />}

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "color-mix(in oklch, var(--royal-blue) 12%, transparent)" }}>
              <SearchIcon size={16} strokeWidth={2} style={{ color: "var(--royal-blue)" }} />
            </div>
            <h1 className="text-2xl font-bold">SEO & Métadonnées</h1>
          </div>
          <p className="text-sm ml-12" style={{ color: "color-mix(in oklch, var(--foreground) 50%, transparent)" }}>
            Titres, descriptions et Open Graph pour chaque page
          </p>
        </div>
        <button onClick={save} disabled={saving}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:scale-105 disabled:opacity-60"
          style={{ background: "var(--royal-blue)" }}>
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          {saving ? "Enregistrement…" : "Enregistrer"}
        </button>
      </div>

      <div className="grid lg:grid-cols-[240px_1fr] gap-5">
        {/* Sidebar pages */}
        <div className="rounded-2xl overflow-hidden" style={CARD}>
          {PAGES.map(p => {
            const m = metas.find(x => x.path === p.path);
            const isOk = m?.title && m?.description;
            return (
              <button key={p.path} onClick={() => setActive(p.path)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left transition-all hover:bg-[color-mix(in_oklch,var(--foreground)_3%,transparent)]"
                style={{
                  background: active === p.path ? "color-mix(in oklch, var(--royal-blue) 8%, transparent)" : "transparent",
                  borderLeft: active === p.path ? "2px solid var(--royal-blue)" : "2px solid transparent",
                }}>
                <span className="text-lg">{p.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{p.label}</p>
                  <p className="text-[10px] truncate" style={{ color: "color-mix(in oklch, var(--foreground) 42%, transparent)" }}>{p.path}</p>
                </div>
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: isOk ? "#22c55e" : "color-mix(in oklch, var(--foreground) 20%, transparent)" }} />
              </button>
            );
          })}
        </div>

        {/* Formulaire */}
        {current && (
          <div className="space-y-5">
            {/* Google Preview */}
            <div className="rounded-2xl p-5" style={CARD}>
              <div className="flex items-center gap-2 mb-4">
                <Globe size={14} style={{ color: "var(--royal-blue)" }} />
                <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "color-mix(in oklch, var(--foreground) 45%, transparent)" }}>Aperçu Google</span>
              </div>
              <div className="rounded-xl p-4" style={{ background: "color-mix(in oklch, var(--foreground) 3%, transparent)" }}>
                <p className="text-xs mb-1 truncate" style={{ color: "#22a67e" }}>dimegroupe.ci{active}</p>
                <p className="text-base font-medium mb-1 truncate" style={{ color: "#1a73e8" }}>
                  {current.title || `Titre — ${pageMeta?.label}`}
                </p>
                <p className="text-sm leading-relaxed line-clamp-2" style={{ color: "color-mix(in oklch, var(--foreground) 62%, transparent)" }}>
                  {current.description || "Aucune description définie…"}
                </p>
              </div>
            </div>

            {/* Champs SEO */}
            <div className="rounded-2xl p-5 space-y-4" style={CARD}>
              <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "color-mix(in oklch, var(--foreground) 40%, transparent)" }}>SEO principal</p>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold" style={{ color: "color-mix(in oklch, var(--foreground) 65%, transparent)" }}>Titre de la page</label>
                  <CharCount val={current.title} max={60} />
                </div>
                <input value={current.title} onChange={e => update("title", e.target.value)} className={F} placeholder="Titre accrocheur — max 60 caractères" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold" style={{ color: "color-mix(in oklch, var(--foreground) 65%, transparent)" }}>Meta description</label>
                  <CharCount val={current.description} max={160} />
                </div>
                <textarea value={current.description} onChange={e => update("description", e.target.value)} rows={3} className={F + " resize-none"}
                  placeholder="Description pour les moteurs de recherche — 120 à 160 caractères idéalement" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "color-mix(in oklch, var(--foreground) 65%, transparent)" }}>Mots-clés (séparés par virgules)</label>
                <input value={(current.keywords || []).join(", ")} onChange={e => update("keywords", e.target.value.split(",").map(k => k.trim()).filter(Boolean))}
                  className={F} placeholder="mot-clé 1, mot-clé 2, mot-clé 3" />
              </div>
            </div>

            {/* Open Graph */}
            <div className="rounded-2xl p-5 space-y-4" style={CARD}>
              <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "color-mix(in oklch, var(--foreground) 40%, transparent)" }}>Open Graph — réseaux sociaux</p>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "color-mix(in oklch, var(--foreground) 65%, transparent)" }}>Image OG (URL)</label>
                <input value={current.ogImage || ""} onChange={e => update("ogImage", e.target.value)} className={F} placeholder="https://dimegroupe.ci/og-image.jpg — 1200×630px recommandé" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold" style={{ color: "color-mix(in oklch, var(--foreground) 65%, transparent)" }}>Titre OG</label>
                  <span className="text-[11px]" style={{ color: "color-mix(in oklch, var(--foreground) 38%, transparent)" }}>Si vide : titre SEO utilisé</span>
                </div>
                <input value={current.ogTitle || ""} onChange={e => update("ogTitle", e.target.value)} className={F} placeholder="Titre pour Facebook, LinkedIn…" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold" style={{ color: "color-mix(in oklch, var(--foreground) 65%, transparent)" }}>Description OG</label>
                  <span className="text-[11px]" style={{ color: "color-mix(in oklch, var(--foreground) 38%, transparent)" }}>Si vide : meta description utilisée</span>
                </div>
                <textarea value={current.ogDescription || ""} onChange={e => update("ogDescription", e.target.value)} rows={2} className={F + " resize-none"}
                  placeholder="Description pour les partages sur les réseaux sociaux" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

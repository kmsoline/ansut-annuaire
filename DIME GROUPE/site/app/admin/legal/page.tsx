"use client";
import { useState, useEffect } from "react";
import { ScrollText, Save, Loader2, Check, AlertCircle, ExternalLink } from "lucide-react";

interface LegalPage { id: string; slug: string; title: string; content: string; updatedAt: string; }

const PAGES = [
  { slug: "mentions-legales",  label: "Mentions légales",             icon: "⚖️",  url: "/legal/mentions-legales" },
  { slug: "cgv",               label: "CGV",                          icon: "📋",  url: "/legal/cgv" },
  { slug: "confidentialite",   label: "Politique de confidentialité", icon: "🔒",  url: "/legal/confidentialite" },
];

const CARD = { background: "color-mix(in oklch, var(--foreground) 2%, transparent)", border: "1px solid color-mix(in oklch, var(--foreground) 8%, transparent)" };
const F = "w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[var(--royal-blue)] transition-all border border-[color-mix(in_oklch,var(--foreground)_10%,transparent)] bg-[color-mix(in_oklch,var(--foreground)_3%,transparent)]";

function Toast({ ok, msg, onDone }: { ok: boolean; msg: string; onDone: () => void }) {
  useEffect(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t); }, [onDone]);
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-3 rounded-full text-sm font-semibold text-white shadow-xl"
      style={{ background: ok ? "var(--royal-blue)" : "rgb(239,68,68)" }}>
      {ok ? <Check size={16} /> : <AlertCircle size={16} />}{msg}
    </div>
  );
}

export default function AdminLegal() {
  const [pages, setPages] = useState<LegalPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [active, setActive] = useState("mentions-legales");
  const [toast, setToast] = useState<{ ok: boolean; msg: string } | null>(null);

  useEffect(() => {
    fetch("/api/admin/legal").then(r => r.ok ? r.json() : []).then(d => {
      if (d && Array.isArray(d) && d.length > 0) { setPages(d); }
      else { setPages(PAGES.map(p => ({ id: p.slug, slug: p.slug, title: p.label, content: "", updatedAt: new Date().toISOString() }))); }
    }).catch(() => { setPages(PAGES.map(p => ({ id: p.slug, slug: p.slug, title: p.label, content: "", updatedAt: new Date().toISOString() }))); }).finally(() => setLoading(false));
  }, []);

  const current = pages.find(p => p.slug === active) || pages[0];
  const update = (field: string, val: string) => setPages(prev => prev.map(p => p.slug === active ? { ...p, [field]: val } : p));

  const save = async () => {
    if (!current) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/legal", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...current, updatedAt: new Date().toISOString() }) });
      setToast(res.ok ? { ok: true, msg: "Page enregistrée" } : { ok: false, msg: "Erreur enregistrement" });
    } catch { setToast({ ok: false, msg: "Erreur de connexion" }); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 size={24} className="animate-spin text-[var(--royal-blue)]" /></div>;

  const meta = PAGES.find(p => p.slug === active);

  return (
    <div className="space-y-5 max-w-4xl">
      {toast && <Toast ok={toast.ok} msg={toast.msg} onDone={() => setToast(null)} />}

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "color-mix(in oklch, var(--royal-blue) 12%, transparent)" }}>
              <ScrollText size={16} strokeWidth={2} style={{ color: "var(--royal-blue)" }} />
            </div>
            <h1 className="text-2xl font-bold">Pages légales</h1>
          </div>
          <p className="text-sm ml-12" style={{ color: "color-mix(in oklch, var(--foreground) 50%, transparent)" }}>
            Mentions légales, CGV, politique de confidentialité
          </p>
        </div>
        <div className="flex items-center gap-2">
          {meta && (
            <a href={meta.url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105"
              style={{ border: "1px solid color-mix(in oklch, var(--foreground) 12%, transparent)", color: "color-mix(in oklch, var(--foreground) 65%, transparent)" }}>
              <ExternalLink size={13} /> Voir
            </a>
          )}
          <button onClick={save} disabled={saving}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:scale-105 disabled:opacity-60"
            style={{ background: "var(--royal-blue)" }}>
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {saving ? "Enregistrement…" : "Enregistrer"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl" style={{ background: "color-mix(in oklch, var(--foreground) 5%, transparent)" }}>
        {PAGES.map(p => (
          <button key={p.slug} onClick={() => setActive(p.slug)}
            className="flex items-center gap-2 flex-1 justify-center py-2.5 rounded-lg text-xs font-semibold transition-all"
            style={{
              background: active === p.slug ? "var(--background)" : "transparent",
              color: active === p.slug ? "var(--foreground)" : "color-mix(in oklch, var(--foreground) 55%, transparent)",
              boxShadow: active === p.slug ? "0 1px 4px rgba(0,0,0,0.12)" : "none",
            }}>
            <span>{p.icon}</span>
            <span className="hidden sm:inline">{p.label}</span>
          </button>
        ))}
      </div>

      {/* Éditeur */}
      {current && (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "color-mix(in oklch, var(--foreground) 60%, transparent)" }}>Titre de la page</label>
            <input value={current.title} onChange={e => update("title", e.target.value)} className={F} />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold" style={{ color: "color-mix(in oklch, var(--foreground) 60%, transparent)" }}>
                Contenu <span className="font-normal">(HTML supporté)</span>
              </label>
              <span className="text-[11px]" style={{ color: "color-mix(in oklch, var(--foreground) 40%, transparent)" }}>
                {current.content.length} caractères
              </span>
            </div>
            <textarea value={current.content} onChange={e => update("content", e.target.value)} rows={28}
              className={F + " resize-y font-mono text-[13px] leading-relaxed"}
              placeholder={`<h2>Section</h2>\n<p>Contenu de la page ${meta?.label}...</p>`} />
          </div>
          {current.updatedAt && (
            <p className="text-[11px]" style={{ color: "color-mix(in oklch, var(--foreground) 38%, transparent)" }}>
              Dernière mise à jour : {new Date(current.updatedAt).toLocaleString("fr-FR")}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

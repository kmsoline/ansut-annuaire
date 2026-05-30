"use client";
import { useState, useEffect } from "react";
import { Info, Save, Loader2, Check, AlertCircle, ChevronDown, Eye, EyeOff, Trash2, Plus } from "lucide-react";

interface AboutSection { id: string; section: string; title?: string; subtitle?: string; content: Record<string, unknown>; order: number; active: boolean; }

const SECTION_META: Record<string, { label: string; icon: string; color: string }> = {
  intro:           { label: "Introduction",          icon: "🏠", color: "var(--royal-blue)" },
  history:         { label: "Notre Histoire",        icon: "📅", color: "var(--gold-premium)" },
  mission:         { label: "Notre Mission",         icon: "🎯", color: "var(--turquoise)" },
  values:          { label: "Nos Valeurs",           icon: "💎", color: "#8b5cf6" },
  team:            { label: "Notre Équipe",          icon: "👥", color: "#16a34a" },
  "why-choose-us": { label: "Pourquoi nous choisir", icon: "✨", color: "var(--gold-premium)" },
};

const CARD = { background: "color-mix(in oklch, var(--foreground) 2%, transparent)", border: "1px solid color-mix(in oklch, var(--foreground) 8%, transparent)" };
const F = "w-full px-3 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[var(--royal-blue)] transition-all border border-[color-mix(in_oklch,var(--foreground)_10%,transparent)] bg-[color-mix(in_oklch,var(--foreground)_3%,transparent)]";
const TA = F + " resize-none";
const LBL = "block text-xs font-semibold mb-1.5";
const LBST = { color: "color-mix(in oklch, var(--foreground) 60%, transparent)" };

function Toast({ ok, msg, onDone }: { ok: boolean; msg: string; onDone: () => void }) {
  useEffect(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t); }, [onDone]);
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-3 rounded-full text-sm font-semibold text-white shadow-xl"
      style={{ background: ok ? "var(--royal-blue)" : "rgb(239,68,68)" }}>
      {ok ? <Check size={16} /> : <AlertCircle size={16} />}{msg}
    </div>
  );
}

// ── Éditeurs spécialisés par section ──────────────────────────────────────

function SectionEditor({ section, onChange }: { section: AboutSection; onChange: (s: AboutSection) => void }) {
  const c = section.content;
  const set = (field: string, val: unknown) => onChange({ ...section, content: { ...c, [field]: val } });
  const setArr = (field: string, idx: number, subField: string, val: string) => {
    const arr = [...((c[field] as Record<string,unknown>[] | undefined) || [])];
    arr[idx] = { ...arr[idx], [subField]: val };
    set(field, arr);
  };
  const addItem = (field: string, template: Record<string,string>) => set(field, [...((c[field] as unknown[] | undefined) || []), template]);
  const delItem = (field: string, idx: number) => set(field, ((c[field] as unknown[]) || []).filter((_, i) => i !== idx));

  switch (section.section) {
    case "intro": return (
      <div className="space-y-4">
        <div><label className={LBL} style={LBST}>Description courte</label><input value={(c.description as string) || ""} onChange={e => set("description", e.target.value)} className={F} /></div>
        <div><label className={LBL} style={LBST}>Texte principal</label><textarea value={(c.text as string) || ""} onChange={e => set("text", e.target.value)} rows={4} className={TA} /></div>
        <div><label className={LBL} style={LBST}>Image (URL)</label><input value={(c.image as string) || ""} onChange={e => set("image", e.target.value)} className={F} placeholder="/images/hero.jpg" /></div>
      </div>
    );

    case "history": return (
      <div className="space-y-5">
        <div className="space-y-2">
          <label className={LBL} style={LBST}>Paragraphes</label>
          {((c.paragraphs as string[]) || []).map((p, i) => (
            <div key={i} className="flex gap-2">
              <textarea value={p} onChange={e => { const arr = [...((c.paragraphs as string[]) || [])]; arr[i] = e.target.value; set("paragraphs", arr); }} rows={2} className={TA + " flex-1"} />
              <button onClick={() => { const arr = ((c.paragraphs as string[]) || []).filter((_, j) => j !== i); set("paragraphs", arr); }} className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-1" style={{ background: "color-mix(in oklch, #ef4444 10%, transparent)" }}><Trash2 size={12} style={{ color: "#ef4444" }} /></button>
            </div>
          ))}
          <button onClick={() => set("paragraphs", [...((c.paragraphs as string[]) || []), ""])} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ background: "color-mix(in oklch, var(--royal-blue) 8%, transparent)", color: "var(--royal-blue)" }}><Plus size={11} /> Ajouter un paragraphe</button>
        </div>
        <div className="space-y-3">
          <label className={LBL} style={LBST}>Ligne du temps</label>
          {((c.timeline as { year: string; text: string }[]) || []).map((item, i) => (
            <div key={i} className="flex gap-2 items-start">
              <input value={item.year} onChange={e => setArr("timeline", i, "year", e.target.value)} className={F + " w-24 shrink-0"} placeholder="2024" />
              <input value={item.text} onChange={e => setArr("timeline", i, "text", e.target.value)} className={F + " flex-1"} placeholder="Événement important…" />
              <button onClick={() => delItem("timeline", i)} className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-1" style={{ background: "color-mix(in oklch, #ef4444 10%, transparent)" }}><Trash2 size={12} style={{ color: "#ef4444" }} /></button>
            </div>
          ))}
          <button onClick={() => addItem("timeline", { year: "", text: "" })} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ background: "color-mix(in oklch, var(--royal-blue) 8%, transparent)", color: "var(--royal-blue)" }}><Plus size={11} /> Ajouter</button>
        </div>
      </div>
    );

    case "mission": return (
      <div className="space-y-4">
        <div><label className={LBL} style={LBST}>Texte de mission</label><textarea value={(c.text as string) || ""} onChange={e => set("text", e.target.value)} rows={3} className={TA} /></div>
        <div className="space-y-3">
          <label className={LBL} style={LBST}>Piliers ({((c.pillars as unknown[]) || []).length})</label>
          {((c.pillars as { title: string; description: string }[]) || []).map((item, i) => (
            <div key={i} className="rounded-xl p-3 space-y-2" style={{ background: "color-mix(in oklch, var(--foreground) 3%, transparent)" }}>
              <div className="flex gap-2">
                <input value={item.title} onChange={e => setArr("pillars", i, "title", e.target.value)} className={F + " flex-1"} placeholder="Titre du pilier" />
                <button onClick={() => delItem("pillars", i)} className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "color-mix(in oklch, #ef4444 10%, transparent)" }}><Trash2 size={12} style={{ color: "#ef4444" }} /></button>
              </div>
              <textarea value={item.description} onChange={e => setArr("pillars", i, "description", e.target.value)} rows={2} className={TA} placeholder="Description…" />
            </div>
          ))}
          <button onClick={() => addItem("pillars", { title: "", description: "" })} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ background: "color-mix(in oklch, var(--royal-blue) 8%, transparent)", color: "var(--royal-blue)" }}><Plus size={11} /> Ajouter</button>
        </div>
      </div>
    );

    case "values": return (
      <div className="space-y-3">
        <label className={LBL} style={LBST}>Valeurs ({((c.values as unknown[]) || []).length})</label>
        {((c.values as { title: string; description: string; icon: string }[]) || []).map((item, i) => (
          <div key={i} className="rounded-xl p-3 space-y-2" style={{ background: "color-mix(in oklch, var(--foreground) 3%, transparent)" }}>
            <div className="flex gap-2">
              <input value={item.icon} onChange={e => setArr("values", i, "icon", e.target.value)} className={F + " w-16 text-center text-xl"} placeholder="🎯" />
              <input value={item.title} onChange={e => setArr("values", i, "title", e.target.value)} className={F + " flex-1"} placeholder="Nom de la valeur" />
              <button onClick={() => delItem("values", i)} className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "color-mix(in oklch, #ef4444 10%, transparent)" }}><Trash2 size={12} style={{ color: "#ef4444" }} /></button>
            </div>
            <textarea value={item.description} onChange={e => setArr("values", i, "description", e.target.value)} rows={2} className={TA} placeholder="Description de la valeur…" />
          </div>
        ))}
        <button onClick={() => addItem("values", { icon: "✨", title: "", description: "" })} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ background: "color-mix(in oklch, var(--royal-blue) 8%, transparent)", color: "var(--royal-blue)" }}><Plus size={11} /> Ajouter une valeur</button>
      </div>
    );

    case "team": return (
      <div className="space-y-4">
        <div><label className={LBL} style={LBST}>Description de l'équipe</label><textarea value={(c.description as string) || ""} onChange={e => set("description", e.target.value)} rows={3} className={TA} /></div>
        <div className="space-y-3">
          <label className={LBL} style={LBST}>Équipes</label>
          {((c.teams as { role: string; count: string; img: string }[]) || []).map((item, i) => (
            <div key={i} className="rounded-xl p-3 space-y-2" style={{ background: "color-mix(in oklch, var(--foreground) 3%, transparent)" }}>
              <div className="flex gap-2">
                <input value={item.role} onChange={e => setArr("teams", i, "role", e.target.value)} className={F + " flex-1"} placeholder="Rôle (ex: Développement)" />
                <input value={item.count} onChange={e => setArr("teams", i, "count", e.target.value)} className={F + " flex-1"} placeholder="Description (ex: Équipe technique)" />
                <button onClick={() => delItem("teams", i)} className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "color-mix(in oklch, #ef4444 10%, transparent)" }}><Trash2 size={12} style={{ color: "#ef4444" }} /></button>
              </div>
              <input value={item.img} onChange={e => setArr("teams", i, "img", e.target.value)} className={F} placeholder="/team/team-dev.jpg" />
            </div>
          ))}
          <button onClick={() => addItem("teams", { role: "", count: "", img: "" })} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ background: "color-mix(in oklch, var(--royal-blue) 8%, transparent)", color: "var(--royal-blue)" }}><Plus size={11} /> Ajouter</button>
        </div>
      </div>
    );

    case "why-choose-us": return (
      <div className="space-y-3">
        <label className={LBL} style={LBST}>Avantages ({((c.advantages as unknown[]) || []).length})</label>
        {((c.advantages as { title: string; description: string; icon: string }[]) || []).map((item, i) => (
          <div key={i} className="rounded-xl p-3 space-y-2" style={{ background: "color-mix(in oklch, var(--foreground) 3%, transparent)" }}>
            <div className="flex gap-2">
              <input value={item.icon} onChange={e => setArr("advantages", i, "icon", e.target.value)} className={F + " w-16 text-center text-xl"} placeholder="🎨" />
              <input value={item.title} onChange={e => setArr("advantages", i, "title", e.target.value)} className={F + " flex-1"} placeholder="Avantage" />
              <button onClick={() => delItem("advantages", i)} className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "color-mix(in oklch, #ef4444 10%, transparent)" }}><Trash2 size={12} style={{ color: "#ef4444" }} /></button>
            </div>
            <textarea value={item.description} onChange={e => setArr("advantages", i, "description", e.target.value)} rows={2} className={TA} placeholder="Description…" />
          </div>
        ))}
        <button onClick={() => addItem("advantages", { icon: "✨", title: "", description: "" })} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ background: "color-mix(in oklch, var(--royal-blue) 8%, transparent)", color: "var(--royal-blue)" }}><Plus size={11} /> Ajouter</button>
      </div>
    );

    default: return (
      <div>
        <label className={LBL} style={LBST}>Contenu (JSON)</label>
        <textarea value={JSON.stringify(c, null, 2)} onChange={e => { try { onChange({ ...section, content: JSON.parse(e.target.value) }); } catch {} }}
          rows={10} className={TA + " font-mono text-[12px]"} />
      </div>
    );
  }
}

// ── Page principale ───────────────────────────────────────────────────────

export default function AdminAbout() {
  const [sections, setSections] = useState<AboutSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ ok: boolean; msg: string } | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("/api/admin/about").then(r => r.ok ? r.json() : []).then(d => {
      if (Array.isArray(d)) { setSections(d); setExpanded(new Set(d.map((s: AboutSection) => s.id))); }
    }).catch(() => []).finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/about", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(sections) });
      setToast(res.ok ? { ok: true, msg: "Contenu enregistré" } : { ok: false, msg: "Erreur enregistrement" });
    } catch { setToast({ ok: false, msg: "Erreur de connexion" }); }
    finally { setSaving(false); }
  };

  const update = (updated: AboutSection) => setSections(prev => prev.map(s => s.id === updated.id ? updated : s));
  const toggle = (id: string) => setExpanded(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 size={24} className="animate-spin text-[var(--royal-blue)]" /></div>;

  const sorted = [...sections].sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <div className="space-y-5 max-w-3xl">
      {toast && <Toast ok={toast.ok} msg={toast.msg} onDone={() => setToast(null)} />}

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "color-mix(in oklch, var(--royal-blue) 12%, transparent)" }}>
              <Info size={16} strokeWidth={2} style={{ color: "var(--royal-blue)" }} />
            </div>
            <h1 className="text-2xl font-bold">Page À propos</h1>
          </div>
          <p className="text-sm ml-12" style={{ color: "color-mix(in oklch, var(--foreground) 50%, transparent)" }}>
            {sections.length} section{sections.length > 1 ? "s" : ""} · {sections.filter(s => s.active).length} active{sections.filter(s => s.active).length > 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a href="/about" target="_blank" rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105"
            style={{ border: "1px solid color-mix(in oklch, var(--foreground) 12%, transparent)", color: "color-mix(in oklch, var(--foreground) 65%, transparent)" }}>
            Voir la page
          </a>
          <button onClick={save} disabled={saving}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:scale-105 disabled:opacity-60"
            style={{ background: "var(--royal-blue)" }}>
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {saving ? "Enregistrement…" : "Enregistrer"}
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {sorted.map(section => {
          const meta = SECTION_META[section.section];
          const color = meta?.color || "var(--royal-blue)";
          const isOpen = expanded.has(section.id);
          return (
            <div key={section.id} className="rounded-2xl overflow-hidden" style={CARD}>
              {/* Header section */}
              <button className="w-full flex items-center gap-3 px-5 py-4 transition-all hover:bg-[color-mix(in_oklch,var(--foreground)_2%,transparent)] text-left"
                onClick={() => toggle(section.id)}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-lg" style={{ background: `color-mix(in oklch, ${color} 12%, transparent)` }}>
                  {meta?.icon || "📄"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold">{section.title || meta?.label || section.section}</p>
                  <p className="text-[11px]" style={{ color: "color-mix(in oklch, var(--foreground) 45%, transparent)" }}>
                    {section.subtitle || meta?.label || section.section}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={e => { e.stopPropagation(); update({ ...section, active: !section.active }); }}
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: section.active ? "color-mix(in oklch, #22c55e 10%, transparent)" : "color-mix(in oklch, var(--foreground) 7%, transparent)" }}>
                    {section.active ? <Eye size={13} style={{ color: "#16a34a" }} /> : <EyeOff size={13} style={{ color: "color-mix(in oklch, var(--foreground) 35%, transparent)" }} />}
                  </button>
                  <ChevronDown size={15} className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                    style={{ color: "color-mix(in oklch, var(--foreground) 38%, transparent)" }} />
                </div>
              </button>

              {/* Corps éditeur */}
              {isOpen && (
                <div className="px-5 pb-5 border-t" style={{ borderColor: "color-mix(in oklch, var(--foreground) 6%, transparent)" }}>
                  <div className="grid sm:grid-cols-2 gap-3 mt-4 mb-4">
                    <div>
                      <label className={LBL} style={LBST}>Titre de la section</label>
                      <input value={section.title || ""} onChange={e => update({ ...section, title: e.target.value })} className={F} placeholder="Titre affiché" />
                    </div>
                    <div>
                      <label className={LBL} style={LBST}>Sous-titre / eyebrow</label>
                      <input value={section.subtitle || ""} onChange={e => update({ ...section, subtitle: e.target.value })} className={F} placeholder="Sous-titre" />
                    </div>
                  </div>
                  <SectionEditor section={section} onChange={update} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

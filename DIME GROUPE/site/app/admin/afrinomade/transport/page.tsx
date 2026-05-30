"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft, Plus, Trash2, Car, Eye, EyeOff, Star,
  Check, Search, Filter, RefreshCw, ChevronDown,
} from "lucide-react";
import ViewModeToggle, { type ViewMode } from "@/app/components/admin/ViewModeToggle";
import { useViewMode } from "@/lib/use-view-mode";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Transport {
  id: string;
  title: string;
  description: string;
  price: string;
  details: string[];
  popular: boolean;
  icon_name: string;
  active: boolean;
  sort_order: number;
}

type SaveState = "idle" | "dirty" | "saving" | "saved";

// ─── Constantes ───────────────────────────────────────────────────────────────
const ICONS = ["Plane", "Car", "Bus", "Map", "Bike", "Train", "Ship", "Shield", "Clock", "Phone"];

const ICON_EMOJI: Record<string, string> = {
  Plane: "✈️", Car: "🚗", Bus: "🚌", Map: "🗺️",
  Bike: "🚲", Train: "🚂", Ship: "🚢", Shield: "🛡️", Clock: "⏱️", Phone: "📞",
};

const TURQ = "var(--turquoise)";

// ─── Composants utilitaires ───────────────────────────────────────────────────
function SaveBadge({ state }: { state: SaveState }) {
  if (state === "idle")   return null;
  if (state === "dirty")  return <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse flex-shrink-0" />;
  if (state === "saving") return <RefreshCw size={12} className="animate-spin opacity-60 flex-shrink-0" />;
  return <Check size={12} className="text-emerald-400 flex-shrink-0" />;
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-[9px] font-bold uppercase tracking-[0.12em] mb-1 block"
      style={{ color: "color-mix(in oklch, var(--turquoise) 80%, var(--foreground))" }}>
      {children}
    </label>
  );
}

function SectionDivider({ label }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 py-0.5">
      {label && <span className="text-[9px] uppercase tracking-widest font-semibold" style={{ color: TURQ }}>{label}</span>}
      <div className="flex-1 border-t" style={{ borderColor: "color-mix(in oklch, var(--turquoise) 12%, transparent)" }} />
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────
export default function AdminTransport() {
  const [items, setItems]       = useState<Transport[]>([]);
  const [loading, setLoading]   = useState(true);
  const [viewMode, setViewMode] = useViewMode("afri-transport", "cards");
  const [msg, setMsg]           = useState("");
  const [search, setSearch]     = useState("");
  const [filterActif, setFilterActif] = useState<"all" | "oui" | "non">("all");

  // Auto-save debounced
  const [saveStates, setSaveStates] = useState<Record<string, SaveState>>({});
  const saveTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const itemsRef   = useRef<Transport[]>([]);
  useEffect(() => { itemsRef.current = items; }, [items]);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/afrinomade/transport");
    if (res.ok) setItems(await res.json());
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(""), 3000); };

  const scheduleAutoSave = useCallback((id: string) => {
    clearTimeout(saveTimers.current[id]);
    setSaveStates(prev => ({ ...prev, [id]: "dirty" }));
    saveTimers.current[id] = setTimeout(async () => {
      const item = itemsRef.current.find(i => i.id === id);
      if (!item) return;
      setSaveStates(prev => ({ ...prev, [id]: "saving" }));
      const res = await fetch(`/api/admin/afrinomade/transport/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });
      if (res.ok) {
        setSaveStates(prev => ({ ...prev, [id]: "saved" }));
        setTimeout(() => setSaveStates(prev => ({ ...prev, [id]: "idle" })), 2000);
      } else {
        setSaveStates(prev => ({ ...prev, [id]: "idle" }));
        flash("❌ Erreur de sauvegarde");
      }
    }, 700);
  }, []);

  const update = useCallback((id: string, field: keyof Transport, value: unknown) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i));
    scheduleAutoSave(id);
  }, [scheduleAutoSave]);

  const add = async () => {
    const res = await fetch("/api/admin/afrinomade/transport", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Nouvelle formule", description: "", price: "Sur devis", details: [], popular: false, icon_name: "Car", active: false }),
    });
    if (res.ok) { await load(); flash("✅ Formule ajoutée"); }
  };

  const del = async (id: string) => {
    if (!confirm("Supprimer cette formule ?")) return;
    await fetch(`/api/admin/afrinomade/transport/${id}`, { method: "DELETE" });
    setItems(prev => prev.filter(i => i.id !== id));
    flash("🗑️ Supprimée");
  };

  const filtered = items.filter(i => {
    if (filterActif === "oui" && !i.active)  return false;
    if (filterActif === "non" && i.active)   return false;
    if (search.trim() && !i.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const inputCls   = "w-full rounded-lg px-3 py-2 text-sm bg-transparent border focus:outline-none focus:ring-1 transition-all";
  const inputStyle = { border: "1px solid color-mix(in oklch, var(--turquoise) 20%, transparent)" };
  const CARD_BG    = { background: "color-mix(in oklch, var(--foreground) 3%, transparent)", border: "1px solid color-mix(in oklch, var(--foreground) 8%, transparent)" };

  return (
    <div className="space-y-5 max-w-7xl">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Link href="/admin/afrinomade" className="p-2 rounded-lg hover:bg-white/5 transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <Car size={20} style={{ color: TURQ }} strokeWidth={1.8} />
              <h1 className="text-2xl font-bold">Transport & Voyages</h1>
            </div>
            <p className="text-xs mt-0.5 pl-7" style={{ color: "color-mix(in oklch, var(--foreground) 50%, transparent)" }}>
              {items.length} formule{items.length > 1 ? "s" : ""} · Sauvegarde automatique
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ViewModeToggle mode={viewMode} onChange={setViewMode} />
          <button onClick={add}
            className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white transition-all hover:scale-105 active:scale-95"
            style={{ background: "linear-gradient(135deg, var(--turquoise), color-mix(in oklch, var(--turquoise) 70%, var(--gold-premium)))" }}>
            <Plus size={15} /> Ajouter
          </button>
        </div>
      </div>

      {msg && (
        <div className="rounded-xl px-4 py-3 text-sm font-medium"
          style={{ background: "color-mix(in oklch, var(--turquoise) 10%, var(--background))", border: "1px solid color-mix(in oklch, var(--turquoise) 25%, transparent)" }}>
          {msg}
        </div>
      )}

      {/* ── Filtres ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 opacity-40" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher…"
            className="rounded-lg pl-8 pr-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[--turquoise]"
            style={CARD_BG} />
        </div>
        <div className="flex items-center gap-1">
          <Filter size={12} className="opacity-40" />
          {(["all", "oui", "non"] as const).map(v => (
            <button key={v} onClick={() => setFilterActif(v)}
              className="rounded-full px-3 py-1.5 text-xs font-medium transition-all"
              style={{
                background: filterActif === v ? TURQ : "color-mix(in oklch, var(--foreground) 5%, transparent)",
                color: filterActif === v ? "white" : "color-mix(in oklch, var(--foreground) 60%, transparent)",
              }}>
              {v === "all" ? "Tous" : v === "oui" ? "Actifs" : "Inactifs"}
            </button>
          ))}
        </div>
        <span className="text-xs ml-auto" style={{ color: "color-mix(in oklch, var(--foreground) 40%, transparent)" }}>
          {filtered.length} résultat(s)
        </span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 gap-3 text-sm" style={{ color: "color-mix(in oklch, var(--foreground) 45%, transparent)" }}>
          <RefreshCw size={16} className="animate-spin" /> Chargement…
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-sm opacity-40">Aucune formule trouvée</div>
      ) : viewMode === "list" ? (

        /* ══ MODE LISTE ══════════════════════════════════════════════════════ */
        <div className="rounded-2xl overflow-hidden"
          style={{ border: "1px solid color-mix(in oklch, var(--turquoise) 15%, transparent)" }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "color-mix(in oklch, var(--turquoise) 8%, var(--background))" }}>
                {["Formule", "Prix", "Icône", "Populaire", "Statut", ""].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, idx) => (
                <tr key={item.id} style={{
                  background: idx % 2 === 0 ? "transparent" : "color-mix(in oklch, var(--turquoise) 2.5%, transparent)",
                  borderTop: "1px solid color-mix(in oklch, var(--turquoise) 8%, transparent)",
                }}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <SaveBadge state={saveStates[item.id] ?? "idle"} />
                      <input value={item.title} onChange={e => update(item.id, "title", e.target.value)}
                        className="bg-transparent border-0 outline-none text-sm font-medium w-44" />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs font-semibold whitespace-nowrap" style={{ color: TURQ }}>{item.price}</td>
                  <td className="px-4 py-3 text-xs" style={{ color: "color-mix(in oklch, var(--foreground) 65%, transparent)" }}>
                    {ICON_EMOJI[item.icon_name] ?? "🚗"} {item.icon_name}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => update(item.id, "popular", !item.popular)}
                      style={{ color: item.popular ? "var(--gold-premium)" : "color-mix(in oklch, var(--foreground) 35%, transparent)" }}>
                      <Star size={14} fill={item.popular ? "currentColor" : "none"} />
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => update(item.id, "active", !item.active)}
                      className="transition-colors p-1.5 rounded-lg hover:bg-white/5"
                      style={{ color: item.active ? TURQ : "color-mix(in oklch, var(--foreground) 35%, transparent)" }}>
                      {item.active ? <Eye size={15} /> : <EyeOff size={15} />}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => del(item.id)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-400/10 transition-colors">
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      ) : (

        /* ══ MODE CARTES ═════════════════════════════════════════════════════ */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((item) => {
            const ss = saveStates[item.id] ?? "idle";
            return (
              <div key={item.id} className="rounded-2xl overflow-hidden flex flex-col"
                style={{
                  border: `1.5px solid color-mix(in oklch, var(--turquoise) ${item.popular ? "35" : item.active ? "18" : "8"}%, transparent)`,
                  background: item.popular
                    ? "color-mix(in oklch, var(--turquoise) 5%, var(--background))"
                    : "color-mix(in oklch, var(--background) 80%, transparent)",
                  boxShadow: item.popular ? "0 0 0 1px color-mix(in oklch, var(--turquoise) 10%, transparent)" : "none",
                }}>

                {/* ── Header icône ───────────────────────────────────────────── */}
                <div className="relative px-5 pt-5 pb-3 flex items-start justify-between gap-2"
                  style={{ background: "color-mix(in oklch, var(--turquoise) 6%, transparent)" }}>
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl shrink-0"
                      style={{ background: "color-mix(in oklch, var(--turquoise) 12%, transparent)", border: "1px solid color-mix(in oklch, var(--turquoise) 20%, transparent)" }}>
                      {ICON_EMOJI[item.icon_name] ?? "🚗"}
                    </div>
                    <input value={item.title} onChange={e => update(item.id, "title", e.target.value)}
                      className="bg-transparent font-bold text-sm outline-none border-b border-white/20 focus:border-white/50 pb-0.5 transition-colors flex-1 min-w-0"
                      placeholder="Titre de la formule…" />
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <SaveBadge state={ss} />
                    <button onClick={() => update(item.id, "popular", !item.popular)}
                      className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                      style={{ color: item.popular ? "var(--gold-premium)" : "color-mix(in oklch, var(--foreground) 40%, transparent)" }}
                      title={item.popular ? "Retirer badge populaire" : "Marquer populaire"}>
                      <Star size={13} fill={item.popular ? "currentColor" : "none"} />
                    </button>
                    <button onClick={() => update(item.id, "active", !item.active)}
                      className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold transition-all"
                      style={{
                        background: item.active ? "color-mix(in oklch, var(--turquoise) 85%, transparent)" : "rgba(0,0,0,0.2)",
                        color: "white",
                        border: `1px solid ${item.active ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.12)"}`,
                      }}>
                      {item.active ? <Eye size={10} /> : <EyeOff size={10} />}
                      {item.active ? "Actif" : "Inactif"}
                    </button>
                    <button onClick={() => del(item.id)}
                      className="w-7 h-7 rounded-full flex items-center justify-center text-red-400 hover:bg-red-400/10 transition-colors">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                {/* ── Corps ─────────────────────────────────────────────────── */}
                <div className="p-4 space-y-3 flex-1">

                  <SectionDivider label="Infos" />
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <FieldLabel>Prix</FieldLabel>
                      <input value={item.price} onChange={e => update(item.id, "price", e.target.value)}
                        className={inputCls} style={inputStyle} placeholder="8 000 FCFA" />
                    </div>
                    <div>
                      <FieldLabel>Icône</FieldLabel>
                      <select value={item.icon_name} onChange={e => update(item.id, "icon_name", e.target.value)}
                        className={inputCls} style={inputStyle}>
                        {ICONS.map(ic => <option key={ic} value={ic}>{ICON_EMOJI[ic] ?? ""} {ic}</option>)}
                      </select>
                    </div>
                  </div>

                  <SectionDivider label="Contenu" />
                  <div>
                    <FieldLabel>Description</FieldLabel>
                    <textarea value={item.description} onChange={e => update(item.id, "description", e.target.value)}
                      rows={2} className={inputCls + " resize-none leading-relaxed"} style={inputStyle}
                      placeholder="Décrivez la formule en quelques phrases…" />
                  </div>
                  <div>
                    <FieldLabel>Points clés (séparés par virgule)</FieldLabel>
                    <input
                      value={item.details.join(", ")}
                      onChange={e => update(item.id, "details", e.target.value.split(",").map(d => d.trim()).filter(Boolean))}
                      className={inputCls} style={inputStyle}
                      placeholder="8h à 20h, Véhicule climatisé, Guide inclus" />
                  </div>

                  <details className="group">
                    <summary className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-semibold cursor-pointer select-none py-1"
                      style={{ color: "color-mix(in oklch, var(--foreground) 38%, transparent)" }}>
                      <ChevronDown size={11} className="transition-transform group-open:rotate-180" />
                      Paramètres avancés
                    </summary>
                    <div className="mt-2">
                      <FieldLabel>Ordre d&apos;affichage</FieldLabel>
                      <input type="number" value={item.sort_order}
                        onChange={e => update(item.id, "sort_order", Number(e.target.value))}
                        className={inputCls} style={inputStyle} placeholder="0" />
                    </div>
                  </details>

                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

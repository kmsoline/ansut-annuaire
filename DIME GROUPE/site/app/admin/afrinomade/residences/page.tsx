"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft, Plus, Trash2, Home, Eye, EyeOff,
  Check, Search, Filter, RefreshCw, ChevronDown,
  BedDouble, Bath, Maximize2, MapPin,
} from "lucide-react";
import ViewModeToggle, { type ViewMode } from "@/app/components/admin/ViewModeToggle";
import { useViewMode } from "@/lib/use-view-mode";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Residence {
  id: string;
  slug: string;
  title: string;
  img: string;
  location: string;
  pays: string;
  capacity: string;
  price: string;
  type: string;
  amenities: string[];
  description: string;
  badge: string | null;
  active: boolean;
  sort_order: number;
  nb_chambres: number | null;
  nb_salles_de_bain: number | null;
  surface_m2: number | null;
}

type SaveState = "idle" | "dirty" | "saving" | "saved";

// ─── Constantes ───────────────────────────────────────────────────────────────
const PAYS_LIST = [
  { key: "CI",      label: "Côte d'Ivoire", flag: "🇨🇮" },
  { key: "Sénégal", label: "Sénégal",       flag: "🇸🇳" },
  { key: "Ghana",   label: "Ghana",         flag: "🇬🇭" },
  { key: "Maroc",   label: "Maroc",         flag: "🇲🇦" },
  { key: "Bénin",   label: "Bénin",         flag: "🇧🇯" },
  { key: "Togo",    label: "Togo",          flag: "🇹🇬" },
];

const TYPES = ["Appartement", "Villa", "Chambre d'hôtes", "Studio", "Maison"];
const BADGES = ["", "Premium", "Coup de cœur", "Exclusif", "Nouveauté", "Vue mer"];
const AMENITIES_OPTS = [
  "Wi-Fi", "Clim", "Piscine", "Parking", "Cuisine équipée",
  "Kitchenette", "Petit-déjeuner inclus", "Plage privée",
  "Chef sur demande", "Sécurité 24h", "Hammam", "Climatisation centralisée",
];

const GOLD = "var(--gold-premium)";

function paysInfo(key: string) {
  return PAYS_LIST.find(p => p.key === key) ?? { flag: "🌍", label: key };
}

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
      style={{ color: "color-mix(in oklch, var(--gold-premium) 75%, var(--foreground))" }}>
      {children}
    </label>
  );
}

function SectionDivider({ label }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 py-0.5">
      {label && <span className="text-[9px] uppercase tracking-widest font-semibold" style={{ color: GOLD }}>{label}</span>}
      <div className="flex-1 border-t" style={{ borderColor: "color-mix(in oklch, var(--gold-premium) 12%, transparent)" }} />
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────
export default function AdminResidences() {
  const [items, setItems]      = useState<Residence[]>([]);
  const [loading, setLoading]  = useState(true);
  const [viewMode, setViewMode] = useViewMode("afri-residences", "cards");
  const [msg, setMsg]          = useState("");

  // Filtres
  const [filterPays,  setFilterPays]  = useState("all");
  const [filterType,  setFilterType]  = useState("all");
  const [filterActif, setFilterActif] = useState<"all" | "oui" | "non">("all");
  const [search,      setSearch]      = useState("");

  // Auto-save debounced par carte
  const [saveStates, setSaveStates] = useState<Record<string, SaveState>>({});
  const saveTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const itemsRef   = useRef<Residence[]>([]);
  useEffect(() => { itemsRef.current = items; }, [items]);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/afrinomade/residences");
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
      const res = await fetch(`/api/admin/afrinomade/residences/${id}`, {
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

  const update = useCallback((id: string, field: keyof Residence, value: unknown) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i));
    scheduleAutoSave(id);
  }, [scheduleAutoSave]);

  const add = async () => {
    const paysDefault = filterPays !== "all" ? filterPays : "CI";
    const res = await fetch("/api/admin/afrinomade/residences", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Nouvelle résidence", type: "Appartement",
        pays: paysDefault, location: "", capacity: "", price: "Sur devis",
        amenities: [], description: "", active: false,
      }),
    });
    if (res.ok) { await load(); flash("✅ Résidence ajoutée"); }
  };

  const del = async (id: string) => {
    if (!confirm("Supprimer cette résidence ?")) return;
    await fetch(`/api/admin/afrinomade/residences/${id}`, { method: "DELETE" });
    setItems(prev => prev.filter(i => i.id !== id));
    flash("🗑️ Supprimée");
  };

  const filtered = items.filter(i => {
    if (filterPays  !== "all" && i.pays  !== filterPays) return false;
    if (filterType  !== "all" && i.type  !== filterType) return false;
    if (filterActif === "oui" && !i.active)              return false;
    if (filterActif === "non" && i.active)               return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      if (!i.title.toLowerCase().includes(q) && !i.location.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  // ── Styles helpers ─────────────────────────────────────────────────────────
  const inputCls = "w-full rounded-lg px-3 py-2 text-sm bg-transparent border focus:outline-none focus:ring-1 transition-all";
  const inputStyle = { border: "1px solid color-mix(in oklch, var(--gold-premium) 18%, transparent)" };
  const CARD_BG = { background: "color-mix(in oklch, var(--foreground) 3%, transparent)", border: "1px solid color-mix(in oklch, var(--foreground) 8%, transparent)" };

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
              <Home size={20} style={{ color: GOLD }} strokeWidth={1.8} />
              <h1 className="text-2xl font-bold">Résidences</h1>
            </div>
            <p className="text-xs mt-0.5 pl-7" style={{ color: "color-mix(in oklch, var(--foreground) 50%, transparent)" }}>
              {items.length} résidence{items.length > 1 ? "s" : ""} · {new Set(items.map(i => i.pays)).size} pays · Sauvegarde automatique
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ViewModeToggle mode={viewMode} onChange={setViewMode} />
          <button onClick={add}
            className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white transition-all hover:scale-105 active:scale-95"
            style={{ background: "linear-gradient(135deg, var(--gold-premium), color-mix(in oklch, var(--gold-premium) 70%, var(--turquoise)))" }}>
            <Plus size={15} /> Ajouter
          </button>
        </div>
      </div>

      {msg && (
        <div className="rounded-xl px-4 py-3 text-sm font-medium"
          style={{ background: "color-mix(in oklch, var(--gold-premium) 10%, var(--background))", border: "1px solid color-mix(in oklch, var(--gold-premium) 25%, transparent)" }}>
          {msg}
        </div>
      )}

      {/* ── Filtres pays (tabs) ─────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-1.5">
        {[{ key: "all", label: `🌍 Tous (${items.length})` }, ...PAYS_LIST.map(p => ({ key: p.key, label: `${p.flag} ${p.label} (${items.filter(i => i.pays === p.key).length})` }))].map(({ key, label }) => {
          if (key !== "all" && items.filter(i => i.pays === key).length === 0) return null;
          const active = filterPays === key;
          return (
            <button key={key} onClick={() => setFilterPays(key)}
              className="rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-150"
              style={{
                background: active ? GOLD : "color-mix(in oklch, var(--foreground) 5%, transparent)",
                color: active ? "white" : "color-mix(in oklch, var(--foreground) 65%, transparent)",
                border: `1px solid ${active ? GOLD : "color-mix(in oklch, var(--foreground) 10%, transparent)"}`,
              }}>
              {label}
            </button>
          );
        })}
      </div>

      {/* ── Barre de filtres secondaires ───────────────────────────────────── */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 opacity-40" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher…"
            className="rounded-lg pl-8 pr-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[--gold-premium]"
            style={CARD_BG} />
        </div>
        <div className="flex items-center gap-1">
          <Filter size={12} className="opacity-40" />
          {(["all", "oui", "non"] as const).map(v => (
            <button key={v} onClick={() => setFilterActif(v)}
              className="rounded-full px-3 py-1.5 text-xs font-medium transition-all"
              style={{
                background: filterActif === v ? GOLD : "color-mix(in oklch, var(--foreground) 5%, transparent)",
                color: filterActif === v ? "white" : "color-mix(in oklch, var(--foreground) 60%, transparent)",
              }}>
              {v === "all" ? "Tous" : v === "oui" ? "Actifs" : "Inactifs"}
            </button>
          ))}
        </div>
        <select value={filterType} onChange={e => setFilterType(e.target.value)}
          className="rounded-lg px-3 py-2 text-xs focus:outline-none" style={CARD_BG}>
          <option value="all">Tous types</option>
          {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <span className="text-xs ml-auto" style={{ color: "color-mix(in oklch, var(--foreground) 40%, transparent)" }}>
          {filtered.length} résultat(s)
        </span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 gap-3 text-sm" style={{ color: "color-mix(in oklch, var(--foreground) 45%, transparent)" }}>
          <RefreshCw size={16} className="animate-spin" />
          Chargement…
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-sm opacity-40">Aucune résidence trouvée</div>
      ) : viewMode === "list" ? (

        /* ══ MODE LISTE ══════════════════════════════════════════════════════ */
        <div className="rounded-2xl overflow-hidden"
          style={{ border: "1px solid color-mix(in oklch, var(--gold-premium) 15%, transparent)" }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "color-mix(in oklch, var(--gold-premium) 8%, var(--background))" }}>
                {["Résidence", "Pays", "Type", "Localisation", "Capacité", "Prix / nuit", "Ch.", "Statut", ""].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, idx) => {
                const pi = paysInfo(item.pays);
                return (
                  <tr key={item.id} style={{
                    background: idx % 2 === 0 ? "transparent" : "color-mix(in oklch, var(--gold-premium) 2.5%, transparent)",
                    borderTop: "1px solid color-mix(in oklch, var(--gold-premium) 8%, transparent)",
                  }}>
                    <td className="px-4 py-3">
                      <div className="font-medium flex items-center gap-2">
                        <SaveBadge state={saveStates[item.id] ?? "idle"} />
                        <input value={item.title} onChange={e => update(item.id, "title", e.target.value)}
                          className="bg-transparent border-0 outline-none text-sm font-medium w-40" />
                      </div>
                      {item.badge && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full ml-1"
                          style={{ background: "color-mix(in oklch, var(--gold-premium) 15%, transparent)", color: GOLD }}>
                          {item.badge}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-base whitespace-nowrap">{pi.flag} <span className="text-xs">{pi.label}</span></td>
                    <td className="px-4 py-3 text-xs" style={{ color: "color-mix(in oklch, var(--foreground) 65%, transparent)" }}>{item.type}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: "color-mix(in oklch, var(--foreground) 65%, transparent)" }}>{item.location}</td>
                    <td className="px-4 py-3 text-xs whitespace-nowrap">{item.capacity}</td>
                    <td className="px-4 py-3 text-xs font-semibold whitespace-nowrap" style={{ color: GOLD }}>{item.price}</td>
                    <td className="px-4 py-3 text-xs text-center">{item.nb_chambres ?? "—"}</td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => update(item.id, "active", !item.active)}
                        className="transition-colors p-1.5 rounded-lg hover:bg-white/5"
                        style={{ color: item.active ? GOLD : "color-mix(in oklch, var(--foreground) 35%, transparent)" }}>
                        {item.active ? <Eye size={15} /> : <EyeOff size={15} />}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => del(item.id)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-400/10 transition-colors">
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      ) : (

        /* ══ MODE CARTES ═════════════════════════════════════════════════════ */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((item) => {
            const ss = saveStates[item.id] ?? "idle";
            const pi = paysInfo(item.pays);
            const hasImg = item.img && item.img.trim() !== "";
            return (
              <div key={item.id} className="rounded-2xl overflow-hidden flex flex-col"
                style={{
                  border: `1px solid color-mix(in oklch, var(--gold-premium) ${item.active ? "22" : "8"}%, transparent)`,
                  background: "color-mix(in oklch, var(--background) 80%, transparent)",
                  boxShadow: item.active ? "0 0 0 1px color-mix(in oklch, var(--gold-premium) 8%, transparent)" : "none",
                }}>

                {/* ── Image header ──────────────────────────────────────────── */}
                <div className="relative h-44 flex-shrink-0"
                  style={{ background: hasImg ? undefined : "linear-gradient(135deg, color-mix(in oklch, var(--gold-premium) 12%, var(--background)), color-mix(in oklch, var(--turquoise) 8%, var(--background)))" }}>
                  {hasImg && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.img} alt={item.title}
                      className="w-full h-full object-cover"
                      onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                    />
                  )}
                  {!hasImg && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-5xl opacity-20">🏠</span>
                    </div>
                  )}
                  {/* Gradient overlay */}
                  <div className="absolute inset-0"
                    style={{ background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.05) 100%)" }} />

                  {/* Status + controls flottants */}
                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                    <SaveBadge state={ss} />
                    <button
                      onClick={() => update(item.id, "active", !item.active)}
                      className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold transition-all"
                      style={{
                        background: item.active
                          ? "color-mix(in oklch, var(--gold-premium) 85%, transparent)"
                          : "rgba(0,0,0,0.45)",
                        color: "white",
                        backdropFilter: "blur(8px)",
                        border: `1px solid ${item.active ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.12)"}`,
                      }}>
                      {item.active ? <Eye size={10} /> : <EyeOff size={10} />}
                      {item.active ? "Actif" : "Inactif"}
                    </button>
                    <button onClick={() => del(item.id)}
                      className="w-7 h-7 rounded-full flex items-center justify-center transition-all hover:bg-red-500/80"
                      style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.12)" }}>
                      <Trash2 size={11} className="text-red-300" />
                    </button>
                  </div>

                  {/* Badge si défini */}
                  {item.badge && (
                    <div className="absolute top-2.5 left-2.5 rounded-full px-2.5 py-1 text-[10px] font-bold text-white"
                      style={{ background: "linear-gradient(135deg, var(--gold-premium), color-mix(in oklch, var(--gold-premium) 70%, var(--turquoise)))", backdropFilter: "blur(8px)" }}>
                      ✦ {item.badge}
                    </div>
                  )}

                  {/* Titre + pays en overlay bas */}
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <input value={item.title} onChange={e => update(item.id, "title", e.target.value)}
                      className="w-full bg-transparent text-white font-bold text-sm outline-none placeholder-white/40 border-b border-white/20 focus:border-white/50 pb-0.5 transition-colors"
                      placeholder="Titre de la résidence…"
                    />
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className="text-base leading-none">{pi.flag}</span>
                      <span className="text-white/75 text-[11px] font-medium">{pi.label}</span>
                      {item.location && (
                        <>
                          <span className="text-white/30 text-xs">·</span>
                          <MapPin size={9} className="text-white/50" />
                          <span className="text-white/60 text-[10px] truncate max-w-[130px]">{item.location}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* ── Corps de la carte ──────────────────────────────────────── */}
                <div className="p-4 space-y-3 flex-1">

                  {/* Pays + Type */}
                  <SectionDivider label="Infos" />
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <FieldLabel>Pays</FieldLabel>
                      <select value={item.pays} onChange={e => update(item.id, "pays", e.target.value)}
                        className={inputCls + " text-xs"} style={inputStyle}>
                        {PAYS_LIST.map(p => <option key={p.key} value={p.key}>{p.flag} {p.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <FieldLabel>Type</FieldLabel>
                      <select value={item.type} onChange={e => update(item.id, "type", e.target.value)}
                        className={inputCls + " text-xs"} style={inputStyle}>
                        {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <FieldLabel>Localisation</FieldLabel>
                    <input value={item.location} onChange={e => update(item.id, "location", e.target.value)}
                      className={inputCls} style={inputStyle} placeholder="Cocody, Abidjan" />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <FieldLabel>Capacité</FieldLabel>
                      <input value={item.capacity} onChange={e => update(item.id, "capacity", e.target.value)}
                        className={inputCls} style={inputStyle} placeholder="2 – 4 pers." />
                    </div>
                    <div>
                      <FieldLabel>Prix / nuit</FieldLabel>
                      <input value={item.price} onChange={e => update(item.id, "price", e.target.value)}
                        className={inputCls} style={inputStyle} placeholder="45 000 FCFA" />
                    </div>
                  </div>

                  {/* Dimensions */}
                  <SectionDivider label="Dimensions" />
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <FieldLabel><BedDouble size={9} className="inline mr-0.5" />Chambres</FieldLabel>
                      <input type="number" min={0} max={20}
                        value={item.nb_chambres ?? ""}
                        onChange={e => update(item.id, "nb_chambres", e.target.value ? Number(e.target.value) : null)}
                        className={inputCls + " text-center"} style={inputStyle} placeholder="—" />
                    </div>
                    <div>
                      <FieldLabel><Bath size={9} className="inline mr-0.5" />Salle(s) bain</FieldLabel>
                      <input type="number" min={0} max={10}
                        value={item.nb_salles_de_bain ?? ""}
                        onChange={e => update(item.id, "nb_salles_de_bain", e.target.value ? Number(e.target.value) : null)}
                        className={inputCls + " text-center"} style={inputStyle} placeholder="—" />
                    </div>
                    <div>
                      <FieldLabel><Maximize2 size={9} className="inline mr-0.5" />Surface m²</FieldLabel>
                      <input type="number" min={0}
                        value={item.surface_m2 ?? ""}
                        onChange={e => update(item.id, "surface_m2", e.target.value ? Number(e.target.value) : null)}
                        className={inputCls + " text-center"} style={inputStyle} placeholder="—" />
                    </div>
                  </div>

                  {/* Média + Badge */}
                  <SectionDivider label="Média" />
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2">
                      <FieldLabel>URL image</FieldLabel>
                      <input value={item.img} onChange={e => update(item.id, "img", e.target.value)}
                        className={inputCls} style={inputStyle} placeholder="https://… ou /photos/…" />
                    </div>
                    <div>
                      <FieldLabel>Badge</FieldLabel>
                      <select value={item.badge ?? ""} onChange={e => update(item.id, "badge", e.target.value || null)}
                        className={inputCls + " text-xs"} style={inputStyle}>
                        {BADGES.map(b => <option key={b} value={b}>{b || "— Aucun —"}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <FieldLabel>Description</FieldLabel>
                    <textarea value={item.description} onChange={e => update(item.id, "description", e.target.value)}
                      rows={2} className={inputCls + " resize-none leading-relaxed"} style={inputStyle}
                      placeholder="Décrivez la résidence en quelques phrases…" />
                  </div>

                  {/* Équipements */}
                  <SectionDivider label="Équipements" />
                  <div className="flex flex-wrap gap-1.5">
                    {AMENITIES_OPTS.map(am => {
                      const active = item.amenities.includes(am);
                      return (
                        <button key={am} type="button"
                          onClick={() => {
                            const next = active
                              ? item.amenities.filter(a => a !== am)
                              : [...item.amenities, am];
                            update(item.id, "amenities", next);
                          }}
                          className="rounded-full px-2.5 py-1 text-[10px] font-medium transition-all duration-150"
                          style={{
                            background: active
                              ? "color-mix(in oklch, var(--gold-premium) 18%, transparent)"
                              : "color-mix(in oklch, var(--foreground) 3.5%, transparent)",
                            color: active ? GOLD : "color-mix(in oklch, var(--foreground) 50%, transparent)",
                            border: `1px solid ${active ? "color-mix(in oklch, var(--gold-premium) 30%, transparent)" : "color-mix(in oklch, var(--foreground) 7%, transparent)"}`,
                          }}>
                          {active ? "✓ " : ""}{am}
                        </button>
                      );
                    })}
                  </div>

                  {/* Avancé (collapsible) */}
                  <details className="group">
                    <summary className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-semibold cursor-pointer select-none py-1"
                      style={{ color: "color-mix(in oklch, var(--foreground) 38%, transparent)" }}>
                      <ChevronDown size={11} className="transition-transform group-open:rotate-180" />
                      Paramètres avancés
                    </summary>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div>
                        <FieldLabel>Ordre d'affichage</FieldLabel>
                        <input type="number" value={item.sort_order}
                          onChange={e => update(item.id, "sort_order", Number(e.target.value))}
                          className={inputCls} style={inputStyle} placeholder="0" />
                      </div>
                      <div>
                        <FieldLabel>Slug (URL)</FieldLabel>
                        <input value={item.slug} onChange={e => update(item.id, "slug", e.target.value)}
                          className={inputCls} style={inputStyle} placeholder="villa-cocody" />
                      </div>
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

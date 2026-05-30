"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft, Plus, Trash2, MapPin, Eye, EyeOff,
  Check, Search, Filter, RefreshCw, ChevronDown,
  Clock, Tag, ExternalLink, Monitor, Pencil, Timer,
} from "lucide-react";
import ViewModeToggle, { type ViewMode } from "@/app/components/admin/ViewModeToggle";
import { useViewMode } from "@/lib/use-view-mode";

// ─── Types ────────────────────────────────────────────────────────────────────
interface CatalogueActivity {
  label: string;
  pays?: string;
  prix_par_personne?: number;
  prix_demi_journee?: number;
  prix_journee?: number;
  unite?: string;
}

interface Excursion {
  id: string;
  slug: string;
  title: string;
  img: string;
  duration: string;
  price: string;
  tags: string[];
  pays: string | null;
  description: string;
  highlights: string[];
  active: boolean;
  sort_order: number;
}

type SaveState = "idle" | "dirty" | "saving" | "saved";

// ─── Constantes ───────────────────────────────────────────────────────────────
const TAGS_OPTS = [
  "Plage", "Forêt", "Village", "Patrimoine", "Gastronomie", "Nature",
  "Sport", "Aventure", "Famille", "Couples", "Nocturne", "Randonnée",
];

const PAYS_OPTS = [
  { key: "Côte d'Ivoire", flag: "🇨🇮" },
  { key: "Sénégal",       flag: "🇸🇳" },
  { key: "Ghana",         flag: "🇬🇭" },
  { key: "Maroc",         flag: "🇲🇦" },
  { key: "Bénin",         flag: "🇧🇯" },
  { key: "Togo",          flag: "🇹🇬" },
];

const PAYS_CAT: Record<string, { formKey: string; flag: string; label: string }> = {
  "CI":      { formKey: "Côte d'Ivoire", flag: "🇨🇮", label: "Côte d'Ivoire" },
  "Sénégal": { formKey: "Sénégal",       flag: "🇸🇳", label: "Sénégal" },
  "Ghana":   { formKey: "Ghana",         flag: "🇬🇭", label: "Ghana" },
  "Maroc":   { formKey: "Maroc",         flag: "🇲🇦", label: "Maroc" },
  "Bénin":   { formKey: "Bénin",         flag: "🇧🇯", label: "Bénin" },
  "Togo":    { formKey: "Togo",          flag: "🇹🇬", label: "Togo" },
};

const PAYS_ORDER = ["CI", "Sénégal", "Ghana", "Maroc", "Bénin", "Togo"];

const TURQ = "var(--turquoise)";

// ─── Helpers catalogue ────────────────────────────────────────────────────────
function activityEmoji(label: string): string {
  const l = label.toLowerCase();
  if (l.includes("plage") || l.includes("beach") || l.includes("labadi"))    return "🏖️";
  if (l.includes("safari") || l.includes("faune") || l.includes("bandia") || l.includes("mole") || l.includes("pendjari") || l.includes("fazao") || l.includes("niokolo")) return "🦁";
  if (l.includes("randonnée") || l.includes("agou") || l.includes("womé") || l.includes("kpalimé")) return "🥾";
  if (l.includes("pirogue") || l.includes("saloum") || l.includes("lac togo") || l.includes("lac rose") || l.includes("kayak") || l.includes("ganvié")) return "🛶";
  if (l.includes("marché") || l.includes("dantokpa"))                         return "🛍️";
  if (l.includes("musée") || l.includes("mémorial") || l.includes("nkrumah") || l.includes("monument")) return "🏛️";
  if (l.includes("cuisine") || l.includes("gastrono") || l.includes("cours de")) return "🍽️";
  if (l.includes("jet ski") || l.includes("surf") || l.includes("nautique")) return "🏄";
  if (l.includes("montgolfière"))                                             return "🎈";
  if (l.includes("hammam") || l.includes("spa") || l.includes("massage"))    return "🧖";
  if (l.includes("quad"))                                                     return "🏍️";
  if (l.includes("calèche"))                                                  return "🐴";
  if (l.includes("cascade") || l.includes("chute"))                          return "💧";
  if (l.includes("vaudou") || l.includes("fétiche") || l.includes("python") || l.includes("festival")) return "🪆";
  if (l.includes("basilique") || l.includes("cathédrale"))                   return "⛪";
  if (l.includes("jardin") || l.includes("botanic") || l.includes("majorelle")) return "🌿";
  if (l.includes("désert") || l.includes("chameau") || l.includes("agafay") || l.includes("zagora")) return "🐪";
  if (l.includes("île") || l.includes("gorée") || l.includes("boulay") || l.includes("aneho")) return "🏝️";
  if (l.includes("forêt") || l.includes("banco"))                            return "🌳";
  if (l.includes("châtea") || l.includes("elmina") || l.includes("cape coast") || l.includes("palais") || l.includes("abomey")) return "🏰";
  if (l.includes("kente") || l.includes("tissage"))                          return "🧶";
  if (l.includes("city tour") || l.includes("tour ") || l.includes("journée complète")) return "🗺️";
  if (l.includes("caïman"))                                                   return "🐊";
  if (l.includes("assinie") || l.includes("sassandra") || l.includes("grand-bassam")) return "🌊";
  return "🗺️";
}

function activityPrice(act: CatalogueActivity): number {
  return act.prix_par_personne ?? act.prix_demi_journee ?? act.prix_journee ?? 0;
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
export default function AdminExcursions() {
  const [items, setItems]       = useState<Excursion[]>([]);
  const [loading, setLoading]   = useState(true);
  const [viewMode, setViewMode] = useViewMode("afri-excursions", "cards");
  const [msg, setMsg]           = useState("");

  // Mode aperçu public
  const [previewMode, setPreviewMode] = useState(false);

  // Filtres excursions
  const [filterTag,   setFilterTag]   = useState("all");
  const [filterActif, setFilterActif] = useState<"all" | "oui" | "non">("all");
  const [search,      setSearch]      = useState("");

  // Catalogue des activités
  const [allCatActs,    setAllCatActs]    = useState<CatalogueActivity[]>([]);
  const [loadingCat,    setLoadingCat]    = useState(true);
  const [catPaysFilter, setCatPaysFilter] = useState(PAYS_ORDER[0]);

  // Auto-save debounced
  const [saveStates, setSaveStates] = useState<Record<string, SaveState>>({});
  const saveTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const itemsRef   = useRef<Excursion[]>([]);
  useEffect(() => { itemsRef.current = items; }, [items]);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/afrinomade/excursions");
    if (res.ok) setItems(await res.json());
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    fetch("/api/afrinomade/catalogue-public?categorie=activites")
      .then(r => r.ok ? r.json() : [])
      .then(data => { setAllCatActs(data); setLoadingCat(false); })
      .catch(() => setLoadingCat(false));
  }, []);

  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(""), 3000); };

  const scheduleAutoSave = useCallback((id: string) => {
    clearTimeout(saveTimers.current[id]);
    setSaveStates(prev => ({ ...prev, [id]: "dirty" }));
    saveTimers.current[id] = setTimeout(async () => {
      const item = itemsRef.current.find(i => i.id === id);
      if (!item) return;
      setSaveStates(prev => ({ ...prev, [id]: "saving" }));
      const res = await fetch(`/api/admin/afrinomade/excursions/${id}`, {
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

  const update = useCallback((id: string, field: keyof Excursion, value: unknown) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i));
    scheduleAutoSave(id);
  }, [scheduleAutoSave]);

  const add = async () => {
    const res = await fetch("/api/admin/afrinomade/excursions", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Nouvelle excursion", duration: "1 jour", price: "Sur devis",
        tags: [], highlights: [], description: "", active: false,
      }),
    });
    if (res.ok) { await load(); flash("✅ Excursion ajoutée"); }
  };

  const del = async (id: string) => {
    if (!confirm("Supprimer cette excursion ?")) return;
    await fetch(`/api/admin/afrinomade/excursions/${id}`, { method: "DELETE" });
    setItems(prev => prev.filter(i => i.id !== id));
    flash("🗑️ Supprimée");
  };

  // Tags dynamiques issus des données
  const allTags = Array.from(new Set(items.flatMap(i => i.tags)));

  const filtered = items.filter(i => {
    if (filterTag   !== "all" && !i.tags.includes(filterTag)) return false;
    if (filterActif === "oui" && !i.active)                   return false;
    if (filterActif === "non" && i.active)                    return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      if (!i.title.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const inputCls  = "w-full rounded-lg px-3 py-2 text-sm bg-transparent border focus:outline-none focus:ring-1 transition-all";
  const inputStyle = { border: "1px solid color-mix(in oklch, var(--turquoise) 20%, transparent)" };
  const CARD_BG   = { background: "color-mix(in oklch, var(--foreground) 3%, transparent)", border: "1px solid color-mix(in oklch, var(--foreground) 8%, transparent)" };

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
              <MapPin size={20} style={{ color: TURQ }} strokeWidth={1.8} />
              <h1 className="text-2xl font-bold">Excursions</h1>
            </div>
            <p className="text-xs mt-0.5 pl-7" style={{ color: "color-mix(in oklch, var(--foreground) 50%, transparent)" }}>
              {items.length} excursion{items.length > 1 ? "s" : ""} · Sauvegarde automatique
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Link href="/afrinomade/excursions" target="_blank"
            className="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all hover:scale-105"
            style={{
              background: "color-mix(in oklch, var(--turquoise) 8%, transparent)",
              color: TURQ,
              border: "1px solid color-mix(in oklch, var(--turquoise) 20%, transparent)",
            }}>
            <ExternalLink size={12} /> Voir la page
          </Link>
          <button onClick={() => setPreviewMode(v => !v)}
            className="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all hover:scale-105"
            style={{
              background: previewMode ? TURQ : "color-mix(in oklch, var(--foreground) 6%, transparent)",
              color: previewMode ? "white" : "color-mix(in oklch, var(--foreground) 65%, transparent)",
              border: `1px solid ${previewMode ? TURQ : "color-mix(in oklch, var(--foreground) 12%, transparent)"}`,
            }}>
            <Monitor size={12} /> {previewMode ? "Aperçu actif" : "Aperçu public"}
          </button>
          {!previewMode && <ViewModeToggle mode={viewMode} onChange={setViewMode} />}
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

      {/* ── Tags filter tabs ─────────────────────────────────────────────────── */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {[{ key: "all", label: `🗺️ Tous (${items.length})` }, ...allTags.map(t => ({ key: t, label: `${t} (${items.filter(i => i.tags.includes(t)).length})` }))].map(({ key, label }) => {
            const active = filterTag === key;
            return (
              <button key={key} onClick={() => setFilterTag(key)}
                className="rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-150"
                style={{
                  background: active ? TURQ : "color-mix(in oklch, var(--foreground) 5%, transparent)",
                  color: active ? "white" : "color-mix(in oklch, var(--foreground) 65%, transparent)",
                  border: `1px solid ${active ? TURQ : "color-mix(in oklch, var(--foreground) 10%, transparent)"}`,
                }}>
                {label}
              </button>
            );
          })}
        </div>
      )}

      {/* ── Barre de filtres secondaires ───────────────────────────────────── */}
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

      {/* ══ MODE APERÇU PUBLIC ═══════════════════════════════════════════════ */}
      {previewMode && !loading && (
        <div>
          <div className="flex items-center gap-2 mb-5 px-1">
            <Monitor size={14} style={{ color: TURQ }} />
            <span className="text-xs font-semibold" style={{ color: TURQ }}>Aperçu public</span>
            <span className="text-xs" style={{ color: "color-mix(in oklch, var(--foreground) 45%, transparent)" }}>
              — tel qu'affiché sur le site. Cliquez <strong>Éditer</strong> pour modifier.
            </span>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((ex) => (
              <div key={ex.id} className="group relative rounded-2xl overflow-hidden flex flex-col h-full"
                style={{
                  background: "color-mix(in oklch, var(--background) 85%, transparent)",
                  border: `1px solid color-mix(in oklch, var(--turquoise) ${ex.active ? "15" : "8"}%, transparent)`,
                  opacity: ex.active ? 1 : 0.6,
                }}>
                {/* Image */}
                <div className="relative h-52 overflow-hidden flex-shrink-0">
                  {ex.img ? (
                    <Image src={ex.img} alt={ex.title} fill sizes="(max-width:768px) 100vw,33vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl"
                      style={{ background: "color-mix(in oklch, var(--turquoise) 8%, var(--background))" }}>🗺️</div>
                  )}
                  <div className="absolute inset-0"
                    style={{ background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.1) 55%, rgba(0,0,0,0) 100%)" }} />
                  {/* Tags */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1 max-w-[70%]">
                    {ex.tags.slice(0, 2).map(tag => (
                      <span key={tag} className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold text-white"
                        style={{ background: "color-mix(in oklch, var(--turquoise) 80%, #0a1a1a)" }}>{tag}</span>
                    ))}
                  </div>
                  {/* Duration */}
                  <div className="absolute top-3 right-3 rounded-full px-2.5 py-1 text-[10px] font-semibold text-white flex items-center gap-1"
                    style={{ background: "color-mix(in oklch, #0a1a1a 70%, transparent)", backdropFilter: "blur(8px)" }}>
                    <Timer size={11} style={{ color: TURQ }} strokeWidth={2} />{ex.duration}
                  </div>
                  {/* Statut badge */}
                  {!ex.active && (
                    <div className="absolute bottom-2 left-2 rounded-full px-2.5 py-0.5 text-[10px] font-semibold"
                      style={{ background: "rgba(239,68,68,0.85)", color: "white" }}>
                      <EyeOff size={9} className="inline-block mr-0.5 -mt-px" /> Non publié
                    </div>
                  )}
                  {ex.pays && (
                    <div className="absolute bottom-2 right-2 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                      style={{ background: "rgba(0,0,0,0.55)", color: "white", backdropFilter: "blur(8px)" }}>
                      {PAYS_OPTS.find(p => p.key === ex.pays)?.flag ?? ""} {ex.pays}
                    </div>
                  )}
                </div>
                {/* Corps */}
                <div className="flex flex-col gap-3 p-5 flex-1">
                  <h3 className="font-bold text-base leading-snug">{ex.title || <span className="opacity-30">Sans titre</span>}</h3>
                  <p className="text-sm leading-relaxed flex-1" style={{ color: "color-mix(in oklch, var(--foreground) 68%, transparent)" }}>
                    {ex.description || <span className="opacity-30 italic">Aucune description</span>}
                  </p>
                  {ex.highlights.length > 0 && (
                    <ul className="flex flex-wrap gap-x-4 gap-y-1">
                      {ex.highlights.slice(0, 3).map(h => (
                        <li key={h} className="text-xs flex items-center gap-1" style={{ color: "color-mix(in oklch, var(--turquoise) 80%, var(--foreground))" }}>
                          <Check size={11} className="shrink-0" style={{ color: TURQ }} strokeWidth={2.5} />{h}
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="flex items-center justify-between pt-3 border-t"
                    style={{ borderColor: "color-mix(in oklch, var(--turquoise) 10%, transparent)" }}>
                    <span className="text-sm font-bold" style={{ color: "var(--gold-premium)" }}>{ex.price || "—"}</span>
                    {/* Bouton éditer en remplacement de "Réserver" */}
                    <button onClick={() => setPreviewMode(false)}
                      className="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold text-white transition-all hover:scale-105"
                      style={{ background: "linear-gradient(135deg, var(--turquoise), color-mix(in oklch, var(--turquoise) 70%, var(--gold-premium)))" }}>
                      <Pencil size={11} /> Éditer
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-16 text-sm opacity-40">Aucune excursion à afficher</div>
          )}
        </div>
      )}

      {/* ══ MODES LISTE / CARTES ═════════════════════════════════════════════ */}
      {!previewMode && (loading ? (
        <div className="flex items-center justify-center py-20 gap-3 text-sm" style={{ color: "color-mix(in oklch, var(--foreground) 45%, transparent)" }}>
          <RefreshCw size={16} className="animate-spin" />
          Chargement…
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-sm opacity-40">Aucune excursion trouvée</div>
      ) : viewMode === "list" ? (

        /* ══ MODE LISTE ══════════════════════════════════════════════════════ */
        <div className="rounded-2xl overflow-hidden"
          style={{ border: "1px solid color-mix(in oklch, var(--turquoise) 15%, transparent)" }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "color-mix(in oklch, var(--turquoise) 8%, var(--background))" }}>
                {["Excursion", "Pays", "Durée", "Prix", "Tags", "Statut", ""].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
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
                    <div className="font-medium flex items-center gap-2">
                      <SaveBadge state={saveStates[item.id] ?? "idle"} />
                      <input value={item.title} onChange={e => update(item.id, "title", e.target.value)}
                        className="bg-transparent border-0 outline-none text-sm font-medium w-44" />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs whitespace-nowrap">
                    {item.pays ? (
                      <span className="rounded-full px-2 py-0.5 font-medium"
                        style={{ background: "color-mix(in oklch, var(--turquoise) 10%, transparent)", color: TURQ }}>
                        {PAYS_OPTS.find(p => p.key === item.pays)?.flag ?? ""} {item.pays}
                      </span>
                    ) : (
                      <span style={{ color: "color-mix(in oklch, var(--foreground) 30%, transparent)" }}>—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: "color-mix(in oklch, var(--foreground) 65%, transparent)" }}>
                    <span className="flex items-center gap-1"><Clock size={12} />{item.duration}</span>
                  </td>
                  <td className="px-4 py-3 text-xs font-semibold whitespace-nowrap" style={{ color: TURQ }}>{item.price}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {item.tags.slice(0, 3).map(t => (
                        <span key={t} className="rounded-full px-2 py-0.5 text-[9px] font-medium"
                          style={{ background: "color-mix(in oklch, var(--turquoise) 12%, transparent)", color: TURQ }}>
                          {t}
                        </span>
                      ))}
                      {item.tags.length > 3 && <span className="text-[10px] opacity-50">+{item.tags.length - 3}</span>}
                    </div>
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
            const ss     = saveStates[item.id] ?? "idle";
            const hasImg = item.img && item.img.trim() !== "";
            return (
              <div key={item.id} className="rounded-2xl overflow-hidden flex flex-col"
                style={{
                  border: `1px solid color-mix(in oklch, var(--turquoise) ${item.active ? "22" : "8"}%, transparent)`,
                  background: "color-mix(in oklch, var(--background) 80%, transparent)",
                  boxShadow: item.active ? "0 0 0 1px color-mix(in oklch, var(--turquoise) 8%, transparent)" : "none",
                }}>

                {/* ── Image header ──────────────────────────────────────────── */}
                <div className="relative h-44 flex-shrink-0"
                  style={{ background: hasImg ? undefined : "linear-gradient(135deg, color-mix(in oklch, var(--turquoise) 10%, var(--background)), color-mix(in oklch, var(--gold-premium) 6%, var(--background)))" }}>
                  {hasImg && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.img} alt={item.title}
                      className="w-full h-full object-cover"
                      onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                    />
                  )}
                  {!hasImg && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-5xl opacity-20">🗺️</span>
                    </div>
                  )}
                  {/* Gradient overlay */}
                  <div className="absolute inset-0"
                    style={{ background: "linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.04) 100%)" }} />

                  {/* Controls flottants */}
                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                    <SaveBadge state={ss} />
                    <button
                      onClick={() => update(item.id, "active", !item.active)}
                      className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold transition-all"
                      style={{
                        background: item.active
                          ? "color-mix(in oklch, var(--turquoise) 85%, transparent)"
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

                  {/* Duration badge */}
                  <div className="absolute top-2.5 left-2.5">
                    <span className="rounded-full px-2.5 py-1 text-[10px] font-semibold text-white flex items-center gap-1"
                      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.12)" }}>
                      <Clock size={10} style={{ color: TURQ }} />{item.duration || "Durée ?"}
                    </span>
                  </div>

                  {/* Titre en overlay bas */}
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <input value={item.title} onChange={e => update(item.id, "title", e.target.value)}
                      className="w-full bg-transparent text-white font-bold text-sm outline-none placeholder-white/40 border-b border-white/20 focus:border-white/50 pb-0.5 transition-colors"
                      placeholder="Titre de l'excursion…"
                    />
                  </div>
                </div>

                {/* ── Corps de la carte ──────────────────────────────────────── */}
                <div className="p-4 space-y-3 flex-1">

                  {/* Durée + Prix */}
                  <SectionDivider label="Infos" />
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <FieldLabel><Clock size={9} className="inline mr-0.5" />Durée</FieldLabel>
                      <input value={item.duration} onChange={e => update(item.id, "duration", e.target.value)}
                        className={inputCls} style={inputStyle} placeholder="1 jour" />
                    </div>
                    <div>
                      <FieldLabel>Prix</FieldLabel>
                      <input value={item.price} onChange={e => update(item.id, "price", e.target.value)}
                        className={inputCls} style={inputStyle} placeholder="35 000 FCFA / pers." />
                    </div>
                  </div>

                  {/* Pays */}
                  <div>
                    <FieldLabel>🌍 Pays destination</FieldLabel>
                    <div className="flex flex-wrap gap-1.5">
                      {PAYS_OPTS.map(p => {
                        const active = item.pays === p.key;
                        return (
                          <button key={p.key} type="button"
                            onClick={() => update(item.id, "pays", active ? null : p.key)}
                            className="rounded-full px-2.5 py-1 text-[10px] font-medium transition-all duration-150"
                            style={{
                              background: active ? "color-mix(in oklch, var(--turquoise) 18%, transparent)" : "color-mix(in oklch, var(--foreground) 3.5%, transparent)",
                              color: active ? TURQ : "color-mix(in oklch, var(--foreground) 50%, transparent)",
                              border: `1px solid ${active ? "color-mix(in oklch, var(--turquoise) 30%, transparent)" : "color-mix(in oklch, var(--foreground) 7%, transparent)"}`,
                            }}>
                            {p.flag} {active ? "✓ " : ""}{p.key}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Image */}
                  <SectionDivider label="Média" />
                  <div>
                    <FieldLabel>URL image</FieldLabel>
                    <input value={item.img} onChange={e => update(item.id, "img", e.target.value)}
                      className={inputCls} style={inputStyle} placeholder="https://… ou /afrinomade/photos/…" />
                  </div>

                  {/* Description */}
                  <div>
                    <FieldLabel>Description</FieldLabel>
                    <textarea value={item.description} onChange={e => update(item.id, "description", e.target.value)}
                      rows={2} className={inputCls + " resize-none leading-relaxed"} style={inputStyle}
                      placeholder="Décrivez l'excursion en quelques phrases…" />
                  </div>

                  {/* Tags */}
                  <SectionDivider label="Tags" />
                  <div className="flex flex-wrap gap-1.5">
                    {TAGS_OPTS.map(tag => {
                      const active = item.tags.includes(tag);
                      return (
                        <button key={tag} type="button"
                          onClick={() => {
                            const next = active
                              ? item.tags.filter(t => t !== tag)
                              : [...item.tags, tag];
                            update(item.id, "tags", next);
                          }}
                          className="rounded-full px-2.5 py-1 text-[10px] font-medium transition-all duration-150"
                          style={{
                            background: active
                              ? "color-mix(in oklch, var(--turquoise) 18%, transparent)"
                              : "color-mix(in oklch, var(--foreground) 3.5%, transparent)",
                            color: active ? TURQ : "color-mix(in oklch, var(--foreground) 50%, transparent)",
                            border: `1px solid ${active ? "color-mix(in oklch, var(--turquoise) 30%, transparent)" : "color-mix(in oklch, var(--foreground) 7%, transparent)"}`,
                          }}>
                          {active ? "✓ " : ""}{tag}
                        </button>
                      );
                    })}
                  </div>
                  {/* Tag personnalisé */}
                  <div className="flex items-center gap-1.5">
                    <input
                      placeholder="Tag personnalisé… (Entrée pour ajouter)"
                      className={inputCls + " text-xs"} style={inputStyle}
                      onKeyDown={e => {
                        if (e.key === "Enter") {
                          const val = e.currentTarget.value.trim();
                          if (val && !item.tags.includes(val)) {
                            update(item.id, "tags", [...item.tags, val]);
                          }
                          e.currentTarget.value = "";
                          e.preventDefault();
                        }
                      }}
                    />
                    <Tag size={14} className="opacity-30 flex-shrink-0" />
                  </div>

                  {/* Points forts */}
                  <SectionDivider label="Points forts" />
                  <div>
                    <FieldLabel>Points forts (séparés par virgule)</FieldLabel>
                    <input
                      value={item.highlights.join(", ")}
                      onChange={e => update(item.id, "highlights", e.target.value.split(",").map(h => h.trim()).filter(Boolean))}
                      className={inputCls} style={inputStyle}
                      placeholder="Transport inclus, Guide local, Repas inclus" />
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
                          className={inputCls} style={inputStyle} placeholder="excursion-assinie" />
                      </div>
                    </div>
                  </details>

                </div>
              </div>
            );
          })}
        </div>
      ))}

      {/* ══ CATALOGUE DES ACTIVITÉS ═══════════════════════════════════════════ */}
      <div className="pt-6 border-t" style={{ borderColor: "color-mix(in oklch, var(--turquoise) 12%, transparent)" }}>

        {/* Header section */}
        <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[9px] font-bold uppercase tracking-[0.12em]"
                style={{ color: "color-mix(in oklch, var(--gold-premium) 85%, var(--foreground))" }}>
                Catalogue complet
              </span>
              <div className="flex-1 h-px w-16" style={{ background: "color-mix(in oklch, var(--gold-premium) 18%, transparent)" }} />
            </div>
            <h2 className="text-base font-bold flex items-center gap-2">
              Toutes les activités disponibles
              {!loadingCat && (
                <span className="text-xs font-normal px-2 py-0.5 rounded-full"
                  style={{ background: "color-mix(in oklch, var(--foreground) 5%, transparent)", color: "color-mix(in oklch, var(--foreground) 55%, transparent)" }}>
                  {allCatActs.length} activités · 6 pays
                </span>
              )}
            </h2>
          </div>
          <Link href="/admin/afrinomade/catalogue"
            className="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all hover:scale-105"
            style={{
              background: "color-mix(in oklch, var(--gold-premium) 10%, transparent)",
              color: "var(--gold-premium)",
              border: "1px solid color-mix(in oklch, var(--gold-premium) 25%, transparent)",
            }}>
            <ExternalLink size={11} /> Gérer le catalogue
          </Link>
        </div>

        {/* Onglets pays */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {PAYS_ORDER.map(key => {
            const info  = PAYS_CAT[key];
            const count = allCatActs.filter(a => a.pays === key).length;
            if (!count && !loadingCat) return null;
            const isActive = catPaysFilter === key;
            return (
              <button key={key} onClick={() => setCatPaysFilter(key)}
                className="rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-150"
                style={{
                  background: isActive ? "var(--gold-premium)" : "color-mix(in oklch, var(--foreground) 5%, transparent)",
                  color: isActive ? "white" : "color-mix(in oklch, var(--foreground) 65%, transparent)",
                  border: `1px solid ${isActive ? "var(--gold-premium)" : "color-mix(in oklch, var(--foreground) 10%, transparent)"}`,
                }}>
                {info.flag} {info.label}
                {!loadingCat && <span className="ml-1 opacity-70">({count})</span>}
              </button>
            );
          })}
        </div>

        {/* Grille activités */}
        {loadingCat ? (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2.5">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
              <div key={n} className="rounded-xl h-20 animate-pulse"
                style={{ background: "color-mix(in oklch, var(--foreground) 5%, transparent)" }} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2.5">
            {allCatActs.filter(a => a.pays === catPaysFilter).map(act => {
              const prix = activityPrice(act);
              return (
                <div key={act.label}
                  className="rounded-xl p-3 flex items-start gap-2.5"
                  style={{
                    background: "color-mix(in oklch, var(--background) 80%, transparent)",
                    border: "1px solid color-mix(in oklch, var(--turquoise) 10%, transparent)",
                  }}>
                  <span className="text-xl flex-shrink-0 mt-0.5">{activityEmoji(act.label)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold leading-snug truncate" title={act.label}>{act.label}</p>
                    {prix > 0 ? (
                      <p className="text-[10px] font-bold mt-0.5" style={{ color: "var(--gold-premium)" }}>
                        {prix.toLocaleString("fr-FR")} FCFA
                      </p>
                    ) : (
                      <p className="text-[10px] mt-0.5" style={{ color: "color-mix(in oklch, var(--foreground) 35%, transparent)" }}>
                        Sur devis
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
            {allCatActs.filter(a => a.pays === catPaysFilter).length === 0 && (
              <div className="col-span-4 text-center py-8 text-xs opacity-40">
                Aucune activité pour ce pays
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}

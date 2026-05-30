"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import Link from "next/link";
import {
  Home, Car, Map, Utensils, Settings, PartyPopper, ArrowLeft,
  ClipboardList, Plus, Trash2, Download, Upload, Search,
  Check, X, AlertCircle, ChevronUp, ChevronDown, Filter,
  FileSpreadsheet, CheckSquare, Square, RefreshCw, TrendingUp,
  Columns, RotateCcw,
} from "lucide-react";
import type { AfriNomadeCatalogue } from "@/lib/afrinomade-types";
import CurrencyConverter from "@/app/components/CurrencyConverter";

// ─── Types ────────────────────────────────────────────────────────────────────
interface ColConfig {
  key: keyof AfriNomadeCatalogue;
  label: string;
  visible: boolean;
}
type CatalogueColConfigs = Record<string, ColConfig[]>;

// ─── Constantes ──────────────────────────────────────────────────────────────
const CATEGORIES = [
  { key: "hebergement", label: "Hébergement", icon: Home,        color: "#0B4FCC" },
  { key: "transport",   label: "Transport",   icon: Car,         color: "#0BA5A4" },
  { key: "guide",       label: "Guide",       icon: Map,         color: "#7C3AED" },
  { key: "repas",       label: "Repas",       icon: Utensils,    color: "#D97706" },
  { key: "equipements", label: "Équipements", icon: Settings,    color: "#059669" },
  { key: "activites",   label: "Activités",   icon: PartyPopper, color: "#DB2777" },
] as const;
type CatKey = typeof CATEGORIES[number]["key"];

const ALL_PRICE_FIELDS: Array<{ key: keyof AfriNomadeCatalogue; label: string }> = [
  { key: "prix_basse_saison",  label: "Basse saison"  },
  { key: "prix_haute_saison",  label: "Haute saison"  },
  { key: "prix_transfert",     label: "Transfert"     },
  { key: "prix_demi_journee",  label: "½ journée"     },
  { key: "prix_journee",       label: "Journée"       },
  { key: "prix_par_personne",  label: "Par personne"  },
];

const DEFAULT_COL_CONFIGS: CatalogueColConfigs = {
  hebergement: [
    { key: "prix_basse_saison", label: "Basse saison", visible: true  },
    { key: "prix_haute_saison", label: "Haute saison", visible: true  },
    { key: "prix_transfert",    label: "Transfert",    visible: false },
    { key: "prix_demi_journee", label: "Demi-journée", visible: false },
    { key: "prix_journee",      label: "Journée",      visible: false },
    { key: "prix_par_personne", label: "Par personne", visible: false },
  ],
  transport: [
    { key: "prix_basse_saison", label: "Basse saison", visible: false },
    { key: "prix_haute_saison", label: "Haute saison", visible: false },
    { key: "prix_transfert",    label: "Transfert",    visible: true  },
    { key: "prix_demi_journee", label: "Demi-journée", visible: true  },
    { key: "prix_journee",      label: "Journée",      visible: true  },
    { key: "prix_par_personne", label: "Par personne", visible: false },
  ],
  guide: [
    { key: "prix_basse_saison", label: "Basse saison", visible: false },
    { key: "prix_haute_saison", label: "Haute saison", visible: false },
    { key: "prix_transfert",    label: "Transfert",    visible: false },
    { key: "prix_demi_journee", label: "Demi-journée", visible: true  },
    { key: "prix_journee",      label: "Journée",      visible: true  },
    { key: "prix_par_personne", label: "Par personne", visible: false },
  ],
  repas: [
    { key: "prix_basse_saison", label: "Basse saison", visible: false },
    { key: "prix_haute_saison", label: "Haute saison", visible: false },
    { key: "prix_transfert",    label: "Transfert",    visible: false },
    { key: "prix_demi_journee", label: "Demi-journée", visible: false },
    { key: "prix_journee",      label: "Journée",      visible: false },
    { key: "prix_par_personne", label: "Par personne", visible: true  },
  ],
  equipements: [
    { key: "prix_basse_saison", label: "Basse saison", visible: true  },
    { key: "prix_haute_saison", label: "Haute saison", visible: true  },
    { key: "prix_transfert",    label: "Transfert",    visible: false },
    { key: "prix_demi_journee", label: "Demi-journée", visible: false },
    { key: "prix_journee",      label: "Journée",      visible: false },
    { key: "prix_par_personne", label: "Par personne", visible: true  },
  ],
  activites: [
    { key: "prix_basse_saison", label: "Basse saison", visible: false },
    { key: "prix_haute_saison", label: "Haute saison", visible: false },
    { key: "prix_transfert",    label: "Transfert",    visible: false },
    { key: "prix_demi_journee", label: "Demi-journée", visible: false },
    { key: "prix_journee",      label: "Journée",      visible: false },
    { key: "prix_par_personne", label: "Par personne", visible: true  },
  ],
};

const LS_KEY = "afrinomade_col_configs_v1";

// ─── Helpers ──────────────────────────────────────────────────────────────────
type SortDir = "asc" | "desc" | null;

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ ok, msg, onClose }: { ok: boolean; msg: string; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div
      className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white shadow-xl"
      style={{ background: ok ? "#0BA5A4" : "rgb(239,68,68)" }}
    >
      {ok ? <Check size={15} /> : <AlertCircle size={15} />}
      {msg}
    </div>
  );
}

// ─── Cellule texte éditable (debounced) ──────────────────────────────────────
function InlineText({
  value, onSave, className, placeholder,
}: {
  value: string;
  onSave: (v: string) => Promise<void>;
  className?: string;
  placeholder?: string;
}) {
  const [local, setLocal]   = useState(value);
  const [st, setSt]         = useState<"idle" | "saving" | "saved">("idle");
  const timer   = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const editing = useRef(false);

  useEffect(() => {
    if (!editing.current) setLocal(value);
  }, [value]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    editing.current = true;
    setLocal(e.target.value);
    setSt("saving");
    clearTimeout(timer.current);
    const val = e.target.value;
    timer.current = setTimeout(async () => {
      await onSave(val);
      setSt("saved");
      editing.current = false;
      setTimeout(() => setSt("idle"), 1500);
    }, 700);
  };

  return (
    <div className="relative flex items-center">
      <input value={local} onChange={onChange} className={className} placeholder={placeholder} />
      {st === "saving" && <span className="absolute right-1.5 w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />}
      {st === "saved"  && <Check size={9} className="absolute right-1.5 text-emerald-400" />}
    </div>
  );
}

// ─── Cellule prix éditable (debounced) ───────────────────────────────────────
function PriceCell({
  value, onSave,
}: {
  value: number | undefined | null;
  onSave: (v: number | null) => Promise<void>;
}) {
  const [local, setLocal]   = useState(value != null ? String(value) : "");
  const [st, setSt]         = useState<"idle" | "saving" | "saved">("idle");
  const timer   = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const editing = useRef(false);

  useEffect(() => {
    if (!editing.current) setLocal(value != null ? String(value) : "");
  }, [value]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    editing.current = true;
    setLocal(e.target.value);
    setSt("saving");
    clearTimeout(timer.current);
    const val = e.target.value;
    timer.current = setTimeout(async () => {
      await onSave(val ? Number(val) : null);
      setSt("saved");
      editing.current = false;
      setTimeout(() => setSt("idle"), 1500);
    }, 700);
  };

  return (
    <div className="flex items-center justify-end gap-1">
      <input
        type="number" min={0} step={1000}
        value={local} onChange={onChange}
        className="w-28 bg-transparent outline-none text-right text-sm tabular-nums"
        placeholder="—"
      />
      {st === "saving" && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse flex-shrink-0" />}
      {st === "saved"  && <Check size={10} className="text-emerald-400 flex-shrink-0" />}
    </div>
  );
}

// ─── Panneau gestionnaire de colonnes ─────────────────────────────────────────
function ColumnManagerPanel({
  catLabel, configs, onChange, onReset, onClose, initialView = "manage",
}: {
  catLabel: string;
  configs: ColConfig[];
  onChange: (c: ColConfig[]) => void;
  onReset: () => void;
  onClose: () => void;
  initialView?: "manage" | "add";
}) {
  const [view, setView] = useState<"manage" | "add">(initialView);

  // Colonnes avec leur index d'origine pour pouvoir les modifier
  const withIdx = configs.map((c, i) => ({ ...c, idx: i }));
  const activeCols = withIdx.filter(c => c.visible);
  const hiddenCols = withIdx.filter(c => !c.visible);

  const addCol    = (idx: number) => onChange(configs.map((c, i) => i === idx ? { ...c, visible: true  } : c));
  const removeCol = (idx: number) => onChange(configs.map((c, i) => i === idx ? { ...c, visible: false } : c));
  const renameCol = (idx: number, label: string) => onChange(configs.map((c, i) => i === idx ? { ...c, label } : c));

  const PURPLE = "#7C3AED";

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div
        className="relative z-10 h-full w-full max-w-sm flex flex-col shadow-2xl"
        style={{ background: "var(--background)", borderLeft: `1px solid color-mix(in oklch, ${PURPLE} 30%, transparent)` }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b"
          style={{ borderColor: "color-mix(in oklch, var(--foreground) 8%, transparent)" }}>
          <div>
            <div className="flex items-center gap-2">
              <Columns size={18} style={{ color: PURPLE }} />
              <h2 className="font-bold text-base">Colonnes de prix</h2>
            </div>
            <p className="text-xs mt-0.5" style={{ color: "color-mix(in oklch, var(--foreground) 50%, transparent)" }}>
              <span className="font-semibold">{catLabel}</span> · {activeCols.length} active(s)
            </p>
          </div>
          <button onClick={onClose}
            className="rounded-lg p-1.5 transition-colors hover:bg-[color-mix(in_oklch,var(--foreground)_8%,transparent)]">
            <X size={18} />
          </button>
        </div>

        {/* Onglets */}
        <div className="flex border-b px-5"
          style={{ borderColor: "color-mix(in oklch, var(--foreground) 8%, transparent)" }}>
          {(["manage", "add"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className="py-3 px-1 mr-5 text-xs font-semibold border-b-2 transition-all"
              style={{
                borderColor: view === v ? PURPLE : "transparent",
                color: view === v ? PURPLE : "color-mix(in oklch, var(--foreground) 45%, transparent)",
              }}
            >
              {v === "manage"
                ? `Colonnes actives (${activeCols.length})`
                : `+ Ajouter une colonne (${hiddenCols.length})`}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">

          {/* ── VUE : Colonnes actives ── */}
          {view === "manage" && (
            <div className="space-y-3">
              {activeCols.length === 0 && (
                <div className="text-center py-12">
                  <Columns size={32} className="mx-auto mb-3 opacity-20" />
                  <p className="text-sm opacity-40">Aucune colonne active</p>
                  <button
                    onClick={() => setView("add")}
                    className="mt-4 text-xs font-semibold rounded-full px-4 py-2 transition-all hover:scale-105"
                    style={{ background: `color-mix(in oklch, ${PURPLE} 12%, transparent)`, color: PURPLE }}
                  >
                    + Ajouter une colonne
                  </button>
                </div>
              )}

              {activeCols.map((col) => (
                <div
                  key={col.key}
                  className="rounded-xl p-4"
                  style={{
                    background: `color-mix(in oklch, ${PURPLE} 6%, transparent)`,
                    border: `1px solid color-mix(in oklch, ${PURPLE} 20%, transparent)`,
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className="text-[10px] font-mono rounded px-1.5 py-0.5"
                      style={{
                        background: `color-mix(in oklch, ${PURPLE} 12%, transparent)`,
                        color: `color-mix(in oklch, ${PURPLE} 80%, transparent)`,
                      }}
                    >
                      {col.key}
                    </span>
                    <button
                      onClick={() => removeCol(col.idx)}
                      title="Masquer cette colonne"
                      className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium transition-all hover:scale-105"
                      style={{ color: "color-mix(in oklch, var(--foreground) 40%, transparent)", border: "1px solid color-mix(in oklch, var(--foreground) 12%, transparent)" }}
                    >
                      <X size={10} /> Masquer
                    </button>
                  </div>
                  <label className="text-xs block mb-1.5" style={{ color: "color-mix(in oklch, var(--foreground) 55%, transparent)" }}>
                    Nom affiché dans le tableau
                  </label>
                  <input
                    value={col.label}
                    onChange={(e) => renameCol(col.idx, e.target.value)}
                    className="w-full rounded-lg px-3 py-2 text-sm font-medium bg-transparent focus:outline-none"
                    style={{ border: `1px solid color-mix(in oklch, ${PURPLE} 35%, transparent)` }}
                    placeholder="Nom de la colonne"
                  />
                </div>
              ))}

              {activeCols.length > 0 && (
                <button
                  onClick={() => setView("add")}
                  className="w-full rounded-xl py-3 text-xs font-semibold border-dashed border-2 transition-all hover:scale-[1.01]"
                  style={{
                    borderColor: `color-mix(in oklch, ${PURPLE} 25%, transparent)`,
                    color: `color-mix(in oklch, ${PURPLE} 70%, transparent)`,
                  }}
                >
                  + Ajouter une autre colonne
                </button>
              )}
            </div>
          )}

          {/* ── VUE : Ajouter une colonne ── */}
          {view === "add" && (
            <div className="space-y-3">
              <p className="text-xs pb-1" style={{ color: "color-mix(in oklch, var(--foreground) 45%, transparent)" }}>
                Sélectionnez un champ de prix à ajouter au tableau pour la catégorie <strong>{catLabel}</strong>.
              </p>

              {hiddenCols.length === 0 && (
                <div className="text-center py-12">
                  <Check size={32} className="mx-auto mb-3 text-emerald-400" />
                  <p className="text-sm font-medium">Toutes les colonnes sont déjà actives !</p>
                  <button
                    onClick={() => setView("manage")}
                    className="mt-4 text-xs font-semibold rounded-full px-4 py-2 transition-all hover:scale-105"
                    style={{ background: `color-mix(in oklch, ${PURPLE} 12%, transparent)`, color: PURPLE }}
                  >
                    Gérer les colonnes actives
                  </button>
                </div>
              )}

              {hiddenCols.map((col) => (
                <button
                  key={col.key}
                  onClick={() => { addCol(col.idx); setView("manage"); }}
                  className="w-full rounded-xl p-4 text-left transition-all hover:scale-[1.02] group"
                  style={{
                    background: "color-mix(in oklch, var(--foreground) 3%, transparent)",
                    border: "1px solid color-mix(in oklch, var(--foreground) 10%, transparent)",
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold">{col.label}</p>
                      <p className="text-[10px] font-mono mt-0.5" style={{ color: "color-mix(in oklch, var(--foreground) 35%, transparent)" }}>
                        {col.key}
                      </p>
                    </div>
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center transition-all group-hover:scale-110"
                      style={{ background: `color-mix(in oklch, ${PURPLE} 15%, transparent)`, color: PURPLE }}
                    >
                      <Plus size={16} strokeWidth={2.5} />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t flex items-center gap-3"
          style={{ borderColor: "color-mix(in oklch, var(--foreground) 8%, transparent)" }}>
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all hover:scale-105"
            style={{
              border: "1px solid color-mix(in oklch, var(--foreground) 15%, transparent)",
              color: "color-mix(in oklch, var(--foreground) 55%, transparent)",
            }}
          >
            <RotateCcw size={13} /> Réinitialiser
          </button>
          <button
            onClick={onClose}
            className="flex-1 rounded-lg py-2 text-sm font-semibold text-white transition-all hover:scale-105"
            style={{ background: `linear-gradient(135deg, ${PURPLE}, #0B4FCC)` }}
          >
            Appliquer & Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Composant principal ──────────────────────────────────────────────────────
export default function AdminCatalogue() {
  const [items, setItems]     = useState<AfriNomadeCatalogue[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [toast, setToast]     = useState<{ ok: boolean; msg: string } | null>(null);

  // Colonnes configurables
  const [colConfigs, setColConfigs]         = useState<CatalogueColConfigs>(DEFAULT_COL_CONFIGS);
  const [showColManager, setShowColManager] = useState(false);
  const [colManagerView, setColManagerView] = useState<"manage" | "add">("manage");

  // Filtres
  const [activeTab,   setActiveTab]   = useState<CatKey>("hebergement");
  const [search,      setSearch]      = useState("");
  const [filterActif, setFilterActif] = useState<"all" | "oui" | "non">("all");
  const [filterPays,  setFilterPays]  = useState("");

  // Sélection
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Tri
  const [sortField, setSortField] = useState<keyof AfriNomadeCatalogue>("label");
  const [sortDir,   setSortDir]   = useState<SortDir>("asc");

  // Import
  const fileRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting]   = useState(false);
  const [importMode, setImportMode] = useState<"merge" | "replace">("merge");

  // Synchronisation
  const [syncing,    setSyncing]    = useState(false);
  const [justSynced, setJustSynced] = useState(false);

  // Devises
  const [showConverter, setShowConverter] = useState(false);

  // ── Charger configs colonnes depuis localStorage ──────────────────────────────
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved) {
        const parsed: CatalogueColConfigs = JSON.parse(saved);
        // Fusionner avec les defaults pour les catégories manquantes
        setColConfigs({ ...DEFAULT_COL_CONFIGS, ...parsed });
      }
    } catch { /* ignore */ }
  }, []);

  const persistColConfigs = useCallback((next: CatalogueColConfigs) => {
    setColConfigs(next);
    try { localStorage.setItem(LS_KEY, JSON.stringify(next)); } catch { /* ignore */ }
  }, []);

  // ── Chargement des données ────────────────────────────────────────────────────
  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setSyncing(true);
    try {
      const res = await fetch("/api/admin/afrinomade/catalogue");
      if (res.ok) {
        setItems(await res.json());
        if (silent) {
          setJustSynced(true);
          setTimeout(() => setJustSynced(false), 3000);
        }
      }
    } finally {
      if (!silent) setLoading(false);
      else setSyncing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Auto-refresh toutes les 30 secondes ──────────────────────────────────────
  useEffect(() => {
    const id = setInterval(() => load(true), 30_000);
    return () => clearInterval(id);
  }, [load]);

  // ── Données filtrées + triées ─────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let data = items.filter((i) => i.categorie === activeTab);
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter((i) =>
        i.label.toLowerCase().includes(q) || (i.pays ?? "").toLowerCase().includes(q)
      );
    }
    if (filterActif === "oui") data = data.filter((i) => i.actif !== false);
    if (filterActif === "non") data = data.filter((i) => i.actif === false);
    if (filterPays.trim()) {
      const p = filterPays.toLowerCase();
      data = data.filter((i) => (i.pays ?? "").toLowerCase().includes(p));
    }
    if (sortField && sortDir) {
      data = [...data].sort((a, b) => {
        const av = a[sortField] ?? "";
        const bv = b[sortField] ?? "";
        const cmp = typeof av === "number" && typeof bv === "number"
          ? av - bv
          : String(av).localeCompare(String(bv));
        return sortDir === "asc" ? cmp : -cmp;
      });
    }
    return data;
  }, [items, activeTab, search, filterActif, filterPays, sortField, sortDir]);

  const currentColConfigs = colConfigs[activeTab] ?? DEFAULT_COL_CONFIGS[activeTab];
  const visibleCols       = currentColConfigs.filter(c => c.visible);

  // ── Tri colonnes ──────────────────────────────────────────────────────────────
  const toggleSort = (field: keyof AfriNomadeCatalogue) => {
    if (sortField === field) setSortDir((d) => d === "asc" ? "desc" : d === "desc" ? null : "asc");
    else { setSortField(field); setSortDir("asc"); }
  };
  const SortIcon = ({ field }: { field: keyof AfriNomadeCatalogue }) => {
    if (sortField !== field || !sortDir) return <ChevronUp size={12} className="opacity-20" />;
    return sortDir === "asc" ? <ChevronUp size={12} /> : <ChevronDown size={12} />;
  };

  // ── Sélection ─────────────────────────────────────────────────────────────────
  const toggleSelect = (id: string) =>
    setSelected((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleAll = () =>
    setSelected(selected.size === filtered.length ? new Set() : new Set(filtered.map((i) => i.id!)));
  const allSelected = filtered.length > 0 && selected.size === filtered.length;

  // ── CRUD ──────────────────────────────────────────────────────────────────────
  const notify = (ok: boolean, msg: string) => setToast({ ok, msg });

  const update = useCallback(async (id: string, field: keyof AfriNomadeCatalogue, value: unknown): Promise<void> => {
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, [field]: value } : i));
    const res = await fetch("/api/admin/afrinomade/catalogue", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, [field]: value }),
    });
    if (!res.ok) notify(false, "Erreur lors de la sauvegarde");
  }, []);

  const add = async () => {
    const newItem: AfriNomadeCatalogue = {
      categorie: activeTab,
      label: "Nouveau service",
      pays: filterPays.trim() || "CI",
      unite: visibleCols.some(c => c.key === "prix_journee") ? "jour"
           : visibleCols.some(c => c.key === "prix_par_personne") ? "personne" : "nuit",
      actif: true,
    };
    setSaving(true);
    const res = await fetch("/api/admin/afrinomade/catalogue", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newItem),
    });
    if (res.ok) {
      const created = await res.json();
      setItems((prev) => [...prev, created]);
      notify(true, "Ligne ajoutée !");
    } else {
      notify(false, "Erreur lors de l'ajout");
    }
    setSaving(false);
  };

  const remove = async (id: string) => {
    if (!confirm("Supprimer cette ligne ?")) return;
    await fetch("/api/admin/afrinomade/catalogue", {
      method: "DELETE", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setItems((prev) => prev.filter((i) => i.id !== id));
    setSelected((s) => { const n = new Set(s); n.delete(id); return n; });
    notify(true, "Ligne supprimée");
  };

  const bulkDelete = async () => {
    if (selected.size === 0) return;
    if (!confirm(`Supprimer les ${selected.size} ligne(s) sélectionnée(s) ?`)) return;
    for (const id of selected) {
      await fetch("/api/admin/afrinomade/catalogue", {
        method: "DELETE", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
    }
    setItems((prev) => prev.filter((i) => !selected.has(i.id!)));
    setSelected(new Set());
    notify(true, `${selected.size} ligne(s) supprimée(s)`);
  };

  const toggleActif = (id: string, val: boolean) => update(id, "actif", val);

  // ── Export ────────────────────────────────────────────────────────────────────
  const exportData = async (mode: "data" | "template") => {
    const res = await fetch(`/api/admin/afrinomade/catalogue/export?mode=${mode}`);
    if (!res.ok) { notify(false, "Erreur lors de l'export"); return; }
    const blob = await res.blob();
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url;
    a.download = mode === "template"
      ? "template-catalogue-afrinomade.xlsx"
      : `catalogue-${new Date().toISOString().slice(0, 10)}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
    notify(true, mode === "template" ? "Template téléchargé !" : "Export téléchargé !");
  };

  // ── Import ────────────────────────────────────────────────────────────────────
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("mode", importMode);
    const res = await fetch("/api/admin/afrinomade/catalogue/import", { method: "POST", body: fd });
    const data = await res.json();
    if (res.ok) { notify(true, data.message); load(); }
    else notify(false, data.error || "Erreur lors de l'import");
    setImporting(false);
    e.target.value = "";
  };

  // ── Gestion colonnes ──────────────────────────────────────────────────────────
  const updateColConfig = (configs: ColConfig[]) =>
    persistColConfigs({ ...colConfigs, [activeTab]: configs });

  const resetColConfig = () =>
    persistColConfigs({ ...colConfigs, [activeTab]: DEFAULT_COL_CONFIGS[activeTab] });

  // ── Stats ─────────────────────────────────────────────────────────────────────
  const catCount   = items.filter((i) => i.categorie === activeTab).length;
  const actifCount = items.filter((i) => i.categorie === activeTab && i.actif !== false).length;

  const CARD_STYLE = {
    background: "color-mix(in oklch, var(--foreground) 3%, transparent)",
    border: "1px solid color-mix(in oklch, var(--foreground) 8%, transparent)",
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 rounded-full border-2 animate-spin"
        style={{ borderColor: "#0BA5A4", borderTopColor: "transparent" }} />
    </div>
  );

  return (
    <div className="space-y-5">
      {toast && <Toast ok={toast.ok} msg={toast.msg} onClose={() => setToast(null)} />}
      {showConverter && <CurrencyConverter onClose={() => setShowConverter(false)} />}
      {showColManager && (
        <ColumnManagerPanel
          catLabel={CATEGORIES.find(c => c.key === activeTab)?.label ?? activeTab}
          configs={currentColConfigs}
          onChange={updateColConfig}
          onReset={resetColConfig}
          onClose={() => setShowColManager(false)}
          initialView={colManagerView}
        />
      )}

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <Link href="/admin/afrinomade/demandes"
            className="flex items-center gap-1 text-xs mb-2" style={{ color: "#0BA5A4" }}>
            <ArrowLeft size={13} /> Retour aux demandes
          </Link>
          <div className="flex items-center gap-2 mb-1">
            <ClipboardList size={22} style={{ color: "#0BA5A4" }} strokeWidth={1.8} />
            <h1 className="text-2xl font-bold">Catalogue des prix</h1>
            {/* Indicateur sync */}
            <div
              className="flex items-center gap-1.5 ml-2 rounded-full px-2.5 py-1"
              style={{
                background: "color-mix(in oklch, #0BA5A4 10%, transparent)",
                border: "1px solid color-mix(in oklch, #0BA5A4 25%, transparent)",
              }}
            >
              {syncing
                ? <RefreshCw size={11} className="animate-spin" style={{ color: "#0BA5A4" }} />
                : justSynced
                  ? <Check size={11} className="text-emerald-400" />
                  : <span className="w-2 h-2 rounded-full bg-emerald-400" />
              }
              <span className="text-[10px] font-medium" style={{ color: "#0BA5A4" }}>
                {syncing ? "Sync…" : justSynced ? "Synchronisé !" : "En direct"}
              </span>
            </div>
          </div>
          <p className="text-sm pl-7" style={{ color: "color-mix(in oklch, var(--foreground) 50%, transparent)" }}>
            {catCount} entrées · {actifCount} actives · sync auto toutes les 30s
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => load(true)} disabled={syncing}
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all hover:scale-105 disabled:opacity-50"
            style={CARD_STYLE} title="Synchroniser maintenant"
          >
            <RefreshCw size={13} className={syncing ? "animate-spin" : ""} /> Actualiser
          </button>
          <button
            onClick={() => { setColManagerView("add"); setShowColManager(true); }}
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all hover:scale-105"
            style={{ ...CARD_STYLE, color: "#7C3AED", borderColor: "color-mix(in oklch, #7C3AED 30%, transparent)" }}
            title="Ajouter une colonne"
          >
            <Plus size={14} /> Colonne
          </button>
          <button
            onClick={() => { setColManagerView("manage"); setShowColManager(true); }}
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all hover:scale-105"
            style={{ ...CARD_STYLE, color: "#7C3AED", borderColor: "color-mix(in oklch, #7C3AED 30%, transparent)" }}
            title="Gérer les colonnes visibles"
          >
            <Columns size={14} /> Colonnes ({visibleCols.length})
          </button>
          <button
            onClick={() => setShowConverter(true)}
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all hover:scale-105"
            style={{ ...CARD_STYLE, color: "#CFAE63", borderColor: "color-mix(in oklch, #CFAE63 25%, transparent)" }}
          >
            <TrendingUp size={14} /> Devises
          </button>
          <button
            onClick={() => exportData("template")}
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all hover:scale-105"
            style={{ ...CARD_STYLE, color: "#0BA5A4" }}
          >
            <FileSpreadsheet size={14} /> Template
          </button>
          <button
            onClick={() => exportData("data")}
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all hover:scale-105"
            style={{ ...CARD_STYLE, color: "#0BA5A4" }}
          >
            <Download size={14} /> Exporter
          </button>
          <div className="flex items-center gap-1">
            <select
              value={importMode}
              onChange={(e) => setImportMode(e.target.value as "merge" | "replace")}
              className="rounded-l-lg px-2 py-2 text-xs focus:outline-none"
              style={CARD_STYLE}
            >
              <option value="merge">Fusionner</option>
              <option value="replace">Remplacer tout</option>
            </select>
            <button
              onClick={() => fileRef.current?.click()} disabled={importing}
              className="flex items-center gap-1.5 rounded-r-lg px-3 py-2 text-xs font-semibold text-white transition-all hover:scale-105 disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #0BA5A4, #0B4FCC)" }}
            >
              {importing ? <RefreshCw size={14} className="animate-spin" /> : <Upload size={14} />}
              Importer
            </button>
            <input ref={fileRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleImport} />
          </div>
        </div>
      </div>

      {/* ── Tabs catégories ──────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-1.5">
        {CATEGORIES.map((c) => {
          const Icon   = c.icon;
          const active = activeTab === c.key;
          const cnt    = items.filter((i) => i.categorie === c.key).length;
          return (
            <button
              key={c.key}
              onClick={() => {
                setActiveTab(c.key);
                setSelected(new Set());
                setSearch("");
                setFilterPays("");
                setFilterActif("all");
              }}
              className="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all"
              style={{
                background: active ? c.color : "color-mix(in oklch, var(--foreground) 5%, transparent)",
                color: active ? "white" : "color-mix(in oklch, var(--foreground) 65%, transparent)",
                border: `1px solid ${active ? c.color : "color-mix(in oklch, var(--foreground) 10%, transparent)"}`,
              }}
            >
              <Icon size={12} strokeWidth={active ? 2.2 : 1.8} />
              {c.label}
              <span
                className="ml-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold"
                style={{ background: active ? "rgba(255,255,255,0.25)" : "color-mix(in oklch, var(--foreground) 10%, transparent)" }}
              >
                {cnt}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Barre de filtres ─────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 opacity-40" />
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher…"
            className="rounded-lg pl-8 pr-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#0BA5A4]"
            style={CARD_STYLE}
          />
        </div>
        <div className="flex items-center gap-1">
          <Filter size={12} className="opacity-40" />
          {(["all", "oui", "non"] as const).map((v) => (
            <button
              key={v} onClick={() => setFilterActif(v)}
              className="rounded-full px-3 py-1.5 text-xs font-medium transition-all"
              style={{
                background: filterActif === v ? "#0BA5A4" : "color-mix(in oklch, var(--foreground) 5%, transparent)",
                color: filterActif === v ? "white" : "color-mix(in oklch, var(--foreground) 60%, transparent)",
              }}
            >
              {v === "all" ? "Tous" : v === "oui" ? "Actifs" : "Inactifs"}
            </button>
          ))}
        </div>
        <input
          value={filterPays} onChange={(e) => setFilterPays(e.target.value)}
          placeholder="Filtrer par pays…"
          className="rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#0BA5A4] w-40"
          style={CARD_STYLE}
        />
        {selected.size > 0 && (
          <button
            onClick={bulkDelete}
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-red-500 transition-all hover:bg-red-50"
            style={{ border: "1px solid rgba(239,68,68,0.3)" }}
          >
            <Trash2 size={12} /> Supprimer {selected.size} ligne(s)
          </button>
        )}
        <span className="text-xs ml-auto" style={{ color: "color-mix(in oklch, var(--foreground) 40%, transparent)" }}>
          {filtered.length} résultat(s)
        </span>
      </div>

      {/* ── Tableau ──────────────────────────────────────────────────────────── */}
      <div className="rounded-xl overflow-x-auto"
        style={{ border: "1px solid color-mix(in oklch, #0BA5A4 20%, transparent)" }}>
        <table className="w-full text-sm border-collapse min-w-[700px]">
          <thead>
            <tr style={{ background: "color-mix(in oklch, #0BA5A4 8%, transparent)" }}>
              <th className="px-3 py-3 w-8">
                <button onClick={toggleAll}>
                  {allSelected
                    ? <CheckSquare size={15} style={{ color: "#0BA5A4" }} />
                    : <Square size={15} className="opacity-40" />}
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button className="flex items-center gap-1 text-xs font-semibold" onClick={() => toggleSort("label")}>
                  Libellé <SortIcon field="label" />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button className="flex items-center gap-1 text-xs font-semibold" onClick={() => toggleSort("pays")}>
                  Pays <SortIcon field="pays" />
                </button>
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold">Unité</th>
              {visibleCols.map((col) => (
                <th key={col.key} className="px-4 py-3 text-right">
                  <button
                    className="flex items-center gap-1 text-xs font-semibold ml-auto"
                    onClick={() => toggleSort(col.key)}
                  >
                    {col.label} <SortIcon field={col.key} />
                  </button>
                </th>
              ))}
              {/* Raccourci + Colonne dans l'en-tête */}
              <th className="px-3 py-3 text-right">
                <button
                  onClick={() => { setColManagerView("add"); setShowColManager(true); }}
                  title="Ajouter une colonne"
                  className="flex items-center gap-0.5 rounded-md px-1.5 py-1 text-[10px] font-semibold transition-colors hover:bg-[color-mix(in_oklch,#7C3AED_12%,transparent)]"
                  style={{ color: "color-mix(in oklch, #7C3AED 70%, transparent)" }}
                >
                  <Plus size={11} strokeWidth={2.5} /> col.
                </button>
              </th>
              <th className="px-4 py-3 text-center">
                <button className="flex items-center gap-1 text-xs font-semibold mx-auto" onClick={() => toggleSort("actif")}>
                  Actif <SortIcon field="actif" />
                </button>
              </th>
              <th className="px-3 py-3 w-8" />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6 + visibleCols.length} className="px-4 py-12 text-center text-sm opacity-50">
                  Aucune entrée trouvée
                </td>
              </tr>
            )}
            {filtered.map((item, idx) => {
              const isSelected = selected.has(item.id!);
              return (
                <tr
                  key={item.id}
                  className="border-t transition-colors"
                  style={{
                    borderColor: "color-mix(in oklch, var(--foreground) 5%, transparent)",
                    background: isSelected
                      ? "color-mix(in oklch, #0BA5A4 8%, transparent)"
                      : idx % 2 === 0
                        ? "transparent"
                        : "color-mix(in oklch, var(--foreground) 1.5%, transparent)",
                  }}
                >
                  <td className="px-3 py-2.5">
                    <button onClick={() => toggleSelect(item.id!)}>
                      {isSelected
                        ? <CheckSquare size={14} style={{ color: "#0BA5A4" }} />
                        : <Square size={14} className="opacity-30" />}
                    </button>
                  </td>
                  {/* Libellé */}
                  <td className="px-4 py-2.5">
                    <InlineText
                      value={item.label}
                      onSave={(v) => update(item.id!, "label", v)}
                      className="bg-transparent outline-none font-medium text-sm w-full min-w-[140px] rounded px-1 focus:bg-[color-mix(in_oklch,var(--foreground)_5%,transparent)]"
                    />
                  </td>
                  {/* Pays */}
                  <td className="px-4 py-2.5">
                    <InlineText
                      value={item.pays ?? ""}
                      onSave={(v) => update(item.id!, "pays", v || null)}
                      className="bg-transparent outline-none text-xs w-16 rounded px-1 focus:bg-[color-mix(in_oklch,var(--foreground)_5%,transparent)]"
                      placeholder="CI"
                    />
                  </td>
                  {/* Unité */}
                  <td className="px-4 py-2.5">
                    <InlineText
                      value={item.unite ?? ""}
                      onSave={(v) => update(item.id!, "unite", v || null)}
                      className="bg-transparent outline-none text-xs w-20 rounded px-1 focus:bg-[color-mix(in_oklch,var(--foreground)_5%,transparent)]"
                      placeholder="nuit"
                    />
                  </td>
                  {/* Prix dynamiques */}
                  {visibleCols.map((col) => (
                    <td key={col.key} className="px-4 py-2.5 text-right">
                      <PriceCell
                        value={item[col.key] as number | undefined | null}
                        onSave={(v) => update(item.id!, col.key, v)}
                      />
                    </td>
                  ))}
                  {/* Spacer colonne icône */}
                  <td className="px-3 py-2.5" />
                  {/* Actif */}
                  <td className="px-4 py-2.5 text-center">
                    <button
                      onClick={() => toggleActif(item.id!, !(item.actif ?? true))}
                      className="rounded-full px-2.5 py-0.5 text-xs font-semibold transition-all"
                      style={{
                        background: item.actif !== false
                          ? "color-mix(in oklch, #0BA5A4 15%, transparent)"
                          : "color-mix(in oklch, var(--foreground) 8%, transparent)",
                        color: item.actif !== false
                          ? "#0BA5A4"
                          : "color-mix(in oklch, var(--foreground) 45%, transparent)",
                      }}
                    >
                      {item.actif !== false ? "Oui" : "Non"}
                    </button>
                  </td>
                  {/* Supprimer */}
                  <td className="px-3 py-2.5">
                    <button
                      onClick={() => remove(item.id!)}
                      className="rounded p-1 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 size={13} strokeWidth={2} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={add} disabled={saving}
          className="flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all hover:scale-105 disabled:opacity-40"
          style={{ border: "1.5px solid #0BA5A4", color: "#0BA5A4" }}
        >
          <Plus size={15} strokeWidth={2.2} /> Ajouter une ligne
        </button>
        <button
          onClick={() => { setColManagerView("add"); setShowColManager(true); }}
          className="flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all hover:scale-105"
          style={{ border: "1.5px solid #7C3AED", color: "#7C3AED" }}
        >
          <Plus size={15} strokeWidth={2.2} /> Ajouter une colonne
        </button>
        <button
          onClick={() => { setColManagerView("manage"); setShowColManager(true); }}
          className="flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all hover:scale-105"
          style={{ border: "1.5px solid color-mix(in oklch, #7C3AED 50%, transparent)", color: "color-mix(in oklch, #7C3AED 80%, transparent)" }}
        >
          <Columns size={15} strokeWidth={2} /> Gérer les colonnes
        </button>
        <p className="text-xs ml-auto" style={{ color: "color-mix(in oklch, var(--foreground) 40%, transparent)" }}>
          💡 Modifications sauvegardées instantanément · Sync auto toutes les 30s
        </p>
      </div>
    </div>
  );
}

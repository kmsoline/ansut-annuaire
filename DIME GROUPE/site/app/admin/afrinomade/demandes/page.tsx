"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Globe, ClipboardList, Search, MapPin, Target, Calendar, Users,
  BadgeDollarSign, ListChecks, Grid3X3, Columns3, List,
  ChevronDown, ArrowUpDown, SlidersHorizontal, Download,
  Filter, X, RefreshCw, Star, StarOff,
} from "lucide-react";
import { STATUT_LABELS, STATUT_COLORS, type AfriNomadeDemande, type StatutDemande } from "@/lib/afrinomade-types";

const STATUTS: (StatutDemande | "tous")[] = ["tous", "nouveau", "en_cours", "cote", "confirme", "annule"];
type ViewMode = "list" | "cards" | "kanban";
type SortKey = "date_desc" | "date_asc" | "montant_desc" | "montant_asc" | "nom_asc";

const SORT_LABELS: Record<SortKey, string> = {
  date_desc:    "Plus récents",
  date_asc:     "Plus anciens",
  montant_desc: "Montant ↓",
  montant_asc:  "Montant ↑",
  nom_asc:      "Nom A→Z",
};

function sortDemandes(list: AfriNomadeDemande[], key: SortKey): AfriNomadeDemande[] {
  return [...list].sort((a, b) => {
    switch (key) {
      case "date_asc":     return (a.created_at ?? "") > (b.created_at ?? "") ? 1 : -1;
      case "montant_desc": return (b.montant_total ?? 0) - (a.montant_total ?? 0);
      case "montant_asc":  return (a.montant_total ?? 0) - (b.montant_total ?? 0);
      case "nom_asc":      return (`${a.nom} ${a.prenom}`).localeCompare(`${b.nom} ${b.prenom}`);
      default:             return (b.created_at ?? "") > (a.created_at ?? "") ? 1 : -1;
    }
  });
}

function StatutBadge({ statut }: { statut?: StatutDemande }) {
  const s = statut ?? "nouveau";
  return (
    <span className="rounded-full px-2.5 py-1 text-[11px] font-semibold text-white shrink-0"
      style={{ background: STATUT_COLORS[s] }}>
      {STATUT_LABELS[s]}
    </span>
  );
}

function Avatar({ prenom, nom }: { prenom?: string; nom?: string }) {
  return (
    <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
      style={{ background: "linear-gradient(135deg, var(--turquoise), var(--gold-premium))" }}>
      {prenom?.[0]}{nom?.[0]}
    </div>
  );
}

// ── Badge type de demande ─────────────────────────────────────────────────────
function TypeBadge({ type }: { type?: string }) {
  if (type === "residence") return (
    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
      style={{ background: "color-mix(in oklch, var(--gold-premium) 14%, transparent)", color: "var(--gold-premium)", border: "1px solid color-mix(in oklch, var(--gold-premium) 25%, transparent)" }}>
      🏠 Résidence
    </span>
  );
  if (type === "excursion") return (
    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
      style={{ background: "color-mix(in oklch, var(--turquoise) 14%, transparent)", color: "var(--turquoise)", border: "1px solid color-mix(in oklch, var(--turquoise) 25%, transparent)" }}>
      🗺️ Excursion
    </span>
  );
  if (type === "transport") return (
    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
      style={{ background: "color-mix(in oklch, #6366f1 14%, transparent)", color: "#6366f1", border: "1px solid color-mix(in oklch, #6366f1 25%, transparent)" }}>
      🚗 Transport
    </span>
  );
  return null;
}

// ── Card view ────────────────────────────────────────────────────────────────
function DemandeCard({ d }: { d: AfriNomadeDemande }) {
  return (
    <Link href={`/admin/afrinomade/demandes/${d.id}`}
      className="block rounded-xl p-4 glass hover:-translate-y-0.5 transition-all group">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <Avatar prenom={d.prenom} nom={d.nom} />
          <div className="min-w-0">
            <div className="font-semibold text-sm truncate">{d.prenom} {d.nom}</div>
            <div className="text-xs truncate" style={{ color: "color-mix(in oklch, var(--foreground) 50%, transparent)" }}>
              {d.email}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <StatutBadge statut={d.statut} />
          <TypeBadge type={d.type_service} />
        </div>
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs"
        style={{ color: "color-mix(in oklch, var(--foreground) 60%, transparent)" }}>
        {d.pays_destination && <span className="flex items-center gap-1"><MapPin size={11} />{d.pays_destination}</span>}
        {d.date_depart && <span className="flex items-center gap-1"><Calendar size={11} />{d.date_depart}</span>}
        {d.nb_adultes && <span className="flex items-center gap-1"><Users size={11} />{d.nb_adultes}A{d.nb_enfants ? `+${d.nb_enfants}E` : ""}</span>}
        {d.type_service === "residence" && d.nb_chambres && (
          <span className="flex items-center gap-1">🛏️ {d.nb_chambres} ch.</span>
        )}
      </div>
      {d.montant_total ? (
        <div className="mt-3 pt-2 border-t flex items-center justify-between"
          style={{ borderColor: "color-mix(in oklch, var(--foreground) 6%, transparent)" }}>
          <span className="text-xs" style={{ color: "color-mix(in oklch, var(--foreground) 50%, transparent)" }}>Total</span>
          <span className="text-sm font-bold" style={{ color: "var(--gold-premium)" }}>
            {d.montant_total.toLocaleString("fr-FR")} FCFA
          </span>
        </div>
      ) : null}
      <div className="mt-1 text-[10px]" style={{ color: "color-mix(in oklch, var(--foreground) 35%, transparent)" }}>
        {d.created_at ? new Date(d.created_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }) : ""}
      </div>
    </Link>
  );
}

// ── Kanban column ────────────────────────────────────────────────────────────
function KanbanColumn({ statut, demandes }: { statut: StatutDemande; demandes: AfriNomadeDemande[] }) {
  return (
    <div className="flex-1 min-w-[220px] max-w-[280px]">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: STATUT_COLORS[statut] }} />
          <span className="text-xs font-semibold">{STATUT_LABELS[statut]}</span>
        </div>
        <span className="text-xs font-bold rounded-full px-2 py-0.5"
          style={{ background: `color-mix(in oklch, ${STATUT_COLORS[statut]} 15%, transparent)`, color: STATUT_COLORS[statut] }}>
          {demandes.length}
        </span>
      </div>
      <div className="space-y-2">
        {demandes.map((d) => (
          <Link key={d.id} href={`/admin/afrinomade/demandes/${d.id}`}
            className="block rounded-xl p-3 glass hover:-translate-y-0.5 transition-all text-sm">
            <div className="font-medium truncate">{d.prenom} {d.nom}</div>
            {d.pays_destination && (
              <div className="text-xs mt-1 flex items-center gap-1" style={{ color: "color-mix(in oklch, var(--foreground) 55%, transparent)" }}>
                <MapPin size={10} />{d.pays_destination}
              </div>
            )}
            {d.montant_total ? (
              <div className="text-xs font-bold mt-1" style={{ color: "var(--gold-premium)" }}>
                {d.montant_total.toLocaleString("fr-FR")} F
              </div>
            ) : null}
          </Link>
        ))}
        {demandes.length === 0 && (
          <div className="rounded-xl p-4 text-center text-xs"
            style={{ border: "1.5px dashed color-mix(in oklch, var(--foreground) 10%, transparent)", color: "color-mix(in oklch, var(--foreground) 35%, transparent)" }}>
            Aucune demande
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function AdminAfriDemandes() {
  const [demandes, setDemandes] = useState<AfriNomadeDemande[]>([]);
  const [stats, setStats] = useState({ total: 0, nouveaux: 0, cotes: 0, confirmes: 0 });
  const [loading, setLoading] = useState(true);
  const [statut, setStatut] = useState<StatutDemande | "tous">("tous");
  const [typeFilter, setTypeFilter] = useState<"tous" | "residence" | "excursion" | "transport" | "voyage">("tous");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [sortKey, setSortKey] = useState<SortKey>("date_desc");
  const [showFilters, setShowFilters] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [pays, setPays] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ statut, search });
      if (pays) params.set("pays", pays);
      const res = await fetch(`/api/admin/afrinomade/demandes?${params}`);
      if (res.ok) {
        const data = await res.json();
        setDemandes(data.demandes);
        setStats(data.stats);
      }
    } finally {
      setLoading(false);
    }
  }, [statut, search, pays]);

  useEffect(() => { load(); }, [load]);

  const exportCSV = () => {
    const rows = [
      ["Nom", "Prénom", "Email", "Téléphone", "Pays", "Statut", "Date départ", "Voyageurs", "Montant", "Date demande"],
      ...demandes.map((d) => [
        d.nom, d.prenom, d.email, d.telephone ?? "",
        d.pays_destination ?? "", STATUT_LABELS[d.statut ?? "nouveau"],
        d.date_depart ?? "", String((d.nb_adultes ?? 0) + (d.nb_enfants ?? 0)),
        String(d.montant_total ?? ""),
        d.created_at ? new Date(d.created_at).toLocaleDateString("fr-FR") : "",
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
    a.download = `demandes-afrinomade-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  // Compteurs pour le filtre type
  const nbResidences = demandes.filter(d => d.type_service === "residence").length;
  const nbExcursions = demandes.filter(d => d.type_service === "excursion").length;
  const nbTransports = demandes.filter(d => d.type_service === "transport").length;
  const nbVoyages    = demandes.filter(d =>
    d.type_service !== "residence" && d.type_service !== "excursion" && d.type_service !== "transport"
  ).length;

  // Filtrage date + type + tri
  const displayed = sortDemandes(
    demandes.filter((d) => {
      if (dateFrom && d.date_depart && d.date_depart < dateFrom) return false;
      if (dateTo   && d.date_depart && d.date_depart > dateTo)   return false;
      if (typeFilter === "residence"  && d.type_service !== "residence")  return false;
      if (typeFilter === "excursion"  && d.type_service !== "excursion")  return false;
      if (typeFilter === "transport"  && d.type_service !== "transport")  return false;
      if (typeFilter === "voyage" && (
        d.type_service === "residence" ||
        d.type_service === "excursion" ||
        d.type_service === "transport"
      )) return false;
      return true;
    }),
    sortKey
  );

  const hasFilters = dateFrom || dateTo || pays;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Globe size={22} style={{ color: "var(--turquoise)" }} strokeWidth={1.8} />
            <h1 className="text-xl sm:text-2xl font-bold">Demandes AfriNomade</h1>
          </div>
          <p className="text-sm pl-7" style={{ color: "color-mix(in oklch, var(--foreground) 60%, transparent)" }}>
            Gérez et cotez les demandes de voyage reçues
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={exportCSV}
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all hover:scale-105"
            style={{ border: "1.5px solid color-mix(in oklch, var(--foreground) 15%, transparent)", color: "color-mix(in oklch, var(--foreground) 65%, transparent)" }}>
            <Download size={13} /> Export CSV
          </button>
          <button onClick={load}
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all hover:scale-105"
            style={{ border: "1.5px solid var(--turquoise)", color: "var(--turquoise)" }}>
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Actualiser
          </button>
          <Link href="/admin/afrinomade/catalogue"
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all"
            style={{ border: "1.5px solid var(--turquoise)", color: "var(--turquoise)" }}>
            <ListChecks size={13} /> Catalogue
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total",     value: stats.total,     color: "var(--turquoise)" },
          { label: "Nouveaux",  value: stats.nouveaux,  color: "#CFAE63" },
          { label: "Cotés",     value: stats.cotes,     color: "#3B82F6" },
          { label: "Confirmés", value: stats.confirmes, color: "#22C55E" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl p-4 glass" style={{ borderLeft: `3px solid ${s.color}` }}>
            <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs mt-0.5" style={{ color: "color-mix(in oklch, var(--foreground) 60%, transparent)" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filtre type de demande */}
      <div className="flex gap-2 flex-wrap">
        {([
          { key: "tous"      as const, label: `Tous (${demandes.length})`,           icon: "📋" },
          { key: "voyage"    as const, label: `Voyages (${nbVoyages})`,              icon: "🌍" },
          { key: "excursion" as const, label: `Excursions (${nbExcursions})`,        icon: "🗺️" },
          { key: "transport" as const, label: `Transports (${nbTransports})`,        icon: "🚗" },
          { key: "residence" as const, label: `Résidences (${nbResidences})`,        icon: "🏠" },
        ]).map(({ key, label, icon }) => (
          <button key={key} onClick={() => setTypeFilter(key)}
            className="rounded-full px-4 py-1.5 text-xs font-semibold transition-all"
            style={{
              background: typeFilter === key ? "var(--turquoise)" : "color-mix(in oklch, var(--turquoise) 8%, transparent)",
              color:      typeFilter === key ? "white" : "color-mix(in oklch, var(--foreground) 60%, transparent)",
              border: `1px solid ${typeFilter === key ? "var(--turquoise)" : "color-mix(in oklch, var(--turquoise) 20%, transparent)"}`,
            }}>
            {icon} {label}
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Statuts */}
        <div className="flex flex-wrap gap-1.5">
          {STATUTS.map((s) => (
            <button key={s} onClick={() => setStatut(s)}
              className="rounded-full px-3 py-1 text-xs font-semibold transition-all"
              style={{
                background: statut === s ? (s === "tous" ? "var(--turquoise)" : STATUT_COLORS[s as StatutDemande]) : "transparent",
                border: `1px solid ${s === "tous" ? "var(--turquoise)" : STATUT_COLORS[s as StatutDemande]}`,
                color: statut === s ? "white" : (s === "tous" ? "var(--turquoise)" : STATUT_COLORS[s as StatutDemande]),
              }}>
              {s === "tous" ? "Tous" : STATUT_LABELS[s as StatutDemande]}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 min-w-[160px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: "color-mix(in oklch, var(--foreground) 40%, transparent)" }} />
          <input placeholder="Nom, email, destination…" value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl pl-9 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--turquoise)]"
            style={{ background: "color-mix(in oklch, var(--background) 60%, transparent)", border: "1px solid color-mix(in oklch, var(--foreground) 15%, transparent)" }} />
        </div>

        {/* Right toolbar */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Filtres avancés toggle */}
          <button onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all ${hasFilters ? "text-white" : ""}`}
            style={{
              background: hasFilters ? "var(--turquoise)" : "transparent",
              border: `1px solid ${hasFilters ? "var(--turquoise)" : "color-mix(in oklch, var(--foreground) 15%, transparent)"}`,
              color: hasFilters ? "white" : "color-mix(in oklch, var(--foreground) 60%, transparent)",
            }}>
            <SlidersHorizontal size={13} />
            Filtres
            {hasFilters && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
          </button>

          {/* Sort */}
          <div className="relative">
            <select value={sortKey} onChange={(e) => setSortKey(e.target.value as SortKey)}
              className="appearance-none rounded-xl pl-8 pr-7 py-2 text-xs font-semibold outline-none cursor-pointer focus:ring-2 focus:ring-[var(--turquoise)]"
              style={{ background: "color-mix(in oklch, var(--foreground) 5%, transparent)", border: "1px solid color-mix(in oklch, var(--foreground) 12%, transparent)" }}>
              {(Object.keys(SORT_LABELS) as SortKey[]).map((k) => (
                <option key={k} value={k}>{SORT_LABELS[k]}</option>
              ))}
            </select>
            <ArrowUpDown size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: "color-mix(in oklch, var(--foreground) 45%, transparent)" }} />
            <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: "color-mix(in oklch, var(--foreground) 45%, transparent)" }} />
          </div>

          {/* View mode */}
          <div className="flex rounded-xl overflow-hidden"
            style={{ border: "1px solid color-mix(in oklch, var(--foreground) 12%, transparent)" }}>
            {([
              { mode: "list",   Icon: List },
              { mode: "cards",  Icon: Grid3X3 },
              { mode: "kanban", Icon: Columns3 },
            ] as const).map(({ mode, Icon }) => (
              <button key={mode} onClick={() => setViewMode(mode)}
                className="p-2 transition-colors"
                style={{
                  background: viewMode === mode ? "color-mix(in oklch, var(--turquoise) 15%, transparent)" : "transparent",
                  color: viewMode === mode ? "var(--turquoise)" : "color-mix(in oklch, var(--foreground) 50%, transparent)",
                }}>
                <Icon size={15} />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filtres avancés */}
      {showFilters && (
        <div className="rounded-xl p-4 animate-fade-in-up flex flex-wrap gap-4 items-end"
          style={{ background: "color-mix(in oklch, var(--turquoise) 5%, transparent)", border: "1px solid color-mix(in oklch, var(--turquoise) 15%, transparent)" }}>
          <div className="flex flex-col gap-1 min-w-[160px]">
            <label className="text-xs font-semibold" style={{ color: "color-mix(in oklch, var(--foreground) 55%, transparent)" }}>Départ après</label>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
              className="rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-[var(--turquoise)]"
              style={{ background: "var(--background)", border: "1px solid color-mix(in oklch, var(--foreground) 12%, transparent)" }} />
          </div>
          <div className="flex flex-col gap-1 min-w-[160px]">
            <label className="text-xs font-semibold" style={{ color: "color-mix(in oklch, var(--foreground) 55%, transparent)" }}>Départ avant</label>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
              className="rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-[var(--turquoise)]"
              style={{ background: "var(--background)", border: "1px solid color-mix(in oklch, var(--foreground) 12%, transparent)" }} />
          </div>
          <div className="flex flex-col gap-1 min-w-[160px]">
            <label className="text-xs font-semibold" style={{ color: "color-mix(in oklch, var(--foreground) 55%, transparent)" }}>Pays destination</label>
            <input type="text" value={pays} onChange={(e) => setPays(e.target.value)}
              placeholder="Ex: Côte d'Ivoire"
              className="rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-[var(--turquoise)]"
              style={{ background: "var(--background)", border: "1px solid color-mix(in oklch, var(--foreground) 12%, transparent)" }} />
          </div>
          {hasFilters && (
            <button onClick={() => { setDateFrom(""); setDateTo(""); setPays(""); }}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all hover:bg-red-500/10"
              style={{ color: "#EF4444", border: "1px solid rgba(239,68,68,0.2)" }}>
              <X size={12} /> Effacer filtres
            </button>
          )}
        </div>
      )}

      {/* Count */}
      <div className="flex items-center justify-between text-xs"
        style={{ color: "color-mix(in oklch, var(--foreground) 50%, transparent)" }}>
        <span>{displayed.length} demande{displayed.length !== 1 ? "s" : ""}</span>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-8 h-8 rounded-full border-2 animate-spin"
            style={{ borderColor: "var(--turquoise)", borderTopColor: "transparent" }} />
        </div>
      ) : displayed.length === 0 ? (
        <div className="text-center py-16" style={{ color: "color-mix(in oklch, var(--foreground) 50%, transparent)" }}>
          <Globe size={40} className="mx-auto mb-3 opacity-30" />
          <p>Aucune demande trouvée</p>
        </div>
      ) : viewMode === "list" ? (
        /* ── Vue liste ──────────────────────────────────────────────────────── */
        <div className="space-y-2">
          {displayed.map((d) => (
            <Link key={d.id} href={`/admin/afrinomade/demandes/${d.id}`}
              className="flex items-center gap-4 rounded-xl px-4 py-3.5 glass hover:-translate-y-0.5 transition-all group">
              <Avatar prenom={d.prenom} nom={d.nom} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-sm">{d.prenom} {d.nom}</span>
                  <span className="text-xs hidden sm:inline" style={{ color: "color-mix(in oklch, var(--foreground) 50%, transparent)" }}>
                    {d.email}
                  </span>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1 text-xs"
                  style={{ color: "color-mix(in oklch, var(--foreground) 55%, transparent)" }}>
                  {d.pays_destination && <span className="flex items-center gap-1"><MapPin size={10} />{d.pays_destination}</span>}
                  {d.type_service && <span className="flex items-center gap-1"><Target size={10} />{d.type_service}</span>}
                  {d.date_depart && <span className="flex items-center gap-1"><Calendar size={10} />{d.date_depart}{d.nb_nuits ? ` · ${d.nb_nuits}n` : ""}</span>}
                  {d.nb_adultes !== undefined && <span className="flex items-center gap-1"><Users size={10} />{d.nb_adultes}A{d.nb_enfants ? `+${d.nb_enfants}E` : ""}</span>}
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0 flex-wrap justify-end">
                {d.montant_total && (
                  <span className="hidden sm:flex items-center gap-1 text-sm font-bold" style={{ color: "var(--gold-premium)" }}>
                    <BadgeDollarSign size={13} />{d.montant_total.toLocaleString("fr-FR")} F
                  </span>
                )}
                <TypeBadge type={d.type_service} />
                <StatutBadge statut={d.statut} />
                <span className="text-[10px] hidden md:block" style={{ color: "color-mix(in oklch, var(--foreground) 40%, transparent)" }}>
                  {d.created_at ? new Date(d.created_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" }) : ""}
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : viewMode === "cards" ? (
        /* ── Vue cartes ─────────────────────────────────────────────────────── */
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {displayed.map((d) => <DemandeCard key={d.id} d={d} />)}
        </div>
      ) : (
        /* ── Vue kanban ─────────────────────────────────────────────────────── */
        <div className="flex gap-4 overflow-x-auto pb-4">
          {(["nouveau", "en_cours", "cote", "confirme", "annule"] as StatutDemande[]).map((s) => (
            <KanbanColumn key={s} statut={s}
              demandes={displayed.filter((d) => (d.statut ?? "nouveau") === s)} />
          ))}
        </div>
      )}
    </div>
  );
}

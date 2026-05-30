"use client";
import { useEffect, useState, useMemo } from "react";
import { History, Loader2, Filter, Plus, Pencil, Trash2, RefreshCw } from "lucide-react";

interface AuditLog { id: string; type: string; action: string; entityId: string; entityTitle: string; userId?: string; changes?: Record<string, unknown>; createdAt: string; }

const CARD = { background: "color-mix(in oklch, var(--foreground) 2%, transparent)", border: "1px solid color-mix(in oklch, var(--foreground) 8%, transparent)" };

const TYPE_LABELS: Record<string, string> = {
  blog: "Article", portfolio: "Projet", service: "Service", faq: "FAQ",
  testimonial: "Témoignage", "client-logo": "Logo client", homepage: "Accueil",
  about: "À propos", legal: "Page légale", afrinomade: "AfriNomade",
  metadata: "SEO", navigation: "Navigation", settings: "Paramètres", user: "Utilisateur",
};

const ACTION_CONFIG: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  created: { icon: Plus,      color: "#16a34a", label: "Créé" },
  updated: { icon: Pencil,    color: "var(--royal-blue)", label: "Modifié" },
  deleted: { icon: Trash2,    color: "#ef4444", label: "Supprimé" },
};

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "à l'instant";
  if (min < 60) return `il y a ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `il y a ${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `il y a ${d}j`;
  return new Date(date).toLocaleDateString("fr-FR");
}

export default function AdminAuditLog() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [limit, setLimit] = useState(100);

  const load = () => {
    setLoading(true);
    const url = filter === "all" ? `/api/admin/audit-log?limit=${limit}` : `/api/admin/audit-log?type=${filter}&limit=${limit}`;
    fetch(url).then(r => r.ok ? r.json() : []).then(setLogs).catch(() => []).finally(() => setLoading(false));
  };

  useEffect(load, [filter, limit]);

  const types = useMemo(() => Array.from(new Set(logs.map(l => l.type))), [logs]);

  const grouped = useMemo(() => {
    const g: Record<string, AuditLog[]> = {};
    for (const log of logs) {
      const day = new Date(log.createdAt).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
      if (!g[day]) g[day] = [];
      g[day].push(log);
    }
    return g;
  }, [logs]);

  return (
    <div className="space-y-5 max-w-3xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "color-mix(in oklch, var(--gold-premium) 12%, transparent)" }}>
              <History size={16} strokeWidth={2} style={{ color: "var(--gold-premium)" }} />
            </div>
            <h1 className="text-2xl font-bold">Historique</h1>
          </div>
          <p className="text-sm ml-12" style={{ color: "color-mix(in oklch, var(--foreground) 50%, transparent)" }}>
            {logs.length} entrée{logs.length > 1 ? "s" : ""} dans le journal
          </p>
        </div>
        <button onClick={load} className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-110" style={CARD}>
          <RefreshCw size={15} style={{ color: "color-mix(in oklch, var(--foreground) 55%, transparent)" }} />
        </button>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-1.5">
          <Filter size={12} style={{ color: "color-mix(in oklch, var(--foreground) 40%, transparent)" }} />
          <span className="text-xs" style={{ color: "color-mix(in oklch, var(--foreground) 40%, transparent)" }}>Type :</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button onClick={() => setFilter("all")} className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
            style={{ background: filter === "all" ? "var(--royal-blue)" : "color-mix(in oklch, var(--foreground) 6%, transparent)", color: filter === "all" ? "#fff" : "color-mix(in oklch, var(--foreground) 60%, transparent)" }}>
            Tous ({logs.length})
          </button>
          {types.map(t => (
            <button key={t} onClick={() => setFilter(t)} className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
              style={{ background: filter === t ? "var(--royal-blue)" : "color-mix(in oklch, var(--foreground) 6%, transparent)", color: filter === t ? "#fff" : "color-mix(in oklch, var(--foreground) 60%, transparent)" }}>
              {TYPE_LABELS[t] || t} ({logs.filter(l => l.type === t).length})
            </button>
          ))}
        </div>
        <select value={limit} onChange={e => setLimit(Number(e.target.value))} className="ml-auto px-3 py-1.5 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-[var(--royal-blue)]" style={CARD}>
          {[50, 100, 200, 500].map(v => <option key={v} value={v}>{v} derniers</option>)}
        </select>
      </div>

      {/* Timeline */}
      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-[var(--royal-blue)]" /></div>
      ) : logs.length === 0 ? (
        <div className="text-center py-20 rounded-2xl" style={CARD}>
          <History size={36} strokeWidth={1.2} className="mx-auto mb-3" style={{ color: "color-mix(in oklch, var(--foreground) 25%, transparent)" }} />
          <p className="text-sm" style={{ color: "color-mix(in oklch, var(--foreground) 50%, transparent)" }}>Aucune entrée dans l'historique</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([day, dayLogs]) => (
            <div key={day}>
              {/* Séparateur jour */}
              <div className="flex items-center gap-3 mb-3">
                <div className="h-px flex-1" style={{ background: "color-mix(in oklch, var(--foreground) 8%, transparent)" }} />
                <span className="text-[11px] font-semibold uppercase tracking-widest px-3 py-1 rounded-full"
                  style={{ background: "color-mix(in oklch, var(--foreground) 5%, transparent)", color: "color-mix(in oklch, var(--foreground) 45%, transparent)" }}>
                  {day}
                </span>
                <div className="h-px flex-1" style={{ background: "color-mix(in oklch, var(--foreground) 8%, transparent)" }} />
              </div>
              {/* Entrées du jour */}
              <div className="space-y-1.5">
                {dayLogs.map(log => {
                  const cfg = ACTION_CONFIG[log.action] || { icon: History, color: "var(--royal-blue)", label: log.action };
                  const Icon = cfg.icon;
                  return (
                    <div key={log.id} className="group flex items-start gap-3 px-4 py-3 rounded-xl transition-all hover:bg-[color-mix(in_oklch,var(--foreground)_2%,transparent)]">
                      {/* Icône action */}
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                        style={{ background: `color-mix(in oklch, ${cfg.color} 12%, transparent)` }}>
                        <Icon size={12} strokeWidth={2.5} style={{ color: cfg.color }} />
                      </div>
                      {/* Contenu */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-semibold" style={{ color: cfg.color }}>{cfg.label}</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                            style={{ background: "color-mix(in oklch, var(--royal-blue) 8%, transparent)", color: "var(--royal-blue)" }}>
                            {TYPE_LABELS[log.type] || log.type}
                          </span>
                          <span className="text-sm font-medium truncate">{log.entityTitle}</span>
                        </div>
                        {log.changes && Object.keys(log.changes).length > 0 && (
                          <p className="text-[11px] mt-0.5" style={{ color: "color-mix(in oklch, var(--foreground) 42%, transparent)" }}>
                            {Object.keys(log.changes).length} champ{Object.keys(log.changes).length > 1 ? "s" : ""} modifié{Object.keys(log.changes).length > 1 ? "s" : ""} : {Object.keys(log.changes).join(", ")}
                          </p>
                        )}
                      </div>
                      {/* Heure */}
                      <span className="text-[11px] shrink-0 mt-0.5" style={{ color: "color-mix(in oklch, var(--foreground) 38%, transparent)" }}>
                        {new Date(log.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

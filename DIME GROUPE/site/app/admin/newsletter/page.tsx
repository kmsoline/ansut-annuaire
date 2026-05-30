"use client";

import { useEffect, useState, useCallback } from "react";
import { Users, TrendingUp, TrendingDown, Calendar, Download, Trash2, Search, RefreshCw } from "lucide-react";

interface Subscriber {
  id: string;
  email: string;
  name: string;
  source: string;
  active: boolean;
  created_at: string;
}

interface Stats {
  total: number;
  thisMonth: number;
  lastMonth: number;
  growth: number | null;
}

const PAGE_SIZE = 25;

export default function AdminNewsletter() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const [subRes, statsRes] = await Promise.all([
        fetch("/api/admin/newsletter"),
        fetch("/api/admin/newsletter?stats=1"),
      ]);
      if (!subRes.ok) throw new Error("Erreur chargement");
      const [subs, st] = await Promise.all([subRes.json(), statsRes.json()]);
      setSubscribers(subs);
      if (!st.error) setStats(st);
    } catch {
      setError("Impossible de charger les abonnés.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleDelete = async (id: string, email: string) => {
    if (!confirm(`Supprimer l'abonné "${email}" ?`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/newsletter?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setSubscribers(prev => prev.filter(s => s.id !== id));
        if (stats) setStats({ ...stats, total: stats.total - 1 });
      } else {
        alert("Erreur lors de la suppression.");
      }
    } catch {
      alert("Une erreur est survenue.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleExport = () => {
    const rows = filtered.map(s => ({
      Prénom: s.name || "",
      Email: s.email,
      Source: s.source || "site",
      Statut: s.active ? "Actif" : "Inactif",
      "Date d'inscription": new Date(s.created_at).toLocaleDateString("fr-FR", {
        day: "2-digit", month: "2-digit", year: "numeric",
      }),
    }));
    const headers = Object.keys(rows[0] || {});
    const csv = [
      headers.join(","),
      ...rows.map(r =>
        headers.map(h => `"${(r as Record<string, string>)[h] ?? ""}"`).join(",")
      ),
    ].join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `newsletter-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  const filtered = subscribers.filter(s =>
    s.email.toLowerCase().includes(search.toLowerCase()) ||
    (s.name || "").toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Reset page when search changes
  const handleSearch = (v: string) => { setSearch(v); setPage(1); };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });

  const GrowthBadge = () => {
    if (!stats || stats.growth === null) return <span className="text-xs text-white/40">—</span>;
    const up = stats.growth >= 0;
    return (
      <span className={`inline-flex items-center gap-1 text-xs font-medium ${up ? "text-green-400" : "text-red-400"}`}>
        {up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
        {up ? "+" : ""}{stats.growth}% vs mois dernier
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1">Newsletter</h1>
          <p className="text-white/50 text-sm">Gérez et exportez la liste de vos abonnés</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-sm transition-colors"
            title="Rafraîchir"
          >
            <RefreshCw size={14} />
          </button>
          <button
            onClick={handleExport}
            disabled={filtered.length === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-400 text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Download size={14} />
            Exporter CSV
          </button>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="glass glass-strong rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-[var(--royal-blue)]/15 flex items-center justify-center">
                <Users size={18} className="text-[var(--royal-blue)]" />
              </div>
              <span className="text-sm text-white/50">Total abonnés</span>
            </div>
            <p className="text-3xl font-bold">{stats.total.toLocaleString("fr-FR")}</p>
          </div>

          <div className="glass glass-strong rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                <Calendar size={18} className="text-emerald-400" />
              </div>
              <span className="text-sm text-white/50">Ce mois-ci</span>
            </div>
            <p className="text-3xl font-bold">{stats.thisMonth.toLocaleString("fr-FR")}</p>
            <div className="mt-1">
              <GrowthBadge />
            </div>
          </div>

          <div className="glass glass-strong rounded-xl p-5 col-span-2 md:col-span-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-purple-500/15 flex items-center justify-center">
                <TrendingUp size={18} className="text-purple-400" />
              </div>
              <span className="text-sm text-white/50">Mois dernier</span>
            </div>
            <p className="text-3xl font-bold">{stats.lastMonth.toLocaleString("fr-FR")}</p>
          </div>
        </div>
      )}

      {/* Recherche */}
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
        <input
          type="text"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Rechercher par email ou prénom…"
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/10 bg-white/5 text-sm outline-none focus:border-white/25 focus:ring-0 transition-colors placeholder:text-white/30"
        />
        {search && (
          <button
            onClick={() => handleSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 text-lg leading-none"
          >
            ×
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Table */}
      {isLoading ? (
        <div className="space-y-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-14 rounded-xl bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : paginated.length === 0 ? (
        <div className="glass glass-strong rounded-xl p-16 text-center">
          <Users size={40} className="mx-auto mb-4 text-white/20" />
          <p className="text-white/40 text-sm">
            {search ? `Aucun résultat pour « ${search} »` : "Aucun abonné pour le moment"}
          </p>
        </div>
      ) : (
        <div className="glass glass-strong rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-white/10 bg-white/3">
              <tr>
                <th className="text-left px-5 py-3.5 font-medium text-white/50">Abonné</th>
                <th className="text-left px-5 py-3.5 font-medium text-white/50 hidden sm:table-cell">Source</th>
                <th className="text-left px-5 py-3.5 font-medium text-white/50 hidden md:table-cell">Inscription</th>
                <th className="text-left px-5 py-3.5 font-medium text-white/50">Statut</th>
                <th className="px-5 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {paginated.map((s) => (
                <tr key={s.id} className="hover:bg-white/3 transition-colors group">
                  <td className="px-5 py-4">
                    {s.name ? (
                      <div>
                        <div className="font-medium">{s.name}</div>
                        <div className="text-white/50 text-xs">{s.email}</div>
                      </div>
                    ) : (
                      <div className="font-medium">{s.email}</div>
                    )}
                  </td>
                  <td className="px-5 py-4 hidden sm:table-cell">
                    <span className="px-2 py-0.5 rounded-md bg-white/8 text-white/50 text-xs capitalize">
                      {s.source || "site"}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-white/40 hidden md:table-cell">
                    {formatDate(s.created_at)}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${
                      s.active
                        ? "bg-green-500/15 text-green-400"
                        : "bg-white/10 text-white/40"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${s.active ? "bg-green-400" : "bg-white/30"}`} />
                      {s.active ? "Actif" : "Inactif"}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => handleDelete(s.id, s.email)}
                      disabled={deletingId === s.id}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/15 text-white/30 hover:text-red-400 transition-all disabled:opacity-50"
                      title="Supprimer"
                    >
                      {deletingId === s.id
                        ? <span className="inline-block w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                        : <Trash2 size={14} />
                      }
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3.5 border-t border-white/10 bg-white/2">
              <span className="text-xs text-white/40">
                {filtered.length} abonné{filtered.length > 1 ? "s" : ""}
                {search && ` • filtre actif`}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 rounded-lg text-xs bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  ‹
                </button>
                {[...Array(Math.min(totalPages, 7))].map((_, i) => {
                  const p = i + 1;
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-8 h-7 rounded-lg text-xs transition-colors ${
                        page === p
                          ? "bg-[var(--royal-blue)] text-white"
                          : "bg-white/5 hover:bg-white/10 text-white/60"
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
                {totalPages > 7 && page < totalPages - 3 && (
                  <span className="text-white/30 text-xs px-1">…</span>
                )}
                {totalPages > 7 && (
                  <button
                    onClick={() => setPage(totalPages)}
                    className={`w-8 h-7 rounded-lg text-xs transition-colors ${
                      page === totalPages
                        ? "bg-[var(--royal-blue)] text-white"
                        : "bg-white/5 hover:bg-white/10 text-white/60"
                    }`}
                  >
                    {totalPages}
                  </button>
                )}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 rounded-lg text-xs bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  ›
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

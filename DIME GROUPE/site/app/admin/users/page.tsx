"use client";
import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Plus, Search, Pencil, Users, Loader2, Shield, Edit3, Clock } from "lucide-react";

interface AdminUser { id: string; email: string; name: string; role: "admin" | "editor"; active: boolean; created_at: string; last_login?: string | null; }

const CARD = { background: "color-mix(in oklch, var(--foreground) 2%, transparent)", border: "1px solid color-mix(in oklch, var(--foreground) 8%, transparent)" };

function RoleBadge({ role }: { role: string }) {
  const isAdmin = role === "admin";
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold"
      style={{
        background: isAdmin ? "color-mix(in oklch, #8b5cf6 12%, transparent)" : "color-mix(in oklch, var(--royal-blue) 10%, transparent)",
        color: isAdmin ? "#7c3aed" : "var(--royal-blue)",
      }}>
      {isAdmin ? <Shield size={10} /> : <Edit3 size={10} />}
      {isAdmin ? "Administrateur" : "Éditeur"}
    </span>
  );
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold"
      style={{
        background: active ? "color-mix(in oklch, #22c55e 12%, transparent)" : "color-mix(in oklch, var(--foreground) 8%, transparent)",
        color: active ? "#16a34a" : "color-mix(in oklch, var(--foreground) 50%, transparent)",
      }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: active ? "#16a34a" : "color-mix(in oklch, var(--foreground) 30%, transparent)" }} />
      {active ? "Actif" : "Inactif"}
    </span>
  );
}

function initials(name: string) {
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
}

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => { fetch("/api/admin/users").then(r => r.ok ? r.json() : []).then(setUsers).catch(() => []).finally(() => setLoading(false)); }, []);

  const filtered = useMemo(() => users.filter(u => !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())), [users, search]);

  const del = async (id: string) => {
    if (!confirm("Désactiver cet utilisateur ?")) return;
    await fetch(`/api/admin/users/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ active: false }) });
    setUsers(prev => prev.map(u => u.id === id ? { ...u, active: false } : u));
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 size={24} className="animate-spin text-[var(--royal-blue)]" /></div>;

  const admins = users.filter(u => u.role === "admin").length;
  const editors = users.filter(u => u.role === "editor").length;

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "color-mix(in oklch, #8b5cf6 12%, transparent)" }}>
              <Users size={16} strokeWidth={2} style={{ color: "#8b5cf6" }} />
            </div>
            <h1 className="text-2xl font-bold">Utilisateurs</h1>
          </div>
          <p className="text-sm ml-12" style={{ color: "color-mix(in oklch, var(--foreground) 50%, transparent)" }}>
            {users.length} compte{users.length > 1 ? "s" : ""} · <span style={{ color: "#7c3aed" }}>{admins} admin{admins > 1 ? "s" : ""}</span> · {editors} éditeur{editors > 1 ? "s" : ""}
          </p>
        </div>
        <Link href="/admin/users/new" className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white hover:scale-105 transition-all" style={{ background: "#8b5cf6" }}>
          <Plus size={15} /> Nouvel utilisateur
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "color-mix(in oklch, var(--foreground) 38%, transparent)" }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher par nom ou email…"
          className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#8b5cf6]" style={CARD} />
      </div>

      {/* Liste */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 rounded-2xl" style={CARD}>
          <Users size={36} strokeWidth={1.2} className="mx-auto mb-3" style={{ color: "color-mix(in oklch, var(--foreground) 25%, transparent)" }} />
          <p className="text-sm font-medium mb-4" style={{ color: "color-mix(in oklch, var(--foreground) 50%, transparent)" }}>Aucun utilisateur</p>
          <Link href="/admin/users/new" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: "#8b5cf6" }}><Plus size={14} /> Ajouter</Link>
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={CARD}>
          {/* Header */}
          <div className="grid grid-cols-[auto_1fr_auto_auto_auto] px-5 py-3 text-[11px] font-semibold uppercase tracking-widest gap-4"
            style={{ borderBottom: "1px solid color-mix(in oklch, var(--foreground) 6%, transparent)", color: "color-mix(in oklch, var(--foreground) 38%, transparent)" }}>
            <span />
            <span>Utilisateur</span>
            <span>Rôle</span>
            <span>Statut</span>
            <span className="text-right">Actions</span>
          </div>
          <div className="divide-y" style={{ "--tw-divide-color": "color-mix(in oklch, var(--foreground) 5%, transparent)" } as React.CSSProperties}>
            {filtered.map(user => (
              <div key={user.id} className="group grid grid-cols-[auto_1fr_auto_auto_auto] items-center gap-4 px-5 py-4 transition-all hover:bg-[color-mix(in_oklch,var(--foreground)_2%,transparent)]">
                {/* Avatar */}
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{ background: user.role === "admin" ? "#8b5cf6" : "var(--royal-blue)" }}>
                  {initials(user.name || user.email)}
                </div>
                {/* Info */}
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{user.name || "—"}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-[11px] truncate" style={{ color: "color-mix(in oklch, var(--foreground) 50%, transparent)" }}>{user.email}</p>
                    {user.last_login && (
                      <span className="flex items-center gap-1 text-[10px]" style={{ color: "color-mix(in oklch, var(--foreground) 38%, transparent)" }}>
                        <Clock size={10} />
                        {new Date(user.last_login).toLocaleDateString("fr-FR")}
                      </span>
                    )}
                  </div>
                </div>
                <RoleBadge role={user.role} />
                <StatusBadge active={user.active} />
                {/* Actions */}
                <div className="flex items-center gap-1.5 justify-end opacity-0 group-hover:opacity-100 transition-all">
                  <Link href={`/admin/users/${user.id}/edit`}
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: "color-mix(in oklch, var(--royal-blue) 10%, transparent)" }}>
                    <Pencil size={13} style={{ color: "var(--royal-blue)" }} />
                  </Link>
                  {user.active && (
                    <button onClick={() => del(user.id)}
                      className="px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all"
                      style={{ background: "color-mix(in oklch, #ef4444 10%, transparent)", color: "#ef4444" }}>
                      Désactiver
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

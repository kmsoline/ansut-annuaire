"use client";
import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Plus, Search, Pencil, Trash2, MessageCircle, Loader2, Star } from "lucide-react";

interface Testimonial { id: string; name: string; role?: string; company?: string; text: string; rating?: number; active: boolean; createdAt?: string; }

const CARD = { background: "color-mix(in oklch, var(--foreground) 2%, transparent)", border: "1px solid color-mix(in oklch, var(--foreground) 8%, transparent)" };

export default function AdminTestimonials() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => { fetch("/api/admin/testimonials").then(r => r.ok ? r.json() : []).then(setItems).catch(() => []).finally(() => setLoading(false)); }, []);

  const filtered = useMemo(() => items.filter(i => !search || i.name.toLowerCase().includes(search.toLowerCase()) || i.text.toLowerCase().includes(search.toLowerCase())), [items, search]);

  const del = async (id: string) => {
    if (!confirm("Supprimer ce témoignage ?")) return;
    await fetch(`/api/admin/testimonials/${id}`, { method: "DELETE" });
    setItems(prev => prev.filter(x => x.id !== id));
  };
  const toggle = async (id: string, val: boolean) => {
    await fetch(`/api/admin/testimonials/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ active: val }) });
    setItems(prev => prev.map(x => x.id === id ? { ...x, active: val } : x));
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 size={24} className="animate-spin text-[var(--royal-blue)]" /></div>;
  const active = items.filter(i => i.active).length;

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "color-mix(in oklch, var(--gold-premium) 12%, transparent)" }}>
              <MessageCircle size={16} strokeWidth={2} style={{ color: "var(--gold-premium)" }} />
            </div>
            <h1 className="text-2xl font-bold">Témoignages</h1>
          </div>
          <p className="text-sm ml-12" style={{ color: "color-mix(in oklch, var(--foreground) 50%, transparent)" }}>
            {items.length} témoignage{items.length > 1 ? "s" : ""} · <span style={{ color: "#16a34a" }}>{active} actif{active > 1 ? "s" : ""}</span>
          </p>
        </div>
        <Link href="/admin/testimonials/new" className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white hover:scale-105 transition-all" style={{ background: "var(--gold-premium)" }}>
          <Plus size={15} /> Nouveau témoignage
        </Link>
      </div>

      <div className="relative">
        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "color-mix(in oklch, var(--foreground) 38%, transparent)" }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un témoignage…"
          className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none focus:ring-2" style={CARD} />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 rounded-2xl" style={CARD}>
          <MessageCircle size={36} strokeWidth={1.2} className="mx-auto mb-3" style={{ color: "color-mix(in oklch, var(--foreground) 25%, transparent)" }} />
          <p className="text-sm font-medium mb-4" style={{ color: "color-mix(in oklch, var(--foreground) 50%, transparent)" }}>Aucun témoignage</p>
          <Link href="/admin/testimonials/new" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: "var(--gold-premium)" }}><Plus size={14} /> Ajouter</Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map(t => (
            <div key={t.id} className="group rounded-2xl p-5 transition-all duration-300 hover:-translate-y-0.5 relative" style={CARD}>
              {/* Status dot */}
              <span className="absolute top-4 right-4 w-2 h-2 rounded-full" style={{ background: t.active ? "#22c55e" : "color-mix(in oklch, var(--foreground) 25%, transparent)" }} />
              {/* Rating */}
              {t.rating && (
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={12} strokeWidth={0} style={{ fill: i < t.rating! ? "var(--gold-premium)" : "color-mix(in oklch, var(--foreground) 15%, transparent)" }} />
                  ))}
                </div>
              )}
              <blockquote className="text-sm leading-relaxed mb-4 line-clamp-3" style={{ color: "color-mix(in oklch, var(--foreground) 70%, transparent)" }}>
                « {t.text} »
              </blockquote>
              <div className="mb-4">
                <p className="text-sm font-bold">{t.name}</p>
                {(t.role || t.company) && (
                  <p className="text-xs" style={{ color: "color-mix(in oklch, var(--foreground) 50%, transparent)" }}>
                    {[t.role, t.company].filter(Boolean).join(" · ")}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 pt-3" style={{ borderTop: "1px solid color-mix(in oklch, var(--foreground) 6%, transparent)" }}>
                <button onClick={() => toggle(t.id, !t.active)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                  style={{ background: t.active ? "color-mix(in oklch, #ef4444 10%, transparent)" : "color-mix(in oklch, #22c55e 10%, transparent)", color: t.active ? "#ef4444" : "#16a34a" }}>
                  {t.active ? "Désactiver" : "Activer"}
                </button>
                <Link href={`/admin/testimonials/${t.id}/edit`} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold" style={{ background: "color-mix(in oklch, var(--royal-blue) 10%, transparent)", color: "var(--royal-blue)" }}>
                  <Pencil size={11} /> Modifier
                </Link>
                <button onClick={() => del(t.id)} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "color-mix(in oklch, #ef4444 10%, transparent)" }}>
                  <Trash2 size={13} style={{ color: "#ef4444" }} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

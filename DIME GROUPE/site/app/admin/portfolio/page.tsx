"use client";
import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Search, Pencil, Trash2, Globe, EyeOff, Palette, Loader2 } from "lucide-react";

interface Project { id: string; slug: string; title: string; tag?: string; category?: string; description?: string; img?: string; year?: string; published: boolean; createdAt?: string; }

const CARD = { background: "color-mix(in oklch, var(--foreground) 2%, transparent)", border: "1px solid color-mix(in oklch, var(--foreground) 8%, transparent)" };

function Badge({ published }: { published: boolean }) {
  return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold"
    style={{ background: published ? "color-mix(in oklch,#22c55e 12%,transparent)" : "color-mix(in oklch,var(--foreground) 8%,transparent)", color: published ? "#16a34a" : "color-mix(in oklch,var(--foreground) 50%,transparent)" }}>
    <span className="w-1.5 h-1.5 rounded-full" style={{ background: published ? "#16a34a" : "color-mix(in oklch,var(--foreground) 30%,transparent)" }} />
    {published ? "Publié" : "Brouillon"}
  </span>;
}

export default function AdminPortfolio() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all"|"published"|"drafts">("all");

  useEffect(() => { fetch("/api/admin/portfolio").then(r => r.ok ? r.json() : []).then(setProjects).catch(() => []).finally(() => setLoading(false)); }, []);

  const filtered = useMemo(() => projects.filter(p => {
    if (filter === "published" && !p.published) return false;
    if (filter === "drafts" && p.published) return false;
    if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [projects, filter, search]);

  const del = async (id: string) => {
    if (!confirm("Supprimer ce projet ?")) return;
    await fetch(`/api/admin/portfolio/${id}`, { method: "DELETE" });
    setProjects(p => p.filter(x => x.id !== id));
  };
  const toggle = async (id: string, val: boolean) => {
    await fetch(`/api/admin/portfolio/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ published: val }) });
    setProjects(p => p.map(x => x.id === id ? { ...x, published: val } : x));
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 size={24} className="animate-spin text-[var(--royal-blue)]" /></div>;
  const pub = projects.filter(p => p.published).length;

  return (
    <div className="space-y-5 max-w-5xl">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "color-mix(in oklch, var(--gold-premium) 12%, transparent)" }}>
              <Palette size={16} strokeWidth={2} style={{ color: "var(--gold-premium)" }} />
            </div>
            <h1 className="text-2xl font-bold">Portfolio</h1>
          </div>
          <p className="text-sm ml-12" style={{ color: "color-mix(in oklch, var(--foreground) 50%, transparent)" }}>
            {projects.length} projet{projects.length > 1 ? "s" : ""} · <span style={{ color: "#16a34a" }}>{pub} publié{pub > 1 ? "s" : ""}</span>
          </p>
        </div>
        <Link href="/admin/portfolio/new" className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white hover:scale-105 transition-all" style={{ background: "var(--gold-premium)" }}>
          <Plus size={15} /> Nouveau projet
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "color-mix(in oklch, var(--foreground) 38%, transparent)" }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[var(--gold-premium)]" style={CARD} />
        </div>
        <div className="flex rounded-xl overflow-hidden" style={{ border: "1px solid color-mix(in oklch, var(--foreground) 8%, transparent)" }}>
          {(["all","published","drafts"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} className="px-4 py-2.5 text-xs font-semibold transition-all"
              style={{ background: filter === f ? "var(--gold-premium)" : "color-mix(in oklch, var(--foreground) 2%, transparent)", color: filter === f ? "#fff" : "color-mix(in oklch, var(--foreground) 60%, transparent)" }}>
              {f === "all" ? `Tous (${projects.length})` : f === "published" ? `Publiés (${pub})` : `Brouillons (${projects.length - pub})`}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 rounded-2xl" style={CARD}>
          <Palette size={36} strokeWidth={1.2} className="mx-auto mb-3" style={{ color: "color-mix(in oklch, var(--foreground) 25%, transparent)" }} />
          <p className="text-sm font-medium mb-4" style={{ color: "color-mix(in oklch, var(--foreground) 50%, transparent)" }}>Aucun projet</p>
          <Link href="/admin/portfolio/new" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: "var(--gold-premium)" }}><Plus size={14} /> Ajouter</Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(p => (
            <div key={p.id} className="group rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-0.5" style={CARD}>
              <div className="relative aspect-[16/9] overflow-hidden bg-[color-mix(in_oklch,var(--foreground)_5%,transparent)]">
                {p.img ? <Image src={p.img} alt={p.title} fill sizes="33vw" className="object-cover transition-transform duration-500 group-hover:scale-105" /> : <div className="w-full h-full flex items-center justify-center"><Palette size={24} style={{ color: "color-mix(in oklch, var(--foreground) 25%, transparent)" }} /></div>}
                <div className="absolute top-2.5 left-2.5 flex gap-2">
                  <Badge published={p.published} />
                  {p.tag && <span className="px-2 py-1 rounded-full text-[10px] font-semibold text-white backdrop-blur-sm" style={{ background: "color-mix(in oklch, var(--gold-premium) 80%, transparent)" }}>{p.tag}</span>}
                </div>
                {p.year && <span className="absolute top-2.5 right-2.5 px-2 py-1 rounded-full text-[10px] text-white/80 backdrop-blur-sm" style={{ background: "rgba(0,0,0,0.4)" }}>{p.year}</span>}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-semibold text-sm line-clamp-1 flex-1">{p.title}</h3>
                </div>
                {p.category && <p className="text-[11px] font-medium mb-1" style={{ color: "var(--gold-premium)" }}>{p.category}</p>}
                {p.description && <p className="text-xs line-clamp-2 mb-3" style={{ color: "color-mix(in oklch, var(--foreground) 55%, transparent)" }}>{p.description}</p>}
                <div className="flex items-center gap-2 pt-3" style={{ borderTop: "1px solid color-mix(in oklch, var(--foreground) 6%, transparent)" }}>
                  <button onClick={() => toggle(p.id, !p.published)} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "color-mix(in oklch, var(--gold-premium) 10%, transparent)" }} title={p.published ? "Dépublier" : "Publier"}>
                    {p.published ? <EyeOff size={13} style={{ color: "var(--gold-premium)" }} /> : <Globe size={13} style={{ color: "var(--gold-premium)" }} />}
                  </button>
                  <Link href={`/admin/portfolio/${p.id}/edit`} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold" style={{ background: "color-mix(in oklch, var(--royal-blue) 10%, transparent)", color: "var(--royal-blue)" }}>
                    <Pencil size={11} /> Modifier
                  </Link>
                  <button onClick={() => del(p.id)} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "color-mix(in oklch, #ef4444 10%, transparent)" }}>
                    <Trash2 size={13} style={{ color: "#ef4444" }} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

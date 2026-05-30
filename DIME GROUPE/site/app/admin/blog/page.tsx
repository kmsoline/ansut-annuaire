"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Plus, Search, Pencil, Trash2, Globe, EyeOff, FileText, Loader2 } from "lucide-react";

interface Post { id: string; title: string; slug: string; excerpt: string; published: boolean; date?: string; createdAt?: string; category?: string; }

const F = "text-[color-mix(in_oklch,var(--foreground)_45%,transparent)]";
const CARD = { background: "color-mix(in oklch, var(--foreground) 2%, transparent)", border: "1px solid color-mix(in oklch, var(--foreground) 8%, transparent)" };
const ROW_H = "flex items-center justify-between px-5 py-3.5 transition-all hover:bg-[color-mix(in_oklch,var(--foreground)_2%,transparent)] group";

function Badge({ published }: { published: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold"
      style={{
        background: published ? "color-mix(in oklch, #22c55e 12%, transparent)" : "color-mix(in oklch, var(--foreground) 8%, transparent)",
        color: published ? "#16a34a" : "color-mix(in oklch, var(--foreground) 55%, transparent)",
      }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: published ? "#16a34a" : "color-mix(in oklch, var(--foreground) 35%, transparent)" }} />
      {published ? "Publié" : "Brouillon"}
    </span>
  );
}

export default function AdminBlog() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all"|"published"|"drafts">("all");
  const [page, setPage] = useState(1);
  const PER = 12;

  useEffect(() => {
    fetch("/api/admin/blog").then(r => r.ok ? r.json() : []).then(setPosts).catch(() => []).finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => posts.filter(p => {
    if (filter === "published" && !p.published) return false;
    if (filter === "drafts" && p.published) return false;
    if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [posts, filter, search]);

  const pages = Math.ceil(filtered.length / PER);
  const paged = filtered.slice((page - 1) * PER, page * PER);

  const del = async (id: string) => {
    if (!confirm("Supprimer cet article ?")) return;
    await fetch(`/api/admin/blog/${id}`, { method: "DELETE" });
    setPosts(p => p.filter(x => x.id !== id));
  };

  const pub = async (id: string, val: boolean) => {
    await fetch(`/api/admin/blog/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ published: val }) });
    setPosts(p => p.map(x => x.id === id ? { ...x, published: val } : x));
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 size={24} className="animate-spin text-[var(--royal-blue)]" /></div>;

  const published = posts.filter(p => p.published).length;
  const drafts = posts.length - published;

  return (
    <div className="space-y-5 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "color-mix(in oklch, var(--royal-blue) 12%, transparent)" }}>
              <FileText size={16} strokeWidth={2} style={{ color: "var(--royal-blue)" }} />
            </div>
            <h1 className="text-2xl font-bold">Articles</h1>
          </div>
          <p className="text-sm ml-12" style={{ color: "color-mix(in oklch, var(--foreground) 50%, transparent)" }}>
            {posts.length} article{posts.length > 1 ? "s" : ""} · <span style={{ color: "#16a34a" }}>{published} publié{published > 1 ? "s" : ""}</span> · {drafts} brouillon{drafts > 1 ? "s" : ""}
          </p>
        </div>
        <Link href="/admin/blog/new" className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:scale-105"
          style={{ background: "var(--royal-blue)" }}>
          <Plus size={15} /> Nouvel article
        </Link>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "color-mix(in oklch, var(--foreground) 38%, transparent)" }} />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Rechercher…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-[var(--royal-blue)]"
            style={CARD} />
        </div>
        <div className="flex rounded-xl overflow-hidden" style={{ border: "1px solid color-mix(in oklch, var(--foreground) 8%, transparent)" }}>
          {(["all","published","drafts"] as const).map(f => (
            <button key={f} onClick={() => { setFilter(f); setPage(1); }}
              className="px-4 py-2.5 text-xs font-semibold transition-all"
              style={{
                background: filter === f ? "var(--royal-blue)" : "color-mix(in oklch, var(--foreground) 2%, transparent)",
                color: filter === f ? "#fff" : "color-mix(in oklch, var(--foreground) 60%, transparent)",
              }}>
              {f === "all" ? `Tous (${posts.length})` : f === "published" ? `Publiés (${published})` : `Brouillons (${drafts})`}
            </button>
          ))}
        </div>
      </div>

      {/* Liste */}
      {paged.length === 0 ? (
        <div className="text-center py-20 rounded-2xl" style={CARD}>
          <FileText size={36} strokeWidth={1.2} className="mx-auto mb-3" style={{ color: "color-mix(in oklch, var(--foreground) 25%, transparent)" }} />
          <p className="text-sm font-medium mb-4" style={{ color: "color-mix(in oklch, var(--foreground) 50%, transparent)" }}>
            {search ? "Aucun résultat" : "Aucun article pour le moment"}
          </p>
          <Link href="/admin/blog/new" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: "var(--royal-blue)" }}>
            <Plus size={14} /> Créer votre premier article
          </Link>
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={CARD}>
          {/* Table header */}
          <div className="grid grid-cols-[1fr_auto_auto_auto] px-5 py-3 text-[11px] font-semibold uppercase tracking-widest"
            style={{ borderBottom: "1px solid color-mix(in oklch, var(--foreground) 6%, transparent)", color: "color-mix(in oklch, var(--foreground) 38%, transparent)" }}>
            <span>Titre</span><span className="text-center px-4">Statut</span><span className="text-center px-4">Date</span><span className="text-right">Actions</span>
          </div>
          <div className="divide-y" style={{ "--tw-divide-color": "color-mix(in oklch, var(--foreground) 5%, transparent)" } as React.CSSProperties}>
            {paged.map(post => (
              <div key={post.id} className={ROW_H + " grid grid-cols-[1fr_auto_auto_auto]"}>
                <div className="min-w-0 pr-4">
                  <p className="text-sm font-semibold truncate">{post.title}</p>
                  {post.excerpt && <p className="text-xs truncate mt-0.5" style={{ color: "color-mix(in oklch, var(--foreground) 45%, transparent)" }}>{post.excerpt}</p>}
                </div>
                <div className="px-4 text-center"><Badge published={post.published} /></div>
                <div className="px-4 text-center text-xs" style={{ color: "color-mix(in oklch, var(--foreground) 45%, transparent)" }}>
                  {new Date(post.createdAt || post.date || "").toLocaleDateString("fr-FR")}
                </div>
                <div className="flex items-center gap-1.5 pl-2">
                  <button onClick={() => pub(post.id, !post.published)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                    style={{ background: "color-mix(in oklch, var(--gold-premium) 12%, transparent)" }}
                    title={post.published ? "Dépublier" : "Publier"}>
                    {post.published ? <EyeOff size={13} style={{ color: "var(--gold-premium)" }} /> : <Globe size={13} style={{ color: "var(--gold-premium)" }} />}
                  </button>
                  <Link href={`/admin/blog/${post.id}/edit`}
                    className="w-8 h-8 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                    style={{ background: "color-mix(in oklch, var(--royal-blue) 12%, transparent)" }}>
                    <Pencil size={13} style={{ color: "var(--royal-blue)" }} />
                  </Link>
                  <button onClick={() => del(post.id)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                    style={{ background: "color-mix(in oklch, #ef4444 10%, transparent)" }}>
                    <Trash2 size={13} style={{ color: "#ef4444" }} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-xs" style={{ color: F }}>Page {page}/{pages} · {filtered.length} article{filtered.length > 1 ? "s" : ""}</span>
          <div className="flex gap-1.5">
            {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)}
                className="w-8 h-8 rounded-lg text-xs font-semibold transition-all"
                style={{
                  background: page === p ? "var(--royal-blue)" : "color-mix(in oklch, var(--foreground) 6%, transparent)",
                  color: page === p ? "#fff" : "color-mix(in oklch, var(--foreground) 60%, transparent)",
                }}>{p}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

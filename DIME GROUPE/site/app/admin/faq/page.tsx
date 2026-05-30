"use client";
import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Plus, Search, Pencil, Trash2, HelpCircle, Loader2, ChevronDown } from "lucide-react";

interface FaqItem { id: string; question: string; answer: string; category: string; active: boolean; sort_order?: number; }

const CARD = { background: "color-mix(in oklch, var(--foreground) 2%, transparent)", border: "1px solid color-mix(in oklch, var(--foreground) 8%, transparent)" };

export default function AdminFaq() {
  const [items, setItems] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => { fetch("/api/admin/faq").then(r => r.ok ? r.json() : []).then(setItems).catch(() => []).finally(() => setLoading(false)); }, []);

  const filtered = useMemo(() => items.filter(i => !search || i.question.toLowerCase().includes(search.toLowerCase()) || i.category.toLowerCase().includes(search.toLowerCase())), [items, search]);
  const grouped = useMemo(() => filtered.reduce<Record<string, FaqItem[]>>((acc, i) => { if (!acc[i.category]) acc[i.category] = []; acc[i.category].push(i); return acc; }, {}), [filtered]);

  const del = async (id: string) => {
    if (!confirm("Supprimer cette entrée FAQ ?")) return;
    await fetch(`/api/admin/faq/${id}`, { method: "DELETE" });
    setItems(prev => prev.filter(x => x.id !== id));
  };
  const toggle = async (id: string, val: boolean) => {
    await fetch(`/api/admin/faq/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ active: val }) });
    setItems(prev => prev.map(x => x.id === id ? { ...x, active: val } : x));
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 size={24} className="animate-spin text-[var(--royal-blue)]" /></div>;
  const active = items.filter(i => i.active).length;

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "color-mix(in oklch, var(--royal-blue) 12%, transparent)" }}>
              <HelpCircle size={16} strokeWidth={2} style={{ color: "var(--royal-blue)" }} />
            </div>
            <h1 className="text-2xl font-bold">FAQ</h1>
          </div>
          <p className="text-sm ml-12" style={{ color: "color-mix(in oklch, var(--foreground) 50%, transparent)" }}>
            {items.length} question{items.length > 1 ? "s" : ""} · <span style={{ color: "#16a34a" }}>{active} active{active > 1 ? "s" : ""}</span>
          </p>
        </div>
        <Link href="/admin/faq/new" className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white hover:scale-105 transition-all" style={{ background: "var(--royal-blue)" }}>
          <Plus size={15} /> Nouvelle question
        </Link>
      </div>

      <div className="relative">
        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "color-mix(in oklch, var(--foreground) 38%, transparent)" }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher une question…"
          className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[var(--royal-blue)]" style={CARD} />
      </div>

      {Object.keys(grouped).length === 0 ? (
        <div className="text-center py-20 rounded-2xl" style={CARD}>
          <HelpCircle size={36} strokeWidth={1.2} className="mx-auto mb-3" style={{ color: "color-mix(in oklch, var(--foreground) 25%, transparent)" }} />
          <p className="text-sm font-medium mb-4" style={{ color: "color-mix(in oklch, var(--foreground) 50%, transparent)" }}>Aucune question</p>
          <Link href="/admin/faq/new" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: "var(--royal-blue)" }}><Plus size={14} /> Ajouter</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([cat, qs]) => (
            <div key={cat} className="rounded-2xl overflow-hidden" style={CARD}>
              <div className="px-5 py-3.5 flex items-center justify-between" style={{ borderBottom: "1px solid color-mix(in oklch, var(--foreground) 6%, transparent)" }}>
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold text-sm">{cat}</h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: "color-mix(in oklch, var(--royal-blue) 10%, transparent)", color: "var(--royal-blue)" }}>{qs.length}</span>
                </div>
              </div>
              <div className="divide-y" style={{ "--tw-divide-color": "color-mix(in oklch, var(--foreground) 5%, transparent)" } as React.CSSProperties}>
                {qs.map(item => (
                  <div key={item.id} className="group">
                    <div className="flex items-center gap-3 px-5 py-3.5 cursor-pointer hover:bg-[color-mix(in_oklch,var(--foreground)_2%,transparent)] transition-all"
                      onClick={() => setOpen(open === item.id ? null : item.id)}>
                      <div className="w-1.5 h-1.5 rounded-full shrink-0 transition-colors" style={{ background: item.active ? "#22c55e" : "color-mix(in oklch, var(--foreground) 25%, transparent)" }} />
                      <p className="text-sm font-medium flex-1">{item.question}</p>
                      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
                        <button onClick={e => { e.stopPropagation(); toggle(item.id, !item.active); }}
                          className="px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all"
                          style={{ background: item.active ? "color-mix(in oklch, #ef4444 10%, transparent)" : "color-mix(in oklch, #22c55e 10%, transparent)", color: item.active ? "#ef4444" : "#16a34a" }}>
                          {item.active ? "Désactiver" : "Activer"}
                        </button>
                        <Link href={`/admin/faq/${item.id}/edit`} onClick={e => e.stopPropagation()}
                          className="w-7 h-7 rounded-lg flex items-center justify-center"
                          style={{ background: "color-mix(in oklch, var(--royal-blue) 10%, transparent)" }}>
                          <Pencil size={11} style={{ color: "var(--royal-blue)" }} />
                        </Link>
                        <button onClick={e => { e.stopPropagation(); del(item.id); }}
                          className="w-7 h-7 rounded-lg flex items-center justify-center"
                          style={{ background: "color-mix(in oklch, #ef4444 10%, transparent)" }}>
                          <Trash2 size={11} style={{ color: "#ef4444" }} />
                        </button>
                      </div>
                      <ChevronDown size={14} className={`shrink-0 transition-transform ${open === item.id ? "rotate-180" : ""}`} style={{ color: "color-mix(in oklch, var(--foreground) 38%, transparent)" }} />
                    </div>
                    {open === item.id && (
                      <div className="px-8 py-3 text-sm leading-relaxed" style={{ background: "color-mix(in oklch, var(--foreground) 1.5%, transparent)", color: "color-mix(in oklch, var(--foreground) 65%, transparent)", borderTop: "1px solid color-mix(in oklch, var(--foreground) 5%, transparent)" }}>
                        {item.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

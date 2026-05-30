"use client";
import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Plus, Search, Pencil, Trash2, Settings, Loader2, ChevronDown, ToggleLeft, ToggleRight } from "lucide-react";

interface ServiceItem { icon: string; name: string; description: string; }
interface Service { id: string; title: string; slug: string; icon?: string; category: string; description: string; items?: ServiceItem[]; active: boolean; createdAt: string; }

const CARD = { background: "color-mix(in oklch, var(--foreground) 2%, transparent)", border: "1px solid color-mix(in oklch, var(--foreground) 8%, transparent)" };
const CAT_COLORS: Record<string, string> = {
  "Infrastructure & IT": "var(--royal-blue)",
  "Développement & Applications": "var(--turquoise)",
  "Communication, Création & Événementiel": "var(--gold-premium)",
  "Conseil & Stratégie": "#8b5cf6",
  "Tourisme & Loisirs": "#16a34a",
};

export default function AdminServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("all");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => { fetch("/api/admin/services").then(r => r.ok ? r.json() : []).then(d => { setServices(d); setExpanded(new Set(Array.from(new Set(d.map((s: Service) => s.category))))); }).catch(() => []).finally(() => setLoading(false)); }, []);

  const toggle = async (id: string, active: boolean) => {
    await fetch(`/api/admin/services/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ active: !active }) });
    setServices(prev => prev.map(s => s.id === id ? { ...s, active: !s.active } : s));
  };
  const del = async (id: string) => {
    if (!confirm("Supprimer ce service ?")) return;
    await fetch(`/api/admin/services/${id}`, { method: "DELETE" });
    setServices(prev => prev.filter(s => s.id !== id));
  };

  const filtered = useMemo(() => services.filter(s => {
    if (cat !== "all" && s.category !== cat) return false;
    if (search && !s.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [services, cat, search]);

  const grouped = useMemo(() => {
    const g: Record<string, Service[]> = {};
    for (const s of filtered) { if (!g[s.category]) g[s.category] = []; g[s.category].push(s); }
    return g;
  }, [filtered]);

  const categories = Array.from(new Set(services.map(s => s.category)));

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 size={24} className="animate-spin text-[var(--royal-blue)]" /></div>;

  return (
    <div className="space-y-5 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "color-mix(in oklch, var(--turquoise) 12%, transparent)" }}>
              <Settings size={16} strokeWidth={2} style={{ color: "var(--turquoise)" }} />
            </div>
            <h1 className="text-2xl font-bold">Services</h1>
          </div>
          <p className="text-sm ml-12" style={{ color: "color-mix(in oklch, var(--foreground) 50%, transparent)" }}>
            {services.length} service{services.length > 1 ? "s" : ""} · {services.filter(s => s.active).length} actif{services.filter(s => s.active).length > 1 ? "s" : ""}
          </p>
        </div>
        <Link href="/admin/services/new" className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white hover:scale-105 transition-all" style={{ background: "var(--turquoise)" }}>
          <Plus size={15} /> Nouveau service
        </Link>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "color-mix(in oklch, var(--foreground) 38%, transparent)" }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[var(--turquoise)]" style={CARD} />
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button onClick={() => setCat("all")} className="px-3 py-2 rounded-xl text-xs font-semibold transition-all"
            style={{ background: cat === "all" ? "var(--royal-blue)" : "color-mix(in oklch, var(--foreground) 5%, transparent)", color: cat === "all" ? "#fff" : "color-mix(in oklch, var(--foreground) 60%, transparent)" }}>
            Tous ({services.length})
          </button>
          {categories.map(c => (
            <button key={c} onClick={() => setCat(c)} className="px-3 py-2 rounded-xl text-xs font-semibold transition-all"
              style={{
                background: cat === c ? CAT_COLORS[c] || "var(--royal-blue)" : "color-mix(in oklch, var(--foreground) 5%, transparent)",
                color: cat === c ? "#fff" : "color-mix(in oklch, var(--foreground) 60%, transparent)",
              }}>
              {c.split(" ")[0]} ({services.filter(s => s.category === c).length})
            </button>
          ))}
        </div>
      </div>

      {/* Groupes par catégorie */}
      {Object.keys(grouped).length === 0 ? (
        <div className="text-center py-20 rounded-2xl" style={CARD}>
          <Settings size={36} strokeWidth={1.2} className="mx-auto mb-3" style={{ color: "color-mix(in oklch, var(--foreground) 25%, transparent)" }} />
          <p className="text-sm font-medium mb-4" style={{ color: "color-mix(in oklch, var(--foreground) 50%, transparent)" }}>Aucun service</p>
          <Link href="/admin/services/new" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: "var(--turquoise)" }}><Plus size={14} /> Ajouter</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([category, svcs]) => {
            const color = CAT_COLORS[category] || "var(--royal-blue)";
            const isOpen = expanded.has(category);
            return (
              <div key={category} className="rounded-2xl overflow-hidden" style={CARD}>
                {/* Header catégorie */}
                <button className="w-full flex items-center justify-between px-5 py-4 transition-all hover:bg-[color-mix(in_oklch,var(--foreground)_2%,transparent)]"
                  onClick={() => setExpanded(prev => { const n = new Set(prev); isOpen ? n.delete(category) : n.add(category); return n; })}>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-8 rounded-full" style={{ background: color }} />
                    <div className="text-left">
                      <p className="text-sm font-bold">{category}</p>
                      <p className="text-[11px]" style={{ color: "color-mix(in oklch, var(--foreground) 45%, transparent)" }}>
                        {svcs.length} service{svcs.length > 1 ? "s" : ""} · {svcs.filter(s => s.active).length} actif{svcs.filter(s => s.active).length > 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Link href={`/admin/services/new?category=${encodeURIComponent(category)}`}
                      onClick={e => e.stopPropagation()}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all hover:scale-105"
                      style={{ background: color }}>
                      <Plus size={11} /> Ajouter
                    </Link>
                    <ChevronDown size={16} className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                      style={{ color: "color-mix(in oklch, var(--foreground) 40%, transparent)" }} />
                  </div>
                </button>

                {/* Liste services */}
                {isOpen && (
                  <div className="border-t" style={{ borderColor: "color-mix(in oklch, var(--foreground) 6%, transparent)" }}>
                    <div className="divide-y" style={{ "--tw-divide-color": "color-mix(in oklch, var(--foreground) 5%, transparent)" } as React.CSSProperties}>
                      {svcs.map(svc => (
                        <div key={svc.id} className="group flex items-center gap-4 px-5 py-3.5 transition-all hover:bg-[color-mix(in_oklch,var(--foreground)_1.5%,transparent)]">
                          {svc.icon && <span className="text-xl shrink-0">{svc.icon}</span>}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold">{svc.title}</p>
                            <p className="text-[11px] truncate" style={{ color: "color-mix(in oklch, var(--foreground) 50%, transparent)" }}>{svc.description}</p>
                          </div>
                          {svc.items && svc.items.length > 0 && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0"
                              style={{ background: `color-mix(in oklch, ${color} 10%, transparent)`, color }}>
                              {svc.items.length} sous-services
                            </span>
                          )}
                          <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
                            <button onClick={() => toggle(svc.id, svc.active)} className="w-8 h-8 rounded-lg flex items-center justify-center"
                              style={{ background: svc.active ? "color-mix(in oklch, #22c55e 10%, transparent)" : "color-mix(in oklch, var(--foreground) 7%, transparent)" }}
                              title={svc.active ? "Désactiver" : "Activer"}>
                              {svc.active ? <ToggleRight size={14} style={{ color: "#16a34a" }} /> : <ToggleLeft size={14} style={{ color: "color-mix(in oklch, var(--foreground) 40%, transparent)" }} />}
                            </button>
                            <Link href={`/admin/services/${svc.id}/edit`} className="w-8 h-8 rounded-lg flex items-center justify-center"
                              style={{ background: "color-mix(in oklch, var(--royal-blue) 10%, transparent)" }}>
                              <Pencil size={13} style={{ color: "var(--royal-blue)" }} />
                            </Link>
                            <button onClick={() => del(svc.id)} className="w-8 h-8 rounded-lg flex items-center justify-center"
                              style={{ background: "color-mix(in oklch, #ef4444 10%, transparent)" }}>
                              <Trash2 size={13} style={{ color: "#ef4444" }} />
                            </button>
                          </div>
                          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: svc.active ? "#22c55e" : "color-mix(in oklch, var(--foreground) 20%, transparent)" }} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

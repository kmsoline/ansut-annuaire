"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft, Plus, Trash2, Save, Sparkles, Eye, EyeOff,
  Search, X, MapPin, Star, ExternalLink, Image as ImageIcon, ChevronDown, ChevronUp,
} from "lucide-react";
import MediaPicker from "@/app/components/MediaPicker";
import Image from "next/image";

interface BonPlan {
  id: string;
  pays: string;
  category: string;
  name: string;
  zone: string;
  vibe: string;
  description: string;
  tags: string[];
  note: string;
  price_range: string;
  img: string;
  link: string;
  active: boolean;
  sort_order: number;
}

const PAYS = [
  { key: "Côte d'Ivoire", flag: "🇨🇮" },
  { key: "Sénégal",       flag: "🇸🇳" },
  { key: "Ghana",         flag: "🇬🇭" },
  { key: "Maroc",         flag: "🇲🇦" },
  { key: "Bénin",         flag: "🇧🇯" },
  { key: "Togo",          flag: "🇹🇬" },
];

const CATEGORIES = [
  { key: "all",        label: "Tous" },
  { key: "restaurant", label: "Restaurants" },
  { key: "rooftop",    label: "Rooftops & Bars" },
  { key: "plage",      label: "Plages & Piscines" },
  { key: "culture",    label: "Culture & Art" },
  { key: "shopping",   label: "Shopping" },
];
const NOTES  = ["★★★★★", "★★★★½", "★★★★", "★★★½", "★★★"];
const PRICES = ["€", "€€", "€€€"];

const inputCls = "w-full rounded-lg px-3 py-2 text-sm bg-transparent border focus:outline-none focus:ring-1 focus:ring-[var(--turquoise)] transition-all";
const borderStyle = { border: "1px solid color-mix(in oklch, var(--turquoise) 20%, transparent)" };

function CardEditor({ item, onUpdate, onSave, onDelete, saving }: {
  item: BonPlan;
  onUpdate: (field: keyof BonPlan, value: unknown) => void;
  onSave: () => void;
  onDelete: () => void;
  saving: boolean;
}) {
  const [showImg, setShowImg] = useState(false);

  return (
    <div className="rounded-2xl overflow-hidden flex flex-col border transition-all"
      style={{
        background: "color-mix(in oklch, var(--background) 80%, transparent)",
        borderColor: `color-mix(in oklch, var(--turquoise) ${item.active ? "20" : "8"}%, transparent)`,
        opacity: item.active ? 1 : 0.75,
      }}>

      {/* Image preview / picker */}
      <div className="relative group/img cursor-pointer" onClick={() => setShowImg(v => !v)}>
        {item.img ? (
          <div className="relative h-36 overflow-hidden">
            <Image src={item.img} alt={item.name} fill className="object-cover" sizes="400px" />
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-white text-xs font-semibold flex items-center gap-1"><ImageIcon size={13} /> Changer l&apos;image</span>
            </div>
          </div>
        ) : (
          <div className="h-24 flex items-center justify-center gap-2 transition-colors hover:bg-white/5"
            style={{ background: "color-mix(in oklch, var(--turquoise) 5%, transparent)", borderBottom: "1px dashed color-mix(in oklch, var(--turquoise) 20%, transparent)" }}>
            <ImageIcon size={16} style={{ color: "color-mix(in oklch, var(--turquoise) 60%, transparent)" }} />
            <span className="text-xs" style={{ color: "color-mix(in oklch, var(--turquoise) 60%, transparent)" }}>Ajouter une image</span>
          </div>
        )}
      </div>

      {/* Image picker (dépliable) */}
      {showImg && (
        <div className="p-4 border-b" style={{ borderColor: "color-mix(in oklch, var(--turquoise) 10%, transparent)" }}>
          <MediaPicker value={item.img} onChange={url => { onUpdate("img", url); setShowImg(false); }} label="" />
        </div>
      )}

      {/* Champs */}
      <div className="p-4 space-y-3 flex-1">

        {/* Nom + actions */}
        <div className="flex items-start gap-2">
          <input value={item.name} onChange={e => onUpdate("name", e.target.value)}
            className="flex-1 rounded-lg px-3 py-2 text-sm font-semibold bg-transparent border focus:outline-none focus:ring-1 focus:ring-[var(--turquoise)] transition-all"
            style={borderStyle} placeholder="Nom du lieu" />
          <div className="flex items-center gap-1 shrink-0">
            <button onClick={() => onUpdate("active", !item.active)}
              className="p-2 rounded-lg hover:bg-white/5 transition-colors"
              title={item.active ? "Masquer" : "Afficher"}
              style={{ color: item.active ? "var(--turquoise)" : "color-mix(in oklch, var(--foreground) 35%, transparent)" }}>
              {item.active ? <Eye size={15} /> : <EyeOff size={15} />}
            </button>
            <button onClick={onSave} disabled={saving}
              className="flex items-center gap-1 rounded-full px-2.5 py-1.5 text-xs font-semibold text-white disabled:opacity-50 transition-all hover:opacity-90"
              style={{ background: "var(--turquoise)" }}>
              <Save size={11} />{saving ? "…" : "Sauv."}
            </button>
            <button onClick={onDelete}
              className="p-1.5 rounded-lg text-red-400 hover:bg-red-400/10 transition-colors">
              <Trash2 size={13} />
            </button>
          </div>
        </div>

        {/* Pays + Catégorie */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-widest mb-1 block" style={{ color: "var(--turquoise)" }}>Pays</label>
            <select value={item.pays} onChange={e => onUpdate("pays", e.target.value)}
              className={inputCls} style={borderStyle}>
              {PAYS.map(p => <option key={p.key} value={p.key}>{p.flag} {p.key}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-widest mb-1 block" style={{ color: "var(--turquoise)" }}>Catégorie</label>
            <select value={item.category} onChange={e => onUpdate("category", e.target.value)}
              className={inputCls} style={borderStyle}>
              {CATEGORIES.filter(c => c.key !== "all").map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
            </select>
          </div>
        </div>

        {/* Zone */}
        <div>
          <label className="text-[10px] font-semibold uppercase tracking-widest mb-1 block" style={{ color: "var(--turquoise)" }}>Zone / Quartier</label>
          <input value={item.zone} onChange={e => onUpdate("zone", e.target.value)}
            className={inputCls} style={borderStyle} placeholder="Ex: Cocody, Dakar-Plateau…" />
        </div>

        {/* Note + Prix + Vibe */}
        <div className="grid grid-cols-3 gap-2 mt-1">
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-widest mb-1 block" style={{ color: "var(--turquoise)" }}>Note</label>
            <select value={item.note} onChange={e => onUpdate("note", e.target.value)}
              className={inputCls} style={borderStyle}>
              {NOTES.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-widest mb-1 block" style={{ color: "var(--turquoise)" }}>Prix</label>
            <select value={item.price_range} onChange={e => onUpdate("price_range", e.target.value)}
              className={inputCls} style={borderStyle}>
              {PRICES.map(p => <option key={p} value={p}>{p} {p === "€" ? "— Abordable" : p === "€€" ? "— Moyen" : "— Premium"}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-widest mb-1 block" style={{ color: "var(--turquoise)" }}>Vibe</label>
            <input value={item.vibe} onChange={e => onUpdate("vibe", e.target.value)}
              className={inputCls} style={borderStyle} placeholder="Cosy, Trendy…" />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="text-[10px] font-semibold uppercase tracking-widest mb-1 block" style={{ color: "var(--turquoise)" }}>Description</label>
          <textarea value={item.description} onChange={e => onUpdate("description", e.target.value)}
            rows={3} className={inputCls + " resize-none"} style={borderStyle}
            placeholder="Décrivez ce lieu en quelques phrases…" />
        </div>

        {/* Tags */}
        <div>
          <label className="text-[10px] font-semibold uppercase tracking-widest mb-1 block" style={{ color: "var(--turquoise)" }}>
            Tags <span className="font-normal opacity-60">(séparés par virgule)</span>
          </label>
          <input value={item.tags.join(", ")}
            onChange={e => onUpdate("tags", e.target.value.split(",").map(t => t.trim()).filter(Boolean))}
            className={inputCls} style={borderStyle} placeholder="Couple, Vue mer, Soirée…" />
          {item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {item.tags.map(t => (
                <span key={t} className="text-[10px] px-2 py-0.5 rounded-full"
                  style={{ background: "color-mix(in oklch, var(--turquoise) 10%, transparent)", color: "var(--turquoise)" }}>
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Lien externe */}
        <div>
          <label className="text-[10px] font-semibold uppercase tracking-widest mb-1 flex items-center gap-1" style={{ color: "var(--turquoise)" }}>
            <ExternalLink size={9} /> Lien externe <span className="font-normal opacity-60">(Google Maps, site web…)</span>
          </label>
          <input value={item.link} onChange={e => onUpdate("link", e.target.value)}
            type="url" className={inputCls} style={borderStyle} placeholder="https://maps.google.com/…" />
        </div>

        {/* Ordre */}
        <div className="flex items-center gap-3 pt-1">
          <div className="flex items-center gap-2">
            <label className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "color-mix(in oklch, var(--foreground) 45%, transparent)" }}>
              Ordre
            </label>
            <input value={item.sort_order} type="number"
              onChange={e => onUpdate("sort_order", Number(e.target.value))}
              className="w-16 rounded-lg px-2 py-1.5 text-xs bg-transparent border focus:outline-none focus:ring-1 focus:ring-[var(--turquoise)] transition-all text-center"
              style={borderStyle} />
          </div>
          <span className="text-[10px] ml-auto px-2 py-0.5 rounded-full font-medium"
            style={{
              background: item.active ? "color-mix(in oklch, var(--turquoise) 12%, transparent)" : "color-mix(in oklch, var(--foreground) 8%, transparent)",
              color: item.active ? "var(--turquoise)" : "color-mix(in oklch, var(--foreground) 45%, transparent)",
            }}>
            {item.active ? "✓ Visible" : "Masqué"}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function AdminBonsPlans() {
  const [items,   setItems]   = useState<BonPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState<string | null>(null);
  const [msg,     setMsg]     = useState("");
  const [activePays,     setActivePays]     = useState("Côte d'Ivoire");
  const [activeCategory, setActiveCategory] = useState("all");
  const [search,  setSearch]  = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/afrinomade/bons-plans");
    if (res.ok) setItems(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(""), 3000); };

  const filtered = useMemo(() => {
    let list = items.filter(i => i.pays === activePays);
    if (activeCategory !== "all") list = list.filter(i => i.category === activeCategory);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(i => i.name.toLowerCase().includes(q) || i.zone.toLowerCase().includes(q));
    }
    return list;
  }, [items, activePays, activeCategory, search]);

  const counts = useMemo(() => {
    const inPays = items.filter(i => i.pays === activePays);
    return Object.fromEntries(CATEGORIES.map(c => [c.key, c.key === "all" ? inPays.length : inPays.filter(i => i.category === c.key).length]));
  }, [items, activePays]);

  const paysCounts = useMemo(() =>
    Object.fromEntries(PAYS.map(p => [p.key, items.filter(i => i.pays === p.key).length])),
    [items]
  );

  const save = async (item: BonPlan) => {
    setSaving(item.id);
    const res = await fetch(`/api/admin/afrinomade/bons-plans/${item.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: item.name, category: item.category, zone: item.zone,
        vibe: item.vibe, description: item.description, tags: item.tags,
        note: item.note, price_range: item.price_range,
        img: item.img, link: item.link,
        active: item.active, sort_order: item.sort_order,
      }),
    });
    setSaving(null);
    if (res.ok) flash("✅ Sauvegardé");
    else flash("❌ Erreur lors de la sauvegarde");
  };

  const update = (id: string, field: keyof BonPlan, value: unknown) =>
    setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i));

  const add = async () => {
    const cat = activeCategory === "all" ? "restaurant" : activeCategory;
    const res = await fetch("/api/admin/afrinomade/bons-plans", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pays: activePays, category: cat, name: "Nouvelle adresse", zone: "", vibe: "",
        description: "", tags: [], note: "★★★★", price_range: "€€",
        img: "", link: "", active: false,
      }),
    });
    if (res.ok) { await load(); flash("✅ Bon plan ajouté"); }
  };

  const del = async (id: string) => {
    if (!confirm("Supprimer ce bon plan ?")) return;
    await fetch(`/api/admin/afrinomade/bons-plans/${id}`, { method: "DELETE" });
    setItems(prev => prev.filter(i => i.id !== id));
    flash("🗑️ Supprimé");
  };

  return (
    <div className="space-y-6 max-w-6xl">

      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Link href="/admin/afrinomade" className="p-2 rounded-lg hover:bg-white/5 transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <Sparkles size={20} style={{ color: "var(--gold-premium)" }} strokeWidth={1.8} />
              <h1 className="text-2xl font-bold">Bons Plans & Lieux</h1>
            </div>
            <p className="text-xs mt-0.5 pl-7" style={{ color: "color-mix(in oklch, var(--foreground) 55%, transparent)" }}>
              {items.length} adresse{items.length !== 1 ? "s" : ""} · {items.filter(i => i.active).length} visible{items.filter(i => i.active).length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <button onClick={add}
          className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white transition-all hover:scale-105"
          style={{ background: "linear-gradient(135deg, var(--gold-premium), color-mix(in oklch, var(--gold-premium) 70%, var(--turquoise)))" }}>
          <Plus size={15} /> Ajouter une adresse
        </button>
      </div>

      {/* Sélecteur pays */}
      <div className="flex flex-wrap gap-2">
        {PAYS.map(p => {
          const n = paysCounts[p.key] ?? 0;
          const isActive = activePays === p.key;
          return (
            <button key={p.key}
              onClick={() => { setActivePays(p.key); setActiveCategory("all"); setSearch(""); }}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl border transition-all text-sm font-medium"
              style={{
                background: isActive ? "color-mix(in oklch, var(--turquoise) 12%, transparent)" : "color-mix(in oklch, var(--foreground) 4%, transparent)",
                borderColor: isActive ? "var(--turquoise)" : "color-mix(in oklch, var(--foreground) 10%, transparent)",
                color: isActive ? "var(--turquoise)" : "inherit",
              }}>
              <span className="text-base">{p.flag}</span>
              <span>{p.key}</span>
              <span className="text-[10px] rounded-full px-1.5 py-0.5 font-semibold"
                style={{
                  background: isActive ? "color-mix(in oklch, var(--turquoise) 20%, transparent)" : "color-mix(in oklch, var(--foreground) 8%, transparent)",
                  color: isActive ? "var(--turquoise)" : "color-mix(in oklch, var(--foreground) 45%, transparent)",
                }}>
                {n}
              </span>
            </button>
          );
        })}
      </div>

      {/* Recherche */}
      <div className="relative max-w-xs">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: "color-mix(in oklch, var(--foreground) 40%, transparent)" }} />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher…"
          className="w-full pl-9 pr-8 py-2 rounded-xl text-sm border outline-none focus:ring-2 focus:ring-[var(--turquoise)] transition-all"
          style={{
            background: "color-mix(in oklch, var(--foreground) 4%, transparent)",
            border: "1px solid color-mix(in oklch, var(--turquoise) 15%, transparent)",
          }} />
        {search && (
          <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2">
            <X size={13} style={{ color: "color-mix(in oklch, var(--foreground) 40%, transparent)" }} />
          </button>
        )}
      </div>

      {/* Filtres catégories */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map(cat => (
          <button key={cat.key} onClick={() => setActiveCategory(cat.key)}
            className="rounded-full px-3 py-1.5 text-xs font-medium transition-all flex items-center gap-1.5"
            style={{
              background: activeCategory === cat.key ? "var(--turquoise)" : "color-mix(in oklch, var(--turquoise) 8%, transparent)",
              color: activeCategory === cat.key ? "white" : "color-mix(in oklch, var(--foreground) 70%, transparent)",
              border: "1px solid color-mix(in oklch, var(--turquoise) 20%, transparent)",
            }}>
            {cat.label}
            <span className="rounded-full px-1.5 text-[10px]"
              style={{
                background: activeCategory === cat.key ? "rgba(255,255,255,0.2)" : "color-mix(in oklch, var(--turquoise) 12%, transparent)",
              }}>
              {counts[cat.key] ?? 0}
            </span>
          </button>
        ))}
      </div>

      {/* Message flash */}
      {msg && (
        <div className="rounded-xl px-4 py-3 text-sm font-medium"
          style={{ background: "color-mix(in oklch, var(--turquoise) 10%, var(--background))", border: "1px solid color-mix(in oklch, var(--turquoise) 25%, transparent)" }}>
          {msg}
        </div>
      )}

      {/* Grille */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl animate-pulse h-96"
              style={{ background: "color-mix(in oklch, var(--foreground) 6%, transparent)" }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-sm mb-4" style={{ color: "color-mix(in oklch, var(--foreground) 50%, transparent)" }}>
            {search ? `Aucun résultat pour "${search}"` : "Aucune adresse dans cette catégorie"}
          </p>
          <button onClick={add}
            className="btn btn-primary flex items-center gap-2 mx-auto">
            <Plus size={14} /> Ajouter une adresse
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map(item => (
            <CardEditor
              key={item.id}
              item={item}
              onUpdate={(field, value) => update(item.id, field, value)}
              onSave={() => save(item)}
              onDelete={() => del(item.id)}
              saving={saving === item.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

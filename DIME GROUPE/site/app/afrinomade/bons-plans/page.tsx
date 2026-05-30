"use client";

import {
  Sparkles, UtensilsCrossed, Wine, Waves, Drama,
  ShoppingBag, Lightbulb, MapPin, Star, ExternalLink,
  Search, X, MessageCircle, ChevronRight,
} from "lucide-react";
import ScrollAnimation from "../../components/ScrollAnimation";
import { useWhatsApp } from "../../components/WhatsAppNumber";
import { useState, useEffect, useMemo } from "react";
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
  img?: string;
  link?: string;
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
  { key: "all",        label: "Tous",             icon: Sparkles },
  { key: "restaurant", label: "Restaurants",       icon: UtensilsCrossed },
  { key: "rooftop",    label: "Rooftops & Bars",   icon: Wine },
  { key: "plage",      label: "Plages & Piscines", icon: Waves },
  { key: "culture",    label: "Culture & Art",      icon: Drama },
  { key: "shopping",   label: "Shopping",           icon: ShoppingBag },
];

const PRICE_COLOR: Record<string, string> = {
  "€": "#22C55E", "€€": "var(--gold-premium)", "€€€": "#EF4444",
};
const PRICE_LABEL: Record<string, string> = {
  "€": "Abordable", "€€": "Moyen", "€€€": "Premium",
};

function StarRating({ note }: { note: string }) {
  const stars = note.split("").filter(c => c === "★" || c === "½");
  return (
    <span className="flex items-center gap-0.5">
      {stars.map((c, i) => (
        <Star key={i} size={11}
          fill={c === "★" ? "currentColor" : "none"}
          strokeWidth={c === "½" ? 1.5 : 0}
          style={{ color: "var(--gold-premium)", opacity: c === "½" ? 0.5 : 1 }} />
      ))}
    </span>
  );
}

function BonPlanCard({ bp, whatsapp, onTagClick, onExpandToggle, expanded }: {
  bp: BonPlan; whatsapp: string;
  onTagClick: (t: string) => void;
  onExpandToggle: (id: string) => void;
  expanded: boolean;
}) {
  const CatIcon = CATEGORIES.find(c => c.key === bp.category)?.icon ?? Sparkles;

  return (
    <div className="group rounded-2xl overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl h-full"
      style={{
        background: "color-mix(in oklch, var(--background) 85%, transparent)",
        border: "1px solid color-mix(in oklch, var(--turquoise) 12%, transparent)",
        boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
      }}>

      {/* Image / placeholder */}
      {bp.img ? (
        <div className="relative h-44 overflow-hidden shrink-0">
          <Image src={bp.img} alt={bp.name} fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%)" }} />
          <div className="absolute top-3 left-3">
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full text-white backdrop-blur-sm flex items-center gap-1"
              style={{ background: "rgba(0,0,0,0.45)" }}>
              <CatIcon size={10} strokeWidth={2} />
              {CATEGORIES.find(c => c.key === bp.category)?.label}
            </span>
          </div>
          <div className="absolute top-3 right-3">
            <span className="text-xs font-bold px-2 py-1 rounded-full backdrop-blur-sm"
              title={PRICE_LABEL[bp.price_range]}
              style={{ background: "rgba(0,0,0,0.45)", color: PRICE_COLOR[bp.price_range] ?? "white" }}>
              {bp.price_range}
            </span>
          </div>
        </div>
      ) : (
        <div className="h-12 shrink-0 flex items-center px-5 gap-2"
          style={{ background: "color-mix(in oklch, var(--turquoise) 8%, transparent)", borderBottom: "1px solid color-mix(in oklch, var(--turquoise) 12%, transparent)" }}>
          <CatIcon size={14} strokeWidth={1.8} style={{ color: "var(--turquoise)" }} />
          <span className="text-xs font-semibold" style={{ color: "var(--turquoise)" }}>
            {CATEGORIES.find(c => c.key === bp.category)?.label}
          </span>
          <span className="ml-auto text-xs font-bold" title={PRICE_LABEL[bp.price_range]}
            style={{ color: PRICE_COLOR[bp.price_range] ?? "inherit" }}>
            {bp.price_range}
          </span>
        </div>
      )}

      <div className="p-5 flex flex-col gap-3 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm leading-snug">{bp.name}</h3>
            <p className="text-xs mt-1 flex items-center gap-1" style={{ color: "color-mix(in oklch, var(--foreground) 50%, transparent)" }}>
              <MapPin size={10} strokeWidth={2} />{bp.zone}
            </p>
          </div>
          <StarRating note={bp.note} />
        </div>

        {bp.vibe && (
          <p className="text-xs font-semibold italic" style={{ color: "var(--turquoise)" }}>{bp.vibe}</p>
        )}

        <div>
          <p className={`text-xs leading-relaxed ${expanded ? "" : "line-clamp-3"}`}
            style={{ color: "color-mix(in oklch, var(--foreground) 65%, transparent)" }}>
            {bp.description}
          </p>
          {bp.description.length > 120 && (
            <button onClick={() => onExpandToggle(bp.id)}
              className="text-[10px] mt-1 font-semibold"
              style={{ color: "var(--turquoise)" }}>
              {expanded ? "Voir moins" : "Voir plus"}
            </button>
          )}
        </div>

        {bp.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {bp.tags.map(tag => (
              <button key={tag} onClick={() => onTagClick(tag)}
                className="text-[9px] px-2 py-0.5 rounded-full transition-opacity hover:opacity-70"
                style={{
                  background: "color-mix(in oklch, var(--turquoise) 8%, transparent)",
                  border: "1px solid color-mix(in oklch, var(--turquoise) 15%, transparent)",
                  color: "color-mix(in oklch, var(--turquoise) 80%, var(--foreground))",
                }}>
                {tag}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2 mt-auto pt-3 border-t"
          style={{ borderColor: "color-mix(in oklch, var(--turquoise) 10%, transparent)" }}>
          <a href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(`Bonjour AfriNomade ! Je voudrais en savoir plus sur "${bp.name}" (${bp.zone}, ${bp.pays}).`)}`}
            target="_blank" rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-white transition-all hover:opacity-90"
            style={{ background: "var(--turquoise)" }}>
            <MessageCircle size={12} />
            Avoir l&apos;adresse
          </a>
          {bp.link && (
            <a href={bp.link} target="_blank" rel="noopener noreferrer"
              className="p-2 rounded-xl transition-all hover:opacity-80"
              style={{
                background: "color-mix(in oklch, var(--turquoise) 10%, transparent)",
                border: "1px solid color-mix(in oklch, var(--turquoise) 15%, transparent)",
                color: "var(--turquoise)",
              }} title="Voir sur Maps / Site web">
              <ExternalLink size={14} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AfriBonsPlans() {
  const whatsapp = useWhatsApp("afri");
  const [bonsPlans, setBonsPlans] = useState<BonPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePays, setActivePays] = useState("Côte d'Ivoire");
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/afrinomade/bons-plans")
      .then(r => r.json())
      .then(d => { setBonsPlans(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // Pays qui ont au moins 1 bon plan
  const paysDisponibles = useMemo(() =>
    PAYS.filter(p => bonsPlans.some(bp => bp.pays === p.key)),
    [bonsPlans]
  );

  const filtered = useMemo(() => {
    let list = bonsPlans.filter(bp => bp.pays === activePays);
    if (activeCategory !== "all") list = list.filter(bp => bp.category === activeCategory);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(bp =>
        bp.name.toLowerCase().includes(q) ||
        bp.zone.toLowerCase().includes(q) ||
        bp.description.toLowerCase().includes(q) ||
        bp.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    return list;
  }, [bonsPlans, activePays, activeCategory, search]);

  const catCounts = useMemo(() => {
    const inPays = bonsPlans.filter(bp => bp.pays === activePays);
    return Object.fromEntries(
      CATEGORIES.map(c => [c.key, c.key === "all" ? inPays.length : inPays.filter(b => b.category === c.key).length])
    );
  }, [bonsPlans, activePays]);

  const toggleExpand = (id: string) => setExpanded(v => v === id ? null : id);

  const activePaysInfo = PAYS.find(p => p.key === activePays);

  return (
    <main className="container py-16">

      {/* Hero */}
      <ScrollAnimation animation="fadeInUp" delay={0}>
        <div className="mb-10">
          <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: "var(--turquoise)" }}>
            AfriNomade · Guide local
          </span>
          <h1 className="mt-2 text-3xl md:text-4xl font-bold">Bons Plans & Lieux Branchés</h1>
          <p className="mt-2 text-sm max-w-xl" style={{ color: "color-mix(in oklch, var(--foreground) 65%, transparent)" }}>
            Restaurants, rooftops, plages, culture et shopping — nos adresses testées dans chaque destination AfriNomade.
          </p>
        </div>
      </ScrollAnimation>

      {/* Sélecteur de pays */}
      <ScrollAnimation animation="fadeInUp" delay={80}>
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3"
            style={{ color: "color-mix(in oklch, var(--foreground) 45%, transparent)" }}>
            Choisir une destination
          </p>
          <div className="flex flex-wrap gap-3">
            {PAYS.map(pays => {
              const count = bonsPlans.filter(bp => bp.pays === pays.key).length;
              const isActive = activePays === pays.key;
              return (
                <button key={pays.key}
                  onClick={() => { setActivePays(pays.key); setActiveCategory("all"); setSearch(""); }}
                  className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border transition-all duration-200"
                  style={{
                    background: isActive
                      ? "color-mix(in oklch, var(--turquoise) 15%, transparent)"
                      : "color-mix(in oklch, var(--foreground) 4%, transparent)",
                    borderColor: isActive
                      ? "var(--turquoise)"
                      : "color-mix(in oklch, var(--foreground) 10%, transparent)",
                    transform: isActive ? "scale(1.03)" : "scale(1)",
                    boxShadow: isActive ? "0 0 0 1px var(--turquoise)" : "none",
                  }}>
                  <span className="text-xl">{pays.flag}</span>
                  <span className="text-sm font-semibold">{pays.key}</span>
                  {count > 0 ? (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                      style={{
                        background: isActive ? "color-mix(in oklch, var(--turquoise) 25%, transparent)" : "color-mix(in oklch, var(--foreground) 8%, transparent)",
                        color: isActive ? "var(--turquoise)" : "color-mix(in oklch, var(--foreground) 50%, transparent)",
                      }}>
                      {count}
                    </span>
                  ) : (
                    <span className="text-[10px] italic opacity-40">Bientôt</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </ScrollAnimation>

      {/* En-tête du pays actif */}
      {activePaysInfo && (
        <ScrollAnimation animation="fadeInUp" delay={100}>
          <div className="flex items-center gap-3 mb-6 p-4 rounded-2xl"
            style={{ background: "color-mix(in oklch, var(--turquoise) 6%, transparent)", border: "1px solid color-mix(in oklch, var(--turquoise) 12%, transparent)" }}>
            <span className="text-3xl">{activePaysInfo.flag}</span>
            <div>
              <h2 className="font-bold text-base">{activePaysInfo.key}</h2>
              <p className="text-xs" style={{ color: "color-mix(in oklch, var(--foreground) 55%, transparent)" }}>
                {catCounts["all"]} adresse{catCounts["all"] !== 1 ? "s" : ""} · Guide mis à jour par l&apos;équipe AfriNomade
              </p>
            </div>
          </div>
        </ScrollAnimation>
      )}

      {/* Recherche + filtres catégories */}
      {catCounts["all"] > 0 && (
        <ScrollAnimation animation="fadeInUp" delay={120}>
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            {/* Recherche */}
            <div className="relative max-w-xs">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: "color-mix(in oklch, var(--foreground) 40%, transparent)" }} />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher un lieu…"
                className="w-full pl-10 pr-8 py-2 rounded-xl text-sm outline-none focus:ring-2 transition-all"
                style={{
                  background: "color-mix(in oklch, var(--foreground) 5%, transparent)",
                  border: "1px solid color-mix(in oklch, var(--turquoise) 20%, transparent)",
                }} />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2">
                  <X size={13} style={{ color: "color-mix(in oklch, var(--foreground) 40%, transparent)" }} />
                </button>
              )}
            </div>

            {/* Catégories */}
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.filter(c => catCounts[c.key] > 0 || c.key === "all").map(cat => (
                <button key={cat.key} onClick={() => setActiveCategory(cat.key)}
                  className="rounded-full px-3 py-1.5 text-xs font-semibold transition-all flex items-center gap-1"
                  style={{
                    background: activeCategory === cat.key ? "var(--turquoise)" : "color-mix(in oklch, var(--turquoise) 8%, transparent)",
                    color: activeCategory === cat.key ? "white" : "color-mix(in oklch, var(--foreground) 70%, transparent)",
                    border: "1px solid color-mix(in oklch, var(--turquoise) 20%, transparent)",
                  }}>
                  <cat.icon size={11} strokeWidth={1.8} />
                  {cat.label}
                  {catCounts[cat.key] > 0 && (
                    <span className="text-[9px] rounded-full px-1"
                      style={{
                        background: activeCategory === cat.key ? "rgba(255,255,255,0.2)" : "color-mix(in oklch, var(--turquoise) 12%, transparent)",
                      }}>
                      {catCounts[cat.key]}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </ScrollAnimation>
      )}

      {/* Skeleton loading */}
      {loading && (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl animate-pulse h-72"
              style={{ background: "color-mix(in oklch, var(--foreground) 6%, transparent)" }} />
          ))}
        </div>
      )}

      {/* Pas de bons plans pour ce pays */}
      {!loading && catCounts["all"] === 0 && (
        <div className="text-center py-20 rounded-2xl border border-dashed"
          style={{ borderColor: "color-mix(in oklch, var(--turquoise) 20%, transparent)" }}>
          <span className="text-4xl mb-4 block">{activePaysInfo?.flag}</span>
          <h3 className="font-bold mb-2">Guide {activePays} bientôt disponible</h3>
          <p className="text-sm max-w-xs mx-auto" style={{ color: "color-mix(in oklch, var(--foreground) 55%, transparent)" }}>
            Nos équipes préparent les meilleures adresses. Revenez bientôt !
          </p>
          <a href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(`Bonjour AfriNomade ! Je cherche des bons plans au ${activePays}.`)}`}
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-5 rounded-full px-5 py-2 text-sm font-semibold text-white"
            style={{ background: "var(--turquoise)" }}>
            <MessageCircle size={14} /> Demander des adresses
          </a>
        </div>
      )}

      {/* Résultat filtré vide */}
      {!loading && catCounts["all"] > 0 && filtered.length === 0 && (
        <div className="text-center py-16">
          <p className="text-sm" style={{ color: "color-mix(in oklch, var(--foreground) 50%, transparent)" }}>
            {search ? `Aucun résultat pour "${search}"` : "Aucune adresse dans cette catégorie"}
          </p>
          <button onClick={() => { setSearch(""); setActiveCategory("all"); }}
            className="mt-3 text-xs underline" style={{ color: "var(--turquoise)" }}>
            Réinitialiser les filtres
          </button>
        </div>
      )}

      {/* Grille cartes */}
      {!loading && filtered.length > 0 && (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((bp, i) => (
            <ScrollAnimation key={bp.id} animation="fadeInUp" delay={i * 60}>
              <BonPlanCard
                bp={bp}
                whatsapp={whatsapp}
                onTagClick={t => setSearch(t)}
                onExpandToggle={toggleExpand}
                expanded={expanded === bp.id}
              />
            </ScrollAnimation>
          ))}
        </div>
      )}

      {/* CTA recommander */}
      <ScrollAnimation animation="fadeInUp" delay={200}>
        <div className="mt-14 rounded-2xl p-8 text-center"
          style={{
            background: "color-mix(in oklch, var(--turquoise) 5%, var(--background))",
            border: "1px dashed color-mix(in oklch, var(--turquoise) 25%, transparent)",
          }}>
          <Lightbulb size={36} className="mx-auto mb-3" style={{ color: "var(--turquoise)" }} strokeWidth={1.5} />
          <h3 className="font-bold text-lg mb-2">Vous connaissez une pépite ?</h3>
          <p className="text-sm mb-5 max-w-sm mx-auto" style={{ color: "color-mix(in oklch, var(--foreground) 60%, transparent)" }}>
            Partagez vos adresses coup de cœur — on les teste et on les ajoute au guide.
          </p>
          <a href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(`Bonjour AfriNomade ! J'ai une adresse à recommander pour ${activePays}.`)}`}
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-white transition-all hover:scale-105"
            style={{ background: "linear-gradient(135deg, var(--turquoise), color-mix(in oklch, var(--turquoise) 70%, var(--gold-premium)))" }}>
            <MessageCircle size={15} /> Recommander un lieu
          </a>
        </div>
      </ScrollAnimation>
    </main>
  );
}

"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useMemo } from "react";
import ScrollAnimation from "../components/ScrollAnimation";

interface Project {
  slug: string; title: string; tag: string;
  category: string; description: string; img: string; year: string;
}

export default function PortfolioGrid({ projects }: { projects: Project[] }) {
  const categories = ["Tous", ...Array.from(new Set(projects.map(p => p.category).filter(Boolean)))];
  const [active, setActive] = useState("Tous");

  const filtered = useMemo(() =>
    active === "Tous" ? projects : projects.filter(p => p.category === active),
    [projects, active]);

  if (projects.length === 0) {
    return (
      <div className="text-center py-24">
        <div className="text-4xl mb-4">🎨</div>
        <p className="text-sm" style={{ color: "color-mix(in oklch, var(--foreground) 55%, transparent)" }}>
          Les projets arrivent bientôt…
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Filtres */}
      {categories.length > 2 && (
        <ScrollAnimation animation="fadeInUp" delay={0}>
          <div className="flex flex-wrap gap-2 justify-center mb-12">
            {categories.map(cat => (
              <button key={cat} onClick={() => setActive(cat)}
                className="relative px-4 py-2 rounded-full text-xs font-semibold transition-all duration-300"
                style={{
                  background: active === cat
                    ? "var(--royal-blue)"
                    : "color-mix(in oklch, var(--foreground) 6%, transparent)",
                  color: active === cat
                    ? "#fff"
                    : "color-mix(in oklch, var(--foreground) 65%, transparent)",
                  border: active === cat
                    ? "1px solid transparent"
                    : "1px solid color-mix(in oklch, var(--foreground) 10%, transparent)",
                }}>
                {cat}
                {cat !== "Tous" && (
                  <span className="ml-1.5 opacity-60">
                    {projects.filter(p => p.category === cat).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </ScrollAnimation>
      )}

      {/* Grille masonry */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-sm" style={{ color: "color-mix(in oklch, var(--foreground) 55%, transparent)" }}>
          Aucun projet dans cette catégorie.
        </div>
      ) : (
        <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 auto-rows-auto">
          {filtered.map((p, i) => {
            const isFeatured = i === 0;
            return (
              <ScrollAnimation key={p.slug} animation="fadeInUp" delay={i * 60}>
                <Link href={`/portfolio/${p.slug}`}
                  className={`group block relative overflow-hidden rounded-2xl transition-all duration-500 hover:-translate-y-1 ${isFeatured ? "md:col-span-2 lg:col-span-2" : ""}`}
                  style={{
                    boxShadow: "0 2px 20px rgba(0,0,0,0.08)",
                    border: "1px solid color-mix(in oklch, var(--foreground) 7%, transparent)",
                  }}>
                  {/* Image */}
                  <div className={`relative overflow-hidden ${isFeatured ? "aspect-[16/9]" : "aspect-[4/3]"}`}>
                    <Image src={p.img} alt={p.title} fill
                      sizes={isFeatured ? "(max-width: 768px) 100vw, 66vw" : "(max-width: 768px) 100vw, 33vw"}
                      className="object-cover transition-transform duration-700 group-hover:scale-105" />
                    {/* Dark overlay progressive */}
                    <div className="absolute inset-0 transition-opacity duration-500"
                      style={{ background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.1) 50%, transparent 100%)", opacity: 0.6 }} />
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-40 transition-opacity duration-500"
                      style={{ background: "linear-gradient(135deg, var(--royal-blue), var(--gold-premium))" }} />

                    {/* Badges top */}
                    <div className="absolute top-4 left-4 flex gap-2">
                      {p.tag && (
                        <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full text-white backdrop-blur-md"
                          style={{ background: "color-mix(in oklch, var(--royal-blue) 85%, transparent)" }}>
                          {p.tag}
                        </span>
                      )}
                    </div>
                    {p.year && (
                      <div className="absolute top-4 right-4">
                        <span className="px-2.5 py-1 text-[10px] font-semibold rounded-full text-white/80 backdrop-blur-md"
                          style={{ background: "rgba(0,0,0,0.4)" }}>
                          {p.year}
                        </span>
                      </div>
                    )}

                    {/* Content overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-white/60 mb-1">{p.category}</p>
                      <h3 className={`font-bold text-white mb-1 line-clamp-2 ${isFeatured ? "text-xl md:text-2xl" : "text-base"}`}>{p.title}</h3>
                      {isFeatured && p.description && (
                        <p className="text-sm text-white/70 line-clamp-2 hidden md:block">{p.description}</p>
                      )}
                      <div className="flex items-center gap-1.5 mt-3 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                        <span className="text-xs font-semibold text-white/90">Voir le projet</span>
                        <svg className="w-3.5 h-3.5 text-white/90 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </Link>
              </ScrollAnimation>
            );
          })}
        </div>
      )}
    </div>
  );
}

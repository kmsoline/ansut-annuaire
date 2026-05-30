"use client";

import Image from "next/image";
import { Timer, Check } from "lucide-react";
import ScrollAnimation from "../../components/ScrollAnimation";
import { useWhatsApp } from "../../components/WhatsAppNumber";
import { useState } from "react";

interface Excursion {
  id: string; slug: string; title: string; img: string;
  duration: string; price: string; tags: string[];
  description: string; highlights: string[];
}

export default function ExcursionsGrid({ excursions }: { excursions: Excursion[] }) {
  const whatsapp = useWhatsApp("afri");
  const allTags = ["Tous", ...Array.from(new Set(excursions.flatMap(e => e.tags)))];
  const [activeTag, setActiveTag] = useState("Tous");

  const filtered = activeTag === "Tous" ? excursions : excursions.filter(e => e.tags.includes(activeTag));

  return (
    <>
      {/* Filtres */}
      <ScrollAnimation animation="fadeInUp" delay={100}>
        <div className="flex flex-wrap gap-2 mb-8">
          {allTags.map((tag) => (
            <button key={tag} onClick={() => setActiveTag(tag)}
              className="rounded-full px-4 py-1.5 text-xs font-medium transition-all duration-200"
              style={{
                background: activeTag === tag ? "var(--turquoise)" : "color-mix(in oklch, var(--turquoise) 10%, transparent)",
                color: activeTag === tag ? "white" : "color-mix(in oklch, var(--foreground) 70%, transparent)",
                border: "1px solid color-mix(in oklch, var(--turquoise) 25%, transparent)",
              }}>
              {tag}
            </button>
          ))}
        </div>
      </ScrollAnimation>

      {/* Grille */}
      <div className="grid gap-6 md:grid-cols-2">
        {filtered.map((ex, i) => (
          <ScrollAnimation key={ex.id} animation="fadeInUp" delay={i * 100}>
            <div className="group rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl flex flex-col h-full"
              style={{ background: "color-mix(in oklch, var(--background) 85%, transparent)", border: "1px solid color-mix(in oklch, var(--turquoise) 15%, transparent)" }}>
              <div className="relative h-48 overflow-hidden">
                <Image src={ex.img} alt={ex.title} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: "linear-gradient(to top, color-mix(in oklch, #0a1a1a 60%, transparent), transparent)" }} />
                <div className="absolute top-3 left-3 flex flex-wrap gap-1">
                  {ex.tags.map(tag => (
                    <span key={tag} className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold text-white"
                      style={{ background: "color-mix(in oklch, var(--turquoise) 80%, #0a1a1a)" }}>{tag}</span>
                  ))}
                </div>
                <div className="absolute top-3 right-3 rounded-full px-2.5 py-0.5 text-[10px] font-semibold text-white"
                  style={{ background: "color-mix(in oklch, #0a1a1a 70%, transparent)", backdropFilter: "blur(8px)" }}>
                  <Timer size={13} className="inline-block mr-1" style={{ color: "var(--turquoise)" }} strokeWidth={2} />{ex.duration}
                </div>
              </div>
              <div className="flex flex-col gap-3 p-5 flex-1">
                <h3 className="font-bold text-base">{ex.title}</h3>
                <p className="text-sm leading-relaxed flex-1" style={{ color: "color-mix(in oklch, var(--foreground) 68%, transparent)" }}>{ex.description}</p>
                <ul className="flex flex-wrap gap-x-4 gap-y-1">
                  {ex.highlights.map(h => (
                    <li key={h} className="text-xs flex items-center gap-1" style={{ color: "color-mix(in oklch, var(--turquoise) 80%, var(--foreground))" }}>
                      <Check size={12} className="inline-block mr-1 shrink-0" style={{ color: "var(--turquoise)" }} strokeWidth={2.5} />{h}
                    </li>
                  ))}
                </ul>
                <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: "color-mix(in oklch, var(--turquoise) 10%, transparent)" }}>
                  <span className="text-sm font-semibold" style={{ color: "var(--gold-premium)" }}>{ex.price}</span>
                  <a href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(`Bonjour AfriNomade ! Je suis intéressé(e) par l'excursion "${ex.title}". Pouvez-vous me donner plus d'informations ?`)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold text-white transition-all hover:scale-105"
                    style={{ background: "linear-gradient(135deg, var(--turquoise), color-mix(in oklch, var(--turquoise) 70%, var(--gold-premium)))" }}>
                    Réserver
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </ScrollAnimation>
        ))}
      </div>
    </>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";

type Slide = { src: string; alt: string };

type CarouselProps = {
  slides: Slide[];
  className?: string;
  height?: number;
  autoPlayMs?: number;
};

export default function Carousel({ slides, className, height = 240, autoPlayMs = 4000 }: CarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const autoRef = useRef<number | null>(null);
  const pausedRef = useRef(false);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const items = Array.from(el.querySelectorAll("[data-slide]"));
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) {
          const idx = Number((visible.target as HTMLElement).dataset.index || 0);
          setActive(idx);
        }
      },
      { root: el, threshold: [0.5, 0.75] }
    );
    items.forEach((n) => obs.observe(n));
    return () => obs.disconnect();
  }, []);

  const scrollTo = (index: number) => {
    const el = trackRef.current;
    if (!el) return;
    const child = el.querySelector(`[data-index="${index}"]`) as HTMLElement | null;
    child?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  };

  const next = () => scrollTo((active + 1) % slides.length);
  const prev = () => scrollTo((active - 1 + slides.length) % slides.length);

  useEffect(() => {
    if (!autoPlayMs) return;
    const tick = () => {
      if (!pausedRef.current) next();
      autoRef.current = window.setTimeout(tick, autoPlayMs);
    };
    autoRef.current = window.setTimeout(tick, autoPlayMs);
    return () => {
      if (autoRef.current) window.clearTimeout(autoRef.current);
    };
  }, [active, autoPlayMs]);

  return (
    <div
      className={`relative ${className || ""}`}
      onMouseEnter={() => (pausedRef.current = true)}
      onMouseLeave={() => (pausedRef.current = false)}
      onFocus={() => (pausedRef.current = true)}
      onBlur={() => (pausedRef.current = false)}
      role="region"
      aria-label="Carrousel d’images"
    >
      <div
        ref={trackRef}
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2"
        style={{ scrollBehavior: "smooth" }}
        aria-roledescription="carousel"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") next();
          if (e.key === "ArrowLeft") prev();
        }}
      >
        {slides.map((s, i) => (
          <img
            key={i}
            data-slide
            data-index={i}
            src={s.src}
            alt={s.alt}
            className="h-40 w-auto shrink-0 snap-center rounded-xl object-cover md:h-56"
          />
        ))}
      </div>
      <div className="pointer-events-none absolute inset-y-0 flex w-full items-center justify-between">
        <button
          aria-label="Précédent"
          className="pointer-events-auto ml-1 rounded-full border border-white/20 bg-black/20 px-3 py-2 text-white backdrop-blur hover:bg-black/40"
          onClick={prev}
          type="button"
        >
          ‹
        </button>
        <button
          aria-label="Suivant"
          className="pointer-events-auto mr-1 rounded-full border border-white/20 bg-black/20 px-3 py-2 text-white backdrop-blur hover:bg-black/40"
          onClick={next}
          type="button"
        >
          ›
        </button>
      </div>
      <div className="mt-2 flex justify-center gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            aria-label={`Aller au slide ${i + 1}`}
            onClick={() => scrollTo(i)}
            className={`h-2 w-2 rounded-full ${i === active ? "bg-[var(--royal-blue)]" : "bg-black/20"}`}
            type="button"
          />)
        )}
      </div>
    </div>
  );
}



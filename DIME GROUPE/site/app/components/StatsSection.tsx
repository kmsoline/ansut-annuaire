"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface StatItem {
  value: string;
  label: string;
}

interface Props {
  items: StatItem[];
}

function parseValue(raw: string): { num: number; suffix: string } {
  const match = raw.match(/^([\d,.]+)(.*)$/);
  if (!match) return { num: 0, suffix: raw };
  return {
    num: parseFloat(match[1].replace(",", ".")),
    suffix: match[2].trim(),
  };
}

function AnimatedStat({ item, started }: { item: StatItem; started: boolean }) {
  const { num, suffix } = parseValue(item.value);
  const [count, setCount] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!started) return;
    const duration = 1400;
    let startTime: number | null = null;
    const step = (ts: number) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * num));
      if (progress < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [started, num]);

  const display = Number.isInteger(num) ? String(count) : count.toString();

  return (
    <div className="flex flex-col items-center gap-1 group">
      <span className="text-4xl md:text-5xl font-extrabold gradient-text tabular-nums leading-none">
        {display}{suffix}
      </span>
      <span className="text-sm text-center leading-snug text-[color-mix(in_oklch,var(--foreground)_55%,transparent)]">{item.label}</span>
    </div>
  );
}

export default function StatsSection({ items }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setStarted(true); observer.disconnect(); } },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (!items.length) return null;

  return (
    <div
      ref={ref}
      className={`grid grid-cols-2 md:grid-cols-4 gap-8 transition-all duration-700 ${started ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
    >
      {items.map((item, i) => (
        <AnimatedStat key={i} item={item} started={started} />
      ))}
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Lock } from "lucide-react";
import AnimatedLogo from "./AnimatedLogo";

interface NavLink { href: string; label: string; }

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [links, setLinks] = useState<NavLink[]>([]);
  const [ctaLabel, setCtaLabel] = useState("Demander un devis");

  useEffect(() => {
    fetch("/api/navigation/header")
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setLinks(data.map((l: NavLink) => ({ href: l.href, label: l.label }))); })
      .catch(() => {});

    fetch("/api/settings")
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.navbar_cta_label) setCtaLabel(d.navbar_cta_label); })
      .catch(() => {});
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);

  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 glass glass-strong" role="banner" style={{ position: "relative", zIndex: 50 }}>
      <div className="container flex h-16 items-center justify-between">
        <AnimatedLogo showText={true} />

        <nav className="hidden gap-6 md:flex" role="navigation" aria-label="Navigation principale">
          {links.map(l => (
            <Link key={l.href} href={l.href}
              className={`text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-md px-2 py-1 hover-lift ${pathname === l.href ? "text-[var(--royal-blue)] font-semibold" : "hover:text-[var(--royal-blue)]"}`}
              style={{ color: pathname === l.href ? undefined : "color-mix(in oklch, var(--foreground) 75%, transparent)" }}
              aria-current={pathname === l.href ? "page" : undefined}>
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2" style={{ position: "relative", zIndex: 1 }}>
          <Link href="/contact" className="btn btn-outline ripple hidden md:inline-flex">{ctaLabel}</Link>
          <Link href="/admin/login" aria-label="Connexion administration" title="Espace administration"
            className="hidden md:flex items-center justify-center w-8 h-8 rounded-full transition-all hover:scale-110"
            style={{ background: "color-mix(in oklch, var(--foreground) 6%, transparent)", border: "1px solid color-mix(in oklch, var(--foreground) 10%, transparent)", color: "color-mix(in oklch, var(--foreground) 45%, transparent)" }}>
            <Lock size={13} strokeWidth={2} />
          </Link>
          <button aria-label={open ? "Fermer le menu" : "Ouvrir le menu"} aria-expanded={open}
            className="md:hidden flex flex-col justify-center gap-1.5 w-9 h-9 rounded-md p-2 border border-black/10 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            onClick={() => setOpen(v => !v)} onKeyDown={handleKeyDown}>
            <span className="block h-0.5 w-full rounded-full transition-all duration-300 origin-center" style={{ background: "var(--royal-blue)", transform: open ? "rotate(45deg) translate(0, 8px)" : "none" }} aria-hidden="true" />
            <span className="block h-0.5 w-full rounded-full transition-all duration-300" style={{ background: "var(--royal-blue)", opacity: open ? 0 : 1, transform: open ? "scaleX(0)" : "none" }} aria-hidden="true" />
            <span className="block h-0.5 w-full rounded-full transition-all duration-300 origin-center" style={{ background: "var(--royal-blue)", transform: open ? "rotate(-45deg) translate(0, -8px)" : "none" }} aria-hidden="true" />
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden" role="navigation" aria-label="Menu mobile">
          <div className="container pb-4">
            <div className="flex flex-col gap-2 rounded-lg border border-white/10 p-3 glass">
              {links.map(l => (
                <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
                  className={`rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${pathname === l.href ? "bg-black/5 font-semibold" : "hover:bg-black/5"}`}
                  aria-current={pathname === l.href ? "page" : undefined}>
                  {l.label}
                </Link>
              ))}
              <Link href="/contact" className="btn btn-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">{ctaLabel}</Link>
              <Link href="/admin/login" onClick={() => setOpen(false)}
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-black/5"
                style={{ color: "color-mix(in oklch, var(--foreground) 55%, transparent)" }}>
                <Lock size={13} />
                Administration
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

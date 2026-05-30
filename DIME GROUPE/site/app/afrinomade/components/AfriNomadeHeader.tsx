"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const LINKS = [
  { href: "/afrinomade/excursions", label: "Excursions" },
  { href: "/afrinomade/residences", label: "Résidences" },
  { href: "/afrinomade/transport", label: "Transport" },
  { href: "/afrinomade/bons-plans", label: "Bons plans" },
];

export default function AfriNomadeHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header
      className="sticky top-0 z-40 border-b"
      style={{
        background: "color-mix(in oklch, var(--background) 85%, transparent)",
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
        borderColor: "color-mix(in oklch, var(--turquoise) 20%, transparent)",
      }}
    >
      <div className="container flex h-16 items-center justify-between gap-4">
        {/* Logo */}
        <Link
          href="/afrinomade"
          className="flex items-center gap-2 shrink-0"
          aria-label="AfriNomade – Accueil"
        >
          <Image
            src="/afrinomade/logo.png"
            alt="AfriNomade"
            width={40}
            height={40}
            className="h-9 w-9 object-contain"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = "/afrinomade/logo.svg";
            }}
          />
          <span
            className="text-base font-bold tracking-tight hidden sm:block"
            style={{ color: "var(--afri-primary)" }}
          >
            AfriNomade
          </span>
        </Link>

        {/* Nav desktop */}
        <nav className="hidden md:flex items-center gap-1">
          {LINKS.map((l) => {
            const active = pathname?.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className="relative px-4 py-2 text-sm font-medium rounded-full transition-all duration-200"
                style={{
                  color: active ? "var(--turquoise)" : "color-mix(in oklch, var(--foreground) 75%, transparent)",
                  background: active
                    ? "color-mix(in oklch, var(--turquoise) 12%, transparent)"
                    : "transparent",
                }}
              >
                {l.label}
                {active && (
                  <span
                    className="absolute bottom-1 left-1/2 -translate-x-1/2 h-0.5 w-4 rounded-full"
                    style={{ background: "var(--turquoise)" }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* CTA + hamburger */}
        <div className="flex items-center gap-3">
          <Link
            href="/afrinomade/reservation"
            className="hidden sm:inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-lg"
            style={{
              background: "linear-gradient(135deg, var(--turquoise), color-mix(in oklch, var(--turquoise) 75%, var(--gold-premium)))",
              boxShadow: "0 4px 20px color-mix(in oklch, var(--turquoise) 30%, transparent)",
            }}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.122 1.534 5.857L.046 23.953l6.214-1.492A11.952 11.952 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.366l-.359-.214-3.722.894.919-3.619-.234-.373A9.818 9.818 0 1112 21.818z"/>
            </svg>
            Réserver
          </Link>

          {/* Hamburger mobile */}
          <button
            className="md:hidden flex flex-col justify-center gap-1.5 w-8 h-8"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            <span
              className="h-0.5 w-6 rounded-full transition-all duration-300"
              style={{
                background: "var(--turquoise)",
                transform: open ? "rotate(45deg) translate(4px, 4px)" : "none",
              }}
            />
            <span
              className="h-0.5 w-6 rounded-full transition-all duration-300"
              style={{
                background: "var(--turquoise)",
                opacity: open ? 0 : 1,
              }}
            />
            <span
              className="h-0.5 w-6 rounded-full transition-all duration-300"
              style={{
                background: "var(--turquoise)",
                transform: open ? "rotate(-45deg) translate(4px, -4px)" : "none",
              }}
            />
          </button>
        </div>
      </div>

      {/* Menu mobile dropdown */}
      <div
        className="md:hidden overflow-hidden transition-all duration-300"
        style={{ maxHeight: open ? "320px" : "0px" }}
      >
        <nav className="container pb-4 flex flex-col gap-1">
          {LINKS.map((l) => {
            const active = pathname?.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200"
                style={{
                  color: active ? "var(--turquoise)" : "color-mix(in oklch, var(--foreground) 80%, transparent)",
                  background: active
                    ? "color-mix(in oklch, var(--turquoise) 10%, transparent)"
                    : "transparent",
                  borderLeft: active ? "3px solid var(--turquoise)" : "3px solid transparent",
                }}
              >
                {l.label}
              </Link>
            );
          })}
          <Link
            href="/afrinomade/reservation"
            onClick={() => setOpen(false)}
            className="mt-2 flex items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-semibold text-white"
            style={{
              background: "linear-gradient(135deg, var(--turquoise), color-mix(in oklch, var(--turquoise) 75%, var(--gold-premium)))",
            }}
          >
            Demander une réservation
          </Link>
        </nav>
      </div>
    </header>
  );
}

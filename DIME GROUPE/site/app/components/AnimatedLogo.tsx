"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

type AnimatedLogoProps = {
  variant?: "default" | "afrinomade";
  showText?: boolean;
  className?: string;
};

export default function AnimatedLogo({
  variant = "default",
  showText = true,
  className = "",
}: AnimatedLogoProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [siteLogo, setSiteLogo] = useState<{ logoUrl: string; logoText: string; showText: boolean } | null>(null);

  // Respecter prefers-reduced-motion
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      setPrefersReducedMotion(mediaQuery.matches);

      const handleChange = (e: MediaQueryListEvent) => {
        setPrefersReducedMotion(e.matches);
      };

      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, []);

  useEffect(() => {
    if (variant === "default") {
      loadLogo();
    } else {
      // Pour AfriNomade, on utilise les valeurs par défaut
      setIsLoaded(true);
    }
  }, [variant]);

  const loadLogo = async () => {
    try {
      const response = await fetch("/api/navigation/logo");
      if (response.ok) {
        const data = await response.json();
        setSiteLogo(data);
        setIsLoaded(true);
      } else {
        // Fallback sur les valeurs par défaut
        setSiteLogo({ logoUrl: "/dime-logo.png", logoText: "DIME GROUPE", showText: true });
        setIsLoaded(true);
      }
    } catch (error) {
      // Fallback sur les valeurs par défaut
      setSiteLogo({ logoUrl: "/dime-logo.png", logoText: "DIME GROUPE", showText: true });
      setIsLoaded(true);
    }
  };

  const logoConfig = {
    default: {
      src: siteLogo?.logoUrl || "/dime-logo.png",
      alt: siteLogo?.logoText || "DIME GROUPE",
      text: siteLogo?.logoText || "DIME GROUPE",
      href: "/",
    },
    afrinomade: {
      src: "/afrinomade/logo.png",
      alt: "AfriNomade",
      text: "AfriNomade",
      href: "/afrinomade",
      fallback: "/afrinomade/logo.svg",
    },
  };

  const config = logoConfig[variant];
  const shouldShowText = variant === "default" ? (siteLogo?.showText ?? showText) : showText;

  return (
    <Link
      href={config.href}
      className={`flex items-center gap-2 group ${className}`}
      aria-label={`${config.text} - Page d'accueil`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative">
        {/* Glow effect */}
        <div
          className={`absolute inset-0 rounded-full blur-md bg-[color-mix(in_oklch,var(--royal-blue)_20%,transparent)] transition-opacity duration-300 ${
            isHovered && !prefersReducedMotion ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Logo container */}
        <div
          className={`relative transition-all duration-300 ${
            isHovered && !prefersReducedMotion
              ? "scale-110 rotate-3"
              : "scale-100 rotate-0"
          }`}
        >
            <Image
              src={config.src}
              alt={config.alt}
              width={variant === "default" ? 48 : 56}
              height={variant === "default" ? 48 : 56}
              className={`${variant === "default" ? "h-10 w-10 md:h-12 md:w-12" : "h-12 w-12 md:h-16 md:w-16"} object-contain transition-all duration-300 ${
                isLoaded ? "opacity-100" : "opacity-0"
              }`}
              onLoad={() => setIsLoaded(true)}
              onError={(e) => {
                if (variant === "afrinomade" && logoConfig.afrinomade.fallback) {
                  // Fallback vers SVG si PNG échoue
                  const target = e.target as HTMLImageElement;
                  if (target) {
                    target.src = logoConfig.afrinomade.fallback;
                  }
                } else if (variant === "default") {
                  // Fallback vers le logo par défaut si l'image ne charge pas
                  const target = e.target as HTMLImageElement;
                  if (target && target.src !== "/dime-logo.png") {
                    target.src = "/dime-logo.png";
                    setIsLoaded(true);
                  }
                }
              }}
              priority={variant === "default"}
            />

          {/* Animation de pulse subtile */}
          {!prefersReducedMotion && (
            <div className="absolute inset-0 rounded-full border-2 border-[color-mix(in_oklch,var(--royal-blue)_30%,transparent)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse" />
          )}
        </div>
      </div>

      {shouldShowText && (
        <span
          className={`${variant === "default" ? "text-base md:text-lg" : "text-lg md:text-xl"} font-semibold tracking-wide transition-all duration-300 ${
            isHovered && !prefersReducedMotion
              ? "text-[var(--royal-blue)] scale-105"
              : ""
          }`}
          style={
            variant === "afrinomade"
              ? { color: isHovered ? "var(--turquoise)" : "var(--afri-primary)", fontWeight: 700 }
              : {}
          }
        >
          {config.text}
        </span>
      )}
    </Link>
  );
}


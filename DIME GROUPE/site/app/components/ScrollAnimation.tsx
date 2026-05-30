"use client";

import { useEffect, useRef, useState, ReactNode } from "react";

interface ScrollAnimationProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  threshold?: number;
  animation?: "fadeInUp" | "fadeIn" | "slideInLeft" | "slideInRight" | "scaleIn" | "typewriter" | "reveal";
}

export default function ScrollAnimation({
  children,
  className = "",
  delay = 0,
  threshold = 0.1,
  animation = "fadeInUp",
}: ScrollAnimationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Vérifier prefers-reduced-motion
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      setPrefersReducedMotion(mediaQuery.matches);

      const handleChange = (e: MediaQueryListEvent) => {
        setPrefersReducedMotion(e.matches);
      };

      mediaQuery.addEventListener("change", handleChange);

      // Vérifier si on est sur mobile
      const checkMobile = () => {
        setIsMobile(window.innerWidth < 768);
      };
      checkMobile();
      window.addEventListener("resize", checkMobile);

      return () => {
        mediaQuery.removeEventListener("change", handleChange);
        window.removeEventListener("resize", checkMobile);
      };
    }
  }, []);

  useEffect(() => {
    // Si réduit motion, afficher immédiatement
    if (prefersReducedMotion) {
      setIsVisible(true);
      setHasAnimated(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setTimeout(() => {
            setIsVisible(true);
            setHasAnimated(true);
          }, delay);
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [delay, threshold, hasAnimated, prefersReducedMotion]);

  // Si réduit motion, afficher sans animation
  if (prefersReducedMotion) {
    return <div ref={ref} className={className}>{children}</div>;
  }

  const animationClasses: Record<string, string> = {
    fadeInUp: isVisible ? "animate-fade-in-up" : "opacity-0 translate-y-8",
    fadeIn: isVisible ? "animate-fade-in" : "opacity-0",
    slideInLeft: isVisible ? "animate-slide-in-left" : "opacity-0 -translate-x-8",
    slideInRight: isVisible ? "animate-slide-in-right" : "opacity-0 translate-x-8",
    scaleIn: isVisible ? "animate-scale-in" : "opacity-0 scale-95",
    typewriter: isVisible ? "typewriter-animation" : "",
    reveal: isVisible ? "reveal-animation" : "",
  };

  // Sur mobile, animations plus simples
  const transitionDuration = isMobile ? "300ms" : "700ms";

  return (
    <div
      ref={ref}
      className={`transition-all ease-out ${animationClasses[animation]} ${className}`}
      style={{ transitionDuration }}
    >
      {children}
    </div>
  );
}


"use client";

import { useEffect, useState, useRef } from "react";

interface AnimatedTextProps {
  text: string;
  className?: string;
  delay?: number;
  speed?: number;
  variant?: "typewriter" | "fadeInWord" | "slideIn" | "glitch" | "gradient";
}

export default function AnimatedText({
  text,
  className = "",
  delay = 0,
  speed = 50,
  variant = "fadeInWord",
}: AnimatedTextProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [isVisible, setIsVisible] = useState(false);
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
      setDisplayedText(text);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [prefersReducedMotion, text]);

  useEffect(() => {
    if (!isVisible || prefersReducedMotion) {
      if (prefersReducedMotion) {
        setDisplayedText(text);
      }
      return;
    }

    if (variant === "typewriter") {
      let index = 0;
      const timer = setTimeout(() => {
        const interval = setInterval(() => {
          if (index < text.length) {
            setDisplayedText(text.slice(0, index + 1));
            index++;
          } else {
            clearInterval(interval);
          }
        }, isMobile ? speed * 0.7 : speed);

        return () => clearInterval(interval);
      }, delay);

      return () => clearTimeout(timer);
    } else {
      setDisplayedText(text);
    }
  }, [isVisible, text, variant, speed, delay, prefersReducedMotion, isMobile]);

  // Si réduit motion, afficher sans animation
  if (prefersReducedMotion) {
    return (
      <div ref={ref} className={className}>
        {text}
      </div>
    );
  }

  // Sur mobile, simplifier les animations
  const effectiveDelay = isMobile ? delay * 0.5 : delay;
  const effectiveSpeed = isMobile ? speed * 0.7 : speed;

  if (variant === "fadeInWord") {
    const words = text.split(" ");
    return (
      <div ref={ref} className={`${className} flex flex-wrap gap-2`}>
        {words.map((word, i) => (
          <span
            key={i}
            className={`inline-block ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}
            style={{ 
              animationDelay: `${effectiveDelay + i * (isMobile ? 0.05 : 0.1)}s`, 
              animationFillMode: "both",
              transitionDuration: isMobile ? "300ms" : "700ms"
            }}
          >
            {word}
          </span>
        ))}
      </div>
    );
  }

  if (variant === "slideIn") {
    return (
      <div ref={ref} className={className}>
        <span 
          className={`inline-block ${isVisible ? "animate-slide-in-right" : "opacity-0 translate-x-8"}`}
          style={{ transitionDuration: isMobile ? "300ms" : "700ms" }}
        >
          {displayedText}
        </span>
      </div>
    );
  }

  if (variant === "gradient") {
    return (
      <div ref={ref} className={className}>
        <span
          className={`gradient-text inline-block ${isVisible ? "animate-fade-in" : "opacity-0"}`}
          style={{ 
            animationDelay: `${effectiveDelay}s`,
            transitionDuration: isMobile ? "300ms" : "700ms"
          }}
        >
          {displayedText}
        </span>
      </div>
    );
  }

  return (
    <div ref={ref} className={className}>
      <span 
        className={variant === "typewriter" && !isMobile ? "typewriter-text" : ""}
        style={{ transitionDuration: isMobile ? "300ms" : "700ms" }}
      >
        {displayedText}
      </span>
    </div>
  );
}


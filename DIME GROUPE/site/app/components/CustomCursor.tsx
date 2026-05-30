"use client";

import { useEffect, useState } from "react";

export default function CustomCursor() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isPointer, setIsPointer] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Vérifier si on est sur mobile/tablette
    const checkMobile = () => {
      if (typeof window !== "undefined") {
        setIsMobile(window.innerWidth < 1024);
      }
    };

    // Vérifier prefers-reduced-motion
    const checkReducedMotion = () => {
      if (typeof window !== "undefined") {
        const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
        setPrefersReducedMotion(mediaQuery.matches);

        const handleChange = (e: MediaQueryListEvent) => {
          setPrefersReducedMotion(e.matches);
        };

        mediaQuery.addEventListener("change", handleChange);
        return () => mediaQuery.removeEventListener("change", handleChange);
      }
      return () => {};
    };

    checkMobile();
    const cleanup = checkReducedMotion();

    if (typeof window !== "undefined") {
      window.addEventListener("resize", checkMobile);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("resize", checkMobile);
      }
      cleanup();
    };
  }, []);

  useEffect(() => {
    if (isMobile || prefersReducedMotion) {
      return;
    }

    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseEnter = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "A" ||
        target.tagName === "BUTTON" ||
        target.closest("a, button") ||
        target.classList.contains("cursor-pointer") ||
        target.closest(".cursor-pointer")
      ) {
        setIsPointer(true);
      } else {
        setIsPointer(false);
      }

      if (target.closest(".hover-lift, .card-hover, .btn")) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    window.addEventListener("mousemove", updateMousePosition);
    window.addEventListener("mouseenter", handleMouseEnter);
    window.addEventListener("mouseover", handleMouseEnter);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", updateMousePosition);
      window.removeEventListener("mouseenter", handleMouseEnter);
      window.removeEventListener("mouseover", handleMouseEnter);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isMobile, prefersReducedMotion]);

  // Désactiver sur mobile/tablette ou si prefers-reduced-motion
  if (isMobile || prefersReducedMotion) {
    return null;
  }

  return (
    <>
      {/* Curseur principal */}
      <div
        className="fixed pointer-events-none z-[9999] mix-blend-difference"
        style={{
          left: `${mousePosition.x}px`,
          top: `${mousePosition.y}px`,
          transform: "translate(-50%, -50%)",
          transition: "transform 0.1s ease-out, width 0.2s ease, height 0.2s ease",
        }}
      >
        <div
          className={`rounded-full bg-white transition-all duration-200 ${
            isClicking
              ? "w-4 h-4"
              : isHovering
              ? "w-8 h-8"
              : isPointer
              ? "w-6 h-6"
              : "w-2 h-2"
          }`}
        />
      </div>

      {/* Cercle extérieur */}
      <div
        className="fixed pointer-events-none z-[9998] border border-white/50 rounded-full mix-blend-difference"
        style={{
          left: `${mousePosition.x}px`,
          top: `${mousePosition.y}px`,
          transform: "translate(-50%, -50%)",
          width: isHovering ? "60px" : isPointer ? "40px" : "32px",
          height: isHovering ? "60px" : isPointer ? "40px" : "32px",
          transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1), height 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      />

      {/* Particules de traînée (optionnel) */}
      {isHovering && (
        <div
          className="fixed pointer-events-none z-[9997]"
          style={{
            left: `${mousePosition.x}px`,
            top: `${mousePosition.y}px`,
            transform: "translate(-50%, -50%)",
          }}
        >
          <div className="absolute w-2 h-2 rounded-full bg-white/30 animate-ping" />
          <div
            className="absolute w-1 h-1 rounded-full bg-white/50"
            style={{
              animation: "fadeOut 0.5s ease-out forwards",
            }}
          />
        </div>
      )}
    </>
  );
}


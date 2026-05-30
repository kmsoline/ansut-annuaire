"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface Testimonial {
  name: string;
  role: string;
  company?: string;
  text: string;
  avatar?: string;
  rating?: number;
}

interface TestimonialsCarouselProps {
  testimonials: Testimonial[];
  autoplayInterval?: number; // en ms, défaut 5000
}

export default function TestimonialsCarousel({ testimonials, autoplayInterval = 5000 }: TestimonialsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused || testimonials.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, autoplayInterval);

    return () => clearInterval(interval);
  }, [isPaused, testimonials.length, autoplayInterval]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 3000);
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 3000);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 3000);
  };

  if (testimonials.length === 0) return null;

  const current = testimonials[currentIndex];

  return (
    <div
      className="relative w-full"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      role="region"
      aria-label="Témoignages clients"
    >
      <div className="rounded-xl border border-white/10 p-6 md:p-8 glass">
        <div className="flex items-start gap-4">
          {current.avatar ? (
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full">
              <Image src={current.avatar} alt={current.name} fill className="object-cover" />
            </div>
          ) : (
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary/20 text-2xl font-semibold text-primary">
              {current.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex-1">
            {current.rating && (
              <div className="mb-2 flex gap-1" aria-label={`Note: ${current.rating} sur 5`}>
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={i < current.rating! ? "text-primary" : "text-gray-400"}>
                    ★
                  </span>
                ))}
              </div>
            )}
            <blockquote className="text-sm text-[color-mix(in_oklch,var(--foreground)_80%,transparent)] leading-relaxed">
              "{current.text}"
            </blockquote>
            <footer className="mt-4 flex items-center gap-2">
              <div>
                <p className="font-semibold text-sm">{current.name}</p>
                <p className="text-xs text-[color-mix(in_oklch,var(--foreground)_65%,transparent)]">
                  {current.role}
                  {current.company && ` • ${current.company}`}
                </p>
              </div>
            </footer>
          </div>
        </div>
      </div>

      {/* Navigation */}
      {testimonials.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white opacity-0 transition-opacity hover:opacity-100 focus:opacity-100"
            aria-label="Témoignage précédent"
          >
            ←
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white opacity-0 transition-opacity hover:opacity-100 focus:opacity-100"
            aria-label="Témoignage suivant"
          >
            →
          </button>

          {/* Indicators */}
          <div className="mt-4 flex justify-center gap-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentIndex ? "w-8 bg-primary" : "w-2 bg-white/30"
                }`}
                aria-label={`Aller au témoignage ${index + 1}`}
                aria-current={index === currentIndex ? "true" : "false"}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}



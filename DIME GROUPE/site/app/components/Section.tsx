"use client";

import ScrollAnimation from "./ScrollAnimation";
import AnimatedText from "./AnimatedText";

type SectionProps = {
  id?: string;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
};

export default function Section({ id, title, subtitle, children }: SectionProps) {
  return (
    <section id={id} className="container py-12 md:py-16">
      {(title || subtitle) && (
        <div className="mb-8 md:mb-10">
          {subtitle && (
            <ScrollAnimation animation="slideInLeft" delay={0}>
              <p className="mb-2 text-xs uppercase tracking-widest text-[color-mix(in_oklch,var(--foreground)_60%,transparent)]">{subtitle}</p>
            </ScrollAnimation>
          )}
          {title && (
            <ScrollAnimation animation="fadeInUp" delay={100}>
              <AnimatedText
                text={title}
                variant="fadeInWord"
                className="text-2xl font-semibold tracking-tight md:text-3xl gradient-text"
                delay={0}
              />
            </ScrollAnimation>
          )}
        </div>
      )}
      {children}
    </section>
  );
}



import Link from "next/link";
import CTAButton from "./components/CTAButton";
import Image from "next/image";
import ScrollAnimation from "./components/ScrollAnimation";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="container text-center py-16">
        <div className="max-w-2xl mx-auto">
          <ScrollAnimation animation="fadeInUp" delay={0}>
            <div className="relative h-64 w-full mb-8 rounded-xl overflow-hidden glass depth-shadow-strong hover-3d">
              <Image
                src="/images/hero.jpg"
                alt="404"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover opacity-50 image-hover"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <h1 className="text-9xl font-bold text-primary/30">404</h1>
              </div>
            </div>
          </ScrollAnimation>
          <ScrollAnimation animation="fadeInUp" delay={200}>
            <h2 className="text-3xl font-semibold mb-4 text-lift">Page introuvable</h2>
            <p className="text-sm text-[color-mix(in_oklch,var(--foreground)_75%,transparent)] mb-8">
              Désolé, la page que vous recherchez n'existe pas ou a été déplacée. Retournez à l'accueil ou explorez nos services.
            </p>
          </ScrollAnimation>
          <ScrollAnimation animation="fadeInUp" delay={400}>
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              <CTAButton href="/">Retour à l'accueil</CTAButton>
              <CTAButton href="/services" variant="outline">Nos services</CTAButton>
              <CTAButton href="/contact" variant="outline">Nous contacter</CTAButton>
            </div>
          </ScrollAnimation>
          <ScrollAnimation animation="fadeInUp" delay={600}>
            <div className="mt-8 rounded-xl border border-white/10 p-5 glass card-hover-3d depth-shadow hover-lift">
              <p className="text-xs text-[color-mix(in_oklch,var(--foreground)_65%,transparent)] mb-4">
                Liens utiles :
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-xs">
                <Link href="/portfolio" className="text-[color-mix(in_oklch,var(--foreground)_70%,transparent)] hover:text-primary transition-colors text-lift">
                  Portfolio
                </Link>
                <Link href="/about" className="text-[color-mix(in_oklch,var(--foreground)_70%,transparent)] hover:text-primary transition-colors text-lift">
                  À propos
                </Link>
                <Link href="/faq" className="text-[color-mix(in_oklch,var(--foreground)_70%,transparent)] hover:text-primary transition-colors text-lift">
                  FAQ
                </Link>
                <Link href="/afrinomade" className="text-[color-mix(in_oklch,var(--foreground)_70%,transparent)] hover:text-primary transition-colors text-lift">
                  AfriNomade
                </Link>
              </div>
            </div>
          </ScrollAnimation>
        </div>
      </div>
    </main>
  );
}


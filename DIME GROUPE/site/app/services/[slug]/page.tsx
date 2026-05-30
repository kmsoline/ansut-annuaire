import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Section from "../../components/Section";
import CTAButton from "../../components/CTAButton";
import ScrollAnimation from "../../components/ScrollAnimation";
import { dbSelectOne } from "@/lib/db";

type Props = { params: Promise<{ slug: string }> };

interface ServiceItem { icon: string; name: string; description: string; details?: string[]; }
interface Service {
  id: string; slug: string; title: string; icon: string;
  description: string; long_description: string; img: string;
  items: ServiceItem[]; benefits: string[]; process: string[];
  pricing: string; active: boolean;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const service = await dbSelectOne<Service>("services", `slug=eq.${slug}&active=eq.true`);
  return {
    title: service ? `${service.title} | Services DIME GROUPE` : "Service non trouvé",
    description: service?.description || "Service DIME GROUPE",
  };
}

export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params;
  const service = await dbSelectOne<Service>("services", `slug=eq.${slug}&active=eq.true`);

  if (!service) notFound();

  return (
    <main id="main-content" role="main">
      {/* Hero */}
      <section className="container pt-16 md:pt-24">
        <div className="mb-6">
          <Link href="/services" className="text-sm text-[color-mix(in_oklch,var(--foreground)_70%,transparent)] hover:text-primary transition-colors">
            ← Retour aux services
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-2 items-start">
          <ScrollAnimation animation="slideInLeft" delay={0}>
            <div className="relative h-64 overflow-hidden rounded-xl md:h-96 glass depth-shadow-strong hover-3d">
              <Image src={service.img} alt={service.title} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover image-hover" />
            </div>
          </ScrollAnimation>
          <ScrollAnimation animation="slideInRight" delay={200}>
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-3xl">{service.icon}</span>
                <h1 className="text-3xl md:text-4xl font-semibold">{service.title}</h1>
              </div>
              <p className="text-base text-[color-mix(in_oklch,var(--foreground)_75%,transparent)] mb-6 leading-relaxed">
                {service.description}
              </p>
              <p className="text-sm text-[color-mix(in_oklch,var(--foreground)_70%,transparent)] mb-6 leading-relaxed">
                {service.long_description}
              </p>
              <div className="flex flex-wrap gap-3">
                <CTAButton href={`/contact?service=${slug}`}>Demander un devis</CTAButton>
                <CTAButton href="/contact" variant="outline">Nous contacter</CTAButton>
              </div>
            </div>
          </ScrollAnimation>
        </div>
      </section>

      {/* Services détaillés */}
      <Section subtitle="Nos prestations" title="Détails des services">
        <div className="grid gap-6 md:grid-cols-2">
          {(service.items || []).map((item, i) => (
            <ScrollAnimation key={i} animation="fadeInUp" delay={i * 100}>
              <div className="rounded-xl border border-white/10 p-6 glass card-hover-3d depth-shadow hover-lift">
                <div className="flex items-start gap-3 mb-4">
                  <span className="text-3xl shrink-0">{item.icon}</span>
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-lift">{item.name}</h3>
                    <p className="text-sm text-[color-mix(in_oklch,var(--foreground)_75%,transparent)] leading-relaxed mb-4">
                      {item.description}
                    </p>
                    {item.details && item.details.length > 0 && (
                      <ul className="space-y-2">
                        {item.details.map((detail, j) => (
                          <li key={j} className="text-xs text-[color-mix(in_oklch,var(--foreground)_70%,transparent)] flex items-start gap-2">
                            <span className="text-primary mt-1">•</span>
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            </ScrollAnimation>
          ))}
        </div>
      </Section>

      {/* Avantages */}
      {service.benefits && service.benefits.length > 0 && (
        <Section subtitle="Pourquoi nous choisir" title="Avantages">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {service.benefits.map((benefit, i) => (
              <ScrollAnimation key={i} animation="scaleIn" delay={i * 100}>
                <div className="rounded-lg border border-white/10 p-4 glass-light hover-3d depth-shadow hover-lift">
                  <p className="text-sm text-[color-mix(in_oklch,var(--foreground)_75%,transparent)]">
                    {benefit}
                  </p>
                </div>
              </ScrollAnimation>
            ))}
          </div>
        </Section>
      )}

      {/* Processus */}
      {service.process && service.process.length > 0 && (
        <Section subtitle="Notre approche" title="Processus">
          <div className="space-y-4">
            {service.process.map((step, i) => (
              <ScrollAnimation key={i} animation="slideInLeft" delay={i * 100}>
                <div className="flex items-start gap-4 rounded-lg border border-white/10 p-4 glass-light hover-lift">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary font-semibold text-sm shrink-0">
                    {i + 1}
                  </div>
                  <p className="text-sm text-[color-mix(in_oklch,var(--foreground)_75%,transparent)] flex-1">
                    {step}
                  </p>
                </div>
              </ScrollAnimation>
            ))}
          </div>
        </Section>
      )}

      {/* Tarification */}
      {service.pricing && (
        <Section subtitle="Tarification" title="Nos tarifs">
          <ScrollAnimation animation="fadeInUp" delay={0}>
            <div className="max-w-2xl mx-auto rounded-xl border border-white/10 p-6 glass glass-strong depth-shadow hover-lift text-center">
              <p className="text-sm text-[color-mix(in_oklch,var(--foreground)_75%,transparent)] mb-4">
                {service.pricing}
              </p>
              <CTAButton href={`/contact?service=${slug}`}>Demander un devis personnalisé</CTAButton>
            </div>
          </ScrollAnimation>
        </Section>
      )}

      {/* CTA Final */}
      <Section>
        <ScrollAnimation animation="fadeInUp" delay={0}>
          <div className="max-w-2xl mx-auto rounded-xl border border-white/10 p-8 glass glass-strong depth-shadow-strong hover-lift text-center">
            <h2 className="text-2xl font-semibold mb-4">Prêt à démarrer votre projet ?</h2>
            <p className="text-sm text-[color-mix(in_oklch,var(--foreground)_75%,transparent)] mb-6">
              Contactez-nous pour discuter de vos besoins et obtenir un devis personnalisé.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <CTAButton href={`/contact?service=${slug}`}>Demander un devis</CTAButton>
              <CTAButton href="/contact" variant="outline">Nous contacter</CTAButton>
            </div>
          </div>
        </ScrollAnimation>
      </Section>
    </main>
  );
}

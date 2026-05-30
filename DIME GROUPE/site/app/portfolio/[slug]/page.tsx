import { notFound } from "next/navigation";
import Section from "../../components/Section";
import Link from "next/link";
import Image from "next/image";
import CTAButton from "../../components/CTAButton";
import ScrollAnimation from "../../components/ScrollAnimation";
import { dbSelectOne } from "@/lib/db";

type Props = { params: Promise<{ slug: string }> };

interface Project {
  id: string; slug: string; title: string; category: string; tag: string;
  year: string; description: string; long_description: string;
  technologies: string[]; deliverables: string[]; sector: string;
  img: string; results: string[]; published: boolean;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const project = await dbSelectOne<Project>("portfolio_projects", `slug=eq.${slug}&published=eq.true`);
  return {
    title: project ? `Projet – ${project.title}` : `Projet – ${slug.replaceAll("-", " ")}`,
    description: project?.description || "Découvrez ce projet réalisé par DIME GROUPE",
  };
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = await dbSelectOne<Project>("portfolio_projects", `slug=eq.${slug}&published=eq.true`);

  if (!project) notFound();

  return (
    <main>
      {/* Hero */}
      <section className="container pt-16 md:pt-24">
        <div className="mb-6">
          <Link href="/portfolio" className="text-sm text-[color-mix(in_oklch,var(--foreground)_70%,transparent)] hover:text-primary transition-colors">
            ← Retour au portfolio
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-2 items-start">
          <ScrollAnimation animation="slideInLeft" delay={0}>
            <div className="relative h-64 overflow-hidden rounded-xl md:h-96 glass depth-shadow-strong hover-3d">
              <Image src={project.img} alt={project.title} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover image-hover" />
            </div>
          </ScrollAnimation>
          <ScrollAnimation animation="slideInRight" delay={200}>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 text-xs font-semibold rounded-md bg-primary/20 text-primary">{project.tag}</span>
                <span className="px-3 py-1 text-xs rounded-md bg-[color-mix(in_oklch,var(--primary)_10%,transparent)] text-[color-mix(in_oklch,var(--foreground)_80%,transparent)]">{project.category}</span>
              </div>
              <h1 className="text-3xl font-semibold mb-3">{project.title}</h1>
              <p className="text-base text-[color-mix(in_oklch,var(--foreground)_75%,transparent)] mb-4">{project.long_description}</p>
              <div className="flex flex-wrap gap-3">
                <div>
                  <span className="text-xs text-[color-mix(in_oklch,var(--foreground)_60%,transparent)]">Année:</span>
                  <span className="ml-2 text-sm font-semibold">{project.year}</span>
                </div>
                <div>
                  <span className="text-xs text-[color-mix(in_oklch,var(--foreground)_60%,transparent)]">Secteur:</span>
                  <span className="ml-2 text-sm font-semibold">{project.sector}</span>
                </div>
              </div>
            </div>
          </ScrollAnimation>
        </div>
      </section>

      {/* Détails */}
      <Section title="Détails du projet" subtitle="Informations">
        <div className="grid gap-8 md:grid-cols-2">
          <ScrollAnimation animation="slideInLeft" delay={0}>
            <div className="rounded-xl border border-white/10 p-5 glass card-hover-3d depth-shadow hover-lift">
              <h3 className="text-lg font-semibold mb-3 text-lift">Technologies utilisées</h3>
              <div className="flex flex-wrap gap-2">
                {(project.technologies || []).map((tech, i) => (
                  <ScrollAnimation key={i} animation="scaleIn" delay={i * 50}>
                    <span className="px-3 py-1 text-xs rounded-md border border-white/10 bg-[color-mix(in_oklch,var(--background)_95%,transparent)] glass-light hover-lift">
                      {tech}
                    </span>
                  </ScrollAnimation>
                ))}
              </div>
            </div>
          </ScrollAnimation>
          <ScrollAnimation animation="slideInRight" delay={200}>
            <div className="rounded-xl border border-white/10 p-5 glass card-hover-3d depth-shadow hover-lift">
              <h3 className="text-lg font-semibold mb-3 text-lift">Livrables</h3>
              <ul className="space-y-2">
                {(project.deliverables || []).map((deliverable, i) => (
                  <ScrollAnimation key={i} animation="fadeInUp" delay={i * 50}>
                    <li className="flex items-center gap-2 text-sm text-[color-mix(in_oklch,var(--foreground)_75%,transparent)]">
                      <span className="text-primary">✓</span>
                      {deliverable}
                    </li>
                  </ScrollAnimation>
                ))}
              </ul>
            </div>
          </ScrollAnimation>
        </div>
      </Section>

      {/* Résultats */}
      {project.results && project.results.length > 0 && (
        <Section title="Résultats" subtitle="Impact">
          <div className="grid gap-4 md:grid-cols-3">
            {project.results.map((result, i) => (
              <ScrollAnimation key={i} animation="scaleIn" delay={i * 100}>
                <div className="rounded-xl border border-white/10 p-4 glass card-hover-3d depth-shadow hover-lift text-center">
                  <p className="text-sm font-semibold text-primary text-lift">{result}</p>
                </div>
              </ScrollAnimation>
            ))}
          </div>
        </Section>
      )}

      {/* CTA */}
      <section className="container py-12 text-center">
        <ScrollAnimation animation="fadeInUp" delay={0}>
          <div className="max-w-2xl mx-auto rounded-xl border border-white/10 p-6 glass glass-strong depth-shadow hover-lift">
            <p className="text-sm text-[color-mix(in_oklch,var(--foreground)_75%,transparent)] mb-4">
              Vous avez un projet similaire ? Discutons-en ensemble.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <CTAButton href="/contact?type=devis">Demander un devis</CTAButton>
              <CTAButton href="/portfolio" variant="outline">Retour au portfolio</CTAButton>
            </div>
          </div>
        </ScrollAnimation>
      </section>
    </main>
  );
}

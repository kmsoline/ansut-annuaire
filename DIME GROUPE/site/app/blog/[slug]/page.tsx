import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Section from "../../components/Section";
import CTAButton from "../../components/CTAButton";
import ScrollAnimation from "../../components/ScrollAnimation";
import { dbSelectOne } from "@/lib/db";

type Props = { params: Promise<{ slug: string }> };

interface Article {
  id: string;
  slug: string;
  title: string;
  category: string;
  date: string;
  read_time: string;
  excerpt: string;
  content: string[];
  img: string;
  author: string;
  published: boolean;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const article = await dbSelectOne<Article>("blog_articles", `slug=eq.${slug}&published=eq.true`);
  return {
    title: article ? `${article.title} | Blog DIME GROUPE` : "Article non trouvé",
    description: article?.excerpt || "Article de blog DIME GROUPE",
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const article = await dbSelectOne<Article>("blog_articles", `slug=eq.${slug}&published=eq.true`);

  if (!article) notFound();

  return (
    <main id="main-content" role="main">
      {/* Hero */}
      <section className="container pt-16 md:pt-24">
        <div className="mb-6">
          <Link href="/blog" className="text-sm text-[color-mix(in_oklch,var(--foreground)_70%,transparent)] hover:text-primary transition-colors">
            ← Retour au blog
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-2 items-start">
          <ScrollAnimation animation="slideInLeft" delay={0}>
            <div className="relative h-64 overflow-hidden rounded-xl md:h-96 glass depth-shadow-strong hover-3d">
              <Image src={article.img} alt={article.title} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover image-hover" />
            </div>
          </ScrollAnimation>
          <ScrollAnimation animation="slideInRight" delay={200}>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 text-xs font-semibold rounded-md bg-primary/20 text-primary">
                  {article.category}
                </span>
                <span className="text-xs text-[color-mix(in_oklch,var(--foreground)_60%,transparent)]">
                  {article.read_time} de lecture
                </span>
              </div>
              <h1 className="text-3xl font-semibold mb-3">{article.title}</h1>
              <p className="text-base text-[color-mix(in_oklch,var(--foreground)_75%,transparent)] mb-4">
                {article.excerpt}
              </p>
              <div className="flex flex-wrap gap-3 text-sm">
                <time dateTime={article.date} className="text-[color-mix(in_oklch,var(--foreground)_60%,transparent)]">
                  {new Date(article.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                </time>
                {article.author && (
                  <>
                    <span className="text-[color-mix(in_oklch,var(--foreground)_60%,transparent)]">•</span>
                    <span className="text-[color-mix(in_oklch,var(--foreground)_60%,transparent)]">Par {article.author}</span>
                  </>
                )}
              </div>
            </div>
          </ScrollAnimation>
        </div>
      </section>

      {/* Contenu */}
      <Section title="" subtitle="">
        <ScrollAnimation animation="fadeInUp" delay={0}>
          <article className="max-w-3xl mx-auto prose prose-sm max-w-none rounded-xl border border-white/10 p-6 glass card-hover-3d depth-shadow hover-lift">
            <div className="space-y-4 text-sm text-[color-mix(in_oklch,var(--foreground)_75%,transparent)] leading-relaxed">
              {(article.content || []).map((paragraph, i) => (
                <ScrollAnimation key={i} animation="fadeInUp" delay={i * 100}>
                  <p>{paragraph}</p>
                </ScrollAnimation>
              ))}
            </div>
          </article>
        </ScrollAnimation>
      </Section>

      {/* CTA */}
      <section className="container py-12 text-center">
        <ScrollAnimation animation="fadeInUp" delay={0}>
          <div className="max-w-2xl mx-auto rounded-xl border border-white/10 p-6 glass glass-strong depth-shadow hover-lift">
            <p className="text-sm text-[color-mix(in_oklch,var(--foreground)_75%,transparent)] mb-4">
              Vous avez besoin d&apos;aide pour votre projet digital ? Discutons-en ensemble.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <CTAButton href="/contact?type=devis">Demander un devis</CTAButton>
              <CTAButton href="/blog" variant="outline">Retour au blog</CTAButton>
            </div>
          </div>
        </ScrollAnimation>
      </section>
    </main>
  );
}

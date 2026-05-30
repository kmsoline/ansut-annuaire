import Link from "next/link";
import Image from "next/image";
import ScrollAnimation from "../components/ScrollAnimation";
import { dbSelect, getContentSetting } from "@/lib/db";
import { PAGE_SETTINGS_DEFAULTS } from "@/app/api/admin/page-settings/route";

interface Article { id: string; slug: string; title: string; excerpt: string; category: string; date: string; read_time: string; img: string; }

async function getPS() {
  try {
    const s = await getContentSetting<{ blog?: typeof PAGE_SETTINGS_DEFAULTS["blog"] }>("page_settings");
    return { ...PAGE_SETTINGS_DEFAULTS.blog, ...s?.blog };
  } catch { return PAGE_SETTINGS_DEFAULTS.blog; }
}

export async function generateMetadata() {
  const ps = await getPS();
  return { title: ps.title, description: ps.intro };
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

export default async function BlogPage() {
  const [articles, ps] = await Promise.all([
    dbSelect<Article>("blog_articles", "select=id,slug,title,excerpt,category,date,read_time,img&published=eq.true&order=date.desc&limit=100").catch(() => [] as Article[]),
    getPS(),
  ]);

  const [featured, ...rest] = articles;

  return (
    <main id="main-content" role="main" className="overflow-x-hidden">

      {/* ── HERO ── */}
      <section className="relative pt-24 pb-16 md:pt-32 md:pb-20 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[400px] opacity-[0.04]"
            style={{ background: "radial-gradient(ellipse, var(--turquoise), transparent)", transform: "translate(20%, -30%)" }} />
        </div>
        <div className="container relative z-10 max-w-4xl">
          <ScrollAnimation animation="fadeInUp" delay={0}>
            <span className="section-eyebrow inline-flex items-center gap-2 mb-6"
              style={{ color: "var(--turquoise)" }}>
              <span className="w-6 h-px" style={{ background: "var(--turquoise)" }} />
              {ps.subtitle}
            </span>
          </ScrollAnimation>
          <ScrollAnimation animation="fadeInUp" delay={100}>
            <h1 className="text-display mb-6">{ps.title}</h1>
          </ScrollAnimation>
          {ps.intro && (
            <ScrollAnimation animation="fadeInUp" delay={200}>
              <p className="text-base md:text-lg leading-relaxed max-w-2xl"
                style={{ color: "color-mix(in oklch, var(--foreground) 65%, transparent)" }}>
                {ps.intro}
              </p>
            </ScrollAnimation>
          )}
        </div>
      </section>

      <div className="container pb-28 space-y-16">

        {/* ── Article FEATURED (premier) ── */}
        {featured && (
          <ScrollAnimation animation="fadeInUp" delay={0}>
            <Link href={`/blog/${featured.slug}`}
              className="group block rounded-3xl overflow-hidden transition-all duration-500 hover:-translate-y-1"
              style={{
                border: "1px solid color-mix(in oklch, var(--foreground) 7%, transparent)",
                boxShadow: "0 4px 40px rgba(0,0,0,0.06)",
              }}>
              <div className="grid md:grid-cols-2">
                {/* Image */}
                <div className="relative aspect-[4/3] md:aspect-auto md:min-h-[400px] overflow-hidden">
                  <Image src={featured.img} alt={featured.title} fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105" priority />
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500"
                    style={{ background: "linear-gradient(135deg, var(--royal-blue), var(--turquoise))" }} />
                  {/* Badge featured */}
                  <div className="absolute top-5 left-5">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest text-white"
                      style={{ background: "var(--royal-blue)" }}>
                      ✦ À la une
                    </span>
                  </div>
                </div>
                {/* Contenu */}
                <div className="p-8 md:p-10 flex flex-col justify-between"
                  style={{ background: "color-mix(in oklch, var(--foreground) 2%, transparent)" }}>
                  <div>
                    <div className="flex items-center gap-3 mb-5">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold"
                        style={{
                          background: "color-mix(in oklch, var(--royal-blue) 10%, transparent)",
                          color: "var(--royal-blue)",
                        }}>
                        {featured.category}
                      </span>
                      <span className="text-xs" style={{ color: "color-mix(in oklch, var(--foreground) 45%, transparent)" }}>
                        {featured.read_time} de lecture
                      </span>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold leading-tight mb-4 group-hover:text-[var(--royal-blue)] transition-colors duration-300">
                      {featured.title}
                    </h2>
                    <p className="text-sm leading-relaxed line-clamp-4"
                      style={{ color: "color-mix(in oklch, var(--foreground) 65%, transparent)" }}>
                      {featured.excerpt}
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-8 pt-6"
                    style={{ borderTop: "1px solid color-mix(in oklch, var(--foreground) 8%, transparent)" }}>
                    <time className="text-xs" style={{ color: "color-mix(in oklch, var(--foreground) 50%, transparent)" }}>
                      {formatDate(featured.date)}
                    </time>
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold transition-all duration-200 group-hover:gap-2.5"
                      style={{ color: "var(--royal-blue)" }}>
                      Lire l'article
                      <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </ScrollAnimation>
        )}

        {/* ── Grille articles ── */}
        {rest.length > 0 && (
          <div>
            <ScrollAnimation animation="fadeInUp" delay={0}>
              <div className="flex items-center gap-4 mb-8">
                <h2 className="text-lg font-bold">Tous les articles</h2>
                <div className="h-px flex-1" style={{ background: "color-mix(in oklch, var(--foreground) 8%, transparent)" }} />
                <span className="text-xs tabular-nums" style={{ color: "color-mix(in oklch, var(--foreground) 45%, transparent)" }}>
                  {articles.length} article{articles.length > 1 ? "s" : ""}
                </span>
              </div>
            </ScrollAnimation>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {rest.map((article, i) => (
                <ScrollAnimation key={article.slug} animation="fadeInUp" delay={i * 80}>
                  <Link href={`/blog/${article.slug}`}
                    className="group flex flex-col rounded-2xl overflow-hidden transition-all duration-400 hover:-translate-y-1"
                    style={{
                      border: "1px solid color-mix(in oklch, var(--foreground) 7%, transparent)",
                      boxShadow: "0 2px 16px rgba(0,0,0,0.05)",
                    }}>
                    {/* Image */}
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <Image src={article.img} alt={article.title} fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover transition-transform duration-600 group-hover:scale-105" loading="lazy" />
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-400"
                        style={{ background: "linear-gradient(to top, var(--royal-blue), transparent)" }} />
                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full text-white backdrop-blur-md"
                          style={{ background: "color-mix(in oklch, var(--royal-blue) 85%, transparent)" }}>
                          {article.category}
                        </span>
                      </div>
                    </div>
                    {/* Content */}
                    <div className="flex flex-col flex-1 p-5"
                      style={{ background: "color-mix(in oklch, var(--foreground) 2%, transparent)" }}>
                      <div className="flex items-center gap-2 mb-3 text-[11px]"
                        style={{ color: "color-mix(in oklch, var(--foreground) 50%, transparent)" }}>
                        <time>{formatDate(article.date)}</time>
                        <span>·</span>
                        <span>{article.read_time}</span>
                      </div>
                      <h3 className="text-base font-bold leading-snug mb-2 group-hover:text-[var(--royal-blue)] transition-colors duration-300 line-clamp-2">
                        {article.title}
                      </h3>
                      <p className="text-xs leading-relaxed flex-1 line-clamp-3 mb-4"
                        style={{ color: "color-mix(in oklch, var(--foreground) 62%, transparent)" }}>
                        {article.excerpt}
                      </p>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold mt-auto transition-all duration-200 group-hover:gap-2"
                        style={{ color: "var(--royal-blue)" }}>
                        Lire
                        <svg className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </Link>
                </ScrollAnimation>
              ))}
            </div>
          </div>
        )}

        {articles.length === 0 && (
          <div className="text-center py-24">
            <div className="text-5xl mb-4">✍️</div>
            <p className="text-lg font-semibold mb-2">Bientôt disponible</p>
            <p className="text-sm" style={{ color: "color-mix(in oklch, var(--foreground) 55%, transparent)" }}>
              Nos premiers articles arrivent très prochainement.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

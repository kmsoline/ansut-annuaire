import ScrollAnimation from "../components/ScrollAnimation";
import Link from "next/link";
import { dbSelect, getContentSetting } from "@/lib/db";
import PortfolioGrid from "./PortfolioGrid";
import { PAGE_SETTINGS_DEFAULTS } from "@/app/api/admin/page-settings/route";

interface Project { id: string; slug: string; title: string; tag: string; category: string; description: string; img: string; year: string; }

async function getPS() {
  try {
    const s = await getContentSetting<{ portfolio?: typeof PAGE_SETTINGS_DEFAULTS["portfolio"] }>("page_settings");
    return { ...PAGE_SETTINGS_DEFAULTS.portfolio, ...s?.portfolio };
  } catch { return PAGE_SETTINGS_DEFAULTS.portfolio; }
}

export async function generateMetadata() {
  const ps = await getPS();
  return { title: ps.title, description: ps.intro };
}

export default async function PortfolioPage() {
  const [projects, ps] = await Promise.all([
    dbSelect<Project>("portfolio_projects", "select=id,slug,title,tag,category,description,img,year&published=eq.true&order=created_at.desc&limit=200").catch(() => [] as Project[]),
    getPS(),
  ]);

  const totalProjects = projects.length;
  const totalCategories = new Set(projects.map(p => p.category).filter(Boolean)).size;

  return (
    <main id="main-content" role="main" className="overflow-x-hidden">

      {/* ── HERO ── */}
      <section className="relative pt-24 pb-16 md:pt-32 md:pb-20 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 w-[800px] h-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.035]"
            style={{ background: "radial-gradient(ellipse, var(--royal-blue), transparent)" }} />
        </div>
        <div className="container relative z-10">
          <div className="max-w-3xl">
            <ScrollAnimation animation="fadeInUp" delay={0}>
              <span className="section-eyebrow inline-flex items-center gap-2 mb-6"
                style={{ color: "var(--gold-premium)" }}>
                <span className="w-6 h-px" style={{ background: "var(--gold-premium)" }} />
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

          {/* Stats inline */}
          {totalProjects > 0 && (
            <ScrollAnimation animation="fadeInUp" delay={300}>
              <div className="flex flex-wrap items-center gap-8 mt-10">
                <div>
                  <span className="text-3xl font-black" style={{ color: "var(--royal-blue)" }}>{totalProjects}</span>
                  <span className="ml-2 text-sm" style={{ color: "color-mix(in oklch, var(--foreground) 55%, transparent)" }}>projets réalisés</span>
                </div>
                {totalCategories > 1 && (
                  <>
                    <div className="w-px h-8" style={{ background: "color-mix(in oklch, var(--foreground) 12%, transparent)" }} />
                    <div>
                      <span className="text-3xl font-black" style={{ color: "var(--gold-premium)" }}>{totalCategories}</span>
                      <span className="ml-2 text-sm" style={{ color: "color-mix(in oklch, var(--foreground) 55%, transparent)" }}>domaines d'expertise</span>
                    </div>
                  </>
                )}
              </div>
            </ScrollAnimation>
          )}
        </div>
      </section>

      {/* ── Grid projets ── */}
      <section className="container pb-24">
        <PortfolioGrid projects={projects} />
      </section>

      {/* ── CTA ── */}
      <ScrollAnimation animation="fadeInUp" delay={0}>
        <section className="container pb-24">
          <div className="rounded-3xl p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-8"
            style={{
              background: "color-mix(in oklch, var(--foreground) 3%, transparent)",
              border: "1px solid color-mix(in oklch, var(--foreground) 8%, transparent)",
            }}>
            <div>
              <p className="text-xl md:text-2xl font-bold mb-2">{ps.cta_text}</p>
              <p className="text-sm" style={{ color: "color-mix(in oklch, var(--foreground) 55%, transparent)" }}>
                On vous accompagne de l'idée à la livraison.
              </p>
            </div>
            <Link href={ps.cta_link}
              className="shrink-0 inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-xl"
              style={{ background: "var(--royal-blue)", boxShadow: "0 8px 32px color-mix(in oklch, var(--royal-blue) 30%, transparent)" }}>
              {ps.cta_label}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </Link>
          </div>
        </section>
      </ScrollAnimation>
    </main>
  );
}

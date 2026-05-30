// Server Component — pas de "use client"
import CTAButton from "./components/CTAButton";
import Image from "next/image";
import Link from "next/link";
import ScrollAnimation from "./components/ScrollAnimation";
import WhatsAppCTA from "./components/WhatsAppCTA";
import TestimonialsCarousel from "./components/TestimonialsCarousel";
import ClientLogosMarquee from "./components/ClientLogosMarquee";
import StatsSection from "./components/StatsSection";
import { dbSelect, getContentSetting } from "@/lib/db";
import { HOMEPAGE_DEFAULTS, type HomepageSettings } from "@/app/api/admin/homepage/route";

// ── Tokens adaptatifs (light & dark) ─────────────────────────────────────────
const C = {
  body:   "text-[color-mix(in_oklch,var(--foreground)_70%,transparent)]",
  muted:  "text-[color-mix(in_oklch,var(--foreground)_55%,transparent)]",
  faint:  "text-[color-mix(in_oklch,var(--foreground)_38%,transparent)]",
  border: "border-[color-mix(in_oklch,var(--foreground)_10%,transparent)]",
  bg3:    "bg-[color-mix(in_oklch,var(--foreground)_3%,transparent)]",
  bg5:    "bg-[color-mix(in_oklch,var(--foreground)_5%,transparent)]",
};

// ── Types DB ──────────────────────────────────────────────────────────────────
interface TestimonialRow {
  id: string; name: string; role: string; company?: string;
  text: string; rating?: number;
}
interface ClientLogoRow {
  id: string; name: string; logo_url?: string; website_url?: string;
  logo_height?: number; bg_white?: boolean;
}
interface PortfolioRow {
  id: string; title: string; tag?: string; category?: string;
  description?: string; img?: string; slug: string;
}

// ── Fallbacks ─────────────────────────────────────────────────────────────────
const FALLBACK_TESTIMONIALS: TestimonialRow[] = [
  { id: "1", name: "Fatou D.", role: "Directrice Marketing", company: "Entreprise Tech", text: "DIME GROUPE a transformé notre présence digitale. Un professionnalisme et une créativité exceptionnels !", rating: 5 },
  { id: "2", name: "Marc L.", role: "CEO", company: "Startup Innovation", text: "Leur équipe est réactive, force de proposition et orientée résultats. Nous avons pu lancer notre plateforme dans les délais.", rating: 5 },
  { id: "3", name: "Sophie K.", role: "Responsable Communication", company: "Agence Events", text: "Grâce à DIME GROUPE, nous avons organisé un événement mémorable. Expertise remarquable.", rating: 5 },
  { id: "4", name: "Amadou T.", role: "Fondateur", company: "AfriNomade", text: "L'expérience AfriNomade a été magique. Circuit sur mesure, hébergements de qualité, organisation impeccable.", rating: 5 },
];

// ── Fetch ─────────────────────────────────────────────────────────────────────
async function getSettings(): Promise<HomepageSettings> {
  try {
    const saved = await getContentSetting<Partial<HomepageSettings>>("homepage_settings");
    if (!saved) return HOMEPAGE_DEFAULTS;
    return {
      hero:                { ...HOMEPAGE_DEFAULTS.hero,                ...saved.hero },
      logos_band:          { ...HOMEPAGE_DEFAULTS.logos_band,          ...saved.logos_band },
      stats:               saved.stats               ?? HOMEPAGE_DEFAULTS.stats,
      services:            saved.services            ?? HOMEPAGE_DEFAULTS.services,
      process:             saved.process             ?? HOMEPAGE_DEFAULTS.process,
      advantages:          saved.advantages          ?? HOMEPAGE_DEFAULTS.advantages,
      portfolio_preview:   saved.portfolio_preview   ?? HOMEPAGE_DEFAULTS.portfolio_preview,
      cta_bottom:          { ...HOMEPAGE_DEFAULTS.cta_bottom,          ...saved.cta_bottom },
      testimonials_section:{ ...HOMEPAGE_DEFAULTS.testimonials_section,...saved.testimonials_section },
    };
  } catch { return HOMEPAGE_DEFAULTS; }
}

async function getTestimonials(): Promise<TestimonialRow[]> {
  try {
    const rows = await dbSelect<TestimonialRow>(
      "testimonials",
      "select=id,name,role,company,text,rating&active=eq.true&order=sort_order.asc,created_at.desc&limit=8"
    );
    return rows.length > 0 ? rows : FALLBACK_TESTIMONIALS;
  } catch { return FALLBACK_TESTIMONIALS; }
}

async function getClientLogos(): Promise<ClientLogoRow[]> {
  try {
    return await dbSelect<ClientLogoRow>(
      "client_logos",
      "select=id,name,logo_url,website_url,bg_white&active=eq.true&order=sort_order.asc&limit=20"
    );
  } catch { return []; }
}

async function getLogoHeight(): Promise<number> {
  try {
    const rows = await dbSelect<{ value: string }>(
      "site_settings", "select=value&key=eq.client_logos_height&limit=1"
    );
    return rows[0] ? Number(rows[0].value) : 36;
  } catch { return 36; }
}

async function getPortfolioProjects(): Promise<PortfolioRow[]> {
  try {
    return await dbSelect<PortfolioRow>(
      "portfolio_projects",
      "select=id,title,tag,category,description,img,slug&published=eq.true&order=created_at.desc&limit=3"
    );
  } catch { return []; }
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function Home() {
  const [settings, testimonials, clientLogos, logoHeight, portfolioItems] = await Promise.all([
    getSettings(), getTestimonials(), getClientLogos(), getLogoHeight(), getPortfolioProjects(),
  ]);

  const { hero, logos_band, stats, services, process: workflow, advantages, portfolio_preview, cta_bottom, testimonials_section } = settings;

  return (
    <main id="main-content" role="main" className="overflow-x-hidden">

      {/* ══════════════════════════════════════════════════════
          1. HERO — plein écran, image de fond, centré
         ══════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">

        {/* Image de fond plein écran */}
        <div className="absolute inset-0 z-0">
          <Image
            src={hero.image || "/images/hero.jpg"}
            alt="DIME GROUPE"
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
          {/* Overlays en couches pour lisibilité */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/38 to-black/70" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-transparent" />
        </div>

        {/* Contenu centré */}
        <div className="relative z-10 flex flex-col items-center text-center px-4 sm:px-6 max-w-5xl mx-auto pt-20 pb-36 md:pb-40">

          {/* Badge */}
          {hero.badge && (
            <ScrollAnimation animation="fadeIn" delay={0}>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/85 text-xs font-medium mb-8">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse flex-shrink-0" />
                {hero.badge}
              </div>
            </ScrollAnimation>
          )}

          {/* Titre géant */}
          <ScrollAnimation animation="fadeInUp" delay={80}>
            <h1 className="text-hero gradient-text mb-6 max-w-4xl">
              {hero.title}
            </h1>
          </ScrollAnimation>

          {/* Sous-titre */}
          <ScrollAnimation animation="fadeInUp" delay={180}>
            <p className="text-white/72 text-base md:text-xl max-w-2xl mb-5 leading-relaxed">
              {hero.subtitle}
            </p>
          </ScrollAnimation>

          {/* Bullets compacts sous forme de pills */}
          {hero.bullets?.length > 0 && (
            <ScrollAnimation animation="fadeInUp" delay={260}>
              <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
                {hero.bullets.map((b, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 text-[11px] text-white/60 px-3 py-1 rounded-full bg-white/8 border border-white/12 backdrop-blur-sm">
                    <span className="w-1 h-1 rounded-full bg-green-400/80 flex-shrink-0" />
                    {b}
                  </span>
                ))}
              </div>
            </ScrollAnimation>
          )}

          {/* Boutons CTA */}
          <ScrollAnimation animation="fadeInUp" delay={340}>
            <WhatsAppCTA
              primaryLabel={hero.cta_primary_label}
              primaryLink={hero.cta_primary_link}
              secondaryLabel={hero.cta_secondary_label}
            />
          </ScrollAnimation>
        </div>

        {/* Floating stats — centrés en bas */}
        <div className="absolute bottom-16 md:bottom-20 left-1/2 -translate-x-1/2 flex gap-4 md:gap-5 z-10">
          {hero.floating_stat_1?.value && (
            <div className="glass glass-strong rounded-2xl px-5 py-4 text-center min-w-[96px]">
              <p className="text-2xl md:text-3xl font-extrabold gradient-text leading-none mb-1">{hero.floating_stat_1.value}</p>
              <p className="text-xs text-white/58">{hero.floating_stat_1.label}</p>
            </div>
          )}
          {hero.floating_stat_2?.value && (
            <div className="glass glass-strong rounded-2xl px-5 py-4 text-center min-w-[96px]">
              <p className="text-2xl md:text-3xl font-extrabold gradient-text leading-none mb-1">{hero.floating_stat_2.value}</p>
              <p className="text-xs text-white/58">{hero.floating_stat_2.label}</p>
            </div>
          )}
        </div>

        {/* Indicateur de scroll */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 z-10 animate-bounce pointer-events-none">
          <span className="text-[9px] uppercase tracking-[0.2em] text-white/38">scroll</span>
          <svg width="16" height="10" viewBox="0 0 16 10" fill="none" className="text-white/38">
            <path d="M1 1.5L8 8.5L15 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          2. BANDE LOGOS
         ══════════════════════════════════════════════════════ */}
      {logos_band.enabled && clientLogos.length > 0 && (
        <div className={`border-y py-2 ${C.border}`}
          style={{ background: "color-mix(in oklch, var(--foreground) 2%, transparent)" }}>
          {logos_band.label && (
            <p className={`text-center section-eyebrow mb-3 ${C.faint}`}>{logos_band.label}</p>
          )}
          <ClientLogosMarquee logos={clientLogos} globalHeight={logoHeight} />
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          3. STATS — chiffres éditoriaux
         ══════════════════════════════════════════════════════ */}
      {stats.enabled && stats.items.length > 0 && (
        <section className="container py-24 md:py-28">
          <ScrollAnimation animation="fadeInUp" delay={0}>
            <StatsSection items={stats.items} />
          </ScrollAnimation>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════
          4. SERVICES — grille premium, grandes images
         ══════════════════════════════════════════════════════ */}
      {services.enabled && (
        <section id="services" className="container py-24 md:py-32">
          {/* En-tête centré */}
          <div className="mb-14 md:mb-16 text-center">
            <ScrollAnimation animation="fadeIn" delay={0}>
              <p className={`section-eyebrow mb-3 ${C.faint}`}>{services.label}</p>
            </ScrollAnimation>
            <ScrollAnimation animation="fadeInUp" delay={100}>
              <h2 className="text-display gradient-text">{services.title}</h2>
            </ScrollAnimation>
          </div>

          {/* Grille bento : premier item mis en avant */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services.items.map((s, i) => (
              <ScrollAnimation key={i} animation="fadeInUp" delay={i * 75}
                className={i === 0 ? "sm:col-span-2 lg:col-span-1" : ""}>
                <Link
                  href={s.link || "/services"}
                  className={`group flex flex-col rounded-3xl overflow-hidden border depth-shadow hover-lift ${C.border} h-full`}
                  style={{ background: "color-mix(in oklch, var(--background) 75%, transparent)" }}
                >
                  {/* Image */}
                  <div className={`relative overflow-hidden flex-shrink-0 ${i === 0 ? "h-64 md:h-72" : "h-52 md:h-60"}`}>
                    <Image
                      src={s.img || "/images/hero.jpg"}
                      alt={s.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
                    {/* Titre sur l'image */}
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <h3 className="text-white font-bold text-base md:text-lg leading-tight">{s.title}</h3>
                    </div>
                  </div>

                  {/* Corps */}
                  <div className="flex-1 p-5 flex flex-col gap-2">
                    <p className={`text-sm leading-relaxed line-clamp-2 flex-1 ${C.muted}`}>{s.description}</p>
                    <span className="inline-flex items-center gap-1.5 mt-2 text-xs font-semibold text-primary group-hover:gap-2.5 transition-all duration-200">
                      En savoir plus
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2.5 6H9.5M6.5 3.5L9.5 6L6.5 8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </span>
                  </div>
                </Link>
              </ScrollAnimation>
            ))}
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════
          5. PROCESSUS — fond alterné, numéros accentués
         ══════════════════════════════════════════════════════ */}
      {workflow.enabled && workflow.items.length > 0 && (
        <section
          id="processus"
          className="py-24 md:py-32 overflow-hidden"
          style={{ background: "color-mix(in oklch, var(--foreground) 2.5%, transparent)" }}
        >
          <div className="container">
            {/* En-tête */}
            <div className="mb-16 md:mb-20 text-center">
              <ScrollAnimation animation="fadeIn" delay={0}>
                <p className={`section-eyebrow mb-3 ${C.faint}`}>{workflow.label}</p>
              </ScrollAnimation>
              <ScrollAnimation animation="fadeInUp" delay={100}>
                <h2 className="text-display gradient-text">{workflow.title}</h2>
              </ScrollAnimation>
            </div>

            {/* Étapes */}
            <div className="relative grid gap-10 sm:grid-cols-2 md:grid-cols-4">
              {/* Ligne de connexion desktop */}
              <div
                className={`hidden md:block absolute top-[2.4rem] left-[12.5%] right-[12.5%] h-px ${C.border}`}
              />

              {workflow.items.map((item, i) => (
                <ScrollAnimation key={i} animation="fadeInUp" delay={i * 100}>
                  <div className="relative flex flex-col items-center text-center gap-5">
                    {/* Icône + badge */}
                    <div className="relative z-10 flex-shrink-0">
                      <div
                        className={`w-20 h-20 rounded-2xl flex items-center justify-center text-3xl border ${C.border} depth-shadow`}
                        style={{ background: "color-mix(in oklch, var(--background) 80%, transparent)", backdropFilter: "blur(12px)" }}
                      >
                        {item.icon || "⚙️"}
                      </div>
                      <span
                        className="absolute -top-2.5 -right-2.5 w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white shadow-lg"
                        style={{ background: "var(--royal-blue)" }}
                      >
                        {i + 1}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold mb-2">{item.title}</h3>
                      <p className={`text-sm leading-relaxed ${C.muted}`}>{item.description}</p>
                    </div>
                  </div>
                </ScrollAnimation>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════
          6. AVANTAGES — cartes spacieuses, icônes grands
         ══════════════════════════════════════════════════════ */}
      {advantages.enabled && (
        <section id="why" className="container py-24 md:py-32">
          {/* En-tête */}
          <div className="mb-14 md:mb-16 text-center">
            <ScrollAnimation animation="fadeIn" delay={0}>
              <p className={`section-eyebrow mb-3 ${C.faint}`}>{advantages.label}</p>
            </ScrollAnimation>
            <ScrollAnimation animation="fadeInUp" delay={100}>
              <h2 className="text-display gradient-text">{advantages.title}</h2>
            </ScrollAnimation>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {advantages.items.map((a, i) => (
              <ScrollAnimation key={i} animation="scaleIn" delay={i * 80}>
                <div
                  className={`group rounded-3xl border p-7 md:p-8 depth-shadow hover-lift h-full flex flex-col gap-4 ${C.border}`}
                  style={{ background: "color-mix(in oklch, var(--background) 75%, transparent)", backdropFilter: "blur(16px)" }}
                >
                  {a.icon && (
                    <span className="text-4xl leading-none">{a.icon}</span>
                  )}
                  <div>
                    <h3 className="text-base font-bold mb-2 group-hover:text-primary transition-colors">{a.title}</h3>
                    <p className={`text-sm leading-relaxed ${C.muted}`}>{a.description}</p>
                  </div>
                </div>
              </ScrollAnimation>
            ))}
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════
          7. PORTFOLIO — grandes cartes, fond alterné
         ══════════════════════════════════════════════════════ */}
      {portfolio_preview.enabled && portfolioItems.length > 0 && (
        <section
          id="realisations"
          className="py-24 md:py-32 overflow-hidden"
          style={{ background: "color-mix(in oklch, var(--foreground) 2.5%, transparent)" }}
        >
          <div className="container">
            {/* En-tête */}
            <div className="mb-14 md:mb-16 text-center">
              <ScrollAnimation animation="fadeIn" delay={0}>
                <p className={`section-eyebrow mb-3 ${C.faint}`}>{portfolio_preview.label}</p>
              </ScrollAnimation>
              <ScrollAnimation animation="fadeInUp" delay={100}>
                <h2 className="text-display gradient-text">{portfolio_preview.title}</h2>
              </ScrollAnimation>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {portfolioItems.map((p, i) => (
                <ScrollAnimation key={p.id} animation="fadeInUp" delay={i * 100}>
                  <Link
                    href={`/portfolio/${p.slug}`}
                    className={`group flex flex-col rounded-3xl border overflow-hidden hover-lift depth-shadow ${C.border} h-full`}
                    style={{ background: "color-mix(in oklch, var(--background) 75%, transparent)" }}
                  >
                    <div
                      className="relative h-56 md:h-64 flex-shrink-0"
                      style={{ background: "color-mix(in oklch, var(--foreground) 5%, transparent)" }}
                    >
                      {p.img ? (
                        <Image
                          src={p.img}
                          alt={p.title}
                          fill
                          sizes="(max-width: 640px) 100vw, 33vw"
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className={`absolute inset-0 flex items-center justify-center text-4xl ${C.faint}`}>📁</div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      {(p.tag || p.category) && (
                        <span
                          className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold text-white backdrop-blur-sm"
                          style={{ background: "color-mix(in oklch, var(--royal-blue) 80%, transparent)" }}
                        >
                          {p.tag || p.category}
                        </span>
                      )}
                    </div>
                    <div className="p-6 flex flex-col flex-1 gap-2">
                      <h3 className="font-bold group-hover:text-primary transition-colors">{p.title}</h3>
                      {p.description && (
                        <p className={`text-sm line-clamp-2 leading-relaxed flex-1 ${C.muted}`}>{p.description}</p>
                      )}
                      <span className="inline-flex items-center gap-1.5 mt-2 text-xs font-semibold text-primary group-hover:gap-2.5 transition-all duration-200">
                        Voir le projet
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M2.5 6H9.5M6.5 3.5L9.5 6L6.5 8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </span>
                    </div>
                  </Link>
                </ScrollAnimation>
              ))}
            </div>

            <ScrollAnimation animation="fadeInUp" delay={300}>
              <div className="mt-12 text-center">
                <CTAButton href={portfolio_preview.button_link || "/portfolio"} variant="outline">
                  {portfolio_preview.button_label}
                </CTAButton>
              </div>
            </ScrollAnimation>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════
          8. CTA FINAL — fond bleu dramatique
         ══════════════════════════════════════════════════════ */}
      {cta_bottom.enabled && (
        <section
          className="relative overflow-hidden py-28 md:py-36"
          style={{ background: "linear-gradient(135deg, var(--royal-blue) 0%, color-mix(in oklch, var(--royal-blue) 72%, #000) 100%)" }}
        >
          {/* Orbes décoratifs */}
          <div
            className="pointer-events-none absolute -top-28 -right-16 h-80 w-80 rounded-full opacity-25 blur-3xl"
            style={{ background: "var(--gold-premium)" }}
          />
          <div
            className="pointer-events-none absolute -bottom-20 left-1/4 h-64 w-64 rounded-full opacity-15 blur-3xl"
            style={{ background: "white" }}
          />
          <div
            className="pointer-events-none absolute top-1/3 -left-16 h-48 w-48 rounded-full opacity-20 blur-2xl"
            style={{ background: "var(--gold-premium)" }}
          />

          <div className="container relative z-10 text-center">
            <ScrollAnimation animation="fadeInUp" delay={0}>
              {cta_bottom.eyebrow && (
                <p className="section-eyebrow text-white/48 mb-6">{cta_bottom.eyebrow}</p>
              )}
              <h2 className="text-display text-white mb-6 max-w-2xl mx-auto leading-tight">
                {cta_bottom.title}
              </h2>
              <p className="text-white/68 text-base md:text-xl max-w-xl mx-auto mb-12 leading-relaxed">
                {cta_bottom.description}
              </p>
              <CTAButton href={cta_bottom.button_link || "/contact"} variant="inverted" size="lg">
                {cta_bottom.button_label}
              </CTAButton>
            </ScrollAnimation>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════
          9. TÉMOIGNAGES
         ══════════════════════════════════════════════════════ */}
      {testimonials_section.enabled && (
        <section id="temoignages" className="container py-24 md:py-32">
          <div className="mb-14 md:mb-16 text-center">
            {testimonials_section.label && (
              <ScrollAnimation animation="fadeIn" delay={0}>
                <p className={`section-eyebrow mb-3 ${C.faint}`}>{testimonials_section.label}</p>
              </ScrollAnimation>
            )}
            {testimonials_section.title && (
              <ScrollAnimation animation="fadeInUp" delay={100}>
                <h2 className="text-display gradient-text">{testimonials_section.title}</h2>
              </ScrollAnimation>
            )}
          </div>
          <ScrollAnimation animation="fadeInUp" delay={0}>
            <div className="max-w-4xl mx-auto">
              <TestimonialsCarousel testimonials={testimonials} autoplayInterval={6000} />
            </div>
          </ScrollAnimation>
        </section>
      )}

    </main>
  );
}

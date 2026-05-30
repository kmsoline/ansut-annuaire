import Link from "next/link";
import CTAButton from "../components/CTAButton";
import Image from "next/image";
import ScrollAnimation from "../components/ScrollAnimation";
import { dbSelect, getContentSetting } from "@/lib/db";
import { PAGE_SETTINGS_DEFAULTS } from "@/app/api/admin/page-settings/route";

interface ServiceItem { icon: string; name: string; description: string; }
interface Service { id: string; slug: string; title: string; icon: string; description: string; img: string; items: ServiceItem[]; }

async function getPS() {
  try {
    const s = await getContentSetting<{ services?: typeof PAGE_SETTINGS_DEFAULTS["services"] }>("page_settings");
    return { ...PAGE_SETTINGS_DEFAULTS.services, ...s?.services };
  } catch { return PAGE_SETTINGS_DEFAULTS.services; }
}

export async function generateMetadata() {
  const ps = await getPS();
  return { title: ps.title, description: "Découvrez tous nos services : Infrastructure & IT, Conseil & Stratégie, Communication & Événementiel, Développement & Applications, Tourisme & Loisirs." };
}

const ACCENT_COLORS = [
  "var(--royal-blue)",
  "var(--gold-premium)",
  "var(--turquoise)",
  "var(--royal-blue)",
  "var(--gold-premium)",
];

export default async function ServicesPage() {
  const [services, ps] = await Promise.all([
    dbSelect<Service>("services", "select=id,slug,title,icon,description,img,items&active=eq.true&order=created_at.asc&limit=100").catch(() => [] as Service[]),
    getPS(),
  ]);

  return (
    <main id="main-content" role="main" className="overflow-x-hidden">

      {/* ── HERO ── */}
      <section className="relative pt-24 pb-20 md:pt-32 md:pb-28 overflow-hidden">
        {/* bg decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full opacity-[0.04]"
            style={{ background: "radial-gradient(circle, var(--royal-blue), transparent)", transform: "translate(30%, -40%)" }} />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-[0.03]"
            style={{ background: "radial-gradient(circle, var(--gold-premium), transparent)", transform: "translate(-30%, 40%)" }} />
        </div>
        <div className="container relative z-10 max-w-4xl">
          <ScrollAnimation animation="fadeInUp" delay={0}>
            <span className="section-eyebrow inline-flex items-center gap-2 mb-6"
              style={{ color: "var(--royal-blue)" }}>
              <span className="w-6 h-px" style={{ background: "var(--royal-blue)" }} />
              {ps.subtitle}
            </span>
          </ScrollAnimation>
          <ScrollAnimation animation="fadeInUp" delay={100}>
            <h1 className="text-display mb-6">{ps.title}</h1>
          </ScrollAnimation>
          <ScrollAnimation animation="fadeInUp" delay={200}>
            <p className="text-lg max-w-2xl leading-relaxed"
              style={{ color: "color-mix(in oklch, var(--foreground) 65%, transparent)" }}>
              Des expertises complémentaires pour transformer vos idées en solutions concrètes, de l'infrastructure IT à la création événementielle.
            </p>
          </ScrollAnimation>
          <ScrollAnimation animation="fadeInUp" delay={300}>
            <div className="flex flex-wrap items-center gap-4 mt-8">
              <CTAButton href="/contact?type=devis" size="lg">{ps.cta_label}</CTAButton>
              <span className="text-xs flex items-center gap-2" style={{ color: "color-mix(in oklch, var(--foreground) 45%, transparent)" }}>
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                Réponse sous 24h
              </span>
            </div>
          </ScrollAnimation>
        </div>
      </section>

      {/* ── Compteur services ── */}
      <ScrollAnimation animation="fadeInUp" delay={0}>
        <div className="container mb-16">
          <div className="h-px w-full" style={{ background: "color-mix(in oklch, var(--foreground) 8%, transparent)" }} />
          <div className="flex items-center gap-8 py-5 overflow-x-auto no-scrollbar">
            {services.map((s, i) => (
              <a key={s.id} href={`#service-${i}`}
                className="flex items-center gap-2.5 shrink-0 group transition-all duration-200 hover:opacity-100"
                style={{ color: "color-mix(in oklch, var(--foreground) 50%, transparent)" }}>
                <span className="text-xl">{s.icon}</span>
                <span className="text-xs font-semibold whitespace-nowrap group-hover:text-[var(--royal-blue)] transition-colors">{s.title}</span>
              </a>
            ))}
          </div>
          <div className="h-px w-full" style={{ background: "color-mix(in oklch, var(--foreground) 8%, transparent)" }} />
        </div>
      </ScrollAnimation>

      {/* ── Services alternés ── */}
      <div className="container space-y-0">
        {services.map((service, i) => {
          const isEven = i % 2 === 0;
          const accent = ACCENT_COLORS[i % ACCENT_COLORS.length];
          return (
            <ScrollAnimation key={service.id || i} animation="fadeInUp" delay={100}>
              <div id={`service-${i}`} className="group relative py-16 md:py-24 border-b"
                style={{ borderColor: "color-mix(in oklch, var(--foreground) 6%, transparent)" }}>

                {/* Numéro de fond */}
                <span className="absolute select-none font-black pointer-events-none"
                  style={{
                    fontSize: "clamp(6rem, 15vw, 14rem)",
                    lineHeight: 1,
                    top: "50%", transform: "translateY(-50%)",
                    [isEven ? "right" : "left"]: "-2%",
                    color: "color-mix(in oklch, var(--foreground) 2.5%, transparent)",
                    zIndex: 0,
                  }}>
                  {String(i + 1).padStart(2, "0")}
                </span>

                <div className={`relative z-10 grid gap-10 lg:gap-16 items-center ${isEven ? "lg:grid-cols-[1fr_1.1fr]" : "lg:grid-cols-[1.1fr_1fr]"}`}>

                  {/* Visuel */}
                  <div className={`${isEven ? "" : "lg:order-2"}`}>
                    <Link href={`/services/${service.slug}`}>
                      <div className="relative overflow-hidden rounded-3xl aspect-[4/3] cursor-pointer"
                        style={{
                          boxShadow: `0 32px 80px color-mix(in oklch, ${accent} 15%, transparent), 0 4px 20px rgba(0,0,0,0.15)`,
                        }}>
                        <Image src={service.img} alt={service.title} fill sizes="(max-width: 1024px) 100vw, 50vw"
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                          loading={i === 0 ? "eager" : "lazy"} />
                        {/* Gradient overlay */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                          style={{ background: `linear-gradient(135deg, color-mix(in oklch, ${accent} 30%, transparent), transparent 60%)` }} />
                        {/* Icon flottant */}
                        <div className="absolute top-5 left-5 w-12 h-12 rounded-2xl flex items-center justify-center backdrop-blur-md"
                          style={{
                            background: "color-mix(in oklch, var(--background) 80%, transparent)",
                            border: "1px solid color-mix(in oklch, var(--foreground) 12%, transparent)",
                          }}>
                          <span className="text-xl">{service.icon}</span>
                        </div>
                        {/* CTA hover */}
                        <div className="absolute bottom-5 right-5 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-white backdrop-blur-md"
                            style={{ background: accent }}>
                            Voir les détails
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                          </span>
                        </div>
                      </div>
                    </Link>
                  </div>

                  {/* Contenu */}
                  <div className={`${isEven ? "" : "lg:order-1"} space-y-6`}>
                    {/* Index + titre */}
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-xs font-bold tabular-nums" style={{ color: accent }}>
                          {String(i + 1).padStart(2, "0")} /
                        </span>
                        <div className="h-px flex-1 max-w-[40px]" style={{ background: accent, opacity: 0.4 }} />
                      </div>
                      <Link href={`/services/${service.slug}`}>
                        <h2 className="text-3xl md:text-4xl font-bold leading-tight hover:opacity-80 transition-opacity">{service.title}</h2>
                      </Link>
                    </div>

                    <p className="text-base leading-relaxed"
                      style={{ color: "color-mix(in oklch, var(--foreground) 68%, transparent)" }}>
                      {service.description}
                    </p>

                    {/* Chips sous-services */}
                    {(service.items || []).length > 0 && (
                      <div className="space-y-3">
                        <p className="text-xs font-semibold uppercase tracking-widest"
                          style={{ color: "color-mix(in oklch, var(--foreground) 40%, transparent)" }}>
                          Inclus dans ce pôle
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {(service.items || []).map((item, j) => (
                            <span key={j}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 hover:scale-105"
                              style={{
                                background: `color-mix(in oklch, ${accent} 8%, transparent)`,
                                border: `1px solid color-mix(in oklch, ${accent} 20%, transparent)`,
                                color: `color-mix(in oklch, ${accent} 85%, var(--foreground))`,
                              }}>
                              <span>{item.icon}</span>
                              {item.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <Link href={`/services/${service.slug}`}
                      className="inline-flex items-center gap-2 text-sm font-semibold transition-all duration-200 group/link"
                      style={{ color: accent }}>
                      En savoir plus
                      <svg className="w-4 h-4 transition-transform duration-200 group-hover/link:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            </ScrollAnimation>
          );
        })}
      </div>

      {/* ── CTA Final ── */}
      <ScrollAnimation animation="fadeInUp" delay={0}>
        <section className="container py-24 md:py-32">
          <div className="relative rounded-3xl overflow-hidden p-10 md:p-16 text-center"
            style={{
              background: "linear-gradient(135deg, var(--royal-blue), color-mix(in oklch, var(--royal-blue) 72%, #000))",
            }}>
            {/* Déco */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full opacity-10"
                style={{ background: "radial-gradient(circle, var(--gold-premium), transparent)" }} />
              <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full opacity-10"
                style={{ background: "radial-gradient(circle, white, transparent)" }} />
            </div>
            <div className="relative z-10">
              <span className="section-eyebrow text-white/60 block mb-4">Passez à l'action</span>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{ps.cta_text}</h2>
              <p className="text-white/65 max-w-md mx-auto mb-8 text-sm">
                Obtenez un devis personnalisé sous 24h. Aucun engagement.
              </p>
              <CTAButton href={ps.cta_link} variant="inverted" size="lg">{ps.cta_label}</CTAButton>
            </div>
          </div>
        </section>
      </ScrollAnimation>
    </main>
  );
}

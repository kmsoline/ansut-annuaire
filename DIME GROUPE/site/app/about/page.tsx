import Image from "next/image";
import Link from "next/link";
import CTAButton from "../components/CTAButton";
import ScrollAnimation from "../components/ScrollAnimation";
import { getContentSetting } from "@/lib/db";
import { getAboutPageContent } from "@/lib/content-data";

interface AboutSection { id: string; section: string; title?: string; subtitle?: string; content: Record<string, unknown>; order: number; active: boolean; }

async function getAbout(): Promise<AboutSection[]> {
  try {
    const db = await getContentSetting<AboutSection[]>("about_content");
    const raw = (db && Array.isArray(db) && db.length > 0) ? db : (getAboutPageContent() as unknown as AboutSection[]);
    return raw.filter(s => s.active !== false).sort((a, b) => (a.order || 0) - (b.order || 0));
  } catch { return getAboutPageContent() as unknown as AboutSection[]; }
}

export const metadata = {
  title: "À propos de DIME GROUPE",
  description: "Découvrez l'histoire, la mission, les valeurs et l'équipe de DIME GROUPE, expert en solutions digitales et technologiques en Côte d'Ivoire.",
};

const M = "color-mix(in oklch, var(--foreground) 68%, transparent)";
const F = "color-mix(in oklch, var(--foreground) 50%, transparent)";
const B8 = "color-mix(in oklch, var(--foreground) 8%, transparent)";
const B4 = "color-mix(in oklch, var(--foreground) 4%, transparent)";

export default async function AboutPage() {
  const sections = await getAbout();

  function renderSection(s: AboutSection) {
    switch (s.section) {
      /* ── Intro ── */
      case "intro": {
        const c = s.content as { description?: string; text?: string; image?: string };
        return (
          <section key={s.id} className="relative pt-24 pb-20 md:pt-32 md:pb-28 overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 right-0 w-[700px] h-[600px] opacity-[0.035] rounded-full"
                style={{ background: "radial-gradient(circle, var(--royal-blue), transparent)", transform: "translate(25%, -35%)" }} />
            </div>
            <div className="container relative z-10 grid gap-14 lg:grid-cols-2 items-center">
              <ScrollAnimation animation="fadeInUp" delay={0}>
                <div>
                  <span className="section-eyebrow inline-flex items-center gap-2 mb-6" style={{ color: "var(--royal-blue)" }}>
                    <span className="w-6 h-px" style={{ background: "var(--royal-blue)" }} />
                    {s.subtitle ?? "À propos"}
                  </span>
                  <h1 className="text-display mb-6">{s.title ?? "DIME GROUPE"}</h1>
                  {c.description && (
                    <p className="text-lg font-medium mb-4" style={{ color: M }}>
                      {c.description}
                    </p>
                  )}
                  {c.text && <p className="text-base leading-relaxed" style={{ color: M }}>{c.text}</p>}
                  <div className="flex flex-wrap gap-3 mt-8">
                    <CTAButton href="/contact">Travailler avec nous</CTAButton>
                    <CTAButton href="/services" variant="outline">Nos services</CTAButton>
                  </div>
                </div>
              </ScrollAnimation>
              <ScrollAnimation animation="slideInRight" delay={200}>
                <div className="relative">
                  <div className="relative rounded-3xl overflow-hidden aspect-[4/3]"
                    style={{ boxShadow: "0 40px 100px color-mix(in oklch, var(--royal-blue) 15%, transparent)" }}>
                    <Image src={(c.image as string) || "/images/hero.jpg"} alt="DIME GROUPE" fill
                      sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" priority />
                    <div className="absolute inset-0 opacity-20"
                      style={{ background: "linear-gradient(135deg, var(--royal-blue), var(--gold-premium))" }} />
                  </div>
                  {/* Floating badge */}
                  <div className="absolute -bottom-5 -left-5 px-5 py-3 rounded-2xl shadow-xl"
                    style={{ background: "var(--background)", border: `1px solid ${B8}` }}>
                    <p className="text-2xl font-black" style={{ color: "var(--royal-blue)" }}>5+</p>
                    <p className="text-xs" style={{ color: F }}>années d'expertise</p>
                  </div>
                  <div className="absolute -top-5 -right-5 px-5 py-3 rounded-2xl shadow-xl"
                    style={{ background: "var(--background)", border: `1px solid ${B8}` }}>
                    <p className="text-2xl font-black" style={{ color: "var(--gold-premium)" }}>50+</p>
                    <p className="text-xs" style={{ color: F }}>projets livrés</p>
                  </div>
                </div>
              </ScrollAnimation>
            </div>
          </section>
        );
      }

      /* ── Histoire ── */
      case "history": {
        const c = s.content as { paragraphs?: string[]; timeline?: { year: string; text: string }[] };
        return (
          <section key={s.id} className="py-24 md:py-32" style={{ borderTop: `1px solid ${B8}` }}>
            <div className="container grid gap-14 lg:grid-cols-[1.2fr_1fr] items-start">
              <ScrollAnimation animation="slideInLeft" delay={0}>
                <div>
                  <span className="section-eyebrow inline-flex items-center gap-2 mb-5" style={{ color: "var(--gold-premium)" }}>
                    <span className="w-6 h-px" style={{ background: "var(--gold-premium)" }} />
                    {s.subtitle ?? "Les origines"}
                  </span>
                  <h2 className="text-3xl md:text-4xl font-bold mb-8">{s.title ?? "Notre Histoire"}</h2>
                  <div className="space-y-4">
                    {(c.paragraphs || []).map((p, i) => (
                      <p key={i} className="text-base leading-relaxed" style={{ color: M }}>{p}</p>
                    ))}
                  </div>
                </div>
              </ScrollAnimation>
              <ScrollAnimation animation="slideInRight" delay={200}>
                <div className="relative pl-6">
                  {/* Ligne verticale */}
                  <div className="absolute left-0 top-2 bottom-2 w-px"
                    style={{ background: `linear-gradient(to bottom, var(--royal-blue), var(--gold-premium))` }} />
                  <div className="space-y-8">
                    {(c.timeline || []).map((item, i) => (
                      <ScrollAnimation key={i} animation="fadeInUp" delay={i * 100}>
                        <div className="relative">
                          {/* Dot */}
                          <div className="absolute -left-[29px] w-3.5 h-3.5 rounded-full border-2 border-white"
                            style={{ background: i % 2 === 0 ? "var(--royal-blue)" : "var(--gold-premium)", top: "4px" }} />
                          <p className="text-xs font-black uppercase tracking-widest mb-1.5"
                            style={{ color: i % 2 === 0 ? "var(--royal-blue)" : "var(--gold-premium)" }}>{item.year}</p>
                          <p className="text-sm leading-relaxed" style={{ color: M }}>{item.text}</p>
                        </div>
                      </ScrollAnimation>
                    ))}
                  </div>
                </div>
              </ScrollAnimation>
            </div>
          </section>
        );
      }

      /* ── Mission ── */
      case "mission": {
        const c = s.content as { text?: string; pillars?: { title: string; description: string }[] };
        return (
          <section key={s.id} className="py-24 md:py-32"
            style={{ background: B4, borderTop: `1px solid ${B8}`, borderBottom: `1px solid ${B8}` }}>
            <div className="container">
              <div className="max-w-3xl mx-auto text-center mb-16">
                <ScrollAnimation animation="fadeInUp" delay={0}>
                  <span className="section-eyebrow inline-flex items-center gap-2 mb-5 mx-auto" style={{ color: "var(--turquoise)" }}>
                    <span className="w-6 h-px" style={{ background: "var(--turquoise)" }} />
                    {s.subtitle ?? "Notre engagement"}
                  </span>
                  <h2 className="text-3xl md:text-4xl font-bold mb-6">{s.title ?? "Notre Mission"}</h2>
                  {c.text && <p className="text-lg leading-relaxed" style={{ color: M }}>{c.text}</p>}
                </ScrollAnimation>
              </div>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {(c.pillars || []).map((item, i) => (
                  <ScrollAnimation key={i} animation="fadeInUp" delay={i * 80}>
                    <div className="rounded-2xl p-6 h-full transition-all duration-300 hover:-translate-y-1"
                      style={{
                        background: "color-mix(in oklch, var(--background) 90%, transparent)",
                        border: `1px solid ${B8}`,
                        boxShadow: "0 2px 20px rgba(0,0,0,0.04)",
                      }}>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                        style={{ background: `color-mix(in oklch, var(--turquoise) 12%, transparent)` }}>
                        <span className="text-lg">{["🎯","💡","🤝","📈"][i] ?? "✨"}</span>
                      </div>
                      <h3 className="font-bold text-sm mb-2">{item.title}</h3>
                      <p className="text-xs leading-relaxed" style={{ color: F }}>{item.description}</p>
                    </div>
                  </ScrollAnimation>
                ))}
              </div>
            </div>
          </section>
        );
      }

      /* ── Valeurs ── */
      case "values": {
        const c = s.content as { values?: { title: string; description: string; icon: string }[] };
        return (
          <section key={s.id} className="py-24 md:py-32" style={{ borderTop: `1px solid ${B8}` }}>
            <div className="container">
              <div className="grid lg:grid-cols-[1fr_2fr] gap-14 items-start">
                <ScrollAnimation animation="fadeInUp" delay={0}>
                  <div className="lg:sticky lg:top-24">
                    <span className="section-eyebrow inline-flex items-center gap-2 mb-5" style={{ color: "var(--royal-blue)" }}>
                      <span className="w-6 h-px" style={{ background: "var(--royal-blue)" }} />
                      {s.subtitle ?? "Ce qui nous guide"}
                    </span>
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">{s.title ?? "Nos Valeurs"}</h2>
                    <p className="text-sm leading-relaxed" style={{ color: M }}>
                      Des principes qui guident chacune de nos décisions et définissent notre manière de travailler.
                    </p>
                  </div>
                </ScrollAnimation>
                <div className="grid sm:grid-cols-2 gap-4">
                  {(c.values || []).map((v, i) => (
                    <ScrollAnimation key={i} animation="fadeInUp" delay={i * 80}>
                      <div className="group rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                        style={{
                          background: B4,
                          border: `1px solid ${B8}`,
                        }}>
                        <div className="text-3xl mb-4">{v.icon}</div>
                        <h3 className="font-bold text-base mb-2">{v.title}</h3>
                        <p className="text-sm leading-relaxed" style={{ color: M }}>{v.description}</p>
                      </div>
                    </ScrollAnimation>
                  ))}
                </div>
              </div>
            </div>
          </section>
        );
      }

      /* ── Équipe ── */
      case "team": {
        const c = s.content as { description?: string; teams?: { role: string; count: string; img: string }[] };
        return (
          <section key={s.id} className="py-24 md:py-32"
            style={{ background: B4, borderTop: `1px solid ${B8}`, borderBottom: `1px solid ${B8}` }}>
            <div className="container">
              <div className="text-center max-w-2xl mx-auto mb-14">
                <ScrollAnimation animation="fadeInUp" delay={0}>
                  <span className="section-eyebrow inline-flex items-center gap-2 mb-5 mx-auto" style={{ color: "var(--gold-premium)" }}>
                    <span className="w-6 h-px" style={{ background: "var(--gold-premium)" }} />
                    {s.subtitle ?? "Les talents"}
                  </span>
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">{s.title ?? "Notre Équipe"}</h2>
                  {c.description && <p className="text-base leading-relaxed" style={{ color: M }}>{c.description}</p>}
                </ScrollAnimation>
              </div>
              <div className="grid gap-5 md:grid-cols-3">
                {(c.teams || []).map((t, i) => (
                  <ScrollAnimation key={i} animation="fadeInUp" delay={i * 120}>
                    <div className="group rounded-3xl overflow-hidden transition-all duration-400 hover:-translate-y-2 hover:shadow-2xl"
                      style={{ border: `1px solid ${B8}`, background: "color-mix(in oklch, var(--background) 90%, transparent)" }}>
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <Image src={t.img} alt={t.role} fill sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover transition-transform duration-600 group-hover:scale-105" />
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-400"
                          style={{ background: `linear-gradient(to top, var(--royal-blue), transparent)` }} />
                      </div>
                      <div className="p-6 text-center">
                        <h4 className="font-bold text-base mb-1">{t.role}</h4>
                        <p className="text-xs font-medium" style={{ color: "var(--royal-blue)" }}>{t.count}</p>
                      </div>
                    </div>
                  </ScrollAnimation>
                ))}
              </div>
            </div>
          </section>
        );
      }

      /* ── Pourquoi nous ── */
      case "why-choose-us": {
        const c = s.content as { advantages?: { title: string; description: string; icon: string }[] };
        return (
          <section key={s.id} className="py-24 md:py-32" style={{ borderTop: `1px solid ${B8}` }}>
            <div className="container">
              <div className="text-center max-w-2xl mx-auto mb-14">
                <ScrollAnimation animation="fadeInUp" delay={0}>
                  <span className="section-eyebrow inline-flex items-center gap-2 mb-5 mx-auto" style={{ color: "var(--royal-blue)" }}>
                    <span className="w-6 h-px" style={{ background: "var(--royal-blue)" }} />
                    {s.subtitle ?? "Vos avantages"}
                  </span>
                  <h2 className="text-3xl md:text-4xl font-bold">{s.title ?? "Pourquoi Nous Choisir ?"}</h2>
                </ScrollAnimation>
              </div>
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {(c.advantages || []).map((a, i) => (
                  <ScrollAnimation key={i} animation="fadeInUp" delay={i * 80}>
                    <div className="rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1"
                      style={{ background: B4, border: `1px solid ${B8}` }}>
                      <div className="flex items-start gap-4">
                        <div className="shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                          style={{ background: `color-mix(in oklch, var(--royal-blue) 8%, transparent)` }}>
                          {a.icon}
                        </div>
                        <div>
                          <h3 className="font-bold text-sm mb-2">{a.title}</h3>
                          <p className="text-xs leading-relaxed" style={{ color: M }}>{a.description}</p>
                        </div>
                      </div>
                    </div>
                  </ScrollAnimation>
                ))}
              </div>
            </div>
          </section>
        );
      }

      default: {
        const c = s.content as { text?: string; description?: string };
        if (!s.title) return null;
        return (
          <section key={s.id} className="py-20" style={{ borderTop: `1px solid ${B8}` }}>
            <div className="container max-w-3xl">
              <ScrollAnimation animation="fadeInUp" delay={0}>
                {s.subtitle && <span className="section-eyebrow block mb-4" style={{ color: "var(--royal-blue)" }}>{s.subtitle}</span>}
                <h2 className="text-3xl font-bold mb-6">{s.title}</h2>
                <p className="text-base leading-relaxed" style={{ color: M }}>{c.text || c.description || ""}</p>
              </ScrollAnimation>
            </div>
          </section>
        );
      }
    }
  }

  return (
    <main className="overflow-x-hidden">
      {sections.map(s => renderSection(s))}

      {/* ── CTA final ── */}
      <section className="py-24" style={{ borderTop: `1px solid ${B8}` }}>
        <div className="container">
          <ScrollAnimation animation="fadeInUp" delay={0}>
            <div className="relative rounded-3xl overflow-hidden p-12 md:p-16 text-center"
              style={{ background: "linear-gradient(135deg, var(--royal-blue), color-mix(in oklch, var(--royal-blue) 70%, #000))" }}>
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full opacity-10"
                  style={{ background: "radial-gradient(circle, var(--gold-premium), transparent)" }} />
              </div>
              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Parlons de votre projet</h2>
                <p className="text-white/65 max-w-md mx-auto mb-8 text-sm">
                  Vous avez une idée ? Notre équipe est là pour l'écouter et la transformer en réalité.
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <CTAButton href="/contact" variant="inverted">Nous contacter</CTAButton>
                  <CTAButton href="/services" variant="outline">Découvrir nos services</CTAButton>
                </div>
              </div>
            </div>
          </ScrollAnimation>
        </div>
      </section>
    </main>
  );
}

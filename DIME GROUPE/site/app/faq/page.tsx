import Section from "../components/Section";
import CTAButton from "../components/CTAButton";
import ScrollAnimation from "../components/ScrollAnimation";
import { dbSelect, getContentSetting } from "@/lib/db";
import { PAGE_SETTINGS_DEFAULTS } from "@/app/api/admin/page-settings/route";

interface FaqItem { id: string; question: string; answer: string; category: string; sort_order: number; }

async function getPS() {
  try {
    const s = await getContentSetting<{ faq?: typeof PAGE_SETTINGS_DEFAULTS["faq"] }>("page_settings");
    return { ...PAGE_SETTINGS_DEFAULTS.faq, ...s?.faq };
  } catch { return PAGE_SETTINGS_DEFAULTS.faq; }
}

export async function generateMetadata() {
  const ps = await getPS();
  return { title: ps.title, description: ps.intro };
}

export default async function FAQPage() {
  const [items, ps] = await Promise.all([
    dbSelect<FaqItem>("faq_items", "select=id,question,answer,category,sort_order&active=eq.true&order=category.asc,sort_order.asc&limit=500").catch(() => [] as FaqItem[]),
    getPS(),
  ]);

  const grouped = items.reduce<Record<string, FaqItem[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});
  const categories = Object.entries(grouped);

  return (
    <main>
      <Section title={ps.title} subtitle={ps.subtitle}>
        {ps.intro && (
          <ScrollAnimation animation="fadeInUp" delay={0}>
            <div className="mb-8">
              <p className="text-sm text-center max-w-2xl mx-auto" style={{ color: "color-mix(in oklch, var(--foreground) 75%, transparent)" }}>{ps.intro}</p>
            </div>
          </ScrollAnimation>
        )}
        <div className="space-y-12">
          {categories.map(([categoryTitle, questions], catIndex) => (
            <ScrollAnimation key={categoryTitle} animation="fadeInUp" delay={catIndex * 200}>
              <div className="rounded-xl border border-white/10 p-6 glass card-hover-3d depth-shadow hover-lift">
                <h2 className="text-xl font-semibold mb-6 text-primary gradient-text text-lift">{categoryTitle}</h2>
                <div className="space-y-4">
                  {questions.map((faq, faqIndex) => (
                    <ScrollAnimation key={faq.id} animation="scaleIn" delay={catIndex * 200 + faqIndex * 50}>
                      <details className="group rounded-lg border border-white/5 p-4 glass-light hover-lift" style={{ background: "color-mix(in oklch, var(--background) 95%, transparent)" }}>
                        <summary className="cursor-pointer font-semibold text-sm mb-2 group-open:text-primary transition-colors text-lift" style={{ color: "color-mix(in oklch, var(--foreground) 90%, transparent)" }}>{faq.question}</summary>
                        <p className="mt-3 text-sm leading-relaxed" style={{ color: "color-mix(in oklch, var(--foreground) 75%, transparent)" }}>{faq.answer}</p>
                      </details>
                    </ScrollAnimation>
                  ))}
                </div>
              </div>
            </ScrollAnimation>
          ))}
        </div>
        <ScrollAnimation animation="fadeInUp" delay={1000}>
          <div className="mt-12 text-center">
            <p className="text-sm mb-4" style={{ color: "color-mix(in oklch, var(--foreground) 75%, transparent)" }}>{ps.cta_text}</p>
            <div className="flex flex-wrap justify-center gap-3">
              <CTAButton href="/contact">Nous contacter</CTAButton>
              <CTAButton href="/services" variant="outline">Découvrir nos services</CTAButton>
            </div>
          </div>
        </ScrollAnimation>
      </Section>
    </main>
  );
}

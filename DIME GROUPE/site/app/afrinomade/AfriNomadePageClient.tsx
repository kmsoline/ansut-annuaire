"use client";

import Link from "next/link";
import Image from "next/image";
import ScrollAnimation from "../components/ScrollAnimation";
import AnimatedText from "../components/AnimatedText";

type AfriNomadePageClientProps = {
  presentationDescription: string;
  afriIcons?: {
    services: string[];
    audiences: string[];
  };
};

const SERVICE_DEFAULTS = [
  { href: "/afrinomade/excursions", title: "Excursions",        desc: "Plages, forêts, villages, parcs — découvrez la Côte d'Ivoire guidé par des locaux.", tag: "Nature & Culture", color: "var(--turquoise)" },
  { href: "/afrinomade/residences", title: "Résidences & Hôtes",desc: "Studios meublés, villas et maisons d'hôtes sélectionnés pour leur confort et leur caractère.", tag: "Hébergement", color: "var(--gold-premium)" },
  { href: "/afrinomade/transport",  title: "Transport & Voyages",desc: "Chauffeur privé, transferts aéroport, navettes inter-villes — fiables et ponctuel.", tag: "Mobilité", color: "var(--turquoise)" },
  { href: "/afrinomade/bons-plans", title: "Bons Plans & Lieux", desc: "Restaurants, rooftops, plages privées, sorties — nos coups de cœur testés et approuvés.", tag: "Lifestyle", color: "var(--gold-premium)" },
];

const DEFAULT_ICONS = {
  services:  ["/afrinomade/icons/palm.svg", "/afrinomade/icons/wave.svg", "/afrinomade/icons/van.svg", "/afrinomade/icons/plane.svg"],
  audiences: ["💑", "👨‍👩‍👧‍👦", "🎉", "💼"],
};

const STATS = [
  { value: "12+", label: "Destinations" },
  { value: "200+", label: "Voyageurs accompagnés" },
  { value: "4", label: "Pôles de services" },
  { value: "7j/7", label: "Disponibilité" },
];

const AUDIENCE_LABELS = [
  { who: "Couples",     what: "Escapades romantiques, séjours intimistes, restos gastronomiques." },
  { who: "Familles",    what: "Circuits adaptés aux enfants, activités sécurisées, hébergements familiaux." },
  { who: "Entre amis",  what: "Week-ends festifs, nightlife, rooftops, plages privées." },
  { who: "Entreprises", what: "Séminaires, incentives, séjours d'équipe sur-mesure." },
];

function IconRender({ icon, className = "w-6 h-6" }: { icon: string; className?: string }) {
  const isUrl = icon.startsWith("/") || icon.startsWith("http");
  if (isUrl) return <img src={icon} alt="" className={className} />;
  return <span className="text-2xl leading-none">{icon}</span>;
}

const TEMOIGNAGES = [
  { text: "Séjour parfait à Assinie — organisation impeccable, rien à redire. On revient !", author: "Kofi A.", location: "Accra → Abidjan" },
  { text: "La villa était exactement comme décrite. Chauffeur très professionnel, disponible à toute heure.", author: "Marie L.", location: "Paris → Abidjan" },
  { text: "Excellente sélection d'adresses. Le rooftop recommandé était une vraie pépite !", author: "Oumar D.", location: "Dakar → Abidjan" },
];

export default function AfriNomadePageClient({
  presentationDescription,
  afriIcons,
}: AfriNomadePageClientProps) {
  const svcIcons = afriIcons?.services ?? DEFAULT_ICONS.services;
  const audIcons = afriIcons?.audiences ?? DEFAULT_ICONS.audiences;
  const SERVICES = SERVICE_DEFAULTS.map((s, i) => ({ ...s, icon: svcIcons[i] ?? DEFAULT_ICONS.services[i] }));
  const AUDIENCES = AUDIENCE_LABELS.map((a, i) => ({ ...a, icon: audIcons[i] ?? DEFAULT_ICONS.audiences[i] }));
  return (
    <main>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        <div className="relative h-[70vh] min-h-[500px]">
          <Image
            src="/afrinomade/photos/hero.jpg"
            alt="AfriNomade – Côte d'Ivoire"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          {/* Gradient overlay */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(160deg, color-mix(in oklch, #0a2a2a 70%, transparent) 0%, color-mix(in oklch, var(--turquoise) 25%, #0a1a1a) 50%, color-mix(in oklch, var(--gold-premium) 20%, #0a1a1a) 100%)",
            }}
          />

          {/* Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
            <ScrollAnimation animation="fadeInUp" delay={0}>
              <div
                className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold mb-6 tracking-widest uppercase"
                style={{
                  background: "color-mix(in oklch, var(--gold-premium) 20%, transparent)",
                  border: "1px solid color-mix(in oklch, var(--gold-premium) 40%, transparent)",
                  color: "var(--gold-premium)",
                }}
              >
                ✦ Tourisme & Loisirs Premium
              </div>
            </ScrollAnimation>

            <AnimatedText
              text="Découvrez la Côte d'Ivoire autrement"
              variant="fadeInWord"
              className="text-4xl md:text-6xl font-bold text-white max-w-3xl leading-tight"
              delay={200}
            />

            <ScrollAnimation animation="fadeInUp" delay={500}>
              <p className="mt-4 max-w-xl text-base text-white/75 leading-relaxed">
                {presentationDescription.slice(0, 160)}…
              </p>
            </ScrollAnimation>

            <ScrollAnimation animation="fadeInUp" delay={700}>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link
                  href="/afrinomade/reservation"
                  className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                  style={{
                    background: "linear-gradient(135deg, var(--turquoise), color-mix(in oklch, var(--turquoise) 70%, var(--gold-premium)))",
                    boxShadow: "0 8px 32px color-mix(in oklch, var(--turquoise) 40%, transparent)",
                  }}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.122 1.534 5.857L.046 23.953l6.214-1.492A11.952 11.952 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.366l-.359-.214-3.722.894.919-3.619-.234-.373A9.818 9.818 0 1112 21.818z"/>
                  </svg>
                  Réserver sur WhatsApp
                </Link>
                <Link
                  href="/afrinomade/excursions"
                  className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-all duration-300 hover:scale-105"
                  style={{
                    border: "1.5px solid color-mix(in oklch, white 50%, transparent)",
                    color: "white",
                    background: "color-mix(in oklch, white 10%, transparent)",
                    backdropFilter: "blur(10px)",
                  }}
                >
                  Voir les excursions →
                </Link>
              </div>
            </ScrollAnimation>
          </div>

          {/* Stats bar */}
          <div className="absolute bottom-0 left-0 right-0">
            <div className="container">
              <div
                className="grid grid-cols-2 md:grid-cols-4 divide-x rounded-t-2xl overflow-hidden"
                style={{
                  background: "color-mix(in oklch, #0a1a1a 85%, transparent)",
                  backdropFilter: "blur(20px)",
                  borderTop: "1px solid color-mix(in oklch, var(--turquoise) 20%, transparent)",
                }}
              >
                {STATS.map((s, i) => (
                  <div key={i} className="py-4 px-6 text-center">
                    <div
                      className="text-2xl font-bold"
                      style={{ color: i % 2 === 0 ? "var(--turquoise)" : "var(--gold-premium)" }}
                    >
                      {s.value}
                    </div>
                    <div className="text-xs text-white/60 mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Services ── */}
      <section className="container py-20">
        <ScrollAnimation animation="fadeInUp" delay={0}>
          <div className="text-center mb-12">
            <span
              className="text-xs font-semibold tracking-widest uppercase"
              style={{ color: "var(--turquoise)" }}
            >
              Nos services
            </span>
            <h2 className="mt-2 text-3xl md:text-4xl font-bold">
              Tout pour votre séjour
            </h2>
          </div>
        </ScrollAnimation>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map((s, i) => (
            <ScrollAnimation key={i} animation="fadeInUp" delay={i * 100}>
              <Link
                href={s.href}
                className="group flex flex-col gap-4 rounded-2xl p-6 h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
                style={{
                  background: "color-mix(in oklch, var(--background) 80%, transparent)",
                  border: "1px solid color-mix(in oklch, var(--turquoise) 15%, transparent)",
                  backdropFilter: "blur(12px)",
                }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
                  style={{
                    background: `color-mix(in oklch, ${s.color} 15%, transparent)`,
                    border: `1px solid color-mix(in oklch, ${s.color} 30%, transparent)`,
                  }}
                >
                  <IconRender icon={s.icon} className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <span
                    className="text-[10px] font-semibold tracking-widest uppercase"
                    style={{ color: s.color }}
                  >
                    {s.tag}
                  </span>
                  <h3 className="mt-1 text-base font-bold">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed" style={{ color: "color-mix(in oklch, var(--foreground) 65%, transparent)" }}>
                    {s.desc}
                  </p>
                </div>
                <span
                  className="text-xs font-semibold flex items-center gap-1 transition-all duration-300 group-hover:gap-2"
                  style={{ color: s.color }}
                >
                  Découvrir
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </Link>
            </ScrollAnimation>
          ))}
        </div>
      </section>

      {/* ── Pour qui ── */}
      <section
        className="py-20"
        style={{
          background: "color-mix(in oklch, var(--turquoise) 5%, var(--background))",
          borderTop: "1px solid color-mix(in oklch, var(--turquoise) 10%, transparent)",
          borderBottom: "1px solid color-mix(in oklch, var(--turquoise) 10%, transparent)",
        }}
      >
        <div className="container">
          <ScrollAnimation animation="fadeInUp" delay={0}>
            <div className="text-center mb-12">
              <span
                className="text-xs font-semibold tracking-widest uppercase"
                style={{ color: "var(--turquoise)" }}
              >
                Pour tous les voyageurs
              </span>
              <h2 className="mt-2 text-3xl md:text-4xl font-bold">
                Des expériences sur-mesure
              </h2>
            </div>
          </ScrollAnimation>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {AUDIENCES.map((a, i) => (
              <ScrollAnimation key={i} animation="fadeInUp" delay={i * 100}>
                <div
                  className="rounded-2xl p-6 h-full"
                  style={{
                    background: "color-mix(in oklch, var(--background) 90%, transparent)",
                    border: "1px solid color-mix(in oklch, var(--gold-premium) 20%, transparent)",
                  }}
                >
                  <div className="text-3xl mb-3"><IconRender icon={a.icon} /></div>
                  <h3 className="font-bold text-base mb-1" style={{ color: "var(--gold-premium)" }}>{a.who}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "color-mix(in oklch, var(--foreground) 70%, transparent)" }}>
                    {a.what}
                  </p>
                </div>
              </ScrollAnimation>
            ))}
          </div>
        </div>
      </section>

      {/* ── Galerie ── */}
      <section className="container py-20">
        <ScrollAnimation animation="fadeInUp" delay={0}>
          <div className="text-center mb-10">
            <span
              className="text-xs font-semibold tracking-widest uppercase"
              style={{ color: "var(--turquoise)" }}
            >
              Inspiration
            </span>
            <h2 className="mt-2 text-3xl md:text-4xl font-bold">
              Voyages en images
            </h2>
          </div>
        </ScrollAnimation>

        {/* Bento grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 auto-rows-[160px]">
          {[
            { src: "/afrinomade/photos/plage.jpg", alt: "Plage", span: "md:col-span-2 md:row-span-2" },
            { src: "/afrinomade/photos/hotel.jpg", alt: "Hôtel", span: "" },
            { src: "/afrinomade/photos/villa.jpg", alt: "Villa", span: "" },
            { src: "/afrinomade/photos/restaurant.jpg", alt: "Restaurant", span: "" },
            { src: "/afrinomade/photos/transport.jpg", alt: "Transport", span: "" },
            { src: "/afrinomade/photos/rooftop.jpg", alt: "Rooftop", span: "md:col-span-2" },
          ].map((img, i) => (
            <ScrollAnimation key={i} animation="scaleIn" delay={i * 80}>
              <div className={`relative w-full h-full overflow-hidden rounded-2xl ${img.span}`}>
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover transition-transform duration-700 hover:scale-105"
                />
                <div
                  className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end p-4"
                  style={{ background: "linear-gradient(to top, color-mix(in oklch, #0a1a1a 80%, transparent), transparent)" }}
                >
                  <span className="text-white text-sm font-medium">{img.alt}</span>
                </div>
              </div>
            </ScrollAnimation>
          ))}
        </div>
      </section>

      {/* ── Témoignages ── */}
      <section
        className="py-20"
        style={{
          background: "color-mix(in oklch, var(--gold-premium) 5%, var(--background))",
          borderTop: "1px solid color-mix(in oklch, var(--gold-premium) 10%, transparent)",
        }}
      >
        <div className="container">
          <ScrollAnimation animation="fadeInUp" delay={0}>
            <div className="text-center mb-12">
              <span
                className="text-xs font-semibold tracking-widest uppercase"
                style={{ color: "var(--gold-premium)" }}
              >
                Avis clients
              </span>
              <h2 className="mt-2 text-3xl md:text-4xl font-bold">
                Ils ont adoré
              </h2>
            </div>
          </ScrollAnimation>
          <div className="grid gap-5 md:grid-cols-3">
            {TEMOIGNAGES.map((t, i) => (
              <ScrollAnimation key={i} animation="fadeInUp" delay={i * 120}>
                <blockquote
                  className="rounded-2xl p-6 h-full flex flex-col gap-4"
                  style={{
                    background: "color-mix(in oklch, var(--background) 80%, transparent)",
                    border: "1px solid color-mix(in oklch, var(--gold-premium) 20%, transparent)",
                    backdropFilter: "blur(12px)",
                  }}
                >
                  <div style={{ color: "var(--gold-premium)" }} className="text-2xl">★★★★★</div>
                  <p className="text-sm leading-relaxed flex-1" style={{ color: "color-mix(in oklch, var(--foreground) 80%, transparent)" }}>
                    « {t.text} »
                  </p>
                  <footer>
                    <div className="font-semibold text-sm">{t.author}</div>
                    <div className="text-xs mt-0.5" style={{ color: "color-mix(in oklch, var(--foreground) 55%, transparent)" }}>
                      {t.location}
                    </div>
                  </footer>
                </blockquote>
              </ScrollAnimation>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA final ── */}
      <section className="container py-20">
        <ScrollAnimation animation="fadeInUp" delay={0}>
          <div
            className="relative rounded-3xl overflow-hidden p-10 md:p-16 text-center"
            style={{
              background: "linear-gradient(135deg, color-mix(in oklch, var(--turquoise) 20%, var(--background)), color-mix(in oklch, var(--gold-premium) 15%, var(--background)))",
              border: "1px solid color-mix(in oklch, var(--turquoise) 25%, transparent)",
            }}
          >
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold">
                Prêt pour votre aventure ?
              </h2>
              <p className="mt-4 text-sm max-w-md mx-auto" style={{ color: "color-mix(in oklch, var(--foreground) 70%, transparent)" }}>
                Dites-nous ce que vous voulez vivre — on s'occupe du reste. Réponse sous 24h.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link
                  href="/afrinomade/reservation"
                  className="inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-xl"
                  style={{
                    background: "linear-gradient(135deg, var(--turquoise), color-mix(in oklch, var(--turquoise) 70%, var(--gold-premium)))",
                    boxShadow: "0 8px 32px color-mix(in oklch, var(--turquoise) 35%, transparent)",
                  }}
                >
                  Planifier mon séjour
                </Link>
                <Link
                  href="/afrinomade/excursions"
                  className="inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-sm font-semibold transition-all duration-300 hover:scale-105"
                  style={{
                    border: "1.5px solid color-mix(in oklch, var(--turquoise) 50%, transparent)",
                    color: "var(--turquoise)",
                  }}
                >
                  Explorer les destinations →
                </Link>
              </div>
            </div>
          </div>
        </ScrollAnimation>
      </section>
    </main>
  );
}

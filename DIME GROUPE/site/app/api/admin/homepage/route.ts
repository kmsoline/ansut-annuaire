import { NextRequest, NextResponse } from "next/server";
import { deepMerge } from "@/lib/utils";
import { checkAdminRole } from "@/lib/api-auth";
import { getContentSetting, setContentSetting } from "@/lib/db";

// ── Defaults ─────────────────────────────────────────────────────────────────

export const HOMEPAGE_DEFAULTS = {
  hero: {
    badge: "Agence digitale · Côte d'Ivoire",
    title: "L'expertise digitale au service de vos projets",
    subtitle: "Nous accompagnons entreprises et institutions avec des solutions IT, digitales et créatives à haute valeur ajoutée.",
    bullets: [
      "Solutions IT & infrastructure sur mesure",
      "Communication, design & événementiel",
      "Accompagnement de A à Z, équipe locale",
    ],
    image: "/images/hero.jpg",
    cta_primary_label: "Demander un devis gratuit",
    cta_primary_link: "/contact?type=devis",
    cta_secondary_label: "Nous contacter sur WhatsApp",
    floating_stat_1: { value: "50+", label: "Projets livrés" },
    floating_stat_2: { value: "5 ans", label: "D'expérience" },
  },
  logos_band: {
    enabled: true,
    label: "Ils nous font confiance",
  },
  stats: {
    enabled: true,
    items: [
      { value: "50+", label: "Projets réalisés" },
      { value: "30+", label: "Clients satisfaits" },
      { value: "5", label: "Années d'expérience" },
      { value: "3", label: "Pôles d'expertise" },
    ],
  },
  services: {
    enabled: true,
    label: "Nos pôles",
    title: "Des expertises complémentaires",
    items: [
      { title: "Infrastructure & IT", description: "Noms de domaine, hébergement, serveurs, réseaux et cloud.", img: "/images/service-it.jpg", link: "/services" },
      { title: "Conseil & Stratégie", description: "Formations, coaching, transformation digitale et IT.", img: "/images/service-consulting.jpg", link: "/services" },
      { title: "Communication & Événementiel", description: "Événements, photo, identité visuelle, e-mail marketing, SEO/SEA et vidéo.", img: "/images/service-com.jpg", link: "/services" },
      { title: "Développement & Applications", description: "Sites web, e-commerce, applications mobiles, ERP et outils métiers.", img: "/images/service-dev.jpg", link: "/services" },
      { title: "Tourisme & Loisirs (AfriNomade)", description: "Excursions, résidences, bons plans, transport et logistique touristique.", img: "/afrinomade/photos/hero.jpg", link: "/afrinomade" },
    ],
  },
  process: {
    enabled: true,
    label: "Comment ça marche",
    title: "Un accompagnement simple et efficace",
    items: [
      { step: "01", icon: "🔍", title: "Analyse", description: "Étude approfondie de vos besoins, objectifs métier et contexte concurrentiel." },
      { step: "02", icon: "🎯", title: "Stratégie", description: "Définition de la solution optimale, chiffrage précis et plan d'action détaillé." },
      { step: "03", icon: "⚡", title: "Réalisation", description: "Exécution par notre équipe d'experts avec points d'étape réguliers." },
      { step: "04", icon: "🚀", title: "Suivi", description: "Accompagnement post-livraison, formation et optimisation continue." },
    ],
  },
  advantages: {
    enabled: true,
    label: "Pourquoi nous choisir ?",
    title: "Des résultats concrets, une approche sur‑mesure",
    items: [
      { icon: "🎯", title: "Approche sur‑mesure", description: "Chaque projet est unique, vos objectifs d'abord." },
      { icon: "💡", title: "Solutions innovantes", description: "Technologies modernes et design premium." },
      { icon: "📈", title: "Résultats concrets", description: "KPIs, ROI et impact business mesurable." },
      { icon: "🏆", title: "Expertise multiforme", description: "IT, digital, événementiel et tourisme." },
    ],
  },
  portfolio_preview: {
    enabled: true,
    label: "Nos réalisations",
    title: "Ce que nous avons accompli",
    button_label: "Voir tout le portfolio",
    button_link: "/portfolio",
  },
  cta_bottom: {
    enabled: true,
    eyebrow: "Passez à l'action",
    title: "Prêt à lancer votre projet ?",
    description: "Contactez-nous dès aujourd'hui pour un échange sans engagement et un devis personnalisé.",
    button_label: "Démarrer mon projet",
    button_link: "/contact",
  },
  testimonials_section: {
    enabled: true,
    label: "Ils nous font confiance",
    title: "Témoignages clients",
  },
};

export type HomepageSettings = typeof HOMEPAGE_DEFAULTS;

// ── Handlers ─────────────────────────────────────────────────────────────────

export async function GET() {
  if (!(await checkAdminRole())) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  try {
    const saved = await getContentSetting<Partial<HomepageSettings>>("homepage_settings");
    const merged = deepMerge(HOMEPAGE_DEFAULTS, saved ?? {}) as HomepageSettings;
    return NextResponse.json(merged);
  } catch {
    return NextResponse.json(HOMEPAGE_DEFAULTS);
  }
}

export async function PUT(request: NextRequest) {
  if (!(await checkAdminRole())) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  try {
    const body = await request.json();
    await setContentSetting("homepage_settings", body);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erreur enregistrement" }, { status: 500 });
  }
}

// ── Deep merge ────────────────────────────────────────────────────────────────


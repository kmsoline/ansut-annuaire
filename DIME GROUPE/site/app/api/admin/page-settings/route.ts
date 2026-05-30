import { NextRequest, NextResponse } from "next/server";
import { deepMerge } from "@/lib/utils";
import { checkAdminRole } from "@/lib/api-auth";
import { getContentSetting, setContentSetting } from "@/lib/db";

// ── Defaults ──────────────────────────────────────────────────────────────────

export const PAGE_SETTINGS_DEFAULTS = {
  services: {
    title: "Nos services",
    subtitle: "Toutes nos expertises",
    cta_text: "Besoin d'un devis personnalisé ? Contactez-nous pour discuter de votre projet.",
    cta_label: "Obtenir un devis",
    cta_link: "/contact?type=devis",
  },
  portfolio: {
    title: "Nos réalisations",
    subtitle: "Portfolio",
    intro: "Découvrez une sélection de nos projets réalisés pour nos clients : sites web, applications mobiles, identités visuelles, événements et expériences touristiques.",
    cta_text: "Vous avez un projet similaire ? Discutons-en ensemble.",
    cta_label: "Demander un devis",
    cta_link: "/contact",
  },
  blog: {
    title: "Blog & Actualités",
    subtitle: "Nos articles et conseils",
    intro: "Découvrez nos articles, conseils et actualités sur le développement web, le marketing digital, l'IT, le tourisme et bien plus encore.",
  },
  faq: {
    title: "Questions Fréquentes",
    subtitle: "FAQ",
    intro: "Vous trouverez ci-dessous les réponses aux questions les plus fréquentes sur nos services. Si vous ne trouvez pas la réponse à votre question, n'hésitez pas à nous contacter.",
    cta_text: "Vous avez encore des questions ? Notre équipe est à votre écoute.",
  },
  contact: {
    title: "Contact",
    subtitle: "Parlons de votre projet",
  },
};

export type PageSettings = typeof PAGE_SETTINGS_DEFAULTS;

// ── Handlers ──────────────────────────────────────────────────────────────────

export async function GET() {
  if (!(await checkAdminRole())) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  try {
    const saved = await getContentSetting<Partial<PageSettings>>("page_settings");
    const merged = deepMerge(PAGE_SETTINGS_DEFAULTS, saved ?? {}) as PageSettings;
    return NextResponse.json(merged);
  } catch {
    return NextResponse.json(PAGE_SETTINGS_DEFAULTS);
  }
}

export async function PUT(request: NextRequest) {
  if (!(await checkAdminRole())) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  try {
    const body = await request.json();
    await setContentSetting("page_settings", body);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erreur enregistrement" }, { status: 500 });
  }
}



import { NextRequest, NextResponse } from "next/server";
import { checkAdminRole } from "@/lib/api-auth";
import { getContentSetting, setContentSetting } from "@/lib/db";
import { HOMEPAGE_DEFAULTS } from "@/app/api/admin/homepage/route";

// ── Slot d'icône unique ───────────────────────────────────────────────────────
// icon peut être : emoji "🔍", URL "/images/icon.png", ou "https://..."

export interface IconSlot {
  key: string;
  label: string;
  icon: string;          // emoji ou URL d'image
  section: string;       // groupe affiché dans l'UI
  source: string;        // clé de settings source : "homepage" | "about" | ...
  sourceSection: string; // sous-section dans la source
  sourceIndex: number;   // index dans items[]
}

export interface SiteIcons {
  slots: IconSlot[];
}

// ── Défauts complets ──────────────────────────────────────────────────────────

export const SITE_ICONS_DEFAULTS: SiteIcons = {
  slots: [
    // ── Accueil — Processus ──
    { key: "hp_process_0", label: "Analyse",              icon: "🔍", section: "Accueil — Processus",            source: "homepage", sourceSection: "process",    sourceIndex: 0 },
    { key: "hp_process_1", label: "Stratégie",            icon: "🎯", section: "Accueil — Processus",            source: "homepage", sourceSection: "process",    sourceIndex: 1 },
    { key: "hp_process_2", label: "Réalisation",          icon: "⚡", section: "Accueil — Processus",            source: "homepage", sourceSection: "process",    sourceIndex: 2 },
    { key: "hp_process_3", label: "Suivi",                icon: "🚀", section: "Accueil — Processus",            source: "homepage", sourceSection: "process",    sourceIndex: 3 },
    // ── Accueil — Avantages ──
    { key: "hp_adv_0",     label: "Approche sur‑mesure",  icon: "🎯", section: "Accueil — Avantages",            source: "homepage", sourceSection: "advantages", sourceIndex: 0 },
    { key: "hp_adv_1",     label: "Solutions innovantes", icon: "💡", section: "Accueil — Avantages",            source: "homepage", sourceSection: "advantages", sourceIndex: 1 },
    { key: "hp_adv_2",     label: "Résultats concrets",   icon: "📈", section: "Accueil — Avantages",            source: "homepage", sourceSection: "advantages", sourceIndex: 2 },
    { key: "hp_adv_3",     label: "Expertise multiforme", icon: "🏆", section: "Accueil — Avantages",            source: "homepage", sourceSection: "advantages", sourceIndex: 3 },
    // ── À propos — Valeurs ──
    { key: "ab_val_0",     label: "Intégrité",            icon: "✓",  section: "À propos — Valeurs",             source: "about",    sourceSection: "values",     sourceIndex: 0 },
    { key: "ab_val_1",     label: "Créativité",           icon: "✨", section: "À propos — Valeurs",             source: "about",    sourceSection: "values",     sourceIndex: 1 },
    { key: "ab_val_2",     label: "Rigueur",              icon: "🎯", section: "À propos — Valeurs",             source: "about",    sourceSection: "values",     sourceIndex: 2 },
    { key: "ab_val_3",     label: "Réactivité",           icon: "⚡", section: "À propos — Valeurs",             source: "about",    sourceSection: "values",     sourceIndex: 3 },
    { key: "ab_val_4",     label: "Partage",              icon: "🤝", section: "À propos — Valeurs",             source: "about",    sourceSection: "values",     sourceIndex: 4 },
    { key: "ab_val_5",     label: "Ambition",             icon: "🚀", section: "À propos — Valeurs",             source: "about",    sourceSection: "values",     sourceIndex: 5 },
    // ── À propos — Pourquoi nous ──
    { key: "ab_why_0",     label: "Approche sur‑mesure",  icon: "🎨", section: "À propos — Pourquoi nous choisir", source: "about", sourceSection: "why",        sourceIndex: 0 },
    { key: "ab_why_1",     label: "Solutions innovantes", icon: "💡", section: "À propos — Pourquoi nous choisir", source: "about", sourceSection: "why",        sourceIndex: 1 },
    { key: "ab_why_2",     label: "Résultats concrets",   icon: "📊", section: "À propos — Pourquoi nous choisir", source: "about", sourceSection: "why",        sourceIndex: 2 },
    { key: "ab_why_3",     label: "Expertise multiforme", icon: "🌐", section: "À propos — Pourquoi nous choisir", source: "about", sourceSection: "why",        sourceIndex: 3 },
    { key: "ab_why_4",     label: "Réactivité & Agilité", icon: "⚡", section: "À propos — Pourquoi nous choisir", source: "about", sourceSection: "why",        sourceIndex: 4 },
    { key: "ab_why_5",     label: "Accompagnement durable",icon: "🤝",section: "À propos — Pourquoi nous choisir", source: "about", sourceSection: "why",        sourceIndex: 5 },
    // ── Services — CTA ──
    { key: "svc_cta",      label: "CTA Services",         icon: "💼", section: "Services",                       source: "none",     sourceSection: "",           sourceIndex: 0 },
    // ── Portfolio — CTA ──
    { key: "pf_cta",       label: "CTA Portfolio",        icon: "🎨", section: "Portfolio",                      source: "none",     sourceSection: "",           sourceIndex: 0 },
    // ── FAQ — CTA ──
    { key: "faq_cta",      label: "CTA FAQ",              icon: "💬", section: "FAQ",                             source: "none",     sourceSection: "",           sourceIndex: 0 },
    // ── Contact — Infos ──
    { key: "ct_email",     label: "Email",                icon: "📧", section: "Contact — Infos",                source: "none",     sourceSection: "",           sourceIndex: 0 },
    { key: "ct_phone",     label: "Téléphone",            icon: "📞", section: "Contact — Infos",                source: "none",     sourceSection: "",           sourceIndex: 1 },
    { key: "ct_address",   label: "Adresse",              icon: "📍", section: "Contact — Infos",                source: "none",     sourceSection: "",           sourceIndex: 2 },
    { key: "ct_social",    label: "Réseaux sociaux",      icon: "🌐", section: "Contact — Infos",                source: "none",     sourceSection: "",           sourceIndex: 3 },
    // ── AfriNomade — Services ──
    { key: "afri_svc_0",   label: "Excursions",           icon: "/afrinomade/icons/palm.svg",  section: "AfriNomade — Services", source: "afrinomade", sourceSection: "services", sourceIndex: 0 },
    { key: "afri_svc_1",   label: "Résidences & Hôtes",   icon: "/afrinomade/icons/wave.svg",  section: "AfriNomade — Services", source: "afrinomade", sourceSection: "services", sourceIndex: 1 },
    { key: "afri_svc_2",   label: "Transport & Voyages",  icon: "/afrinomade/icons/van.svg",   section: "AfriNomade — Services", source: "afrinomade", sourceSection: "services", sourceIndex: 2 },
    { key: "afri_svc_3",   label: "Bons Plans & Lieux",   icon: "/afrinomade/icons/plane.svg", section: "AfriNomade — Services", source: "afrinomade", sourceSection: "services", sourceIndex: 3 },
    // ── AfriNomade — Audiences ──
    { key: "afri_aud_0",   label: "Couples",              icon: "💑",  section: "AfriNomade — Audiences", source: "afrinomade", sourceSection: "audiences", sourceIndex: 0 },
    { key: "afri_aud_1",   label: "Familles",             icon: "👨‍👩‍👧‍👦", section: "AfriNomade — Audiences", source: "afrinomade", sourceSection: "audiences", sourceIndex: 1 },
    { key: "afri_aud_2",   label: "Entre amis",           icon: "🎉",  section: "AfriNomade — Audiences", source: "afrinomade", sourceSection: "audiences", sourceIndex: 2 },
    { key: "afri_aud_3",   label: "Entreprises",          icon: "💼",  section: "AfriNomade — Audiences", source: "afrinomade", sourceSection: "audiences", sourceIndex: 3 },
  ],
};

// ── GET ───────────────────────────────────────────────────────────────────────
export async function GET() {
  if (!(await checkAdminRole())) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  try {
    const [homepage, about, savedIcons] = await Promise.all([
      getContentSetting<Record<string, unknown>>("homepage_settings"),
      getContentSetting<unknown[]>("about_content"),
      getContentSetting<Record<string, string>>("site_icons_overrides"),
    ]);

    const slots: IconSlot[] = SITE_ICONS_DEFAULTS.slots.map(def => {
      const slot = { ...def };

      // Appliquer overrides individuels sauvegardés
      if (savedIcons?.[slot.key]) {
        slot.icon = savedIcons[slot.key];
        return slot;
      }

      // Synchro depuis homepage_settings
      if (slot.source === "homepage" && homepage) {
        const sec = homepage[slot.sourceSection] as { items?: { icon?: string; title?: string }[] } | undefined;
        const item = sec?.items?.[slot.sourceIndex];
        if (item?.icon) slot.icon = item.icon;
        if (item?.title) slot.label = item.title;
      }

      // Synchro depuis about_content
      if (slot.source === "about" && Array.isArray(about)) {
        if (slot.sourceSection === "values") {
          const sec = about.find((s: unknown) => (s as Record<string,unknown>).section === "values") as Record<string,unknown> | undefined;
          const values = (sec?.content as Record<string,unknown>)?.values as { icon?: string; title?: string }[] | undefined;
          const item = values?.[slot.sourceIndex];
          if (item?.icon) slot.icon = item.icon;
          if (item?.title) slot.label = item.title;
        }
        if (slot.sourceSection === "why") {
          const sec = about.find((s: unknown) => (s as Record<string,unknown>).section === "why-choose-us") as Record<string,unknown> | undefined;
          const adv = (sec?.content as Record<string,unknown>)?.advantages as { icon?: string; title?: string }[] | undefined;
          const item = adv?.[slot.sourceIndex];
          if (item?.icon) slot.icon = item.icon;
          if (item?.title) slot.label = item.title;
        }
      }

      return slot;
    });

    return NextResponse.json({ slots });
  } catch {
    return NextResponse.json(SITE_ICONS_DEFAULTS);
  }
}

// ── PUT ───────────────────────────────────────────────────────────────────────
export async function PUT(request: NextRequest) {
  if (!(await checkAdminRole())) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  try {
    const body: SiteIcons = await request.json();

    // 1. Persister les overrides individuels
    const overrides: Record<string, string> = {};
    for (const slot of body.slots) {
      overrides[slot.key] = slot.icon;
    }
    await setContentSetting("site_icons_overrides", overrides);

    // 2. Mettre à jour homepage_settings (process + advantages)
    const homepageRaw = await getContentSetting<Record<string, unknown>>("homepage_settings") ?? {};
    const homepage = structuredClone(homepageRaw) as Record<string, unknown>;

    // S'assurer que homepage a les defaults si sections absentes
    if (!homepage.process) homepage.process = structuredClone(HOMEPAGE_DEFAULTS.process);
    if (!homepage.advantages) homepage.advantages = structuredClone(HOMEPAGE_DEFAULTS.advantages);

    for (const slot of body.slots) {
      if (slot.source !== "homepage") continue;
      const sec = homepage[slot.sourceSection] as { items?: { icon?: string }[] } | undefined;
      if (sec?.items?.[slot.sourceIndex] !== undefined) {
        sec.items![slot.sourceIndex].icon = slot.icon;
      }
    }
    await setContentSetting("homepage_settings", homepage);

    // 3. Mettre à jour about_content (values + why-choose-us)
    const aboutRaw = await getContentSetting<unknown[]>("about_content");
    if (aboutRaw && Array.isArray(aboutRaw)) {
      const about = structuredClone(aboutRaw) as Record<string, unknown>[];

      for (const slot of body.slots) {
        if (slot.source !== "about") continue;

        if (slot.sourceSection === "values") {
          const sec = about.find(s => s.section === "values");
          if (sec) {
            const content = sec.content as Record<string, unknown>;
            const values = content.values as { icon?: string }[] | undefined;
            if (values?.[slot.sourceIndex]) values[slot.sourceIndex].icon = slot.icon;
          }
        }
        if (slot.sourceSection === "why") {
          const sec = about.find(s => s.section === "why-choose-us");
          if (sec) {
            const content = sec.content as Record<string, unknown>;
            const adv = content.advantages as { icon?: string }[] | undefined;
            if (adv?.[slot.sourceIndex]) adv[slot.sourceIndex].icon = slot.icon;
          }
        }
      }
      await setContentSetting("about_content", about);
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erreur enregistrement" }, { status: 500 });
  }
}

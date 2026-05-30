import { getContentSetting } from "@/lib/db";
import { getAfriNomadeContent } from "@/lib/content-data";
import AfriNomadePageClient from "./AfriNomadePageClient";

interface AfriContent { section: string; description?: string; }

// Icônes par défaut AfriNomade
const DEFAULT_AFRI_ICONS = {
  services: [
    "/afrinomade/icons/palm.svg",
    "/afrinomade/icons/wave.svg",
    "/afrinomade/icons/van.svg",
    "/afrinomade/icons/plane.svg",
  ],
  audiences: ["💑", "👨‍👩‍👧‍👦", "🎉", "💼"],
};

export default async function AfriNomadePage() {
  // Contenu de présentation
  let content: AfriContent[] = [];
  try {
    const db = await getContentSetting<AfriContent[]>("afrinomade_content");
    content = db ?? getAfriNomadeContent();
  } catch {
    content = getAfriNomadeContent();
  }

  // Icônes depuis site_icons_overrides
  const iconOverrides = await getContentSetting<Record<string, string>>("site_icons_overrides").catch(() => null);
  const afriIcons = {
    services: DEFAULT_AFRI_ICONS.services.map((def, i) => iconOverrides?.[`afri_svc_${i}`] ?? def),
    audiences: DEFAULT_AFRI_ICONS.audiences.map((def, i) => iconOverrides?.[`afri_aud_${i}`] ?? def),
  };

  const presentation = content.find((c) => c.section === "presentation");

  return (
    <AfriNomadePageClient
      presentationDescription={
        presentation?.description ??
        "AfriNomade est la branche Tourisme & Loisirs de DIME GROUPE. Nous proposons des expériences premium à travers la Côte d'Ivoire: excursions, circuits découverte, hébergements haut de gamme, résidences meublées, maisons d'hôtes, transport sécurisé et bons plans nightlife. Que vous voyagiez en couple, en famille, entre amis ou en entreprise, nous créons des moments uniques sur mesure – avec confort, sécurité, authenticité et élégance."
      }
      afriIcons={afriIcons}
    />
  );
}

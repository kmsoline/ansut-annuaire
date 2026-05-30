// Fichier de stockage des paramètres du site
// TODO: Remplacer par une vraie base de données

export interface SiteSettings {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  whatsapp: string;
}

// Paramètres par défaut
const defaultSettings: SiteSettings = {
  siteName: "DIME GROUPE",
  siteDescription: "L'expertise digitale au service de vos projets",
  contactEmail: "contact@dimegroupe.ci",
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP || "2250747555745",
};

// Stockage en mémoire (sera remplacé par une base de données)
let siteSettings: SiteSettings = { ...defaultSettings };

export function getSettings(): SiteSettings {
  return { ...siteSettings };
}

export function updateSettings(newSettings: Partial<SiteSettings>): SiteSettings {
  siteSettings = { ...siteSettings, ...newSettings };
  return { ...siteSettings };
}

export function resetSettings(): SiteSettings {
  siteSettings = { ...defaultSettings };
  return { ...siteSettings };
}



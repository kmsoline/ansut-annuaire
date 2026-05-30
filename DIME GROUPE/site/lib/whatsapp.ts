// Utilitaire pour obtenir le numéro WhatsApp
// Utilise les paramètres sauvegardés ou la variable d'environnement en fallback

import { getSettings } from "./admin-settings";

export function getWhatsAppNumber(): string {
  try {
    const settings = getSettings();
    return settings.whatsapp || process.env.NEXT_PUBLIC_WHATSAPP || "2250747555745";
  } catch (error) {
    return process.env.NEXT_PUBLIC_WHATSAPP || "2250747555745";
  }
}



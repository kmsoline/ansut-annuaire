"use client";

import { useWhatsApp } from "./WhatsAppNumber";
import CTAButton from "./CTAButton";

interface Props {
  primaryLabel?: string;
  primaryLink?: string;
  secondaryLabel?: string;
}

/**
 * Boutons CTA de la hero section — client component isolé
 * pour permettre au reste de page.tsx d'être un Server Component.
 */
export default function WhatsAppCTA({
  primaryLabel = "Demander un devis",
  primaryLink = "/contact?type=devis",
  secondaryLabel = "Contact WhatsApp",
}: Props) {
  const whatsapp = useWhatsApp();
  return (
    <div className="mt-6 flex flex-wrap gap-3">
      <CTAButton href={primaryLink}>{primaryLabel}</CTAButton>
      <CTAButton
        href={`https://wa.me/${whatsapp}`}
        variant="outline"
        target="_blank"
        rel="noopener noreferrer"
      >
        {secondaryLabel}
      </CTAButton>
    </div>
  );
}

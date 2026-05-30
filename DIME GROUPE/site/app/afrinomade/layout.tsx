import type { Metadata } from "next";
import AfriNomadeHeader from "./components/AfriNomadeHeader";

export const metadata: Metadata = {
  title: {
    template: "%s | AfriNomade",
    default: "AfriNomade – Tourisme & Loisirs",
  },
  description: "Découvrez la Côte d'Ivoire autrement avec AfriNomade : excursions, résidences, bons plans et transport premium.",
};

export default function AfrinomadeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[color-mix(in_oklch,var(--afri-primary)_5%,var(--background))]">
      <AfriNomadeHeader />
      {children}
    </div>
  );
}



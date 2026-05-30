import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Réservation AfriNomade",
  description: "Demande de réservation pour voyages et expériences AfriNomade.",
};

export default function ReservationLayout({ children }: { children: React.ReactNode }) {
  return children;
}




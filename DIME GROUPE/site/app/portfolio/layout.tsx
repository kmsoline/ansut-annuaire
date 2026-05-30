import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Portfolio",
  description: "Découvrez nos réalisations : sites web, identités visuelles, événements, applications mobiles et expériences touristiques.",
  keywords: ["portfolio", "réalisations", "projets", "sites web", "identité visuelle", "événements", "applications", "DIME GROUPE"],
};

export default function PortfolioLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}



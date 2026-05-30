// Fichier de données pour la navigation (header et footer)
// TODO: Remplacer par une vraie base de données

export interface NavLink {
  id: string;
  href: string;
  label: string;
  order: number;
  active: boolean;
}

export interface FooterSection {
  id: string;
  title: string;
  links: NavLink[];
  order: number;
  active: boolean;
}

export interface SiteLogo {
  logoUrl: string;
  logoText: string;
  showText: boolean;
}

// Données par défaut pour le header
export let headerLinks: NavLink[] = [
  { id: "1", href: "/", label: "Accueil", order: 1, active: true },
  { id: "2", href: "/services", label: "Services", order: 2, active: true },
  { id: "3", href: "/portfolio", label: "Portfolio", order: 3, active: true },
  { id: "4", href: "/blog", label: "Blog", order: 4, active: true },
  { id: "5", href: "/about", label: "À propos", order: 5, active: true },
  { id: "6", href: "/contact", label: "Contact", order: 6, active: true },
  { id: "7", href: "/afrinomade", label: "AfriNomade", order: 7, active: true },
];

// Données par défaut pour le footer
export let footerSections: FooterSection[] = [
  {
    id: "nav",
    title: "Navigation",
    links: [
      { id: "f1", href: "/services", label: "Services", order: 1, active: true },
      { id: "f2", href: "/portfolio", label: "Portfolio", order: 2, active: true },
      { id: "f3", href: "/blog", label: "Blog", order: 3, active: true },
      { id: "f4", href: "/about", label: "À propos", order: 4, active: true },
      { id: "f5", href: "/faq", label: "FAQ", order: 5, active: true },
      { id: "f6", href: "/contact", label: "Contact", order: 6, active: true },
      { id: "f7", href: "/afrinomade", label: "AfriNomade", order: 7, active: true },
    ],
    order: 1,
    active: true,
  },
  {
    id: "contact",
    title: "Contact",
    links: [
      { id: "c1", href: "#", label: "Abidjan, Côte d'Ivoire", order: 1, active: true },
      { id: "c2", href: "mailto:contact@dimegroupe.ci", label: "contact@dimegroupe.ci", order: 2, active: true },
      { id: "c3", href: "https://wa.me/2250747555745", label: "WhatsApp", order: 3, active: true },
    ],
    order: 2,
    active: true,
  },
];

// Logo par défaut
export let siteLogo: SiteLogo = {
  logoUrl: "/dime-logo.png",
  logoText: "DIME GROUPE",
  showText: true,
};

// Fonctions de gestion
export function getHeaderLinks(): NavLink[] {
  return [...headerLinks].sort((a, b) => a.order - b.order).filter((link) => link.active);
}

export function getFooterSections(): FooterSection[] {
  return [...footerSections]
    .sort((a, b) => a.order - b.order)
    .filter((section) => section.active)
    .map((section) => ({
      ...section,
      links: section.links
        .sort((a, b) => a.order - b.order)
        .filter((link) => link.active),
    }));
}

export function getSiteLogo(): SiteLogo {
  return { ...siteLogo };
}

export function updateHeaderLinks(links: NavLink[]): void {
  headerLinks = links;
}

export function updateFooterSections(sections: FooterSection[]): void {
  footerSections = sections;
}

export function updateSiteLogo(logo: SiteLogo): void {
  siteLogo = logo;
}


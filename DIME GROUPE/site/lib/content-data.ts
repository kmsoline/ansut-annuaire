// Fichier de données pour le contenu du site (FAQ, témoignages, page d'accueil, etc.)
// TODO: Remplacer par une vraie base de données

export interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  order: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  text: string;
  rating: number;
  image?: string;
  active: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface ClientLogo {
  id: string;
  name: string;
  logoUrl: string;
  website?: string;
  order: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface HomePageContent {
  id: string;
  section: string; // 'hero', 'services-intro', 'advantages', etc.
  title?: string;
  subtitle?: string;
  description?: string;
  content: Record<string, unknown>; // JSON content
  order: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AboutPageContent {
  id: string;
  section: string; // 'intro', 'history', 'mission', 'values', 'team', 'why-choose-us'
  title?: string;
  subtitle?: string;
  content: Record<string, unknown>; // JSON content
  order: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LegalPage {
  id: string;
  slug: string; // 'mentions-legales', 'cgv', 'confidentialite'
  title: string;
  content: string; // HTML or markdown
  updatedAt: string;
}

export interface AfriNomadeContent {
  id: string;
  section: string; // 'hero', 'excursions', 'residences', 'transport', 'bons-plans'
  title?: string;
  subtitle?: string;
  description?: string;
  content: Record<string, unknown>; // JSON content
  order: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PageMetadata {
  id: string;
  path: string; // '/', '/services', '/about', etc.
  title: string;
  description: string;
  keywords?: string[];
  ogImage?: string;
  ogTitle?: string;
  ogDescription?: string;
  updatedAt: string;
}

// Données par défaut - Initialisées avec les données existantes du site
export let faqItems: FAQItem[] = [
  // Services Généraux
  {
    id: "1",
    category: "Services Généraux",
    question: "Quels sont les domaines d'expertise de DIME GROUPE ?",
    answer: "DIME GROUPE propose 5 pôles d'expertise : Infrastructure & IT (hébergement, serveurs, cloud), Conseil & Stratégie (formations, transformation digitale), Communication & Événementiel (identité visuelle, photo, vidéo, marketing digital), Développement & Applications (sites web, e-commerce, applications mobiles, ERP) et Tourisme & Loisirs via AfriNomade.",
    order: 1,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    category: "Services Généraux",
    question: "Dans quelles zones géographiques intervenez-vous ?",
    answer: "Nous sommes basés en Côte d'Ivoire et intervenons principalement dans ce pays. Nous pouvons également accompagner des projets à distance selon les besoins.",
    order: 2,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "3",
    category: "Services Généraux",
    question: "Comment puis-je obtenir un devis ?",
    answer: "Vous pouvez remplir le formulaire de contact sur notre site, nous envoyer un email à contact@dimegroupe.ci ou nous contacter via WhatsApp. Nous vous répondrons sous 24-48h avec un devis personnalisé.",
    order: 3,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "4",
    category: "Services Généraux",
    question: "Quels sont vos délais de réalisation ?",
    answer: "Les délais varient selon le type et la complexité du projet. Pour un site vitrine : 2-4 semaines. Pour un site e-commerce : 4-8 semaines. Pour une application mobile : 6-12 semaines. Nous établissons un planning détaillé lors de la phase de devis.",
    order: 4,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // Développement & IT
  {
    id: "5",
    category: "Développement & IT",
    question: "Quelles technologies utilisez-vous ?",
    answer: "Nous utilisons des technologies modernes et performantes : Next.js, React, TypeScript pour le web, React Native pour le mobile, Node.js pour le backend, et diverses solutions cloud selon les besoins.",
    order: 1,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "6",
    category: "Développement & IT",
    question: "Proposez-vous l'hébergement et la maintenance ?",
    answer: "Oui, nous proposons des solutions d'hébergement sécurisées et performantes, ainsi que des contrats de maintenance pour assurer la pérennité et l'évolution de vos projets.",
    order: 2,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "7",
    category: "Développement & IT",
    question: "Mes données seront-elles sécurisées ?",
    answer: "Absolument. La sécurité est une priorité. Nous respectons les meilleures pratiques : SSL, sauvegardes régulières, conformité RGPD, et sécurisation des serveurs.",
    order: 3,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "8",
    category: "Développement & IT",
    question: "Puis-je avoir accès au code source ?",
    answer: "Oui, pour les projets sur mesure, vous êtes propriétaire du code source. Nous pouvons vous le fournir à la livraison et vous former à la gestion si nécessaire.",
    order: 4,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // Communication & Marketing
  {
    id: "9",
    category: "Communication & Marketing",
    question: "Proposez-vous des services de community management ?",
    answer: "Oui, nous gérons vos réseaux sociaux, créons du contenu, planifions les publications et analysons les performances pour développer votre présence digitale.",
    order: 1,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "10",
    category: "Communication & Marketing",
    question: "Combien de temps faut-il pour voir des résultats SEO ?",
    answer: "Les résultats SEO sont visibles généralement après 3-6 mois. L'optimisation est un processus continu qui nécessite patience et régularité.",
    order: 2,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "11",
    category: "Communication & Marketing",
    question: "Pouvez-vous organiser des événements ?",
    answer: "Oui, nous organisons des événements professionnels et culturels de A à Z : planification, coordination logistique, gestion des prestataires, communication et reportage.",
    order: 3,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "12",
    category: "Communication & Marketing",
    question: "Proposez-vous des formations ?",
    answer: "Oui, nous proposons des formations personnalisées sur les outils digitaux, le marketing digital, les réseaux sociaux et la transformation digitale pour vos équipes.",
    order: 4,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // AfriNomade - Tourisme
  {
    id: "13",
    category: "AfriNomade - Tourisme",
    question: "Comment réserver une excursion ou un voyage ?",
    answer: "Vous pouvez nous contacter via WhatsApp, le formulaire de réservation sur notre site, ou nous envoyer un email. Nous vous proposerons un devis personnalisé selon vos envies.",
    order: 1,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "14",
    category: "AfriNomade - Tourisme",
    question: "Quels types d'hébergements proposez-vous ?",
    answer: "Nous proposons des résidences meublées, maisons d'hôtes et hébergements premium sélectionnés pour leur confort et leur qualité. Nous travaillons notamment avec Le Cocoon de Balmer.",
    order: 2,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "15",
    category: "AfriNomade - Tourisme",
    question: "Les paiements sont-ils sécurisés ?",
    answer: "Oui, nous utilisons des plateformes de paiement sécurisées pour toutes les transactions. Vous pouvez également payer par virement bancaire.",
    order: 3,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "16",
    category: "AfriNomade - Tourisme",
    question: "Puis-je annuler ma réservation ?",
    answer: "Les conditions d'annulation varient selon le service et sont précisées lors de la réservation. Contactez-nous pour connaître les conditions spécifiques à votre réservation.",
    order: 4,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "17",
    category: "AfriNomade - Tourisme",
    question: "Organisez-vous des voyages de groupe ?",
    answer: "Oui, nous organisons des voyages pour groupes, entreprises, familles et amis. Nous adaptons les circuits selon vos besoins et votre budget.",
    order: 5,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // Paiements & Conditions
  {
    id: "18",
    category: "Paiements & Conditions",
    question: "Quels sont vos modes de paiement ?",
    answer: "Nous acceptons les virements bancaires, les paiements par carte bancaire, Mobile Money (Orange Money, MTN Money) et les chèques pour certains projets.",
    order: 1,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "19",
    category: "Paiements & Conditions",
    question: "Proposez-vous des facilités de paiement ?",
    answer: "Oui, pour les projets d'envergure, nous pouvons proposer un échéancier de paiement adapté à votre budget.",
    order: 2,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "20",
    category: "Paiements & Conditions",
    question: "Quelle est votre politique de remboursement ?",
    answer: "Les conditions de remboursement dépendent du type de service et sont précisées dans nos CGV. Contactez-nous pour plus d'informations.",
    order: 3,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "21",
    category: "Paiements & Conditions",
    question: "Offrez-vous une garantie sur vos prestations ?",
    answer: "Oui, nous garantissons nos prestations. Pour les sites web et applications, nous offrons une période de garantie incluant corrections et support.",
    order: 4,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export let testimonials: Testimonial[] = [
  {
    id: "1",
    name: "Fatou D.",
    role: "Directrice Marketing",
    company: "Entreprise Tech",
    text: "DIME GROUPE a transformé notre présence digitale. Un professionnalisme et une créativité exceptionnels ! Leur approche sur-mesure a parfaitement répondu à nos attentes.",
    rating: 5,
    active: true,
    order: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Marc L.",
    role: "CEO",
    company: "Startup Innovation",
    text: "Leur équipe est réactive, force de proposition et orientée résultats. Nous avons pu lancer notre plateforme e-commerce dans les délais avec un design premium.",
    rating: 5,
    active: true,
    order: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Sophie K.",
    role: "Responsable Communication",
    company: "Agence Events",
    text: "Grâce à DIME GROUPE, nous avons organisé un événement mémorable. Leur expertise en événementiel et communication est remarquable. Je recommande vivement !",
    rating: 5,
    active: true,
    order: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "4",
    name: "Amadou T.",
    role: "Fondateur",
    company: "AfriNomade",
    text: "L'expérience AfriNomade a été magique. Un circuit sur mesure, des hébergements de qualité et une organisation impeccable. Nos clients ont été ravis !",
    rating: 5,
    active: true,
    order: 4,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Logos clients par défaut — remplacez par les vrais logos dans /public/logos/
// et gérez-les via l'interface admin > Logos clients
export let clientLogos: ClientLogo[] = [
  {
    id: "default-1",
    name: "Orange Côte d'Ivoire",
    logoUrl: "/logos/orange-ci.svg",
    website: "https://www.orange.ci",
    order: 1,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "default-2",
    name: "MTN Côte d'Ivoire",
    logoUrl: "/logos/mtn-ci.svg",
    website: "https://www.mtn.ci",
    order: 2,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "default-3",
    name: "SGBCI",
    logoUrl: "/logos/sgbci.svg",
    website: "https://www.sgbci.ci",
    order: 3,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "default-4",
    name: "SODECI",
    logoUrl: "/logos/sodeci.svg",
    website: "https://www.sodeci.ci",
    order: 4,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "default-5",
    name: "ONECI",
    logoUrl: "/logos/oneci.svg",
    website: "https://www.oneci.ci",
    order: 5,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "default-6",
    name: "CIE",
    logoUrl: "/logos/cie.svg",
    website: "https://www.cie.ci",
    order: 6,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export let homePageContent: HomePageContent[] = [
  {
    id: "1",
    section: "hero",
    title: "DIME GROUPE – L'expertise digitale au service de vos projets",
    subtitle: "Technologie, créativité et stratégie pour faire briller vos idées",
    description: "Nous accompagnons entreprises et institutions en Côte d'Ivoire avec des solutions IT, digitales et créatives à haute valeur ajoutée.",
    content: {
      ctaButtons: [
        { text: "Demander un devis", href: "/contact?type=devis" },
        { text: "Contact WhatsApp", href: "https://wa.me/2250747555745", variant: "outline" },
      ],
    },
    order: 1,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    section: "services-intro",
    title: "Des expertises complémentaires",
    subtitle: "Nos pôles",
    description: "",
    content: {
      services: [
        { title: "Infrastructure & IT", description: "Noms de domaine, hébergement, serveurs, réseaux et cloud.", img: "/images/service-it.jpg" },
        { title: "Conseil & Stratégie", description: "Formations, coaching, transformation digitale et IT.", img: "/images/service-consulting.jpg" },
        { title: "Communication & Événementiel", description: "Événements, photo, identité visuelle, e-mail marketing, community management, SEO/SEA et vidéo.", img: "/images/service-com.jpg" },
        { title: "Développement & Applications", description: "Sites web, e-commerce, applications mobiles, ERP et outils métiers.", img: "/images/service-dev.jpg" },
        { title: "Tourisme & Loisirs (AfriNomade)", description: "Excursions, résidences, bons plans, transport et logistique touristique.", img: "/afrinomade/photos/hero.jpg" },
      ],
    },
    order: 2,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "3",
    section: "advantages",
    title: "Des résultats concrets, une approche sur‑mesure",
    subtitle: "Pourquoi nous choisir ?",
    description: "",
    content: {
      advantages: [
        { title: "Approche sur‑mesure", description: "Chaque projet est unique, vos objectifs d'abord." },
        { title: "Solutions innovantes", description: "Technologies modernes et design premium." },
        { title: "Résultats concrets", description: "KPIs, ROI et impact business mesurable." },
        { title: "Expertise multiforme", description: "IT, digital, événementiel et tourisme." },
      ],
    },
    order: 3,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export let aboutPageContent: AboutPageContent[] = [
  {
    id: "1",
    section: "intro",
    title: "DIME GROUPE",
    subtitle: "À propos",
    content: {
      description: "Expert en solutions digitales et technologiques en Côte d'Ivoire.",
      text: "DIME GROUPE rassemble des expertises complémentaires pour accompagner entreprises et institutions dans leur transformation digitale: infrastructure IT, développement d'applications, communication créative, événementiel et tourisme via AfriNomade.",
      image: "/images/hero.jpg",
    },
    order: 1,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    section: "history",
    title: "Notre Histoire",
    subtitle: "Les origines",
    content: {
      paragraphs: [
        "Fondée en Côte d'Ivoire, DIME GROUPE est née d'une vision: mettre l'expertise digitale au service des projets ambitieux. Notre parcours s'est construit autour de la conviction que technologie, créativité et stratégie doivent converger pour créer de la valeur durable.",
        "De l'infrastructure IT à la création événementielle, en passant par le développement d'applications et le tourisme premium, nous avons développé une approche multidisciplinaire qui répond aux besoins complexes de nos clients.",
        "Aujourd'hui, DIME GROUPE accompagne des organisations de toutes tailles, de la startup innovante à l'institution établie, avec un même objectif: faire briller leurs idées.",
      ],
      timeline: [
        { year: "2018", text: "Création de DIME GROUPE" },
        { year: "2020", text: "Expansion des services IT et développement" },
        { year: "2022", text: "Lancement d'AfriNomade – Tourisme & Loisirs" },
        { year: "2025", text: "Positionnement premium, expertise reconnue" },
      ],
    },
    order: 2,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "3",
    section: "mission",
    title: "Notre Mission",
    subtitle: "Notre engagement",
    content: {
      text: "Offrir des solutions premium, élégantes et efficaces, en conjuguant technologie, créativité et excellence opérationnelle pour faire briller vos idées.",
      pillars: [
        { title: "Excellence", description: "Chaque projet est l'occasion de dépasser les attentes et de livrer un résultat d'exception." },
        { title: "Innovation", description: "Nous intégrons les meilleures pratiques et technologies pour rester à la pointe." },
        { title: "Proximité", description: "Un accompagnement personnalisé et une écoute attentive à vos besoins." },
        { title: "Impact", description: "Des résultats mesurables qui créent de la valeur durable pour votre organisation." },
      ],
    },
    order: 3,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "4",
    section: "values",
    title: "Nos Valeurs",
    subtitle: "Ce qui nous guide",
    content: {
      values: [
        { title: "Intégrité", description: "Transparence, honnêteté et respect dans toutes nos relations.", icon: "✓" },
        { title: "Créativité", description: "Penser différemment, proposer des solutions originales et inspirantes.", icon: "✨" },
        { title: "Rigueur", description: "Méthodologie, qualité et attention aux détails dans chaque livrable.", icon: "🎯" },
        { title: "Réactivité", description: "Rapidité d'exécution et adaptabilité face aux changements.", icon: "⚡" },
        { title: "Partage", description: "Transmission de connaissances et collaboration avec nos clients.", icon: "🤝" },
        { title: "Ambition", description: "Viser l'excellence et repousser les limites pour réussir ensemble.", icon: "🚀" },
      ],
    },
    order: 4,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "5",
    section: "team",
    title: "Notre Équipe",
    subtitle: "Les talents",
    content: {
      description: "DIME GROUPE réunit une équipe pluridisciplinaire de professionnels passionnés: développeurs, designers, experts IT, consultants stratégiques, créatifs événementiels et conseillers en tourisme. Chacun apporte son expertise pour créer des solutions sur‑mesure et performantes.",
      teams: [
        { role: "Développement", count: "Équipe technique", img: "/team/team-dev.jpg" },
        { role: "Design & Créa", count: "Studio créatif", img: "/team/team-crea.jpg" },
        { role: "IT & Infra", count: "Experts systèmes", img: "/team/team-it.jpg" },
      ],
    },
    order: 5,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "6",
    section: "why-choose-us",
    title: "Pourquoi Nous Choisir ?",
    subtitle: "Vos avantages",
    content: {
      advantages: [
        { title: "Approche sur‑mesure", description: "Chaque projet est unique. Nous adaptons nos méthodes à vos objectifs, contraintes et enjeux spécifiques pour un résultat optimal.", icon: "🎨" },
        { title: "Solutions innovantes", description: "Technologies modernes, design premium, méthodes agiles. Nous intégrons les meilleures pratiques pour rester performants.", icon: "💡" },
        { title: "Résultats concrets", description: "KPIs, ROI, impact business mesurable. Nous livrons des résultats tangibles qui créent de la valeur pour votre organisation.", icon: "📊" },
        { title: "Expertise multiforme", description: "IT, développement, communication, événementiel, tourisme. Une vision globale pour répondre à tous vos besoins digitaux.", icon: "🌐" },
        { title: "Réactivité & Agilité", description: "Délais respectés, communication transparente, adaptation rapide. Nous restons à l'écoute pour ajuster en continu.", icon: "⚡" },
        { title: "Accompagnement durable", description: "Au‑delà de la livraison, nous assurons le support, l'évolution et l'optimisation de vos solutions sur le long terme.", icon: "🤝" },
      ],
    },
    order: 6,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export let legalPages: LegalPage[] = [
  {
    id: "1",
    slug: "mentions-legales",
    title: "Mentions Légales",
    content: `<h2>Éditeur du site</h2>
<p><strong>DIME GROUPE</strong><br />
Société basée en Côte d'Ivoire<br />
Abidjan, Côte d'Ivoire</p>
<p><strong>Email :</strong> contact@dimegroupe.ci<br />
<strong>Téléphone :</strong> +225 07 00 00 00 00</p>

<h2>Directeur de publication</h2>
<p>Le directeur de publication est le représentant légal de DIME GROUPE.</p>

<h2>Hébergement</h2>
<p>Le site est hébergé par :<br />
[Nom de l'hébergeur]<br />
[Adresse de l'hébergeur]</p>

<h2>Propriété intellectuelle</h2>
<p>L'ensemble du contenu de ce site (textes, images, vidéos, logos, etc.) est la propriété exclusive de DIME GROUPE, sauf mention contraire.<br />
Toute reproduction, représentation, modification, publication, adaptation de tout ou partie des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite sans autorisation écrite préalable de DIME GROUPE.</p>

<h2>Protection des données personnelles</h2>
<p>Les données personnelles collectées sur ce site sont traitées conformément à notre politique de confidentialité.<br />
Conformément à la loi sur la protection des données, vous disposez d'un droit d'accès, de rectification et de suppression de vos données personnelles.</p>

<h2>Cookies</h2>
<p>Ce site utilise des cookies pour améliorer l'expérience utilisateur et analyser le trafic.<br />
En continuant à naviguer sur ce site, vous acceptez l'utilisation de cookies.</p>

<h2>Limitation de responsabilité</h2>
<p>DIME GROUPE ne pourra être tenu responsable des dommages directs et indirects causés au matériel de l'utilisateur, lors de l'accès au site, et résultant soit de l'utilisation d'un matériel ne répondant pas aux spécifications, soit de l'apparition d'un bug ou d'une incompatibilité.</p>

<h2>Droit applicable</h2>
<p>Les présentes mentions légales sont régies par le droit ivoirien.<br />
En cas de litige, les tribunaux d'Abidjan seront seuls compétents.</p>`,
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    slug: "cgv",
    title: "Conditions Générales de Vente",
    content: `<h2>Article 1 - Objet</h2>
<p>Les présentes Conditions Générales de Vente (CGV) régissent les relations contractuelles entre DIME GROUPE et ses clients pour tous les services proposés.</p>

<h2>Article 2 - Services</h2>
<p>DIME GROUPE propose les services suivants :</p>
<ul>
<li>Infrastructure & IT (hébergement, serveurs, cloud)</li>
<li>Conseil & Stratégie (formations, transformation digitale)</li>
<li>Communication & Événementiel (identité visuelle, photo, vidéo, marketing)</li>
<li>Développement & Applications (sites web, e-commerce, applications mobiles)</li>
<li>Tourisme & Loisirs via AfriNomade</li>
</ul>

<h2>Article 3 - Commande</h2>
<p>Toute commande est soumise à l'acceptation préalable de DIME GROUPE.<br />
Un devis détaillé est établi pour chaque projet et doit être accepté par le client avant le début des travaux.</p>

<h2>Article 4 - Prix</h2>
<p>Les prix sont exprimés en francs CFA (FCFA) ou en euros (EUR) selon les cas.<br />
Les prix sont valables pour la durée indiquée sur le devis.<br />
DIME GROUPE se réserve le droit de modifier ses prix à tout moment, sous réserve de ne pas affecter les commandes déjà acceptées.</p>

<h2>Article 5 - Paiement</h2>
<p>Le paiement s'effectue selon les modalités convenues dans le devis :</p>
<ul>
<li>Acompte à la commande (30-50% selon le projet)</li>
<li>Solde à la livraison</li>
<li>Pour les projets d'envergure, un échéancier peut être établi</li>
</ul>
<p>Les modes de paiement acceptés : virement bancaire, Mobile Money (Orange Money, MTN Money), carte bancaire.</p>

<h2>Article 6 - Livraison</h2>
<p>Les délais de livraison sont indiqués dans le devis et sont donnés à titre indicatif.<br />
En cas de retard de livraison, DIME GROUPE informera le client dans les plus brefs délais.</p>

<h2>Article 7 - Garantie</h2>
<p>DIME GROUPE garantit la conformité de ses prestations aux spécifications convenues.<br />
Une période de garantie est incluse pour les sites web et applications (généralement 3 mois après la livraison).</p>

<h2>Article 8 - Rétractation et annulation</h2>
<p>Pour les services de prestations intellectuelles, le droit de rétractation prévu par la loi ne s'applique pas.<br />
En cas d'annulation par le client, les sommes déjà versées peuvent être conservées selon les travaux déjà effectués.</p>

<h2>Article 9 - Propriété intellectuelle</h2>
<p>Pour les projets sur mesure, le client est propriétaire du code source et des créations réalisées après paiement complet.<br />
DIME GROUPE conserve le droit d'utiliser les réalisations à des fins de promotion (portfolio), sauf mention contraire.</p>

<h2>Article 10 - Litiges</h2>
<p>En cas de litige, les parties s'engagent à rechercher une solution amiable.<br />
À défaut, les tribunaux d'Abidjan seront seuls compétents.</p>`,
    updatedAt: new Date().toISOString(),
  },
  {
    id: "3",
    slug: "confidentialite",
    title: "Politique de Confidentialité",
    content: `<h2>1. Collecte des données</h2>
<p>DIME GROUPE collecte les données personnelles suivantes :</p>
<ul>
<li>Nom et prénom</li>
<li>Adresse email</li>
<li>Numéro de téléphone</li>
<li>Informations relatives à votre projet</li>
<li>Données de navigation (cookies)</li>
</ul>

<h2>2. Utilisation des données</h2>
<p>Les données collectées sont utilisées pour :</p>
<ul>
<li>Répondre à vos demandes de contact et devis</li>
<li>Fournir nos services</li>
<li>Améliorer notre site et nos services</li>
<li>Vous envoyer des communications relatives à nos services (avec votre consentement)</li>
<li>Analyser le trafic du site</li>
</ul>

<h2>3. Conservation des données</h2>
<p>Les données personnelles sont conservées pendant la durée nécessaire aux finalités pour lesquelles elles ont été collectées, conformément à la réglementation en vigueur.</p>

<h2>4. Partage des données</h2>
<p>DIME GROUPE ne vend, ne loue ni ne partage vos données personnelles à des tiers, sauf :</p>
<ul>
<li>Lorsque cela est nécessaire pour fournir nos services</li>
<li>Lorsque la loi l'exige</li>
<li>Avec votre consentement explicite</li>
</ul>

<h2>5. Vos droits</h2>
<p>Conformément à la réglementation sur la protection des données, vous disposez des droits suivants :</p>
<ul>
<li>Droit d'accès à vos données personnelles</li>
<li>Droit de rectification</li>
<li>Droit à l'effacement</li>
<li>Droit à la limitation du traitement</li>
<li>Droit à la portabilité</li>
<li>Droit d'opposition</li>
</ul>
<p>Pour exercer ces droits, contactez-nous à : contact@dimegroupe.ci</p>

<h2>6. Cookies</h2>
<p>Ce site utilise des cookies pour améliorer l'expérience utilisateur et analyser le trafic.<br />
Vous pouvez configurer votre navigateur pour refuser les cookies, mais cela peut affecter certaines fonctionnalités du site.</p>

<h2>7. Sécurité</h2>
<p>DIME GROUPE met en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données personnelles contre tout accès non autorisé, perte, destruction ou altération.</p>

<h2>8. Modifications</h2>
<p>DIME GROUPE se réserve le droit de modifier cette politique de confidentialité à tout moment.<br />
Les modifications seront publiées sur cette page avec la date de mise à jour.</p>

<h2>9. Contact</h2>
<p>Pour toute question concernant cette politique de confidentialité, contactez-nous :<br />
<strong>Email :</strong> contact@dimegroupe.ci<br />
<strong>Adresse :</strong> Abidjan, Côte d'Ivoire</p>`,
    updatedAt: new Date().toISOString(),
  },
];

export let afriNomadeContent: AfriNomadeContent[] = [
  {
    id: "1",
    section: "hero",
    title: "Découvrez la Côte d'Ivoire autrement",
    subtitle: "AfriNomade",
    description: "AfriNomade – voyages, expériences, bons plans en toute sérénité.",
    content: {
      image: "/afrinomade/photos/hero.jpg",
      ctaButtons: [
        { text: "Réserver sur WhatsApp", href: "/afrinomade/reservation" },
        { text: "Parler à un conseiller", href: "https://wa.me/2250747555745", variant: "outline" },
      ],
    },
    order: 1,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    section: "presentation",
    title: "Présentation",
    subtitle: "",
    description: "AfriNomade est la branche Tourisme & Loisirs de DIME GROUPE. Nous proposons des expériences premium à travers la Côte d'Ivoire: excursions, circuits découverte, hébergements haut de gamme, résidences meublées, maisons d'hôtes, transport sécurisé et bons plans nightlife. Que vous voyagiez en couple, en famille, entre amis ou en entreprise, nous créons des moments uniques sur mesure – avec confort, sécurité, authenticité et élégance.",
    content: {},
    order: 2,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "3",
    section: "excursions",
    title: "Excursions",
    subtitle: "Nature, culture, découvertes",
    description: "Partez à la découverte des merveilles ivoiriennes: plages, forêts, villages artisanaux, parcs nationaux.",
    content: {
      features: [
        "Programmes sur‑mesure",
        "Guides locaux expérimentés",
        "Sécurité et confort",
      ],
      examples: [
        "Assinie – plage, mini‑croisière, pique‑nique",
        "Grand‑Bassam – patrimoine UNESCO",
        "Yamoussoukro – Basilique, lac aux caïmans",
        "San Pedro – plages et réserves",
        "Parcs: Banco, Abokouamékro, Taï…",
      ],
      pricing: "Tarifs: à la demande (groupe/privé). Inclus possibles: transport, guide, photos.",
      images: [
        "/afrinomade/photos/plage.jpg",
        "/afrinomade/photos/excursion.jpg",
        "/afrinomade/photos/nature.jpg",
        "/afrinomade/photos/mer.jpg",
      ],
    },
    order: 3,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "4",
    section: "residences",
    title: "Résidences & Maisons d'hôtes",
    subtitle: "Hébergements sélectionnés",
    description: "Un réseau d'adresses confortables et stylées: studios meublés, appartements, maisons d'hôtes.",
    content: {
      features: [
        "Localisations centrales",
        "Confort et propreté",
        "Assistance 7j/7",
      ],
      images: [
        "/afrinomade/photos/hotel.jpg",
        "/afrinomade/photos/villa.jpg",
        "/afrinomade/photos/piscine.jpg",
        "/afrinomade/photos/mer.jpg",
      ],
      residences: [
        {
          name: "Le Cocoon de Balmer",
          description: "Appartement meublé élégant – capacité 2 à 4 pers, Wi‑Fi, cuisine équipée, proche commodités.",
          location: "Abidjan",
          services: ["Wi‑Fi", "ménage", "chef sur demande", "transport"],
          ideal: "couple, séjour pro, city break",
          image: "/afrinomade/photos/villa.jpg",
        },
      ],
    },
    order: 4,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "5",
    section: "transport",
    title: "Transport & voyages",
    subtitle: "",
    description: "Chauffeur privé, transferts, logistique.",
    content: {},
    order: 5,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "6",
    section: "bons-plans",
    title: "Bons plans & lieux branchés",
    subtitle: "",
    description: "Adresses testées, coups de cœur.",
    content: {},
    order: 6,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export let pageMetadata: PageMetadata[] = [
  {
    id: "1",
    path: "/",
    title: "DIME GROUPE – L'expertise digitale au service de vos projets",
    description: "Technologie, créativité et stratégie pour faire briller vos idées. Solutions IT, digitales et créatives en Côte d'Ivoire.",
    keywords: ["DIME GROUPE", "digital", "IT", "Côte d'Ivoire", "développement web", "communication", "tourisme"],
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    path: "/services",
    title: "Services – DIME GROUPE",
    description: "Découvrez nos services : Infrastructure & IT, Développement & Applications, Communication & Événementiel, Conseil & Stratégie, Tourisme & Loisirs.",
    keywords: ["services", "IT", "développement", "communication", "conseil", "tourisme"],
    updatedAt: new Date().toISOString(),
  },
  {
    id: "3",
    path: "/portfolio",
    title: "Portfolio – DIME GROUPE",
    description: "Découvrez nos réalisations : sites web, applications mobiles, identités visuelles, événements et expériences touristiques.",
    keywords: ["portfolio", "réalisations", "projets", "sites web", "applications"],
    updatedAt: new Date().toISOString(),
  },
  {
    id: "4",
    path: "/blog",
    title: "Blog – DIME GROUPE",
    description: "Actualités, conseils et tendances digitales par DIME GROUPE.",
    keywords: ["blog", "actualités", "conseils", "tendances", "digital"],
    updatedAt: new Date().toISOString(),
  },
  {
    id: "5",
    path: "/about",
    title: "À propos de DIME GROUPE",
    description: "Découvrez l'histoire, la mission, les valeurs et l'équipe de DIME GROUPE, expert en solutions digitales et technologiques en Côte d'Ivoire.",
    keywords: ["à propos", "histoire", "mission", "valeurs", "équipe"],
    updatedAt: new Date().toISOString(),
  },
  {
    id: "6",
    path: "/contact",
    title: "Contact – DIME GROUPE",
    description: "Contactez-nous pour discuter de votre projet ou obtenir un devis.",
    keywords: ["contact", "devis", "projet"],
    updatedAt: new Date().toISOString(),
  },
  {
    id: "7",
    path: "/faq",
    title: "FAQ – Questions Fréquentes",
    description: "Réponses aux questions fréquentes sur les services de DIME GROUPE : développement web, IT, communication, événementiel et tourisme.",
    keywords: ["FAQ", "questions", "réponses"],
    updatedAt: new Date().toISOString(),
  },
  {
    id: "8",
    path: "/afrinomade",
    title: "AfriNomade – Découvrez la Côte d'Ivoire autrement",
    description: "AfriNomade – voyages, expériences, bons plans en toute sérénité. Excursions, résidences, transport et logistique touristique en Côte d'Ivoire.",
    keywords: ["AfriNomade", "tourisme", "Côte d'Ivoire", "voyages", "excursions", "résidences"],
    updatedAt: new Date().toISOString(),
  },
];

// Fonctions de gestion
export function getFAQItems(): FAQItem[] {
  return [...faqItems].sort((a, b) => {
    if (a.category !== b.category) return a.category.localeCompare(b.category);
    return a.order - b.order;
  }).filter((item) => item.active);
}

export function getTestimonials(): Testimonial[] {
  return [...testimonials].sort((a, b) => a.order - b.order).filter((t) => t.active);
}

export function getClientLogos(): ClientLogo[] {
  return [...clientLogos].sort((a, b) => a.order - b.order).filter((l) => l.active);
}

export function getHomePageContent(): HomePageContent[] {
  return [...homePageContent].sort((a, b) => a.order - b.order).filter((c) => c.active);
}

export function getAboutPageContent(): AboutPageContent[] {
  return [...aboutPageContent].sort((a, b) => a.order - b.order).filter((c) => c.active);
}

export function getLegalPage(slug: string): LegalPage | undefined {
  return legalPages.find((p) => p.slug === slug);
}

export function getAfriNomadeContent(): AfriNomadeContent[] {
  return [...afriNomadeContent].sort((a, b) => a.order - b.order).filter((c) => c.active);
}

export function getPageMetadata(path: string): PageMetadata | undefined {
  return pageMetadata.find((m) => m.path === path);
}

// Fonctions de mise à jour
export function updateFAQItems(items: FAQItem[]): void {
  faqItems = items;
}

export function updateTestimonials(items: Testimonial[]): void {
  testimonials = items;
}

export function updateClientLogos(items: ClientLogo[]): void {
  clientLogos = items;
}

export function updateHomePageContent(content: HomePageContent[]): void {
  homePageContent = content;
}

export function updateAboutPageContent(content: AboutPageContent[]): void {
  aboutPageContent = content;
}

export function updateLegalPage(page: LegalPage): void {
  const index = legalPages.findIndex((p) => p.slug === page.slug);
  if (index >= 0) {
    legalPages[index] = page;
  } else {
    legalPages.push(page);
  }
}

export function updateAfriNomadeContent(content: AfriNomadeContent[]): void {
  afriNomadeContent = content;
}

export function updatePageMetadata(metadata: PageMetadata): void {
  const index = pageMetadata.findIndex((m) => m.path === metadata.path);
  if (index >= 0) {
    pageMetadata[index] = metadata;
  } else {
    pageMetadata.push(metadata);
  }
}


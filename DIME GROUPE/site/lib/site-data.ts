// Fichier de données centralisé pour le site et le dashboard admin
// Ce fichier contient toutes les données existantes du site

// ===== ARTICLES DE BLOG =====
export interface BlogArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  img: string;
  author?: string;
  content: string[];
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export const BLOG_ARTICLES: BlogArticle[] = [
  {
    id: "1",
    slug: "transformation-digitale-2025",
    title: "Transformation digitale en 2025 : Tendances et opportunités",
    excerpt: "Découvrez les tendances de la transformation digitale pour 2025 et comment les entreprises ivoiriennes peuvent en profiter.",
    category: "Stratégie",
    date: "2025-01-15",
    readTime: "5 min",
    img: "/images/service-consulting.jpg",
    author: "DIME GROUPE",
    content: [
      "La transformation digitale continue d'évoluer rapidement en 2025. Les entreprises ivoiriennes doivent s'adapter pour rester compétitives.",
      "Les tendances clés incluent l'intelligence artificielle, l'automatisation des processus, le cloud computing et la cybersécurité renforcée.",
      "Pour réussir sa transformation digitale, il est essentiel de définir une stratégie claire, de former les équipes et de choisir les bons outils.",
      "DIME GROUPE accompagne les entreprises dans cette transition avec des solutions sur-mesure et un accompagnement personnalisé.",
    ],
    published: true,
    createdAt: "2025-01-15T00:00:00Z",
    updatedAt: "2025-01-15T00:00:00Z",
  },
  {
    id: "2",
    slug: "seo-local-cote-ivoire",
    title: "SEO local en Côte d'Ivoire : Guide complet",
    excerpt: "Comment optimiser votre référencement local pour attirer les clients ivoiriens. Stratégies et bonnes pratiques.",
    category: "Marketing",
    date: "2025-01-10",
    readTime: "7 min",
    img: "/images/service-com.jpg",
    author: "DIME GROUPE",
    content: [
      "Le SEO local est essentiel pour les entreprises qui souhaitent attirer des clients dans leur région en Côte d'Ivoire.",
      "Optimisez votre fiche Google My Business, utilisez des mots-clés locaux et obtenez des avis clients positifs.",
      "Créez du contenu local pertinent et assurez-vous que vos informations de contact sont cohérentes sur tous les canaux.",
      "Avec une stratégie SEO local bien pensée, vous pouvez améliorer significativement votre visibilité et attirer plus de clients locaux.",
    ],
    published: true,
    createdAt: "2025-01-10T00:00:00Z",
    updatedAt: "2025-01-10T00:00:00Z",
  },
  {
    id: "3",
    slug: "choisir-hebergement-web",
    title: "Comment choisir son hébergement web en 2025",
    excerpt: "Guide complet pour choisir le meilleur hébergement web selon vos besoins : performance, sécurité, coûts.",
    category: "IT",
    date: "2025-01-05",
    readTime: "6 min",
    img: "/images/service-it.jpg",
    author: "DIME GROUPE",
    content: [
      "Choisir le bon hébergement web est crucial pour la performance et la sécurité de votre site.",
      "Évaluez vos besoins : trafic attendu, espace de stockage, bande passante, et besoins spécifiques (SSL, sauvegardes, etc.).",
      "Comparez les différents types d'hébergement : mutualisé, VPS, cloud, et serveur dédié.",
      "Prenez en compte la localisation des serveurs, le support client et les garanties de disponibilité (SLA).",
    ],
    published: true,
    createdAt: "2025-01-05T00:00:00Z",
    updatedAt: "2025-01-05T00:00:00Z",
  },
  {
    id: "4",
    slug: "e-commerce-cote-ivoire",
    title: "E-commerce en Côte d'Ivoire : Opportunités et défis",
    excerpt: "L'essor du e-commerce en Côte d'Ivoire : opportunités, défis et stratégies pour réussir en ligne.",
    category: "E-commerce",
    date: "2024-12-28",
    readTime: "8 min",
    img: "/images/service-dev.jpg",
    author: "DIME GROUPE",
    content: [
      "Le e-commerce connaît une croissance rapide en Côte d'Ivoire, porté par l'augmentation de l'utilisation d'Internet et des smartphones.",
      "Les opportunités sont nombreuses : marché en expansion, nouveaux modes de paiement (Mobile Money), et infrastructures qui s'améliorent.",
      "Les défis incluent la logistique, la confiance des consommateurs, et la concurrence internationale.",
      "Pour réussir, il faut une stratégie adaptée au marché local, des solutions de paiement locales, et une excellente expérience client.",
    ],
    published: true,
    createdAt: "2024-12-28T00:00:00Z",
    updatedAt: "2024-12-28T00:00:00Z",
  },
  {
    id: "5",
    slug: "voyage-responsable-cote-ivoire",
    title: "Tourisme responsable en Côte d'Ivoire avec AfriNomade",
    excerpt: "Comment voyager de manière responsable en Côte d'Ivoire. Découvrez nos engagements pour un tourisme durable.",
    category: "Tourisme",
    date: "2024-12-20",
    readTime: "5 min",
    img: "/afrinomade/photos/hero.jpg",
    author: "AfriNomade",
    content: [
      "Le tourisme responsable est au cœur des valeurs d'AfriNomade. Nous privilégions les expériences authentiques et durables.",
      "Nous travaillons avec des partenaires locaux pour favoriser l'économie locale et préserver les écosystèmes.",
      "Nous proposons des circuits respectueux de l'environnement et des communautés locales.",
      "Découvrez la Côte d'Ivoire autrement, en préservant ses richesses naturelles et culturelles pour les générations futures.",
    ],
    published: true,
    createdAt: "2024-12-20T00:00:00Z",
    updatedAt: "2024-12-20T00:00:00Z",
  },
  {
    id: "6",
    slug: "application-mobile-2025",
    title: "Créer une application mobile en 2025 : Guide pratique",
    excerpt: "Tout ce qu'il faut savoir pour créer une application mobile performante : technologies, coûts, délais.",
    category: "Développement",
    date: "2024-12-15",
    readTime: "10 min",
    img: "/images/service-dev.jpg",
    author: "DIME GROUPE",
    content: [
      "Créer une application mobile en 2025 nécessite de choisir les bonnes technologies et de suivre les meilleures pratiques.",
      "Choisissez entre développement natif (iOS/Android) ou cross-platform (React Native, Flutter) selon vos besoins.",
      "Planifiez bien votre projet : UX/UI, fonctionnalités, sécurité, et monétisation.",
      "N'oubliez pas les aspects techniques : performance, tests, déploiement, et maintenance continue.",
    ],
    published: true,
    createdAt: "2024-12-15T00:00:00Z",
    updatedAt: "2024-12-15T00:00:00Z",
  },
];

// ===== PROJETS PORTFOLIO =====
export interface PortfolioProject {
  id: string;
  slug: string;
  title: string;
  tag: string;
  category: string;
  description: string;
  longDescription: string;
  year: string;
  img: string;
  sector: string;
  technologies: string[];
  deliverables: string[];
  results?: string[];
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export const PORTFOLIO_PROJECTS: PortfolioProject[] = [
  {
    id: "1",
    slug: "site-corporate",
    title: "Site Corporate",
    tag: "Web",
    category: "Développement",
    description: "Site vitrine professionnel avec design moderne et responsive",
    longDescription: "Création d'un site corporate moderne et performant pour une entreprise ivoirienne. Le site inclut une interface responsive, une navigation intuitive, une section blog et un formulaire de contact optimisé.",
    year: "2024",
    img: "/portfolio/site-corporate.jpg",
    sector: "Services",
    technologies: ["Next.js", "TypeScript", "Tailwind CSS", "SEO"],
    deliverables: ["Site web responsive", "Design UI/UX", "Optimisation SEO", "Formation"],
    results: ["+150% de trafic organique", "Temps de chargement < 2s", "Score SEO 95/100"],
    published: true,
    createdAt: "2024-01-15T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
  },
  {
    id: "2",
    slug: "identite-visuelle",
    title: "Identité Visuelle",
    tag: "Branding",
    category: "Communication",
    description: "Création d'identité visuelle complète : logo, charte graphique et supports",
    longDescription: "Développement d'une identité visuelle complète pour une nouvelle marque. Création du logo, de la charte graphique, des supports de communication print et digital, et des guidelines de la marque.",
    year: "2024",
    img: "/portfolio/identite-visuelle.jpg",
    sector: "Retail",
    technologies: ["Adobe Illustrator", "Adobe Photoshop", "Brand Guidelines"],
    deliverables: ["Logo (variations)", "Charte graphique", "Supports print", "Supports digital", "Guidelines"],
    results: ["Reconnaissance de marque +200%", "Cohérence visuelle sur tous supports"],
    published: true,
    createdAt: "2024-02-10T00:00:00Z",
    updatedAt: "2024-02-10T00:00:00Z",
  },
  {
    id: "3",
    slug: "evenement-pro",
    title: "Événement Professionnel",
    tag: "Event",
    category: "Événementiel",
    description: "Organisation complète d'un événement corporate avec coordination logistique",
    longDescription: "Organisation complète d'un événement corporate de 300 personnes incluant la planification, la coordination logistique, la gestion des prestataires, la communication et le suivi post-événement.",
    year: "2024",
    img: "/portfolio/evenement-pro.jpg",
    sector: "Corporate",
    technologies: ["Gestion événementielle", "Coordination", "Communication"],
    deliverables: ["Organisation complète", "Coordination logistique", "Gestion prestataires", "Reportage photo/vidéo"],
    results: ["300+ participants", "Taux de satisfaction 98%", "Retombées médias importantes"],
    published: true,
    createdAt: "2024-03-20T00:00:00Z",
    updatedAt: "2024-03-20T00:00:00Z",
  },
  {
    id: "4",
    slug: "voyage-afrinomade",
    title: "Expérience AfriNomade",
    tag: "Tourisme",
    category: "Tourisme",
    description: "Circuit découverte sur mesure en Côte d'Ivoire avec hébergement premium",
    longDescription: "Organisation d'un circuit découverte sur mesure de 7 jours en Côte d'Ivoire incluant hébergement premium, excursions guidées, transport et restauration. Expérience authentique et mémorable.",
    year: "2024",
    img: "/portfolio/voyage-afrinomade.jpg",
    sector: "Tourisme",
    technologies: ["Organisation touristique", "Gestion logistique"],
    deliverables: ["Circuit sur mesure", "Hébergement", "Transport", "Guide", "Documentation"],
    results: ["Taux de satisfaction 100%", "Retours clients excellents", "Recommandations nombreuses"],
    published: true,
    createdAt: "2024-04-15T00:00:00Z",
    updatedAt: "2024-04-15T00:00:00Z",
  },
  {
    id: "5",
    slug: "e-commerce",
    title: "Plateforme E-commerce",
    tag: "Web",
    category: "Développement",
    description: "Boutique en ligne complète avec gestion de commandes et paiement",
    longDescription: "Développement d'une plateforme e-commerce complète avec gestion des produits, panier, commandes, paiement sécurisé, espace client et back-office d'administration.",
    year: "2024",
    img: "/portfolio/site-corporate.jpg",
    sector: "E-commerce",
    technologies: ["Next.js", "Stripe", "PostgreSQL", "Strapi"],
    deliverables: ["Site e-commerce", "Back-office", "Paiement sécurisé", "Formation"],
    results: ["+300% de ventes en ligne", "Taux de conversion 4.5%", "Paiement sécurisé 100%"],
    published: true,
    createdAt: "2024-05-10T00:00:00Z",
    updatedAt: "2024-05-10T00:00:00Z",
  },
  {
    id: "6",
    slug: "application-mobile",
    title: "Application Mobile",
    tag: "Mobile",
    category: "Développement",
    description: "Application iOS/Android native avec interface intuitive",
    longDescription: "Développement d'une application mobile native iOS et Android avec interface utilisateur intuitive, synchronisation cloud, notifications push et intégration API.",
    year: "2024",
    img: "/portfolio/identite-visuelle.jpg",
    sector: "Services",
    technologies: ["React Native", "Firebase", "API REST"],
    deliverables: ["App iOS", "App Android", "Backend", "Documentation"],
    results: ["10k+ téléchargements", "Note 4.8/5", "Taux de rétention 75%"],
    published: true,
    createdAt: "2024-06-20T00:00:00Z",
    updatedAt: "2024-06-20T00:00:00Z",
  },
  {
    id: "7",
    slug: "campagne-marketing",
    title: "Campagne Marketing Digital",
    tag: "Marketing",
    category: "Communication",
    description: "Stratégie digitale complète : SEO, SEA, réseaux sociaux et e-mailing",
    longDescription: "Mise en place d'une stratégie marketing digitale complète incluant optimisation SEO, campagnes publicitaires SEA, gestion des réseaux sociaux et campagnes e-mailing automatisées.",
    year: "2024",
    img: "/portfolio/evenement-pro.jpg",
    sector: "Services",
    technologies: ["SEO", "Google Ads", "Facebook Ads", "Mailchimp"],
    deliverables: ["Stratégie digitale", "Optimisation SEO", "Campagnes publicitaires", "Community management"],
    results: ["+250% de trafic", "ROAS 5:1", "Engagement +180%"],
    published: true,
    createdAt: "2024-07-15T00:00:00Z",
    updatedAt: "2024-07-15T00:00:00Z",
  },
  {
    id: "8",
    slug: "production-video",
    title: "Production Vidéo",
    tag: "Vidéo",
    category: "Communication",
    description: "Production et montage vidéo corporate avec motion design",
    longDescription: "Production vidéo corporate incluant tournage, montage, motion design, sous-titres et adaptation pour les réseaux sociaux. Vidéos promotionnelles et témoignages clients.",
    year: "2024",
    img: "/portfolio/voyage-afrinomade.jpg",
    sector: "Corporate",
    technologies: ["Adobe Premiere Pro", "After Effects", "Motion Design"],
    deliverables: ["Vidéo principale", "Adaptations réseaux sociaux", "Motion design", "Sous-titres"],
    results: ["500k+ vues", "Engagement élevé", "Partages nombreux"],
    published: true,
    createdAt: "2024-08-10T00:00:00Z",
    updatedAt: "2024-08-10T00:00:00Z",
  },
];

// ===== SERVICES =====
export interface Service {
  id: string;
  slug: string;
  title: string;
  icon: string;
  description: string;
  longDescription: string;
  img: string;
  category: string;
  items: Array<{
    icon: string;
    name: string;
    description: string;
    details?: string[];
  }>;
  benefits?: string[];
  process?: string[];
  pricing?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export const SERVICES: Service[] = [
  {
    id: "1",
    slug: "infrastructure-it",
    title: "Infrastructure & IT",
    icon: "✅",
    description: "Solutions IT complètes pour votre infrastructure digitale",
    longDescription: "DIME GROUPE vous accompagne dans la mise en place et la gestion de votre infrastructure IT et physique. Nous proposons des solutions complètes, sécurisées et performantes pour garantir la disponibilité et la fiabilité de vos systèmes informatiques, ainsi que l'installation de systèmes de sécurité, de câblage réseau et électrique, et d'automatisation.",
    img: "/images/service-it.jpg",
    category: "Infrastructure & IT",
    items: [
      {
        icon: "🌐",
        name: "Noms de domaine & Hébergement",
        description: "Enregistrement de noms de domaine, hébergement web sécurisé et performant, gestion DNS et SSL.",
        details: [
          "Enregistrement et gestion de noms de domaine (.ci, .com, .org, etc.)",
          "Hébergement web haute performance avec garantie de disponibilité",
          "Configuration DNS et gestion des enregistrements",
          "Certificats SSL/TLS pour sécuriser vos sites",
          "Sauvegardes automatiques et restauration",
          "Support technique 24/7",
        ],
      },
      {
        icon: "🛠️",
        name: "Solutions IT & Cloud (serveurs, réseaux…)",
        description: "Configuration de serveurs, mise en place de réseaux, migration vers le cloud, virtualisation et sauvegarde.",
        details: [
          "Configuration et administration de serveurs dédiés et VPS",
          "Mise en place de réseaux locaux et sécurisation",
          "Migration vers le cloud (AWS, Azure, GCP)",
          "Virtualisation et conteneurisation (Docker, Kubernetes)",
          "Solutions de sauvegarde et disaster recovery",
          "Monitoring et maintenance proactive",
        ],
      },
      {
        icon: "🔌",
        name: "Câblage réseau & électrique",
        description: "Installation de câblage réseau structuré, câblage électrique, réseaux locaux (LAN), réseaux sans fil (Wi-Fi) et systèmes électriques.",
        details: [
          "Câblage réseau structuré (cuivre, fibre optique)",
          "Installation de réseaux locaux (LAN) et Wi-Fi",
          "Câblage électrique et installation de prises",
          "Mise en place de baies de brassage et équipements réseau",
          "Tests et certification des installations",
          "Documentation technique et schémas",
        ],
      },
      {
        icon: "📹",
        name: "Installation de caméras de surveillance",
        description: "Installation de systèmes de vidéosurveillance, caméras IP, systèmes de monitoring et enregistrement vidéo.",
        details: [
          "Installation de caméras IP et analogiques",
          "Systèmes de vidéosurveillance HD et 4K",
          "Enregistreurs numériques (DVR/NVR)",
          "Visionnage à distance et accès mobile",
          "Détection de mouvement et alertes",
          "Stockage et archivage vidéo",
        ],
      },
      {
        icon: "🔐",
        name: "Contrôle d'accès (lecteurs d'accès)",
        description: "Installation de systèmes de contrôle d'accès, lecteurs de badges, biométrie, gestion des accès et badges électroniques.",
        details: [
          "Installation de lecteurs de badges et cartes",
          "Systèmes biométriques (empreintes, reconnaissance faciale)",
          "Gestion des droits d'accès et horaires",
          "Badges électroniques et cartes d'accès",
          "Intégration avec systèmes de sécurité",
          "Rapports et traçabilité des accès",
        ],
      },
      {
        icon: "🚪",
        name: "Automatisation de portail",
        description: "Installation et configuration de portails automatiques, motorisation, télécommandes et systèmes d'ouverture automatique.",
        details: [
          "Installation de motorisations pour portails",
          "Portails coulissants et battants automatisés",
          "Télécommandes et systèmes d'ouverture à distance",
          "Intégration avec contrôle d'accès",
          "Détecteurs de sécurité et anti-pincement",
          "Maintenance et réparation",
        ],
      },
      {
        icon: "⚡",
        name: "Clôture électrique",
        description: "Installation de clôtures électriques, systèmes de sécurité périmétrique, alarmes et détection d'intrusion.",
        details: [
          "Installation de clôtures électriques sécurisées",
          "Systèmes de sécurité périmétrique",
          "Détecteurs d'intrusion et alarmes",
          "Centrales d'alarme et sirènes",
          "Intégration avec vidéosurveillance",
          "Maintenance et tests réguliers",
        ],
      },
    ],
    benefits: [
      "Infrastructure sécurisée et conforme aux standards",
      "Performance optimisée pour vos applications",
      "Scalabilité selon vos besoins",
      "Support technique réactif",
      "Réduction des coûts d'infrastructure",
    ],
    process: [
      "Audit de votre infrastructure existante",
      "Proposition de solutions adaptées",
      "Déploiement et configuration",
      "Formation et documentation",
      "Support et maintenance continue",
    ],
    pricing: "Sur devis selon vos besoins spécifiques",
    active: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "2",
    slug: "conseil-strategie",
    title: "Conseil & Stratégie",
    icon: "✅",
    description: "Accompagnement stratégique pour votre transformation digitale",
    longDescription: "Transformez votre entreprise avec notre expertise en conseil et stratégie digitale. Nous vous accompagnons dans votre transformation digitale avec des formations sur mesure, des audits complets et une feuille de route claire.",
    img: "/images/service-consulting.jpg",
    category: "Conseil & Stratégie",
    items: [
      {
        icon: "📚",
        name: "Formations & Coaching",
        description: "Formations personnalisées et coaching pour vos équipes sur les outils digitaux, les bonnes pratiques et les nouvelles technologies.",
        details: [
          "Formations sur mesure selon vos besoins",
          "Coaching individuel et collectif",
          "Formation aux outils digitaux",
          "Bonnes pratiques et méthodologies",
          "Support post-formation",
        ],
      },
      {
        icon: "🎯",
        name: "Transformation Digitale & IT",
        description: "Accompagnement dans votre transformation digitale : audit, stratégie, feuille de route et mise en œuvre.",
        details: [
          "Audit de votre maturité digitale",
          "Définition de votre stratégie digitale",
          "Feuille de route et planification",
          "Accompagnement à la mise en œuvre",
          "Suivi et optimisation continue",
        ],
      },
    ],
    active: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "3",
    slug: "communication-creation-evenementiel",
    title: "Communication, Création & Événementiel",
    icon: "✅",
    description: "Solutions complètes de communication et création",
    longDescription: "Boostez votre visibilité avec nos services de communication, création et événementiel. De la planification d'événements à la production vidéo, en passant par la photographie et l'identité visuelle.",
    img: "/images/service-com.jpg",
    category: "Communication, Création & Événementiel",
    items: [
      {
        icon: "📅",
        name: "Planification & Organisation d'événements",
        description: "Organisation complète d'événements : planification, coordination, gestion des prestataires et suivi.",
      },
      {
        icon: "📷",
        name: "Photographie professionnelle",
        description: "Services de photographie professionnelle : événements, portraits, produits, reportages.",
      },
      {
        icon: "🎨",
        name: "Identité Visuelle & Infographie",
        description: "Création d'identité visuelle complète : logos, chartes graphiques, supports de communication.",
      },
      {
        icon: "✉️",
        name: "E-mail Marketing",
        description: "Création et envoi de campagnes e-mailing personnalisées et automatisées.",
      },
      {
        icon: "📱",
        name: "Community Management",
        description: "Gestion de vos réseaux sociaux : création de contenu, animation de communauté, stratégie de communication.",
      },
      {
        icon: "📈",
        name: "Référencement (SEO/SEA)",
        description: "Optimisation de votre référencement naturel (SEO) et campagnes publicitaires (SEA).",
      },
      {
        icon: "🎬",
        name: "Montage Vidéo & Production",
        description: "Production et montage vidéo : corporate, promotionnel, événementiel, motion design.",
      },
    ],
    active: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "4",
    slug: "developpement-applications",
    title: "Développement & Applications",
    icon: "✅",
    description: "Développement web et applications sur mesure",
    longDescription: "Créez des solutions digitales sur mesure avec notre expertise en développement web et applications. Sites vitrines, e-commerce, applications mobiles, ERP et outils métiers.",
    img: "/images/service-dev.jpg",
    category: "Développement & Applications",
    items: [
      {
        icon: "🖥️",
        name: "Développement Web (sites vitrines & e-commerce)",
        description: "Création de sites vitrines, e-commerce, sites corporate, blogs, portfolios et applications web sur mesure.",
      },
      {
        icon: "📱",
        name: "Applications & Prototypage (ERP, facturation, mobile…)",
        description: "Développement d'applications métiers, ERP, systèmes de facturation, applications mobiles iOS/Android.",
      },
    ],
    active: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "5",
    slug: "tourisme-loisirs-afrinomade",
    title: "Tourisme & Loisirs (AfriNomade)",
    icon: "✅",
    description: "Découvrez la Côte d'Ivoire autrement",
    longDescription: "AfriNomade vous propose des expériences de voyage authentiques et mémorables en Côte d'Ivoire. Excursions, résidences meublées, transport et bons plans pour découvrir le pays autrement.",
    img: "/afrinomade/photos/hero.jpg",
    category: "Tourisme & Loisirs",
    items: [
      {
        icon: "🌴",
        name: "AfriNomade – Excursions & Voyages",
        description: "Organisation d'excursions, voyages thématiques, circuits découverte et expériences de voyage sur mesure.",
      },
      {
        icon: "🏡",
        name: "Résidences & Maisons d'hôtes",
        description: "Sélection et réservation de résidences meublées, maisons d'hôtes, hébergements confortables et sélectionnés.",
      },
      {
        icon: "🍹",
        name: "Conseils & Bons Plans",
        description: "City guide, recommandations de restaurants, lieux branchés, adresses testées et coups de cœur.",
      },
      {
        icon: "🚐",
        name: "Transport & Logistique touristique",
        description: "Chauffeur privé, transferts aéroport, location de véhicules, logistique touristique et organisation de déplacements.",
      },
    ],
    active: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
];

// ===== CONTACTS =====
export interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: string;
  updatedAt?: string;
}

export const CONTACTS: Contact[] = [];



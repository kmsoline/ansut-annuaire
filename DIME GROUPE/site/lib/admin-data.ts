// Fichier de données partagé pour le dashboard admin
// Ce fichier synchronise les données avec lib/site-data.ts
// TODO: Remplacer par une vraie base de données

import { BLOG_ARTICLES, PORTFOLIO_PROJECTS, SERVICES, CONTACTS, type BlogArticle, type PortfolioProject, type Service, type Contact } from "./site-data";

// Références aux données existantes (pour permettre la modification)
export let blogPosts: BlogArticle[] = [...BLOG_ARTICLES];
export let portfolioItems: PortfolioProject[] = [...PORTFOLIO_PROJECTS];
export let services: Service[] = [...SERVICES];
export let contacts: Contact[] = [...CONTACTS];


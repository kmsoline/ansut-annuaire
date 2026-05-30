import type { MetadataRoute } from "next";
import { dbSelect } from "@/lib/db";

const BASE = "https://www.dimegroupe.ci";

export const revalidate = 3600; // regénérer toutes les heures

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, priority: 1, changeFrequency: "weekly" },
    { url: `${BASE}/services`, priority: 0.9, changeFrequency: "monthly" },
    { url: `${BASE}/portfolio`, priority: 0.9, changeFrequency: "monthly" },
    { url: `${BASE}/blog`, priority: 0.8, changeFrequency: "weekly" },
    { url: `${BASE}/about`, priority: 0.7, changeFrequency: "yearly" },
    { url: `${BASE}/contact`, priority: 0.8, changeFrequency: "monthly" },
    { url: `${BASE}/faq`, priority: 0.7, changeFrequency: "monthly" },
    { url: `${BASE}/afrinomade`, priority: 0.8, changeFrequency: "monthly" },
    { url: `${BASE}/afrinomade/excursions`, priority: 0.7, changeFrequency: "monthly" },
    { url: `${BASE}/afrinomade/residences`, priority: 0.7, changeFrequency: "monthly" },
    { url: `${BASE}/afrinomade/transport`, priority: 0.7, changeFrequency: "monthly" },
    { url: `${BASE}/afrinomade/bons-plans`, priority: 0.7, changeFrequency: "monthly" },
    { url: `${BASE}/afrinomade/reservation`, priority: 0.6, changeFrequency: "monthly" },
    { url: `${BASE}/legal/mentions-legales`, priority: 0.3, changeFrequency: "yearly" },
    { url: `${BASE}/legal/cgv`, priority: 0.3, changeFrequency: "yearly" },
    { url: `${BASE}/legal/confidentialite`, priority: 0.3, changeFrequency: "yearly" },
  ];

  try {
    // Articles de blog publiés
    const articles = await dbSelect<{ slug: string; date: string }>(
      "blog_articles",
      "select=slug,date&published=eq.true&order=date.desc"
    );
    const blogEntries: MetadataRoute.Sitemap = articles.map((a) => ({
      url: `${BASE}/blog/${a.slug}`,
      lastModified: a.date ? new Date(a.date) : undefined,
      priority: 0.6,
      changeFrequency: "yearly",
    }));

    // Projets portfolio publiés
    const projects = await dbSelect<{ slug: string; updated_at: string }>(
      "portfolio_items",
      "select=slug,updated_at&published=eq.true&order=updated_at.desc"
    );
    const portfolioEntries: MetadataRoute.Sitemap = projects.map((p) => ({
      url: `${BASE}/portfolio/${p.slug}`,
      lastModified: p.updated_at ? new Date(p.updated_at) : undefined,
      priority: 0.7,
      changeFrequency: "yearly",
    }));

    // Services actifs
    const services = await dbSelect<{ slug: string; updated_at: string }>(
      "services",
      "select=slug,updated_at&active=eq.true&order=updated_at.desc"
    );
    const serviceEntries: MetadataRoute.Sitemap = services.map((s) => ({
      url: `${BASE}/services/${s.slug}`,
      lastModified: s.updated_at ? new Date(s.updated_at) : undefined,
      priority: 0.8,
      changeFrequency: "monthly",
    }));

    return [...staticPages, ...blogEntries, ...portfolioEntries, ...serviceEntries];
  } catch {
    // En cas d'erreur DB, retourner le sitemap statique
    return staticPages;
  }
}

import type { MetadataRoute } from "next";
import { getPublishedProjects } from "@/lib/data/projects";
import { getPublishedPosts } from "@/lib/data/blog";
import { getPublishedServices } from "@/lib/data/services";
import { SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, blogPosts, services] = await Promise.all([
    getPublishedProjects(),
    getPublishedPosts(),
    getPublishedServices(),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE_URL}/progetti`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/blog`, changeFrequency: "weekly", priority: 0.6 },
    {
      url: `${SITE_URL}/privacy-policy`,
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${SITE_URL}/cookie-policy`,
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ];

  const projectRoutes: MetadataRoute.Sitemap = projects
    .filter((p) => !p.seo_noindex)
    .map((p) => ({
      url: `${SITE_URL}/progetti/${p.slug}`,
      lastModified: p.updated_at,
      changeFrequency: "monthly",
      priority: 0.8,
    }));

  const blogRoutes: MetadataRoute.Sitemap = blogPosts
    .filter((p) => !p.seo_noindex)
    .map((p) => ({
      url: `${SITE_URL}/blog/${p.slug}`,
      lastModified: p.updated_at,
      changeFrequency: "monthly",
      priority: 0.7,
    }));

  // /servizi esiste solo se c'è almeno un servizio pubblicato.
  const serviceRoutes: MetadataRoute.Sitemap = services.length
    ? [
        {
          url: `${SITE_URL}/servizi`,
          changeFrequency: "monthly",
          priority: 0.9,
        },
        ...services
          .filter((s) => !s.seo_noindex)
          .map((s) => ({
            url: `${SITE_URL}/servizi/${s.slug}`,
            lastModified: s.updated_at,
            changeFrequency: "monthly" as const,
            priority: 0.9,
          })),
      ]
    : [];

  return [...staticRoutes, ...serviceRoutes, ...projectRoutes, ...blogRoutes];
}

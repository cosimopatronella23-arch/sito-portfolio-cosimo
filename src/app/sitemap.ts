import type { MetadataRoute } from "next";
import { getPublishedProjects } from "@/lib/data/projects";
import { getPublishedPosts } from "@/lib/data/blog";
import { SITE_URL } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, blogPosts] = await Promise.all([
    getPublishedProjects(),
    getPublishedPosts(),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE_URL}/blog`, changeFrequency: "weekly", priority: 0.6 },
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

  return [...staticRoutes, ...projectRoutes, ...blogRoutes];
}

import type { Metadata } from "next";
import type { BlogPost, Project, SiteSettings } from "./types";

/**
 * URL base del sito. Aggiornalo qui quando colleghi un dominio tuo al posto
 * dell'indirizzo *.vercel.app.
 */
export const SITE_URL = "https://cosimopatronella.vercel.app";

export function buildMetadata(input: {
  title: string;
  description: string;
  path: string;
  ogImage?: string | null;
  noindex?: boolean;
  siteName?: string;
}): Metadata {
  const { title, description, path, ogImage, noindex, siteName } = input;
  const url = `${SITE_URL}${path}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    robots: noindex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      title,
      description,
      url,
      siteName: siteName ?? "Cosimo Patronella",
      type: "website",
      locale: "it_IT",
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

// Identificativo stabile della Person, riferito (non duplicato) da ogni
// altro JSON-LD del sito: aiuta Google a capire che è sempre la stessa
// entità dietro sito, progetti e articoli.
const PERSON_ID = `${SITE_URL}/#person`;

export function projectJsonLd(project: Project) {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: project.short_description,
    creator: {
      "@type": "Person",
      "@id": PERSON_ID,
      name: "Cosimo Patronella",
      url: SITE_URL,
    },
    about: project.category,
    datePublished: project.created_at,
    dateModified: project.updated_at,
    url: `${SITE_URL}/progetti/${project.slug}`,
  };
}

export function blogPostJsonLd(post: BlogPost) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    author: {
      "@type": "Person",
      "@id": PERSON_ID,
      name: "Cosimo Patronella",
      url: SITE_URL,
    },
    datePublished: post.published_at,
    dateModified: post.updated_at,
    mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`,
  };
}

export function personJsonLd(settings: SiteSettings) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": PERSON_ID,
    name: "Cosimo Patronella",
    jobTitle: "Web Designer",
    url: SITE_URL,
    email: settings.contact_email,
    sameAs: Object.values(settings.social_links),
  };
}

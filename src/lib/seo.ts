import type { Metadata } from "next";
import type { BlogPost, Project, ServicePage, SiteSettings } from "./types";
import { formatPhone } from "./phone";
import { PRIMARY_URL } from "./domain";

/**
 * URL base del sito (canonical, sitemap, robots, dati strutturati). Se il
 * dominio .it venisse abbandonato, qui va messo FALLBACK_URL.
 */
export const SITE_URL = PRIMARY_URL;

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
    image: project.seo_og_image ?? project.cover_image ?? undefined,
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
    image: post.seo_og_image ?? post.cover_image ?? undefined,
    datePublished: post.published_at,
    dateModified: post.updated_at,
    mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`,
  };
}

/**
 * Nome del sito per Google (quello mostrato sopra il link nei risultati).
 * Senza, Google poteva ricavarlo dal dominio *.vercel.app e mostrare
 * "Vercel".
 */
export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Cosimo Patronella",
    alternateName: "cosimopatronella.it",
    url: `${SITE_URL}/`,
    publisher: { "@id": PERSON_ID },
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
    telephone: settings.contact_phone
      ? formatPhone(settings.contact_phone)
      : undefined,
    sameAs: Object.values(settings.social_links),
  };
}

/**
 * Dati strutturati di una pagina servizio: il servizio (chi lo offre e
 * dove), il percorso Home > Servizi > pagina e, se presenti, le domande
 * frequenti. Tutto ricavato dai contenuti reali della pagina.
 */
export function serviceJsonLd(service: ServicePage) {
  const url = `${SITE_URL}/servizi/${service.slug}`;
  const areas = service.area_served
    .split(",")
    .map((a) => a.trim())
    .filter(Boolean);

  const graph: Record<string, unknown>[] = [
    {
      "@type": "Service",
      "@id": `${url}#service`,
      name: service.title,
      description: service.excerpt || service.intro,
      url,
      provider: { "@id": PERSON_ID },
      ...(areas.length
        ? { areaServed: areas.map((name) => ({ "@type": "Place", name })) }
        : {}),
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
        {
          "@type": "ListItem",
          position: 2,
          name: "Servizi",
          item: `${SITE_URL}/servizi`,
        },
        { "@type": "ListItem", position: 3, name: service.title, item: url },
      ],
    },
  ];

  if (service.faqs.length) {
    graph.push({
      "@type": "FAQPage",
      mainEntity: service.faqs.map((f) => ({
        "@type": "Question",
        name: f.question,
        acceptedAnswer: { "@type": "Answer", text: f.answer },
      })),
    });
  }

  return { "@context": "https://schema.org", "@graph": graph };
}

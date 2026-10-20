/**
 * Tipi allineati 1:1 allo schema Supabase descritto nel prompt di progetto.
 * In Fase 2 questi tipi verranno generati/validati dalle tabelle reali; per ora
 * sono la "fonte di verità" usata sia dai dati mock che dai componenti, così lo
 * swap mock -> query Supabase non richiederà modifiche ai componenti.
 */

export type ContentStatus = "draft" | "published";

export interface ContentBlock {
  heading: string;
  body: string;
}

export interface GalleryItem {
  url: string;
  // "full" = a tutta larghezza, "half" = affiancata a un'altra "half",
  // "slide" = più "slide" consecutive si alternano da sole nello stesso
  // riquadro (dissolvenza).
  layout: "full" | "half" | "slide";
  // Testo alternativo (descrizione per Google e lettori di schermo). Se
  // manca si usa il titolo del progetto. Ignorato per i video.
  alt?: string;
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  category: string;
  client: string;
  year: number;
  cover_image: string | null;
  gallery: GalleryItem[];
  short_description: string;
  content_blocks: ContentBlock[];
  external_link: string | null;
  featured: boolean;
  /** Ordine manuale di comparsa (più basso = prima), sia in homepage (solo
   *  quelli con "featured") sia in /progetti (tutti i pubblicati). */
  sort_order: number;
  status: ContentStatus;
  seo_title: string | null;
  seo_description: string | null;
  seo_og_image: string | null;
  seo_noindex: boolean;
  created_at: string;
  updated_at: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  category: string;
  cover_image: string | null;
  excerpt: string;
  content: string;
  status: ContentStatus;
  published_at: string;
  /** Ordine manuale di comparsa (più basso = prima); a parità, vince il più
   *  recente. Non l'ordine di pubblicazione: quello lo decide questo campo. */
  sort_order: number;
  seo_title: string | null;
  seo_description: string | null;
  seo_og_image: string | null;
  seo_noindex: boolean;
  created_at: string;
  updated_at: string;
}

export interface ServiceItem {
  title: string;
  description: string;
  /** Pagina del servizio a cui porta la riga in homepage (es.
   *  /servizi/realizzazione-siti-web). Vuoto = riga non cliccabile. */
  href?: string;
}

export interface ServiceFaq {
  question: string;
  answer: string;
}

/** Pagina di un servizio (/servizi/[slug]), modificabile da /admin. */
export interface ServicePage {
  id: string;
  slug: string;
  title: string;
  /** Una o due frasi: card in /servizi e meta description di riserva. */
  excerpt: string;
  /** Paragrafo d'apertura sotto il titolo. */
  intro: string;
  content_blocks: ContentBlock[];
  faqs: ServiceFaq[];
  related_project_slugs: string[];
  /** Zone servite, separate da virgola (es. "Roma, Grottaglie, Taranto"). */
  area_served: string;
  sort_order: number;
  status: ContentStatus;
  seo_title: string | null;
  seo_description: string | null;
  seo_og_image: string | null;
  seo_noindex: boolean;
  created_at: string;
  updated_at: string;
}

export interface NavLink {
  label: string;
  href: string;
}

export type BlockAlign = "left" | "center";

// Comune a tutti i blocchi: sfondo personalizzato per la singola sezione.
// Vuoto = usa lo sfondo del sito come sempre; se impostato, testo e bordi
// del blocco si adattano automaticamente (chiaro/scuro) per restare
// leggibili — vedi pickTextColors in src/lib/contrast.ts.
interface BlockBackground {
  backgroundColor?: string;
}

export interface TestoLiberoBlockData extends BlockBackground {
  title: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
  align: BlockAlign;
}

export interface HeroAltBlockData extends BlockBackground {
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
  align: BlockAlign;
}

export interface TestimonialItem {
  quote: string;
  author: string;
  role: string;
}

export interface TestimonianzeBlockData extends BlockBackground {
  title: string;
  items: TestimonialItem[];
  align: BlockAlign;
}

export interface CtaBannerBlockData extends BlockBackground {
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
  align: BlockAlign;
}

export interface GalleryBlockData extends BlockBackground {
  title: string;
  images: string[];
  align: BlockAlign;
}

export type HomepageBlock =
  | { id: string; type: "testo_libero"; data: TestoLiberoBlockData }
  | { id: string; type: "hero_alt"; data: HeroAltBlockData }
  | { id: string; type: "testimonianze"; data: TestimonianzeBlockData }
  | { id: string; type: "cta_banner"; data: CtaBannerBlockData }
  | { id: string; type: "gallery"; data: GalleryBlockData };

/** Recensione di un cliente (da Google), gestita in /admin/recensioni. */
export interface ClientReview {
  id: string;
  author: string;
  /** Ruolo, azienda o progetto, es. "Sette Note Romane APS". */
  context: string;
  text: string;
  /** Stelle da 1 a 5. */
  rating: number;
  /** Mese della recensione, "AAAA-MM". */
  date: string;
  /** Progetto collegato (slug): la recensione compare anche lì. */
  project_slug: string;
  visible: boolean;
}

export type SectionTheme = "ink" | "paper" | "accent";

export type HomeSectionKey =
  | "hero"
  | "marquee"
  | "projects"
  | "services"
  | "process"
  | "reviews"
  | "blog"
  | "contact";

/** Un passo della sezione "Come lavoro" in homepage. */
export interface ProcessStep {
  title: string;
  text: string;
  /** Etichetta facoltativa, es. "Gratis". */
  badge: string;
}

export interface HomeContent {
  hero_title_main: string;
  hero_title_accent: string;
  hero_subtitle: string;
  hero_quote: string;
  cta_primary: string;
  cta_secondary: string;
  services_title: string;
  services: ServiceItem[];
  /** Testo d'apertura della pagina /servizi (il titolo è services_title). */
  services_intro?: string;
  // Recensioni dei clienti: vivono qui per evitare una migrazione al
  // database. Si salvano solo da /admin/recensioni.
  reviews?: ClientReview[];
  // Design "Dumbar" (ottobre 2026): campi nuovi, tutti facoltativi. Se
  // mancano si usano i valori predefiniti di src/lib/homeDefaults.ts.
  hero_eyebrow?: string;
  projects_title?: string;
  process_title?: string;
  process_subtitle?: string;
  process_steps?: ProcessStep[];
  show_process?: boolean;
  show_reviews?: boolean;
  contact_eyebrow?: string;
  contact_title?: string;
  contact_text?: string;
  /** Sfondo di ogni sezione della homepage (solo scuro, carta, accento).
   *  Chiave nuova: le scelte della versione precedente, con il corallo,
   *  restano nel database ma non vengono più lette. */
  section_style?: Partial<Record<HomeSectionKey, SectionTheme>>;
  // Vive qui per lo stesso motivo di nav_links: evitare una migrazione al
  // database. Se assente/vuoto, il footer usa il testo di default nel codice.
  footer_tagline?: string;
  /** Partita IVA, mostrata nel footer (obbligatoria per legge se presente). */
  vat_number?: string;
  // Sfondo e testo principale del sito (oltre all'accento, già in una
  // colonna dedicata). Vuoti = usa i colori di default in globals.css.
  background_color?: string;
  foreground_color?: string;
  // Opzionali: se assenti (contenuti esistenti pre-esistenti), il valore è
  // "visibile" di default — vedi ognuno dei ?? true nei punti in cui si usano.
  show_services?: boolean;
  show_projects?: boolean;
  show_blog_preview?: boolean;
  show_contact?: boolean;
  // Menu di navigazione dell'header: vive qui (invece che in una colonna
  // dedicata) per evitare una migrazione al database. Se assente/vuoto, il
  // sito usa i link di default già presenti nel codice — vedi Header.tsx.
  nav_links?: NavLink[];
  // Fase A del sistema di blocchi: sezioni extra aggiunte in coda alla
  // homepage (prima dei Contatti). Se assente/vuoto, la homepage resta
  // esattamente come oggi — le sezioni fisse non sono ancora convertite.
  blocks?: HomepageBlock[];
  // Colore di sfondo per ognuna delle sezioni fisse della homepage. Vuoto/
  // assente = sfondo del sito come sempre (nessuna sezione era mai stata
  // colorata singolarmente prima di questa funzione).
  section_colors?: {
    hero?: string;
    services?: string;
    projects?: string;
    blog?: string;
    contact?: string;
  };
}

export interface SiteSettings {
  site_title: string;
  favicon: string | null;
  social_links: Record<string, string>;
  ga4_measurement_id: string | null;
  google_site_verification_code: string | null;
  contact_email: string;
  contact_phone: string;
  accent_color: string;
  home_content: HomeContent;
}

export interface PageSeo {
  // Il sito è un one-pager: "home" è l'unica pagina reale con SEO propria.
  // "servizi"/"contatti" sono solo ancore sulla homepage, non pagine
  // separate — niente SEO indipendente per loro.
  page_key: "home";
  seo_title: string;
  seo_description: string;
  seo_og_image: string | null;
  seo_noindex: boolean;
}

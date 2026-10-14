import type {
  HomeContent,
  HomeSectionKey,
  ProcessStep,
  SectionTheme,
} from "@/lib/types";

/** Valori usati finché i campi non vengono compilati in /admin. */
export const HOME_DEFAULTS = {
  hero_eyebrow: "Web designer — Roma · Grottaglie · Taranto · da remoto",
  process_title: "Come lavoro.",
  process_subtitle: "Dal primo messaggio al giorno dopo il lancio",
  process_steps: [
    {
      title: "Consulenza",
      text: "Mi racconti il progetto e capiamo cosa ti serve davvero, che a volte è meno di quanto pensi.",
      badge: "Gratis",
    },
    {
      title: "Progetto",
      text: "Struttura delle pagine, identità e interfaccia, pensate prima di tutto per il telefono.",
      badge: "",
    },
    {
      title: "Sviluppo",
      text: "Un sito veloce, accessibile e già ottimizzato per Google, che puoi aggiornare da solo.",
      badge: "",
    },
    {
      title: "Online e oltre",
      text: "Lo pubblico, ti mostro come gestirlo e resto disponibile anche dopo la consegna.",
      badge: "",
    },
  ] satisfies ProcessStep[],
  contact_eyebrow: "Prima consulenza gratuita",
  contact_title: "Parliamo.",
  contact_text:
    "Raccontami cosa stai costruendo: ti dico come lo farei, senza impegno.",
  secondary_color: "#ff5b3a",
} as const;

export const DEFAULT_SECTION_THEMES: Record<HomeSectionKey, SectionTheme> = {
  hero: "ink",
  marquee: "secondary",
  projects: "paper",
  services: "ink",
  process: "accent",
  reviews: "paper",
  blog: "ink",
  contact: "secondary",
};

export const SECTION_LABELS: Record<HomeSectionKey, string> = {
  hero: "Apertura",
  marquee: "Banda dei servizi",
  projects: "Progetti",
  services: "Servizi",
  process: "Come lavoro",
  reviews: "Recensioni",
  blog: "Blog",
  contact: "Contatti",
};

export const THEME_LABELS: Record<SectionTheme, string> = {
  ink: "Scuro",
  paper: "Carta (chiaro)",
  accent: "Accento (lavanda)",
  secondary: "Secondo colore (corallo)",
};

export function sectionTheme(
  content: HomeContent,
  key: HomeSectionKey,
): SectionTheme {
  const value = content.section_themes?.[key];
  return value && value in THEME_LABELS ? value : DEFAULT_SECTION_THEMES[key];
}

export function processSteps(content: HomeContent): ProcessStep[] {
  const steps = (content.process_steps ?? []).filter((s) => s.title?.trim());
  return steps.length ? steps : [...HOME_DEFAULTS.process_steps];
}

/** Testo dal contenuto o, se vuoto, il valore predefinito. */
export function homeText(
  content: HomeContent,
  key:
    | "hero_eyebrow"
    | "process_title"
    | "process_subtitle"
    | "contact_eyebrow"
    | "contact_title"
    | "contact_text",
): string {
  return content[key]?.trim() || HOME_DEFAULTS[key];
}

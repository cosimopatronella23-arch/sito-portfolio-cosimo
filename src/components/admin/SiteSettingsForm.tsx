"use client";

import { useActionState, useState } from "react";
import { updateSiteSettings } from "@/lib/actions/settings";
import { ServicesEditor } from "./ServicesEditor";
import { NavLinksEditor } from "./NavLinksEditor";
import { HomepageBlocksEditor } from "./HomepageBlocksEditor";
import { SettingsSection } from "./SettingsSection";
import { contrastRatio } from "@/lib/contrast";
import type { SiteSettings } from "@/lib/types";

const DEFAULT_BACKGROUND = "#0b0a10";
const DEFAULT_FOREGROUND = "#f6f2ea";

const fieldClasses =
  "w-full border-0 border-b border-border-strong bg-transparent px-0 py-2 text-foreground placeholder:text-foreground-muted focus-visible:border-accent focus-visible:outline-none";

export function SiteSettingsForm({ settings }: { settings: SiteSettings }) {
  const [state, formAction, pending] = useActionState(updateSiteSettings, {
    error: null,
  });
  const [accentColor, setAccentColor] = useState(settings.accent_color);
  const [backgroundColor, setBackgroundColor] = useState(
    settings.home_content.background_color || DEFAULT_BACKGROUND,
  );
  const [foregroundColor, setForegroundColor] = useState(
    settings.home_content.foreground_color || DEFAULT_FOREGROUND,
  );
  const ratio = contrastRatio(backgroundColor, foregroundColor);

  const [sectionColors, setSectionColors] = useState(
    settings.home_content.section_colors ?? {},
  );
  const SECTION_LABELS: Record<string, string> = {
    hero: "Intestazione (Hero)",
    services: "Servizi",
    projects: "Progetti",
    blog: "Anteprima blog",
    contact: "Contatti",
  };

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <SettingsSection title="Generale" defaultOpen>
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium">Titolo del sito</span>
          <input
            name="site_title"
            defaultValue={settings.site_title}
            className={fieldClasses}
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium">Email di contatto</span>
          <input
            name="contact_email"
            type="email"
            defaultValue={settings.contact_email}
            className={fieldClasses}
          />
        </label>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {(["instagram", "linkedin", "dribbble"] as const).map((key) => (
            <label key={key} className="flex flex-col gap-2">
              <span className="text-sm font-medium capitalize">{key}</span>
              <input
                name={`social_${key}`}
                defaultValue={settings.social_links[key] ?? ""}
                className={fieldClasses}
              />
            </label>
          ))}
        </div>
      </SettingsSection>

      <SettingsSection
        title="Colori del sito"
        description="Attenzione a sfondo e testo: un contrasto troppo basso rende il sito difficile da leggere. Il colore accento (bottoni, link) è più sicuro da cambiare da solo."
        defaultOpen
      >
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium">Colore accento</span>
          <div className="flex items-center gap-4">
            <input
              type="color"
              value={accentColor}
              onChange={(e) => setAccentColor(e.target.value)}
              className="h-11 w-11 shrink-0 cursor-pointer border border-border-strong bg-transparent"
              aria-label="Colore accento"
            />
            <input
              name="accent_color"
              value={accentColor}
              onChange={(e) => setAccentColor(e.target.value)}
              pattern="#[0-9a-fA-F]{6}"
              title="Formato esadecimale, es. #a78bfa"
              className={fieldClasses}
            />
          </div>
        </label>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium">Colore sfondo</span>
            <div className="flex items-center gap-4">
              <input
                type="color"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="h-11 w-11 shrink-0 cursor-pointer border border-border-strong bg-transparent"
                aria-label="Colore sfondo"
              />
              <input
                name="background_color"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                pattern="#[0-9a-fA-F]{6}"
                className={fieldClasses}
              />
            </div>
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium">Colore testo</span>
            <div className="flex items-center gap-4">
              <input
                type="color"
                value={foregroundColor}
                onChange={(e) => setForegroundColor(e.target.value)}
                className="h-11 w-11 shrink-0 cursor-pointer border border-border-strong bg-transparent"
                aria-label="Colore testo"
              />
              <input
                name="foreground_color"
                value={foregroundColor}
                onChange={(e) => setForegroundColor(e.target.value)}
                pattern="#[0-9a-fA-F]{6}"
                className={fieldClasses}
              />
            </div>
          </label>
        </div>

        <div
          className="flex flex-col gap-2 border border-border-strong p-6"
          style={{ backgroundColor, color: foregroundColor }}
        >
          <span className="text-xs opacity-70">Anteprima sfondo/testo</span>
          <span className="font-display text-xl font-semibold">
            Siti fatti bene, non sfornati in serie.
          </span>
          <span style={{ color: accentColor }} className="text-sm">
            Un dettaglio con il colore accento.
          </span>
        </div>

        {ratio !== null ? (
          ratio < 4.5 ? (
            <p className="text-sm text-warning">
              Contrasto {ratio.toFixed(1)}:1 — sotto la soglia consigliata
              (4.5:1) per il testo normale. Il sito resterà leggibile ma sotto
              lo standard di accessibilità.
            </p>
          ) : (
            <p className="text-sm text-success">
              Contrasto {ratio.toFixed(1)}:1 — buono.
            </p>
          )
        ) : null}
      </SettingsSection>

      <SettingsSection title="Homepage — testi">
        <label className="flex flex-col gap-2">
          <span className="text-sm text-foreground-muted">
            Titolo principale (prima parte, non colorata — vai a capo con invio
            dove vuoi la riga 2)
          </span>
          <textarea
            name="hero_title_main"
            defaultValue={settings.home_content.hero_title_main}
            rows={2}
            className={fieldClasses}
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm text-foreground-muted">
            Titolo principale (parte finale, colorata con l&apos;accento)
          </span>
          <input
            name="hero_title_accent"
            defaultValue={settings.home_content.hero_title_accent}
            className={fieldClasses}
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm text-foreground-muted">Sottotitolo</span>
          <textarea
            name="hero_subtitle"
            defaultValue={settings.home_content.hero_subtitle}
            rows={2}
            className={fieldClasses}
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm text-foreground-muted">
            Citazione (il testo corsivo ruotato)
          </span>
          <textarea
            name="hero_quote"
            defaultValue={settings.home_content.hero_quote}
            rows={2}
            className={fieldClasses}
          />
        </label>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-2">
            <span className="text-sm text-foreground-muted">
              Bottone principale
            </span>
            <input
              name="cta_primary"
              defaultValue={settings.home_content.cta_primary}
              className={fieldClasses}
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-sm text-foreground-muted">
              Bottone secondario
            </span>
            <input
              name="cta_secondary"
              defaultValue={settings.home_content.cta_secondary}
              className={fieldClasses}
            />
          </label>
        </div>

        <label className="flex flex-col gap-2">
          <span className="text-sm text-foreground-muted">
            Titolo sezione &quot;Servizi&quot;
          </span>
          <input
            name="services_title"
            defaultValue={settings.home_content.services_title}
            className={fieldClasses}
          />
        </label>

        <div className="flex flex-col gap-2">
          <span className="text-sm text-foreground-muted">
            Lista servizi (i numeri si aggiornano da soli)
          </span>
          <ServicesEditor
            name="services"
            defaultValue={settings.home_content.services}
          />
        </div>
      </SettingsSection>

      <SettingsSection
        title="Homepage — sezioni visibili"
        description="Disattiva temporaneamente una sezione senza perdere i contenuti. La prima sezione (in alto) non è disattivabile."
      >
        <div className="flex flex-col gap-3">
          {(
            [
              { name: "show_services", label: "Servizi" },
              { name: "show_projects", label: "Progetti" },
              { name: "show_blog_preview", label: "Anteprima blog" },
              { name: "show_contact", label: "Contatti" },
            ] as const
          ).map(({ name, label }) => (
            <label key={name} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name={name}
                defaultChecked={settings.home_content[name] ?? true}
              />
              {label}
            </label>
          ))}
        </div>
      </SettingsSection>

      <SettingsSection
        title="Colori per sezione (homepage)"
        description="Dai a una sezione fissa uno sfondo diverso dal resto del sito (es. per alternare colori come in un moodboard). Il testo di quella sezione si adatta da solo per restare leggibile."
      >
        <div className="flex flex-col gap-4">
          {(["hero", "services", "projects", "blog", "contact"] as const).map(
            (key) => (
              <div key={key} className="flex items-center gap-3 text-sm">
                <span className="w-40 shrink-0 text-foreground-muted">
                  {SECTION_LABELS[key]}
                </span>
                <input
                  type="color"
                  value={sectionColors[key] || "#0b0a10"}
                  onChange={(e) =>
                    setSectionColors((prev) => ({
                      ...prev,
                      [key]: e.target.value,
                    }))
                  }
                  className="h-8 w-8 shrink-0 cursor-pointer border border-border-strong bg-transparent"
                  aria-label={`Colore sfondo — ${SECTION_LABELS[key]}`}
                />
                <input
                  type="hidden"
                  name={`section_color_${key}`}
                  value={sectionColors[key] || ""}
                />
                {sectionColors[key] ? (
                  <button
                    type="button"
                    onClick={() =>
                      setSectionColors((prev) => ({ ...prev, [key]: "" }))
                    }
                    className="text-xs text-foreground-muted hover:text-foreground"
                  >
                    Usa lo sfondo del sito
                  </button>
                ) : (
                  <span className="text-xs text-foreground-muted">
                    Sfondo del sito (predefinito)
                  </span>
                )}
              </div>
            ),
          )}
        </div>
      </SettingsSection>

      <SettingsSection
        title="Blocchi extra homepage"
        description="Sezioni aggiuntive mostrate dopo il blog, prima dei Contatti. Se non ne aggiungi, la homepage resta esattamente com'è oggi."
      >
        <HomepageBlocksEditor
          name="blocks"
          defaultValue={settings.home_content.blocks ?? []}
        />
      </SettingsSection>

      <SettingsSection title="Menu di navigazione">
        <NavLinksEditor
          name="nav_links"
          defaultValue={settings.home_content.nav_links ?? []}
        />
      </SettingsSection>

      <SettingsSection title="Footer">
        <label className="flex flex-col gap-2">
          <span className="text-sm text-foreground-muted">
            Testo sotto il nome, in fondo al sito (vuoto = usa il testo
            attuale)
          </span>
          <textarea
            name="footer_tagline"
            defaultValue={settings.home_content.footer_tagline ?? ""}
            rows={2}
            className={fieldClasses}
          />
        </label>
      </SettingsSection>

      <SettingsSection title="Integrazioni (Google)">
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium">
            Codice di verifica Google Search Console (opzionale)
          </span>
          <input
            name="google_site_verification_code"
            defaultValue={settings.google_site_verification_code ?? ""}
            className={fieldClasses}
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium">
            GA4 Measurement ID (es. G-XXXXXXXXXX)
          </span>
          <input
            name="ga4_measurement_id"
            defaultValue={settings.ga4_measurement_id ?? ""}
            placeholder="G-XXXXXXXXXX"
            pattern="G-[A-Z0-9]+"
            title="Formato: G- seguito da lettere maiuscole e numeri"
            className={fieldClasses}
          />
          <span className="text-xs text-foreground-muted">
            Vuoto = analytics disattivato, nessun banner cookie mostrato.
          </span>
        </label>
      </SettingsSection>

      <div className="flex flex-col gap-3 pt-2">
        {state.error ? (
          <p className="text-sm text-error">{state.error}</p>
        ) : null}
        {state.success ? (
          <p className="text-sm text-success">Salvato.</p>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="w-max bg-foreground px-6 py-3 text-sm font-medium text-background transition-colors hover:bg-accent disabled:opacity-50"
        >
          {pending ? "Salvo..." : "Salva impostazioni"}
        </button>
      </div>
    </form>
  );
}

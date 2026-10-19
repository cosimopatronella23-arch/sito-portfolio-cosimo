"use client";

import { startTransition, useActionState, useRef, useState } from "react";
import { updateSiteSettings } from "@/lib/actions/settings";
import { ServicesEditor } from "./ServicesEditor";
import { NavLinksEditor } from "./NavLinksEditor";
import { HomepageBlocksEditor } from "./HomepageBlocksEditor";
import { SettingsSection } from "./SettingsSection";
import { ProcessStepsEditor } from "./ProcessStepsEditor";
import {
  DEFAULT_SECTION_THEMES,
  HOME_DEFAULTS,
  SECTION_LABELS,
  THEME_LABELS,
  processSteps,
  sectionTheme,
} from "@/lib/homeDefaults";
import type { HomeSectionKey } from "@/lib/types";
import { SettingsTabPanel, useSettingsTab } from "./SettingsTabs";
import { useUnsavedChanges } from "./useUnsavedChanges";
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
  const formRef = useRef<HTMLFormElement>(null);
  const [dirty, setDirty] = useUnsavedChanges(formRef);
  const [lastState, setLastState] = useState(state);
  if (state !== lastState) {
    setLastState(state);
    if (state.success) setDirty(false);
  }
  const tabs = useSettingsTab();

  // Invio senza <form action>: React altrimenti riporterebbe i campi ai
  // valori iniziali dopo il salvataggio.
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(() => formAction(formData));
  }

  // Un campo non valido in una scheda nascosta bloccherebbe il salvataggio
  // senza mostrare dove: si apre la sua scheda.
  function handleInvalid(e: React.FormEvent<HTMLFormElement>) {
    const panel = (e.target as HTMLElement).closest<HTMLElement>(
      "[data-settings-tab]",
    );
    const tab = panel?.dataset.settingsTab;
    if (tab && tabs && tabs.active !== tab) tabs.setActive(tab);
  }
  const [accentColor, setAccentColor] = useState(settings.accent_color);
  const [backgroundColor, setBackgroundColor] = useState(
    settings.home_content.background_color || DEFAULT_BACKGROUND,
  );
  const [foregroundColor, setForegroundColor] = useState(
    settings.home_content.foreground_color || DEFAULT_FOREGROUND,
  );
  const ratio = contrastRatio(backgroundColor, foregroundColor);



  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      onInvalidCapture={handleInvalid}
      className="flex flex-col gap-4"
    >
      <SettingsTabPanel tab="generale">
        <SettingsSection id="sez-generale" title="Generale" defaultOpen>
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium">Titolo del sito</span>
            <input
              name="site_title"
              defaultValue={settings.site_title}
              className={fieldClasses}
            />
          </label>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium">Email di contatto</span>
              <input
                name="contact_email"
                type="email"
                defaultValue={settings.contact_email}
                className={fieldClasses}
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium">
                Telefono (vuoto = non mostrarlo)
              </span>
              <input
                name="contact_phone"
                type="tel"
                placeholder="392 082 4301"
                defaultValue={settings.contact_phone}
                className={fieldClasses}
              />
            </label>
          </div>

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
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium">
              Profilo Google Business (link)
            </span>
            <span className="text-xs text-foreground-muted">
              Collega il sito alla tua scheda su Google e compare nel footer
              come &quot;Recensioni Google&quot;. Vuoto = nessun link.
            </span>
            <input
              name="social_google"
              defaultValue={settings.social_links.google ?? ""}
              className={fieldClasses}
            />
          </label>
        </SettingsSection>

        <SettingsSection
          id="sez-colori"
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
      </SettingsTabPanel>

      <SettingsTabPanel tab="homepage">
        <SettingsSection
          id="sez-homepage-testi"
          title="Homepage — testi"
          defaultOpen
        >
          <label className="flex flex-col gap-2">
            <span className="text-sm text-foreground-muted">
              Riga sopra il titolo (es. ruolo e zone in cui lavori)
            </span>
            <input
              name="hero_eyebrow"
              defaultValue={settings.home_content.hero_eyebrow ?? ""}
              placeholder={HOME_DEFAULTS.hero_eyebrow}
              className={fieldClasses}
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm text-foreground-muted">
              Titolo principale (prima parte, non colorata — vai a capo con
              invio dove vuoi la riga 2)
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

          <label className="flex flex-col gap-2">
            <span className="text-sm text-foreground-muted">
              Introduzione della pagina /servizi (sotto il titolo)
            </span>
            <textarea
              name="services_intro"
              defaultValue={settings.home_content.services_intro ?? ""}
              rows={3}
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
          id="sez-homepage-visibili"
          title="Homepage — sezioni visibili"
          description="Disattiva temporaneamente una sezione senza perdere i contenuti. La prima sezione (in alto) non è disattivabile."
          defaultOpen
        >
          <div className="flex flex-col gap-3">
            {(
              [
                { name: "show_services", label: "Servizi" },
                { name: "show_projects", label: "Progetti" },
                { name: "show_process", label: "Come lavoro" },
                { name: "show_reviews", label: "Recensioni" },
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
          id="sez-progetti"
          title="Homepage — Progetti"
          description="Titolo sopra i progetti in evidenza. Vuoto = testo predefinito."
          defaultOpen
        >
          <label className="flex flex-col gap-2">
            <span className="text-sm text-foreground-muted">Titolo</span>
            <input
              name="projects_title"
              defaultValue={settings.home_content.projects_title ?? ""}
              placeholder={HOME_DEFAULTS.projects_title}
              className={fieldClasses}
            />
          </label>
        </SettingsSection>

        <SettingsSection
          id="sez-come-lavoro"
          title="Homepage — Come lavoro"
          description="I passi del tuo metodo di lavoro, mostrati in homepage. Vuoto = testi predefiniti."
          defaultOpen
        >
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className="text-sm text-foreground-muted">Titolo</span>
              <input
                name="process_title"
                defaultValue={settings.home_content.process_title ?? ""}
                placeholder={HOME_DEFAULTS.process_title}
                className={fieldClasses}
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm text-foreground-muted">Sottotitolo</span>
              <input
                name="process_subtitle"
                defaultValue={settings.home_content.process_subtitle ?? ""}
                placeholder={HOME_DEFAULTS.process_subtitle}
                className={fieldClasses}
              />
            </label>
          </div>
          <ProcessStepsEditor
            name="process_steps"
            defaultValue={processSteps(settings.home_content)}
          />
        </SettingsSection>

        <SettingsSection
          id="sez-invito"
          title="Homepage — Contatti"
          description="I testi della sezione finale con il modulo di contatto. Vuoto = testi predefiniti."
          defaultOpen
        >
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className="text-sm text-foreground-muted">Etichetta</span>
              <input
                name="contact_eyebrow"
                defaultValue={settings.home_content.contact_eyebrow ?? ""}
                placeholder={HOME_DEFAULTS.contact_eyebrow}
                className={fieldClasses}
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm text-foreground-muted">Titolo grande</span>
              <input
                name="contact_title"
                defaultValue={settings.home_content.contact_title ?? ""}
                placeholder={HOME_DEFAULTS.contact_title}
                className={fieldClasses}
              />
            </label>
          </div>
          <label className="flex flex-col gap-2">
            <span className="text-sm text-foreground-muted">Testo</span>
            <textarea
              name="contact_text"
              defaultValue={settings.home_content.contact_text ?? ""}
              placeholder={HOME_DEFAULTS.contact_text}
              rows={2}
              className={fieldClasses}
            />
          </label>
        </SettingsSection>

        <SettingsSection
          id="sez-stile-sezioni"
          title="Homepage — stile delle sezioni"
          description="Lo sfondo di ogni sezione. Testo, bordi e pulsanti si adattano da soli per restare leggibili."
          defaultOpen
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {(Object.keys(DEFAULT_SECTION_THEMES) as HomeSectionKey[]).map((key) => (
              <label key={key} className="flex flex-col gap-2 text-sm">
                {SECTION_LABELS[key]}
                <select
                  name={`section_theme_${key}`}
                  defaultValue={sectionTheme(settings.home_content, key)}
                  className="min-h-11 border border-border-strong bg-background px-3"
                >
                  {Object.entries(THEME_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>
        </SettingsSection>

        <SettingsSection
          id="sez-blocchi"
          title="Blocchi extra homepage"
          description="Sezioni aggiuntive mostrate dopo il blog, prima dei Contatti. Se non ne aggiungi, la homepage resta esattamente com'è oggi."
          defaultOpen
        >
          <HomepageBlocksEditor
            name="blocks"
            defaultValue={settings.home_content.blocks ?? []}
          />
        </SettingsSection>
      </SettingsTabPanel>

      <SettingsTabPanel tab="menu">
        <SettingsSection id="sez-menu" title="Menu di navigazione" defaultOpen>
          <NavLinksEditor
            name="nav_links"
            defaultValue={settings.home_content.nav_links ?? []}
          />
        </SettingsSection>

        <SettingsSection id="sez-footer" title="Footer" defaultOpen>
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
          <label className="flex flex-col gap-2">
            <span className="text-sm text-foreground-muted">
              Partita IVA (compare in fondo a ogni pagina accanto al nome)
            </span>
            <input
              name="vat_number"
              defaultValue={settings.home_content.vat_number ?? ""}
              inputMode="numeric"
              pattern="(IT)?\s*[0-9 ]{11,14}"
              title="11 cifre, es. 01234567890"
              className={fieldClasses}
            />
          </label>
        </SettingsSection>
      </SettingsTabPanel>

      <SettingsTabPanel tab="google">
        <SettingsSection
          id="sez-integrazioni"
          title="Integrazioni (Google)"
          defaultOpen
        >
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
      </SettingsTabPanel>

      {/* Spazio extra in fondo così l'ultima sezione non resta nascosta
          dietro la barra di salvataggio fissa qui sotto. */}
      <div className="h-16" aria-hidden="true" />

      <div
        hidden={tabs?.active === "seo"}
        className="sticky bottom-0 z-20 flex flex-wrap items-center gap-4 border-t border-border-strong bg-background/95 py-4 backdrop-blur"
      >
        <button
          type="submit"
          disabled={pending}
          className="w-max bg-foreground px-6 py-3 text-sm font-medium text-background transition-colors hover:bg-accent disabled:opacity-50"
        >
          {pending ? "Salvo..." : "Salva impostazioni"}
        </button>
        {state.error ? (
          <p className="text-sm text-error">{state.error}</p>
        ) : null}
        <p role="status" aria-live="polite" className="text-sm">
          {pending ? null : dirty ? (
            <span className="text-warning">Modifiche non salvate</span>
          ) : state.success ? (
            <span className="text-success">Salvato.</span>
          ) : null}
        </p>
      </div>
    </form>
  );
}

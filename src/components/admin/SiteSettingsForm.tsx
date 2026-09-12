"use client";

import { useActionState, useState } from "react";
import { updateSiteSettings } from "@/lib/actions/settings";
import { ServicesEditor } from "./ServicesEditor";
import { NavLinksEditor } from "./NavLinksEditor";
import type { SiteSettings } from "@/lib/types";

const fieldClasses =
  "w-full border-0 border-b border-border-strong bg-transparent px-0 py-2 text-foreground placeholder:text-foreground-muted focus-visible:border-accent focus-visible:outline-none";

export function SiteSettingsForm({ settings }: { settings: SiteSettings }) {
  const [state, formAction, pending] = useActionState(updateSiteSettings, {
    error: null,
  });
  const [accentColor, setAccentColor] = useState(settings.accent_color);

  return (
    <form action={formAction} className="flex flex-col gap-6">
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

      <fieldset className="flex flex-col gap-4 border border-border-strong p-4">
        <legend className="px-2 text-sm font-medium">
          Colore accento del sito
        </legend>
        <p className="text-sm text-foreground-muted">
          Cambia il colore usato per link, bottoni e dettagli in evidenza. Non
          tocca lo sfondo scuro né il resto della palette.
        </p>
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
      </fieldset>

      <fieldset className="flex flex-col gap-4 border border-border-strong p-4">
        <legend className="px-2 text-sm font-medium">Homepage</legend>

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
      </fieldset>

      <fieldset className="flex flex-col gap-3 border border-border-strong p-4">
        <legend className="px-2 text-sm font-medium">
          Sezioni visibili in homepage
        </legend>
        <p className="text-sm text-foreground-muted">
          Disattiva temporaneamente una sezione senza perdere i contenuti. La
          prima sezione (in alto) non è disattivabile.
        </p>
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
      </fieldset>

      <fieldset className="flex flex-col gap-4 border border-border-strong p-4">
        <legend className="px-2 text-sm font-medium">Footer</legend>
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
      </fieldset>

      <fieldset className="flex flex-col gap-4 border border-border-strong p-4">
        <legend className="px-2 text-sm font-medium">
          Menu di navigazione
        </legend>
        <NavLinksEditor
          name="nav_links"
          defaultValue={settings.home_content.nav_links ?? []}
        />
      </fieldset>

      {state.error ? <p className="text-sm text-error">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-success">Salvato.</p> : null}

      <button
        type="submit"
        disabled={pending}
        className="w-max bg-foreground px-6 py-3 text-sm font-medium text-background transition-colors hover:bg-accent disabled:opacity-50"
      >
        {pending ? "Salvo..." : "Salva impostazioni"}
      </button>
    </form>
  );
}

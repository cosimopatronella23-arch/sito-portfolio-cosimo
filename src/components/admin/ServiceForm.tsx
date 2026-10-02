"use client";

import { useActionState, useState } from "react";
import { createService, updateService } from "@/lib/actions/services";
import { ImageUploader } from "./ImageUploader";
import { ContentBlocksEditor } from "./ContentBlocksEditor";
import { FaqEditor } from "./FaqEditor";
import { SerpPreview } from "./SerpPreview";
import { SettingsSection } from "./SettingsSection";
import { SITE_URL } from "@/lib/seo";
import type { ServicePage } from "@/lib/types";

const fieldClasses =
  "w-full border-0 border-b border-border-strong bg-transparent px-0 py-2 text-foreground placeholder:text-foreground-muted focus-visible:border-accent focus-visible:outline-none";

export function ServiceForm({
  service,
  projects,
}: {
  service?: ServicePage;
  projects: { slug: string; title: string }[];
}) {
  const action = service ? updateService.bind(null, service.id) : createService;
  const [state, formAction, pending] = useActionState(action, { error: null });
  const [slug, setSlug] = useState(service?.slug ?? "");
  const [seoTitle, setSeoTitle] = useState(service?.seo_title ?? "");
  const [seoDescription, setSeoDescription] = useState(
    service?.seo_description ?? "",
  );
  const [excerpt, setExcerpt] = useState(service?.excerpt ?? "");

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <SettingsSection id="sez-dati-base" title="Dati base" defaultOpen>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium">
              Titolo (es. Realizzazione siti web)
            </span>
            <input
              name="title"
              defaultValue={service?.title}
              required
              className={fieldClasses}
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium">
              Slug (indirizzo: /servizi/...)
            </span>
            <input
              name="slug"
              defaultValue={service?.slug}
              onChange={(e) => setSlug(e.target.value)}
              required
              pattern="[a-z0-9\-]+"
              title="Solo minuscole, numeri e trattini"
              className={fieldClasses}
            />
          </label>
        </div>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium">
            Descrizione breve (nella pagina /servizi e su Google se la meta
            description è vuota)
          </span>
          <textarea
            name="excerpt"
            defaultValue={service?.excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={2}
            className={fieldClasses}
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium">
            Introduzione (il paragrafo sotto il titolo)
          </span>
          <textarea
            name="intro"
            defaultValue={service?.intro}
            rows={4}
            className={fieldClasses}
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium">
            Zone servite (separate da virgola)
          </span>
          <input
            name="area_served"
            defaultValue={service?.area_served}
            placeholder="Roma, Grottaglie, Taranto"
            className={fieldClasses}
          />
        </label>

        <div className="flex flex-wrap items-center gap-8">
          <label className="flex flex-col gap-2 text-sm">
            Stato
            <select
              name="status"
              defaultValue={service?.status ?? "draft"}
              className="border border-border-strong bg-transparent px-3 py-2"
            >
              <option value="draft">Bozza</option>
              <option value="published">Pubblicato</option>
            </select>
          </label>
          <label className="flex flex-col gap-2 text-sm">
            Ordine (i numeri più bassi vengono mostrati prima)
            <input
              name="sort_order"
              type="number"
              defaultValue={service?.sort_order ?? 0}
              className={fieldClasses}
            />
          </label>
        </div>
      </SettingsSection>

      <SettingsSection
        id="sez-contenuto"
        title="Contenuto"
        description="Le sezioni della pagina: cosa include, come lavori, per chi è..."
      >
        <ContentBlocksEditor
          name="content_blocks"
          defaultValue={service?.content_blocks}
        />
      </SettingsSection>

      <SettingsSection id="sez-faq" title="Domande frequenti">
        <FaqEditor name="faqs" defaultValue={service?.faqs} />
      </SettingsSection>

      <SettingsSection
        id="sez-progetti"
        title="Progetti collegati"
        description="Mostrati come esempi in fondo alla pagina. Sulla pagina di ogni progetto collegato comparirà anche il link a questo servizio."
      >
        <div className="flex flex-col gap-3">
          {projects.length === 0 ? (
            <p className="text-sm text-foreground-muted">
              Nessun progetto pubblicato.
            </p>
          ) : null}
          {projects.map((p) => (
            <label key={p.slug} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="related_project_slugs"
                value={p.slug}
                defaultChecked={service?.related_project_slugs.includes(p.slug)}
              />
              {p.title}
            </label>
          ))}
        </div>
      </SettingsSection>

      <SettingsSection id="sez-seo" title="SEO">
        <label className="flex flex-col gap-2">
          <span className="text-sm text-foreground-muted">
            Titolo SEO (vuoto = usa il titolo; meglio sotto i 42 caratteri)
          </span>
          <input
            name="seo_title"
            defaultValue={service?.seo_title ?? ""}
            onChange={(e) => setSeoTitle(e.target.value)}
            className={fieldClasses}
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-sm text-foreground-muted">
            Meta description (vuoto = usa la descrizione breve; massimo 155
            caratteri)
          </span>
          <textarea
            name="seo_description"
            defaultValue={service?.seo_description ?? ""}
            onChange={(e) => setSeoDescription(e.target.value)}
            rows={2}
            className={fieldClasses}
          />
        </label>
        <ImageUploader
          name="seo_og_image"
          label="Immagine di condivisione social (opzionale)"
          defaultValue={service?.seo_og_image}
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="seo_noindex"
            defaultChecked={service?.seo_noindex}
          />
          Nascondi dai motori di ricerca (noindex)
        </label>

        <SerpPreview
          url={`${SITE_URL}/servizi/${slug || "slug-servizio"}`}
          title={seoTitle || service?.title || ""}
          description={seoDescription || excerpt}
        />
      </SettingsSection>

      {state.error ? <p className="text-sm text-error">{state.error}</p> : null}

      <div className="sticky bottom-0 flex flex-wrap items-center gap-4 border-t border-border-strong bg-background py-4">
        <button
          type="submit"
          disabled={pending}
          className="w-max bg-foreground px-6 py-3 text-sm font-medium text-background transition-colors hover:bg-accent disabled:opacity-50"
        >
          {pending ? "Salvo..." : "Salva servizio"}
        </button>
        {service ? (
          <a
            href={`/admin/anteprima/servizi/${service.id}`}
            target="_blank"
            rel="noopener"
            className="text-sm text-foreground-muted underline underline-offset-4 hover:text-foreground"
          >
            Anteprima (ultima versione salvata)
          </a>
        ) : null}
      </div>
    </form>
  );
}

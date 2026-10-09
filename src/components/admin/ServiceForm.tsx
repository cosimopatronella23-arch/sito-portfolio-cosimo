"use client";

import { useState } from "react";
import { createService, updateService } from "@/lib/actions/services";
import { ImageUploader } from "./ImageUploader";
import { ContentBlocksEditor } from "./ContentBlocksEditor";
import { FaqEditor } from "./FaqEditor";
import { SerpPreview } from "./SerpPreview";
import { SettingsSection } from "./SettingsSection";
import { EditorForm } from "./EditorForm";
import { SeoChecklist } from "./SeoChecklist";
import { AdminIcon } from "./AdminIcons";
import { SITE_URL } from "@/lib/seo";
import type { ServicePage } from "@/lib/types";

const fieldClasses =
  "w-full border-0 border-b border-border-strong bg-transparent px-0 py-2 text-foreground placeholder:text-foreground-muted focus-visible:border-accent focus-visible:outline-none";

export function ServiceForm({
  service,
  projects,
  created = false,
}: {
  service?: ServicePage;
  projects: { slug: string; title: string }[];
  created?: boolean;
}) {
  const action = service ? updateService.bind(null, service.id) : createService;
  const [slug, setSlug] = useState(service?.slug ?? "");
  const [seoTitle, setSeoTitle] = useState(service?.seo_title ?? "");
  const [seoDescription, setSeoDescription] = useState(
    service?.seo_description ?? "",
  );
  const [excerpt, setExcerpt] = useState(service?.excerpt ?? "");

  return (
    <EditorForm
      action={action}
      submitLabel={service ? "Salva servizio" : "Crea servizio"}
      created={created}
      sidebar={
        <>
          <label className="flex flex-col gap-2 text-sm">
            Stato
            <select
              name="status"
              defaultValue={service?.status ?? "draft"}
              className="min-h-11 border border-border-strong bg-background px-3"
            >
              <option value="draft">Bozza (non visibile)</option>
              <option value="published">Pubblicato</option>
            </select>
          </label>
          <label className="flex flex-col gap-2 text-sm">
            Ordine
            <span className="text-xs text-foreground-muted">
              I numeri più bassi vengono mostrati prima.
            </span>
            <input
              name="sort_order"
              type="number"
              defaultValue={service?.sort_order ?? 0}
              className={fieldClasses}
            />
          </label>
        </>
      }
      sidebarFooter={
        <>
          {service ? (
            <div className="flex flex-col gap-2 text-sm">
              <a
                href={`/admin/anteprima/servizi/${service.id}`}
                target="_blank"
                rel="noopener"
                className="flex items-center gap-2 text-foreground-muted hover:text-foreground"
              >
                <AdminIcon name="eye" className="h-4 w-4" />
                Anteprima (ultima versione salvata)
              </a>
              {service.status === "published" ? (
                <a
                  href={`/servizi/${service.slug}`}
                  target="_blank"
                  rel="noopener"
                  className="flex items-center gap-2 text-foreground-muted hover:text-foreground"
                >
                  <AdminIcon name="external" className="h-4 w-4" />
                  Vedi online
                </a>
              ) : null}
            </div>
          ) : null}
          <SeoChecklist
            titleFields={["seo_title", "title"]}
            descriptionFields={["seo_description", "excerpt"]}
            imageFields={["seo_og_image"]}
            contentField="content_blocks"
          />
        </>
      }
    >
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
    </EditorForm>
  );
}

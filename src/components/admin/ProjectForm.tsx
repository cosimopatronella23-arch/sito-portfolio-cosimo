"use client";

import { useActionState } from "react";
import { createProject, updateProject } from "@/lib/actions/projects";
import { ImageUploader } from "./ImageUploader";
import { ContentBlocksEditor } from "./ContentBlocksEditor";
import type { Project } from "@/lib/types";

const fieldClasses =
  "w-full border-0 border-b border-border-strong bg-transparent px-0 py-2 text-foreground placeholder:text-foreground-muted focus-visible:border-accent focus-visible:outline-none";

export function ProjectForm({ project }: { project?: Project }) {
  const action = project ? updateProject.bind(null, project.id) : createProject;
  const [state, formAction, pending] = useActionState(action, {
    error: null,
  });

  return (
    <form action={formAction} className="flex flex-col gap-10">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium">Titolo</span>
          <input
            name="title"
            defaultValue={project?.title}
            required
            className={fieldClasses}
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium">Slug (URL)</span>
          <input
            name="slug"
            defaultValue={project?.slug}
            required
            pattern="[a-z0-9-]+"
            title="Solo minuscole, numeri e trattini"
            className={fieldClasses}
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium">Categoria</span>
          <input
            name="category"
            defaultValue={project?.category}
            className={fieldClasses}
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium">Cliente</span>
          <input
            name="client"
            defaultValue={project?.client}
            className={fieldClasses}
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium">Anno</span>
          <input
            name="year"
            type="number"
            defaultValue={project?.year ?? new Date().getFullYear()}
            className={fieldClasses}
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium">Link esterno (opzionale)</span>
          <input
            name="external_link"
            defaultValue={project?.external_link ?? ""}
            className={fieldClasses}
          />
        </label>
      </div>

      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium">
          Descrizione breve (per la card)
        </span>
        <textarea
          name="short_description"
          defaultValue={project?.short_description}
          rows={2}
          className={fieldClasses}
        />
      </label>

      <ImageUploader
        name="cover_image"
        label="Immagine di copertina"
        defaultValue={project?.cover_image}
      />

      <div className="flex flex-col gap-3">
        <span className="text-sm font-medium">Sezioni del progetto</span>
        <ContentBlocksEditor
          name="content_blocks"
          defaultValue={project?.content_blocks}
        />
      </div>

      <div className="flex flex-wrap items-center gap-8">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="featured"
            defaultChecked={project?.featured}
          />
          In evidenza
        </label>
        <label className="flex flex-col gap-2 text-sm">
          Stato
          <select
            name="status"
            defaultValue={project?.status ?? "draft"}
            className="border border-border-strong bg-transparent px-3 py-2"
          >
            <option value="draft">Bozza</option>
            <option value="published">Pubblicato</option>
          </select>
        </label>
      </div>

      <fieldset className="flex flex-col gap-4 border border-border-strong p-4">
        <legend className="px-2 text-sm font-medium">SEO</legend>
        <label className="flex flex-col gap-2">
          <span className="text-sm text-foreground-muted">
            Titolo SEO (vuoto = usa il titolo)
          </span>
          <input
            name="seo_title"
            defaultValue={project?.seo_title ?? ""}
            className={fieldClasses}
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-sm text-foreground-muted">
            Meta description (vuoto = usa la descrizione breve)
          </span>
          <textarea
            name="seo_description"
            defaultValue={project?.seo_description ?? ""}
            rows={2}
            className={fieldClasses}
          />
        </label>
        <ImageUploader
          name="seo_og_image"
          label="Immagine di condivisione social (opzionale)"
          defaultValue={project?.seo_og_image}
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="seo_noindex"
            defaultChecked={project?.seo_noindex}
          />
          Nascondi dai motori di ricerca (noindex)
        </label>
      </fieldset>

      {state.error ? <p className="text-sm text-error">{state.error}</p> : null}

      <button
        type="submit"
        disabled={pending}
        className="w-max bg-foreground px-6 py-3 text-sm font-medium text-background transition-colors hover:bg-accent disabled:opacity-50"
      >
        {pending ? "Salvo..." : "Salva progetto"}
      </button>
    </form>
  );
}

"use client";

import { useActionState } from "react";
import { updatePageSeo } from "@/lib/actions/settings";
import { ImageUploader } from "./ImageUploader";
import type { PageSeo } from "@/lib/types";

const fieldClasses =
  "w-full border-0 border-b border-border-strong bg-transparent px-0 py-2 text-foreground placeholder:text-foreground-muted focus-visible:border-accent focus-visible:outline-none";

export function PageSeoForm({
  pageKey,
  seo,
}: {
  pageKey: PageSeo["page_key"];
  seo: PageSeo | null;
}) {
  const action = updatePageSeo.bind(null, pageKey);
  const [state, formAction, pending] = useActionState(action, {
    error: null,
  });

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium">Titolo SEO</span>
        <input
          name="seo_title"
          defaultValue={seo?.seo_title ?? ""}
          className={fieldClasses}
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium">Meta description</span>
        <textarea
          name="seo_description"
          defaultValue={seo?.seo_description ?? ""}
          rows={2}
          className={fieldClasses}
        />
      </label>

      <ImageUploader
        name="seo_og_image"
        label="Immagine di condivisione social"
        defaultValue={seo?.seo_og_image}
      />

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="seo_noindex"
          defaultChecked={seo?.seo_noindex}
        />
        Nascondi dai motori di ricerca (noindex)
      </label>

      {state.error ? <p className="text-sm text-error">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-success">Salvato.</p> : null}

      <button
        type="submit"
        disabled={pending}
        className="w-max bg-foreground px-6 py-3 text-sm font-medium text-background transition-colors hover:bg-accent disabled:opacity-50"
      >
        {pending ? "Salvo..." : "Salva SEO"}
      </button>
    </form>
  );
}

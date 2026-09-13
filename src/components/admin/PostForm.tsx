"use client";

import { useActionState, useState } from "react";
import { createPost, updatePost } from "@/lib/actions/blog";
import { ImageUploader } from "./ImageUploader";
import { RichTextEditor } from "./RichTextEditor";
import { SerpPreview } from "./SerpPreview";
import { SettingsSection } from "./SettingsSection";
import { SITE_URL } from "@/lib/seo";
import type { BlogPost } from "@/lib/types";

const fieldClasses =
  "w-full border-0 border-b border-border-strong bg-transparent px-0 py-2 text-foreground placeholder:text-foreground-muted focus-visible:border-accent focus-visible:outline-none";

function toDateInputValue(iso?: string) {
  if (!iso) return new Date().toISOString().slice(0, 10);
  return new Date(iso).toISOString().slice(0, 10);
}

export function PostForm({ post }: { post?: BlogPost }) {
  const action = post ? updatePost.bind(null, post.id) : createPost;
  const [state, formAction, pending] = useActionState(action, {
    error: null,
  });
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [seoTitle, setSeoTitle] = useState(post?.seo_title ?? "");
  const [seoDescription, setSeoDescription] = useState(
    post?.seo_description ?? "",
  );

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <SettingsSection id="sez-dati-base" title="Dati base" defaultOpen>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium">Titolo</span>
            <input
              name="title"
              defaultValue={post?.title}
              required
              className={fieldClasses}
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium">Slug (URL)</span>
            <input
              name="slug"
              defaultValue={post?.slug}
              onChange={(e) => setSlug(e.target.value)}
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
              defaultValue={post?.category}
              className={fieldClasses}
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium">Data pubblicazione</span>
            <input
              name="published_at"
              type="date"
              defaultValue={toDateInputValue(post?.published_at)}
              className={fieldClasses}
            />
          </label>
        </div>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium">
            Riassunto (per le anteprime)
          </span>
          <textarea
            name="excerpt"
            defaultValue={post?.excerpt}
            rows={2}
            className={fieldClasses}
          />
        </label>

        <label className="flex flex-col gap-2 text-sm">
          Stato
          <select
            name="status"
            defaultValue={post?.status ?? "draft"}
            className="w-max border border-border-strong bg-transparent px-3 py-2"
          >
            <option value="draft">Bozza</option>
            <option value="published">Pubblicato</option>
          </select>
        </label>
      </SettingsSection>

      <SettingsSection id="sez-media" title="Media">
        <ImageUploader
          name="cover_image"
          label="Immagine di copertina"
          defaultValue={post?.cover_image}
        />
      </SettingsSection>

      <SettingsSection id="sez-contenuto" title="Contenuto">
        <RichTextEditor name="content" defaultValue={post?.content} />
      </SettingsSection>

      <SettingsSection id="sez-seo" title="SEO">
        <label className="flex flex-col gap-2">
          <span className="text-sm text-foreground-muted">
            Titolo SEO (vuoto = usa il titolo)
          </span>
          <input
            name="seo_title"
            defaultValue={post?.seo_title ?? ""}
            onChange={(e) => setSeoTitle(e.target.value)}
            className={fieldClasses}
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-sm text-foreground-muted">
            Meta description (vuoto = usa il riassunto)
          </span>
          <textarea
            name="seo_description"
            defaultValue={post?.seo_description ?? ""}
            onChange={(e) => setSeoDescription(e.target.value)}
            rows={2}
            className={fieldClasses}
          />
        </label>
        <ImageUploader
          name="seo_og_image"
          label="Immagine di condivisione social (opzionale)"
          defaultValue={post?.seo_og_image}
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="seo_noindex"
            defaultChecked={post?.seo_noindex}
          />
          Nascondi dai motori di ricerca (noindex)
        </label>

        <SerpPreview
          url={`${SITE_URL}/blog/${slug || "slug-articolo"}`}
          title={seoTitle || post?.title || ""}
          description={seoDescription || post?.excerpt || ""}
        />
      </SettingsSection>

      {state.error ? <p className="text-sm text-error">{state.error}</p> : null}

      <div className="sticky bottom-0 flex flex-wrap items-center gap-4 border-t border-border-strong bg-background py-4">
        <button
          type="submit"
          disabled={pending}
          className="w-max bg-foreground px-6 py-3 text-sm font-medium text-background transition-colors hover:bg-accent disabled:opacity-50"
        >
          {pending ? "Salvo..." : "Salva articolo"}
        </button>
      </div>
    </form>
  );
}

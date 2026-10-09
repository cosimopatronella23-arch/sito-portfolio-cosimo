"use client";

import { useState } from "react";
import { createPost, updatePost } from "@/lib/actions/blog";
import { ImageUploader } from "./ImageUploader";
import { RichTextEditor } from "./RichTextEditor";
import { SerpPreview } from "./SerpPreview";
import { SettingsSection } from "./SettingsSection";
import { EditorForm } from "./EditorForm";
import { SeoChecklist } from "./SeoChecklist";
import { AdminIcon } from "./AdminIcons";
import { SITE_URL } from "@/lib/seo";
import type { BlogPost } from "@/lib/types";

const fieldClasses =
  "w-full border-0 border-b border-border-strong bg-transparent px-0 py-2 text-foreground placeholder:text-foreground-muted focus-visible:border-accent focus-visible:outline-none";

function toDateInputValue(iso?: string) {
  if (!iso) return new Date().toISOString().slice(0, 10);
  return new Date(iso).toISOString().slice(0, 10);
}

export function PostForm({
  post,
  created = false,
}: {
  post?: BlogPost;
  created?: boolean;
}) {
  const action = post ? updatePost.bind(null, post.id) : createPost;
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [seoTitle, setSeoTitle] = useState(post?.seo_title ?? "");
  const [seoDescription, setSeoDescription] = useState(
    post?.seo_description ?? "",
  );

  return (
    <EditorForm
      action={action}
      submitLabel={post ? "Salva articolo" : "Crea articolo"}
      created={created}
      sidebar={
        <>
          <label className="flex flex-col gap-2 text-sm">
            Stato
            <select
              name="status"
              defaultValue={post?.status ?? "draft"}
              className="min-h-11 border border-border-strong bg-background px-3"
            >
              <option value="draft">Bozza (non visibile)</option>
              <option value="published">Pubblicato</option>
            </select>
          </label>
          <label className="flex flex-col gap-2 text-sm">
            Data pubblicazione
            <input
              name="published_at"
              type="date"
              defaultValue={toDateInputValue(post?.published_at)}
              className={fieldClasses}
            />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            Ordine
            <span className="text-xs text-foreground-muted">
              I numeri più bassi vengono mostrati prima.
            </span>
            <input
              name="sort_order"
              type="number"
              defaultValue={post?.sort_order ?? 0}
              className={fieldClasses}
            />
          </label>
        </>
      }
      sidebarFooter={
        <>
          {post ? (
            <div className="flex flex-col gap-2 text-sm">
              <a
                href={`/admin/anteprima/blog/${post.id}`}
                target="_blank"
                rel="noopener"
                className="flex items-center gap-2 text-foreground-muted hover:text-foreground"
              >
                <AdminIcon name="eye" className="h-4 w-4" />
                Anteprima (ultima versione salvata)
              </a>
              {post.status === "published" ? (
                <a
                  href={`/blog/${post.slug}`}
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
            imageFields={["seo_og_image", "cover_image"]}
            contentField="content"
          />
        </>
      }
    >
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
              pattern="[a-z0-9\-]+"
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
    </EditorForm>
  );
}

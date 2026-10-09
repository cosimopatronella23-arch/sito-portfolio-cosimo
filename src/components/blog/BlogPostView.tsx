import Link from "next/link";
import { CoverImage } from "@/components/ui/CoverImage";
import { AnimatedText } from "@/components/ui/AnimatedText";
import { blogPostJsonLd } from "@/lib/seo";
import { normalizeHeadings } from "@/lib/html";
import type { BlogPost } from "@/lib/types";

const dateFormatter = new Intl.DateTimeFormat("it-IT", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

/**
 * Pagina di un articolo. Usata dalla pagina pubblica e dall'anteprima in
 * /admin, così la bozza si vede esattamente come apparirà online.
 */
export function BlogPostView({ post }: { post: BlogPost }) {
  return (
    <article className="container-px py-20 sm:py-28">
      {/* Colonna unica per testo E immagine: prima l'immagine di copertina
          era a piena larghezza mentre il testo restava stretto, uno squilibrio
          che la faceva sembrare sproporzionata rispetto al resto. Ora
          condividono la stessa larghezza, come un vero editoriale. */}
      <div className="mx-auto flex max-w-3xl flex-col gap-10">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(blogPostJsonLd(post)),
          }}
        />

        <Link
          href="/blog"
          className="w-max text-sm text-foreground-muted hover:text-foreground"
        >
          ← Tutti gli articoli
        </Link>

        <header className="flex flex-col gap-5">
          <p className="text-xs font-medium tracking-wide text-accent uppercase">
            {post.category}
          </p>
          <h1 className="font-display text-[clamp(2.25rem,6vw,4.5rem)] leading-[1.02] font-semibold tracking-tight text-balance">
            <AnimatedText text={post.title} />
          </h1>
          <time
            dateTime={post.published_at}
            className="text-sm text-foreground-muted"
          >
            {dateFormatter.format(new Date(post.published_at))}
          </time>
        </header>

        {post.cover_image ? (
          <div className="aspect-[3/2] w-full overflow-hidden border border-border-strong">
            <CoverImage
              src={post.cover_image}
              alt={post.title}
              priority
              className="h-full w-full"
            />
          </div>
        ) : null}

        <div
          className="prose-editor text-base leading-relaxed text-foreground-muted"
          dangerouslySetInnerHTML={{ __html: normalizeHeadings(post.content) }}
        />
      </div>
    </article>
  );
}

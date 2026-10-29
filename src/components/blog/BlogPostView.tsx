import Link from "next/link";
import { AnimatedText } from "@/components/ui/AnimatedText";
import { blogPostJsonLd } from "@/lib/seo";
import { normalizeHeadings } from "@/lib/html";
import { ClosingCta } from "@/components/sections/ClosingCta";
import type { BlogPost } from "@/lib/types";

const dateFormatter = new Intl.DateTimeFormat("it-IT", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

// Circa 200 parole al minuto, senza contare i tag HTML.
function readingMinutes(html: string) {
  const words = html.replace(/<[^>]*>/g, " ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/**
 * Pagina di un articolo. Usata dalla pagina pubblica e dall'anteprima in
 * /admin, così la bozza si vede esattamente come apparirà online.
 * Apertura scura come il resto del sito, lettura su carta (più riposante
 * per i testi lunghi) e chiusura con il contatto.
 */
export function BlogPostView({
  post,
  contactPhone,
}: {
  post: BlogPost;
  contactPhone?: string;
}) {
  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(blogPostJsonLd(post)),
        }}
      />

      <header className="theme-ink container-px pt-10 pb-14 sm:pt-14 sm:pb-20">
        <div className="mx-auto flex max-w-3xl flex-col gap-8">
          <Link
            href="/blog"
            data-cursor="link"
            className="group flex w-max items-center gap-2 text-xs font-semibold tracking-[0.12em] text-foreground-muted uppercase transition-colors hover:text-foreground"
          >
            <span aria-hidden="true" className="transition-transform duration-300 group-hover:-translate-x-1">
              ←
            </span>
            Tutti gli articoli
          </Link>

          <div className="flex flex-col gap-6">
            {post.category ? (
              <p className="w-max bg-accent px-3 py-1.5 text-xs font-semibold tracking-[0.1em] text-ink uppercase">
                {post.category}
              </p>
            ) : null}
            <h1
              className={`font-display font-bold tracking-[-0.04em] text-balance ${
                post.title.length > 60
                  ? "text-[clamp(2.25rem,4.2vw,3.75rem)] leading-[1.02]"
                  : "text-[clamp(2.5rem,6vw,5rem)] leading-[0.95]"
              }`}
            >
              <AnimatedText text={post.title} />
            </h1>
            <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-foreground-muted">
              <time dateTime={post.published_at}>
                {dateFormatter.format(new Date(post.published_at))}
              </time>
              <span aria-hidden="true" className="size-1.5 rounded-full bg-accent" />
              <span>{readingMinutes(post.content)} min di lettura</span>
            </p>
          </div>
        </div>
      </header>

      <div className="theme-paper container-px pt-14 pb-20 sm:pt-20 sm:pb-28">
        {/* Niente copertina: il titolo in apertura basta, e le immagini vere
            (schermate di progetti) stanno dentro il testo quando servono. */}
        <div className="mx-auto flex max-w-3xl flex-col gap-12">

          <div
            className="prose-editor text-base leading-relaxed text-foreground-muted sm:text-lg"
            dangerouslySetInnerHTML={{ __html: normalizeHeadings(post.content) }}
          />
        </div>
      </div>

      <ClosingCta
        title="Ti serve una mano?"
        text="Se stai pensando a un sito o a un progetto grafico, scrivimi: la prima consulenza è gratuita e senza impegno."
        contactPhone={contactPhone}
      />
    </article>
  );
}

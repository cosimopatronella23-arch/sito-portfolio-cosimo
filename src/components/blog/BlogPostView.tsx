import Link from "next/link";
import { AnimatedText } from "@/components/ui/AnimatedText";
import { blogPostJsonLd } from "@/lib/seo";
import { normalizeHeadings } from "@/lib/html";
import { ClosingCta } from "@/components/sections/ClosingCta";
import { BlogCard } from "@/components/blog/BlogCard";
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

const dayKey = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Rome" });

// "Aggiornato il..." solo se l'articolo è stato salvato in un giorno
// successivo a quello di pubblicazione: è la stessa data che il sito già
// comunica a Google (dateModified e sitemap).
function revisedDate(post: BlogPost): Date | null {
  if (!post.updated_at || !post.published_at) return null;
  const updated = new Date(post.updated_at);
  const published = new Date(post.published_at);
  return dayKey.format(updated) > dayKey.format(published) ? updated : null;
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
  related = [],
}: {
  post: BlogPost;
  contactPhone?: string;
  /** Articoli da proporre in fondo ("Continua a leggere"). */
  related?: BlogPost[];
}) {
  const revised = revisedDate(post);
  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(blogPostJsonLd(post)),
        }}
      />

      <header className="theme-ink container-px pt-[120px] pb-14 sm:pt-[136px] sm:pb-20">
        <div className="mx-auto flex max-w-3xl flex-col gap-8">
          <Link
            href="/blog"
            data-cursor="link"
            className="group -my-3 flex w-max items-center gap-2 py-3 text-xs font-semibold tracking-[0.12em] text-foreground-muted uppercase transition-colors hover:text-foreground"
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
              {revised ? (
                <>
                  <span>
                    Aggiornato il{" "}
                    <time dateTime={post.updated_at}>{dateFormatter.format(revised)}</time>
                  </span>
                  <span aria-hidden="true" className="size-1.5 rounded-full bg-accent" />
                </>
              ) : null}
              <span>{readingMinutes(post.content)} min di lettura</span>
            </p>
          </div>
        </div>
      </header>

      <div
        className={`theme-paper container-px pt-14 sm:pt-20 ${
          related.length ? "pb-14 sm:pb-20" : "pb-20 sm:pb-28"
        }`}
      >
        {/* Niente copertina: il titolo in apertura basta, e le immagini vere
            (schermate di progetti) stanno dentro il testo quando servono. */}
        <div className="mx-auto flex max-w-3xl flex-col gap-12">

          <div
            className="prose-editor text-base leading-relaxed text-foreground-muted sm:text-lg"
            dangerouslySetInnerHTML={{ __html: normalizeHeadings(post.content) }}
          />
        </div>
      </div>

      {related.length ? (
        <section
          aria-labelledby="continua-a-leggere"
          className="theme-paper container-px pb-20 sm:pb-28"
        >
          <div className="mx-auto flex max-w-3xl flex-col gap-10 border-t border-border pt-14 sm:pt-20">
            <h2
              id="continua-a-leggere"
              className="font-display text-3xl font-bold tracking-[-0.03em] sm:text-4xl"
            >
              Continua a leggere
            </h2>
            <div className="grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-2">
              {related.map((item) => (
                <BlogCard key={item.id} post={item} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <ClosingCta
        title="Ti serve una mano?"
        text="Se stai pensando a un sito o a un progetto grafico, scrivimi: la prima consulenza è gratuita e senza impegno."
        contactPhone={contactPhone}
      />
    </article>
  );
}

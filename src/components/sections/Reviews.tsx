import { SectionHeading } from "@/components/ui/SectionHeading";
import { ReviewQuote } from "@/components/reviews/ReviewQuote";
import type { ClientReview, SectionTheme } from "@/lib/types";

/**
 * Recensioni in homepage: la prima in grande, le altre su due colonne.
 * Non compare finché non c'è almeno una recensione visibile.
 */
export function Reviews({
  reviews,
  googleUrl,
  theme,
}: {
  reviews?: ClientReview[];
  googleUrl?: string;
  theme: SectionTheme;
}) {
  const visible = (reviews ?? []).filter((r) => r.visible);
  if (visible.length === 0) return null;
  const [featured, ...rest] = visible;

  return (
    <section id="recensioni" className={`theme-${theme} container-px py-24 sm:py-32`}>
      <SectionHeading title="Cosa dicono i clienti." size="poster" />

      <div className="mt-12 border-t-2 border-foreground pt-10 sm:mt-16">
        <ReviewQuote review={featured} featured showProjectLink />
      </div>

      {rest.length ? (
        <div className="mt-14 grid grid-cols-1 gap-x-16 gap-y-12 md:grid-cols-2">
          {rest.map((review) => (
            <div key={review.id} className="border-t border-border-strong pt-8">
              <ReviewQuote review={review} showProjectLink />
            </div>
          ))}
        </div>
      ) : null}

      {googleUrl ? (
        <a
          href={googleUrl}
          target="_blank"
          rel="noopener noreferrer"
          data-cursor="link"
          className="group mt-14 inline-flex items-center gap-2 text-sm font-medium"
        >
          <span className="link-draw">Tutte le recensioni su Google</span>
          {/* Freccia disegnata, non il carattere: su iPhone diventerebbe un'emoji. */}
          <svg
            aria-hidden="true"
            viewBox="0 0 12 12"
            className="size-3 fill-none stroke-current stroke-[1.5] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          >
            <path d="M3 9 9 3M4 3h5v5" />
          </svg>
        </a>
      ) : null}
    </section>
  );
}

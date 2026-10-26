import { SectionHeading } from "@/components/ui/SectionHeading";
import { ReviewQuote } from "@/components/reviews/ReviewQuote";
import type { ClientReview, SectionTheme } from "@/lib/types";

/**
 * Recensioni in homepage. Una sola: in grande. Due: affiancate, alla stessa
 * dimensione (una grande e una sola in mezza riga sarebbe sbilanciato).
 * Tre o più: la prima in grande, le altre su due colonne.
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
  const pair = visible.length === 2;

  return (
    <section id="recensioni" className={`theme-${theme} container-px py-24 sm:py-32`}>
      <SectionHeading title="Cosa dicono i clienti." size="poster" />

      {pair ? (
        <div className="mt-12 grid grid-cols-1 gap-x-16 gap-y-10 border-t-2 border-foreground pt-10 sm:mt-16 md:grid-cols-2">
          {visible.map((review, i) => (
            <div
              key={review.id}
              className={i > 0 ? "border-t border-border-strong pt-10 md:border-t-0 md:pt-0" : undefined}
            >
              <ReviewQuote review={review} medium showProjectLink />
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-12 border-t-2 border-foreground pt-10 sm:mt-16">
          <ReviewQuote review={featured} featured showProjectLink />
        </div>
      )}

      {!pair && rest.length ? (
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

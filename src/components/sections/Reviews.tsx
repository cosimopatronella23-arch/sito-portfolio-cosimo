import { SectionHeading } from "@/components/ui/SectionHeading";
import { ReviewQuote } from "@/components/reviews/ReviewQuote";
import type { ClientReview } from "@/lib/types";

/**
 * Sezione recensioni in homepage. Non compare finché non c'è almeno una
 * recensione visibile (gestite in /admin/recensioni).
 */
export function Reviews({
  reviews,
  googleUrl,
}: {
  reviews?: ClientReview[];
  googleUrl?: string;
}) {
  const visible = (reviews ?? []).filter((r) => r.visible);
  if (visible.length === 0) return null;
  const [featured, ...rest] = visible;

  return (
    <section id="recensioni" className="container-px py-24 sm:py-32">
      <SectionHeading title="Cosa dicono i clienti." size="poster" />

      <div className="mt-14 max-w-5xl border-t border-border pt-10 sm:mt-20">
        <ReviewQuote review={featured} featured showProjectLink />
      </div>

      {rest.length ? (
        <div className="mt-14 grid grid-cols-1 gap-x-16 gap-y-12 md:grid-cols-2">
          {rest.map((review) => (
            <div key={review.id} className="border-t border-border pt-8">
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
          className="mt-14 inline-flex text-sm text-foreground-muted underline decoration-border-strong underline-offset-4 transition-colors hover:text-foreground"
        >
          Tutte le recensioni su Google ↗
        </a>
      ) : null}
    </section>
  );
}

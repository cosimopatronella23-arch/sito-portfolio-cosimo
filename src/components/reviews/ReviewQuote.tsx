import Link from "next/link";
import clsx from "clsx";
import type { ClientReview } from "@/lib/types";

const monthFormat = new Intl.DateTimeFormat("it-IT", {
  month: "long",
  year: "numeric",
});

function formatMonth(value: string) {
  const [y, m] = value.split("-").map(Number);
  if (!y || !m) return "";
  return monthFormat.format(new Date(y, m - 1, 1));
}

export function Stars({ rating, className }: { rating: number; className?: string }) {
  return (
    <span
      role="img"
      aria-label={`${rating} stelle su 5`}
      className={clsx("flex gap-1 text-accent", className)}
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <svg
          key={n}
          viewBox="0 0 24 24"
          aria-hidden="true"
          className={clsx("h-4 w-4", n > rating && "opacity-25")}
        >
          <path
            fill="currentColor"
            d="M12 2.8l2.83 5.73 6.32.92-4.57 4.46 1.08 6.29L12 17.23l-5.66 2.97 1.08-6.29-4.57-4.46 6.32-.92z"
          />
        </svg>
      ))}
    </span>
  );
}

/**
 * Una recensione nello stile del sito: niente riquadri, solo stelle,
 * citazione e firma. "featured" è la versione grande, la prima in homepage.
 */
export function ReviewQuote({
  review,
  featured = false,
  showProjectLink = false,
}: {
  review: ClientReview;
  featured?: boolean;
  showProjectLink?: boolean;
}) {
  const month = formatMonth(review.date);
  return (
    <figure className="flex flex-col gap-5">
      <Stars rating={review.rating} />
      <blockquote
        className={clsx(
          "text-pretty text-foreground",
          featured
            ? "font-display text-2xl leading-snug font-medium tracking-tight sm:text-3xl lg:text-4xl"
            : "text-lg leading-relaxed",
        )}
      >
        <p>&ldquo;{review.text}&rdquo;</p>
      </blockquote>
      <figcaption className="flex flex-col gap-1 text-sm text-foreground-muted">
        <span>
          <span className="font-medium text-foreground">{review.author}</span>
          {/* Spazio non separabile: il "·" non resta mai a inizio riga. */}
          {review.context ? <>{"\u00a0· "}{review.context}</> : null}
        </span>
        <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span>Recensione Google{month ? `, ${month}` : ""}</span>
          {showProjectLink && review.project_slug ? (
            <Link
              href={`/progetti/${review.project_slug}`}
              data-cursor="link"
              className="text-foreground underline decoration-border-strong underline-offset-4 hover:text-accent hover:decoration-accent"
            >
              Vedi il progetto
            </Link>
          ) : null}
        </span>
      </figcaption>
    </figure>
  );
}

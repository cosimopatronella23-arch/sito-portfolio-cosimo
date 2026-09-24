import Link from "next/link";
import type { BlogPost } from "@/lib/types";

/**
 * Riga stile "indice di rivista": niente immagini, solo tipografia — numero,
 * titolo e categoria. La data non compare qui (solo dentro l'articolo): con
 * titoli di lunghezza diversa spezzava l'allineamento della riga rendendola
 * asimmetrica. La griglia a 3 colonne tiene la freccia sempre centrata in
 * verticale, indipendentemente da quante righe occupa il titolo.
 */
export function BlogListRow({
  post,
  index = 0,
  headingLevel: Heading = "h3",
}: {
  post: BlogPost;
  index?: number;
  headingLevel?: "h2" | "h3";
}) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      data-cursor="link"
      className="group grid grid-cols-[auto_1fr_auto] items-center gap-x-6 gap-y-3 border-b border-border py-10 first:border-t sm:gap-x-10 sm:py-14"
    >
      <span aria-hidden="true" className="font-display self-start text-base text-foreground-muted sm:pt-2 sm:text-xl">
        {String(index + 1).padStart(2, "0")}
      </span>

      <div className="flex flex-col gap-3">
        <Heading className="font-display text-2xl leading-[1.1] font-semibold tracking-tight text-balance transition-colors duration-300 group-hover:text-accent sm:text-4xl md:text-5xl">
          {post.title}
        </Heading>
        <span className="text-xs font-medium tracking-wide text-foreground-muted uppercase">
          {post.category}
        </span>
      </div>

      <span
        aria-hidden="true"
        className="font-display justify-self-end text-2xl text-foreground-muted transition-all duration-300 group-hover:translate-x-1 group-hover:text-accent sm:text-3xl"
      >
        →
      </span>
    </Link>
  );
}

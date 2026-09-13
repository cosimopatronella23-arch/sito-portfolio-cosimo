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
}: {
  post: BlogPost;
  index?: number;
}) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      data-cursor="link"
      className="group grid grid-cols-[auto_1fr_auto] items-center gap-x-5 gap-y-2 border-b border-border py-7 first:border-t sm:gap-x-8 sm:py-9"
    >
      <span className="font-display self-start text-sm text-foreground/30 sm:pt-1">
        {String(index + 1).padStart(2, "0")}
      </span>

      <div className="flex flex-col gap-2">
        <h3 className="font-display text-xl leading-snug font-semibold tracking-tight text-balance transition-colors duration-300 group-hover:text-accent sm:text-2xl">
          {post.title}
        </h3>
        <span className="text-xs font-medium tracking-wide text-foreground-muted uppercase">
          {post.category}
        </span>
      </div>

      <span
        aria-hidden="true"
        className="justify-self-end text-foreground-muted transition-all duration-300 group-hover:translate-x-1 group-hover:text-accent"
      >
        →
      </span>
    </Link>
  );
}

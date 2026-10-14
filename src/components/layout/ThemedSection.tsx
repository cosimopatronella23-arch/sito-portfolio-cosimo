import clsx from "clsx";
import type { SectionTheme } from "@/lib/types";

/**
 * Sezione con uno dei 4 temi del sito (scuro, carta, lavanda, corallo): lo
 * sfondo e i colori di testo, bordi e pulsanti si adattano da soli.
 */
export function ThemedSection({
  theme,
  id,
  className,
  children,
  ...rest
}: {
  theme: SectionTheme;
  id?: string;
  className?: string;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLElement>) {
  return (
    <section id={id} className={clsx(`theme-${theme}`, className)} {...rest}>
      {children}
    </section>
  );
}

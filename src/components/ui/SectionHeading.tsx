"use client";

import { motion } from "framer-motion";
import clsx from "clsx";
import { AnimatedText } from "./AnimatedText";

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function SectionHeading({
  title,
  description,
  align = "left",
  size = "default",
  as = "h2",
  className,
}: {
  title: string;
  description?: string;
  align?: "left" | "center";
  /** "poster" è la nuova scala editoriale spinta — "default" resta invariata
   *  apposta per la sezione Progetti, che non va toccata. */
  size?: "default" | "poster";
  /** /progetti e /blog sono pagine a sé, non sezioni di un'altra pagina con
   *  già un suo h1: lì va passato "h1", altrimenti resterebbero senza. */
  as?: "h1" | "h2";
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "flex flex-col gap-4",
        align === "center" && "items-center text-center",
        className,
      )}
    >
      {size === "poster" ? (
        // Scala poster: il titolo entra parola per parola (stessa maschera
        // usata in Hero/Footer), più scenico della semplice tenda qui sotto.
        (() => {
          const Tag = as;
          return (
            <Tag className="font-display text-[clamp(2.5rem,7vw,6rem)] leading-[0.95] font-semibold tracking-tight text-balance">
              <AnimatedText text={title} />
            </Tag>
          );
        })()
      ) : (
        // Sezione Progetti (e chiunque non passi size="poster"): stessa
        // animazione a tenda di sempre, invariata.
        <motion.h2
          initial={{ clipPath: "inset(0 0 100% 0)", opacity: 0 }}
          whileInView={{ clipPath: "inset(0 0 0% 0)", opacity: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: EASE_OUT }}
          className="font-display text-3xl font-semibold tracking-tight text-balance sm:text-4xl md:text-5xl"
        >
          {title}
        </motion.h2>
      )}
      {description ? (
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: 0.15, ease: EASE_OUT }}
          className={clsx(
            "max-w-2xl text-base text-foreground-muted sm:text-lg",
            align === "center" && "mx-auto",
          )}
        >
          {description}
        </motion.p>
      ) : null}
    </div>
  );
}

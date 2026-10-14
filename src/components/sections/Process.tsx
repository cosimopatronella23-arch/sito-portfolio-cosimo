"use client";

import { motion, useReducedMotion } from "framer-motion";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { ProcessStep, SectionTheme } from "@/lib/types";

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

/** "Come lavoro": passi numerati che entrano uno dopo l'altro scorrendo. */
export function Process({
  title,
  subtitle,
  steps,
  theme,
}: {
  title: string;
  subtitle: string;
  steps: ProcessStep[];
  theme: SectionTheme;
}) {
  const reduce = useReducedMotion();
  const cols = steps.length >= 4 ? "lg:grid-cols-4" : steps.length === 3 ? "lg:grid-cols-3" : "lg:grid-cols-2";

  return (
    <section id="come-lavoro" className={`theme-${theme} container-px py-24 sm:py-32`}>
      <div className="flex flex-wrap items-end justify-between gap-6 pb-12 sm:pb-16">
        <SectionHeading title={title} size="poster" />
        <span className="font-display max-w-xs text-base font-semibold sm:text-right">{subtitle}</span>
      </div>
      <ol className={`grid grid-cols-1 gap-x-6 gap-y-12 border-t border-border-strong sm:grid-cols-2 ${cols}`}>
        {steps.map((step, i) => (
          <motion.li
            key={`${i}-${step.title}`}
            initial={reduce ? false : { opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, delay: i * 0.1, ease: EASE_OUT }}
            className="group flex flex-col gap-4 pt-7"
          >
            <span
              aria-hidden="true"
              className="font-display text-[clamp(3rem,5vw,4.5rem)] leading-[0.85] font-bold tracking-[-0.05em] text-foreground-muted transition-[transform,color] duration-500 group-hover:text-foreground ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-2"
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            {step.badge ? (
              <span className="w-max bg-accent px-3 py-1.5 text-xs font-semibold tracking-[0.1em] text-ink uppercase">
                {step.badge}
              </span>
            ) : null}
            <h3 className="font-display text-2xl font-bold tracking-[-0.02em] sm:text-3xl">
              <span className="sr-only">Passo {i + 1}: </span>
              {step.title}
            </h3>
            <p className="max-w-sm leading-relaxed text-foreground-muted">{step.text}</p>
          </motion.li>
        ))}
      </ol>
    </section>
  );
}

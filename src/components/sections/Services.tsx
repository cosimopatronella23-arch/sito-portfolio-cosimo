"use client";

import { motion } from "framer-motion";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { sectionStyle } from "@/lib/contrast";
import type { ServiceItem } from "@/lib/types";

// Un gradiente diverso per ogni card (si ripete se i servizi sono più di 4),
// stesso set di colori-accento già usato per i blob animati altrove nel
// sito — coerenza visiva, nessun asset nuovo.
const CARD_GRADIENTS = [
  "conic-gradient(from 180deg, var(--accent), var(--accent-blue))",
  "conic-gradient(from 90deg, var(--accent-pink), var(--accent-strong))",
  "conic-gradient(from 270deg, var(--accent-blue), var(--accent-pink))",
  "conic-gradient(from 0deg, var(--accent-strong), var(--accent))",
];

export function Services({
  title,
  services,
  backgroundColor,
}: {
  title: string;
  services: ServiceItem[];
  backgroundColor?: string;
}) {
  return (
    <section
      id="servizi"
      style={sectionStyle(backgroundColor)}
      className="container-px py-24 sm:py-32"
    >
      <div className="flex flex-col gap-14">
        <SectionHeading title={title} />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {services.map((service, i) => (
            <motion.div
              key={`${i}-${service.title}`}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
              className="group relative flex min-h-56 flex-col justify-between overflow-hidden border border-border p-8"
            >
              <div
                aria-hidden="true"
                className="absolute inset-0 scale-125 opacity-0 blur-2xl transition-[opacity,transform] duration-500 ease-out group-hover:scale-100 group-hover:opacity-30 group-focus-within:opacity-30"
                style={{ background: CARD_GRADIENTS[i % CARD_GRADIENTS.length] }}
              />

              <span className="font-display relative text-5xl font-semibold text-foreground/15 transition-colors duration-500 group-hover:text-foreground/25 sm:text-6xl">
                {String(i + 1).padStart(2, "0")}
              </span>

              <div className="relative flex flex-col gap-2">
                <h3 className="font-display text-2xl font-semibold tracking-tight transition-transform duration-500 ease-out group-hover:-translate-y-1">
                  {service.title}
                </h3>
                <p className="max-w-md text-foreground-muted transition-transform duration-500 ease-out group-hover:-translate-y-1">
                  {service.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

"use client";

import { motion } from "framer-motion";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { sectionStyle } from "@/lib/contrast";
import type { ServiceItem } from "@/lib/types";

// Un gradiente diverso per ogni riga (si ripete se i servizi sono più di 4),
// stesso set di colori-accento già usato per i blob animati altrove nel
// sito — coerenza visiva, nessun asset nuovo. Opacità moderata: a piena
// forza il testo chiaro perderebbe leggibilità sopra un colore chiaro.
const ROW_GRADIENTS = [
  "linear-gradient(100deg, var(--accent), var(--accent-blue))",
  "linear-gradient(100deg, var(--accent-pink), var(--accent-strong))",
  "linear-gradient(100deg, var(--accent-blue), var(--accent-pink))",
  "linear-gradient(100deg, var(--accent-strong), var(--accent))",
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
      className="pt-24 pb-4 sm:pt-32 sm:pb-8"
    >
      <div className="container-px">
        <SectionHeading title={title} size="poster" />
      </div>

      {/* Righe a piena larghezza invece di card chiuse in un riquadro: al
          passaggio del mouse un velo di colore attraversa tutta la riga da
          un bordo all'altro dello schermo, non solo l'interno di una card —
          più "poster", meno "componente da libreria UI". */}
      <div className="mt-14 flex flex-col">
        {services.map((service, i) => (
          <motion.div
            key={`${i}-${service.title}`}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, delay: i * 0.06 }}
            className="group relative w-full overflow-hidden border-t border-border last:border-b"
          >
            <div
              aria-hidden="true"
              className="absolute inset-0 origin-left scale-x-0 opacity-40 transition-transform duration-500 ease-out group-hover:scale-x-100"
              style={{ background: ROW_GRADIENTS[i % ROW_GRADIENTS.length] }}
            />
            <div className="container-px relative flex flex-col gap-3 py-10 sm:flex-row sm:items-baseline sm:justify-between sm:gap-10 sm:py-14">
              <div className="flex items-baseline gap-6">
                <span aria-hidden="true" className="font-display text-xl text-foreground-muted sm:text-2xl">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="font-display text-4xl font-semibold tracking-tight sm:text-6xl">
                  {service.title}
                </h3>
              </div>
              <p className="max-w-sm text-foreground-muted sm:text-right">
                {service.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

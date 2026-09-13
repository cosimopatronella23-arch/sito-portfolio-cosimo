"use client";

import { motion } from "framer-motion";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { sectionStyle } from "@/lib/contrast";
import type { ServiceItem } from "@/lib/types";

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

        <div className="flex flex-col border-y border-border">
          {services.map((service, i) => (
            <motion.div
              key={`${i}-${service.title}`}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
              className="group relative grid grid-cols-[3rem_1fr] items-baseline gap-x-6 gap-y-2 border-b border-border py-8 pl-0 transition-[padding] duration-300 last:border-b-0 hover:pl-4 sm:grid-cols-[4.5rem_1fr_1fr] sm:items-center sm:gap-x-10 sm:py-10"
            >
              <span
                className="absolute top-0 left-0 h-full w-1 origin-center scale-y-0 bg-accent transition-transform duration-300 group-hover:scale-y-100"
                aria-hidden="true"
              />
              <span className="font-display text-3xl font-semibold text-foreground/20 transition-colors duration-300 group-hover:text-accent sm:text-4xl">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="font-display text-2xl font-semibold tracking-tight">
                {service.title}
              </h3>
              <p className="text-foreground-muted col-span-2 sm:col-span-1 sm:text-right">
                {service.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

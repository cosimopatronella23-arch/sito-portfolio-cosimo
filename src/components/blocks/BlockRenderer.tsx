import { TestoLibero } from "./TestoLibero";
import { HeroAlt } from "./HeroAlt";
import { Testimonianze } from "./Testimonianze";
import { CtaBanner } from "./CtaBanner";
import { Gallery } from "./Gallery";
import type { HomepageBlock } from "@/lib/types";

/**
 * Disegna in sequenza i blocchi extra della homepage (Fase A del sistema di
 * blocchi). Se `blocks` è vuoto o assente, non renderizza nulla — la
 * homepage resta identica a prima dell'introduzione di questo sistema.
 */
export function BlockRenderer({ blocks }: { blocks?: HomepageBlock[] }) {
  if (!blocks || blocks.length === 0) return null;

  return (
    <>
      {blocks.map((block) => {
        switch (block.type) {
          case "testo_libero":
            return <TestoLibero key={block.id} data={block.data} />;
          case "hero_alt":
            return <HeroAlt key={block.id} data={block.data} />;
          case "testimonianze":
            return <Testimonianze key={block.id} data={block.data} />;
          case "cta_banner":
            return <CtaBanner key={block.id} data={block.data} />;
          case "gallery":
            return <Gallery key={block.id} data={block.data} />;
          default:
            return null;
        }
      })}
    </>
  );
}

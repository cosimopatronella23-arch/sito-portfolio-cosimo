import { TestoLibero } from "./TestoLibero";
import { HeroAlt } from "./HeroAlt";
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
          default:
            return null;
        }
      })}
    </>
  );
}

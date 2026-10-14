import clsx from "clsx";

export type ShapeKind = "circle" | "square" | "ring" | "quarter" | "half" | "triangle";

const BASE: Record<ShapeKind, string> = {
  circle: "rounded-full",
  square: "",
  ring: "rounded-full border-solid bg-transparent",
  quarter: "rounded-tl-full",
  half: "rounded-t-full",
  triangle: "[clip-path:polygon(50%_0,100%_100%,0_100%)]",
};

/**
 * Forma geometrica del sistema grafico del sito. Le dimensioni arrivano da
 * className; il colore da `color` (classe Tailwind di sfondo o bordo).
 * Al passaggio del mouse ruota o scatta: è decorativa, quindi nascosta ai
 * lettori di schermo.
 */
export function Shape({
  kind,
  color,
  className,
  float,
}: {
  kind: ShapeKind;
  color: string;
  className?: string;
  /** Leggero movimento continuo ("respiro"). */
  float?: "fast" | "slow";
}) {
  return (
    <span
      aria-hidden="true"
      className={clsx(
        "block shrink-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
        BASE[kind],
        color,
        float === "fast" && "shape-float",
        float === "slow" && "shape-float-slow",
        className,
      )}
      style={kind === "ring" ? { borderWidth: "clamp(10px, 1.4vw, 20px)" } : undefined}
    />
  );
}

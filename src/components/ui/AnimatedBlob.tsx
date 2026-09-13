/**
 * Forma organica sfocata e animata, ispirata alle campiture generative di
 * studi come Studio Dumbar — qui fatta solo con gradiente + blur + morphing
 * del border-radius (nessun asset esterno, nessuna libreria). Puramente
 * decorativa: aria-hidden, non cattura il mouse, si ferma da sola con
 * prefers-reduced-motion (regola globale in globals.css).
 */
export function AnimatedBlob({
  className,
  variant = "accent",
  opacity = 0.5,
}: {
  className?: string;
  variant?: "accent" | "warm";
  opacity?: number;
}) {
  const gradient =
    variant === "accent"
      ? "conic-gradient(from 180deg, var(--accent), var(--accent-blue), var(--accent-pink), var(--accent))"
      : "conic-gradient(from 60deg, var(--accent-pink), var(--accent), var(--accent-strong), var(--accent-pink))";

  return (
    <div
      aria-hidden="true"
      className={`animated-blob pointer-events-none absolute blur-3xl ${className ?? ""}`}
      style={{ background: gradient, opacity }}
    />
  );
}

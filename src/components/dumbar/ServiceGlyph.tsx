import clsx from "clsx";

/**
 * Glifo geometrico di un servizio (5 varianti, si ripetono oltre il quinto).
 * Ogni pezzo si sposta al passaggio del mouse sulla card (classe "group").
 */
export function ServiceGlyph({ index, className }: { index: number; className?: string }) {
  const v = index % 5;
  const t = "absolute transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]";
  return (
    <span aria-hidden="true" className={clsx("relative block h-24 w-40", className)}>
      {v === 0 ? (
        <>
          <span className={clsx(t, "left-0 top-0 h-24 w-11 bg-accent group-hover:-translate-y-2")} />
          <span className={clsx(t, "left-14 top-8 h-16 w-11 bg-foreground group-hover:translate-y-2")} />
          <span className={clsx(t, "left-28 top-0 h-24 w-8 bg-secondary group-hover:-translate-y-3")} />
        </>
      ) : v === 1 ? (
        <>
          <span className={clsx(t, "left-0 top-0 h-24 w-24 rounded-full bg-secondary group-hover:translate-x-4")} />
          <span className={clsx(t, "left-14 top-0 h-24 w-24 rounded-full border-2 border-foreground group-hover:-translate-x-4")} />
        </>
      ) : v === 2 ? (
        <>
          <span className={clsx(t, "left-0 top-0 h-24 w-28 bg-accent [clip-path:polygon(50%_0,100%_100%,0_100%)] group-hover:rotate-12")} />
          <span className={clsx(t, "left-[4.5rem] top-0 h-9 w-9 rounded-full bg-foreground group-hover:translate-x-6 group-hover:translate-y-4")} />
        </>
      ) : v === 3 ? (
        <>
          <span className={clsx(t, "left-0 top-0 h-24 w-32 border-2 border-foreground group-hover:scale-95")} />
          <span className={clsx(t, "left-11 top-6 h-12 w-12 rounded-full bg-secondary group-hover:scale-125")} />
        </>
      ) : (
        <>
          <span className={clsx(t, "left-0 top-0 h-12 w-24 rounded-t-full bg-foreground group-hover:-translate-y-2")} />
          <span className={clsx(t, "left-0 top-12 h-12 w-24 rounded-b-full bg-accent group-hover:translate-y-2")} />
        </>
      )}
    </span>
  );
}

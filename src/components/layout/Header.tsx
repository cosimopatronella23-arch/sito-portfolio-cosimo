"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import type { NavLink } from "@/lib/types";

const DEFAULT_NAV_LINKS: NavLink[] = [
  { label: "Progetti", href: "/progetti" },
  { label: "Servizi", href: "/servizi" },
  { label: "Blog", href: "/blog" },
  { label: "Contatti", href: "/#contatti" },
];

// Attivo anche nelle sottopagine: "Servizi" resta evidenziato su
// /servizi/seo, "Progetti" su /progetti/gymbo. Le ancore (/#...) mai.
function isActive(pathname: string, href: string) {
  if (href.includes("#")) return false;
  return pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));
}

export function Header({ navLinks }: { navLinks?: NavLink[] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);
  const links =
    navLinks && navLinks.length > 0 ? navLinks : DEFAULT_NAV_LINKS;

  return (
    // Barra sospesa al centro, sopra i contenuti (-mb-20: la pagina parte da
    // sotto la barra, come l'hero a tutto schermo). Le pagine lasciano 80 px
    // liberi in alto; a menu aperto il fondo diventa pieno per la lettura.
    <header className="pointer-events-none sticky top-0 z-50 -mb-20 h-20 px-3 py-3 sm:px-5">
      <div
        className={clsx(
          "theme-ink pointer-events-auto mx-auto max-w-[880px] border border-border-strong shadow-[0_12px_40px_-16px_rgb(0_0_0/0.5)] backdrop-blur-xl transition-colors duration-300",
          open ? "bg-background!" : "bg-background/60!",
        )}
      >
      <div className="flex h-[54px] items-center justify-between gap-6 pr-1.5 pl-5">
        <Link
          href="/"
          data-cursor="link"
          className="group font-display flex shrink-0 items-center gap-3 text-sm font-semibold tracking-[0.12em] uppercase"
          onClick={() => setOpen(false)}
        >
          {/* Due punti del sistema grafico: al passaggio del mouse si scambiano. */}
          <span aria-hidden="true" className="relative flex h-3.5 w-6">
            <span className="absolute left-0 size-3.5 rounded-full bg-paper transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-2.5" />
            <span className="absolute left-2.5 size-3.5 rounded-full bg-accent mix-blend-screen transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-x-2.5" />
          </span>
          Cosimo Patronella
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-8 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              data-cursor="link"
              aria-current={isActive(pathname, link.href) ? "page" : undefined}
              className={clsx(
                "relative text-xs font-medium tracking-[0.08em] text-foreground-muted uppercase transition-colors after:absolute after:-bottom-1 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-accent after:transition-transform after:duration-300 hover:text-foreground hover:after:scale-x-100",
                isActive(pathname, link.href) && "text-foreground",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <Link
            href="/#contatti"
            data-cursor="link"
            className="group relative hidden h-[42px] shrink-0 items-center gap-2 overflow-hidden bg-foreground px-4 text-background md:inline-flex text-xs font-semibold tracking-[0.1em] uppercase transition-colors duration-300 hover:text-ink"
          >
            <span aria-hidden="true" className="absolute inset-0 origin-left scale-x-0 bg-accent transition-transform duration-300 ease-out group-hover:scale-x-100" />
            <span className="relative">Scrivimi</span>
            <span aria-hidden="true" className="relative transition-transform duration-300 group-hover:translate-x-1">→</span>
          </Link>

        <button
          type="button"
          className="flex size-[42px] items-center justify-center bg-foreground text-background md:hidden"
          aria-label={open ? "Chiudi il menu" : "Apri il menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="relative flex h-3.5 w-4 flex-col justify-between">
            <span
              className={clsx(
                "h-px w-full bg-background transition-transform",
                open && "translate-y-[6.5px] rotate-45",
              )}
            />
            <span
              className={clsx(
                "h-px w-full bg-background transition-transform",
                open && "-rotate-45 -translate-y-[6.5px]",
              )}
            />
          </span>
        </button>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="overflow-hidden border-t border-border md:hidden"
          >
            <div className="flex flex-col gap-1 px-5 py-3">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive(pathname, link.href) ? "page" : undefined}
                  className="font-display border-b border-border px-1 py-4 text-2xl font-semibold tracking-[-0.02em] text-foreground transition-colors last:border-b-0 hover:text-accent"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.nav>
        ) : null}
      </AnimatePresence>
      </div>
    </header>
  );
}

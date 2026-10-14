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
    <header className="theme-ink sticky top-0 z-50 border-b border-border bg-background/90! backdrop-blur-md">
      <div className="container-px flex items-center justify-between py-5">
        <Link
          href="/"
          data-cursor="link"
          className="group font-display flex items-center gap-3 text-sm font-semibold tracking-[0.12em] uppercase"
          onClick={() => setOpen(false)}
        >
          {/* Due punti del sistema grafico: al passaggio del mouse si scambiano. */}
          <span aria-hidden="true" className="relative flex h-3.5 w-6">
            <span className="absolute left-0 size-3.5 rounded-full bg-paper transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-2.5" />
            <span className="absolute left-2.5 size-3.5 rounded-full bg-accent mix-blend-screen transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-x-2.5" />
          </span>
          Cosimo Patronella
        </Link>

        <nav className="hidden items-center gap-10 md:flex">
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
          <Link
            href="/#contatti"
            data-cursor="link"
            className="group relative inline-flex items-center gap-2 overflow-hidden border border-foreground px-4 py-2.5 text-xs font-semibold tracking-[0.1em] uppercase transition-colors duration-300 hover:text-ink"
          >
            <span aria-hidden="true" className="absolute inset-0 origin-left scale-x-0 bg-fill transition-transform duration-300 ease-out group-hover:scale-x-100" />
            <span className="relative">Scrivimi</span>
            <span aria-hidden="true" className="relative transition-transform duration-300 group-hover:translate-x-1">→</span>
          </Link>
        </nav>

        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center border border-border-strong md:hidden"
          aria-label={open ? "Chiudi il menu" : "Apri il menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="relative flex h-3.5 w-4 flex-col justify-between">
            <span
              className={clsx(
                "h-px w-full bg-foreground transition-transform",
                open && "translate-y-[6.5px] rotate-45",
              )}
            />
            <span
              className={clsx(
                "h-px w-full bg-foreground transition-transform",
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
            <div className="container-px flex flex-col gap-1 py-4">
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
    </header>
  );
}

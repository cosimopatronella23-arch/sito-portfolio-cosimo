"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import type { NavLink } from "@/lib/types";

const DEFAULT_NAV_LINKS: NavLink[] = [
  { label: "Servizi", href: "/#servizi" },
  { label: "Progetti", href: "/#progetti" },
  { label: "Blog", href: "/blog" },
  { label: "Contatti", href: "/#contatti" },
];

export function Header({ navLinks }: { navLinks?: NavLink[] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const links =
    navLinks && navLinks.length > 0 ? navLinks : DEFAULT_NAV_LINKS;

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container-px flex items-center justify-between py-4">
        <Link
          href="/"
          data-cursor="link"
          className="font-display text-lg font-semibold tracking-tight"
          onClick={() => setOpen(false)}
        >
          Cosimo Patronella
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              data-cursor="link"
              className={clsx(
                "relative text-sm font-medium text-foreground-muted transition-colors after:absolute after:-bottom-1 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-accent after:transition-transform after:duration-300 hover:text-foreground hover:after:scale-x-100",
                pathname === link.href && "text-foreground",
              )}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/#contatti"
            data-cursor="link"
            className="bg-foreground px-5 py-2 text-sm font-medium text-background transition-colors hover:bg-accent"
          >
            Iniziamo un progetto
          </Link>
        </nav>

        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center border border-border-strong md:hidden"
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
                  className="px-3 py-3 text-base font-medium text-foreground-muted hover:bg-surface hover:text-foreground"
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

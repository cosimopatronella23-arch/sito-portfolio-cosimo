"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { WhatsAppIcon } from "./WhatsAppIcon";

/**
 * Pulsante WhatsApp discreto: compare solo dopo aver iniziato a scorrere e
 * sparisce quando sono già visibili la sezione Contatti o il footer (dove
 * il contatto è già a portata di mano). Sta sotto il banner dei cookie.
 */
export function WhatsAppButton({ href }: { href: string }) {
  const [scrolled, setScrolled] = useState(false);
  const [contactVisible, setContactVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const targets = [
      document.getElementById("contatti"),
      document.querySelector("footer"),
    ].filter((el): el is HTMLElement => !!el);
    const visible = new Set<Element>();
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) visible.add(entry.target);
        else visible.delete(entry.target);
      }
      setContactVisible(visible.size > 0);
    });
    targets.forEach((el) => observer.observe(el));

    return () => {
      window.removeEventListener("scroll", onScroll);
      observer.disconnect();
    };
  }, []);

  const shown = scrolled && !contactVisible;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      data-cursor="link"
      aria-label="Scrivimi su WhatsApp"
      tabIndex={shown ? 0 : -1}
      aria-hidden={!shown}
      className={clsx(
        "theme-ink group fixed right-4 bottom-4 z-50 flex h-12 items-center gap-2 overflow-hidden border border-border-strong bg-background/95! px-3.5 text-sm font-semibold tracking-[0.06em] uppercase text-foreground shadow-lg backdrop-blur transition-[opacity,transform,border-color] duration-300 ease-out hover:border-[#25D366] motion-reduce:transition-none sm:right-6 sm:bottom-6",
        shown
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-3 opacity-0",
      )}
    >
      <WhatsAppIcon className="h-5 w-5 text-[#25D366]" />
      <span className="hidden sm:inline">Scrivimi</span>
    </a>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { AdminIcon, type AdminIconName } from "./AdminIcons";
import { LogoutButton } from "./LogoutButton";

type NavItem = { label: string; href: string; icon: AdminIconName };

const GROUPS: { title: string; items: NavItem[] }[] = [
  {
    title: "Contenuti",
    items: [
      { label: "Dashboard", href: "/admin", icon: "dashboard" },
      { label: "Progetti", href: "/admin/progetti", icon: "projects" },
      { label: "Servizi", href: "/admin/servizi", icon: "services" },
      { label: "Blog", href: "/admin/blog", icon: "blog" },
      { label: "Media", href: "/admin/media", icon: "media" },
    ],
  },
  {
    title: "Sito",
    items: [
      { label: "Analytics", href: "/admin/analytics", icon: "analytics" },
      { label: "Impostazioni", href: "/admin/impostazioni", icon: "settings" },
    ],
  },
];

function isActive(pathname: string, href: string) {
  return href === "/admin" ? pathname === href : pathname.startsWith(href);
}

function NavLinks({ pathname }: { pathname: string }) {
  return (
    <nav aria-label="Admin" className="flex flex-col gap-7">
      {GROUPS.map((group) => (
        <div key={group.title} className="flex flex-col gap-1">
          <p className="px-3 pb-1 text-[0.6875rem] font-medium tracking-[0.12em] text-foreground-muted uppercase">
            {group.title}
          </p>
          {group.items.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={clsx(
                  "relative flex min-h-11 items-center gap-3 px-3 text-sm font-medium transition-colors lg:min-h-10",
                  active
                    ? "bg-surface-hover text-foreground before:absolute before:inset-y-2 before:left-0 before:w-0.5 before:bg-accent"
                    : "text-foreground-muted hover:bg-surface-hover/60 hover:text-foreground",
                )}
              >
                <AdminIcon
                  name={item.icon}
                  className={clsx("h-5 w-5", active && "text-accent")}
                />
                {item.label}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

function SidebarFooter() {
  return (
    <div className="flex flex-col gap-1 border-t border-border pt-4">
      <a
        href="/"
        target="_blank"
        rel="noopener"
        className="flex min-h-11 items-center gap-3 px-3 text-sm text-foreground-muted transition-colors hover:text-foreground lg:min-h-10"
      >
        <AdminIcon name="external" />
        Vedi il sito
      </a>
      <LogoutButton className="flex min-h-11 w-full items-center gap-3 px-3 text-sm text-foreground-muted transition-colors hover:text-error lg:min-h-10">
        <AdminIcon name="logout" />
        Esci
      </LogoutButton>
    </div>
  );
}

function Brand() {
  return (
    <Link href="/admin" className="flex flex-col px-3 leading-tight">
      <span className="font-display text-base font-semibold tracking-tight">
        Cosimo Patronella
      </span>
      <span className="text-xs text-foreground-muted">Pannello del sito</span>
    </Link>
  );
}

/**
 * Struttura dell'admin: menu laterale fisso da desktop, barra in alto con
 * menu a scomparsa su telefono e tablet.
 */
export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Il menu mobile ricorda la pagina in cui è stato aperto: cambiando
  // pagina si chiude da solo. Si chiude anche con Esc.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;
  const setOpen = (value: boolean) => setOpenOn(value ? pathname : null);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenOn(null);
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col justify-between border-r border-border bg-surface px-3 py-6 lg:flex">
        <div className="flex flex-col gap-8">
          <Brand />
          <NavLinks pathname={pathname} />
        </div>
        <SidebarFooter />
      </aside>

      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background/95 px-4 py-3 backdrop-blur lg:hidden">
        <Brand />
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Apri il menu"
          aria-expanded={open}
          aria-controls="admin-menu-mobile"
          className="flex h-11 w-11 items-center justify-center border border-border-strong"
        >
          <AdminIcon name="menu" />
        </button>
      </header>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Chiudi il menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/60"
          />
          <div
            id="admin-menu-mobile"
            className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col justify-between overflow-y-auto border-r border-border bg-surface px-3 py-5"
          >
            <div className="flex flex-col gap-8">
              <div className="flex items-start justify-between">
                <Brand />
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Chiudi il menu"
                  className="flex h-11 w-11 items-center justify-center"
                >
                  <AdminIcon name="close" />
                </button>
              </div>
              <NavLinks pathname={pathname} />
            </div>
            <SidebarFooter />
          </div>
        </div>
      ) : null}

      <main id="contenuto" className="lg:pl-60">
        <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-8 sm:py-10">
          {children}
        </div>
      </main>
    </div>
  );
}

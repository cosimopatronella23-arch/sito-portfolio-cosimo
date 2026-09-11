"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { LogoutButton } from "./LogoutButton";

const LINKS = [
  { label: "Progetti", href: "/admin/progetti" },
  { label: "Blog", href: "/admin/blog" },
  { label: "Analytics", href: "/admin/analytics" },
  { label: "Impostazioni", href: "/admin/impostazioni" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <header className="border-b border-border">
      <div className="container-px flex items-center justify-between py-4">
        <Link
          href="/admin"
          className="font-display text-lg font-semibold tracking-tight"
        >
          Admin
        </Link>
        <nav className="flex items-center gap-6">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                "text-sm font-medium text-foreground-muted transition-colors hover:text-foreground",
                pathname.startsWith(link.href) && "text-foreground",
              )}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/"
            target="_blank"
            className="text-sm text-foreground-muted hover:text-foreground"
          >
            Vedi sito ↗
          </Link>
          <LogoutButton />
        </nav>
      </div>
    </header>
  );
}

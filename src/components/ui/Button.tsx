"use client";

import Link from "next/link";
import { useRef, type ComponentPropsWithoutRef, type MouseEvent } from "react";
import clsx from "clsx";

type BaseProps = {
  variant?: "primary" | "secondary" | "ghost";
  size?: "md" | "lg";
  className?: string;
  children: React.ReactNode;
};

type ButtonAsLink = BaseProps & { href: string } & Omit<
    ComponentPropsWithoutRef<typeof Link>,
    "href" | "className" | "children"
  >;

type ButtonAsButton = BaseProps & { href?: undefined } & Omit<
    ComponentPropsWithoutRef<"button">,
    "className" | "children"
  >;

type ButtonProps = ButtonAsLink | ButtonAsButton;

const base =
  "group relative inline-flex items-center justify-center gap-2 overflow-hidden border font-medium transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-accent disabled:opacity-50 disabled:pointer-events-none";

const variants = {
  primary: "border-foreground bg-foreground text-background",
  secondary:
    "border-border-strong text-foreground hover:border-accent hover:text-accent",
  ghost: "border-transparent text-foreground-muted hover:text-foreground",
};

const sizes = {
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3.5 text-base",
};

type MagneticEl = HTMLAnchorElement & HTMLButtonElement;

// Effetto magnetico: il bottone segue leggermente il cursore quando è
// vicino, come se venisse "attratto". Manipola il DOM direttamente (niente
// useState) per restare fluido a 60fps senza ri-render React ad ogni
// movimento del mouse; il controllo hover/pointer esclude i touch.
function magneticMove(el: MagneticEl | null, e: MouseEvent<HTMLElement>) {
  if (!el || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    return;
  }
  const rect = el.getBoundingClientRect();
  const x = e.clientX - (rect.left + rect.width / 2);
  const y = e.clientY - (rect.top + rect.height / 2);
  el.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px)`;
}

function magneticReset(el: MagneticEl | null) {
  if (!el) return;
  el.style.transform = "translate(0, 0)";
}

function ButtonContent({
  variant,
  children,
}: {
  variant: BaseProps["variant"];
  children: React.ReactNode;
}) {
  return (
    <>
      {variant === "primary" ? (
        <span
          className="pointer-events-none absolute inset-0 origin-left scale-x-0 bg-accent transition-transform duration-300 ease-out group-hover:scale-x-100"
          aria-hidden="true"
        />
      ) : null}
      <span className="relative">{children}</span>
    </>
  );
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  const classes = clsx(
    base,
    "transition-[transform,background-color,border-color,color] ease-out",
    variants[variant],
    sizes[size],
    className,
  );
  const ref = useRef<MagneticEl>(null);

  if ("href" in props && props.href) {
    const { href, ...rest } = props as ButtonAsLink;
    // Un link con protocollo (http/https) porta sempre fuori dal sito: si
    // apre in una scheda nuova, così non si perde il portfolio per andare
    // a vedere il sito di un progetto. I link interni (/progetti, /#...)
    // restano nella stessa scheda come sempre.
    const isExternal = /^https?:\/\//i.test(href);
    return (
      <Link
        ref={ref}
        href={href}
        className={classes}
        data-cursor="link"
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noopener noreferrer" : undefined}
        onMouseMove={(e) => magneticMove(ref.current, e)}
        onMouseLeave={() => magneticReset(ref.current)}
        {...rest}
      >
        <ButtonContent variant={variant}>{children}</ButtonContent>
      </Link>
    );
  }

  const rest = props as ButtonAsButton;
  return (
    <button
      ref={ref}
      className={classes}
      data-cursor="link"
      onMouseMove={(e) => magneticMove(ref.current, e)}
      onMouseLeave={() => magneticReset(ref.current)}
      {...rest}
    >
      <ButtonContent variant={variant}>{children}</ButtonContent>
    </button>
  );
}

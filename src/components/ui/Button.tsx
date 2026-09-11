import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";
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
  const classes = clsx(base, variants[variant], sizes[size], className);

  if ("href" in props && props.href) {
    const { href, ...rest } = props as ButtonAsLink;
    return (
      <Link href={href} className={classes} data-cursor="link" {...rest}>
        <ButtonContent variant={variant}>{children}</ButtonContent>
      </Link>
    );
  }

  const rest = props as ButtonAsButton;
  return (
    <button className={classes} data-cursor="link" {...rest}>
      <ButtonContent variant={variant}>{children}</ButtonContent>
    </button>
  );
}

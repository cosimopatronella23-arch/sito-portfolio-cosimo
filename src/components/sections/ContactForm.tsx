"use client";

import { useActionState } from "react";
import Link from "next/link";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { AnimatedBlob } from "@/components/ui/AnimatedBlob";
import { sendContactMessage } from "@/lib/actions/contact";
import { sectionStyle } from "@/lib/contrast";

const FIELDS: Array<{
  name: string;
  type: string;
  placeholder: string;
  autoComplete: string;
  maxLength: number;
  isTextarea?: boolean;
}> = [
  {
    name: "name",
    type: "text",
    placeholder: "Come ti chiami?",
    autoComplete: "name",
    maxLength: 100,
  },
  {
    name: "email",
    type: "email",
    placeholder: "La tua email",
    autoComplete: "email",
    maxLength: 254,
  },
  {
    name: "message",
    type: "text",
    placeholder: "Raccontami del progetto",
    autoComplete: "off",
    maxLength: 5000,
    isTextarea: true,
  },
];

const fieldClasses =
  "w-full border-0 border-b border-border-strong bg-transparent px-0 py-3 text-lg text-foreground placeholder:text-foreground-muted focus-visible:border-accent focus-visible:outline-none";

export function ContactForm({
  backgroundColor,
  contactEmail,
  contactPhone,
}: {
  backgroundColor?: string;
  contactEmail?: string;
  contactPhone?: string;
} = {}) {
  const [state, formAction, pending] = useActionState(sendContactMessage, {
    error: null,
  });
  const style = sectionStyle(backgroundColor);

  if (state.success) {
    return (
      <section id="contatti" style={style} className="container-px py-24 sm:py-32">
        <div className="mx-auto max-w-2xl border border-border p-10 text-center">
          <h2 className="font-display text-2xl font-semibold">
            Ricevuto, grazie!
          </h2>
          <p className="mt-3 text-foreground-muted">
            Ti scrivo il prima possibile.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      id="contatti"
      style={style}
      className="relative container-px overflow-hidden py-24 sm:py-32"
    >
      <AnimatedBlob
        variant="warm"
        className="-bottom-40 -left-24 -z-10 h-[24rem] w-[24rem] sm:h-[30rem] sm:w-[30rem]"
      />
      <div className="grid grid-cols-1 gap-14 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="flex flex-col gap-8">
          <SectionHeading
            title="Raccontami cosa stai costruendo."
            size="poster"
          />
          {contactEmail || contactPhone ? (
            <div className="flex flex-col gap-2 border-t border-border pt-6 text-sm">
              <span className="text-foreground-muted">Oppure, più diretto:</span>
              {contactEmail ? (
                <a
                  href={`mailto:${contactEmail}`}
                  data-cursor="link"
                  className="font-medium text-foreground hover:text-accent"
                >
                  {contactEmail}
                </a>
              ) : null}
              {contactPhone ? (
                <a
                  href={`tel:${contactPhone.replace(/\s+/g, "")}`}
                  data-cursor="link"
                  className="font-medium text-foreground hover:text-accent"
                >
                  {contactPhone}
                </a>
              ) : null}
            </div>
          ) : null}
        </div>

        <form action={formAction} className="flex flex-col gap-6">
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="absolute h-0 w-0 opacity-0"
            style={{ pointerEvents: "none" }}
          />
          {FIELDS.map((field) => (
            <div key={field.name} className="flex flex-col gap-2">
              <label htmlFor={field.name} className="sr-only">
                {field.placeholder}
              </label>
              {field.isTextarea ? (
                <textarea
                  id={field.name}
                  name={field.name}
                  rows={2}
                  required
                  minLength={10}
                  maxLength={field.maxLength}
                  className={fieldClasses}
                  placeholder={field.placeholder}
                />
              ) : (
                <input
                  id={field.name}
                  name={field.name}
                  type={field.type}
                  autoComplete={field.autoComplete}
                  required
                  maxLength={field.maxLength}
                  className={fieldClasses}
                  placeholder={field.placeholder}
                />
              )}
            </div>
          ))}

          <p role="alert" className="text-sm text-error empty:hidden">
            {state.error}
          </p>

          <p className="text-xs text-foreground-muted">
            Usi questi dati solo per risponderti. Dettagli nella{" "}
            <Link
              href="/privacy-policy"
              data-cursor="link"
              className="underline underline-offset-2 hover:text-foreground"
            >
              Privacy Policy
            </Link>
            .
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-5">
            <Button type="submit" size="lg" disabled={pending}>
              {pending ? "Invio in corso..." : "Invia"}
            </Button>
            <span className="font-display rotate-1 text-sm text-foreground-muted italic">
              (rispondo io — non un bot)
            </span>
          </div>
        </form>
      </div>
    </section>
  );
}

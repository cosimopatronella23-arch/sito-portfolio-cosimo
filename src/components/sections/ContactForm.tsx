"use client";

import { useActionState } from "react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { sendContactMessage } from "@/lib/actions/contact";
import { sectionStyle } from "@/lib/contrast";

const FIELDS: Array<{
  name: string;
  type: string;
  placeholder: string;
  autoComplete: string;
  isTextarea?: boolean;
}> = [
  {
    name: "name",
    type: "text",
    placeholder: "Come ti chiami?",
    autoComplete: "name",
  },
  {
    name: "email",
    type: "email",
    placeholder: "La tua email",
    autoComplete: "email",
  },
  {
    name: "message",
    type: "text",
    placeholder: "Raccontami del progetto",
    autoComplete: "off",
    isTextarea: true,
  },
];

const fieldClasses =
  "w-full border-0 border-b border-border-strong bg-transparent px-0 py-3 text-lg text-foreground placeholder:text-foreground-muted focus-visible:border-accent focus-visible:outline-none";

export function ContactForm({
  backgroundColor,
}: {
  backgroundColor?: string;
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
    <section id="contatti" style={style} className="container-px py-24 sm:py-32">
      <div className="grid grid-cols-1 gap-14 lg:grid-cols-[0.9fr_1.1fr]">
        <SectionHeading title="Raccontami cosa stai costruendo." />

        <form action={formAction} className="flex flex-col gap-6">
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
                  className={fieldClasses}
                  placeholder={field.placeholder}
                />
              )}
            </div>
          ))}

          {state.error ? (
            <p className="text-sm text-error">{state.error}</p>
          ) : null}

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

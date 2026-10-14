"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { sendContactMessage } from "@/lib/actions/contact";
import { AnimatedText } from "@/components/ui/AnimatedText";
import type { SectionTheme } from "@/lib/types";
import { formatPhone, phoneHref, whatsappHref } from "@/lib/phone";
import { WhatsAppIcon } from "@/components/contact/WhatsAppIcon";
import { trackLead } from "@/lib/analytics";

const FIELDS: Array<{
  name: string;
  type: string;
  label: string;
  placeholder: string;
  autoComplete: string;
  maxLength: number;
  isTextarea?: boolean;
}> = [
  {
    name: "name",
    type: "text",
    label: "Nome",
    placeholder: "Come ti chiami?",
    autoComplete: "name",
    maxLength: 100,
  },
  {
    name: "email",
    type: "email",
    label: "Email",
    placeholder: "La tua email, per risponderti",
    autoComplete: "email",
    maxLength: 254,
  },
  {
    name: "message",
    type: "text",
    label: "Il progetto",
    placeholder: "Raccontami cosa ti serve, anche solo un'idea",
    autoComplete: "off",
    maxLength: 5000,
    isTextarea: true,
  },
];

const fieldClasses =
  "w-full border-0 border-b-2 border-border-strong bg-transparent px-0 py-3 text-lg text-foreground placeholder:text-foreground-muted transition-colors focus-visible:border-foreground focus-visible:outline-none";

/**
 * Sezione finale: "Parliamo." gigante, contatti diretti (WhatsApp in primo
 * piano) e modulo con etichette sempre visibili. L'invio, l'anti-spam e il
 * conteggio dei contatti in Analytics sono quelli di sempre.
 */
export function ContactForm({
  theme = "secondary",
  eyebrow,
  title,
  text,
  contactEmail,
  contactPhone,
}: {
  theme?: SectionTheme;
  eyebrow: string;
  title: string;
  text: string;
  contactEmail?: string;
  contactPhone?: string;
}) {
  const [state, formAction, pending] = useActionState(sendContactMessage, {
    error: null,
  });

  useEffect(() => {
    if (state.success) trackLead("form");
  }, [state.success]);

  return (
    <section
      id="contatti"
      className={`theme-${theme} relative overflow-hidden container-px py-24 sm:py-32`}
    >
      {/* Forme decorative nell'angolo, che respirano lentamente. */}
      {/* Stanno nell'angolo in alto, lontano dal modulo. */}
      <span aria-hidden="true" className="shape-float-slow pointer-events-none absolute -top-28 -right-28 hidden size-56 rounded-full border-2 border-foreground lg:block" />
      <span aria-hidden="true" className="shape-float pointer-events-none absolute top-14 right-48 hidden size-12 bg-foreground lg:block" />

      <div className="relative grid grid-cols-1 gap-16 lg:grid-cols-12 lg:gap-6">
        <div className="flex flex-col gap-8 lg:col-span-6">
          <p className="text-xs font-semibold tracking-[0.14em] uppercase">{eyebrow}</p>
          <h2 className="font-display text-[clamp(4.5rem,13vw,13rem)] leading-[0.8] font-extrabold tracking-[-0.06em]">
            <AnimatedText text={title} />
          </h2>
          <p className="max-w-md text-xl leading-relaxed">{text}</p>

          {contactPhone || contactEmail ? (
            <div className="flex flex-col gap-4">
              {contactPhone ? (
                <Button
                  href={whatsappHref(contactPhone)}
                  size="lg"
                  arrow
                  className="w-full justify-between sm:w-max"
                >
                  <WhatsAppIcon className="h-5 w-5 text-[#25D366]" />
                  Scrivimi su WhatsApp
                </Button>
              ) : null}
              <div className="flex flex-col gap-1 text-base">
                {contactEmail ? (
                  <a href={`mailto:${contactEmail}`} data-cursor="link" className="link-draw w-max font-medium">
                    {contactEmail}
                  </a>
                ) : null}
                {contactPhone ? (
                  <a href={phoneHref(contactPhone)} data-cursor="link" className="link-draw w-max font-medium">
                    {formatPhone(contactPhone)}
                  </a>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>

        <div className="lg:col-span-5 lg:col-start-8 lg:self-end">
          {state.success ? (
            <div role="status" className="flex flex-col gap-3 border-2 border-foreground p-8">
              <p className="font-display text-3xl font-bold tracking-[-0.03em]">Ricevuto, grazie.</p>
              <p className="text-lg">Ti rispondo il prima possibile, di solito in giornata.</p>
            </div>
          ) : (
            <form action={formAction} className="flex flex-col gap-7">
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
                <div key={field.name} className="flex flex-col gap-1">
                  <label htmlFor={field.name} className="text-xs font-semibold tracking-[0.12em] uppercase">
                    {field.label}
                  </label>
                  {field.isTextarea ? (
                    <textarea
                      id={field.name}
                      name={field.name}
                      rows={3}
                      required
                      minLength={10}
                      maxLength={field.maxLength}
                      className={`${fieldClasses} resize-y`}
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

              <p role="alert" className="border-l-2 border-foreground pl-3 text-sm font-medium empty:hidden">
                {state.error}
              </p>

              <p className="text-sm">
                Uso questi dati solo per risponderti. Dettagli nella{" "}
                <Link href="/privacy-policy" data-cursor="link" className="link-draw font-medium">
                  Privacy Policy
                </Link>
                .
              </p>

              <Button type="submit" size="lg" arrow disabled={pending} className="w-full justify-between sm:w-max">
                {pending ? "Invio in corso..." : "Invia il messaggio"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

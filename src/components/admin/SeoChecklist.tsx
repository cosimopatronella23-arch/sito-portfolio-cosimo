"use client";

import { useEffect, useState } from "react";
import { AdminIcon } from "./AdminIcons";

// " | Cosimo Patronella" aggiunto dal sito a ogni titolo di pagina.
const TITLE_SUFFIX_LENGTH = 20;
// Google mostra circa 60-62 caratteri: equivale ai "massimo 42 caratteri"
// consigliati nei campi Titolo SEO.
const TITLE_MAX = 62;

type Check = { ok: boolean; label: string };

function value(form: HTMLFormElement, name?: string) {
  if (!name) return "";
  const field = form.elements.namedItem(name);
  if (!field || field instanceof RadioNodeList) return "";
  return String((field as HTMLInputElement).value ?? "").trim();
}

function firstValue(form: HTMLFormElement, names: string[]) {
  for (const name of names) {
    const v = value(form, name);
    if (v) return v;
  }
  return "";
}

/**
 * Controllo SEO leggero, in stile Yoast ma essenziale: legge i campi del
 * modulo in cui si trova mentre scrivi. Solo indicazioni, non blocca mai
 * il salvataggio.
 */
export function SeoChecklist({
  titleFields,
  descriptionFields,
  imageFields,
  contentField,
  galleryField,
}: {
  /** In ordine di priorità, es. ["seo_title", "title"]. */
  titleFields: string[];
  descriptionFields: string[];
  imageFields: string[];
  contentField?: string;
  galleryField?: string;
}) {
  const [checks, setChecks] = useState<Check[]>([]);
  const [root, setRoot] = useState<HTMLElement | null>(null);
  // Chiave stabile: gli array delle props sono nuovi a ogni render e farebbero
  // ripartire l'effect in continuazione.
  const configKey = JSON.stringify([
    titleFields,
    descriptionFields,
    imageFields,
    contentField ?? "",
    galleryField ?? "",
  ]);

  useEffect(() => {
    const form = root?.closest("form");
    if (!form) return;
    const [
      titleFields,
      descriptionFields,
      imageFields,
      contentField,
      galleryField,
    ] = JSON.parse(configKey) as [string[], string[], string[], string, string];
    let lastKey = "";

    const evaluate = () => {
      const title = firstValue(form, titleFields);
      const titleLength = title.length + TITLE_SUFFIX_LENGTH;
      const description = firstValue(form, descriptionFields);
      const image = firstValue(form, imageFields);
      const content = value(form, contentField);
      const next: Check[] = [
        {
          ok: !!title && titleLength <= TITLE_MAX,
          label: !title
            ? "Manca il titolo"
            : titleLength <= TITLE_MAX
              ? "Titolo per Google della lunghezza giusta"
              : `Titolo per Google troppo lungo (${titleLength}/${TITLE_MAX}): verrà tagliato`,
        },
        {
          ok: description.length >= 70 && description.length <= 160,
          label: !description
            ? "Manca la descrizione per Google"
            : description.length < 70
              ? `Descrizione per Google corta (${description.length}/70 minimo)`
              : description.length > 160
                ? `Descrizione per Google lunga (${description.length}/160)`
                : "Descrizione per Google della lunghezza giusta",
        },
        {
          ok: !!image,
          label: image
            ? "Immagine per la condivisione presente"
            : "Manca un'immagine (copertina o condivisione social)",
        },
      ];
      if (contentField) {
        const internal =
          /href=\\?"(\/(?!\/)|https?:\/\/(www\.)?cosimopatronella\.it)/.test(
            content,
          );
        next.push({
          ok: internal,
          label: internal
            ? "Il testo contiene link ad altre pagine del tuo sito"
            : "Il testo non ha link ad altre pagine del tuo sito (es. un servizio o un progetto): aggiungine uno",
        });
      }
      if (galleryField) {
        try {
          const items = JSON.parse(value(form, galleryField) || "[]") as {
            url: string;
            alt?: string;
          }[];
          const images = items.filter(
            (i) => i.url && !/\.(mp4|webm)(\?|$)/i.test(i.url),
          );
          const missing = images.filter((i) => !i.alt?.trim()).length;
          if (images.length) {
            next.push({
              ok: missing === 0,
              label:
                missing === 0
                  ? "Tutte le immagini della galleria hanno una descrizione"
                  : `${missing} immagini della galleria senza descrizione`,
            });
          }
        } catch {
          /* galleria non leggibile: nessun controllo */
        }
      }
      const key = JSON.stringify(next);
      if (key !== lastKey) {
        lastKey = key;
        setChecks(next);
      }
    };

    evaluate();
    form.addEventListener("input", evaluate);
    form.addEventListener("change", evaluate);
    // Gli editor (immagini, galleria, testo ricco) aggiornano campi nascosti
    // senza eventi: un controllo leggero ogni due secondi li segue.
    const id = window.setInterval(evaluate, 2000);
    return () => {
      form.removeEventListener("input", evaluate);
      form.removeEventListener("change", evaluate);
      window.clearInterval(id);
    };
  }, [root, configKey]);

  const passed = checks.filter((c) => c.ok).length;

  return (
    <section ref={setRoot} className="flex flex-col gap-3">
      <h3 className="flex items-center justify-between text-sm font-medium">
        Controllo SEO
        {checks.length ? (
          <span className="text-xs text-foreground-muted tabular-nums">
            {passed}/{checks.length}
          </span>
        ) : null}
      </h3>
      <ul className="flex flex-col gap-2">
        {checks.map((check) => (
          <li key={check.label} className="flex gap-2 text-xs leading-relaxed">
            <AdminIcon
              name={check.ok ? "check" : "alert"}
              className={
                check.ok
                  ? "mt-0.5 h-3.5 w-3.5 shrink-0 text-success"
                  : "mt-0.5 h-3.5 w-3.5 shrink-0 text-warning"
              }
            />
            <span className={check.ok ? "text-foreground-muted" : ""}>
              {check.label}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

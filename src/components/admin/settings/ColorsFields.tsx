"use client";

import { useState } from "react";
import { contrastRatio } from "@/lib/contrast";
import { FieldRow, inputClass } from "./FieldRow";

const DEFAULT_BACKGROUND = "#0b0a10";
const DEFAULT_FOREGROUND = "#f6f2ea";

function ColorInput({
  id,
  name,
  value,
  onChange,
}: {
  id: string;
  name: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Scegli il colore"
        className="size-11 shrink-0 cursor-pointer border border-border-strong bg-transparent"
      />
      <input id={id} name={name} value={value} onChange={(e) => onChange(e.target.value)} pattern="#[0-9a-fA-F]{6}" className={`${inputClass} max-w-40 font-mono`} />
    </div>
  );
}

/** Colori del sito con anteprima e controllo del contrasto. */
export function ColorsFields({
  accent,
  background,
  foreground,
}: {
  accent: string;
  background: string;
  foreground: string;
}) {
  const [a, setA] = useState(accent);
  const [bg, setBg] = useState(background || DEFAULT_BACKGROUND);
  const [fg, setFg] = useState(foreground || DEFAULT_FOREGROUND);
  const ratio = contrastRatio(bg, fg);

  return (
    <>
      <FieldRow label="Colore accento" help="Pulsanti, link e dettagli. È il più sicuro da cambiare." htmlFor="accent_color">
        <ColorInput id="accent_color" name="accent_color" value={a} onChange={setA} />
      </FieldRow>
      <FieldRow label="Sfondo" help="Lo sfondo scuro principale del sito." htmlFor="background_color">
        <ColorInput id="background_color" name="background_color" value={bg} onChange={setBg} />
      </FieldRow>
      <FieldRow label="Testo" help="Il colore del testo sullo sfondo." htmlFor="foreground_color">
        <ColorInput id="foreground_color" name="foreground_color" value={fg} onChange={setFg} />
      </FieldRow>
      <FieldRow label="Anteprima" help="Testo e sfondo devono restare ben leggibili.">
        <div className="flex flex-col gap-2 border border-border-strong p-6" style={{ backgroundColor: bg, color: fg }}>
          <span className="font-display text-xl font-semibold">Grafica e web design.</span>
          <span style={{ color: a }} className="text-sm font-semibold">
            Un dettaglio con il colore accento.
          </span>
        </div>
        {ratio !== null ? (
          <p className={`mt-3 text-sm ${ratio < 4.5 ? "text-warning" : "text-success"}`}>
            Contrasto {ratio.toFixed(1)}:1 —{" "}
            {ratio < 4.5 ? "sotto il minimo consigliato (4.5:1): il testo sarà difficile da leggere." : "buono."}
          </p>
        ) : null}
      </FieldRow>
    </>
  );
}

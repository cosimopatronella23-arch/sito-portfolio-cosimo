import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

/**
 * Anteprima di condivisione (WhatsApp, LinkedIn, Facebook...) generata dal
 * sito: niente immagini decorative, solo il titolo nello stile del sito.
 * Fondo inchiostro, testo carta, un solo accento lavanda. Usata da articoli,
 * pagina blog e pagine legali, così hanno tutte la stessa anteprima.
 */
export const ogSize = { width: 1200, height: 630 };

const INK = "#0b0a10";
const PAPER = "#f3efe6";
const MUTED = "#a39dae";
const ACCENT = "#d1c8f1";

export async function renderOgImage({
  title,
  category,
  footer,
}: {
  title: string;
  category?: string | null;
  footer: string;
}) {
  const size = ogSize;
  const [sora, manrope] = await Promise.all([
    readFile(join(process.cwd(), "assets/fonts/Sora-Bold.woff")),
    readFile(join(process.cwd(), "assets/fonts/Manrope-Medium.woff")),
  ]);
  // Titoli lunghi una taglia sotto, così stanno sempre in tre-quattro righe.
  const titleSize = title.length > 70 ? 58 : title.length > 45 ? 68 : 80;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: INK,
          color: PAPER,
          fontFamily: "Manrope",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ display: "flex", position: "relative", width: 40, height: 24 }}>
            <div style={{ position: "absolute", left: 0, width: 24, height: 24, borderRadius: 12, background: PAPER }} />
            <div style={{ position: "absolute", left: 16, width: 24, height: 24, borderRadius: 12, background: ACCENT }} />
          </div>
          <div style={{ fontFamily: "Sora", fontSize: 22, letterSpacing: 3 }}>COSIMO PATRONELLA</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          {category ? (
            <div
              style={{
                display: "flex",
                alignSelf: "flex-start",
                background: ACCENT,
                color: INK,
                fontSize: 20,
                letterSpacing: 2,
                padding: "8px 16px",
              }}
            >
              {category.toUpperCase()}
            </div>
          ) : null}
          <div
            style={{
              fontFamily: "Sora",
              fontSize: titleSize,
              lineHeight: 1.05,
              letterSpacing: -2,
              maxWidth: 1000,
            }}
          >
            {title}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 24, color: MUTED }}>
          <div>{footer}</div>
          <div>Web design · Grafica · SEO</div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Sora", data: sora, weight: 700, style: "normal" },
        { name: "Manrope", data: manrope, weight: 500, style: "normal" },
      ],
    },
  );
}

import { Sora, Manrope } from "next/font/google";

export const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

// Manrope al posto di Inter: stessa leggibilità ma con più carattere (occhio
// più largo, terminali leggermente arrotondati) — meno "font di sistema",
// più coerente con un display font deciso come Sora.
export const inter = Manrope({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

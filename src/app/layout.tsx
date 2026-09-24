import type { Metadata, Viewport } from "next";
import "./globals.css";
import { sora, inter } from "@/lib/fonts";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Cosimo Patronella — Graphic & Web Designer",
  description:
    "Graphic designer e web designer: identità visive, siti web e comunicazione su misura.",
  // "?v=2" forza i browser a trattarla come una risorsa diversa da quella
  // già in cache — senza, un cambio favicon può restare invisibile per
  // giorni finché la cache non scade da sola. Aumenta il numero se in
  // futuro la cambi di nuovo.
  icons: { icon: "/favicon.svg?v=2" },
};

export const viewport: Viewport = {
  themeColor: "#0b0a10",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="it" className={`${sora.variable} ${inter.variable} h-full`}>
      <body id="top" className="flex min-h-full flex-col antialiased">
        {children}
      </body>
    </html>
  );
}

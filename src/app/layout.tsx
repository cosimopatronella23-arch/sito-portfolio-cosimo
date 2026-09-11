import type { Metadata, Viewport } from "next";
import "./globals.css";
import { sora, inter } from "@/lib/fonts";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Cosimo Patronella — Web Designer",
  description:
    "Portfolio di Cosimo Patronella: siti e prodotti digitali su misura, design premium e sviluppo frontend moderno.",
  icons: { icon: "/favicon.svg" },
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

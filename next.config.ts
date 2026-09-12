import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Immagini caricate da /admin su Supabase Storage.
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co", pathname: "/storage/**" },
    ],
    // AVIF quando il browser lo supporta (file più leggeri di WebP), con
    // fallback automatico a WebP altrimenti — nessuna differenza visiva.
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;

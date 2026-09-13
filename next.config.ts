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
  // Non rivelare che il sito gira su Next.js (header "X-Powered-By").
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          // Nessuna pagina del sito deve essere incorporata in un <iframe>
          // altrui (protezione da clickjacking sul login /admin incluso).
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
    ];
  },
};

export default nextConfig;

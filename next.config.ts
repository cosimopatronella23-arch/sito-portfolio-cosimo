import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Immagini caricate da /admin su Supabase Storage.
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co", pathname: "/storage/**" },
    ],
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const config: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  experimental: {
    // Image upload caps at 5MB (lib/storage.ts); allow headroom for the
    // multipart envelope + other form fields. Default is 1MB, too small.
    serverActions: { bodySizeLimit: "6mb" },
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "*.supabase.in" },
    ],
  },
};

export default config;

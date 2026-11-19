import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Los tests e2e compilan en otra carpeta (NEXT_DIST_DIR=.next-e2e) para no
  // pisar la caché de `npm run dev` si está encendido a la vez.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;

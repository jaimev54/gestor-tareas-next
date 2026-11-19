import type { NextConfig } from "next";

// Cabeceras de seguridad para todas las respuestas.
const securityHeaders = [
  // No permitir que otro sitio cargue la app dentro de un iframe (clickjacking).
  { key: "X-Frame-Options", value: "DENY" },
  // El navegador no debe "adivinar" el tipo de un archivo distinto al declarado.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Al salir hacia otro sitio, solo se envía el dominio, no la URL completa (con filtros, ids…).
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // La app no usa cámara, micrófono ni ubicación: se bloquean.
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
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

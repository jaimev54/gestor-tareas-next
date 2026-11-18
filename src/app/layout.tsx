import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { ThemeScript } from "@/components/layout/ThemeScript";
import { SITE } from "@/lib/site";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // Cada página define su título; el template le añade el nombre de la app.
  title: { default: SITE.name, template: `%s · ${SITE.name}` },
  description: SITE.description,
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // suppressHydrationWarning: ThemeScript cambia data-theme antes de que React
    // hidrate; sin esto React avisaría de que el HTML no coincide.
    <html
      lang="es"
      data-theme="light"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <ThemeScript />
        <a
          href="#contenido"
          className="sr-only rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50"
        >
          Saltar al contenido
        </a>
        {children}
      </body>
    </html>
  );
}

"use client";

import { useServerInsertedHTML } from "next/navigation";
import { useRef } from "react";

import { themeInitScript } from "@/lib/theme";

/**
 * Inserta el script de tema en el HTML del servidor (una sola vez).
 * Así se aplica el tema antes de pintar, sin el aviso de React sobre <script> en componentes.
 */
export function ThemeScript() {
  const inserted = useRef(false);

  useServerInsertedHTML(() => {
    if (inserted.current) return null;
    inserted.current = true;
    return <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />;
  });

  return null;
}

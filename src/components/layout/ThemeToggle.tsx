"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useEffect, useSyncExternalStore } from "react";

import {
  THEME_CHANGE_EVENT,
  type ThemePreference,
  applyThemePreference,
  readThemePreference,
} from "@/lib/theme";

const NEXT: Record<ThemePreference, ThemePreference> = {
  system: "light",
  light: "dark",
  dark: "system",
};

const LABELS: Record<ThemePreference, string> = {
  system: "Tema: sistema",
  light: "Tema: claro",
  dark: "Tema: oscuro",
};

function subscribe(callback: () => void) {
  window.addEventListener(THEME_CHANGE_EVENT, callback);
  window.addEventListener("storage", callback); // cambios desde otra pestaña
  return () => {
    window.removeEventListener(THEME_CHANGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

/** Botón que alterna sistema → claro → oscuro. */
export function ThemeToggle() {
  // useSyncExternalStore lee localStorage sin desajustes de hidratación:
  // en el servidor usa "system" y en el navegador el valor real.
  const preference = useSyncExternalStore(subscribe, readThemePreference, () => "system" as const);

  // Si la preferencia es "system", seguir los cambios del sistema operativo en vivo.
  useEffect(() => {
    if (preference !== "system") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyThemePreference("system");
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [preference]);

  const Icon = preference === "dark" ? Moon : preference === "light" ? Sun : Monitor;
  const next = NEXT[preference];

  return (
    <button
      type="button"
      onClick={() => applyThemePreference(next)}
      title={`${LABELS[preference]} (cambiar a ${LABELS[next].replace("Tema: ", "")})`}
      aria-label={`${LABELS[preference]}. Cambiar a ${LABELS[next].replace("Tema: ", "")}`}
      className="inline-flex size-9 items-center justify-center rounded-lg text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
    >
      <Icon className="size-5" aria-hidden="true" />
    </button>
  );
}

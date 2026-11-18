// Tema claro/oscuro. La preferencia se guarda en localStorage:
//   "light" | "dark" | "system" (o nada = system)
// y se aplica como <html data-theme="light|dark">.

export type ThemePreference = "light" | "dark" | "system";

export const THEME_STORAGE_KEY = "theme";
export const THEME_CHANGE_EVENT = "themechange";

/**
 * Script que va inline en <head>: se ejecuta antes de pintar la página,
 * así no hay "parpadeo" blanco al cargar en modo oscuro.
 * Debe ser JS plano (no se compila) y no fallar nunca: por eso el try/catch.
 */
export const themeInitScript = `(function(){try{var p=localStorage.getItem("${THEME_STORAGE_KEY}");var d=p==="dark"||(p!=="light"&&matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.setAttribute("data-theme",d?"dark":"light")}catch(e){}})()`;

export function resolveTheme(preference: ThemePreference): "light" | "dark" {
  if (preference !== "system") return preference;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function readThemePreference(): ThemePreference {
  try {
    const value = localStorage.getItem(THEME_STORAGE_KEY);
    return value === "light" || value === "dark" ? value : "system";
  } catch {
    return "system";
  }
}

export function applyThemePreference(preference: ThemePreference) {
  try {
    if (preference === "system") localStorage.removeItem(THEME_STORAGE_KEY);
    else localStorage.setItem(THEME_STORAGE_KEY, preference);
  } catch {
    // localStorage bloqueado (modo privado): el tema se aplica igual en esta visita
  }
  document.documentElement.setAttribute("data-theme", resolveTheme(preference));
  window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
}

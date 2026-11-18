// Rutas de la app en un solo lugar, para no repetir strings sueltos.
export const ROUTES = {
  home: "/",
  login: "/login",
  signup: "/registro",
  forgotPassword: "/recuperar-contrasena",
  resetPassword: "/nueva-contrasena",
  authConfirm: "/auth/confirm",
  tasks: "/tareas",
  projects: "/proyectos",
} as const;

/** Enlaces de la barra de navegación del área privada (se irán sumando en cada paso). */
export const APP_NAV_LINKS = [
  { href: ROUTES.tasks, label: "Tareas" },
  { href: ROUTES.projects, label: "Proyectos" },
] as const;

/** Página a la que va un usuario después de iniciar sesión. */
export const DEFAULT_AFTER_LOGIN = ROUTES.tasks;

/** Rutas que exigen sesión (también sus subrutas). */
export const PROTECTED_PREFIXES = [ROUTES.tasks, ROUTES.projects, ROUTES.resetPassword];

/** Rutas solo para visitantes: con sesión no tiene sentido verlas. */
export const GUEST_ONLY = [ROUTES.login, ROUTES.signup, ROUTES.forgotPassword];

export function matchesPrefix(pathname: string, prefixes: readonly string[]) {
  return prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

/**
 * Valida un parámetro `next` para redirigir después de un login o de un enlace del correo.
 * Solo acepta rutas internas: evita que alguien use la app para mandar a otro sitio
 * (ataque de "open redirect").
 */
export function safeNextPath(next: string | null | undefined, fallback: string = DEFAULT_AFTER_LOGIN) {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) {
    return fallback;
  }
  return next;
}

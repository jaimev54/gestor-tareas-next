// Cuenta demo: permite probar la app sin registrarse.
// El correo es público (aparece en el README); la contraseña SOLO vive en la variable
// de entorno DEMO_PASSWORD del servidor (nunca en el código ni con prefijo NEXT_PUBLIC_).
// Debe coincidir con el correo que comprueba la función reset_demo_data (migración 0005).

export const DEMO_EMAIL = "demo@example.com";

export function isDemoEmail(email: string | null | undefined) {
  return email?.toLowerCase() === DEMO_EMAIL;
}

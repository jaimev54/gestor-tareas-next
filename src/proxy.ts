import type { NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/proxy";

// En Next 16 "middleware" pasó a llamarse "proxy". Se ejecuta antes de cada petición.
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Todas las rutas excepto archivos estáticos e imágenes (no necesitan sesión).
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml)$).*)",
  ],
};

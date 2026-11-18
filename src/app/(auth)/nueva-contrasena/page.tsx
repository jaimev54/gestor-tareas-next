import type { Metadata } from "next";

import { AuthHeader } from "@/components/auth/AuthHeader";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Nueva contraseña",
  robots: { index: false },
};

// Se llega aquí desde el enlace del correo (pasando por /auth/confirm, que inicia la sesión).
// El proxy redirige al login si no hay sesión.
export default function ResetPasswordPage() {
  return (
    <>
      <AuthHeader title="Crea una contraseña nueva" />
      <ResetPasswordForm />
    </>
  );
}

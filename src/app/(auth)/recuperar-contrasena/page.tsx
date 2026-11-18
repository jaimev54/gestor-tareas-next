import type { Metadata } from "next";
import Link from "next/link";

import { AuthHeader } from "@/components/auth/AuthHeader";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { ROUTES } from "@/lib/routes";

export const metadata: Metadata = {
  title: "Recuperar contraseña",
  description: "Recibe un enlace para crear una contraseña nueva.",
};

export default function ForgotPasswordPage() {
  return (
    <>
      <AuthHeader
        title="Recupera tu contraseña"
        description="Te enviaremos un enlace para crear una nueva."
      />
      <ForgotPasswordForm />
      <p className="mt-6 text-center text-sm">
        <Link href={ROUTES.login} className="font-medium text-indigo-600 hover:underline dark:text-indigo-400">
          Volver a iniciar sesión
        </Link>
      </p>
    </>
  );
}

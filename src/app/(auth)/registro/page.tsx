import type { Metadata } from "next";
import Link from "next/link";

import { AuthHeader } from "@/components/auth/AuthHeader";
import { SignupForm } from "@/components/auth/SignupForm";
import { ROUTES } from "@/lib/routes";

export const metadata: Metadata = {
  title: "Crear cuenta",
  description: "Crea tu cuenta gratis y organiza tus tareas.",
};

export default function SignupPage() {
  return (
    <>
      <AuthHeader title="Crea tu cuenta" description="Gratis. Solo necesitas un correo." />
      <SignupForm />
      <p className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
        ¿Ya tienes cuenta?{" "}
        <Link href={ROUTES.login} className="font-medium text-indigo-600 hover:underline dark:text-indigo-400">
          Inicia sesión
        </Link>
      </p>
    </>
  );
}

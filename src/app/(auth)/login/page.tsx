import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { AuthHeader } from "@/components/auth/AuthHeader";
import { DemoButton } from "@/components/auth/DemoButton";
import { LoginForm } from "@/components/auth/LoginForm";
import { ROUTES } from "@/lib/routes";

export const metadata: Metadata = {
  title: "Iniciar sesión",
  description: "Entra a tu gestor de tareas.",
};

const NOTICES: Record<string, string> = {
  "enlace-invalido": "El enlace no es válido o ya caducó. Pide uno nuevo.",
};

// searchParams se conoce solo al recibir la petición. Con Cache Components,
// lo que depende de él va dentro de <Suspense>; el resto se prerenderiza.
async function LoginFormWithParams({ searchParams }: PageProps<"/login">) {
  const { next, error } = await searchParams;
  return (
    <LoginForm
      next={typeof next === "string" ? next : undefined}
      notice={typeof error === "string" ? NOTICES[error] : undefined}
    />
  );
}

export default function LoginPage(props: PageProps<"/login">) {
  return (
    <>
      <AuthHeader title="Inicia sesión" description="Bienvenido de nuevo." />
      <Suspense fallback={<LoginForm />}>
        <LoginFormWithParams {...props} />
      </Suspense>
      {process.env.DEMO_PASSWORD && (
        <>
          <div className="my-6 flex items-center gap-3 text-xs text-zinc-500" aria-hidden="true">
            <span className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />o
            <span className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
          </div>
          <DemoButton />
        </>
      )}
      <p className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
        ¿No tienes cuenta?{" "}
        <Link href={ROUTES.signup} className="font-medium text-indigo-600 hover:underline dark:text-indigo-400">
          Regístrate
        </Link>
      </p>
    </>
  );
}

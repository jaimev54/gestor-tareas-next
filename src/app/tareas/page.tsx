import type { Metadata } from "next";
import { Suspense } from "react";

import { logout } from "@/lib/auth/actions";
import { requireUser } from "@/lib/auth/user";

export const metadata: Metadata = {
  title: "Mis tareas",
  robots: { index: false },
};

// Página provisional para probar la autenticación. En el paso 6 será la lista de tareas.
async function Welcome() {
  const { supabase, userId, email } = await requireUser();

  // Gracias a RLS esta consulta solo puede devolver TU perfil, aunque no filtremos por id.
  const { data: profiles } = await supabase.from("profiles").select("id, full_name");
  const profile = profiles?.find((p) => p.id === userId);

  return (
    <div className="space-y-2">
      <p>
        Hola, <strong>{profile?.full_name ?? email}</strong>.
      </p>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Sesión iniciada como {email}. Perfiles visibles para ti: {profiles?.length ?? 0}.
      </p>
    </div>
  );
}

export default function TasksPage() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 space-y-6 px-4 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">Mis tareas</h1>
      <Suspense fallback={<p className="text-zinc-500">Cargando…</p>}>
        <Welcome />
      </Suspense>
      <form action={logout}>
        <button
          type="submit"
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
          Cerrar sesión
        </button>
      </form>
    </main>
  );
}

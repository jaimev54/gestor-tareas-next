import type { Metadata } from "next";
import { Suspense } from "react";

import { getCurrentProfile } from "@/lib/auth/profile";

export const metadata: Metadata = {
  title: "Mis tareas",
  robots: { index: false },
};

// Página provisional. En el paso 6 será la lista de tareas.
async function Greeting() {
  const { name } = await getCurrentProfile();
  return <p className="text-zinc-600 dark:text-zinc-400">Hola, {name}. Aquí verás tus tareas.</p>;
}

export default function TasksPage() {
  return (
    <div className="space-y-2">
      <h1 className="text-3xl font-semibold tracking-tight">Mis tareas</h1>
      <Suspense fallback={<p className="h-6" />}>
        <Greeting />
      </Suspense>
    </div>
  );
}

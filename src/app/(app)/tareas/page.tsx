import { ListTodo } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";

import { TaskItem } from "@/components/tasks/TaskItem";
import { TaskQuickAdd } from "@/components/tasks/TaskQuickAdd";
import { getTags } from "@/lib/tags/queries";
import { getProjectOptions, getTasks } from "@/lib/tasks/queries";

export const metadata: Metadata = {
  title: "Mis tareas",
  robots: { index: false },
};

async function TasksContent() {
  // Tareas, proyectos y etiquetas en paralelo.
  const [{ open, done, doneTotal }, projects, tags] = await Promise.all([
    getTasks(),
    getProjectOptions(),
    getTags(),
  ]);

  return (
    <div className="space-y-8">
      <TaskQuickAdd projects={projects} />

      <section aria-labelledby="open-title">
        <h2 id="open-title" className="mb-3 text-sm font-semibold tracking-wide text-zinc-500 uppercase">
          Pendientes <span className="font-normal">({open.length})</span>
        </h2>
        {open.length === 0 ? (
          <div className="flex flex-col items-center rounded-2xl border border-dashed border-zinc-300 px-6 py-10 text-center dark:border-zinc-700">
            <ListTodo className="size-10 text-zinc-400" aria-hidden="true" />
            <p className="mt-3 font-semibold">
              {done.length > 0 ? "¡Todo al día!" : "Aún no tienes tareas"}
            </p>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Escribe una arriba y pulsa Enter.
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {open.map((task) => (
              <li key={task.id}>
                <TaskItem task={task} projects={projects} tags={tags} />
              </li>
            ))}
          </ul>
        )}
      </section>

      {done.length > 0 && (
        // <details>: sección plegable nativa, accesible y sin JavaScript.
        <details className="group">
          <summary className="mb-3 cursor-pointer list-none text-sm font-semibold tracking-wide text-zinc-500 uppercase select-none">
            <span className="inline-block transition group-open:rotate-90" aria-hidden="true">
              ▸
            </span>{" "}
            Completadas <span className="font-normal">({doneTotal})</span>
          </summary>
          <ul className="space-y-2">
            {done.map((task) => (
              <li key={task.id}>
                <TaskItem task={task} projects={projects} tags={tags} />
              </li>
            ))}
          </ul>
          {doneTotal > done.length && (
            <p className="mt-3 text-sm text-zinc-500">Mostrando las {done.length} más recientes.</p>
          )}
        </details>
      )}
    </div>
  );
}

function TasksSkeleton() {
  return (
    <div className="space-y-3" aria-hidden="true">
      <div className="h-36 animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-900" />
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-16 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-900" />
      ))}
    </div>
  );
}

export default function TasksPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight">Mis tareas</h1>
      <Suspense fallback={<TasksSkeleton />}>
        <TasksContent />
      </Suspense>
    </div>
  );
}

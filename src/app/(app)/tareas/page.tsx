import { ListTodo, SearchX } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { TaskFiltersBar } from "@/components/tasks/TaskFiltersBar";
import { TaskItem } from "@/components/tasks/TaskItem";
import { TaskQuickAdd } from "@/components/tasks/TaskQuickAdd";
import { ViewSwitch } from "@/components/tasks/ViewSwitch";
import { type Tag, getTags } from "@/lib/tags/queries";
import { INBOX, countActiveFilters, parseTaskFilters, tasksUrl } from "@/lib/tasks/filters";
import { type Task, type TaskProject, getProjectOptions, getTasks } from "@/lib/tasks/queries";

export const metadata: Metadata = {
  title: "Mis tareas",
  robots: { index: false },
};

type ListProps = { tasks: Task[]; projects: TaskProject[]; tags: Tag[] };

function TaskList({ tasks, projects, tags }: ListProps) {
  return (
    <ul className="space-y-2">
      {tasks.map((task) => (
        <li key={task.id}>
          <TaskItem task={task} projects={projects} tags={tags} />
        </li>
      ))}
    </ul>
  );
}

const sectionTitle = "mb-3 text-sm font-semibold tracking-wide text-zinc-500 uppercase";

async function TasksContent({ searchParams }: PageProps<"/tareas">) {
  // La URL es el estado de los filtros: /tareas?q=...&proyecto=...
  const filters = parseTaskFilters(await searchParams);
  const filtering = countActiveFilters(filters) > 0;

  // Tareas, proyectos y etiquetas en paralelo.
  const [{ open, done, doneTotal, showOpen, showDone }, projects, tags] = await Promise.all([
    getTasks(filters),
    getProjectOptions(),
    getTags(),
  ]);

  const nothingFound = filtering && open.length === 0 && done.length === 0;
  // Si filtras por un proyecto, el alta rápida lo propone por defecto.
  const quickAddProject = filters.project && filters.project !== INBOX ? filters.project : "";

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-semibold tracking-tight">Mis tareas</h1>
        <ViewSwitch current="list" filters={filters} />
      </div>
      <TaskQuickAdd projects={projects} defaultProjectId={quickAddProject} />
      <TaskFiltersBar filters={filters} projects={projects} tags={tags} />

      {nothingFound ? (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-zinc-300 px-6 py-10 text-center dark:border-zinc-700">
          <SearchX className="size-10 text-zinc-400" aria-hidden="true" />
          <p className="mt-3 font-semibold">Ninguna tarea coincide con los filtros</p>
          <Link
            href={tasksUrl({})}
            className="mt-2 text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
          >
            Ver todas las tareas
          </Link>
        </div>
      ) : (
        <>
          {showOpen && (
            <section aria-labelledby="open-title">
              <h2 id="open-title" className={sectionTitle}>
                Pendientes <span className="font-normal">({open.length})</span>
              </h2>
              {open.length === 0 ? (
                <div className="flex flex-col items-center rounded-2xl border border-dashed border-zinc-300 px-6 py-10 text-center dark:border-zinc-700">
                  <ListTodo className="size-10 text-zinc-400" aria-hidden="true" />
                  <p className="mt-3 font-semibold">
                    {done.length > 0 ? "¡Todo al día!" : "Aún no tienes tareas"}
                  </p>
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Escribe una arriba y pulsa Enter.</p>
                </div>
              ) : (
                <TaskList tasks={open} projects={projects} tags={tags} />
              )}
            </section>
          )}

          {showDone && done.length > 0 && !showOpen && (
            // Filtrando por "Hecha": las completadas son el contenido principal, sin plegar.
            <section aria-labelledby="done-title">
              <h2 id="done-title" className={sectionTitle}>
                Completadas <span className="font-normal">({doneTotal})</span>
              </h2>
              <TaskList tasks={done} projects={projects} tags={tags} />
            </section>
          )}

          {showDone && done.length > 0 && showOpen && (
            // <details>: sección plegable nativa. Se abre sola si hay filtros activos.
            <details className="group" open={filtering}>
              <summary className={`${sectionTitle} cursor-pointer list-none select-none`}>
                <span className="inline-block transition group-open:rotate-90" aria-hidden="true">
                  ▸
                </span>{" "}
                Completadas <span className="font-normal">({doneTotal})</span>
              </summary>
              <TaskList tasks={done} projects={projects} tags={tags} />
              {doneTotal > done.length && (
                <p className="mt-3 text-sm text-zinc-500">Mostrando las {done.length} más recientes.</p>
              )}
            </details>
          )}
        </>
      )}
    </div>
  );
}

function TasksSkeleton() {
  return (
    <div className="space-y-3" aria-hidden="true">
      <div className="h-10 w-48 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-900" />
      <div className="h-36 animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-900" />
      <div className="h-24 animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-900" />
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-16 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-900" />
      ))}
    </div>
  );
}

export default function TasksPage(props: PageProps<"/tareas">) {
  return (
    <div className="mx-auto max-w-3xl">
      {/* searchParams solo se conoce al recibir la petición: va dentro de <Suspense> */}
      <Suspense fallback={<TasksSkeleton />}>
        <TasksContent {...props} />
      </Suspense>
    </div>
  );
}

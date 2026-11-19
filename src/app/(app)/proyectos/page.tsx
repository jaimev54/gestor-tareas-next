import { FolderKanban } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";

import { ProjectCard } from "@/components/projects/ProjectCard";
import { ProjectForm } from "@/components/projects/ProjectForm";
import { TagManager } from "@/components/tags/TagManager";
import { getProjects } from "@/lib/projects/queries";
import { getTags } from "@/lib/tags/queries";

async function Tags() {
  const tags = await getTags();
  return <TagManager tags={tags} />;
}

export const metadata: Metadata = {
  title: "Proyectos y etiquetas",
  robots: { index: false },
};

// Server Component: lee los proyectos en el servidor y los pasa a las tarjetas (cliente).
// En Angular serían un resolver + componente; aquí la consulta vive en el propio componente.
async function ProjectList() {
  const projects = await getProjects();

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-2xl border border-dashed border-zinc-300 px-6 py-12 text-center dark:border-zinc-700">
        <FolderKanban className="size-10 text-zinc-400" aria-hidden="true" />
        <h2 className="mt-3 font-semibold">Aún no tienes proyectos</h2>
        <p className="mt-1 max-w-sm text-sm text-zinc-600 dark:text-zinc-400">
          Crea el primero para agrupar tus tareas, por ejemplo &quot;Trabajo&quot; o &quot;Casa&quot;.
        </p>
      </div>
    );
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {projects.map((project) => (
        <li key={project.id}>
          <ProjectCard project={project} />
        </li>
      ))}
    </ul>
  );
}

function ProjectListSkeleton() {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <li key={i} className="h-32 animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-900" />
      ))}
    </ul>
  );
}

export default function ProjectsPage() {
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_20rem] lg:items-start">
      <section aria-labelledby="projects-title" className="space-y-6">
        <header>
          <h1 id="projects-title" className="text-3xl font-semibold tracking-tight">
            Proyectos
          </h1>
          <p className="mt-1 text-zinc-600 dark:text-zinc-400">
            Agrupa tus tareas. Al borrar un proyecto se borran también sus tareas.
          </p>
        </header>
        <Suspense fallback={<ProjectListSkeleton />}>
          <ProjectList />
        </Suspense>
      </section>

      <aside className="space-y-6 lg:sticky lg:top-24">
        <section
          aria-labelledby="new-project-title"
          className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900/50"
        >
          <h2 id="new-project-title" className="mb-4 text-lg font-semibold">
            Nuevo proyecto
          </h2>
          <ProjectForm mode="create" />
        </section>

        <section
          aria-labelledby="tags-title"
          className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900/50"
        >
          <h2 id="tags-title" className="mb-4 text-lg font-semibold">
            Etiquetas
          </h2>
          <Suspense fallback={<div className="h-24 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800" />}>
            <Tags />
          </Suspense>
        </section>
      </aside>
    </div>
  );
}

"use client";

import { Pencil } from "lucide-react";
import { useCallback, useState } from "react";

import { COLOR_BORDER_TOP } from "@/lib/colors";
import type { ProjectSummary } from "@/lib/projects/queries";

import { DeleteProjectButton } from "./DeleteProjectButton";
import { ProjectForm } from "./ProjectForm";

/** Tarjeta de proyecto. Alterna entre vista y edición en el mismo sitio. */
export function ProjectCard({ project }: { project: ProjectSummary }) {
  const [editing, setEditing] = useState(false);
  const stopEditing = useCallback(() => setEditing(false), []);

  const doneCount = project.taskCount - project.openTaskCount;
  const progress = project.taskCount > 0 ? Math.round((doneCount / project.taskCount) * 100) : 0;

  return (
    <article
      className={`rounded-2xl border border-t-4 border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 ${COLOR_BORDER_TOP[project.color]}`}
    >
      {editing ? (
        <ProjectForm mode="edit" project={project} onDone={stopEditing} />
      ) : (
        <>
          <div className="flex items-start justify-between gap-2">
            <h2 className="min-w-0 text-lg font-semibold break-words">{project.name}</h2>
            <div className="flex shrink-0 items-center">
              <button
                type="button"
                onClick={() => setEditing(true)}
                aria-label={`Editar ${project.name}`}
                title="Editar"
                className="inline-flex size-8 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
              >
                <Pencil className="size-4" aria-hidden="true" />
              </button>
              <DeleteProjectButton
                projectId={project.id}
                projectName={project.name}
                taskCount={project.taskCount}
              />
            </div>
          </div>

          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            {project.taskCount === 0
              ? "Sin tareas todavía"
              : `${project.openTaskCount} pendientes · ${doneCount} hechas`}
          </p>

          {project.taskCount > 0 && (
            <div
              role="progressbar"
              aria-label={`Progreso de ${project.name}`}
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
              className="mt-4 h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800"
            >
              <div className="h-full rounded-full bg-indigo-600" style={{ width: `${progress}%` }} />
            </div>
          )}
        </>
      )}
    </article>
  );
}

"use client";

import { ConfirmDeleteButton } from "@/components/ui/ConfirmDeleteButton";
import { deleteProject } from "@/lib/projects/actions";

type DeleteProjectButtonProps = {
  projectId: string;
  projectName: string;
  taskCount: number;
};

export function DeleteProjectButton({ projectId, projectName, taskCount }: DeleteProjectButtonProps) {
  const tasksNote =
    taskCount > 0 ? `También se eliminarán sus ${taskCount} ${taskCount === 1 ? "tarea" : "tareas"}. ` : "";

  return (
    <ConfirmDeleteButton
      action={deleteProject.bind(null, projectId)}
      label={`Eliminar ${projectName}`}
      title={`¿Eliminar "${projectName}"?`}
      description={`${tasksNote}Esta acción no se puede deshacer.`}
    />
  );
}

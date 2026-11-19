import type { Metadata } from "next";
import { Suspense } from "react";

import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import { TaskFiltersBar } from "@/components/tasks/TaskFiltersBar";
import { TaskQuickAdd } from "@/components/tasks/TaskQuickAdd";
import { ViewSwitch } from "@/components/tasks/ViewSwitch";
import { ROUTES } from "@/lib/routes";
import { getTags } from "@/lib/tags/queries";
import { INBOX, parseTaskFilters } from "@/lib/tasks/filters";
import { BOARD_DONE_LIMIT, getBoardTasks, getProjectOptions } from "@/lib/tasks/queries";

export const metadata: Metadata = {
  title: "Tablero",
  robots: { index: false },
};

async function BoardContent({ searchParams }: PageProps<"/tablero">) {
  // Mismos filtros que la lista, salvo el estado (las columnas ya son los estados).
  const filters = { ...parseTaskFilters(await searchParams), status: "" as const };

  const [columns, projects, tags] = await Promise.all([getBoardTasks(filters), getProjectOptions(), getTags()]);
  const quickAddProject = filters.project && filters.project !== INBOX ? filters.project : "";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-semibold tracking-tight">Tablero</h1>
        <ViewSwitch current="board" filters={filters} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <TaskQuickAdd projects={projects} defaultProjectId={quickAddProject} />
        <TaskFiltersBar filters={filters} projects={projects} tags={tags} basePath={ROUTES.board} hideStatus />
      </div>

      <KanbanBoard
        columns={columns}
        projects={projects}
        tags={tags}
        doneNote={
          columns.done.length >= BOARD_DONE_LIMIT ? `Se muestran las ${BOARD_DONE_LIMIT} más recientes.` : undefined
        }
      />
    </div>
  );
}

function BoardSkeleton() {
  return (
    <div className="space-y-6" aria-hidden="true">
      <div className="h-10 w-48 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-900" />
      <div className="grid gap-4 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-80 animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-900" />
        ))}
      </div>
    </div>
  );
}

export default function BoardPage(props: PageProps<"/tablero">) {
  return (
    <Suspense fallback={<BoardSkeleton />}>
      <BoardContent {...props} />
    </Suspense>
  );
}

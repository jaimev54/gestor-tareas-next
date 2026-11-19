"use client";

import { Loader2, Search, SlidersHorizontal, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useOptimistic, useRef, useState, useTransition } from "react";

import { SelectField } from "@/components/ui/SelectField";
import type { Tag } from "@/lib/tags/queries";
import {
  DUE_PARAM,
  EMPTY_FILTERS,
  INBOX,
  PRIORITY_PARAM,
  STATUS_PARAM,
  type TaskFilters,
  countActiveFilters,
  tasksUrl,
} from "@/lib/tasks/filters";
import { PRIORITY_LABELS, STATUS_LABELS } from "@/lib/tasks/constants";
import type { TaskProject } from "@/lib/tasks/queries";

const DUE_LABELS: Record<(typeof DUE_PARAM)[number], string> = {
  vencidas: "Vencidas",
  hoy: "Vencen hoy",
  semana: "Próximos 7 días",
  "sin-fecha": "Sin fecha",
};

const SEARCH_DEBOUNCE_MS = 300;

type TaskFiltersBarProps = {
  filters: TaskFilters;
  projects: TaskProject[];
  tags: Tag[];
};

/**
 * Búsqueda y filtros. No guarda estado propio: la fuente de verdad es la URL.
 * Cambiar un filtro = navegar a /tareas?... y el servidor devuelve la lista filtrada.
 */
export function TaskFiltersBar({ filters: urlFilters, projects, tags }: TaskFiltersBarProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  // Los selects muestran el valor nuevo al instante, mientras el servidor filtra.
  const [filters, setOptimisticFilters] = useOptimistic(urlFilters);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  // Cambiar la key vuelve a montar el input de búsqueda (sirve para vaciarlo al limpiar).
  const [searchKey, setSearchKey] = useState(0);
  const searchRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const activeCount = countActiveFilters(filters);
  const selectCount = activeCount - (filters.q ? 1 : 0);

  function navigate(next: TaskFilters) {
    clearTimeout(debounceRef.current);
    // replace (no push): filtrar no debería llenar el historial del botón "Atrás".
    startTransition(() => {
      setOptimisticFilters(next);
      router.replace(tasksUrl(next), { scroll: false });
    });
  }

  function onSearchChange(value: string) {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => navigate({ ...filters, q: value.trim() }), SEARCH_DEBOUNCE_MS);
  }

  function clearAll() {
    setSearchKey((k) => k + 1);
    navigate(EMPTY_FILTERS);
  }

  // Atajo: "/" enfoca la búsqueda (como en GitHub), salvo si ya estás escribiendo en un campo.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement;
      const typing = ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName) || target.isContentEditable;
      if (event.key === "/" && !typing) {
        event.preventDefault();
        searchRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <form
          role="search"
          className="relative flex-1"
          onSubmit={(event) => {
            event.preventDefault();
            navigate({ ...filters, q: searchRef.current?.value.trim() ?? "" });
          }}
        >
          <label htmlFor="task-search" className="sr-only">
            Buscar tareas
          </label>
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-400"
            aria-hidden="true"
          />
          <input
            key={searchKey}
            ref={searchRef}
            id="task-search"
            type="search"
            defaultValue={filters.q}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Buscar en títulos y descripciones…"
            autoComplete="off"
            maxLength={100}
            className="w-full rounded-lg border border-zinc-300 bg-white py-2 pr-10 pl-9 text-base shadow-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 sm:text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
          <kbd className="pointer-events-none absolute top-1/2 right-3 hidden -translate-y-1/2 rounded border border-zinc-300 px-1.5 text-xs text-zinc-400 sm:block dark:border-zinc-700">
            /
          </kbd>
        </form>

        <button
          type="button"
          onClick={() => setShowMobileFilters((v) => !v)}
          aria-expanded={showMobileFilters}
          aria-controls="task-filters"
          className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 px-3 text-sm font-medium sm:hidden dark:border-zinc-700"
        >
          <SlidersHorizontal className="size-4" aria-hidden="true" />
          Filtros{selectCount > 0 && ` (${selectCount})`}
        </button>
      </div>

      <div
        id="task-filters"
        className={`${showMobileFilters ? "grid" : "hidden"} grid-cols-2 gap-3 sm:grid sm:grid-cols-3 lg:grid-cols-5`}
      >
        <SelectField
          id="filter-project"
          label="Proyecto"
          name="proyecto"
          value={filters.project}
          onChange={(e) => navigate({ ...filters, project: e.target.value })}
          options={[
            { value: "", label: "Todos" },
            { value: INBOX, label: "Bandeja de entrada" },
            ...projects.map((p) => ({ value: p.id, label: p.name })),
          ]}
        />
        <SelectField
          id="filter-tag"
          label="Etiqueta"
          name="etiqueta"
          value={filters.tag}
          onChange={(e) => navigate({ ...filters, tag: e.target.value })}
          options={[{ value: "", label: "Todas" }, ...tags.map((t) => ({ value: t.id, label: t.name }))]}
        />
        <SelectField
          id="filter-priority"
          label="Prioridad"
          name="prioridad"
          value={filters.priority}
          onChange={(e) => navigate({ ...filters, priority: e.target.value as TaskFilters["priority"] })}
          options={[
            { value: "", label: "Todas" },
            ...Object.entries(PRIORITY_PARAM)
              .reverse()
              .map(([param, value]) => ({ value: param, label: PRIORITY_LABELS[value] })),
          ]}
        />
        <SelectField
          id="filter-status"
          label="Estado"
          name="estado"
          value={filters.status}
          onChange={(e) => navigate({ ...filters, status: e.target.value as TaskFilters["status"] })}
          options={[
            { value: "", label: "Todos" },
            ...Object.entries(STATUS_PARAM).map(([param, value]) => ({
              value: param,
              label: STATUS_LABELS[value],
            })),
          ]}
        />
        <SelectField
          id="filter-due"
          label="Fecha límite"
          name="vence"
          value={filters.due}
          onChange={(e) => navigate({ ...filters, due: e.target.value as TaskFilters["due"] })}
          options={[{ value: "", label: "Cualquiera" }, ...DUE_PARAM.map((d) => ({ value: d, label: DUE_LABELS[d] }))]}
        />
      </div>

      <div className="flex min-h-6 items-center gap-3 text-sm" aria-live="polite">
        {isPending && (
          <span className="inline-flex items-center gap-1.5 text-zinc-500">
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Filtrando…
          </span>
        )}
        {activeCount > 0 && !isPending && (
          <button
            type="button"
            onClick={clearAll}
            className="inline-flex items-center gap-1 font-medium text-indigo-600 hover:underline dark:text-indigo-400"
          >
            <X className="size-4" aria-hidden="true" />
            Limpiar filtros ({activeCount})
          </button>
        )}
      </div>
    </div>
  );
}

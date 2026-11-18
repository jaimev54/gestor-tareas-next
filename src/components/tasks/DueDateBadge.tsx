"use client";

import { CalendarDays } from "lucide-react";

import { daysBetween, formatIsoDate } from "@/lib/dates";

import { useToday } from "./useToday";

type DueDateBadgeProps = {
  dueDate: string;
  /** Una tarea hecha nunca está "vencida". */
  done?: boolean;
};

export function DueDateBadge({ dueDate, done = false }: DueDateBadgeProps) {
  const today = useToday();
  const diff = today ? daysBetween(today, dueDate) : null;
  const year = today ? Number(today.slice(0, 4)) : undefined;

  let label = formatIsoDate(dueDate, year);
  let tone = "text-zinc-600 dark:text-zinc-400";
  if (diff !== null && !done) {
    if (diff < 0) {
      label = `Venció el ${label}`;
      tone = "text-red-600 dark:text-red-400 font-medium";
    } else if (diff === 0) {
      label = "Hoy";
      tone = "text-amber-700 dark:text-amber-400 font-medium";
    } else if (diff === 1) {
      label = "Mañana";
    }
  }

  return (
    <span className={`inline-flex items-center gap-1 text-xs ${tone}`}>
      <CalendarDays className="size-3.5" aria-hidden="true" />
      <time dateTime={dueDate}>{label}</time>
    </span>
  );
}

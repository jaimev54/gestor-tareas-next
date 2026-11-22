import { AlertCircle, CalendarClock, CheckCircle2, ListTodo } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";

import { PriorityBreakdown } from "@/components/dashboard/PriorityBreakdown";
import { ProjectProgress } from "@/components/dashboard/ProjectProgress";
import { StatTile } from "@/components/dashboard/StatTile";
import { UpcomingList } from "@/components/dashboard/UpcomingList";
import { WeeklyChart } from "@/components/dashboard/WeeklyChart";
import { getDashboard } from "@/lib/dashboard/queries";
import { tasksUrl } from "@/lib/tasks/filters";

export const metadata: Metadata = {
  title: "Panel",
  robots: { index: false },
};

function Card({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
  const id = `card-${title.toLowerCase().replace(/\s+/g, "-")}`;
  return (
    <section
      aria-labelledby={id}
      className={`min-w-0 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 ${className}`}
    >
      <h2 id={id} className="mb-4 font-semibold">
        {title}
      </h2>
      {children}
    </section>
  );
}

function deltaText(delta: number) {
  if (delta === 0) return "Igual que los 7 días anteriores";
  return `${delta > 0 ? "+" : "−"}${Math.abs(delta)} respecto a los 7 días anteriores`;
}

async function DashboardContent() {
  const { today, open, completed7, weekly, projects, upcoming } = await getDashboard();
  const currentYear = Number(today.slice(0, 4));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label="Pendientes" value={open.total} icon={ListTodo} href={tasksUrl({})} />
        <StatTile
          label="Vencidas"
          value={open.overdue}
          icon={AlertCircle}
          alert={open.overdue > 0}
          detail={open.overdue > 0 ? "Requieren atención" : "Ninguna vencida"}
          href={tasksUrl({ due: "vencidas" })}
        />
        <StatTile
          label="Vencen esta semana"
          value={open.dueThisWeek}
          icon={CalendarClock}
          detail={open.dueToday > 0 ? `${open.dueToday} vence${open.dueToday === 1 ? "" : "n"} hoy` : undefined}
          href={tasksUrl({ due: "semana" })}
        />
        <StatTile
          label="Completadas (7 días)"
          value={completed7.current}
          icon={CheckCircle2}
          detail={deltaText(completed7.delta)}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Completadas por semana" className="lg:col-span-2">
          <WeeklyChart weeks={weekly} currentYear={currentYear} />
        </Card>
        <Card title="Pendientes por prioridad">
          <PriorityBreakdown byPriority={open.byPriority} />
        </Card>
        <Card title="Avance por proyecto" className="lg:col-span-2">
          <ProjectProgress projects={projects} />
        </Card>
        <Card title="Próximas fechas límite">
          <UpcomingList tasks={upcoming} />
        </Card>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6" aria-hidden="true">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-28 animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-900" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="h-72 animate-pulse rounded-2xl bg-zinc-100 lg:col-span-2 dark:bg-zinc-900" />
        <div className="h-72 animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-900" />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight">Panel</h1>
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </div>
  );
}

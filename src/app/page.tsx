import {
  BarChart3,
  CalendarClock,
  Columns3,
  FolderKanban,
  type LucideIcon,
  Moon,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";

import { DemoButton } from "@/components/auth/DemoButton";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { buttonStyles } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";

const FEATURES: { icon: LucideIcon; title: string; text: string }[] = [
  {
    icon: FolderKanban,
    title: "Proyectos y etiquetas",
    text: "Agrupa tus tareas por proyecto y clasifícalas con etiquetas de colores.",
  },
  {
    icon: Columns3,
    title: "Tablero kanban",
    text: "Arrastra las tareas entre Pendiente, En progreso y Hecha.",
  },
  {
    icon: CalendarClock,
    title: "Prioridades y fechas",
    text: "Marca la prioridad y la fecha límite. Las vencidas se ven al momento.",
  },
  {
    icon: BarChart3,
    title: "Estadísticas",
    text: "Mira cuántas tareas completas cada semana y qué tienes pendiente.",
  },
  {
    icon: ShieldCheck,
    title: "Tus datos, solo tuyos",
    text: "Cada usuario ve únicamente sus tareas, protegido en la propia base de datos.",
  },
  {
    icon: Moon,
    title: "Modo claro y oscuro",
    text: "Se adapta a tu sistema o elige el tema que prefieras.",
  },
];

// Vista previa decorativa de la app (no son datos reales).
const PREVIEW_COLUMNS = [
  { title: "Pendiente", tasks: [{ t: "Preparar presentación", p: "Alta" }, { t: "Revisar correos", p: "Baja" }] },
  { title: "En progreso", tasks: [{ t: "Diseñar la landing", p: "Media" }] },
  { title: "Hecha", tasks: [{ t: "Configurar Supabase", p: "Alta" }] },
];

const PRIORITY_STYLES: Record<string, string> = {
  Alta: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
  Media: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  Baja: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
};

export default function HomePage() {
  // Solo se lee si existe (true/false): la contraseña nunca llega al HTML ni al navegador.
  const demoEnabled = Boolean(process.env.DEMO_PASSWORD);

  return (
    <>
      <PublicHeader />
      <main id="contenido" className="flex-1">
        {/* Hero */}
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:py-24 lg:grid-cols-2">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-balance sm:text-5xl">
              Organiza tus tareas <span className="text-indigo-600 dark:text-indigo-400">sin complicarte</span>
            </h1>
            <p className="mt-4 max-w-xl text-lg text-pretty text-zinc-600 dark:text-zinc-400">
              Proyectos, prioridades, fechas límite y un tablero kanban en un solo lugar.
              Gratis y desde cualquier dispositivo.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href={ROUTES.signup} className={buttonStyles({ size: "lg" })}>
                Empieza gratis
              </Link>
              {/* Si la demo está configurada, es la segunda opción: probar sin registrarse. */}
              {demoEnabled ? (
                <DemoButton variant="secondary" size="lg" />
              ) : (
                <Link href={ROUTES.login} className={buttonStyles({ variant: "secondary", size: "lg" })}>
                  Ya tengo cuenta
                </Link>
              )}
            </div>
            {demoEnabled && (
              <p className="mt-3 text-sm text-zinc-500">
                La demo trae datos de ejemplo y no necesita correo ni contraseña.
              </p>
            )}
          </div>

          <div
            aria-hidden="true"
            className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 shadow-xl shadow-zinc-200/50 dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-none"
          >
            <div className="grid grid-cols-3 gap-3">
              {PREVIEW_COLUMNS.map((column) => (
                <div key={column.title} className="space-y-2">
                  <p className="text-xs font-semibold text-zinc-500 uppercase">{column.title}</p>
                  {column.tasks.map((task) => (
                    <div
                      key={task.t}
                      className="rounded-lg border border-zinc-200 bg-white p-2.5 shadow-sm dark:border-zinc-700 dark:bg-zinc-800"
                    >
                      <p className="text-xs font-medium sm:text-sm">{task.t}</p>
                      <span
                        className={`mt-2 inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold sm:text-xs ${PRIORITY_STYLES[task.p]}`}
                      >
                        {task.p}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Funcionalidades */}
        <section aria-labelledby="funcionalidades" className="border-t border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
            <h2 id="funcionalidades" className="text-3xl font-bold tracking-tight">
              Todo lo que necesitas, nada que sobre
            </h2>
            <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map(({ icon: Icon, title, text }) => (
                <li
                  key={title}
                  className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <span className="flex size-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 font-semibold">{title}</h3>
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{text}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Llamada final */}
        <section className="mx-auto max-w-6xl px-4 py-16 text-center sm:py-20">
          <h2 className="text-3xl font-bold tracking-tight">¿Listo para ordenar tu semana?</h2>
          <p className="mt-3 text-zinc-600 dark:text-zinc-400">Crea tu cuenta en menos de un minuto.</p>
          <Link href={ROUTES.signup} className={buttonStyles({ size: "lg", className: "mt-8" })}>
            Crear cuenta gratis
          </Link>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

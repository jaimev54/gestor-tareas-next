import { formatIsoDate } from "@/lib/dates";
import type { WeekBucket } from "@/lib/dashboard/stats";

const CHART_HEIGHT = 176; // px del área de barras

/** Máximo "redondo" del eje (1, 2, 4, 5, 10, 20…) para que las marcas sean números limpios. */
function niceMax(value: number) {
  if (value <= 4) return 4;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  for (const step of [1, 2, 2.5, 5, 10]) {
    if (value <= step * magnitude) return step * magnitude;
  }
  return 10 * magnitude;
}

const plural = (n: number) => `${n} ${n === 1 ? "completada" : "completadas"}`;

/**
 * Columnas de tareas completadas por semana. HTML + CSS, sin librería de gráficos:
 * una sola serie (sin leyenda), etiqueta solo en la semana actual, tooltip al pasar el ratón
 * o con el foco del teclado, y una tabla con los mismos datos.
 */
export function WeeklyChart({ weeks, currentYear }: { weeks: WeekBucket[]; currentYear: number }) {
  const max = niceMax(Math.max(...weeks.map((w) => w.count), 1));
  const ticks = [max, max / 2, 0];
  const total = weeks.reduce((sum, w) => sum + w.count, 0);
  const label = (w: WeekBucket) => formatIsoDate(w.weekStart, currentYear);

  return (
    <figure>
      <figcaption className="sr-only">
        Tareas completadas por semana en las últimas {weeks.length} semanas: {total} en total.
      </figcaption>

      <div className="flex gap-2">
        {/* Eje Y: tres marcas limpias */}
        <div
          aria-hidden="true"
          className="relative w-6 shrink-0 text-right text-xs text-zinc-500 tabular-nums"
          style={{ height: CHART_HEIGHT }}
        >
          {ticks.map((tick) => (
            <span
              key={tick}
              className="absolute right-0 -translate-y-1/2"
              style={{ top: `${(1 - tick / max) * 100}%` }}
            >
              {Number.isInteger(tick) ? tick : tick.toFixed(1)}
            </span>
          ))}
        </div>

        <div className="relative min-w-0 flex-1">
          {/* Líneas guía: finas, sólidas y discretas */}
          <div aria-hidden="true" className="absolute inset-x-0 top-0" style={{ height: CHART_HEIGHT }}>
            {ticks.map((tick) => (
              <div
                key={tick}
                className={`absolute inset-x-0 h-px ${tick === 0 ? "bg-zinc-300 dark:bg-zinc-600" : "bg-zinc-100 dark:bg-zinc-800"}`}
                style={{ top: `${(1 - tick / max) * 100}%` }}
              />
            ))}
          </div>

          <ol className="relative grid grid-cols-8">
            {weeks.map((week, i) => {
              const isCurrent = i === weeks.length - 1;
              const heightPct = (week.count / max) * 100;
              const description = `Semana del ${label(week)}${isCurrent ? " (actual)" : ""}: ${plural(week.count)}`;
              return (
                <li key={week.weekStart} className="flex min-w-0 flex-col items-center">
                  {/* Zona de hover/foco más grande que la barra: toda la columna */}
                  <div
                    tabIndex={0}
                    aria-label={description}
                    className="group relative flex w-full justify-center rounded-md outline-offset-2"
                    style={{ height: CHART_HEIGHT }}
                  >
                    <div className="flex h-full w-full max-w-6 flex-col justify-end">
                      {/* Barra: máx. 24px, punta redondeada 4px, base recta */}
                      <div
                        aria-hidden="true"
                        className="relative w-full rounded-t bg-indigo-500 transition-opacity group-hover:opacity-80"
                        style={{ height: `${heightPct}%`, minHeight: week.count > 0 ? 2 : 0 }}
                      >
                        {/* Etiqueta selectiva: solo la semana actual, encima de la barra */}
                        {isCurrent && week.count > 0 && (
                          <span className="absolute bottom-full left-1/2 mb-1 -translate-x-1/2 text-xs font-medium text-zinc-900 tabular-nums dark:text-zinc-100">
                            {week.count}
                          </span>
                        )}
                      </div>
                    </div>
                    {/* Tooltip */}
                    <div
                      role="tooltip"
                      className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 rounded-lg bg-zinc-900 px-2.5 py-1.5 text-xs whitespace-nowrap text-white shadow-lg group-hover:block group-focus:block dark:bg-zinc-100 dark:text-zinc-900"
                    >
                      <span className="font-medium">Semana del {label(week)}</span>
                      <br />
                      {plural(week.count)}
                    </div>
                  </div>
                  {/* Eje X: en móvil solo una de cada dos etiquetas (las impares, que incluyen la semana actual) */}
                  <span
                    aria-hidden="true"
                    className={`mt-1.5 text-xs whitespace-nowrap text-zinc-500 ${i % 2 === 0 ? "invisible sm:visible" : ""}`}
                  >
                    {label(week)}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
      </div>

      {/* Vista de tabla: los mismos datos sin depender del gráfico */}
      <details className="mt-4 text-sm">
        <summary className="cursor-pointer text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
          Ver como tabla
        </summary>
        <table className="mt-2 w-full max-w-xs text-left">
          <thead>
            <tr className="border-b border-zinc-200 text-zinc-500 dark:border-zinc-800">
              <th scope="col" className="py-1 font-medium">
                Semana del
              </th>
              <th scope="col" className="py-1 text-right font-medium">
                Completadas
              </th>
            </tr>
          </thead>
          <tbody>
            {weeks.map((week) => (
              <tr key={week.weekStart} className="border-b border-zinc-100 dark:border-zinc-800/60">
                <td className="py-1">{label(week)}</td>
                <td className="py-1 text-right tabular-nums">{week.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}

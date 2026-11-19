import type { LucideIcon } from "lucide-react";
import Link from "next/link";

type StatTileProps = {
  label: string;
  value: number;
  icon: LucideIcon;
  /** Texto pequeño bajo el número (p. ej. la variación o una aclaración). */
  detail?: React.ReactNode;
  /** Resalta el icono en rojo cuando el valor indica un problema (p. ej. vencidas > 0). */
  alert?: boolean;
  href?: string;
};

/** Tarjeta con una cifra. El número va en color de texto normal; el estado lo indican icono + texto. */
export function StatTile({ label, value, icon: Icon, detail, alert = false, href }: StatTileProps) {
  const body = (
    <>
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">{label}</p>
        <Icon
          aria-hidden="true"
          className={`size-5 ${alert ? "text-red-600 dark:text-red-400" : "text-zinc-400 dark:text-zinc-500"}`}
        />
      </div>
      <p className="mt-2 text-3xl font-semibold tracking-tight">{value.toLocaleString("es-MX")}</p>
      {detail && <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{detail}</p>}
    </>
  );

  const classes =
    "block rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900";

  return href ? (
    <Link href={href} className={`${classes} transition hover:border-indigo-300 dark:hover:border-indigo-700`}>
      {body}
    </Link>
  ) : (
    <div className={classes}>{body}</div>
  );
}

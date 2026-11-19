import Link from "next/link";

import { COLOR_DOT, type ColorName } from "@/lib/colors";

type TagBadgeProps = {
  name: string;
  color: ColorName;
  /** Si se indica, el chip es un enlace (p. ej. para filtrar por esta etiqueta). */
  href?: string;
};

const chipClasses =
  "inline-flex max-w-40 items-center gap-1 rounded-full border border-zinc-200 px-2 py-0.5 text-xs text-zinc-700 dark:border-zinc-700 dark:text-zinc-300";

export function TagBadge({ name, color, href }: TagBadgeProps) {
  const content = (
    <>
      <span aria-hidden="true" className={`size-1.5 shrink-0 rounded-full ${COLOR_DOT[color]}`} />
      <span className="truncate">{name}</span>
    </>
  );

  if (!href) return <span className={chipClasses}>{content}</span>;

  return (
    <Link
      href={href}
      title={`Ver tareas con la etiqueta ${name}`}
      className={`${chipClasses} transition hover:border-indigo-400 hover:text-indigo-700 dark:hover:border-indigo-500 dark:hover:text-indigo-300`}
    >
      {content}
    </Link>
  );
}

import { COLOR_DOT, type ColorName } from "@/lib/colors";

export function TagBadge({ name, color }: { name: string; color: ColorName }) {
  return (
    <span className="inline-flex max-w-40 items-center gap-1 rounded-full border border-zinc-200 px-2 py-0.5 text-xs text-zinc-700 dark:border-zinc-700 dark:text-zinc-300">
      <span aria-hidden="true" className={`size-1.5 shrink-0 rounded-full ${COLOR_DOT[color]}`} />
      <span className="truncate">{name}</span>
    </span>
  );
}

// Paleta de colores para proyectos (y más adelante etiquetas).
// En la base se guarda solo el nombre ("indigo"); aquí se traduce a clases de Tailwind.
// Las clases van escritas completas: Tailwind solo genera las que encuentra literalmente en el código.

export const COLOR_NAMES = [
  "slate",
  "red",
  "orange",
  "amber",
  "green",
  "teal",
  "sky",
  "indigo",
  "violet",
  "pink",
] as const;

export type ColorName = (typeof COLOR_NAMES)[number];

export const COLOR_LABELS: Record<ColorName, string> = {
  slate: "Gris",
  red: "Rojo",
  orange: "Naranja",
  amber: "Ámbar",
  green: "Verde",
  teal: "Turquesa",
  sky: "Celeste",
  indigo: "Índigo",
  violet: "Violeta",
  pink: "Rosa",
};

/** Punto de color sólido (marcadores, selector de color). */
export const COLOR_DOT: Record<ColorName, string> = {
  slate: "bg-slate-500",
  red: "bg-red-500",
  orange: "bg-orange-500",
  amber: "bg-amber-500",
  green: "bg-green-500",
  teal: "bg-teal-500",
  sky: "bg-sky-500",
  indigo: "bg-indigo-500",
  violet: "bg-violet-500",
  pink: "bg-pink-500",
};

/** Borde superior de color para tarjetas. */
export const COLOR_BORDER_TOP: Record<ColorName, string> = {
  slate: "border-t-slate-500",
  red: "border-t-red-500",
  orange: "border-t-orange-500",
  amber: "border-t-amber-500",
  green: "border-t-green-500",
  teal: "border-t-teal-500",
  sky: "border-t-sky-500",
  indigo: "border-t-indigo-500",
  violet: "border-t-violet-500",
  pink: "border-t-pink-500",
};

/** Normaliza un color leído de la base (por si hubiera un valor fuera de la paleta). */
export function toColorName(value: string): ColorName {
  return (COLOR_NAMES as readonly string[]).includes(value) ? (value as ColorName) : "slate";
}

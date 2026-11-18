import { COLOR_DOT, COLOR_LABELS, COLOR_NAMES, type ColorName } from "@/lib/colors";

type ColorPickerProps = {
  name: string;
  defaultValue?: ColorName;
  /** Prefijo para ids únicos si hay varios selectores en la misma página. */
  idPrefix: string;
  errors?: string[];
};

/**
 * Selector de color con radios nativos: funciona con teclado (flechas) y lectores de pantalla
 * sin JavaScript extra. El círculo es solo la parte visual del radio.
 */
export function ColorPicker({ name, defaultValue = "indigo", idPrefix, errors }: ColorPickerProps) {
  const errorId = errors?.length ? `${idPrefix}-color-error` : undefined;

  return (
    <fieldset aria-describedby={errorId}>
      <legend className="mb-1.5 text-sm font-medium">Color</legend>
      <div className="flex flex-wrap gap-2">
        {COLOR_NAMES.map((color) => (
          <label key={color} className="cursor-pointer" title={COLOR_LABELS[color]}>
            <input
              type="radio"
              name={name}
              value={color}
              defaultChecked={color === defaultValue}
              className="peer sr-only"
            />
            <span className="sr-only">{COLOR_LABELS[color]}</span>
            <span
              aria-hidden="true"
              className={`block size-7 rounded-full ring-offset-2 ring-offset-white transition peer-checked:ring-2 peer-checked:ring-zinc-900 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-indigo-500 dark:ring-offset-zinc-900 dark:peer-checked:ring-zinc-100 ${COLOR_DOT[color]}`}
            />
          </label>
        ))}
      </div>
      {errorId && (
        <p id={errorId} className="mt-1.5 text-sm text-red-600 dark:text-red-400">
          {errors![0]}
        </p>
      )}
    </fieldset>
  );
}

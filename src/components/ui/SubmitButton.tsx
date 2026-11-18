type SubmitButtonProps = {
  pending: boolean;
  children: React.ReactNode;
  pendingText?: string;
};

/** Botón de envío que se desactiva y cambia el texto mientras la acción se ejecuta. */
export function SubmitButton({ pending, children, pendingText = "Enviando…" }: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={pending}
      aria-disabled={pending}
      className="inline-flex w-full items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? pendingText : children}
    </button>
  );
}

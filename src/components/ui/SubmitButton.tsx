import { buttonStyles } from "./button";

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
      className={buttonStyles({ className: "w-full py-2.5" })}
    >
      {pending ? pendingText : children}
    </button>
  );
}

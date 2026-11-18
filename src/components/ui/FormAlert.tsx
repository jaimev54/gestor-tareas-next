type FormAlertProps = {
  status: "idle" | "error" | "success";
  message?: string;
};

/** Mensaje general del formulario. Los lectores de pantalla lo anuncian al aparecer. */
export function FormAlert({ status, message }: FormAlertProps) {
  if (status === "idle" || !message) return null;

  const isError = status === "error";
  return (
    <p
      role={isError ? "alert" : "status"}
      className={`rounded-lg border px-3 py-2 text-sm ${
        isError
          ? "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
          : "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200"
      }`}
    >
      {message}
    </p>
  );
}

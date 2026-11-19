import { Info } from "lucide-react";
import Link from "next/link";

import { isDemoEmail } from "@/lib/auth/demo";
import { getCurrentProfile } from "@/lib/auth/profile";
import { ROUTES } from "@/lib/routes";

/** Aviso fijo cuando se usa la cuenta demo. Lee la sesión: va dentro de <Suspense>. */
export async function DemoBanner() {
  const { email } = await getCurrentProfile();
  if (!isDemoEmail(email)) return null;

  return (
    <div role="status" className="border-b border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-900 dark:bg-sky-950 dark:text-sky-100">
      <p className="mx-auto flex max-w-6xl items-start gap-2 px-4 py-2 text-sm">
        <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        <span>
          Estás en la <strong>cuenta demo</strong>: los datos son de ejemplo y se reinician cada vez que alguien entra.{" "}
          <Link href={ROUTES.signup} className="font-medium underline">
            Crea tu cuenta
          </Link>{" "}
          para guardar los tuyos.
        </span>
      </p>
    </div>
  );
}

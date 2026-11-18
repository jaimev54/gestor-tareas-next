@AGENTS.md

# Gestor de tareas (Next.js + Supabase) — contexto del proyecto

## Qué es
Gestor de tareas full-stack. Es el **proyecto 2 de 3** del portafolio de Jaime (desarrollador full-stack junior, Monterrey, México). El 1 fue la clínica dental con Vue (`../../clinica-dental-vue`, terminado) y el 3 será un portafolio con Astro.

Objetivo doble: (1) una app que se vea profesional para reclutadores y (2) que Jaime **aprenda** cada pieza. Se trabaja paso a paso.

## Cómo trabajar con Jaime
- Responde siempre en **español**, de forma concisa y directa. No cambies más de lo que se pide.
- Antes de crear o modificar archivos, explica en 1-3 líneas **qué hace y por qué**.
- Un paso a la vez. Compara con Angular, .NET o Laravel cuando ayude.
- Si algo falla, pide la captura de la consola o del navegador.
- Commits frecuentes y descriptivos, pero solo cuando Jaime lo pida.

## Stack
- Next.js 16 (App Router, `src/`, Turbopack), React 19, TypeScript
- Tailwind CSS 4
- Supabase: Postgres, Auth y RLS (cliente con `@supabase/ssr`)
- ESLint
- Node 24, npm
- Deploy: Vercel (plan Hobby) + dominio propio (Cloudflare Registrar)

Es el 2.º proyecto de Supabase de Jaime (máximo del plan gratis): el otro lo usa una app que ya tiene en Vercel. Los proyectos gratis se pausan tras 7 días sin actividad → añadir una GitHub Action de keep-alive en el deploy.

## Comandos
- `npm run dev` — desarrollo en http://localhost:3000
- `npm run build` — build de producción (incluye comprobación de tipos)
- `npm run start` — sirve el build
- `npm run lint` — ESLint

## Plan
1. ✅ Setup con create-next-app
2. ✅ Supabase: proyecto (región East US), esquema con RLS en `supabase/migrations/` (ejecutado a mano en el SQL Editor) y clientes en `src/lib/supabase/` (`server.ts`, `client.ts`)
3. ✅ Auth: registro, login, recuperar contraseña y protección de rutas (`src/proxy.ts`, `src/lib/auth/`, grupo `(auth)`, `/auth/confirm`)
4. Layout y UI base: navegación, modo oscuro, responsive
5. CRUD de proyectos/listas
6. CRUD de tareas con Server Actions y validación con Zod (prioridad, fecha límite, etiquetas, subtareas)
7. Filtros, búsqueda y orden sincronizados con la URL
8. Tablero kanban con arrastrar y soltar
9. Dashboard con estadísticas
10. Tests (Vitest + Playwright) y CI con GitHub Actions
11. Deploy en Vercel, dominio propio y keep-alive de Supabase
12. README con capturas

## Base de datos
- Tablas: `profiles`, `projects`, `tasks`, `subtasks`, `tags`, `task_tags`. Identificadores en inglés; la UI en español.
- Cada tabla tiene `user_id` (default `auth.uid()`) y RLS "solo el dueño". Las FK compuestas `(id, user_id)` impiden mezclar datos de distintos usuarios.
- Valores: `status` ∈ `todo | in_progress | done`; `priority` ∈ `low | medium | high`. `project_id` null = Bandeja de entrada.
- Borrar un proyecto borra sus tareas (cascade): pedir confirmación en la UI.
- Cambios de esquema: nuevo archivo numerado en `supabase/migrations/` y ejecutarlo en el SQL Editor; nunca editar uno ya aplicado.

## Next 16: cosas a recordar
- `cacheComponents: true`: lo que lee cookies, `searchParams` o la hora va dentro de `<Suspense>`. `createClient()` de servidor ya llama a `connection()`.
- `middleware` ahora se llama `proxy` (`src/proxy.ts`). Es solo la primera barrera: cada página/acción protegida usa `requireUser()`.
- Formularios: Server Action + `useActionState`; validar con Zod; devolver `FormState` (`src/lib/forms.ts`).
- Supabase Auth → URL Configuration: Site URL y Redirect URLs (`http://localhost:3000/**`; añadir la de producción en el deploy).

## Estándares de calidad
- Componentes pequeños con props tipadas; Server Components por defecto, `"use client"` solo cuando haga falta
- Validar siempre en el servidor (Zod) y proteger los datos con RLS, no solo en la UI
- Responsive mobile-first, HTML semántico, accesibilidad (labels, foco, contraste, teclado)
- SEO: `metadata` por ruta
- Nunca subir claves: `.env.local` fuera de git; solo la clave `anon`/publishable en el cliente

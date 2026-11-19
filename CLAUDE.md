@AGENTS.md

# Gestor de tareas (Next.js + Supabase) — contexto del proyecto

## Qué es
Gestor de tareas full-stack. Es el **proyecto 2 de 3** del portafolio de Jaime (desarrollador full-stack junior, Monterrey, México). El 1 fue la clínica dental con Vue (`../../clinica-dental-vue`, terminado) y el 3 será un portafolio con Astro.

Objetivo doble: (1) una app que se vea profesional para reclutadores y (2) que Jaime **aprenda** cada pieza. Se trabaja paso a paso.

## Cómo trabajar con Jaime
- Responde **SIEMPRE en español**: también los avisos intermedios, los resúmenes y las explicaciones de errores, aunque acabes de leer logs o documentación en inglés. Es la queja que más se ha repetido.
- Sé conciso y directo. No cambies más de lo que se pide.
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
- `npm run db:types` — regenerar `src/types/database.ts` tras cambiar el esquema
- `npm test` — tests unitarios (Vitest); `npm run test:watch` en modo vigilancia
- `npm run test:e2e` — tests e2e (Playwright). Compila en `.next-e2e` y usa el puerto 3100: se puede ejecutar con `npm run dev` encendido
- `npm run typecheck` — comprobación de tipos

## Producción
- App: https://gestor-tareas-next-fnfa.vercel.app (Vercel, despliega `main` automáticamente)
- Variables en Vercel (Settings → Environments → Production), tipo **Config** (no Secret: las `NEXT_PUBLIC_` son públicas por diseño)
- Supabase → Auth → URL Configuration: Site URL = la de producción; Redirect URLs = producción `/**` y `http://localhost:3000/**`

## Repositorio
- GitHub: https://github.com/jaimev54/gestor-tareas-next (público)
- Ramas: `main` (lo terminado; Vercel desplegará desde aquí) y `dev` (trabajo diario). Commits en `dev`; merge a `main` al cerrar cada paso o cuando Jaime lo pida.
- Antes de cada push: comprobar que no entran `.env.local` ni `CONTRASEÑA*.txt`.

## Plan
1. ✅ Setup con create-next-app
2. ✅ Supabase: proyecto (región East US), esquema con RLS en `supabase/migrations/` (ejecutado a mano en el SQL Editor) y clientes en `src/lib/supabase/` (`server.ts`, `client.ts`)
3. ✅ Auth: registro, login, recuperar contraseña y protección de rutas (`src/proxy.ts`, `src/lib/auth/`, grupo `(auth)`, `/auth/confirm`)
4. ✅ Layout y UI base: inicio pública, grupo `(app)` con barra de navegación, tema claro/oscuro/sistema, 404
5. ✅ CRUD de proyectos (`/proyectos`, `src/lib/projects/`); tipos de la base con `npm run db:types` (requiere `npx supabase login`)
6. ✅ CRUD de tareas (`/tareas`, `src/lib/tasks/`), etiquetas (`src/lib/tags/`, gestor en `/proyectos`) y subtareas; migración 0002 con la función `set_task_tags` (RPC)
7. ✅ Filtros y búsqueda en la URL (`src/lib/tasks/filters.ts`, `TaskFiltersBar`); zona horaria del usuario en la cookie `tz` (`src/lib/today.ts`)
8. ✅ Tablero kanban `/tablero` con dnd-kit (`src/components/kanban/`); migración 0003 con la función `move_task` (estado + orden)
9. ✅ Panel `/panel` con estadísticas (`src/lib/dashboard/`, `src/components/dashboard/`): cálculos puros en `stats.ts`, gráficos en HTML/CSS sin librería
10. ✅ Tests: Vitest (`src/**/*.test.ts`) y Playwright (`e2e/`, build en `.next-e2e`, puerto 3100); CI en `.github/workflows/ci.yml`
11. ✅ Deploy en Vercel, cabeceras de seguridad, keep-alive de Supabase (migración 0004 + Action) y cuenta demo (`demo@example.com`, migración 0005, `DEMO_PASSWORD` solo en servidor). Sin dominio propio por ahora: el correo de Supabase solo llega a miembros de la organización
12. ✅ README con capturas (`docs/screenshots/`, se regeneran con `npm run screenshots` desde la demo de producción)

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
- Tema: `data-theme` en `<html>` lo pone `ThemeScript` antes de pintar; Tailwind usa `@custom-variant dark` sobre ese atributo (no la media query). Preferencia en localStorage.
- Si el dev server sirve código o estilos viejos: parar el server, borrar `.next` y arrancar de nuevo.
- No ejecutar `npm run build` mientras Jaime tiene `npm run dev` corriendo (se pisan la caché). Con el server encendido, verificar con `npx tsc --noEmit` y `npm run lint`.
- Grupos de rutas: `(auth)` = tarjeta centrada; `(app)` = área privada con barra (`APP_NAV_LINKS` en `src/lib/routes.ts`).
- Supabase Auth → URL Configuration: Site URL y Redirect URLs (`http://localhost:3000/**`; añadir la de producción en el deploy).

## Estándares de calidad
- Componentes pequeños con props tipadas; Server Components por defecto, `"use client"` solo cuando haga falta
- Validar siempre en el servidor (Zod) y proteger los datos con RLS, no solo en la UI
- Responsive mobile-first, HTML semántico, accesibilidad (labels, foco, contraste, teclado)
- SEO: `metadata` por ruta
- Nunca subir claves: `.env.local` fuera de git; solo la clave `anon`/publishable en el cliente

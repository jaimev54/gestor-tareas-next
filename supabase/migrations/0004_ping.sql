-- =====================================================================
-- 0004: función mínima para mantener el proyecto activo.
-- Ejecutar una sola vez en Supabase → SQL Editor.
--
-- Los proyectos del plan gratuito se pausan tras 7 días sin actividad.
-- Una GitHub Action (.github/workflows/keep-alive.yml) llama a esta función
-- cada 3 días: es una consulta real a Postgres que no lee ni escribe datos.
--
-- Se permite a "anon" porque la Action no inicia sesión. No expone nada:
-- solo devuelve el texto 'ok'.
-- =====================================================================

create or replace function public.ping()
returns text
language sql
stable
security invoker
set search_path = ''
as $$
  select 'ok'::text;
$$;

revoke execute on function public.ping() from public;
grant execute on function public.ping() to anon, authenticated;

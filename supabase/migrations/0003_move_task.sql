-- =====================================================================
-- 0003: mover una tarea en el tablero kanban.
-- Ejecutar una sola vez en Supabase → SQL Editor.
--
-- Cambia el estado de la tarea (si cambió de columna) y reescribe el orden
-- de la columna destino con la lista de ids que manda el navegador:
-- position = 1, 2, 3… según su lugar en la lista. Todo en una transacción.
--
-- security invoker: con los permisos del usuario, así RLS solo deja tocar sus tareas.
-- El CHECK de la tabla rechaza cualquier estado que no sea todo / in_progress / done.
-- =====================================================================

create or replace function public.move_task(
  p_task_id uuid,
  p_status text,
  p_ordered_ids uuid[]
)
returns void
language sql
security invoker
set search_path = ''
as $$
  -- 1) Cambio de columna (el trigger de completed_at se encarga de la fecha de "hecha").
  update public.tasks
  set status = p_status
  where id = p_task_id
    and status <> p_status;

  -- 2) Nuevo orden de la columna destino.
  update public.tasks as t
  set position = o.ord
  from unnest(p_ordered_ids) with ordinality as o(id, ord)
  where t.id = o.id
    and t.status = p_status;
$$;

revoke execute on function public.move_task(uuid, text, uuid[]) from public, anon;
grant execute on function public.move_task(uuid, text, uuid[]) to authenticated;

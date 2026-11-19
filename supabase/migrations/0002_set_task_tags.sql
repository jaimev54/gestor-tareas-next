-- =====================================================================
-- 0002: asignar etiquetas a una tarea de forma atómica.
-- Ejecutar una sola vez en Supabase → SQL Editor.
--
-- Recibe la lista COMPLETA de etiquetas que debe tener la tarea:
-- borra las que sobran e inserta las que faltan, todo en una transacción
-- (si algo falla, no queda a medias).
--
-- security invoker: se ejecuta con los permisos del usuario que la llama,
-- así RLS y las FK compuestas siguen impidiendo tocar datos ajenos.
-- =====================================================================

create or replace function public.set_task_tags(p_task_id uuid, p_tag_ids uuid[])
returns void
language sql
security invoker
set search_path = ''
as $$
  delete from public.task_tags
  where task_id = p_task_id
    and not (tag_id = any (p_tag_ids));

  insert into public.task_tags (task_id, tag_id)
  select p_task_id, tag_id
  from unnest(p_tag_ids) as tag_id
  on conflict (task_id, tag_id) do nothing;
$$;

-- Solo usuarios con sesión pueden llamarla (por defecto Postgres da EXECUTE a todos).
revoke execute on function public.set_task_tags(uuid, uuid[]) from public, anon;
grant execute on function public.set_task_tags(uuid, uuid[]) to authenticated;

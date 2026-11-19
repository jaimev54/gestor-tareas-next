-- =====================================================================
-- 0005: datos de ejemplo de la cuenta demo.
-- Ejecutar una sola vez en Supabase → SQL Editor.
--
-- reset_demo_data() borra los datos de la cuenta demo y crea unos nuevos:
-- proyectos, etiquetas, tareas pendientes (vencidas, de hoy, de la semana…),
-- subtareas y completadas repartidas en varias semanas para el panel.
-- La app la llama cada vez que alguien entra con "Probar la demo".
--
-- Seguridad:
--  * security invoker → RLS sigue aplicando: solo toca filas del usuario que la llama.
--  * Solo funciona para la cuenta demo (correo demo@example.com): si un usuario
--    real la llamara, se rechaza y sus datos no se tocan.
-- =====================================================================

create or replace function public.reset_demo_data()
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_work uuid;
  v_home uuid;
  v_study uuid;
  v_urgent uuid;
  v_calls uuid;
  v_waiting uuid;
  v_task uuid;
  r record;
begin
  if v_uid is null or coalesce(auth.jwt() ->> 'email', '') <> 'demo@example.com' then
    raise exception 'Solo la cuenta demo puede reiniciar sus datos' using errcode = '42501';
  end if;

  -- 1) Borrar lo anterior (las subtareas y etiquetas de tareas caen en cascada).
  delete from public.projects where user_id = v_uid;
  delete from public.tasks where user_id = v_uid;
  delete from public.tags where user_id = v_uid;

  -- Nombre visible en la barra (el usuario se crea desde el panel de Supabase, sin nombre).
  update public.profiles set full_name = 'Usuario demo' where id = v_uid;

  -- 2) Proyectos y etiquetas.
  insert into public.projects (name, color) values ('Trabajo', 'indigo') returning id into v_work;
  insert into public.projects (name, color) values ('Casa', 'green') returning id into v_home;
  insert into public.projects (name, color) values ('Estudios', 'violet') returning id into v_study;

  insert into public.tags (name, color) values ('Urgente', 'red') returning id into v_urgent;
  insert into public.tags (name, color) values ('Llamadas', 'sky') returning id into v_calls;
  insert into public.tags (name, color) values ('Esperando respuesta', 'amber') returning id into v_waiting;

  -- 3) Tareas pendientes (fechas relativas a hoy para que siempre haya vencidas, de hoy, etc.).
  insert into public.tasks (title, description, project_id, status, priority, due_date, position)
  values ('Preparar la presentación del trimestre', 'Revisar las cifras con el equipo de ventas antes de la reunión.',
          v_work, 'in_progress', 'high', current_date + 2, 1)
  returning id into v_task;
  insert into public.subtasks (task_id, title, is_done, position) values
    (v_task, 'Recopilar las cifras de ventas', true, 1),
    (v_task, 'Diseñar las diapositivas', false, 2),
    (v_task, 'Ensayar con el equipo', false, 3);
  insert into public.task_tags (task_id, tag_id) values (v_task, v_urgent);

  insert into public.tasks (title, description, project_id, status, priority, due_date, position)
  values ('Responder el correo del cliente', 'Confirmar la fecha de entrega del proyecto.',
          v_work, 'todo', 'high', current_date - 1, 1)
  returning id into v_task;
  insert into public.task_tags (task_id, tag_id) values (v_task, v_urgent), (v_task, v_waiting);

  insert into public.tasks (title, project_id, status, priority, due_date, position)
  values ('Revisar el pull request del login', v_work, 'todo', 'medium', current_date, 2);

  insert into public.tasks (title, project_id, status, priority, due_date, position)
  values ('Agendar reunión de seguimiento', v_work, 'todo', 'low', current_date + 5, 3)
  returning id into v_task;
  insert into public.task_tags (task_id, tag_id) values (v_task, v_calls);

  insert into public.tasks (title, project_id, status, priority, due_date, position)
  values ('Pagar el recibo de la luz', v_home, 'todo', 'high', current_date + 1, 4)
  returning id into v_task;
  insert into public.task_tags (task_id, tag_id) values (v_task, v_urgent);

  insert into public.tasks (title, description, project_id, status, priority, due_date, position)
  values ('Llamar al plomero', 'La llave del baño sigue goteando.', v_home, 'todo', 'medium', current_date + 3, 5)
  returning id into v_task;
  insert into public.task_tags (task_id, tag_id) values (v_task, v_calls), (v_task, v_waiting);

  insert into public.tasks (title, project_id, status, priority, position)
  values ('Hacer la despensa', v_home, 'in_progress', 'low', 2)
  returning id into v_task;
  insert into public.subtasks (task_id, title, is_done, position) values
    (v_task, 'Leche', true, 1),
    (v_task, 'Fruta', false, 2),
    (v_task, 'Café', false, 3);

  insert into public.tasks (title, project_id, status, priority, due_date, position)
  values ('Terminar el curso de TypeScript avanzado', v_study, 'in_progress', 'medium', current_date + 10, 3)
  returning id into v_task;
  insert into public.subtasks (task_id, title, is_done, position) values
    (v_task, 'Módulo 1: tipos genéricos', true, 1),
    (v_task, 'Módulo 2: tipos condicionales', true, 2),
    (v_task, 'Módulo 3: decoradores', false, 3);

  insert into public.tasks (title, project_id, status, priority, due_date, position)
  values ('Leer sobre patrones de diseño', v_study, 'todo', 'low', current_date + 7, 6);

  insert into public.tasks (title, status, priority, due_date, position)
  values ('Renovar el pasaporte', 'todo', 'medium', current_date + 20, 7);

  insert into public.tasks (title, description, status, priority, position)
  values ('Ideas para el portafolio', 'Una app de recetas con búsqueda por ingredientes.', 'todo', 'low', 8);

  -- 4) Completadas, repartidas en las últimas semanas (para el gráfico del panel).
  --    El trigger pone completed_at = ahora; después se ajusta a "hace N días".
  for r in
    select * from (values
      ('Enviar el informe mensual', v_work, 'medium', 1),
      ('Actualizar dependencias del proyecto', v_work, 'low', 2),
      ('Cambiar el filtro del agua', v_home, 'low', 3),
      ('Entregar la práctica de bases de datos', v_study, 'high', 6),
      ('Configurar el entorno de desarrollo', v_work, 'medium', 9),
      ('Llevar el coche al servicio', v_home, 'medium', 12),
      ('Ver la clase de React Server Components', v_study, 'medium', 16),
      ('Preparar la entrevista técnica', v_work, 'high', 22),
      ('Ordenar el armario', v_home, 'low', 30),
      ('Repasar SQL: joins y subconsultas', v_study, 'medium', 38)
    ) as d(title, project_id, priority, days_ago)
  loop
    insert into public.tasks (title, project_id, status, priority)
    values (r.title, r.project_id, 'done', r.priority)
    returning id into v_task;
    update public.tasks
    set completed_at = now() - make_interval(days => r.days_ago)
    where id = v_task;
  end loop;
end;
$$;

revoke execute on function public.reset_demo_data() from public, anon;
grant execute on function public.reset_demo_data() to authenticated;

-- =====================================================================
-- Gestor de tareas: esquema inicial
-- Ejecutar una sola vez en Supabase → SQL Editor.
--
-- Idea clave de seguridad:
--   * Cada tabla tiene user_id y RLS: un usuario solo ve y toca sus filas.
--   * Las relaciones usan claves foráneas compuestas (id, user_id), así la
--     base impide, por ejemplo, meter una tarea tuya en un proyecto ajeno.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Funciones auxiliares
-- ---------------------------------------------------------------------

-- Mantiene updated_at al día en cada UPDATE.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------
-- Perfiles (datos públicos del usuario; auth.users lo gestiona Supabase)
-- ---------------------------------------------------------------------
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text check (char_length(full_name) <= 80),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Crea el perfil automáticamente al registrarse un usuario.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, left(new.raw_user_meta_data ->> 'full_name', 80));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------
-- Proyectos (listas para agrupar tareas)
-- ---------------------------------------------------------------------
create table public.projects (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name        text not null check (char_length(trim(name)) between 1 and 80),
  color       text not null default 'slate' check (color ~ '^[a-z]+$'),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (id, user_id),          -- necesario para las FK compuestas
  unique (user_id, name)         -- no repetir nombre de proyecto por usuario
);

-- ---------------------------------------------------------------------
-- Tareas
-- ---------------------------------------------------------------------
create table public.tasks (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null default auth.uid() references auth.users (id) on delete cascade,
  project_id    uuid,          -- null = "Bandeja de entrada"
  title         text not null check (char_length(trim(title)) between 1 and 200),
  description   text check (char_length(description) <= 5000),
  status        text not null default 'todo'
                  check (status in ('todo', 'in_progress', 'done')),
  priority      text not null default 'medium'
                  check (priority in ('low', 'medium', 'high')),
  due_date      date,
  position      double precision not null default 0,   -- orden en el kanban
  completed_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (id, user_id),
  foreign key (project_id, user_id)
    references public.projects (id, user_id) on delete cascade
);

-- Rellena o limpia completed_at según el estado.
create or replace function public.set_completed_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status = 'done' and (tg_op = 'INSERT' or old.status <> 'done') then
    new.completed_at = now();
  elsif new.status <> 'done' then
    new.completed_at = null;
  end if;
  return new;
end;
$$;

create trigger tasks_set_completed_at
  before insert or update of status on public.tasks
  for each row execute function public.set_completed_at();

-- ---------------------------------------------------------------------
-- Subtareas (checklist dentro de una tarea)
-- ---------------------------------------------------------------------
create table public.subtasks (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  task_id     uuid not null,
  title       text not null check (char_length(trim(title)) between 1 and 200),
  is_done     boolean not null default false,
  position    double precision not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  foreign key (task_id, user_id)
    references public.tasks (id, user_id) on delete cascade
);

-- ---------------------------------------------------------------------
-- Etiquetas y relación muchos-a-muchos con tareas
-- ---------------------------------------------------------------------
create table public.tags (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name        text not null check (char_length(trim(name)) between 1 and 30),
  color       text not null default 'slate' check (color ~ '^[a-z]+$'),
  created_at  timestamptz not null default now(),
  unique (id, user_id),
  unique (user_id, name)
);

create table public.task_tags (
  task_id     uuid not null,
  tag_id      uuid not null,
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  primary key (task_id, tag_id),
  foreign key (task_id, user_id) references public.tasks (id, user_id) on delete cascade,
  foreign key (tag_id, user_id)  references public.tags (id, user_id)  on delete cascade
);

-- ---------------------------------------------------------------------
-- Triggers de updated_at
-- ---------------------------------------------------------------------
create trigger profiles_set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger projects_set_updated_at before update on public.projects
  for each row execute function public.set_updated_at();
create trigger tasks_set_updated_at before update on public.tasks
  for each row execute function public.set_updated_at();
create trigger subtasks_set_updated_at before update on public.subtasks
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- Índices (las FK no crean índices automáticamente en Postgres)
-- ---------------------------------------------------------------------
create index tasks_user_status_idx   on public.tasks (user_id, status, position);
create index tasks_user_due_idx      on public.tasks (user_id, due_date);
create index tasks_project_idx       on public.tasks (project_id);
create index subtasks_task_idx       on public.subtasks (task_id, position);
create index task_tags_tag_idx       on public.task_tags (tag_id);

-- ---------------------------------------------------------------------
-- Permisos: solo usuarios autenticados; los anónimos no ven nada
-- ---------------------------------------------------------------------
revoke all on public.profiles, public.projects, public.tasks,
              public.subtasks, public.tags, public.task_tags from anon;

grant select, update                 on public.profiles  to authenticated;
grant select, insert, update, delete on public.projects  to authenticated;
grant select, insert, update, delete on public.tasks     to authenticated;
grant select, insert, update, delete on public.subtasks  to authenticated;
grant select, insert, update, delete on public.tags      to authenticated;
grant select, insert, delete         on public.task_tags to authenticated;

-- ---------------------------------------------------------------------
-- Row Level Security
-- (select auth.uid()) se evalúa una vez por consulta, no por fila.
-- ---------------------------------------------------------------------
alter table public.profiles  enable row level security;
alter table public.projects  enable row level security;
alter table public.tasks     enable row level security;
alter table public.subtasks  enable row level security;
alter table public.tags      enable row level security;
alter table public.task_tags enable row level security;

-- Perfiles: cada uno ve y edita el suyo (se crean con el trigger).
create policy "perfil: ver el propio" on public.profiles
  for select to authenticated using (id = (select auth.uid()));
create policy "perfil: editar el propio" on public.profiles
  for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- Mismo patrón para el resto de tablas: dueño = usuario actual.
create policy "proyectos: ver propios" on public.projects
  for select to authenticated using (user_id = (select auth.uid()));
create policy "proyectos: crear propios" on public.projects
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "proyectos: editar propios" on public.projects
  for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "proyectos: borrar propios" on public.projects
  for delete to authenticated using (user_id = (select auth.uid()));

create policy "tareas: ver propias" on public.tasks
  for select to authenticated using (user_id = (select auth.uid()));
create policy "tareas: crear propias" on public.tasks
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "tareas: editar propias" on public.tasks
  for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "tareas: borrar propias" on public.tasks
  for delete to authenticated using (user_id = (select auth.uid()));

create policy "subtareas: ver propias" on public.subtasks
  for select to authenticated using (user_id = (select auth.uid()));
create policy "subtareas: crear propias" on public.subtasks
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "subtareas: editar propias" on public.subtasks
  for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "subtareas: borrar propias" on public.subtasks
  for delete to authenticated using (user_id = (select auth.uid()));

create policy "etiquetas: ver propias" on public.tags
  for select to authenticated using (user_id = (select auth.uid()));
create policy "etiquetas: crear propias" on public.tags
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "etiquetas: editar propias" on public.tags
  for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "etiquetas: borrar propias" on public.tags
  for delete to authenticated using (user_id = (select auth.uid()));

create policy "tarea-etiqueta: ver propias" on public.task_tags
  for select to authenticated using (user_id = (select auth.uid()));
create policy "tarea-etiqueta: crear propias" on public.task_tags
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "tarea-etiqueta: borrar propias" on public.task_tags
  for delete to authenticated using (user_id = (select auth.uid()));

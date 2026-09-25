-- =============================================================================
-- La Rayuela School — esquema Supabase
-- Ejecutar en SQL Editor (o supabase db push) ANTES del seed.
-- =============================================================================

create extension if not exists "pgcrypto";

-- ---------- Enums ----------
do $$ begin
  create type user_role as enum ('tutor', 'parent');
exception when duplicate_object then null; end $$;

do $$ begin
  create type relationship_type as enum ('madre', 'padre', 'tutor_legal', 'otro');
exception when duplicate_object then null; end $$;

do $$ begin
  create type assignment_status as enum ('publicada', 'cerrada');
exception when duplicate_object then null; end $$;

do $$ begin
  create type submission_status as enum ('pendiente', 'entregada', 'revisada', 'tardia');
exception when duplicate_object then null; end $$;

do $$ begin
  create type payment_status as enum ('pendiente', 'en_revision', 'pagado', 'vencido', 'rechazado');
exception when duplicate_object then null; end $$;

do $$ begin
  create type receipt_status as enum ('pendiente', 'aprobado', 'rechazado');
exception when duplicate_object then null; end $$;

do $$ begin
  create type event_type as enum ('clase', 'tarea', 'evento', 'feriado', 'pago', 'reunion');
exception when duplicate_object then null; end $$;

do $$ begin
  create type notification_type as enum ('tarea', 'mensaje', 'pago', 'evento', 'sistema');
exception when duplicate_object then null; end $$;

-- ---------- updated_at trigger ----------
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ---------- profiles ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text not null,
  role user_role not null,
  phone text,
  avatar_url text,
  subject text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_profiles_updated on public.profiles;
create trigger trg_profiles_updated
  before update on public.profiles
  for each row execute function set_updated_at();

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'parent')
  )
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- academic years ----------
create table if not exists public.academic_years (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  start_date date not null,
  end_date date not null,
  is_active boolean not null default false,
  constraint years_range check (end_date > start_date)
);

create unique index if not exists one_active_year
  on public.academic_years (is_active) where is_active = true;

-- ---------- students ----------
create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  grade text not null,
  section text,
  photo_url text,
  academic_year_id uuid references public.academic_years(id),
  birth_date date,
  created_at timestamptz not null default now()
);

-- ---------- parent_students ----------
create table if not exists public.parent_students (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references public.profiles(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  relationship relationship_type not null default 'padre',
  unique (parent_id, student_id)
);

-- ---------- classes ----------
create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  subject text not null,
  grade text,
  section text,
  room text,
  color text default '#2196F3',
  tutor_id uuid not null references public.profiles(id),
  academic_year_id uuid references public.academic_years(id),
  created_at timestamptz not null default now()
);

-- ---------- enrollments ----------
create table if not exists public.class_enrollments (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  unique (class_id, student_id)
);

-- ---------- schedule ----------
create table if not exists public.schedule_slots (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  weekday smallint not null check (weekday between 1 and 7),
  start_time time not null,
  end_time time not null,
  room text,
  constraint slot_time check (end_time > start_time)
);

-- ---------- assignments ----------
create table if not exists public.assignments (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  tutor_id uuid not null references public.profiles(id),
  title text not null,
  description text,
  due_date timestamptz not null,
  attachment_url text,
  attachment_name text,
  status assignment_status not null default 'publicada',
  created_at timestamptz not null default now()
);

-- ---------- submissions ----------
create table if not exists public.assignment_submissions (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.assignments(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  uploaded_by uuid not null references public.profiles(id),
  file_url text not null,
  file_name text,
  notes text,
  status submission_status not null default 'entregada',
  tutor_feedback text,
  submitted_at timestamptz not null default now(),
  unique (assignment_id, student_id)
);

-- ---------- calendar ----------
create table if not exists public.calendar_events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  event_date date not null,
  event_type event_type not null default 'evento',
  class_id uuid references public.classes(id) on delete set null,
  student_id uuid references public.students(id) on delete set null,
  academic_year_id uuid references public.academic_years(id),
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create index if not exists calendar_events_date_idx on public.calendar_events (event_date);

-- ---------- messages ----------
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.profiles(id),
  subject text not null,
  body text not null,
  parent_id uuid references public.messages(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.message_recipients (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.messages(id) on delete cascade,
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  read_at timestamptz,
  unique (message_id, recipient_id)
);

-- ---------- notifications ----------
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  body text,
  type notification_type not null default 'sistema',
  link text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_idx on public.notifications (user_id, created_at desc);

-- ---------- payments ----------
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  academic_year_id uuid not null references public.academic_years(id),
  month smallint not null check (month between 1 and 12),
  year smallint not null,
  concept text not null default 'Colegiatura',
  amount numeric(10,2) not null,
  due_date date not null,
  status payment_status not null default 'pendiente',
  unique (student_id, academic_year_id, month, year)
);

create table if not exists public.payment_receipts (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid not null references public.payments(id) on delete cascade,
  uploaded_by uuid not null references public.profiles(id),
  file_url text not null,
  file_name text,
  notes text,
  status receipt_status not null default 'pendiente',
  reviewed_by uuid references public.profiles(id),
  review_notes text,
  uploaded_at timestamptz not null default now(),
  reviewed_at timestamptz
);

-- ---------- helper: generate 10 monthly payments (sep–jun) ----------
create or replace function public.generate_tuition_plan(
  p_student uuid,
  p_year uuid,
  p_amount numeric
) returns void language plpgsql as $$
declare
  y academic_years%rowtype;
  m int;
  cal_year int;
  due date;
begin
  select * into y from academic_years where id = p_year;
  foreach m in array array[9,10,11,12,1,2,3,4,5,6] loop
    cal_year := case when m >= 9 then extract(year from y.start_date)::int
                     else extract(year from y.end_date)::int end;
    due := make_date(cal_year, m, 5);
    insert into payments (student_id, academic_year_id, month, year, amount, due_date)
    values (p_student, p_year, m, cal_year, p_amount, due)
    on conflict do nothing;
  end loop;
end $$;

-- =============================================================================
-- RLS
-- =============================================================================
alter table public.profiles enable row level security;
alter table public.academic_years enable row level security;
alter table public.students enable row level security;
alter table public.parent_students enable row level security;
alter table public.classes enable row level security;
alter table public.class_enrollments enable row level security;
alter table public.schedule_slots enable row level security;
alter table public.assignments enable row level security;
alter table public.assignment_submissions enable row level security;
alter table public.calendar_events enable row level security;
alter table public.messages enable row level security;
alter table public.message_recipients enable row level security;
alter table public.notifications enable row level security;
alter table public.payments enable row level security;
alter table public.payment_receipts enable row level security;

-- Drop old policies if re-run
do $$
declare r record;
begin
  for r in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
  loop
    execute format('drop policy if exists %I on %I.%I', r.policyname, r.schemaname, r.tablename);
  end loop;
end $$;

-- academic_years: visible a autenticados
create policy years_read on public.academic_years for select to authenticated using (true);

-- profiles
create policy profiles_self on public.profiles
  for select to authenticated using (id = auth.uid());

create policy profiles_update_self on public.profiles
  for update to authenticated using (id = auth.uid());

create policy profiles_related on public.profiles
  for select to authenticated using (
    -- tutores de las clases de mis hijos
    exists (
      select 1 from parent_students ps
      join class_enrollments ce on ce.student_id = ps.student_id
      join classes c on c.id = ce.class_id
      where ps.parent_id = auth.uid() and c.tutor_id = profiles.id
    )
    or
    -- padres de mis alumnos
    exists (
      select 1 from classes c
      join class_enrollments ce on ce.class_id = c.id
      join parent_students ps on ps.student_id = ce.student_id
      where c.tutor_id = auth.uid() and ps.parent_id = profiles.id
    )
  );

-- students
create policy students_parent on public.students
  for select to authenticated using (
    exists (select 1 from parent_students where parent_id = auth.uid() and student_id = students.id)
  );

create policy students_tutor on public.students
  for select to authenticated using (
    exists (
      select 1 from class_enrollments ce
      join classes c on c.id = ce.class_id
      where ce.student_id = students.id and c.tutor_id = auth.uid()
    )
  );

-- parent_students
create policy ps_parent on public.parent_students
  for select to authenticated using (parent_id = auth.uid());

create policy ps_tutor on public.parent_students
  for select to authenticated using (
    exists (
      select 1 from class_enrollments ce
      join classes c on c.id = ce.class_id
      where ce.student_id = parent_students.student_id and c.tutor_id = auth.uid()
    )
  );

-- classes
create policy classes_tutor on public.classes
  for all to authenticated using (tutor_id = auth.uid())
  with check (tutor_id = auth.uid());

create policy classes_parent on public.classes
  for select to authenticated using (
    exists (
      select 1 from class_enrollments ce
      join parent_students ps on ps.student_id = ce.student_id
      where ce.class_id = classes.id and ps.parent_id = auth.uid()
    )
  );

-- enrollments
create policy enroll_tutor on public.class_enrollments
  for select to authenticated using (
    exists (select 1 from classes c where c.id = class_id and c.tutor_id = auth.uid())
  );

create policy enroll_parent on public.class_enrollments
  for select to authenticated using (
    exists (select 1 from parent_students ps where ps.student_id = class_enrollments.student_id and ps.parent_id = auth.uid())
  );

-- schedule
create policy slots_read on public.schedule_slots
  for select to authenticated using (
    exists (select 1 from classes c where c.id = class_id and c.tutor_id = auth.uid())
    or exists (
      select 1 from class_enrollments ce
      join parent_students ps on ps.student_id = ce.student_id
      where ce.class_id = schedule_slots.class_id and ps.parent_id = auth.uid()
    )
  );

-- assignments
create policy asg_tutor on public.assignments
  for all to authenticated using (tutor_id = auth.uid())
  with check (tutor_id = auth.uid());

create policy asg_parent on public.assignments
  for select to authenticated using (
    exists (
      select 1 from class_enrollments ce
      join parent_students ps on ps.student_id = ce.student_id
      where ce.class_id = assignments.class_id and ps.parent_id = auth.uid()
    )
  );

-- submissions
create policy sub_parent_rw on public.assignment_submissions
  for all to authenticated using (
    exists (
      select 1 from parent_students ps
      where ps.parent_id = auth.uid() and ps.student_id = assignment_submissions.student_id
    )
  )
  with check (
    uploaded_by = auth.uid()
    and exists (
      select 1 from parent_students ps
      where ps.parent_id = auth.uid() and ps.student_id = assignment_submissions.student_id
    )
  );

create policy sub_tutor on public.assignment_submissions
  for select to authenticated using (
    exists (
      select 1 from assignments a
      where a.id = assignment_id and a.tutor_id = auth.uid()
    )
  );

create policy sub_tutor_update on public.assignment_submissions
  for update to authenticated using (
    exists (
      select 1 from assignments a
      where a.id = assignment_id and a.tutor_id = auth.uid()
    )
  );

-- calendar
create policy cal_read on public.calendar_events
  for select to authenticated using (
    student_id is null and class_id is null
    or exists (
      select 1 from parent_students ps
      where ps.parent_id = auth.uid()
        and (ps.student_id = calendar_events.student_id
             or exists (
               select 1 from class_enrollments ce
               where ce.student_id = ps.student_id and ce.class_id = calendar_events.class_id
             ))
    )
    or exists (select 1 from classes c where c.id = class_id and c.tutor_id = auth.uid())
    or created_by = auth.uid()
  );

create policy cal_tutor_write on public.calendar_events
  for insert to authenticated with check (
    exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'tutor')
  );

-- messages
create policy msg_sender on public.messages
  for select to authenticated using (
    sender_id = auth.uid()
    or exists (select 1 from message_recipients r where r.message_id = messages.id and r.recipient_id = auth.uid())
  );

create policy msg_insert on public.messages
  for insert to authenticated with check (sender_id = auth.uid());

create policy rec_self on public.message_recipients
  for select to authenticated using (
    recipient_id = auth.uid()
    or exists (select 1 from messages m where m.id = message_id and m.sender_id = auth.uid())
  );

create policy rec_insert on public.message_recipients
  for insert to authenticated with check (
    exists (select 1 from messages m where m.id = message_id and m.sender_id = auth.uid())
  );

create policy rec_update_read on public.message_recipients
  for update to authenticated using (recipient_id = auth.uid());

-- notifications
create policy notif_self on public.notifications
  for select to authenticated using (user_id = auth.uid());

create policy notif_update on public.notifications
  for update to authenticated using (user_id = auth.uid());

-- payments
create policy pay_parent on public.payments
  for select to authenticated using (
    exists (select 1 from parent_students ps where ps.parent_id = auth.uid() and ps.student_id = payments.student_id)
  );

create policy pay_tutor on public.payments
  for select to authenticated using (
    exists (
      select 1 from class_enrollments ce
      join classes c on c.id = ce.class_id
      where ce.student_id = payments.student_id and c.tutor_id = auth.uid()
    )
  );

create policy pay_tutor_update on public.payments
  for update to authenticated using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'tutor')
  );

-- receipts
create policy recp_parent on public.payment_receipts
  for all to authenticated using (uploaded_by = auth.uid())
  with check (uploaded_by = auth.uid());

create policy recp_tutor on public.payment_receipts
  for select to authenticated using (
    exists (
      select 1 from payments p
      join class_enrollments ce on ce.student_id = p.student_id
      join classes c on c.id = ce.class_id
      where p.id = payment_id and c.tutor_id = auth.uid()
    )
  );

create policy recp_tutor_review on public.payment_receipts
  for update to authenticated using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'tutor')
  );

-- Storage buckets (run also from Dashboard > Storage if the API rejects this)
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true),
       ('assignments', 'assignments', false),
       ('submissions', 'submissions', false),
       ('receipts', 'receipts', false)
on conflict (id) do nothing;

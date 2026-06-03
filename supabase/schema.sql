-- ============================================================
-- Nido PWA — Schema SQL para Supabase
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================================

-- Habilitar extensión uuid si no está activa
create extension if not exists "pgcrypto";

-- ============================================================
-- TABLA: transactions
-- ============================================================
create table if not exists public.transactions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  description text not null,
  amount      numeric(12,2) not null check (amount > 0),
  type        text not null check (type in ('income','expense')),
  category    text not null,
  date        date not null,
  created_at  timestamptz default now() not null
);

alter table public.transactions enable row level security;

create policy "transactions: owner only"
  on public.transactions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- TABLA: tasks
-- ============================================================
create table if not exists public.tasks (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users(id) on delete cascade not null,
  text       text not null,
  done       boolean default false not null,
  time       text,
  type       text not null check (type in ('today','pending')) default 'pending',
  created_at timestamptz default now() not null
);

alter table public.tasks enable row level security;

create policy "tasks: owner only"
  on public.tasks for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- TABLA: events
-- ============================================================
create table if not exists public.events (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users(id) on delete cascade not null,
  text       text not null,
  date       date not null,
  created_at timestamptz default now() not null
);

alter table public.events enable row level security;

create policy "events: owner only"
  on public.events for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- TABLA: habits
-- ============================================================
create table if not exists public.habits (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users(id) on delete cascade not null,
  name       text not null,
  created_at timestamptz default now() not null
);

alter table public.habits enable row level security;

create policy "habits: owner only"
  on public.habits for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- TABLA: habit_logs
-- ============================================================
create table if not exists public.habit_logs (
  id         uuid primary key default gen_random_uuid(),
  habit_id   uuid references public.habits(id) on delete cascade not null,
  user_id    uuid references auth.users(id) on delete cascade not null,
  date       date not null,
  created_at timestamptz default now() not null,
  unique (habit_id, date)
);

alter table public.habit_logs enable row level security;

create policy "habit_logs: owner only"
  on public.habit_logs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- TABLA: notes
-- ============================================================
create table if not exists public.notes (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users(id) on delete cascade not null,
  title      text not null,
  body       text,
  tag        text not null check (tag in ('personal','trabajo','ideas','salud')) default 'personal',
  created_at timestamptz default now() not null
);

alter table public.notes enable row level security;

create policy "notes: owner only"
  on public.notes for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- TABLA: mood_logs
-- ============================================================
create table if not exists public.mood_logs (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users(id) on delete cascade not null,
  mood       text not null,
  note       text,
  date       date not null,
  created_at timestamptz default now() not null,
  unique (user_id, date)
);

alter table public.mood_logs enable row level security;

create policy "mood_logs: owner only"
  on public.mood_logs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- Índices para mejorar rendimiento en queries frecuentes
-- ============================================================
create index if not exists idx_transactions_user_date on public.transactions(user_id, date);
create index if not exists idx_tasks_user_type       on public.tasks(user_id, type);
create index if not exists idx_events_user_date      on public.events(user_id, date);
create index if not exists idx_habits_user           on public.habits(user_id);
create index if not exists idx_habit_logs_habit_date on public.habit_logs(habit_id, date);
create index if not exists idx_notes_user            on public.notes(user_id);
create index if not exists idx_mood_logs_user_date   on public.mood_logs(user_id, date);

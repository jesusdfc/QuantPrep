create table if not exists public.question_progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  question_id text not null,
  status text not null default 'unseen'
    check (status in ('unseen', 'attempted', 'solved')),
  favorite boolean not null default false,
  reps integer not null default 0 check (reps >= 0),
  interval_days integer not null default 0 check (interval_days >= 0),
  ease double precision not null default 2.5 check (ease >= 1.3),
  due_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, question_id)
);

create index if not exists question_progress_user_due_idx
  on public.question_progress (user_id, due_at);

alter table public.question_progress enable row level security;

revoke all on table public.question_progress from anon;
grant select, insert, update, delete on table public.question_progress to authenticated;

drop policy if exists "Users manage their own question progress"
  on public.question_progress;

create policy "Users manage their own question progress"
  on public.question_progress
  for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

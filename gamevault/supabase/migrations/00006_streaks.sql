create table public.streaks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references public.users(id) on delete cascade,
  current_streak integer default 0 not null,
  longest_streak integer default 0 not null,
  last_deposit_date date,
  freeze_count integer default 1 not null,
  synced_at timestamptz default now(),
  constraint streaks_user_id_fkey foreign key (user_id) references public.users(id) on delete cascade,
  constraint streaks_user_id_unique unique (user_id)
);

create index idx_streaks_user_id on public.streaks(user_id);

alter table public.streaks add constraint streaks_nonnegative_current check (current_streak >= 0);
alter table public.streaks add constraint streaks_nonnegative_longest check (longest_streak >= 0);
alter table public.streaks add constraint streaks_nonnegative_freeze check (freeze_count >= 0);

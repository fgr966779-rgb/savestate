create table public.achievements (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references public.users(id) on delete cascade,
  achievement_id text not null,
  unlocked boolean default false not null,
  unlocked_at timestamptz,
  synced_at timestamptz default now(),
  constraint achievements_user_id_fkey foreign key (user_id) references public.users(id) on delete cascade,
  constraint achievements_user_achievement_unique unique (user_id, achievement_id)
);

create index idx_achievements_user_id on public.achievements(user_id);
create unique index idx_achievements_user_achievement on public.achievements(user_id, achievement_id);

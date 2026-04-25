create type public.goal_strategy as enum ('speed_run', 'daily_grind', 'quest_mode', 'custom');
create type public.goal_status as enum ('active', 'completed', 'paused');

create table public.goals (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references public.users(id) on delete cascade,
  title text not null,
  target_amount numeric(15, 2) not null,
  current_amount numeric(15, 2) default 0 not null,
  icon text default 'shield',
  color text default '#0070D1',
  strategy public.goal_strategy default 'daily_grind' not null,
  status public.goal_status default 'active' not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  synced_at timestamptz default now(),
  constraint goals_user_id_fkey foreign key (user_id) references public.users(id) on delete cascade
);

create index idx_goals_user_id on public.goals(user_id);
create index idx_goals_status on public.goals(status);

alter table public.goals add constraint goals_positive_target check (target_amount > 0);
alter table public.goals add constraint goals_nonnegative_current check (current_amount >= 0);

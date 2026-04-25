create type public.quest_type as enum ('daily', 'weekly', 'story');
create type public.quest_status as enum ('active', 'completed', 'expired');

create table public.quests (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references public.users(id) on delete cascade,
  quest_template_id text not null,
  type public.quest_type not null,
  status public.quest_status default 'active' not null,
  progress integer default 0 not null,
  target integer not null,
  xp_reward integer not null,
  coin_reward integer default 0 not null,
  expires_at timestamptz,
  completed_at timestamptz,
  synced_at timestamptz default now(),
  constraint quests_user_id_fkey foreign key (user_id) references public.users(id) on delete cascade
);

create index idx_quests_user_id on public.quests(user_id);
create index idx_quests_type on public.quests(type);
create index idx_quests_status on public.quests(status);
create index idx_quests_expires_at on public.quests(expires_at);

alter table public.quests add constraint quests_positive_target check (target > 0);
alter table public.quests add constraint quests_nonnegative_progress check (progress >= 0);
alter table public.quests add constraint quests_nonnegative_xp check (xp_reward >= 0);
alter table public.quests add constraint quests_nonnegative_coins check (coin_reward >= 0);

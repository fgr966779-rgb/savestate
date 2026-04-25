create type public.transaction_type as enum ('deposit', 'withdrawal', 'bonus');

create table public.transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references public.users(id) on delete cascade,
  goal_id uuid not null references public.goals(id) on delete cascade,
  type public.transaction_type not null,
  amount numeric(15, 2) not null,
  category text,
  note text,
  xp_earned integer default 0 not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  synced_at timestamptz default now(),
  constraint transactions_user_id_fkey foreign key (user_id) references public.users(id) on delete cascade,
  constraint transactions_goal_id_fkey foreign key (goal_id) references public.goals(id) on delete cascade
);

create index idx_transactions_user_id on public.transactions(user_id);
create index idx_transactions_goal_id on public.transactions(goal_id);
create index idx_transactions_type on public.transactions(type);
create index idx_transactions_created_at on public.transactions(created_at);

alter table public.transactions add constraint transactions_positive_amount check (amount > 0);

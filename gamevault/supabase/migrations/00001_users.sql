create table public.users (
  id uuid not null references auth.users(id) on delete cascade primary key,
  email text not null unique,
  nickname text not null,
  avatar_id text default 'knight',
  avatar_color text default '#0070D1',
  level integer default 1 not null,
  total_xp integer default 0 not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  synced_at timestamptz default now()
);

create index idx_users_email on public.users(email);
create index idx_users_nickname on public.users(nickname);

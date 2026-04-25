-- ============================================================
-- Enable Row Level Security on ALL tables
-- ============================================================

alter table public.users enable row level security;
alter table public.goals enable row level security;
alter table public.transactions enable row level security;
alter table public.quests enable row level security;
alter table public.achievements enable row level security;
alter table public.streaks enable row level security;

-- ============================================================
-- USERS table policies
-- ============================================================

-- Users can read their own data
create policy "users_select_own" on public.users
  for select
  using (auth.uid() = id);

-- Users can insert their own data
create policy "users_insert_own" on public.users
  for insert
  with check (auth.uid() = id);

-- Users can update their own data
create policy "users_update_own" on public.users
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Service role can read all users (for leaderboards)
create policy "users_select_service_role" on public.users
  for select
  to service_role
  using (true);

-- ============================================================
-- GOALS table policies
-- ============================================================

-- Users can read their own goals
create policy "goals_select_own" on public.goals
  for select
  using (auth.uid() = user_id);

-- Users can insert their own goals
create policy "goals_insert_own" on public.goals
  for insert
  with check (auth.uid() = user_id);

-- Users can update their own goals
create policy "goals_update_own" on public.goals
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Users can delete their own goals
create policy "goals_delete_own" on public.goals
  for delete
  using (auth.uid() = user_id);

-- Service role can read all goals
create policy "goals_select_service_role" on public.goals
  for select
  to service_role
  using (true);

-- ============================================================
-- TRANSACTIONS table policies
-- ============================================================

-- Users can read their own transactions
create policy "transactions_select_own" on public.transactions
  for select
  using (auth.uid() = user_id);

-- Users can insert their own transactions
create policy "transactions_insert_own" on public.transactions
  for insert
  with check (auth.uid() = user_id);

-- Users can update their own transactions
create policy "transactions_update_own" on public.transactions
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Users can delete their own transactions
create policy "transactions_delete_own" on public.transactions
  for delete
  using (auth.uid() = user_id);

-- Service role can read all transactions
create policy "transactions_select_service_role" on public.transactions
  for select
  to service_role
  using (true);

-- ============================================================
-- QUESTS table policies
-- ============================================================

-- Users can read their own quests
create policy "quests_select_own" on public.quests
  for select
  using (auth.uid() = user_id);

-- Users can insert their own quests
create policy "quests_insert_own" on public.quests
  for insert
  with check (auth.uid() = user_id);

-- Users can update their own quests
create policy "quests_update_own" on public.quests
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Service role can read all quests
create policy "quests_select_service_role" on public.quests
  for select
  to service_role
  using (true);

-- ============================================================
-- ACHIEVEMENTS table policies
-- ============================================================

-- Users can read their own achievements
create policy "achievements_select_own" on public.achievements
  for select
  using (auth.uid() = user_id);

-- Users can insert their own achievements
create policy "achievements_insert_own" on public.achievements
  for insert
  with check (auth.uid() = user_id);

-- Users can update their own achievements
create policy "achievements_update_own" on public.achievements
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Service role can read all achievements
create policy "achievements_select_service_role" on public.achievements
  for select
  to service_role
  using (true);

-- ============================================================
-- STREAKS table policies
-- ============================================================

-- Users can read their own streaks
create policy "streaks_select_own" on public.streaks
  for select
  using (auth.uid() = user_id);

-- Users can insert their own streaks
create policy "streaks_insert_own" on public.streaks
  for insert
  with check (auth.uid() = user_id);

-- Users can update their own streaks
create policy "streaks_update_own" on public.streaks
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Service role can read all streaks
create policy "streaks_select_service_role" on public.streaks
  for select
  to service_role
  using (true);

-- ============================================================
-- LEADERBOARD view (readable by all authenticated users)
-- ============================================================

create or replace view public.leaderboard as
select
  u.id as user_id,
  u.nickname,
  u.avatar_id,
  u.avatar_color,
  u.level,
  u.total_xp,
  s.current_streak,
  s.longest_streak,
  coalesce(g.completed_goals_count, 0) as completed_goals_count,
  coalesce(g.total_saved, 0) as total_saved,
  coalesce(a.unlocked_count, 0) as unlocked_achievements_count
from public.users u
left join public.streaks s on s.user_id = u.id
left join (
  select
    user_id,
    count(*) filter (where status = 'completed') as completed_goals_count,
    sum(current_amount) as total_saved
  from public.goals
  group by user_id
) g on g.user_id = u.id
left join (
  select
    user_id,
    count(*) as unlocked_count
  from public.achievements
  where unlocked = true
  group by user_id
) a on a.user_id = u.id
order by u.total_xp desc, s.current_streak desc;

-- Authenticated users can read the leaderboard
create policy "leaderboard_select_authenticated" on public.leaderboard
  for select
  to authenticated
  using (true);

-- Service role can read the leaderboard
create policy "leaderboard_select_service_role" on public.leaderboard
  for select
  to service_role
  using (true);

-- ============================================================
-- Helper functions
-- ============================================================

-- Auto-update updated_at trigger function
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  new.synced_at = now();
  return new;
end;
$$ language plpgsql;

-- Apply updated_at triggers to all tables
create trigger users_updated_at before update on public.users
  for each row execute procedure public.handle_updated_at();

create trigger goals_updated_at before update on public.goals
  for each row execute procedure public.handle_updated_at();

create trigger transactions_updated_at before update on public.transactions
  for each row execute procedure public.handle_updated_at();

create trigger quests_updated_at before update on public.quests
  for each row execute procedure public.handle_updated_at();

create trigger achievements_updated_at before update on public.achievements
  for each row execute procedure public.handle_updated_at();

create trigger streaks_updated_at before update on public.streaks
  for each row execute procedure public.handle_updated_at();

-- ============================================================
-- Auto-create user profile on signup
-- ============================================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, nickname)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'nickname', split_part(new.email, '@', 1))
  );
  -- Auto-create streak record for new user
  insert into public.streaks (user_id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

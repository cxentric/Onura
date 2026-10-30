-- CXentric database schema for Supabase.
-- Run once in the Supabase dashboard: SQL Editor → New query → paste → Run.
-- Safe to re-run: every statement is idempotent.

-- 1. Profiles: one row per user, holding the Pro plan expiry. Created automatically on sign-up.
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  pro_until timestamptz,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Users can read their own profile" on public.profiles;
create policy "Users can read their own profile"
  on public.profiles for select
  using (auth.uid() = id);
-- No insert/update policies: only the server (service role) can change the plan.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id) values (new.id) on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2. Payments: one row per captured Razorpay payment (the payment id makes granting idempotent).
--    A one-time pass has an order id; an Autopay debit has a subscription id.
create table if not exists public.payments (
  id text primary key, -- Razorpay payment id
  user_id uuid not null references auth.users (id) on delete cascade,
  order_id text,
  subscription_id text,
  plan text not null check (plan in ('monthly', 'yearly')),
  amount_paise integer not null,
  created_at timestamptz not null default now()
);

alter table public.payments enable row level security;

drop policy if exists "Users can read their own payments" on public.payments;
create policy "Users can read their own payments"
  on public.payments for select
  using (auth.uid() = user_id);

-- 3. Subscriptions: UPI Autopay (recurring) plans, kept in step by the Razorpay webhook.
create table if not exists public.subscriptions (
  id text primary key, -- Razorpay subscription id
  user_id uuid not null references auth.users (id) on delete cascade,
  plan text not null check (plan in ('monthly', 'yearly')),
  status text not null, -- created, authenticated, active, pending, halted, cancelled, completed…
  current_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.subscriptions enable row level security;

drop policy if exists "Users can read their own subscriptions" on public.subscriptions;
create policy "Users can read their own subscriptions"
  on public.subscriptions for select
  using (auth.uid() = user_id);

-- Grants Pro for a payment exactly once.
-- One-time pass: adds 30 or 365 days to any time already left.
-- Autopay debit: p_until is the end of the paid cycle, so Pro runs until then.
-- Called only by the Cloudflare functions with the service-role key.
drop function if exists public.grant_pro(uuid, text, text, text, integer);
create or replace function public.grant_pro(
  p_user_id uuid,
  p_payment_id text,
  p_plan text,
  p_amount_paise integer,
  p_order_id text default null,
  p_subscription_id text default null,
  p_until timestamptz default null
)
returns timestamptz
language plpgsql
security definer set search_path = ''
as $$
declare
  v_days integer := case p_plan when 'yearly' then 365 when 'monthly' then 30 end;
  v_until timestamptz;
begin
  if v_days is null then
    raise exception 'Unknown plan %', p_plan;
  end if;

  insert into public.payments (id, user_id, order_id, subscription_id, plan, amount_paise)
  values (p_payment_id, p_user_id, p_order_id, p_subscription_id, p_plan, p_amount_paise)
  on conflict (id) do nothing;

  if found then
    insert into public.profiles (id) values (p_user_id) on conflict (id) do nothing;
    update public.profiles
      set pro_until = case
        when p_until is not null then greatest(coalesce(pro_until, now()), p_until)
        else greatest(coalesce(pro_until, now()), now()) + make_interval(days => v_days)
      end
      where id = p_user_id;
  end if;

  select pro_until into v_until from public.profiles where id = p_user_id;
  return v_until;
end;
$$;

revoke all on function public.grant_pro(uuid, text, text, integer, text, text, timestamptz) from public, anon, authenticated;

-- 4. Progress: learning progress synced across devices (Pro feature), as one small JSON document per user.
create table if not exists public.progress (
  user_id uuid primary key references auth.users (id) on delete cascade,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.progress enable row level security;

-- Sync is a Pro feature, so the rule also requires an active plan.
drop policy if exists "Users manage their own progress" on public.progress;
drop policy if exists "Pro users manage their own progress" on public.progress;
create policy "Pro users manage their own progress"
  on public.progress for all
  using (
    auth.uid() = user_id
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.pro_until > now())
  )
  with check (
    auth.uid() = user_id
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.pro_until > now())
  );

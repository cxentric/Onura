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
declare
  v_founder uuid;
  v_avatar text := new.raw_user_meta_data ->> 'avatar_url';
begin
  insert into public.profiles (id) values (new.id) on conflict (id) do nothing;

  -- Public card used for connections: name and picture from Google, or the start of the email.
  insert into public.member_profiles (id, display_name, avatar_url)
  values (
    new.id,
    left(coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), nullif(new.raw_user_meta_data ->> 'name', ''), split_part(new.email, '@', 1)), 80),
    case when v_avatar like 'https://%' then v_avatar end
  )
  on conflict (id) do nothing;

  -- Every member is connected to the founder (the super admin) from the start.
  select user_id into v_founder from public.admins where role = 'super_admin';
  if v_founder is not null and v_founder <> new.id then
    insert into public.connections (user_a, user_b, status, requested_by, accepted_at)
    values (least(v_founder, new.id), greatest(v_founder, new.id), 'accepted', v_founder, now())
    on conflict do nothing;
  end if;
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

-- =====================================================================================
-- 5. Member profiles: the public card other members see (name, headline, picture).
create table if not exists public.member_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '' check (char_length(display_name) <= 80),
  headline text not null default '' check (char_length(headline) <= 140),
  avatar_url text check (avatar_url is null or avatar_url like 'https://%'),
  updated_at timestamptz not null default now()
);

alter table public.member_profiles enable row level security;

drop policy if exists "Members can see member cards" on public.member_profiles;
create policy "Members can see member cards"
  on public.member_profiles for select to authenticated
  using (true);

drop policy if exists "Members edit their own card" on public.member_profiles;
create policy "Members edit their own card"
  on public.member_profiles for update to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Cards for people who signed up before this table existed.
insert into public.member_profiles (id, display_name)
select u.id, left(coalesce(nullif(u.raw_user_meta_data ->> 'full_name', ''), split_part(u.email, '@', 1)), 80)
from auth.users u
on conflict (id) do nothing;

-- =====================================================================================
-- 6. Admin team. Roles, from most to least power:
--    super_admin (exactly one: the founder), app_admin (settings and questions),
--    user_admin (users and subscriptions), member (read-only, user details masked).
create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role text not null check (role in ('super_admin', 'app_admin', 'user_admin', 'member')),
  added_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create unique index if not exists admins_only_one_super_admin on public.admins ((true)) where role = 'super_admin';

alter table public.admins enable row level security;

create or replace function public.admin_role()
returns text
language sql stable
security definer set search_path = ''
as $$
  select role from public.admins where user_id = auth.uid();
$$;

drop policy if exists "Admins can see the admin team" on public.admins;
create policy "Admins can see the admin team"
  on public.admins for select to authenticated
  using (public.admin_role() is not null);
-- No write policies: the team changes only through the admin_* functions below.

-- The founder's place can't be taken away or changed, even directly in the database.
create or replace function public.protect_super_admin()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if old.role = 'super_admin' and exists (select 1 from auth.users where id = old.user_id) then
    raise exception 'The super admin can''t be changed or removed.';
  end if;
  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

drop trigger if exists protect_super_admin on public.admins;
create trigger protect_super_admin
  before update or delete on public.admins
  for each row execute function public.protect_super_admin();

-- Raises unless the caller has one of the given roles; returns the caller's role.
create or replace function public.require_admin(p_roles text[])
returns text
language plpgsql stable
security definer set search_path = ''
as $$
declare
  v_role text := public.admin_role();
begin
  if v_role is null or not (v_role = any (p_roles)) then
    raise exception 'You don''t have permission to do this.' using errcode = '42501';
  end if;
  return v_role;
end;
$$;

-- =====================================================================================
-- 7. Audit log: every admin action, append-only. Nobody can edit or delete entries.
create table if not exists public.audit_log (
  id bigint generated always as identity primary key,
  actor_id uuid,
  actor_email text,
  action text not null,
  target text,
  before jsonb,
  after jsonb,
  reason text,
  created_at timestamptz not null default now()
);

alter table public.audit_log enable row level security;

drop policy if exists "Super admin sees all, admins see their own" on public.audit_log;
create policy "Super admin sees all, admins see their own"
  on public.audit_log for select to authenticated
  using (
    public.admin_role() = 'super_admin'
    or (public.admin_role() in ('app_admin', 'user_admin') and actor_id = auth.uid())
  );

create or replace function public.audit_log_is_append_only()
returns trigger
language plpgsql
as $$
begin
  raise exception 'The audit log can''t be changed.';
end;
$$;

drop trigger if exists audit_log_append_only on public.audit_log;
create trigger audit_log_append_only
  before update or delete or truncate on public.audit_log
  for each statement execute function public.audit_log_is_append_only();

create or replace function public.write_audit(p_actor uuid, p_action text, p_target text, p_before jsonb, p_after jsonb, p_reason text)
returns void
language sql
security definer set search_path = ''
as $$
  insert into public.audit_log (actor_id, actor_email, action, target, before, after, reason)
  values (p_actor, (select email from auth.users where id = p_actor), p_action, p_target, p_before, p_after, nullif(trim(p_reason), ''));
$$;

revoke all on function public.write_audit(uuid, text, text, jsonb, jsonb, text) from public, anon, authenticated;
-- The admin site's server functions (service role) call write_audit for actions they perform.

-- =====================================================================================
-- 8. App settings, changed only from the admin console. Public settings are sent to the app.
--    Settings in the 'billing' category can be changed by the super admin only.
create table if not exists public.app_settings (
  key text primary key check (key ~ '^[a-z][a-z0-9_]{1,63}$'),
  value jsonb not null,
  type text not null check (type in ('boolean', 'number', 'text', 'json')),
  category text not null default 'general',
  description text not null default '',
  is_public boolean not null default true,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null
);

alter table public.app_settings enable row level security;

drop policy if exists "Public settings are readable, admins read all" on public.app_settings;
create policy "Public settings are readable, admins read all"
  on public.app_settings for select to anon, authenticated
  using (is_public or public.admin_role() is not null);

insert into public.app_settings (key, value, type, category, description, is_public) values
  ('price_monthly_paise', '14900', 'number', 'billing', 'Monthly Pro price in paise (₹1 = 100). For Autopay, also create a matching Razorpay plan.', true),
  ('price_yearly_paise', '99900', 'number', 'billing', 'Yearly Pro price in paise. For Autopay, also create a matching Razorpay plan.', true),
  ('razorpay_plan_monthly', '""', 'text', 'billing', 'Razorpay plan id (plan_…) used for monthly Autopay. Must charge the monthly price.', false),
  ('razorpay_plan_yearly', '""', 'text', 'billing', 'Razorpay plan id (plan_…) used for yearly Autopay. Must charge the yearly price.', false),
  ('free_runs_per_day', '1', 'number', 'limits', 'Quiz or revision runs a Free user can start each day. The daily challenge is always free.', true),
  ('ai_coach_pro_only', 'true', 'boolean', 'limits', 'AI Coach is for Pro users only.', true),
  ('feature_ai_coach', 'true', 'boolean', 'features', 'Show the AI Coach tab.', true),
  ('feature_hashtags', 'true', 'boolean', 'features', 'Show the hashtag and content ideas tab.', true),
  ('feature_share_badge', 'true', 'boolean', 'features', 'Show the "Share badge" button.', true),
  ('announcement_text', '""', 'text', 'announcements', 'Banner shown at the top of the app. Leave empty to hide it.', true),
  ('announcement_level', '"info"', 'text', 'announcements', 'Banner colour: info, success or warning.', true),
  ('maintenance_mode', 'false', 'boolean', 'announcements', 'Pause the app and show the maintenance message to everyone.', true),
  ('maintenance_message', '"CXentric is getting an upgrade. We''ll be back shortly."', 'text', 'announcements', 'Shown while maintenance mode is on.', true)
on conflict (key) do nothing;

create or replace function public.setting_value_fits(p_type text, p_value jsonb)
returns boolean
language sql immutable
as $$
  select p_type = 'json' or jsonb_typeof(p_value) = case p_type when 'text' then 'string' else p_type end;
$$;

create or replace function public.admin_set_setting(p_key text, p_value jsonb, p_reason text default null)
returns void
language plpgsql
security definer set search_path = ''
as $$
declare
  v_row public.app_settings;
begin
  perform public.require_admin(array['super_admin', 'app_admin']);
  select * into v_row from public.app_settings where key = p_key;
  if not found then raise exception 'Unknown setting %', p_key; end if;
  if v_row.category = 'billing' then perform public.require_admin(array['super_admin']); end if;
  if not public.setting_value_fits(v_row.type, p_value) then
    raise exception 'Setting % must be a %', p_key, v_row.type;
  end if;

  update public.app_settings set value = p_value, updated_at = now(), updated_by = auth.uid() where key = p_key;
  perform public.write_audit(auth.uid(), 'setting.update', p_key, jsonb_build_object('value', v_row.value), jsonb_build_object('value', p_value), p_reason);
end;
$$;

create or replace function public.admin_create_setting(p_key text, p_type text, p_value jsonb, p_category text, p_description text, p_is_public boolean, p_reason text default null)
returns void
language plpgsql
security definer set search_path = ''
as $$
begin
  perform public.require_admin(array['super_admin', 'app_admin']);
  if p_category = 'billing' then perform public.require_admin(array['super_admin']); end if;
  if not public.setting_value_fits(p_type, p_value) then
    raise exception 'The value must be a %', p_type;
  end if;
  insert into public.app_settings (key, value, type, category, description, is_public, updated_by)
  values (p_key, p_value, p_type, coalesce(nullif(trim(p_category), ''), 'general'), coalesce(p_description, ''), p_is_public, auth.uid());
  perform public.write_audit(auth.uid(), 'setting.create', p_key, null,
    jsonb_build_object('value', p_value, 'type', p_type, 'category', p_category, 'is_public', p_is_public), p_reason);
end;
$$;

create or replace function public.admin_delete_setting(p_key text, p_reason text default null)
returns void
language plpgsql
security definer set search_path = ''
as $$
declare
  v_row public.app_settings;
begin
  perform public.require_admin(array['super_admin']);
  delete from public.app_settings where key = p_key returning * into v_row;
  if not found then raise exception 'Unknown setting %', p_key; end if;
  perform public.write_audit(auth.uid(), 'setting.delete', p_key, to_jsonb(v_row), null, p_reason);
end;
$$;

-- =====================================================================================
-- 9. Question bank edits. The 1,000 built-in questions ship with the app; this table holds
--    only changes: an edited question, a hidden one, or a new custom question.
create table if not exists public.kb_overrides (
  id text primary key check (id ~ '^(q[0-9]{4}|c[a-z0-9]{6,20})$'),
  kind text not null check (kind in ('edit', 'hide', 'add')),
  data jsonb not null default '{}',
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null
);

alter table public.kb_overrides enable row level security;

drop policy if exists "Question edits are public" on public.kb_overrides;
create policy "Question edits are public"
  on public.kb_overrides for select to anon, authenticated
  using (true);

create or replace function public.admin_save_question(p_id text, p_kind text, p_data jsonb, p_reason text default null)
returns void
language plpgsql
security definer set search_path = ''
as $$
declare
  v_before jsonb;
begin
  perform public.require_admin(array['super_admin', 'app_admin']);
  if p_kind = 'add' and p_id !~ '^c' or p_kind <> 'add' and p_id !~ '^q' then
    raise exception 'Custom question ids start with c, built-in ones with q.';
  end if;
  if p_kind in ('edit', 'add') and (
    coalesce(p_data ->> 'question', '') = '' or coalesce(p_data ->> 'answer', '') = '' or coalesce(p_data ->> 'short', '') = ''
  ) then
    raise exception 'A question needs the question, the full answer and the short correct option.';
  end if;
  if p_kind = 'add' and jsonb_array_length(coalesce(p_data -> 'wrong', '[]')) <> 3 then
    raise exception 'A new question needs exactly 3 wrong options.';
  end if;

  select to_jsonb(o) into v_before from public.kb_overrides o where id = p_id;
  insert into public.kb_overrides (id, kind, data, updated_at, updated_by)
  values (p_id, p_kind, p_data, now(), auth.uid())
  on conflict (id) do update set kind = excluded.kind, data = excluded.data, updated_at = now(), updated_by = auth.uid();
  perform public.write_audit(auth.uid(), 'question.' || p_kind, p_id, v_before, jsonb_build_object('kind', p_kind, 'data', p_data), p_reason);
end;
$$;

create or replace function public.admin_reset_question(p_id text, p_reason text default null)
returns void
language plpgsql
security definer set search_path = ''
as $$
declare
  v_before jsonb;
begin
  perform public.require_admin(array['super_admin', 'app_admin']);
  delete from public.kb_overrides o where id = p_id returning to_jsonb(o) into v_before;
  perform public.write_audit(auth.uid(), 'question.reset', p_id, v_before, null, p_reason);
end;
$$;

-- =====================================================================================
-- 10. Connections between members. The founder's connection with everyone can't be removed.
create table if not exists public.connections (
  user_a uuid not null references auth.users (id) on delete cascade,
  user_b uuid not null references auth.users (id) on delete cascade,
  status text not null check (status in ('pending', 'accepted')),
  requested_by uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  accepted_at timestamptz,
  primary key (user_a, user_b),
  check (user_a < user_b)
);

create index if not exists connections_user_b on public.connections (user_b);

alter table public.connections enable row level security;

drop policy if exists "Members see their own connections" on public.connections;
create policy "Members see their own connections"
  on public.connections for select to authenticated
  using (auth.uid() in (user_a, user_b) or public.admin_role() is not null);
-- Changes go through connect_* functions only.

create or replace function public.protect_founder_connection()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_founder uuid := (select user_id from public.admins where role = 'super_admin');
begin
  -- Allowed only when one of the two accounts is being deleted.
  if v_founder in (old.user_a, old.user_b)
     and exists (select 1 from auth.users where id = old.user_a)
     and exists (select 1 from auth.users where id = old.user_b) then
    raise exception 'The connection with the CXentric founder can''t be removed.';
  end if;
  return old;
end;
$$;

drop trigger if exists protect_founder_connection on public.connections;
create trigger protect_founder_connection
  before delete on public.connections
  for each row execute function public.protect_founder_connection();

-- Send a request; if the other person already asked you, this accepts it.
create or replace function public.connect_request(p_other uuid)
returns text
language plpgsql
security definer set search_path = ''
as $$
declare
  v_me uuid := auth.uid();
  v_row public.connections;
begin
  if v_me is null or p_other is null or p_other = v_me then raise exception 'Invalid request.'; end if;
  if not exists (select 1 from public.member_profiles where id = p_other) then raise exception 'Member not found.'; end if;

  select * into v_row from public.connections where user_a = least(v_me, p_other) and user_b = greatest(v_me, p_other);
  if found then
    if v_row.status = 'pending' and v_row.requested_by = p_other then
      update public.connections set status = 'accepted', accepted_at = now() where user_a = v_row.user_a and user_b = v_row.user_b;
      return 'accepted';
    end if;
    return v_row.status;
  end if;

  insert into public.connections (user_a, user_b, status, requested_by)
  values (least(v_me, p_other), greatest(v_me, p_other), 'pending', v_me);
  return 'pending';
end;
$$;

create or replace function public.connect_respond(p_other uuid, p_accept boolean)
returns void
language plpgsql
security definer set search_path = ''
as $$
declare
  v_me uuid := auth.uid();
begin
  if p_accept then
    update public.connections set status = 'accepted', accepted_at = now()
    where user_a = least(v_me, p_other) and user_b = greatest(v_me, p_other) and status = 'pending' and requested_by = p_other;
  else
    delete from public.connections
    where user_a = least(v_me, p_other) and user_b = greatest(v_me, p_other) and status = 'pending';
  end if;
end;
$$;

-- Remove a connection or withdraw a request (refused for the founder by the trigger above).
create or replace function public.connect_remove(p_other uuid)
returns void
language sql
security definer set search_path = ''
as $$
  delete from public.connections where user_a = least(auth.uid(), p_other) and user_b = greatest(auth.uid(), p_other);
$$;

-- The signed-in member's network: connections, requests received and requests sent.
create or replace function public.my_network()
returns jsonb
language sql stable
security definer set search_path = ''
as $$
  with mine as (
    select case when c.user_a = auth.uid() then c.user_b else c.user_a end as other, c.status, c.requested_by, c.created_at, c.accepted_at
    from public.connections c
    where auth.uid() in (c.user_a, c.user_b)
  ), founder as (
    select user_id from public.admins where role = 'super_admin'
  ), cards as (
    select m.status, m.requested_by, coalesce(m.accepted_at, m.created_at) as since,
           jsonb_build_object('id', p.id, 'name', p.display_name, 'headline', p.headline, 'avatar', p.avatar_url,
                              'isFounder', p.id = (select user_id from founder), 'since', coalesce(m.accepted_at, m.created_at)) as card
    from mine m join public.member_profiles p on p.id = m.other
  )
  select jsonb_build_object(
    'connections', coalesce((select jsonb_agg(card order by (card ->> 'isFounder')::boolean desc, since desc) from cards where status = 'accepted'), '[]'),
    'incoming', coalesce((select jsonb_agg(card order by since desc) from cards where status = 'pending' and requested_by <> auth.uid()), '[]'),
    'outgoing', coalesce((select jsonb_agg(card order by since desc) from cards where status = 'pending' and requested_by = auth.uid()), '[]')
  );
$$;

create or replace function public.search_members(p_query text)
returns jsonb
language sql stable
security definer set search_path = ''
as $$
  select coalesce(jsonb_agg(jsonb_build_object(
           'id', p.id, 'name', p.display_name, 'headline', p.headline, 'avatar', p.avatar_url,
           'status', (select c.status from public.connections c where c.user_a = least(auth.uid(), p.id) and c.user_b = greatest(auth.uid(), p.id))
         )), '[]')
  from (
    select * from public.member_profiles
    where id <> auth.uid() and auth.uid() is not null and length(trim(p_query)) >= 2
      and (display_name ilike '%' || trim(p_query) || '%' or headline ilike '%' || trim(p_query) || '%')
    order by display_name
    limit 20
  ) p;
$$;

revoke all on function public.connect_request(uuid), public.connect_respond(uuid, boolean), public.connect_remove(uuid),
  public.my_network(), public.search_members(text) from public, anon;

-- =====================================================================================
-- 11. Admin console data. Members (read-only) get emails masked.
create or replace function public.mask_email(p_email text)
returns text
language sql immutable
as $$
  select case when p_email is null then null
              else left(split_part(p_email, '@', 1), 1) || '•••@' || split_part(p_email, '@', 2) end;
$$;

create or replace function public.admin_stats()
returns jsonb
language plpgsql stable
security definer set search_path = ''
as $$
begin
  perform public.require_admin(array['super_admin', 'app_admin', 'user_admin', 'member']);
  return jsonb_build_object(
    'users', (select count(*) from auth.users),
    'signups7d', (select count(*) from auth.users where created_at > now() - interval '7 days'),
    'active7d', (select count(*) from auth.users where last_sign_in_at > now() - interval '7 days'),
    'pro', (select count(*) from public.profiles where pro_until > now()),
    'autopay', (select count(*) from public.subscriptions where status in ('authenticated', 'active', 'pending')),
    'revenue30dPaise', (select coalesce(sum(amount_paise), 0) from public.payments where created_at > now() - interval '30 days'),
    'revenueTotalPaise', (select coalesce(sum(amount_paise), 0) from public.payments),
    'connections', (select count(*) from public.connections where status = 'accepted')
  );
end;
$$;

create or replace function public.admin_list_users(p_search text default '', p_limit integer default 50, p_offset integer default 0)
returns jsonb
language plpgsql stable
security definer set search_path = ''
as $$
declare
  v_mask boolean := public.require_admin(array['super_admin', 'app_admin', 'user_admin', 'member']) = 'member';
  v_search text := trim(coalesce(p_search, ''));
begin
  return (
    select jsonb_build_object(
      'total', (select count(*) from auth.users u left join public.member_profiles m on m.id = u.id
                where v_search = '' or u.email ilike '%' || v_search || '%' or m.display_name ilike '%' || v_search || '%'),
      'users', coalesce(jsonb_agg(r order by (r ->> 'createdAt') desc), '[]')
    )
    from (
      select jsonb_build_object(
        'id', u.id,
        'email', case when v_mask then public.mask_email(u.email) else u.email end,
        'name', m.display_name,
        'createdAt', u.created_at,
        'lastSignInAt', u.last_sign_in_at,
        'proUntil', p.pro_until,
        'autopay', (select s.status from public.subscriptions s where s.user_id = u.id order by s.created_at desc limit 1),
        'blocked', u.banned_until is not null and u.banned_until > now(),
        'adminRole', a.role
      ) as r
      from auth.users u
      left join public.profiles p on p.id = u.id
      left join public.member_profiles m on m.id = u.id
      left join public.admins a on a.user_id = u.id
      where v_search = '' or u.email ilike '%' || v_search || '%' or m.display_name ilike '%' || v_search || '%'
      order by u.created_at desc
      limit least(greatest(p_limit, 1), 200) offset greatest(p_offset, 0)
    ) rows
  );
end;
$$;

create or replace function public.admin_user_detail(p_user_id uuid)
returns jsonb
language plpgsql stable
security definer set search_path = ''
as $$
declare
  v_mask boolean := public.require_admin(array['super_admin', 'app_admin', 'user_admin', 'member']) = 'member';
  v_progress jsonb := (select data from public.progress where user_id = p_user_id);
begin
  return (
    select jsonb_build_object(
      'id', u.id,
      'email', case when v_mask then public.mask_email(u.email) else u.email end,
      'name', m.display_name,
      'headline', m.headline,
      'createdAt', u.created_at,
      'lastSignInAt', u.last_sign_in_at,
      'provider', u.raw_app_meta_data ->> 'provider',
      'blocked', u.banned_until is not null and u.banned_until > now(),
      'proUntil', p.pro_until,
      'adminRole', (select role from public.admins where user_id = u.id),
      'connections', (select count(*) from public.connections c where u.id in (c.user_a, c.user_b) and c.status = 'accepted'),
      'progress', case when v_progress is null then null else jsonb_build_object(
        'goal', v_progress -> 'goal', 'xp', v_progress -> 'xp', 'streak', v_progress -> 'streak',
        'answered', (select count(*) from jsonb_object_keys(coalesce(v_progress -> 'answers', '{}')))) end,
      'subscriptions', coalesce((select jsonb_agg(to_jsonb(s) - 'user_id' order by s.created_at desc) from public.subscriptions s where s.user_id = u.id), '[]'),
      'payments', coalesce((select jsonb_agg(to_jsonb(pm) - 'user_id' order by pm.created_at desc) from public.payments pm where pm.user_id = u.id), '[]')
    )
    from auth.users u
    left join public.profiles p on p.id = u.id
    left join public.member_profiles m on m.id = u.id
    where u.id = p_user_id
  );
end;
$$;

create or replace function public.admin_billing(p_limit integer default 100)
returns jsonb
language plpgsql stable
security definer set search_path = ''
as $$
declare
  v_mask boolean := public.require_admin(array['super_admin', 'app_admin', 'user_admin', 'member']) = 'member';
begin
  return jsonb_build_object(
    'subscriptions', coalesce((
      select jsonb_agg(to_jsonb(s) || jsonb_build_object('email', case when v_mask then public.mask_email(u.email) else u.email end) order by s.updated_at desc)
      from (select * from public.subscriptions order by updated_at desc limit p_limit) s join auth.users u on u.id = s.user_id), '[]'),
    'payments', coalesce((
      select jsonb_agg(to_jsonb(pm) || jsonb_build_object('email', case when v_mask then public.mask_email(u.email) else u.email end) order by pm.created_at desc)
      from (select * from public.payments order by created_at desc limit p_limit) pm join auth.users u on u.id = pm.user_id), '[]')
  );
end;
$$;

-- Set when a user's Pro ends: extend it (complimentary days) or end it now.
create or replace function public.admin_set_pro_until(p_user_id uuid, p_until timestamptz, p_reason text)
returns void
language plpgsql
security definer set search_path = ''
as $$
declare
  v_before timestamptz;
begin
  perform public.require_admin(array['super_admin', 'user_admin']);
  if coalesce(trim(p_reason), '') = '' then raise exception 'Please give a reason.'; end if;
  select pro_until into v_before from public.profiles where id = p_user_id;
  insert into public.profiles (id) values (p_user_id) on conflict (id) do nothing;
  update public.profiles set pro_until = p_until where id = p_user_id;
  perform public.write_audit(auth.uid(), 'user.pro_until', p_user_id::text,
    jsonb_build_object('pro_until', v_before), jsonb_build_object('pro_until', p_until), p_reason);
end;
$$;

-- Team management: super admin only. People must have signed in to CXentric once before being added.
create or replace function public.admin_set_role(p_email text, p_role text, p_reason text default null)
returns void
language plpgsql
security definer set search_path = ''
as $$
declare
  v_user uuid := (select id from auth.users where lower(email) = lower(trim(p_email)));
  v_before text;
begin
  perform public.require_admin(array['super_admin']);
  if v_user is null then raise exception 'No CXentric account uses %. Ask them to sign in once first.', p_email; end if;
  if p_role not in ('app_admin', 'user_admin', 'member') then raise exception 'Role must be app_admin, user_admin or member.'; end if;
  select role into v_before from public.admins where user_id = v_user;
  insert into public.admins (user_id, role, added_by) values (v_user, p_role, auth.uid())
  on conflict (user_id) do update set role = excluded.role;
  perform public.write_audit(auth.uid(), 'team.set_role', p_email, jsonb_build_object('role', v_before), jsonb_build_object('role', p_role), p_reason);
end;
$$;

create or replace function public.admin_remove(p_user_id uuid, p_reason text default null)
returns void
language plpgsql
security definer set search_path = ''
as $$
declare
  v_before jsonb;
begin
  perform public.require_admin(array['super_admin']);
  delete from public.admins a where user_id = p_user_id returning to_jsonb(a) into v_before;
  perform public.write_audit(auth.uid(), 'team.remove', p_user_id::text, v_before, null, p_reason);
end;
$$;

create or replace function public.admin_team()
returns jsonb
language plpgsql stable
security definer set search_path = ''
as $$
begin
  perform public.require_admin(array['super_admin', 'app_admin', 'user_admin', 'member']);
  return coalesce((
    select jsonb_agg(jsonb_build_object('userId', a.user_id, 'email', u.email, 'name', m.display_name, 'role', a.role, 'since', a.created_at)
                     order by array_position(array['super_admin', 'app_admin', 'user_admin', 'member'], a.role), a.created_at)
    from public.admins a join auth.users u on u.id = a.user_id left join public.member_profiles m on m.id = a.user_id), '[]');
end;
$$;

revoke all on function public.admin_stats(), public.admin_list_users(text, integer, integer), public.admin_user_detail(uuid),
  public.admin_billing(integer), public.admin_set_pro_until(uuid, timestamptz, text), public.admin_set_role(text, text, text),
  public.admin_remove(uuid, text), public.admin_team(), public.admin_set_setting(text, jsonb, text) from anon;

-- =====================================================================================
-- 12. One-time set-up: make the founder the super admin. Run in the SQL Editor after signing in
--     to CXentric once with that email:   select public.make_super_admin('founder@example.com');
--     Works only while there is no super admin, and connects the founder to every existing member.
create or replace function public.make_super_admin(p_email text)
returns text
language plpgsql
security definer set search_path = ''
as $$
declare
  v_user uuid := (select id from auth.users where lower(email) = lower(trim(p_email)));
begin
  if v_user is null then raise exception 'Sign in to CXentric once with % first.', p_email; end if;
  if exists (select 1 from public.admins where role = 'super_admin') then raise exception 'There is already a super admin.'; end if;

  insert into public.admins (user_id, role) values (v_user, 'super_admin')
  on conflict (user_id) do update set role = 'super_admin';

  insert into public.connections (user_a, user_b, status, requested_by, accepted_at)
  select least(v_user, u.id), greatest(v_user, u.id), 'accepted', v_user, now()
  from auth.users u where u.id <> v_user
  on conflict (user_a, user_b) do update set status = 'accepted', accepted_at = coalesce(public.connections.accepted_at, now());

  perform public.write_audit(v_user, 'team.super_admin', p_email, null, jsonb_build_object('role', 'super_admin'), 'Initial set-up');
  return 'Done: ' || p_email || ' is the super admin.';
end;
$$;

revoke all on function public.make_super_admin(text) from public, anon, authenticated, service_role;

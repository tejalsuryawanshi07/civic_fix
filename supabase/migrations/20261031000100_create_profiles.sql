-- CivicFix initial identity/profile schema.
-- Supabase Auth owns credentials; this table stores application-level profile data only.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  email text,
  role text not null default 'citizen'
    check (role in ('citizen', 'admin', 'department_staff')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_role_idx on public.profiles (role);

alter table public.profiles enable row level security;

-- A signed-in user may read only their own profile.
drop policy if exists "Users can read their own profile" on public.profiles;
create policy "Users can read their own profile"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

-- Intentionally no client INSERT/UPDATE/DELETE policies:
-- profile creation is handled by the trusted auth trigger, and role changes
-- must be performed by an administrator through a trusted server/SQL workflow.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.email
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

grant select on public.profiles to authenticated;

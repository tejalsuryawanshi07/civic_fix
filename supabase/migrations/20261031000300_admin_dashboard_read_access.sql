-- Phase 1: secure admin read access for the CivicFix dashboard.
-- Admin roles must be assigned manually by a trusted project owner in Supabase SQL.

create or replace function public.is_civicfix_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = 'admin'
  );
$$;

revoke all on function public.is_civicfix_admin() from public;
grant execute on function public.is_civicfix_admin() to authenticated;

drop policy if exists "Admins can read all reports" on public.reports;
create policy "Admins can read all reports"
  on public.reports
  for select
  to authenticated
  using ((select public.is_civicfix_admin()));

drop policy if exists "Admins can view report photos" on storage.objects;
create policy "Admins can view report photos"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'report-photos'
    and (select public.is_civicfix_admin())
  );

-- To grant admin access, run this manually for a trusted account:
-- update public.profiles
-- set role = 'admin', updated_at = now()
-- where email = 'YOUR_ADMIN_EMAIL';

-- Phase 2: secure report management, department assignment and citizen-visible history.

alter table public.reports
  add column if not exists assigned_department text,
  add column if not exists admin_remarks text;

create table if not exists public.report_status_history (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports(id) on delete cascade,
  changed_by uuid not null references auth.users(id),
  old_status text,
  new_status text not null check (new_status in ('submitted','in_review','resolved','rejected')),
  assigned_department text,
  admin_remarks text,
  created_at timestamptz not null default now()
);

create index if not exists report_history_report_created_idx
  on public.report_status_history(report_id, created_at desc);

alter table public.report_status_history enable row level security;

drop policy if exists "Admins read all report history" on public.report_status_history;
create policy "Admins read all report history"
  on public.report_status_history for select to authenticated
  using ((select public.is_civicfix_admin()));

drop policy if exists "Citizens read history for own reports" on public.report_status_history;
create policy "Citizens read history for own reports"
  on public.report_status_history for select to authenticated
  using (
    exists (
      select 1 from public.reports r
      where r.id = report_status_history.report_id
        and r.user_id = (select auth.uid())
    )
  );

grant select on public.report_status_history to authenticated;

-- All admin changes are made through this RPC so report updates and history
-- entries are committed together. Clients cannot write directly to history.
create or replace function public.admin_update_civicfix_report(
  p_report_id uuid,
  p_status text,
  p_department text,
  p_admin_remarks text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_old_status text;
  v_old_department text;
  v_old_remarks text;
begin
  if not public.is_civicfix_admin() then
    raise exception 'Administrator access required';
  end if;

  if p_status not in ('submitted','in_review','resolved','rejected') then
    raise exception 'Invalid report status';
  end if;

  select status, assigned_department, admin_remarks
    into v_old_status, v_old_department, v_old_remarks
  from public.reports
  where id = p_report_id
  for update;

  if not found then
    raise exception 'Report not found';
  end if;

  update public.reports
  set status = p_status,
      assigned_department = nullif(btrim(p_department), ''),
      admin_remarks = nullif(btrim(p_admin_remarks), ''),
      updated_at = now()
  where id = p_report_id;

  if v_old_status is distinct from p_status
     or v_old_department is distinct from nullif(btrim(p_department), '')
     or v_old_remarks is distinct from nullif(btrim(p_admin_remarks), '') then
    insert into public.report_status_history (
      report_id, changed_by, old_status, new_status,
      assigned_department, admin_remarks
    ) values (
      p_report_id, (select auth.uid()), v_old_status, p_status,
      nullif(btrim(p_department), ''), nullif(btrim(p_admin_remarks), '')
    );
  end if;
end;
$$;

revoke all on function public.admin_update_civicfix_report(uuid,text,text,text) from public;
grant execute on function public.admin_update_civicfix_report(uuid,text,text,text) to authenticated;

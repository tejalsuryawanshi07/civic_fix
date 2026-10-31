-- Citizen issue reports and private photo storage for CivicFix.
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 5 and 120),
  description text not null check (char_length(description) between 10 and 3000),
  category text not null check (category in ('roads','waste','lighting','water','parks','other')),
  location_text text not null check (char_length(location_text) between 3 and 300),
  photo_path text,
  status text not null default 'submitted'
    check (status in ('submitted','in_review','resolved','rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists reports_user_created_idx
  on public.reports(user_id, created_at desc);
create index if not exists reports_status_idx on public.reports(status);

alter table public.reports enable row level security;
drop policy if exists "Citizens can read their own reports" on public.reports;
create policy "Citizens can read their own reports"
  on public.reports for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Citizens can submit their own reports" on public.reports;
create policy "Citizens can submit their own reports"
  on public.reports for insert to authenticated
  with check (auth.uid() = user_id and status = 'submitted');

grant select, insert on public.reports to authenticated;

-- Private bucket: report photos are accessible only to the uploading citizen.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('report-photos', 'report-photos', false, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = false, file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg','image/png','image/webp'];

drop policy if exists "Citizens upload their own report photos" on storage.objects;
create policy "Citizens upload their own report photos"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'report-photos' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Citizens view their own report photos" on storage.objects;
create policy "Citizens view their own report photos"
  on storage.objects for select to authenticated
  using (bucket_id = 'report-photos' and (storage.foldername(name))[1] = auth.uid()::text);

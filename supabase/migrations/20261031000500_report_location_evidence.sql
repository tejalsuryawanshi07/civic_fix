-- Capture on-site GPS evidence with each citizen report.
alter table public.reports
  add column if not exists latitude double precision,
  add column if not exists longitude double precision,
  add column if not exists location_accuracy_m double precision,
  add column if not exists location_captured_at timestamptz;

alter table public.reports
  drop constraint if exists reports_gps_coordinates_valid;
alter table public.reports
  add constraint reports_gps_coordinates_valid check (
    (latitude is null and longitude is null)
    or (
      latitude between -90 and 90
      and longitude between -180 and 180
    )
  );

alter table public.reports
  drop constraint if exists reports_location_accuracy_valid;
alter table public.reports
  add constraint reports_location_accuracy_valid check (
    location_accuracy_m is null or location_accuracy_m between 0 and 100000
  );

-- Enforce evidence for new submissions at the database layer too.
-- NOT VALID preserves older reports while still checking every new insert/update.
alter table public.reports
  drop constraint if exists reports_new_submissions_require_evidence;
alter table public.reports
  add constraint reports_new_submissions_require_evidence check (
    latitude is not null
    and longitude is not null
    and location_accuracy_m is not null
    and location_captured_at is not null
    and photo_path is not null
  ) not valid;

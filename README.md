# CivicFix

AI-assisted civic issue reporting and resolution platform.

## Deployment-first approach

CivicFix is designed to be deployed as a public demo and shared through a website URL. The project does not require a local multi-service setup, Docker, Redis, Kubernetes, or a separately hosted AI server.

## Planned hosting

- **Frontend:** Vercel
- **Backend:** Render
- **Database and image storage:** Supabase
- **AI:** External hosted AI API, called securely by the backend

## Documentation

- [System architecture](docs/ARCHITECTURE.md)
- [Data flows](docs/DATA_FLOW.md)
- [Database design](docs/DATABASE_DESIGN.md)
- [API design](docs/API_DESIGN.md)
- [Deployment and dependencies](docs/DEPENDENCIES.md)
- [UI design system](docs/UI_DESIGN_SYSTEM.md)

## Authentication

CivicFix uses Supabase Auth for citizen email/password registration and sign-in. Supabase manages credentials; `public.profiles` stores application profile data and a server-controlled role. New public registrations always receive the `citizen` role. Never expose a Supabase secret/service-role key in frontend code.

## Project status

- Frontend landing page and Supabase client foundation committed.
- Citizen email/password authentication UI committed.
- Initial profiles migration prepared in `supabase/migrations/`.
- Complaint reporting, tracking, backend APIs, and admin workflows are still under development.

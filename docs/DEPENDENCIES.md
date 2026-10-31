# CivicFix — Deployment and Dependencies

## 1. Deployment targets

The goal is a public URL that can be opened by anyone you choose to share it with.

| Component | Recommended host | What it provides |
|---|---|---|
| Frontend | Vercel | Static React website and HTTPS |
| Backend | Render | Hosted Node.js/Express API |
| Database | Supabase | Managed PostgreSQL |
| Image storage | Supabase Storage | Hosted complaint photographs |
| AI | Hosted AI API | Model inference without managing GPU servers |

These providers are recommendations; account plans, free-tier limits, sleep behavior, and pricing can change. Check current plan limits before deployment.

## 2. Frontend dependencies

Start with only what the UI needs:
- react, react-dom
- react-router-dom
- vite, typescript
- tailwindcss (plus the Vite integration compatible with the selected version)
- lucide-react
- leaflet, react-leaflet (only for map screens)
- react-hook-form, zod, @hookform/resolvers
- recharts (only if charts are used)

Development/testing:
- eslint, prettier
- vitest, @testing-library/react, @testing-library/user-event
- playwright (optional end-to-end tests)

## 3. Backend dependencies

- express
- @supabase/supabase-js (database/storage client)
- zod (request and response validation)
- bcrypt (password hashing if backend-managed authentication is used)
- jsonwebtoken (only if backend-managed JWT auth is used)
- cors
- helmet
- express-rate-limit
- dotenv
- pino, pino-http
- multer (only if backend handles multipart image uploads)
- provider SDK or fetch/http client for the chosen AI API

Development/testing:
- typescript, tsx
- @types/node, @types/express, @types/cors
- eslint, prettier
- vitest, supertest

Authentication decision: CivicFix uses Supabase Auth with email/password for citizen accounts. The browser uses only the Supabase project URL and publishable key. Supabase manages passwords and sessions; the `public.profiles` table stores application profile data. Public registration always creates the `citizen` role. Admin and department-staff roles must be assigned only through a trusted administrative workflow. Do not add backend-managed JWT authentication in parallel.

## 4. Hosted AI

Do not install PyTorch, Transformers, LangGraph, or download large Qwen models for the first public demo. Use a hosted AI API that supports the required text/image inputs and has an accessible quota and acceptable pricing.

Keep the provider behind one backend adapter so it can be replaced. Store its API key only in Render environment variables. Confirm provider model capabilities, usage limits, privacy terms, and pricing before choosing.

If no AI key is configured, the application should still work: save complaints and show “AI analysis unavailable — manual review required.” Do not fabricate AI output.

## 5. Supabase setup

- Create one Supabase project.
- Create the relational tables defined in DATABASE_DESIGN.md.
- Create a private Storage bucket for complaint images.
- Configure row-level security if browser clients access Supabase directly.
- Prefer backend-mediated database/storage access for the initial simpler trust boundary.
- Store Supabase URL and service-role key only in backend secrets. Never expose the service-role key in Vite variables.

## 6. Supabase Auth and database migration

1. In the Supabase dashboard, open **Authentication → Providers → Email** and ensure email/password sign-in is enabled.
2. Configure the Site URL and allowed redirect URLs for your local Vite URL and deployed Vercel domain under **Authentication → URL Configuration**.
3. Open **SQL Editor** and run the migration in `supabase/migrations/20261031000100_create_profiles.sql`.
4. In the frontend hosting environment, set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` using the project's values. These are public browser settings; never add a secret/service-role key to a `VITE_*` variable.
5. Install frontend dependencies with `npm install` from `frontend/`.

The migration creates `public.profiles`, enables row-level security, allows authenticated users to read only their own profile, and creates a profile with the `citizen` role when a new Supabase Auth user is registered. It deliberately does not allow clients to insert profiles or update roles.

## 7. Environment variables

Example names (values must be configured in hosting dashboards, not committed):
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` (backend only)
- `AI_API_KEY`
- `AI_API_BASE_URL` (if required by provider)
- `AI_MODEL`
- `FRONTEND_ORIGIN`
- `PORT`
- `JWT_SECRET` (only if backend-managed JWT is selected)

Frontend may need a public `VITE_API_BASE_URL` pointing to the Render API. Never put private keys in any `VITE_*` variable.

## 8. Deployment steps

1. Create Supabase project and configure schema and private image bucket.
2. Push the repository to GitHub.
3. Create a Render Web Service from the backend directory; configure build/start commands and environment variables.
4. Deploy the frontend on Vercel from the frontend directory; set `VITE_API_BASE_URL` to the Render API URL.
5. Set backend CORS allowlist to the Vercel domain.
6. Add the AI provider key to Render only.
7. Run a public smoke test: register/login, submit complaint, upload image, view complaint, review as admin, assign, and update status.
8. Share the Vercel URL. Provide a safe demo account or demo data for reviewers; never publish an admin password in the repository.

## 9. Not needed for the first deployment

- Docker or Docker Compose.
- Redis, BullMQ, or Kafka.
- Separate Python/FastAPI service.
- Self-hosted model weights, CUDA, or GPU machine.
- Kubernetes.
- Separate vector database.
- Local multi-service setup.

Add these only if the deployed demo later demonstrates a concrete need.

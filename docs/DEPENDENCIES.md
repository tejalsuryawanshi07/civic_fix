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

Authentication decision: choose one clear approach during implementation. Supabase Auth is simplest to operate with Supabase; alternatively, implement backend-managed JWT auth. Do not implement both without a real requirement.

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

## 6. Environment variables

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

## 7. Deployment steps

1. Create Supabase project and configure schema and private image bucket.
2. Push the repository to GitHub.
3. Create a Render Web Service from the backend directory; configure build/start commands and environment variables.
4. Deploy the frontend on Vercel from the frontend directory; set `VITE_API_BASE_URL` to the Render API URL.
5. Set backend CORS allowlist to the Vercel domain.
6. Add the AI provider key to Render only.
7. Run a public smoke test: register/login, submit complaint, upload image, view complaint, review as admin, assign, and update status.
8. Share the Vercel URL. Provide a safe demo account or demo data for reviewers; never publish an admin password in the repository.

## 8. Not needed for the first deployment

- Docker or Docker Compose.
- Redis, BullMQ, or Kafka.
- Separate Python/FastAPI service.
- Self-hosted model weights, CUDA, or GPU machine.
- Kubernetes.
- Separate vector database.
- Local multi-service setup.

Add these only if the deployed demo later demonstrates a concrete need.

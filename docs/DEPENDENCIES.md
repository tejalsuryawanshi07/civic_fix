# CivicFix — Dependencies and Installation Plan

## 1. Runtime prerequisites

Recommended local development baseline:
- Node.js 20 LTS or newer supported LTS.
- npm (bundled with Node.js).
- Python 3.11 or 3.12; verify compatibility with selected PyTorch/Transformers releases.
- PostgreSQL 16+ with PostGIS and pgvector extensions available.
- Redis 7+.
- Docker Desktop or Docker Engine with Compose.
- Git.

Model inference requirements are separate from basic application development. Qwen vision/text models can require substantial RAM/VRAM. Confirm model cards, licenses, quantization options, hardware, and measured latency before selecting local production serving.

## 2. Frontend packages

Core runtime:
- react, react-dom
- react-router-dom
- tailwindcss, @tailwindcss/vite (or the compatible Tailwind integration selected during setup)
- leaflet, react-leaflet
- lucide-react (icons)
- zod (shared/client validation)
- react-hook-form, @hookform/resolvers
- recharts (dashboard charts, if needed)

Development:
- vite, typescript
- @types/react, @types/react-dom, @types/leaflet
- eslint, typescript-eslint, eslint-plugin-react-hooks
- prettier
- vitest, @testing-library/react, @testing-library/user-event, jsdom
- playwright (end-to-end tests)

Do not install every package before the frontend is scaffolded. Confirm compatibility with the chosen Vite and Tailwind versions at setup time.

## 3. Backend packages

Runtime:
- express
- pg (node-postgres)
- zod
- jsonwebtoken
- bcrypt
- helmet
- cors
- express-rate-limit
- multer (only if API-proxied uploads are selected; signed direct uploads may avoid this)
- bullmq
- ioredis
- pino, pino-http
- dotenv (or a validated environment loader)
- cloudinary (if Cloudinary is selected)

Development/testing:
- typescript, tsx
- @types/node, @types/express, @types/jsonwebtoken, @types/bcrypt, @types/cors, @types/multer
- eslint, prettier
- vitest
- supertest and @types/supertest

Database migrations:
- node-pg-migrate (recommended for SQL-first migrations and PostGIS/pgvector control).

Avoid adding a heavy ORM initially; SQL-first migrations and node-postgres give explicit control over spatial and vector SQL.

## 4. AI service packages

Core:
- fastapi
- uvicorn[standard]
- pydantic, pydantic-settings
- langgraph
- transformers
- torch (install the build appropriate for CPU/CUDA and target hardware)
- accelerate
- sentence-transformers
- pillow
- httpx
- python-multipart (only if FastAPI accepts multipart uploads)
- tenacity (bounded transient retries)
- structlog or standard structured logging

Optional:
- ultralytics — only if a specific suitable pothole/road-damage model is selected and evaluated.
- geopy — optional convenience wrapper; provider integration and usage policy still need explicit selection.
- pytest, pytest-asyncio, ruff, mypy — development quality tools.

Model identifiers from the specification:
- Qwen/Qwen3-VL-4B-Instruct
- Qwen/Qwen3-4B
- BAAI/bge-m3

Before installation/integration, inspect each model's current Hugging Face model card, license, supported Transformers version, inference requirements, and actual task performance. Model names in the specification are proposed choices, not proof of accuracy or production readiness.

## 5. Database and infrastructure

PostgreSQL extensions:
- postgis
- vector (pgvector)

Infrastructure:
- Redis 7+
- Docker and Docker Compose
- Cloudinary account/credentials if selected
- Optional geocoding provider credentials, only after provider selection.

Use a local PostgreSQL image/build that includes both PostGIS and pgvector, or install compatible extensions into the chosen PostgreSQL instance. Verify extension versions in the development environment.

## 6. Environment variables

Create a root `.env.example` with placeholders only; never commit real credentials.

Suggested configuration groups:
- App: NODE_ENV, FRONTEND_URL, API_PORT, API_BASE_URL.
- Database: DATABASE_URL.
- Auth: JWT_ACCESS_SECRET, JWT_ACCESS_TTL, refresh-token settings if implemented.
- Redis: REDIS_URL.
- AI service: AI_SERVICE_URL, AI_SERVICE_TOKEN, AI_REQUEST_TIMEOUT_MS.
- Object storage: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET.
- Geocoding: GEOCODING_PROVIDER, GEOCODING_API_KEY, GEOCODING_BASE_URL.
- AI models: VISION_MODEL_ID, TEXT_MODEL_ID, EMBEDDING_MODEL_ID, MODEL_CACHE_DIR, DEVICE.
- Logging: LOG_LEVEL.

Use separate environment files per service locally if needed, but keep secrets out of Git. Validate required variables at process startup.

## 7. Installation order

1. Install runtime prerequisites and Docker.
2. Scaffold frontend with Vite React TypeScript; add Tailwind and design tokens.
3. Scaffold Express TypeScript backend; add config, validation, logging, security middleware.
4. Start PostgreSQL + PostGIS + pgvector and Redis using Compose.
5. Add SQL migrations and verify extensions.
6. Add backend database connection and authentication dependencies.
7. Add BullMQ only when the first asynchronous processing job is introduced.
8. Scaffold FastAPI AI service and install model dependencies in a separate Python virtual environment.
9. Download/load large models only after hardware and license evaluation.
10. Add Cloudinary and geocoding credentials only after provider selection.

## 8. Dependency management rules

- Pin tested dependency versions in lockfiles (package-lock.json and Python constraints/lock file).
- Separate production and development dependencies.
- Do not install YOLO unless evaluation demonstrates a concrete benefit.
- Do not run model downloads during normal API startup if it harms cold-start reliability.
- Use CPU-only or CUDA-specific PyTorch installation based on target machine.
- Revisit package versions during implementation rather than assuming this document is a forever-current version matrix.

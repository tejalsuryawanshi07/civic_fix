# CivicFix — REST API Design

## 1. Conventions

- Public API prefix: `/api/v1`.
- Content type: JSON except upload endpoints.
- Authentication: `Authorization: Bearer <access-token>`.
- Use UUIDs internally and a separate public complaint reference for citizens.
- Standard error shape: `{ "error": { "code": "...", "message": "...", "details": [] } }`.
- Paginate collection endpoints with cursor or page/limit consistently; cap page size.
- Validate request bodies, query parameters, and path IDs.
- Return UTC ISO-8601 timestamps.
- Do not expose internal stack traces or raw AI prompts.

## 2. Authentication

| Method | Route | Access | Purpose |
|---|---|---|---|
| POST | /auth/register | Public | Create citizen account |
| POST | /auth/login | Public, rate-limited | Authenticate and issue token |
| POST | /auth/refresh | Refresh credential | Rotate access token (if refresh flow enabled) |
| POST | /auth/logout | Authenticated | Revoke refresh session (if implemented) |
| GET | /auth/me | Authenticated | Current profile and role |

Admin and department staff accounts should be provisioned or invited through controlled workflows; public registration must not allow a caller to select privileged roles.

## 3. Citizen and complaint endpoints

| Method | Route | Access | Purpose |
|---|---|---|---|
| POST | /uploads/authorize | Citizen | Obtain short-lived restricted upload authorization |
| POST | /complaints | Citizen | Create complaint and metadata |
| GET | /complaints/mine | Citizen | List own complaints |
| GET | /complaints/:id | Owner/admin/assigned staff | Complaint detail |
| GET | /complaints/:id/timeline | Owner/admin/assigned staff | Status history |
| GET | /complaints/:id/analysis | Owner/admin/assigned staff | AI findings and review state |
| GET | /complaints/nearby | Authenticated | Sanitized nearby reports |
| GET | /complaints/:id/duplicates | Owner/admin/assigned staff | Possible duplicate candidates |

Complaint creation should accept media object references already uploaded through the authorized flow. Validate that each object belongs to the authenticated user and has passed storage/file checks.

## 4. Administrator endpoints

| Method | Route | Access | Purpose |
|---|---|---|---|
| GET | /admin/complaints | Admin | Filter/search all complaints |
| GET | /admin/review-queue | Admin | Complaints awaiting human review |
| POST | /admin/complaints/:id/review | Admin | Approve/modify/reject AI recommendations |
| POST | /admin/complaints/:id/assignments | Admin | Create human-approved assignment |
| POST | /admin/complaints/:id/escalations | Admin | Record escalation action |
| GET | /admin/analytics/summary | Admin | Aggregate operational metrics |
| GET | /admin/analytics/map | Admin | Map-ready aggregate/report data |
| GET | /admin/departments | Admin | List verified department directory |
| POST/PATCH | /admin/departments | Admin | Maintain verified department records |

The review endpoint must distinguish approval, modification, and rejection. Rejection requires a reason. An AI recommendation must never create an assignment automatically.

## 5. Department staff endpoints

| Method | Route | Access | Purpose |
|---|---|---|---|
| GET | /department/complaints | Department staff | List department-assigned complaints |
| GET | /department/complaints/:id | Assigned staff | View authorized complaint details |
| PATCH | /department/complaints/:id/status | Assigned staff | Move through permitted statuses |
| POST | /department/complaints/:id/remarks | Assigned staff | Add progress note |
| POST | /department/complaints/:id/evidence | Assigned staff | Attach resolution evidence |
| POST | /department/complaints/:id/resolve | Assigned staff | Submit resolution evidence and request resolution |

Backend checks department membership and assignment on every request. Staff cannot assign a complaint to another department or modify AI recommendation records.

## 6. Notifications

| Method | Route | Access | Purpose |
|---|---|---|---|
| GET | /notifications | Authenticated | List current user's notifications |
| PATCH | /notifications/:id/read | Owner | Mark notification read |
| PATCH | /notifications/read-all | Authenticated | Mark own notifications read |

## 7. Internal service endpoints

Private network only; service-to-service authentication required.

| Method | Route | Caller | Purpose |
|---|---|---|---|
| POST | /internal/v1/ai/analyze | Node worker | Submit analysis request |
| GET | /internal/v1/health | Orchestrator/ops | AI service health |
| GET | /internal/v1/ready | Orchestrator/ops | Model/service readiness |

AI request includes complaint ID, analysis version, description, authorized image references, normalized coordinates if available, and a bounded list of candidate complaint summaries for duplicate comparison. Avoid sending unnecessary citizen profile data.

AI response includes workflow ID, schema version, per-agent status, category/severity recommendations, evidence/rationale, duplicate candidates, department recommendation or no-match, and timing/model metadata. It must not contain an instruction to auto-reject or auto-assign.

## 8. Complaint lifecycle API rules

Allowed transitions are enforced by backend domain logic, not frontend controls:
- REPORTED → AI_ANALYSIS
- AI_ANALYSIS → UNDER_REVIEW
- UNDER_REVIEW → ASSIGNED or REJECTED
- ASSIGNED → IN_PROGRESS
- IN_PROGRESS → RESOLVED
- RESOLVED → REOPENED
- REOPENED → UNDER_REVIEW or ASSIGNED, according to policy

System processing may mark analysis completion, but assignment and rejection are human-authorized. Every transition creates a status-history record.

## 9. Security requirements

- RBAC and resource ownership on all endpoints.
- Rate limit login, registration, upload authorization, and complaint creation.
- Validate upload size, content type, file signature, and storage ownership.
- Use idempotency keys for complaint creation and review/assignment commands where retries are possible.
- Do not trust client-supplied role, user ID, AI score, or department identity.
- Avoid returning exact citizen coordinates in public/nearby views.
- Apply CORS allowlists, Helmet/security headers, and request-size limits.

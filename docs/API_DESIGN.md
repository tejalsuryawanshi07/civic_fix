# CivicFix — REST API Design

## 1. Conventions

- Public API prefix: `/api/v1`.
- HTTPS and JSON; multipart only where an upload endpoint requires it.
- Authentication: Supabase Auth access token or backend JWT, depending on the single auth approach selected during implementation.
- Validate request bodies, query parameters, and path IDs.
- Return UTC ISO-8601 timestamps.
- Standard error shape: `{ "error": { "code": "...", "message": "...", "details": [] } }`.
- Paginate collection endpoints and cap page size.

## 2. Authentication

| Method | Route | Access | Purpose |
|---|---|---|---|
| POST | /auth/register | Public | Create citizen account |
| POST | /auth/login | Public, rate-limited | Authenticate |
| GET | /auth/me | Authenticated | Current profile and role |
| POST | /auth/logout | Authenticated | End session |

Choose Supabase Auth or backend-managed JWT during implementation, not both. Public registration must never allow a caller to choose an admin or department-staff role.

## 3. Citizen and complaint endpoints

| Method | Route | Access | Purpose |
|---|---|---|---|
| POST | /complaints | Citizen | Create complaint and metadata |
| GET | /complaints/mine | Citizen | List own complaints |
| GET | /complaints/:id | Owner/admin/assigned staff | Complaint detail |
| GET | /complaints/:id/timeline | Owner/admin/assigned staff | Status history |
| GET | /complaints/:id/analysis | Owner/admin/assigned staff | AI recommendations and analysis state |
| GET | /complaints/nearby | Authenticated | Sanitized nearby reports |
| GET | /complaints/:id/duplicates | Owner/admin/assigned staff | Possible duplicate candidates |

Image upload can be handled through a backend endpoint or a restricted signed Supabase Storage upload. Validate ownership and file metadata before associating images with a complaint.

## 4. Administrator endpoints

| Method | Route | Access | Purpose |
|---|---|---|---|
| GET | /admin/complaints | Admin | Filter/search all complaints |
| GET | /admin/review-queue | Admin | Complaints awaiting human review |
| POST | /admin/complaints/:id/review | Admin | Approve/modify/reject recommendations |
| POST | /admin/complaints/:id/assignments | Admin | Create human-approved assignment |
| POST | /admin/complaints/:id/escalations | Admin | Record escalation action |
| GET | /admin/analytics/summary | Admin | Aggregate operational metrics |
| GET | /admin/analytics/map | Admin | Map-ready aggregate/report data |
| GET | /admin/departments | Admin | List verified department directory |
| POST/PATCH | /admin/departments | Admin | Maintain verified department records |

Rejection requires a reason. AI recommendations never create assignments automatically.

## 5. Department staff endpoints

| Method | Route | Access | Purpose |
|---|---|---|---|
| GET | /department/complaints | Department staff | List department-assigned complaints |
| GET | /department/complaints/:id | Assigned staff | View authorized complaint details |
| PATCH | /department/complaints/:id/status | Assigned staff | Move through permitted statuses |
| POST | /department/complaints/:id/remarks | Assigned staff | Add progress note |
| POST | /department/complaints/:id/evidence | Assigned staff | Attach resolution evidence |
| POST | /department/complaints/:id/resolve | Assigned staff | Submit resolution evidence and request resolution |

Backend checks department membership and assignment on every request.

## 6. Notifications

| Method | Route | Access | Purpose |
|---|---|---|---|
| GET | /notifications | Authenticated | List current user's notifications |
| PATCH | /notifications/:id/read | Owner | Mark notification read |
| PATCH | /notifications/read-all | Authenticated | Mark own notifications read |

In-app notifications are sufficient for the first public demo. External email/SMS delivery can be added later.

## 7. AI integration

AI is an internal backend module, not a separately deployed service. The backend calls the configured hosted AI provider using a server-side API key.

The backend sends only the complaint text, relevant image, and minimum context needed. It validates the provider response and stores recommendations. If the provider is unavailable or not configured, the complaint is still created and marked as awaiting manual review.

## 8. Complaint lifecycle API rules

Allowed transitions are enforced by backend domain logic, not frontend controls:
- REPORTED → AI_ANALYSIS
- AI_ANALYSIS → UNDER_REVIEW
- UNDER_REVIEW → ASSIGNED or REJECTED
- ASSIGNED → IN_PROGRESS
- IN_PROGRESS → RESOLVED
- RESOLVED → REOPENED
- REOPENED → UNDER_REVIEW or ASSIGNED, according to policy

Assignment and rejection are human-authorized. Every transition creates a status-history record.

## 9. Security requirements

- RBAC and resource ownership on all endpoints.
- Rate limit login, registration, upload authorization, and complaint creation.
- Validate upload size, content type, file signature, and storage ownership.
- Do not trust client-supplied role, user ID, AI score, or department identity.
- Avoid returning exact citizen coordinates in public/nearby views.
- Apply CORS allowlists, Helmet/security headers, and request-size limits.
- Keep Supabase service-role and AI provider keys on the backend only.

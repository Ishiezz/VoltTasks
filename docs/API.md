# API Reference — Flux Task System

Base URL: `https://your-service.railway.app`

All responses follow this envelope:
```json
// Success
{ "success": true, "data": {}, "meta": {}, "timestamp": "" }

// Error
{ "success": false, "error": { "code": "", "message": "" }, "timestamp": "" }
```

---

## Authentication

### POST /api/auth/signup
Create a new account.

**Body:**
```json
{ "email": "user@example.com", "password": "password123", "fullName": "Isha Singh" }
```
**Response 201:**
```json
{ "success": true, "data": { "user": { "id": "uuid", "email": "user@example.com" } } }
```

---

### POST /api/auth/login
Sign in and get JWT tokens.

**Body:**
```json
{ "email": "user@example.com", "password": "password123" }
```
**Response 200:**
```json
{
  "success": true,
  "data": {
    "user": { "id": "uuid", "email": "user@example.com" },
    "access_token": "eyJ...",
    "refresh_token": "eyJ...",
    "expires_at": 1234567890
  }
}
```

---

### POST /api/auth/logout
Invalidate the current session. Requires `Authorization: Bearer <token>`.

**Response 200:** `{ "success": true, "data": { "message": "Logged out successfully" } }`

---

### GET /api/auth/me
Get current authenticated user. Requires `Authorization: Bearer <token>`.

**Response 200:**
```json
{ "success": true, "data": { "id": "uuid", "email": "user@example.com" } }
```

---

## Tasks

All task endpoints require `Authorization: Bearer <token>` unless noted.

---

### GET /api/tasks
List tasks with filtering, sorting, and pagination.

**Query Parameters:**

| Param | Type | Options | Default |
|---|---|---|---|
| `status` | string | `pending` / `completed` / `all` | `all` |
| `priority` | string | `low` / `medium` / `high` | — |
| `due` | string | `today` / `week` / `overdue` | — |
| `sort` | string | `created_at` / `due_date` / `priority` / `updated_at` | `created_at` |
| `order` | string | `asc` / `desc` | `desc` |
| `page` | number | — | `1` |
| `limit` | number | — | `20` |

**Response 200:**
```json
{
  "success": true,
  "data": [{ "id": "uuid", "title": "...", "priority": "high", "is_completed": false, ... }],
  "meta": { "page": 1, "limit": 20, "total": 42, "totalPages": 3 }
}
```

---

### POST /api/tasks
Create a new task.

**Body:**
```json
{
  "title": "Fix the login bug",
  "description": "Users can't log in on iOS",
  "priority": "high",
  "due_date": "2026-07-05T09:00:00Z"
}
```
**Response 201:** Returns the created task object.

---

### GET /api/tasks/:id
Get a single task by ID.

**Response 200:** Returns the task object.
**Response 404:** `{ "error": { "code": "TASK_NOT_FOUND", ... } }`

---

### PATCH /api/tasks/:id
Update task fields. All fields optional.

**Body:**
```json
{
  "title": "Updated title",
  "description": "Updated description",
  "priority": "medium",
  "due_date": "2026-07-10T00:00:00Z",
  "is_completed": true
}
```
**Response 200:** Returns updated task.

---

### DELETE /api/tasks/:id
Soft-delete a task (sets `deleted_at`).

**Response 200:** `{ "success": true, "data": { "message": "Task deleted" } }`

---

### POST /api/tasks/:id/toggle
Toggle the `is_completed` status of a task.

**Response 200:** Returns updated task with flipped `is_completed`.

---

## n8n Automation Endpoints

These endpoints use `x-api-key: <N8N_API_KEY>` header instead of JWT.

---

### POST /api/tasks/from-email
Create a task from a parsed email (called by n8n Workflow 1).

**Headers:** `x-api-key: <N8N_API_KEY>`

**Body:**
```json
{
  "title": "Fix authentication bug",
  "description": "Extracted from email body",
  "priority": "high",
  "due_date": "2026-07-05T09:00:00Z",
  "sender_email": "user@example.com"
}
```
**Response 201:** Returns created task with `source: "email"`.
**Response 404:** If sender email is not a registered user.

---

### GET /api/tasks/summary
Get aggregated task stats for automation (called by n8n Workflows 2 & 3).

**Headers:** `x-api-key: <N8N_API_KEY>`

**Query Parameters:**

| Param | Options | Description |
|---|---|---|
| `filter` | `due_today` / `all` | Focus of the summary |
| `period` | `last_week` / `today` / `month` | Time window |
| `user_email` | email string | Scope to one user (optional) |

**Response 200:**
```json
{
  "success": true,
  "data": [{
    "user_email": "user@example.com",
    "total_tasks": 42,
    "completed_tasks": 30,
    "pending_tasks": 12,
    "overdue_tasks": 3,
    "created_this_week": 8,
    "completed_this_week": 6,
    "due_today": 2,
    "completion_rate": 71,
    "due_today_tasks": [...],
    "overdue_task_list": [...]
  }]
}
```

---

## Health Check

### GET /api/health
Check API and database connectivity.

**Response 200:**
```json
{
  "status": "healthy",
  "service": "task-api",
  "version": "1.0.0",
  "timestamp": "2026-07-02T...",
  "checks": { "database": "ok" }
}
```

---

## Error Codes

| Code | HTTP | Description |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Request body/query failed Zod validation |
| `UNAUTHORIZED` | 401 | Missing or invalid JWT |
| `INVALID_API_KEY` | 401 | Missing or wrong n8n API key |
| `INVALID_CREDENTIALS` | 401 | Wrong email/password on login |
| `EMAIL_EXISTS` | 409 | Email already registered |
| `TASK_NOT_FOUND` | 404 | Task ID doesn't exist or doesn't belong to user |
| `USER_NOT_FOUND` | 404 | Email not found in Supabase Auth |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `AUTH_RATE_LIMIT` | 429 | Too many auth attempts |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

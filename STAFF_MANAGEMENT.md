# Staff Management & Sub-Admin System

This document describes the implementation of admin-created staff (secretary, subadmin, chairman) and the county-scoped sub-admin dashboard.

---

## Overview

Admins can create staff accounts (secretary, subadmin, chairman) from the Admin dashboard. Sub-admins are assigned to a specific Kenyan county and manage all users and data within that county. New staff receive temporary credentials via SMS (and optionally email) and must set their preferred password on first login.

---

## Architecture

### Roles

| Role       | Description                                                                 |
|------------|-----------------------------------------------------------------------------|
| **Secretary** | General admin support staff with system access                              |
| **Sub-Admin** | County representative; manages one assigned county (users, providers, etc.) |
| **Chairman**  | High-level administrative role                                              |

### Flow

1. **Admin creates staff** → Backend generates temporary password, creates user, sends credentials via SMS/email
2. **Staff logs in** with temp password → Redirected to `/set-password`
3. **Staff sets preferred password** → Redirected to role dashboard
4. **Sub-admin** accesses county-scoped dashboard at `/subadmin`

### One Sub-Admin Per County

- **Admin** may create **only one active sub-admin per county**.
- A new sub-admin for a county can be created **only if**:
  - No sub-admin exists for that county, or
  - The existing sub-admin for that county is **suspended or inactive**.
- To assign a new sub-admin, the admin must first suspend the current sub-admin for that county (via User Management).
- This keeps a single responsible sub-admin per county and avoids overlapping roles.

---

## Backend Implementation

### Database Migration

**File:** `smart-livestock-backend/migrations/20260219000000_add_staff_roles_and_fields.ts`

- Extends `users.role` to allow: `subadmin`, `secretary`, `chairman`
- Adds columns:
  - `assigned_county` – County assigned to sub-admin (NULL for secretary/chairman)
  - `password_reset_token` – For token-based password reset (optional)
  - `password_reset_expires_at` – Token expiry
  - `must_change_password` – Forces password change on first login
  - `created_by` – ID of admin who created the staff user

### API Endpoints

#### Admin Routes (`/api/admin`)

| Method | Endpoint      | Auth  | Description                          |
|--------|---------------|-------|--------------------------------------|
| GET    | `/staff`      | Admin | List all staff (secretary, subadmin, chairman) |
| POST   | `/staff`      | Admin | Create new staff user                |

**POST /admin/staff** request body:
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "phone": "0712345678",
  "role": "subadmin",
  "assigned_county": "NAIROBI"
}
```

- `name`, `email` – Required
- `phone` – Optional (SMS sent if provided)
- `role` – `secretary` | `subadmin` | `chairman`
- `assigned_county` – Required when `role` is `subadmin`

**One sub-admin per county:** Creation fails with `409` if the county already has an active (non-suspended) sub-admin.

#### Sub-Admin Routes (`/api/subadmin`)

| Method | Endpoint           | Auth     | Description                      |
|--------|--------------------|----------|----------------------------------|
| GET    | `/stats`           | Subadmin | County-scoped dashboard stats    |
| GET    | `/users`           | Subadmin | County-scoped user list          |
| PUT    | `/users/:id/suspend` | Subadmin | Suspend/unsuspend user in county |

**GET /subadmin/stats** response includes:
- `users` – total, farmers, vets, agrovets (active only)
- `verifiedVets` – count of verified veterinarians in the county
- `verifiedAgrovets` – count of verified agrovets in the county
- `providers` – total, pending verification
- `appointments`, `symptomReports`, `animals`

**GET /subadmin/users** query params: `page`, `limit`, `role`, `status`, `search`

#### Auth Routes (`/api/auth`)

| Method | Endpoint           | Auth   | Description                         |
|--------|--------------------|--------|-------------------------------------|
| PUT    | `/change-password` | Any    | Set new password (for first login)  |

**PUT /auth/change-password** request body:
```json
{
  "currentPassword": "temp_password",
  "newPassword": "new_secure_password"
}
```

---

## Frontend Implementation

### Routes

| Path              | Role   | Component              | Description                    |
|-------------------|--------|------------------------|--------------------------------|
| `/admin/staff`    | Admin  | AdminStaffManagement   | Create and list staff          |
| `/set-password`   | Any    | SetPassword            | Set preferred password         |
| `/subadmin`       | Subadmin | SubAdminDashboard    | County-scoped dashboard        |
| `/subadmin/users` | Subadmin | SubAdminUsers        | County user management         |

### Components

- **AdminStaffManagement** – Form to create staff (name, email, phone, role, county), list of existing staff
- **SetPassword** – Current password + new password form for first-time setup
- **SubAdminDashboard** – County stats: farmers, agrovets, verified vets, verified agrovets, total users, providers, pending verification, appointments, symptom reports, animals
- **SubAdminUsers** – County user list with search, role/status filters, suspend/unsuspend

### Sidebar Navigation

- **Admin:** Staff Management (UserPlus icon)
- **Subadmin:** Dashboard, County Users

---

## Notifications

### SMS (primary)

Uses existing `sendSMS` (Umesikia/Blessed Texts). Message includes:
- Greeting
- Role
- Set-password URL
- Temp password (only when no email is provided)

### Email (optional)

Uses `src/utils/email_service.ts`. Configure SMTP to enable.

---

## Environment Variables

| Variable        | Description                          | Required |
|-----------------|--------------------------------------|----------|
| `FRONTEND_URL`  | Base URL for set-password link       | No (default: `http://localhost:5173`) |
| `SMTP_HOST`     | SMTP server host                     | No (for email) |
| `SMTP_PORT`     | SMTP port (e.g. 587)                 | No |
| `SMTP_USER`     | SMTP username                        | No |
| `SMTP_PASS`     | SMTP password                        | No |
| `SMTP_FROM`     | From address for emails              | No |

SMS uses existing `UMESIKIA_*` or `BLESSED_*` variables.

---

## Security

- Only admins can create staff
- **One active sub-admin per county** – prevents duplicate county assignments
- Sub-admins limited to their `assigned_county`
- Temp password must be changed on first login
- Password must be at least 8 characters
- Staff creation is logged in `audit_logs`
- Sub-admins cannot suspend other staff (admin, subadmin, secretary, chairman)

---

## Running the Migration

```bash
cd smart-livestock-backend
npm run migrate
```

---

## Quick Start

1. Log in as admin
2. Go to **Staff Management** (sidebar)
3. Create sub-admin: select role "Sub-Admin (County)", choose county (each county may have only one active sub-admin)
4. If county already has an active sub-admin, suspend them in **User Management** first, then create the new one
5. Staff receives SMS/email with temp password and set-password link
6. Staff logs in → redirected to set-password → sets new password → lands on `/subadmin`
7. Sub-admin sees county stats (farmers, agrovets, verified vets, verified agrovets) and manages county users

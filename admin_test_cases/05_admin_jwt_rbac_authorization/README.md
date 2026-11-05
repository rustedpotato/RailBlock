# Test Case 05: Admin JWT Role-Based Access Control (RBAC) & Authorization

## 1. Metadata
* **Domain:** Authentication, Authorization & Access Governance
* **Admin Persona:** System Administrator / Chief Divisional Controller
* **Primary Scope:** JSON Web Token (HS256) lifecycle, claims verification, ADMIN privileged route execution, and non-admin RBAC privilege gating.

## 2. Test Objectives
1. Verify that an Admin can obtain a signed JWT session token via `/api/security/token` containing `role: "ADMIN"`.
2. Verify that the Admin token successfully authorizes access to protected endpoints requiring `require_admin` (e.g. `/api/security/seal-permit`).
3. Verify that non-admin tokens (e.g. `COMMUTER_VIEWER`, `SECTION_CONTROLLER` without admin rights) are rejected with HTTP 403 Forbidden on admin-only routes.
4. Verify rejection of expired or malformed tokens.


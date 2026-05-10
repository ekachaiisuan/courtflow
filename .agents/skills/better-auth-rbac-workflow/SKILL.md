---
name: better-auth-rbac-workflow
description: Implement or modify authentication, session checks, role-based access control, and protected account flows in this repository's Better Auth setup. Use when adding login/signup-related behavior, protecting routes or tRPC procedures, checking permissions, updating roles, wiring two-factor or account-management features, or extending auth-related API behavior with this project's Better Auth, Arcjet, and permission patterns.
---

# Better Auth RBAC Workflow

Follow this skill when work touches authentication, sessions, authorization, role management, account settings, or protected endpoints in this repository.

## Load References

Read `references/project-auth-patterns.md` before editing when the task involves:
- changing Better Auth configuration
- protecting a page, route handler, server action, or tRPC procedure
- adding or changing roles or permissions
- working on profile, session management, linked accounts, or two-factor flows
- changing `/api/auth` behavior or related rate limits

## Core Workflow

1. Treat Better Auth as the single session source.
   Read the current user from Better Auth on the server before accessing protected data.
2. Protect on the server first.
   Gate routes, procedures, and handlers with server-side checks before any UI-level visibility logic.
3. Use shared session helpers.
   Reuse `authSession()` and `authIsRequired()` instead of rewriting session access logic.
4. Keep RBAC in `lib/permissions.ts`.
   Add statements, roles, and role types there rather than scattering role strings through the app.
5. Check permissions explicitly.
   For management capabilities, use Better Auth permission APIs instead of relying on role name comparisons alone.
6. Keep client auth lightweight.
   Use `authClient` only for client-initiated auth flows such as two-factor actions or account linking, not for security enforcement.
7. Protect auth endpoints with the existing middleware shape.
   Extend `/api/auth/[...all]/route.ts` through the current Arcjet and Better Auth handler flow rather than bypassing it.

## Implementation Rules

- Do not trust client-only checks for auth or authorization.
- Do not duplicate permission logic in Client Components.
- Do not query sensitive data before the server-side auth gate runs.
- Keep Better Auth plugin wiring centralized in `lib/auth.ts`.
- Keep role literals aligned with the exported `ROLES` union.
- Return safe error messages and redirects for unauthorized access.
- Respect existing account flows: email verification, password reset, social login, two-factor, and session listing.

## Placement Heuristics

- Put Better Auth configuration, plugins, and hooks in `lib/auth.ts`.
- Put role and permission definitions in `lib/permissions.ts`.
- Put shared session and redirect helpers in `server/user.ts`.
- Put protected page entry checks in Server Component pages.
- Put per-feature permission checks as close as possible to the protected server operation.
- Put client auth interactions through `lib/auth-client.ts`.

## Route and Procedure Protection

- For protected pages, call `authIsRequired()` before loading private data.
- For admin or management pages, follow the page auth gate with an explicit permission check.
- For tRPC business logic, prefer `protectedProcedure` and then add ownership or permission checks inside the procedure when needed.
- For API routes under Better Auth, preserve the Arcjet decision step before calling the Better Auth handler.

## Role and Permission Conventions

- Add new access statements through `createAccessControl`.
- Define role capabilities with `ac.newRole(...)`.
- Export role constants and the role union from one place.
- Use permission checks for capabilities like listing users or managing resources.
- Use UI role information only for presentation, never as the sole security layer.

## Review Checklist

- Server-side session check exists before protected data access
- Permission or ownership check exists for sensitive actions
- No duplicated role strings outside the shared permission layer
- Better Auth remains the session source of truth
- Client code does not act as the only security gate
- Auth route changes still pass through Arcjet and Better Auth handlers

## Security Note

When the task is explicitly a security review or hardening pass, combine this skill with `security-best-practices`.

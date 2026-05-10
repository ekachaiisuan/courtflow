# Project Auth Patterns

Use these files as the primary references for auth and RBAC work in this repo.

## Better Auth Core

- `lib/auth.ts`
  Canonical source for Better Auth configuration:
  - Drizzle adapter
  - email/password auth
  - email verification
  - password reset mailers
  - GitHub social login
  - session cookie cache
  - welcome-email hook
  - `twoFactor()` plugin
  - Better Auth admin plugin with custom access control

When changing auth behavior, extend this file instead of creating parallel auth configuration elsewhere.

## RBAC Source of Truth

- `lib/permissions.ts`
  Defines:
  - access control statements
  - role capabilities
  - exported `ROLES`
  - `Role` type union

Keep new roles and permissions here. Do not hard-code role lists in feature code.

## Shared Server Session Helpers

- `server/user.ts`
  Canonical helpers for:
  - `authSession()`
  - `authIsNotRequired()`
  - `authIsRequired()`

Use these helpers for route-level session access and redirects instead of rewriting session lookup logic.

## Protected Page Pattern

- `app/admin/page.tsx`
  Canonical pattern for a protected management page:
  - require a signed-in user first
  - call a permission API on the server
  - redirect if the permission check fails
  - only then load and render protected data

- `app/profile/page.tsx`
  Canonical pattern for authenticated account pages that:
  - read the server session first
  - call Better Auth account and session APIs on the server
  - render account-management UI from those server-fetched results

## Client Auth Pattern

- `lib/auth-client.ts`
  Canonical client setup for Better Auth plugins.

Use this for client-driven auth actions such as:
- two-factor enable/disable/verify
- admin client helpers
- account actions that require browser-side interaction

Do not treat this file as the source of truth for access control.

## Auth Route Handler Pattern

- `app/api/auth/[...all]/route.ts`
  Canonical pattern for the Better Auth route:
  - wrap Better Auth with `toNextJsHandler`
  - keep Arcjet checks in front of POST requests
  - derive `userIdOrIp` from session or IP
  - apply stricter signup protections than general auth traffic

When changing auth endpoint behavior, preserve this sequence instead of bypassing Arcjet.

## Data Model Notes

- `db/schema/auth.ts`
  Shows the Better Auth-backed schema for:
  - users
  - sessions
  - accounts
  - verifications
  - two-factor records

Useful when auth feature work needs schema awareness, especially for session lifecycle and two-factor support.

## Interaction with tRPC

- `trpc/server/init.ts`
  Uses `authSession()` inside `protectedProcedure`.

When protecting tRPC logic:
- start with `protectedProcedure`
- add ownership or permission checks inside the procedure if the action is more specific than "signed in"

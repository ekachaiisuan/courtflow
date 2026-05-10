# Project Form Patterns

Use these files as the primary references for form and mutation work in this repo.

## Project Rule Source

- `AGENTS.md`
  The repo guidance explicitly says:
  - use Server Actions for auth and system-level form handling and mutation logic
  - validate with Zod before business logic
  - require auth and role or permission checks for important mutations
  - keep Trello app flows under `app/board/*` and `app/dashboard/*` on `React Hook Form + Zod + client mutation/authClient/tRPC`

Treat that split as the architectural target.

## Current Client Form Baseline

- `components/forms/login-form.tsx`
- `components/forms/signup-form.tsx`
- `components/forms/forgot-password-form.tsx`
- `app/profile/_components/change-password-form.tsx`
- `app/board/[boardId]/_components/list/list-form.tsx`
- `app/board/[boardId]/_components/list/card/card-form.tsx`

These files show the repo's current form style:
- React Hook Form
- Zod via `zodResolver`
- controlled fields through `Controller` or `FormField`
- explicit loading and success states
- toast-driven feedback

These files are not accidental legacy. They match the explicit Trello app rule in `AGENTS.md`, so keep that pattern unless the project direction changes.

## Reusable Form Building Blocks

- `components/ui/form.tsx`
  Shared React Hook Form wrappers such as `Form`, `FormField`, `FormItem`, `FormLabel`, and `FormMessage`.

- `components/forms/form-input.tsx`
  Shared input wrapper used by some feature forms.

- `components/forms/form-submit.tsx`
  Shared submit button wrapper.

- `components/forms/form-errors.tsx`
- `lib/form-utils.ts`
  Shared utilities for formatting and rendering field errors.

Use these to keep form presentation consistent instead of inventing a new pattern per feature.

## Auth and RBAC Helpers

- `server/user.ts`
  Canonical session and redirect helpers.

- `lib/permissions.ts`
- `lib/auth.ts`
  Canonical auth and permission sources for protected mutations.

If a Server Action changes important data, enforce auth and authorization here rather than in the client.

## Existing Mutation Baseline

- `trpc/server/routers/board.ts`
- `trpc/server/routers/list.ts`
- `trpc/server/routers/card.ts`

These files show the expected server mutation behavior for Trello app flows:
- validate input
- scope by user ownership
- write through Drizzle
- return narrow results
- avoid leaking internal errors

Use them as the mutation-behavior reference for board and dashboard forms.

## Practical Guidance

When building auth or system-level forms:

1. prefer a Server Action
2. validate with Zod on the server
3. enforce auth and permission checks in the action
4. return structured errors or success data to the UI

When building board or dashboard forms:

1. keep the existing React Hook Form plus Zod plus client mutation or authClient or tRPC structure
2. keep business logic in the existing server mutation path
3. preserve query invalidation, hydration, and board ownership checks
4. do not migrate to Server Actions solely for stylistic consistency

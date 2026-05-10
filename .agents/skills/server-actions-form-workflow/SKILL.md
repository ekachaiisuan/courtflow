---
name: server-actions-form-workflow
description: Implement form handling and mutation flows in this repository while respecting its split architecture: use Next.js Server Actions for auth and system-level forms, and keep the Trello app flows on React Hook Form plus Zod plus client mutation or authClient or tRPC where the project rules require it. Use when deciding whether a form should be a Server Action, wiring validation and auth checks, or following the repository's form conventions for auth, dashboard, and board features.
---

# Server Actions Form Workflow

Follow this skill when work touches form submission, mutation handling, or Server Action decisions in this repository.

## Load References

Read `references/project-form-patterns.md` before editing when the task involves:
- adding a new form
- migrating a client mutation form to a Server Action
- deciding between Server Actions and tRPC
- handling auth, role, or permission checks inside form mutations
- shaping validation and error-return patterns

## Important Context

`AGENTS.md` defines two different patterns:
- Auth and system-level mutation forms should use Server Actions.
- Trello app flows under `app/board/*` and `app/dashboard/*` should use `React Hook Form + Zod + client mutation/authClient/tRPC`.

Do not force one pattern onto the whole repo. Choose the flow that matches the feature area.

## Core Workflow

1. Classify the form by feature area first.
   Decide whether the form belongs to auth or system flows, or to the Trello app flows under board and dashboard.
2. Keep business validation on the server.
   Validate submitted input with Zod before any database or auth-sensitive logic runs.
3. Use the correct mutation mechanism for that area.
   Use Server Actions for auth and system-level forms. Keep board and dashboard mutations on the established client mutation or authClient or tRPC path unless the project rules change.
4. Enforce auth and RBAC on the server.
   Use Better Auth session helpers and permission checks in the server mutation path before mutating important data.
5. Keep UI forms consistent with the repo.
   Reuse React Hook Form, `Form`, `FormField`, `FormInput`, `FormSubmit`, and the repo's field or error styling when helpful.
6. Return structured mutation results.
   Return data that the UI can use for success messages, field errors, redirects, or refreshes without exposing internal details.
7. Keep database access server-only.
   Perform writes through Drizzle in the server mutation path or in a server-side helper it calls.
8. Keep tRPC as the business logic layer where the repo already expects it.
   For board and dashboard workflows, do not bypass the existing typed mutation patterns casually.

## Decision Guide

- Prefer Server Actions when:
  - the form belongs to auth or system-level flows
  - the mutation changes important user or account state
  - the project rule for that area explicitly says to use Server Actions

- Prefer client mutation or `authClient` or tRPC when:
  - the form lives under `app/board/*` or `app/dashboard/*`
  - the workflow already follows the board domain's client mutation pattern
  - the feature depends on existing TanStack Query invalidation and hydration flows
  - the mutation already belongs to an established tRPC domain router

- If uncertain:
  - follow the feature area's existing rule from `AGENTS.md`
  - do not introduce a new mutation style into board or dashboard code without a strong reason

## Implementation Rules

- Put `"use server"` actions in server-only files or route-local server modules when the feature area calls for Server Actions.
- Validate with Zod in the authoritative server mutation layer even if the client also validates.
- Use `authSession()` or `authIsRequired()` for protected writes.
- Check permissions in the authoritative server mutation layer, not just in the UI.
- Use Drizzle or server helpers for writes; do not push database logic into client components.
- Return safe, user-facing errors instead of raw internal exceptions.
- Reuse existing form UI components and error formatting patterns where practical.
- Do not replace board or dashboard tRPC flows with Server Actions just for consistency if that conflicts with project rules.

## Form Conventions

- Keep `useForm` and `zodResolver` when client-side UX benefits from immediate validation.
- Reuse:
  - `components/ui/form.tsx`
  - `components/forms/form-input.tsx`
  - `components/forms/form-submit.tsx`
  - `lib/form-utils.ts`
- Keep loading, success, and field-error behavior consistent with existing auth and board forms.
- Prefer one clear source for field names so client and server validation stay aligned.

## Feature Area Rules

- Auth and system-level forms:
  - prefer Server Actions
  - validate with Zod before business logic
  - require auth and role or permission checks for important mutations

- Trello app forms under `app/board/*` and `app/dashboard/*`:
  - keep `React Hook Form + Zod + client mutation/authClient/tRPC`
  - preserve typed cache-aware client flows
  - keep business logic in the server mutation path behind those client calls

## Auth and Permission Requirements

- For important data changes, require a server-side session check.
- For role-sensitive mutations, require a permission or role check inside the action.
- Do not rely on hidden buttons, disabled UI, or client redirects as the only guard.
- If the mutation affects board-owned data, keep the board ownership check in the server mutation path.

## Review Checklist

- chosen form pattern matches the feature area rules
- authoritative server mutation path uses server-side validation
- mutation checks auth when protected
- mutation checks role or permission when needed
- database writes stay on the server
- form UI follows existing repo patterns
- returned errors are safe and useful to the UI
- board and dashboard flows do not drift away from the repo's established tRPC or client mutation pattern

## Security Note

When actions touch protected data, combine this skill with `better-auth-rbac-workflow`, `drizzle-neon-workflow`, and `security-best-practices` as needed.

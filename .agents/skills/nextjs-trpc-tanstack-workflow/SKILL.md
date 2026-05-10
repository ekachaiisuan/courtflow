---
name: nextjs-trpc-tanstack-workflow
description: Add or modify data-fetching and mutation flows in this repository's Next.js 16 App Router stack with tRPC v11, TanStack Query, Drizzle, and Better Auth. Use when implementing a new procedure, wiring Server Component prefetch and hydration, adding a client mutation with cache invalidation, or following this project's auth and RBAC patterns.
---

# Next.js tRPC TanStack Workflow

Follow this skill when work touches the repo's typed data flow between App Router pages, tRPC procedures, and TanStack Query hooks.

## Load References

Read `references/project-patterns.md` before editing when the task involves:
- adding a new router or procedure
- changing page prefetch or hydration
- adding or fixing query invalidation
- deciding whether logic belongs in a Server Component, Client Component, or tRPC procedure

## Core Workflow

1. Identify the feature boundary.
   Decide which router owns the business logic and which page or client component consumes it.
2. Put business logic in tRPC.
   Add or update procedures in `trpc/server/routers/*` instead of pushing data logic into components.
3. Default to protected access.
   Use `protectedProcedure` for board, list, card, profile, admin, and other user data unless the route is intentionally public.
4. Validate inputs with Zod.
   Keep schemas close to the procedure and reject invalid inputs before database work.
5. Query through Drizzle only.
   Scope reads and writes to `ctx.user.id` or the required role boundary when data is user-owned.
6. Prefetch in Server Components when the page renders initial data.
   Use `getQueryClient()`, `trpc.<path>.queryOptions(...)`, `prefetchQuery`, `dehydrate`, and `HydrationBoundary`.
7. Consume data in Client Components with typed hooks.
   Use `useTRPC()` plus `useSuspenseQuery`, `useQuery`, or `useMutation` from TanStack Query.
8. Invalidate narrowly after mutations.
   Invalidate the exact query keys affected by the mutation, not the whole cache.
9. Keep auth and RBAC on the server.
   Do not rely on client-only checks for protected data or mutations.

## Implementation Rules

- Keep Server Components as the default. Add `"use client"` only for interactive UI.
- Do not query the database from Client Components.
- Do not duplicate auth checks in many places. Reuse server helpers and `protectedProcedure`.
- Throw safe `TRPCError` messages instead of exposing internals.
- Return small, purposeful payloads from mutations, such as IDs needed for navigation or targeted refreshes.
- Prefer `Promise.all` only when operations are truly independent.

## Query and Mutation Conventions

- For page-level reads, follow the `pages` router pattern when the result represents a route's assembled view model.
- For feature mutations, call `trpc.<router>.<procedure>.mutationOptions(...)`.
- On success, update UX first, then invalidate the affected query keys.
- Prefer `queryClient.invalidateQueries({ queryKey: ... })` using keys produced by `trpc.<path>.queryKey(...)`.
- When navigation depends on mutation output, return the identifier from the procedure and route with `next/navigation`.

## Placement Heuristics

- Put joins, ownership filters, and multi-table writes in tRPC procedures.
- Put prefetch and hydration in the route's Server Component page.
- Put form state, optimistic-feeling UX, toasts, and mutation triggers in Client Components.
- Put reusable access rules in shared server-side auth or permission helpers.

## Review Checklist

- Procedure input validated with Zod
- Procedure protected when data is not public
- Database access scoped correctly
- Server page prefetch matches the client query key
- Mutation invalidates the minimal affected queries
- No auth, permission, or database logic leaked to the client

## Security Note

When the task is explicitly security-focused, combine this skill with `security-best-practices`.

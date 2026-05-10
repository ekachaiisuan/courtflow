# Project Patterns

Use these files as the primary examples for this repo's data-flow conventions.

## Server tRPC Foundation

- `trpc/server/init.ts`
  Defines `createTRPCRouter`, `protectedProcedure`, the shared database context, and the Better Auth-backed session gate.
- `trpc/server/index.ts`
  Exposes the server-side `trpc` proxy and cached `getQueryClient()` for Server Components.
- `trpc/client/index.tsx`
  Defines `TRPCProvider`, `useTRPC()`, the shared QueryClient setup, and the `/api/trpc` HTTP link.
- `trpc/client/query-client.ts`
  Configures SuperJSON hydration and the repo's default query stale time.

## Route Assembly Pattern

- `app/board/[boardId]/page.tsx`
  Canonical pattern for:
  - server auth gate with `authIsRequired()`
  - `prefetchQuery(trpc.pages.boardIdPage.queryOptions(...))`
  - `HydrationBoundary` with `dehydrate(queryClient)`
  - delegating rendering to a client-facing content component

Use the same pattern for new pages that need initial server-fetched data and client interactivity.

## Page Data Router Pattern

- `trpc/server/routers/pages.ts`
  Canonical pattern for page-shaped queries that gather the exact view model a route needs.

Use the `pages` router when:
- the query exists mainly to back a route
- the result combines multiple tables
- the client should consume one pre-composed payload instead of orchestrating many separate queries

## Feature Mutation Pattern

- `trpc/server/routers/board.ts`
  Shows protected mutations with Zod input, Drizzle writes, user scoping, returned IDs, and safe `TRPCError` handling.

Mirror this for list, card, or future domain routers:
- validate input at the procedure boundary
- scope writes to the signed-in user when ownership matters
- return only data the UI needs next

## Client Query Pattern

- `app/board/[boardId]/_components/board-id-page-contents.tsx`
- `app/dashboard/_components/board-page-contents.tsx`

Use:
- `const trpc = useTRPC()`
- `useSuspenseQuery(trpc.pages.<query>.queryOptions(...))`

This keeps query keys and input types aligned with the router automatically.

## Client Mutation Pattern

- `app/board/[boardId]/_components/list/list-form.tsx`
- `app/board/[boardId]/_components/list/list-header.tsx`
- `app/board/[boardId]/_components/list/list-options.tsx`
- `app/board/[boardId]/_components/board-name-form.tsx`
- `app/dashboard/_components/board-create-form.tsx`

Common structure:

1. Read route params or props needed for mutation input.
2. Create `queryClient` with `useQueryClient()`.
3. Create `trpc` with `useTRPC()`.
4. Call `useMutation(trpc.<router>.<procedure>.mutationOptions({...}))`.
5. In `onSuccess`, reset local UI state, navigate, or toast as needed.
6. Invalidate only the exact route or list keys affected.

## Repo Guardrails

Read `AGENTS.md` alongside this reference when changing behavior:
- use App Router only
- default to Server Components
- keep auth and RBAC on the server
- use Drizzle instead of raw SQL
- use shared permission logic rather than UI-only checks

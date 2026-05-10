# Project DB Patterns

Use these files as the primary references for database work in this repo.

## Connection and Environment

- `db/drizzle.ts`
  Canonical Drizzle client setup for this repo:
  - uses `drizzle-orm/neon-http`
  - creates a Neon client with `@neondatabase/serverless`
  - loads `DATABASE_URL`
  - passes the full schema object into Drizzle

Do not create separate database clients in feature code.

## Drizzle Kit Configuration

- `drizzle.config.ts`
  Canonical migration configuration:
  - schema entrypoint is `db/schema/index.ts`
  - generated SQL goes to `migrations/`
  - dialect is PostgreSQL

Use this file as the source of truth for schema generation and migration expectations.

## Schema Barrel Pattern

- `db/schema/index.ts`
  Re-exports schema modules for the shared Drizzle client.

Keep this updated whenever new schema files are introduced.

## Auth Schema Pattern

- `db/schema/auth.ts`
  Shows the Better Auth-related Drizzle style used in this repo:
  - `pgTable(...)`
  - indexes
  - foreign keys
  - `relations(...)`
  - timestamp update hooks

Useful as the baseline style for new tables.

## App Domain Schema Pattern

- `db/schema/schedule.ts`
  Canonical app-domain schema pattern for:
  - text primary keys
  - enums with `pgEnum`
  - parent-child relations
  - inferred types
  - ordered entities like boards, lists, and cards

Follow this file when adding domain tables, relation graphs, and typed row exports.

## Query Pattern

- `trpc/server/routers/pages.ts`
  Canonical read pattern:
  - fetch through `ctx.db.query.<table>`
  - filter with `eq(...)`
  - load nested relations with `with`
  - keep ordering in the query definition

Use this style for page-level read models.

## Mutation Pattern

- `trpc/server/routers/board.ts`
- `trpc/server/routers/list.ts`
- `trpc/server/routers/card.ts`

Canonical write patterns in this repo:
- validate with Zod before touching the database
- verify ownership before mutating child records
- use Drizzle insert, update, and delete builders
- record side effects like board actions in the same workflow
- return focused payloads to the client

## Ownership and Scoping Pattern

Across board, list, and card routers, this repo consistently:
- filters parent resources by `ctx.user.id`
- checks the existence of the owned parent before child mutations
- uses `and(eq(...), eq(...))` to scope updates and deletes

Keep that pattern for all user-owned data.

## Migration Expectations

When schema changes are part of the task:
- update schema files first
- generate the migration with the repo's Drizzle command
- review affected queries and returned types

Do not edit generated migration SQL casually unless the change truly requires it.

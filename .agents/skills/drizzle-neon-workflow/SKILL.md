---
name: drizzle-neon-workflow
description: Implement or modify database schema, queries, relations, and mutations in this repository's Drizzle ORM plus Neon setup. Use when adding tables or enums, changing relations, updating Drizzle queries inside tRPC procedures, preparing migrations, or following this project's type-safe database patterns with Postgres and Neon.
---

# Drizzle Neon Workflow

Follow this skill when work touches the database layer, schema definitions, Drizzle queries, or migration-related changes in this repository.

## Load References

Read `references/project-db-patterns.md` before editing when the task involves:
- adding or changing tables, enums, or relations
- updating Drizzle queries in tRPC procedures
- preparing a schema change that needs a migration
- deciding where database logic belongs

## Core Workflow

1. Treat Drizzle as the only database access layer.
   Keep all reads and writes in Drizzle ORM instead of raw SQL unless there is a strong reason.
2. Start from schema design.
   Define or update tables, enums, references, and inferred types in `db/schema/*` first.
3. Re-export schema centrally.
   Keep `db/schema/index.ts` as the barrel file for database modules.
4. Query from the server only.
   Access the database in tRPC procedures, Server Components, or other server-only code, never in Client Components.
5. Scope user-owned data explicitly.
   Combine Drizzle filters with the signed-in user or permission boundary before reading or mutating records.
6. Prefer relation-aware queries.
   Use `ctx.db.query.<table>.findFirst/findMany` with `with`, `where`, and `orderBy` when the feature needs related records.
7. Keep mutations narrow and typed.
   Validate input with Zod, perform the minimal insert/update/delete, and return only what the UI needs next.
8. Update migrations after schema changes.
   Generate or apply migrations through the repo's Drizzle workflow when the schema changes.

## Implementation Rules

- Use `pgTable`, `pgEnum`, column builders, and `relations(...)` in schema files.
- Export inferred row types when they help feature code stay type-safe.
- Use `ctx.db.query.*` for read-heavy relation loading.
- Use `ctx.db.insert(...).values(...)`, `update(...).set(...)`, and `delete(...).where(...)` for writes.
- Use `and`, `eq`, `desc`, `asc`, and related Drizzle helpers instead of manual string conditions.
- Keep ownership checks close to the query or mutation.
- Do not bypass the shared `db` instance or create ad hoc clients in feature code.

## Placement Heuristics

- Put connection setup in `db/drizzle.ts`.
- Put Drizzle Kit configuration in `drizzle.config.ts`.
- Put app schema modules in `db/schema/*`.
- Put feature-specific database logic in server-side routers or helpers that already own the business workflow.
- Put schema-change coordination with auth tables in the appropriate schema module instead of mixing concerns in UI files.

## Query and Mutation Conventions

- For page-shaped reads, prefer one composed query flow that returns the exact view model the route needs.
- For nested data, define relations once in schema and reuse them through `with`.
- For ordered board/list/card data, keep ordering in the query layer with Drizzle `orderBy`.
- For multi-step writes, use `Promise.all` only when the operations are independent and the behavior stays clear.
- For user-owned resources, verify parent ownership before inserting child or related records.

## Schema Change Checklist

- table or enum updated in `db/schema/*`
- relation definitions updated if needed
- re-export added or kept correct in `db/schema/index.ts`
- feature queries updated to match the new shape
- migration generation planned or completed

## Review Checklist

- schema remains type-safe and centralized
- database access stays on the server
- queries use Drizzle helpers rather than raw SQL
- user ownership or permission scope is enforced
- returned payloads are no broader than needed
- migration implications are acknowledged when schema changes

## Security Note

When the task is explicitly security-focused, combine this skill with `security-best-practices` and `better-auth-rbac-workflow` when auth-scoped data is involved.

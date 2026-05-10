---
name: board-domain-workflow
description: Implement or modify the board domain in this repository's Trello-like collaboration workflow. Use when adding or changing board, list, card, reorder, copy, or board activity behavior, shaping board page payloads, or extending the domain model and business rules around boards, lists, cards, and board action logs.
---

# Board Domain Workflow

Follow this skill when work touches the core collaboration domain: boards, lists, cards, ordering, copying, deletion, and board activity logs.

## Load References

Read `references/board-domain-patterns.md` before editing when the task involves:
- adding a new board/list/card feature
- changing reorder behavior
- changing copy or delete behavior
- changing board activity logs
- shaping the board page data model

## Core Domain Model

This repo's board domain is built around:
- `boards`
- `list`
- `card`
- `board_actions`

Use that model consistently. Extend it carefully instead of inventing parallel structures.

## Core Workflow

1. Start from the domain boundary.
   Decide whether the change belongs to board, list, card, or board page assembly logic.
2. Enforce ownership first.
   Verify the signed-in user owns the parent board before mutating lists, cards, or board-level state.
3. Keep business logic in tRPC procedures.
   Put board workflows in the matching router instead of spreading them across UI components.
4. Preserve ordering semantics.
   Treat `order` as the source of truth for list and card position. Update it intentionally.
5. Keep board activity logs in sync.
   When a domain event is meaningful to users, add or maintain the corresponding `boardAction` write.
6. Return focused payloads.
   Return only the new or updated entities, IDs, or route data the client needs next.
7. Keep board pages precomposed.
   For board views, prefer page-shaped queries that assemble lists and cards together in the expected order.

## Implementation Rules

- Use `protectedProcedure` for all board domain procedures.
- Validate all inputs with Zod.
- Scope reads and writes through the owned board whenever possible.
- Use Drizzle relations and ordered queries for nested board data.
- When mutating lists or cards, confirm the parent entity exists under the owned board first.
- When reordering, update only the fields required for the new positions.
- Use UUID generation consistently for new entities and log records.

## Board Action Conventions

- Use `boardAction` to record significant board events.
- Keep `action`, `boardComponent`, `boardComponentId`, and `boardComponentName` aligned with the entity being changed.
- Write logs for create, update, delete, and other user-visible changes when they matter to activity history.
- Do not create a side logging model outside `board_actions` unless the domain truly changes.

## Ordering Conventions

- Lists are ordered by `list.order`.
- Cards are ordered by `card.order`.
- For create flows, append to the end unless the feature explicitly requires insertion elsewhere.
- For reorder flows, persist the final order values directly.
- Keep ordering logic in the server workflow so the client does not become the source of truth.

## Placement Heuristics

- Put schema-level board entities in `db/schema/schedule.ts`.
- Put board mutations in `trpc/server/routers/board.ts`.
- Put list mutations in `trpc/server/routers/list.ts`.
- Put card mutations in `trpc/server/routers/card.ts`.
- Put board page read models in `trpc/server/routers/pages.ts`.

## Review Checklist

- board ownership enforced before sensitive mutations
- list/card changes tied back to the correct board
- ordering updated intentionally and minimally
- board action logs stay consistent with domain events
- page queries return ordered nested data
- no domain logic leaked into client-only code

## Security Note

When changes affect auth boundaries or permission-sensitive collaboration behavior, combine this skill with `better-auth-rbac-workflow` and `security-best-practices`.

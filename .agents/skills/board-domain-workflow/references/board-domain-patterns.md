# Board Domain Patterns

Use these files as the primary references for board-domain work in this repo.

## Data Model

- `db/schema/schedule.ts`
  Canonical schema for:
  - boards
  - lists
  - cards
  - board action logs
  - ordering fields
  - board/list/card relations

Important domain rules already reflected here:
- boards belong to a user
- lists belong to a board
- cards belong to a list
- list and card ordering is persisted in the database
- board activity is captured through `board_actions`

## Board Procedure Pattern

- `trpc/server/routers/board.ts`
  Canonical pattern for board-level mutations:
  - create board
  - update board
  - delete board
  - enforce owner scoping with `ctx.user.id`
  - write `boardAction` entries for meaningful events

Use this router for board-level lifecycle changes rather than list/card-specific details.

## List Procedure Pattern

- `trpc/server/routers/list.ts`
  Canonical pattern for list workflows:
  - create list at the end of the board
  - update list name
  - delete list
  - reorder lists
  - copy a list and its related cards

Key domain behaviors here:
- verify the board exists and belongs to the current user
- derive the next list order from current board state
- keep list mutations board-scoped
- emit board activity log entries for creates, updates, deletes, and reorder-related changes

## Card Procedure Pattern

- `trpc/server/routers/card.ts`
  Canonical pattern for card workflows:
  - create card
  - update card
  - delete card
  - reorder cards across lists

Key domain behaviors here:
- resolve the parent board and target list before mutation
- derive default card ordering from the current list state
- persist both `listId` and `order` during reorder
- record card-related board actions

## Board Page Read Model

- `trpc/server/routers/pages.ts`
  Canonical page-shaped read model for board screens:
  - fetch boards scoped to the signed-in user
  - hydrate nested lists and cards
  - order lists and cards ascending by `order`
  - fetch board activity logs alongside board data

Use this style when the UI needs the whole board graph, not just one small entity.

## Domain Guardrails

Across the board domain, keep these rules:
- the board is the main ownership boundary
- lists and cards should not be mutated without confirming their parent board context
- the database is the source of truth for ordering
- board activity should stay understandable to end users
- page data should be assembled on the server, not stitched together ad hoc in the client

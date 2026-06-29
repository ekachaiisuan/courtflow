# Project DnD Patterns

Use these files as canonical references when adapting board drag-and-drop to grouped tables.

## Installed Packages

- `package.json` — `@atlaskit/pragmatic-drag-and-drop`, hitbox, auto-scroll, react-drop-indicator

## Shared Types

- `lib/drag-types.ts`
  - Existing board drag types (`CardDragData`, `ListDragData`, `DragSate`)
  - Extend with table row types instead of duplicating monitor logic elsewhere

## Board Reference Implementation

### Container monitor + optimistic reorder + tRPC

- `app/board/[boardId]/_components/list/list-container.tsx`
  - `monitorForElements` lifecycle (`onDragStart`, `onDrag`, `onDrop`)
  - `reorder()` helper
  - optimistic `orderedData` with snapshot rollback on mutation error
  - `calculatePlaceholderPosition` for card edge placement
  - `handleListReorder` / `handleCardReorder` persistence calls

### List column (draggable + drop target combined)

- `app/board/[boardId]/_components/list/draggable-list.tsx`
  - `combine(draggable(...), dropTargetForElements(...))`
  - `getInitialData` / `getData` payload shape

### Card row (split draggable + slot)

- `app/board/[boardId]/_components/list/card/card-item.tsx`
  - `draggable()` on row element
  - local dragging styles

- `app/board/[boardId]/_components/list/card/card-slot.tsx`
  - `dropTargetForElements` + `attachClosestEdge({ allowedEdges: ["top", "bottom"] })`

- `app/board/[boardId]/_components/list/card/card-container.tsx`
  - maps rows through slot + item
  - `shouldShiftCard` placeholder shift
  - optional `autoScrollForElements`

### Wiring

- `app/board/[boardId]/_components/list/list-item.tsx` — wraps list contents with `DraggableList`
- `app/board/[boardId]/_components/list/list-contents.tsx` — passes `dragState` into `CardContainer`

## tRPC Reorder Procedures

- `trpc/server/routers/list.ts` — `reorderLists`
  - batch update `order` by id
  - board ownership check
  - activity log writes

- `trpc/server/routers/card.ts` — `reorderCards`
  - batch update `order` and optional `listId`
  - board ownership check
  - activity log writes

Use these as templates for `reorderRows` scoped by `groupId`.

## Table UI Base

- `components/ui/table.tsx` — Shadcn `Table`, `TableBody`, `TableRow`, `TableCell`
- `app/admin/_components/user-row.tsx` — example row composition (not draggable today)

## Mapping to Grouped Tables

| Copy from board | Adapt to table |
|-----------------|----------------|
| `listId` | `groupId` |
| `cardId` | `rowId` |
| `CardSlot` wrapping card | `TableRowSlot` wrapping `<tr>` |
| horizontal list container | vertical `TableBody` per group or single body with group header rows |
| cross-list card move | **disabled** — reject unlike groupId in `onDrop` |

## Constants

- `lib/constants.ts` — `CARD_GAP` used for placeholder spacing; reuse or add `TABLE_ROW_GAP` if needed

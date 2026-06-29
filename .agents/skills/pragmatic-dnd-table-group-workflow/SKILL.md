---
name: pragmatic-dnd-table-group-workflow
description: Implement grouped table row reordering with Atlaskit Pragmatic Drag and Drop in this Next.js repository. Use when adding drag-and-drop reorder inside a Shadcn table grouped by a field, wiring optimistic UI with tRPC mutations and TanStack Query invalidation, or adapting the board list/card DnD patterns to tabular layouts.
---

# Pragmatic DnD Table Group Workflow

Follow this skill when building **reorderable table rows constrained to the same group**. This repo already uses Pragmatic Drag and Drop on the board; map that model to tables instead of inventing a new DnD stack.

## Load References

Read `references/project-dnd-patterns.md` before editing when the task involves:
- adding a new grouped table with drag reorder
- wiring drop targets on `<tr>` / row slots
- persisting row order through tRPC
- adapting board drag state or reorder helpers

Also combine with:
- `nextjs-trpc-tanstack-workflow` for procedure + invalidation
- `drizzle-neon-workflow` when schema needs an `order` field scoped by group

## Mental Model

| Board domain | Grouped table |
|--------------|---------------|
| `list` | `group` (group key / group id) |
| `card` | table `row` |
| reorder within one list | reorder within one group only |
| `list-container.tsx` monitor | table container monitor |
| `CardItem` + `CardSlot` | draggable row + row slot |

**Default for this skill**: rows may reorder **only inside their group**. Reject cross-group drops in `onDrop` even if the pointer visually overlaps another group section.

## Packages (already installed)

- `@atlaskit/pragmatic-drag-and-drop`
- `@atlaskit/pragmatic-drag-and-drop-hitbox` (`attachClosestEdge`, `extractClosestEdge`)
- `@atlaskit/pragmatic-drag-and-drop-auto-scroll/element` (optional, long tables)
- `@atlaskit/pragmatic-drag-and-drop-react-drop-indicator` (optional line indicator)

Do not add `@dnd-kit`, `react-beautiful-dnd`, or HTML5 DnD unless the user explicitly requests a different library.

## Component Layout

Colocate feature-specific DnD UI under the route's `_components/` folder.

```
table-group-container.tsx   # monitorForElements, ordered state, mutation, onDrop
draggable-table-row.tsx     # draggable row + visual dragging state
table-row-slot.tsx          # dropTargetForElements wrapper around each row
grouped-table.tsx           # render group header rows + row slots
```

### Responsibilities

1. **`table-group-container.tsx` (client)**
   - Owns `orderedData`, `dragState`, reorder handler, and `monitorForElements`.
   - Mirrors `app/board/[boardId]/_components/list/list-container.tsx`.
   - Registers one global monitor; do not register monitors per row.

2. **`draggable-table-row.tsx` (client)**
   - Calls `draggable()` on the drag handle or entire row.
   - Sets local `isDragging` styles (`opacity-50`, cursor).
   - Mirrors `card-item.tsx`.

3. **`table-row-slot.tsx` (client)**
   - Wraps each `<tr>` with `dropTargetForElements`.
   - Uses `attachClosestEdge` with `allowedEdges: ["top", "bottom"]`.
   - Mirrors `card-slot.tsx`.

4. **`grouped-table.tsx`**
   - Renders Shadcn `Table`, group header rows, and maps rows through `TableRowSlot` → `DraggableTableRow`.
   - Keeps presentation thin; no persistence here.

## Drag Data Contract

Define shared types in `lib/drag-types.ts` (or a feature-local types file if the domain is isolated). Extend the board pattern with a table-specific discriminant.

```ts
export interface TableRowDragData {
  type: "table-row";
  rowId: string;
  groupId: string;
  index: number; // index within the group, not the whole table
}

export interface TableGroupDragState {
  draggedItem: {
    id: string;
    groupId: string;
    index: number;
    type: "table-row";
  } | null;
  isDragging: boolean;
  placeholderIndex: number | null;
  placeholderGroupId: string | null;
}
```

Every draggable row and drop target must include the same `type`, `rowId`, `groupId`, and `index`.

## Monitor Workflow

Follow the board monitor shape:

1. **`onDragStart`** — store dragged row id, group id, and index in `dragState`.
2. **`onDrag`** — read `location.current.dropTargets[0]`, extract closest edge, compute placeholder index **only when target group matches source group**.
3. **`onDrop`** — reset drag state, then:
   - return early if no target
   - return early if `sourceData.groupId !== targetData.groupId`
   - compute destination index from target index + closest edge (`bottom` increments index)
   - adjust index when moving down within the same group (same rule as board cards)
   - call `handleRowReorder(sourceIndex, targetIndex, groupId)`

Do not persist inside `onDrag`. Persist only in `onDrop` after validation.

## Reorder Helper

Reuse the board splice pattern:

```ts
function reorder<T>(items: T[], startIndex: number, endIndex: number) {
  const result = Array.from(items);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
}
```

For grouped data:

1. Find the group in local state by `groupId`.
2. Reorder only that group's rows array.
3. Reassign contiguous `order` values (`0..n-1`) within the group.
4. Optimistically update local state.
5. Call tRPC mutation with `{ groupId, rowsToReorder: [{ id, order, ...fieldsNeededForAudit }] }`.
6. On mutation error, restore the snapshot taken before optimistic update.

## Table-Specific UI Rules

- Prefer a **dedicated drag handle** column (`GripVertical` icon) instead of making the whole row draggable when cells contain links, buttons, or inputs.
- Keep semantic table markup: `Table` → `TableBody` → `TableRow` → `TableCell`.
- Group headers are **not** drop targets and **not** draggable.
- Hide or dim the dragged row while dragging (`hidden` / `opacity-50`) using `dragState.draggedItem?.id`.
- Shift rows below the placeholder during drag the same way `CardContainer` uses `shiftDown` + `CARD_GAP`.
- For long tables, attach `autoScrollForElements` to the scroll container with `canScroll: ({ source }) => source.data.type === "table-row"`.

## Persistence (tRPC)

Follow board reorder routers (`trpc/server/routers/list.ts`, `trpc/server/routers/card.ts`):

1. Add `reorderRows` (or domain-specific name) as `protectedProcedure`.
2. Validate with Zod:
   - parent scope id (workspace, board, page id, etc.)
   - `groupId`
   - `rowsToReorder: [{ id, order, ... }]`
3. Verify ownership / RBAC before updating.
4. Update only `order` (and other fields if the domain requires) for rows in that group.
5. Return updated rows or ids; keep payload small.
6. Write audit/activity logs only if the feature already uses that pattern.

Client mutation wiring:

```ts
const reorderRows = useMutation(
  trpc.<router>.reorderRows.mutationOptions({
    onError: (error) => toast("Failed to reorder rows", { description: error.message }),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: trpc.pages.<pageQuery>.queryKey({ ...scope }),
      }),
  }),
);
```

Invalidate the **page-shaped query** that assembles grouped rows, not unrelated caches.

## Database Expectations

- Persist order with an integer `order` column scoped by group foreign key.
- Page queries must `orderBy(asc(table.order))` within each group.
- New rows append to the end of their group unless insertion semantics are explicit.

## Placement Heuristics

| Concern | Location |
|---------|----------|
| Drag types | `lib/drag-types.ts` or feature-local `drag-types.ts` |
| DnD container + monitor | route `_components/*-container.tsx` |
| Row draggable / slot | route `_components/*-row*.tsx` |
| Grouped table render | route `_components/*-table.tsx` |
| Reorder mutation | `trpc/server/routers/<domain>.ts` |
| Page read model | `trpc/server/routers/pages.ts` or domain router query |

## Implementation Checklist

- [ ] `"use client"` only on interactive DnD components
- [ ] Shared drag data contract with `type`, `groupId`, `index`, `rowId`
- [ ] Cross-group drops rejected in `onDrop`
- [ ] Optimistic reorder with rollback on mutation error
- [ ] Drag handle separated from clickable cell actions
- [ ] Group headers excluded from drag/drop registration
- [ ] tRPC procedure validates input and enforces auth/RBAC
- [ ] Query invalidation targets the grouped page query key
- [ ] Manual test: reorder first/middle/last row in a group; confirm no cross-group move

## Out of Scope (unless user asks)

- Cross-group row moves
- Column reorder
- Server Actions instead of tRPC
- Virtualized tables (needs extra hitbox/testing notes)

## Review Checklist

- monitor registered once at container level
- drop targets use closest edge top/bottom
- order recomputed contiguously within group after every drop
- no database access from client components
- no auth/RBAC checks only in the UI

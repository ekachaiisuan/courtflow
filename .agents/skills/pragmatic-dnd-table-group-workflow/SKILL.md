---
name: pragmatic-dnd-table-group-workflow
description: Implement grouped table row reordering with Atlaskit Pragmatic Drag and Drop inside a Datatable. Use when adding drag-and-drop reorder inside a table grouped by a field, wiring optimistic UI with mutations/queries, or implementing drag-and-drop row sorting.
---

# Pragmatic DnD Table Group Workflow

Follow this skill when building **reorderable table rows constrained to the same group** inside a Datatable.

## Load References

Use this skill when:
- Adding a new grouped Datatable with drag reorder.
- Wiring drop targets on `<tr>` or row slots.
- Persisting row order through API endpoints or tRPC mutations.

## Mental Model

For grouped table row reordering, the core concepts are:
- **Group (Group Key / Group ID)**: The partition defining which rows belong together.
- **Row**: The draggable element inside the group.
- **Reordering**: Drag-and-drop sorting is restricted to the **same group**. Cross-group drops must be rejected in the `onDrop` handler even if the pointer visually overlaps another group section.
- **Table Monitor**: A single parent listener capturing drag start, drag, and drop events for all rows.
- **Draggable Row + Row Slot**: The table row (`<tr>`) behaves as a drop target (slot), while a drag handle or the row itself behaves as the draggable element.

## Packages

Ensure the following packages are installed:
- `@atlaskit/pragmatic-drag-and-drop`
- `@atlaskit/pragmatic-drag-and-drop-hitbox` (`attachClosestEdge`, `extractClosestEdge`)
- `@atlaskit/pragmatic-drag-and-drop-auto-scroll/element` (optional, for long tables)
- `@atlaskit/pragmatic-drag-and-drop-react-drop-indicator` (optional, for line indicator)

Do not add other drag-and-drop libraries unless explicitly requested.

## Component Layout

Colocate feature-specific DnD UI under the feature's components folder:

```
table-group-container.tsx   # monitorForElements, ordered state, mutation, onDrop
draggable-table-row.tsx     # draggable row + visual dragging state
table-row-slot.tsx          # dropTargetForElements wrapper around each row
grouped-table.tsx           # render group header rows + row slots
```

### Responsibilities

1. **`table-group-container.tsx` (client)**
   - Owns `orderedData`, `dragState`, reorder handler, and registers `monitorForElements`.
   - Registers one global monitor; do not register monitors per row.

2. **`draggable-table-row.tsx` (client)**
   - Calls `draggable()` on the drag handle or entire row.
   - Sets local dragging styles (such as `opacity-50`, cursor styling).

3. **`table-row-slot.tsx` (client)**
   - Wraps each `<tr>` with `dropTargetForElements`.
   - Uses `attachClosestEdge` with `allowedEdges: ["top", "bottom"]`.

4. **`grouped-table.tsx`**
   - Renders the table, group header rows, and maps rows through `TableRowSlot` → `DraggableTableRow`.
   - Keeps presentation thin; no persistence logic here.

## Drag Data Contract

Define shared drag types in a feature-local types file:

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

Follow this monitor lifecycle shape:

1. **`onDragStart`** — store dragged row id, group id, and index in `dragState`.
2. **`onDrag`** — read `location.current.dropTargets[0]`, extract closest edge, and compute placeholder index **only when target group matches source group**.
3. **`onDrop`** — reset drag state, then:
   - Return early if no target.
   - Return early if `sourceData.groupId !== targetData.groupId`.
   - Compute destination index from target index + closest edge (`bottom` increments index).
   - Adjust index when moving down within the same group (to account for the item's own space removal).
   - Call `handleRowReorder(sourceIndex, targetIndex, groupId)`.

Do not persist inside `onDrag`. Persist only in `onDrop` after validation.

## Reorder Helper

Use a standard array splice pattern:

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
5. Call backend mutation (e.g. tRPC or API) with `{ groupId, rowsToReorder: [{ id, order }] }`.
6. On mutation error, restore the snapshot taken before optimistic update.

## Table-Specific UI Rules

- Prefer a **dedicated drag handle** column (e.g., `GripVertical` icon) instead of making the whole row draggable when cells contain links, buttons, or inputs.
- Keep semantic table markup: `Table` → `TableBody` → `TableRow` → `TableCell`.
- Group headers are **not** drop targets and **not** draggable.
- Hide or dim the dragged row while dragging (`hidden` / `opacity-50`) using `dragState.draggedItem?.id`.
- Shift rows below the placeholder during drag by applying translation or margin offsets.
- For long tables, attach `autoScrollForElements` to the scroll container with `canScroll: ({ source }) => source.data.type === "table-row"`.

## Persistence (tRPC / API)

Implement the reorder backend logic (e.g. tRPC procedure or API route):

1. Add a reorder procedure or endpoint.
2. Validate the input using Zod or a validator:
   - `groupId` (string or ID)
   - `rowsToReorder: [{ id, order }]`
   - optional parent context/scope ID (e.g. workspace ID)
3. Verify permissions/RBAC before updating.
4. Update only `order` (and other fields if needed) for rows in that group.
5. Return updated rows or IDs; keep payload small.

Client mutation wiring example:

```ts
const reorderRows = useMutation({
  onMutate: async (newOrder) => {
    // perform optimistic updates here
  },
  onError: (error, variables, context) => {
    // rollback to saved context on error
  },
  onSuccess: () => {
    // invalidate related page query to refetch fresh data
  }
});
```

Invalidate the query that assembles grouped rows, not unrelated caches.

## Database Expectations

- Persist order with an integer `order` column scoped by group foreign key.
- Page queries must order by the order column ascending within each group.
- New rows append to the end of their group unless insertion semantics are explicit.

## Placement Heuristics

| Concern | Location |
|---------|----------|
| Drag types | Feature-local `drag-types.ts` or shared types file |
| DnD container + monitor | Route `_components/*-container.tsx` |
| Row draggable / slot | Route `_components/*-row*.tsx` |
| Grouped table render | Route `_components/*-table.tsx` |
| Reorder mutation | Backend API / router file |

## Implementation Checklist

- [ ] `"use client"` only on interactive DnD components
- [ ] Shared drag data contract with `type`, `groupId`, `index`, `rowId`
- [ ] Cross-group drops rejected in `onDrop`
- [ ] Optimistic reorder with rollback on mutation error
- [ ] Drag handle separated from clickable cell actions
- [ ] Group headers excluded from drag/drop registration
- [ ] Backend endpoint/procedure validates input and enforces auth/RBAC
- [ ] Query invalidation targets the grouped page query key
- [ ] Manual test: reorder first/middle/last row in a group; confirm no cross-group move

## Out of Scope (unless user asks)

- Cross-group row moves
- Column reorder
- Virtualized tables (needs extra hitbox/testing notes)

## Review Checklist

- Monitor registered once at container level
- Drop targets use closest edge top/bottom
- Order recomputed contiguously within group after every drop
- No database access from client components
- No auth/RBAC checks only in the UI

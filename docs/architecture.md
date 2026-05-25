# Architecture — Workspace Collaboration (v1)

## Stack

Next.js 16 App Router · tRPC · Drizzle ORM · Neon (PostgreSQL) · Better Auth · Shadcn · TanStack Query · Zustand · Pragmatic DnD · Arcjet

---

## Folder Structure

```
app/
├── (auth)/
├── admin/
├── board/[boardId]/_components/
├── dashboard/_components/
├── api/auth/[...all]/
└── profile

## Files

trpc/server/routers/
├── board.ts · list.ts · card.ts · pages.ts
└── workspace.ts  (planned)

db/schema/
├── auth.ts
├── index.ts
├── schedule.ts   # boards, lists, cards, board_actions
└── workspace.ts  # workspaces, workspace_members

server/
└── workspace-permissions.ts

lib/
├── auth.ts        # requireAuth(), requireAdmin()
└── permissions.ts
```

---

## Data Model

```
workspaces
  id, name, createdBy → user.id (cascade), timestamps

workspace_members
  id, workspaceId → workspaces.id (cascade), userId → user.id (cascade)
  role: "owner" | "admin" | "member"
  joinedAt
  UNIQUE(workspaceId, userId)
  INDEX(userId), INDEX(workspaceId)

boards
  id, name, workspaceId → workspaces.id (cascade), timestamps
  INDEX(workspaceId)

list
  id, name, order, boardId → boards.id (cascade), timestamps

card
  id, name, description, order, listId → list.id (cascade), timestamps

board_actions
  id, action: CREATE|UPDATE|DELETE, boardComponent: board|card|list
  boardComponentId, boardComponentName, boardId, userId → user.id (cascade)
  createdAt
  (actor log only — ไม่ใช่ ownership)
```

---

## RBAC

| Action                      | owner | admin | member |
| --------------------------- | :---: | :---: | :----: |
| workspace settings          |  ✅   |  ❌   |   ❌   |
| invite / remove member      |  ✅   |  ✅   |   ❌   |
| สร้าง / แก้ / ลบ board      |  ✅   |  ✅   |   ❌   |
| สร้าง / แก้ / ลบ list, card |  ✅   |  ✅   |   ✅   |
| reorder list / card         |  ✅   |  ✅   |   ✅   |
| อ่าน board                  |  ✅   |  ✅   |   ✅   |

---

## Permission Helpers (`server/workspace-permissions.ts`)

```ts
getWorkspaceMember(workspaceId, userId)
requireWorkspaceAccess(workspaceId, userId)
requireWorkspaceRole(workspaceId, role | role[], userId)
requireBoardAccess(boardId, userId)       // member ขึ้นไป
requireBoardAdminAccess(boardId, userId)  // owner | admin เท่านั้น
```

---

## Data Flow

```
Server Component
  → requireAuth()
  → tRPC caller / Drizzle query
  → render

Client Component
  → React Hook Form + Zod
  → tRPC mutation (TanStack Query)
  → optimistic update (Zustand สำหรับ DnD)
```

---

## Auth Rules

- Session ดึงฝั่ง server เสมอก่อนเข้าข้อมูลสำคัญ
- ห้าม query DB จาก Client Component
- UI ใช้ role เพื่อซ่อน/แสดง UI เท่านั้น — ไม่ใช่ security layer
- ทุก mutation ใน tRPC router ต้องเช็ค permission ผ่าน helper ก่อนเสมอ

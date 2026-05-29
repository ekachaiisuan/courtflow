# Architecture — Workspace Collaboration (v1)

## Stack

Next.js 16 App Router · tRPC · Drizzle ORM · Neon (PostgreSQL) · Better Auth · Shadcn · TanStack Query · Zustand · Pragmatic DnD · Arcjet

---

## Where Things Live

| ต้องการอะไร            | ไปที่                               |
| ---------------------- | ----------------------------------- |
| Data model / relations | `db/schema/`                        |
| Business logic         | `trpc/server/routers/`              |
| Permission boundary    | `server/workspace-permissions.ts`   |
| Auth config            | `lib/auth.ts`                       |
| System-level RBAC      | `lib/permissions.ts`                |
| Route UI               | `app/.../page.tsx` + `_components/` |
| Shared UI              | `components/`                       |
| Task / plan docs       | `docs/`                             |

---

## Key Files

```
db/schema/
  auth.ts         # Better Auth tables
  schedule.ts     # boards, list, card, board_actions
  workspace.ts    # workspaces, workspace_members

trpc/server/routers/
  board.ts · list.ts · card.ts   # mutations
  pages.ts                        # page-shaped read models

server/
  workspace-permissions.ts        # RBAC helpers (เริ่มที่นี่เสมอ)
  user.ts                         # session helpers
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
  UNIQUE(workspaceId, userId) · INDEX(userId) · INDEX(workspaceId)

boards
  id, name, workspaceId → workspaces.id (cascade), timestamps
  INDEX(workspaceId)

list
  id, name, order, boardId → boards.id (cascade), timestamps

card
  id, name, description, order, listId → list.id (cascade), timestamps

board_actions                          # actor log — ไม่ใช่ ownership
  id, action: CREATE|UPDATE|DELETE
  boardComponent: board|card|list
  boardComponentId, boardComponentName, boardId
  userId → user.id (cascade), createdAt
```

---

## RBAC V1

# Status : Deprecated

# Reason : มีการเปลี่ยนแปลงให้ admin,manager ในระดับ system เป็นผู้ดูแล workspace แทน

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

## Rules

- Server Component เท่านั้นที่ query DB ได้
- ทุก tRPC mutation ต้องเช็ค permission helper ก่อนเสมอ
- UI ใช้ role เพื่อซ่อน/แสดง element เท่านั้น — ไม่ใช่ security layer
- Session ดึงฝั่ง server เสมอก่อนเข้าข้อมูลสำคัญ

---

## Session Goal V 1

# Status : Deprecated

# Reason : เปลี่ยนจาก board workspaces Collaboration เป็น admin ของ system ดูแล workspace แทน

- ทำให้ระบบบริหารจัดการ board จากเดิม board owner only เป็น board workspaces Collaboration โดยเน้นความปลอดภัยของการรับส่งข้อมูล

---

## Session Goal V 2

- ทำให้ระบบบริหารจัดการ board จากเดิม board owner only เป็น board workspaces ที่ admin,manager ของ role system ดูแล โดยเน้นความปลอดภัยของการรับส่งข้อมูล

---

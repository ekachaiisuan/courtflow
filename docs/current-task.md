## Current feature:

- Plan: system-managed workspace provisioning + workspace-scoped board collaboration ตาม `docs/workspace-plan-th-v2.md`

## Completed:

- Workspace schema ใช้ต่อได้แล้ว
  - เพิ่มตาราง `workspaces`
  - เพิ่มตาราง `workspace_members`
  - ใช้ workspace roles `owner`, `admin`, `member`
  - เพิ่ม type `WorkspaceMember`

- Board ownership migration ใช้ต่อได้แล้ว
  - ลบ `boards.userId`
  - เพิ่ม `boards.workspaceId`
  - เพิ่ม foreign key ไปที่ `workspaces.id`
  - เพิ่ม index `boards_workspace_id_idx`
  - คง `board_actions.userId` ไว้เป็น actor log
  - เพิ่ม manual migration `migrations/0001_boards_workspace_owner.sql`
  - update `migrations/meta/_journal.json`
  - migrate ขึ้น NeonDB แล้ว

- Permission helpers ฝั่ง server ใช้ได้บางส่วน
  - `getWorkspaceMember(workspaceId, userId)`
  - `requireWorkspaceAccess(workspaceId)`
  - `requireWorkspaceRole(workspaceId, "admin")`
  - `requireWorkspaceRole(workspaceId, ["owner", "admin"])`
  - `requireBoardAccess(boardId)`
  - `requireBoardAdminAccess(boardId)`
  - หมายเหตุ: `requireBoardAdminAccess(boardId)` ยังต้อง refactor ตาม policy V2 เพราะตอนนี้ยังครอบ `owner | admin` สำหรับ action ที่ควรแยก owner-only เช่น `deleteBoard`

- Board domain integration ใช้ได้ต่อบางส่วน
  - `trpc/server/routers/board.ts`
    - `createBoard` รับ `workspaceId`
    - `createBoard` บังคับ `requireWorkspaceRole(workspaceId, ["owner", "admin"])`
    - `updateBoard` และ `deleteBoard` ยังใช้ `requireBoardAdminAccess(boardId)` อยู่ และต้องแยก policy ต่อ
  - `trpc/server/routers/list.ts`
    - เปลี่ยน action หลักไปใช้ `requireBoardAccess(boardId)`
  - `trpc/server/routers/card.ts`
    - เปลี่ยน action หลักไปใช้ `requireBoardAccess(boardId)`
  - `trpc/server/routers/pages.ts`
    - `boardPage` ดึง boards ตาม workspace membership
    - `boardPage` คืน `createableWorkspaces` และ `defaultWorkspaceId`
    - `boardIdPage` ใช้ `requireBoardAccess(boardId)` และคืน `{ board, logs }`
  - `app/dashboard/_components/board-create-form.tsx`
    - เลือก workspace ก่อน create board
    - ส่ง `workspaceId` เข้า `board.createBoard`
  - `app/board/[boardId]/_components/board-id-page-contents.tsx`
    - เปลี่ยนจาก `data.boards.find(...)` เป็น `data.board`

- เก็บ bug ที่เจอระหว่างทางใน `list.copyList`
  - query cards จาก `card.listId` ให้ถูกต้อง
  - copied cards ชี้ `listId` ไปที่ `newListId`

## Verification:

- รันผ่านแล้ว:
  - `pnpm exec drizzle-kit migrate`
  - `pnpm exec eslint server/workspace-permissions.ts db/schema/schedule.ts db/schema/workspace.ts`
  - `pnpm exec eslint "trpc/server/routers/board.ts" "trpc/server/routers/list.ts" "trpc/server/routers/card.ts" "trpc/server/routers/pages.ts" "app/dashboard/_components/board-create-form.tsx" "app/board/[boardId]/_components/board-id-page-contents.tsx"`
  - `pnpm exec tsc --noEmit`

- ตรวจแล้ว:
  - `boards.userId` ไม่ถูกอ้างใน board/list/card/pages routers อีก
  - `board.createBoard` รองรับ `workspaceId`
  - `pages.boardIdPage` เปลี่ยน response shape เป็น `{ board, logs }`

- ยังไม่ได้ทำ:
  - manual verification ตาม policy V2 ของ `owner` / `admin` / `member`
  - system management flow สำหรับ workspace
  - หน้า `/admin/workspaces`
  - system-role gate สำหรับ workspace management ของ `admin` / `manager`

## Next:

- Focus ถัดไป:
  - เพิ่ม workspace management UI ที่ `/admin/workspaces`
  - เพิ่ม workspace router/procedures สำหรับ:
    - `workspace.adminList`
    - `workspace.create`
    - `workspace.getById`
    - `workspace.addMember`
    - `workspace.changeMemberRole`
    - `workspace.removeMember`
  - เพิ่ม system-level permission check สำหรับ `admin` / `manager` ก่อนเข้าหน้าและก่อนเรียก procedures
  - ปรับ board RBAC ให้ตรง policy V2:
    - `createBoard` = `owner | admin`
    - `updateBoard` = `owner | admin`
    - `deleteBoard` = `owner` only
  - ปรับ dashboard/board UI ให้สะท้อน capability ตาม role ถ้าต้องการ
  - ทำ manual verification รอบใหม่ตาม policy V2 หลังจาก flow หลักพร้อม

## Not focus this round:

- invite flow
- accept invite
- token-based join
- workspace self-service management โดย workspace owner/admin
- full workspace switcher UI
- email-based onboarding เข้า workspace

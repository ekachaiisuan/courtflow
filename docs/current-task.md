## Current feature:

- Plan: เปลี่ยน Board Owner-Only เป็น Workspace Collaboration ตาม `docs/workspace-plan-th.md`

## Completed:

- เพิ่ม model workspace แล้ว
  - เพิ่มตาราง `workspaces`
  - เพิ่มตาราง `workspace_members`
  - ใช้ workspace roles `owner`, `admin`, `member`
  - เพิ่ม type `WorkspaceMember`

- เพิ่ม permission helpers ฝั่ง server แล้ว
  - `getWorkspaceMember(workspaceId, userId)`
  - `requireWorkspaceAccess(workspaceId)`
  - `requireWorkspaceRole(workspaceId, "admin")`
  - `requireWorkspaceRole(workspaceId, ["owner", "admin"])`
  - `requireBoardAccess(boardId)`
  - `requireBoardAdminAccess(boardId)`

- จัดการ schema และ migration ของ board ownership แล้ว
  - ลบ `boards.userId`
  - เพิ่ม `boards.workspaceId`
  - เพิ่ม foreign key ไปที่ `workspaces.id`
  - เพิ่ม index `boards_workspace_id_idx`
  - คง `board_actions.userId` ไว้เป็น actor log
  - เพิ่ม manual migration `migrations/0001_boards_workspace_owner.sql`
  - update `migrations/meta/_journal.json`
  - migrate ขึ้น NeonDB แล้ว

- ปิดงาน RBAC ฝั่ง server สำหรับ board domain แล้ว
  - `trpc/server/routers/board.ts`
    - `createBoard` รับ `workspaceId`
    - `createBoard` บังคับ `requireWorkspaceRole(workspaceId, ["owner", "admin"])`
    - `updateBoard` และ `deleteBoard` ใช้ `requireBoardAdminAccess(boardId)`
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

- ยังไม่ได้ทำในรอบนี้:
  - manual verification ของ multi-user workspace flow

## Next:

- Focus ถัดไป:
  - manual verify flow ตาม role `owner` / `admin` / `member`
  - ปรับ UI dashboard/board ให้แสดงบริบท workspace ชัดขึ้นถ้าต้องการ
  - เริ่ม workspace feature รอบถัดไป เช่น invite flow, workspace router, workspace switcher

- ยังไม่ focus รอบนี้:
  - UI workspace switcher แบบเต็ม
  - invite flow
  - workspace router ชุดเต็ม

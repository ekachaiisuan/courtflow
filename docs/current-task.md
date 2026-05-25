## Current feature:

- Plan: เปลี่ยน Board Owner-Only เป็น Workspace Collaboration ตาม workspace-plan-th.md

## Completed:

- มี model workspace.ts แล้ว
  - เพิ่มตาราง `workspaces`
  - เพิ่มตาราง `workspace_members`
  - ใช้ workspace role ชุด `owner`, `admin`, `member`
  - เพิ่ม type `WorkspaceMember`

- เพิ่ม permission helper ฝั่ง server ดังนี้:
  - `getWorkspaceMember(workspaceId, userId)`
  - `requireWorkspaceAccess(workspaceId)`
  - `requireWorkspaceRole(workspaceId, "admin")`
  - `requireWorkspaceRole(workspaceId, ["owner", "admin"])`
  - `requireBoardAccess(boardId)`
    - เปลี่ยนแล้วให้ load board แล้วเช็ค workspace membership ผ่าน `board.workspaceId`
  - `requireBoardAdminAccess(boardId)`
    - เพิ่มแล้วเพื่อใช้ map สิทธิ์ board management ผ่าน workspace role `["owner", "admin"]`

- จัดการ schema/migration ของ board ownership แล้ว
  - แก้ `db/schema/schedule.ts`
    - ลบ `boards.userId`
    - เพิ่ม `boards.workspaceId`
    - เพิ่ม foreign key ไปที่ `workspaces.id`
    - เพิ่ม index `boards_workspace_id_idx`
    - เพิ่ม relation `board -> workspace`
  - คง `board_actions.userId` ไว้เป็น actor log ไม่ใช่ ownership
  - เพิ่ม manual migration `migrations/0001_boards_workspace_owner.sql`
  - update `migrations/meta/_journal.json`
  - migrate ขึ้น NeonDB แล้ว

## Verification:

- รันผ่านแล้ว:
  - `pnpm exec eslint server/workspace-permissions.ts db/schema/workspace.ts`
  - `pnpm exec eslint server/workspace-permissions.ts db/schema/workspace.ts db/schema/schedule.ts`
  - `pnpm exec eslint db/schema/schedule.ts db/schema/workspace.ts`
  - `pnpm exec drizzle-kit migrate`
  - `pnpm exec eslint server/workspace-permissions.ts db/schema/schedule.ts db/schema/workspace.ts`

- ตรวจ NeonDB หลัง migrate แล้ว:
  - `boards` ไม่มี `user_id`
  - `boards.workspace_id` เป็น `NOT NULL`
  - มี foreign key `boards_workspace_id_workspaces_id_fk`
  - มี index `boards_workspace_id_idx`

- หมายเหตุ:
  - `pnpm exec tsc --noEmit` ยัง fail เพราะ router หลายจุดยังอ้าง `boards.userId`
  - error ฝั่ง `server/workspace-permissions.ts` ที่เคยอ้าง `boards.userId` หายแล้ว
  - จุดที่ต้องแก้ถัดไปอยู่ใน `trpc/server/routers/board.ts`, `trpc/server/routers/list.ts`, `trpc/server/routers/card.ts`, และ `trpc/server/routers/pages.ts`

## Next:

- Focus ถัดไป: ทำ RBAC ฝั่ง server ให้ครบก่อนตาม `workspace-plan-th.md`
  - เปลี่ยน guard ใน `board/list/card/pages` routers จาก `eq(boards.userId, ctx.user.id)` ไปใช้ helper กลาง
  - ใช้ `requireBoardAdminAccess(boardId)` กับ action ระดับจัดการบอร์ด
  - ใช้ `requireBoardAccess(boardId)` กับ read/list/card actions ที่ `member` ทำได้
  - เปลี่ยน `board.createBoard` ให้รับ `workspaceId` และบังคับ role `admin` หรือ `owner`
  - เปลี่ยน `pages.boardPage` และ `pages.boardIdPage` ให้ดึงข้อมูลตาม workspace membership แทน owner-only query

- ยังไม่ focus รอบนี้:
  - UI workspace switcher
  - invite flow
  - workspace router ชุดเต็ม

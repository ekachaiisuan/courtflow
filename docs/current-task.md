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
    - ตอนนี้เป็น transitional owner-only guard ผ่าน `boards.userId`
    - หลังเพิ่ม `boards.workspaceId` แล้วให้เปลี่ยนภายใน helper นี้ไปเช็ค workspace membership

## Verification:

- รันผ่านแล้ว:
  - `pnpm exec eslint server/workspace-permissions.ts db/schema/workspace.ts`
  - `pnpm exec eslint server/workspace-permissions.ts db/schema/workspace.ts db/schema/schedule.ts`

- หมายเหตุ:
  - `pnpm lint` ทั้งโปรเจกต์ยัง fail จาก lint errors เดิมในไฟล์อื่นที่ไม่เกี่ยวกับ workspace RBAC helpers
  - lint เฉพาะ `db/schema/schedule.ts` ยังมี warnings เดิมเรื่อง unused imports

## Next:

- ทำ helper ถัดไป:
  - `requireBoardAdminAccess(boardId)` หรือ policy helper ที่ map ผ่าน workspace role

- ก่อนเปลี่ยน board/list/card router ทั้งชุด ควรทำ schema/migration ให้ `boards` ผูกกับ `workspaceId` ให้เรียบร้อยก่อน

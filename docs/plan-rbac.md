# RBAC Completion Plan

## Summary

เป้าหมายรอบถัดไปคือปิดงาน RBAC ฝั่ง server ให้ครบสำหรับ board domain ก่อน โดยย้ายทุก owner-only guard ที่ยังอ้าง `boards.userId` ไปใช้ workspace-based helpers แทน และทำให้ contract ระหว่าง router กับ UI สอดคล้องกับโมเดล `boards.workspaceId`

ผลลัพธ์ที่ต้องได้:

- board/list/card/pages routers ไม่อ้าง `boards.userId` อีก
- board management ใช้ `requireBoardAdminAccess(boardId)`
- board read/list/card actions ใช้ `requireBoardAccess(boardId)`
- `createBoard` รับ `workspaceId` และบังคับ role `owner` หรือ `admin`

## Key Changes

- อัปเดต `trpc/server/routers/board.ts`
  - `createBoard` เปลี่ยน input เป็น `{ workspaceId, name }`
  - ก่อน insert ให้เรียก `requireWorkspaceRole(workspaceId, ["owner", "admin"])`
  - insert board ด้วย `workspaceId` แทน `userId`
  - `updateBoard` และ `deleteBoard` เรียก `requireBoardAdminAccess(boardId)` ก่อน mutate
  - คง `boardAction.userId` เป็น actor log ตามเดิม

- อัปเดต `trpc/server/routers/list.ts`
  - ทุก action ที่รับ `boardId` ให้เรียก `requireBoardAccess(boardId)` ก่อนอ่าน/เขียน
  - ไม่ต้องเช็ค role เพิ่มสำหรับ `member` ใน v1
  - `copyList`, `createList`, `updateList`, `deleteList`, `reorderLists` ใช้ board access helper เป็น guard กลาง
  - คง logic เรื่อง order และ board action ไว้ตามเดิม

- อัปเดต `trpc/server/routers/card.ts`
  - `copyCard` เปลี่ยนจากเช็ค `cardToCopy.list.board.userId` เป็นการเรียก `requireBoardAccess(cardToCopy.list.board.id)`
  - `createCard`, `updateCard`, `deleteCard`, `reorderCards` ใช้ `requireBoardAccess(boardId)`
  - คง behavior `member` ทำงานกับ card ได้
  - ไม่เปลี่ยนโครง `boardAction`

- อัปเดต `trpc/server/routers/pages.ts`
  - `boardPage` เปลี่ยนจาก owner-only query เป็น query boards ตาม workspace membership
  - รอบนี้ให้คืน `boards` ที่ user เป็นสมาชิกได้ทั้งหมดก่อน โดยรวม `workspaceId` ใน shape เดิมของ `Board`
  - `boardIdPage` เปลี่ยนจากโหลด boards ทั้งหมดของ owner แล้ว `.find()` เป็น query board เดียวตาม `boardId`
  - ก่อน return board page data ให้เรียก `requireBoardAccess(boardId)`
  - เปลี่ยน response shape จาก `{ boards, logs }` เป็น `{ board, logs }` เพื่อให้หน้า board ไม่ต้องค้นหา board จาก array อีก

- อัปเดต consumer ที่จำเป็นต่อ contract ใหม่
  - `app/dashboard/_components/board-create-form.tsx` ต้องส่ง `workspaceId`
  - ถ้ายังไม่มี current workspace selector จริง ให้ใช้ assumption ชั่วคราวที่ deterministic:
    เลือก workspace แรกที่ user มี role `owner` หรือ `admin` จาก query ใหม่สำหรับ dashboard/create flow
  - `app/board/[boardId]/_components/board-id-page-contents.tsx` เปลี่ยนไปอ่าน `data.board` แทน `data.boards.find(...)`

## Public Interfaces

- `board.createBoard`
  - จาก `createBoard({ name })`
  - เป็น `createBoard({ workspaceId, name })`

- `pages.boardIdPage`
  - จาก `{ boards, logs }`
  - เป็น `{ board, logs }`

- `pages.boardPage`
  - คงชื่อ procedure เดิม
  - เปลี่ยน semantics ให้ return boards ที่ user เข้าถึงได้ผ่าน workspace membership

## Test Plan

- `pnpm exec eslint server/workspace-permissions.ts trpc/server/routers/board.ts trpc/server/routers/list.ts trpc/server/routers/card.ts trpc/server/routers/pages.ts`
- `pnpm exec tsc --noEmit`
  - expectation: error ที่อ้าง `boards.userId` ใน board/list/card/pages ต้องหาย
- manual scenarios:
  - user ที่ไม่อยู่ใน workspace เปิด board ไม่ได้
  - `member` เปิด board ได้, สร้าง/แก้/ลบ list และ card ได้, reorder ได้
  - `member` rename/delete board ไม่ได้
  - `owner` หรือ `admin` create/update/delete board ได้
  - dashboard แสดง boards ที่เข้าถึงได้ผ่าน workspace membership
  - board page ยัง load lists/cards/logs ได้ตามเดิมหลังเปลี่ยน response shape

## Assumptions

- รอบนี้ยัง focus เฉพาะ RBAC + helper + router contract ที่จำเป็น ไม่ทำ invite flow, workspace router เต็มชุด, หรือ workspace switcher จริง
- ใช้ policy v1 จาก `workspace-plan-th.md`:
  - `owner` และ `admin` จัดการ board ได้
  - `member` ใช้งาน board/list/card ได้
- ถ้ายังไม่มี current workspace state จริงสำหรับ dashboard create flow ให้ใช้ default workspace ที่ user มีสิทธิ์ create board ได้เป็นตัวเลือกชั่วคราวในรอบนี้
- Better Auth system roles ใน `lib/permissions.ts` ยังแยกจาก workspace roles; รอบนี้ไม่ merge สองระบบเข้าด้วยกัน

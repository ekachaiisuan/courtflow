# Plan: เปลี่ยน Board Owner-Only เป็น Workspace Collaboration

## Summary

เปลี่ยน boundary หลักของระบบจาก `board.userId = owner คนเดียว` ไปเป็น `workspace -> workspace members -> boards` เพื่อให้หลายคนใน workspace เดียวกันเข้าถึงและแก้ไขบอร์ดเดียวกันได้อย่างถูกต้องทั้งฝั่ง read และ write

สำหรับ v1 นี้ใช้แนวทาง:

- ทุกบอร์ดต้องสังกัด workspace
- role มี 3 ระดับ: `admin`,`super` และ `member`
  admin = จัดการ user ในระบบ และ จัดการสมาชิกใน workspace ได้
  super = จัดการสมาชิกใน workspace ได้
  member = จัดการ board ใน workspace ได้
- รวม flow จัดการสมาชิกและเชิญสมาชิกไว้ใน scope

## Key Changes

### 1. Data model และสิทธิ์ใหม่

- เพิ่มตาราง `workspaces`
  ฟิลด์หลัก: `id`, `name`, `createdBy`, timestamps
- เพิ่มตาราง `workspace_members`
  ฟิลด์หลัก: `id`, `workspaceId`, `userId`, `role`, `joinedAt`
  กำหนด unique `(workspaceId, userId)`
- เพิ่มตาราง `workspace_invites`
  ฟิลด์หลัก: `id`, `workspaceId`, `email`, `role`, `token`, `status`, `expiresAt`, `invitedBy`
- แก้ `boards`
  เปลี่ยนจาก `userId` เป็น `workspaceId`
- คง `lists`, `cards`, `board_actions` ไว้ แต่ให้ board เป็นตัวเชื่อมไปยัง workspace
- เพิ่ม relation ใน Drizzle ให้ query แบบ `workspace -> boards`, `workspace -> members`, `board -> workspace` ได้ตรง ๆ

### 2. RBAC และ server-side authorization

- เพิ่ม permission helper ฝั่ง server สำหรับ workspace เช่น:
  - `getWorkspaceMember(workspaceId, userId)`
  - `requireWorkspaceAccess(workspaceId)`
  - `requireWorkspaceRole(workspaceId, "admin")`
  - `requireBoardAccess(boardId)`
  - `requireBoardAdminAccess(boardId)` หรือ mapping ผ่าน workspace role
- ใช้ `protectedProcedure` เหมือนเดิม แต่เปลี่ยน guard ภายใน router จาก `eq(boards.userId, ctx.user.id)` เป็น membership check
- policy ของ v1:
  - `admin`: สร้าง workspace board, แก้ชื่อ board, ลบ board, จัดการสมาชิก, ส่ง/ยกเลิก invite
  - `member`: อ่าน board, สร้าง/แก้ไข/ลบ card, สร้าง/แก้ไข/ลบ list, reorder list/card
- ห้ามพึ่ง UI condition เป็น security layer; ทุก read/write ต้องเช็ค membership หรือ role ใน router/page/server action

### 3. tRPC read/write flow ที่ต้องเปลี่ยน

- `pages.boardPage`
  เปลี่ยนจากดึง “boards ของ user” เป็น “boards ของทุก workspace ที่ user เป็นสมาชิก”
  payload ควรรวม workspace summary มาด้วยเพื่อใช้แยกกลุ่มใน dashboard
- `pages.boardIdPage`
  เปลี่ยนจากโหลด boards ทั้งหมดของ owner แล้วค่อย `.find()` เป็น query board เดียวตาม `boardId` พร้อม verify membership และ load nested lists/cards
- `board.createBoard`
  input ต้องมี `workspaceId`
  อนุญาตเฉพาะ `admin`
- `board.updateBoard`, `board.deleteBoard`
  เช็คผ่าน workspace role ของ board นั้น
- `list.*` และ `card.*`
  เปลี่ยนทุกจุดที่ใช้ owner check ให้เป็น board-access check
  `member` ใช้งานได้
- เพิ่ม router/workflow ใหม่สำหรับ workspace:
  - `workspace.create`
  - `workspace.listMine`
  - `workspace.update`
  - `workspace.inviteMember`
  - `workspace.acceptInvite`
  - `workspace.removeMember`
  - `workspace.changeMemberRole`
  - `workspace.listMembers`

### 4. UI / route behavior

- Dashboard เปลี่ยนจาก “Your's Boards” เป็นมุมมองตาม workspace
  แนะนำให้มี workspace switcher หรือ grouped board sections
- ฟอร์มสร้าง board ต้องเลือก `workspace`
  ถ้าผู้ใช้มี workspace เดียว ให้ preselect ได้
- หน้า board ควรรับ permission state จาก server/query เช่น `canManageBoard`, `canEditBoard`
  เพื่อซ่อนปุ่มที่ไม่ควรใช้ แต่ยังคงมี server guard จริงด้านหลัง
- เพิ่มหน้า/section จัดการสมาชิก workspace
  อย่างน้อยต้องมี:
  - รายชื่อสมาชิก
  - invite by email
  - เปลี่ยน role
  - remove member
- ลิงก์ invite ควรผูกกับ token และมีหน้า accept ที่บังคับ login ก่อน join workspace

## Public Interfaces / Types

- เพิ่ม enum/type:
  - `WorkspaceRole = "admin" | "member"`
  - `WorkspaceInviteStatus = "pending" | "accepted" | "revoked" | "expired"`
- เปลี่ยน type ของ `Board`
  จากมี `userId` เป็น `workspaceId`
- เพิ่ม page/query shape ใหม่:
  - dashboard board item มี `workspaceId`, `workspaceName`
  - board page มี `permissions` หรือ capability flags สำหรับ UI
- เปลี่ยน input API:
  - `createBoard({ workspaceId, name })`
  - workspace member/invite procedures ตามที่ระบุด้านบน

## Test Plan

- ผู้ใช้ที่ไม่ได้เป็นสมาชิก workspace เข้าหน้า `/board/[boardId]` ไม่ได้
- `member` เปิดบอร์ดได้และ:
  - สร้าง list ได้
  - สร้าง card ได้
  - reorder list/card ได้
  - แก้ไข/ลบ card และ list ได้
- `member` แก้ชื่อ board หรือลบบอร์ดไม่ได้
- `admin` ทำทุกอย่างด้านบนได้ รวมถึงจัดการสมาชิก
- dashboard แสดง boards จากหลาย workspace ของ user ได้ถูกต้อง
- invite flow:
  - invite email สำเร็จ
  - accept invite แล้วมี membership record
  - token หมดอายุหรือถูก revoke แล้วเข้าไม่ได้
- migration check:
  - board เดิมถูกย้ายเข้า workspace เริ่มต้นของ owner เดิม
  - ไม่มี list/card/action หลุด relation หลัง migrate
- manual verification ขั้นต่ำ:
  - login เป็น owner/admin 1 คน + member 1 คน
  - สร้าง workspace, เชิญสมาชิก, ให้สมาชิกสร้าง card ในบอร์ดเดียวกัน
  - ลอง member เข้าบอร์ด workspace อื่นที่ไม่ใช่ของตน ต้องถูกปฏิเสธ

## Migration / Rollout Assumptions

- เลือกแนวทาง backfill:
  สำหรับ user เดิมแต่ละคน สร้าง personal workspace อัตโนมัติ 1 อัน แล้วโยกทุก board เดิมเข้า workspace นั้น
- ไม่รองรับ personal board หลังจบ migration; board ใหม่ทุกใบต้องมี `workspaceId`
- ใช้ `admin/member` เป็น role เดียวใน v1; ยังไม่มี `viewer`
- ใช้ invite ผ่าน email + token เป็นช่องทางเข้าร่วมหลัก
- `board_actions.userId` คงไว้เพื่อบันทึก actor เดิม ไม่ต้องเปลี่ยน model log ในรอบแรก

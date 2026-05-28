# Revised Plan: System-Managed Workspace Provisioning V2

## Summary

ปรับแนวทางจากเดิมให้ `workspace` เป็นทรัพยากรที่สร้างและจัดการโดย system-level role เท่านั้นในเฟสนี้:

- ผู้ที่สร้าง workspace ได้คือ system role `admin` และ `manager`
- การเพิ่มสมาชิกเข้า workspace ทำผ่านหน้า management ของระบบโดย `admin/manager`
- ยังไม่ทำ invite flow ภายใน workspace, invite token, หรือ self-service join
- ผู้ใช้ใน workspace ใช้เฉพาะ workspace role สำหรับสิทธิ์ใน board domain

ค่าเริ่มต้นที่ล็อกแล้ว:

- ตอนสร้าง workspace ต้องเลือก user 1 คนเป็น `owner` ตั้งแต่แรก
- ผู้สร้างที่เป็น system `admin/manager` ไม่จำเป็นต้องกลายเป็นสมาชิก workspace อัตโนมัติ

## Key Changes

### 1. Authority model และ role policy

- แยกสิทธิ์ 2 ชั้นให้ชัด:
- System roles: `admin`, `manager` ใช้สำหรับสร้าง workspace และจัดการสมาชิกผ่านหน้าระบบ
- Workspace roles: `owner`, `admin`, `member` ใช้สำหรับ board/list/card ภายใน workspace
- ปรับนโยบาย workspace role เป็น:
- `owner`: จัดการ board ได้เต็ม รวม create/update/delete board
- `admin`: ทำได้เหมือน owner ยกเว้น `delete board`
- `member`: สร้าง board ไม่ได้ แต่จัดการ list/card และ reorder ได้
- ห้ามใช้ workspace role แทน system role ในหน้า management และห้ามใช้ system role แทน workspace role ใน board domain ยกเว้นจุด provision/admin UI ที่ตั้งใจให้ทำได้

### 2. Data model และ permission surface

- คง `workspaces` และ `workspace_members` ไว้ แต่ตัด `workspace_invites` ออกจาก scope รอบนี้
- ใช้ `workspaces.createdBy` เป็น system actor ที่สร้าง workspace
- บังคับว่า `workspace_members` ต้องมี `owner` อย่างน้อย 1 คนตั้งแต่สร้าง workspace
- เพิ่มหรือปรับ server helpers ให้รองรับ policy ใหม่:
- `requireSystemWorkspaceManager()` หรือ helper ที่เช็ก Better Auth permission สำหรับ `admin/manager`
- `requireWorkspaceAccess(workspaceId)`
- `requireWorkspaceRole(workspaceId, roles)`
- `requireBoardAccess(boardId)`
- แยก helper สำหรับ board mutating permissions ให้ชัด:
- `requireBoardCreateAccess(workspaceId)` = `owner | admin`
- `requireBoardUpdateAccess(boardId)` = `owner | admin`
- `requireBoardDeleteAccess(boardId)` = `owner` เท่านั้น
- ไม่พึ่ง role string เช็กตรง ๆ ในหน้า admin; ใช้ Better Auth permission check ตาม pattern ใน `app/admin/page.tsx`

### 3. Workspace management UI และ tRPC/API

- เพิ่มหน้า management ใหม่ใต้พื้นที่ admin เช่น `/admin/workspaces`
- หน้า workspace management ต้องมีความสามารถขั้นต่ำ:
- list workspaces
- create workspace
- view workspace members
- add member เข้า workspace พร้อมกำหนด role
- change member role
- remove member
- create workspace form ต้องมี:
- workspace name
- owner user selector แบบบังคับเลือก 1 คน
- optional initial admins/members เป็นเฟสถัดไป ไม่จำเป็นในรอบแรก
- เพิ่ม router/procedures ฝั่ง workspace สำหรับ system management:
- `workspace.adminList`
- `workspace.create`
- `workspace.getById`
- `workspace.addMember`
- `workspace.changeMemberRole`
- `workspace.removeMember`
- ทุก procedure กลุ่มนี้ต้องถูก gate ด้วย system-level permission ของ `admin/manager`
- ตัด `workspace.inviteMember` และ `workspace.acceptInvite` ออกจากแผนรอบนี้

### 4. Board domain integration

- `board.createBoard` ใช้ `workspaceId` เหมือนเดิม แต่ permission เปลี่ยนเป็น `owner | admin` ของ workspace เท่านั้น
- `board.updateBoard` ใช้ `owner | admin`
- `board.deleteBoard` ต้องเหลือ `owner` เท่านั้น
- `list.*` และ `card.*` คงใช้ member-access path ได้ต่อ
- `pages.boardPage` ยังคงดึง boards ตาม workspace membership
- `createableWorkspaces` ต้องแสดงเฉพาะ workspace ที่ user มี role `owner` หรือ `admin`
- board page ควรคืน capability flags สำหรับ UI เช่น:
- `canCreateBoard`
- `canUpdateBoard`
- `canDeleteBoard`
- dashboard/board UI ควรซ่อน action ตาม capability แต่ server guard ยังเป็นตัวบังคับจริง

## Public Interfaces / Types

- Workspace roles คงเป็น `owner | admin | member`
- เพิ่ม workspace management procedures สำหรับ system admin/manager:
- `workspace.create({ name, ownerUserId })`
- `workspace.addMember({ workspaceId, userId, role })`
- `workspace.changeMemberRole({ workspaceId, userId, role })`
- `workspace.removeMember({ workspaceId, userId })`
- ปรับ policy ของ board procedures:
- `createBoard({ workspaceId, name })` อนุญาต `owner | admin`
- `updateBoard({ boardId, name })` อนุญาต `owner | admin`
- `deleteBoard({ boardId })` อนุญาต `owner` เท่านั้น
- เพิ่ม page/query shape สำหรับ board/dashboard ถ้าจะซ่อนปุ่มตามสิทธิ์:
- `permissions.canCreateBoard`
- `permissions.canUpdateBoard`
- `permissions.canDeleteBoard`

## Test Plan

- System role `admin` และ `manager` เข้า `/admin/workspaces` ได้
- System role ที่ไม่ใช่ `admin/manager` เข้าไม่ได้
- สร้าง workspace ใหม่ได้เมื่อเลือก `ownerUserId`
- หลัง create แล้วมี `workspace_members` ของ owner ถูกสร้างทันที
- `owner` สร้าง/แก้/ลบ board ได้
- `admin` สร้าง/แก้ board ได้ แต่ลบ board ไม่ได้
- `member` เข้า board ได้, สร้าง/แก้/ลบ list/card ได้, reorder ได้, แต่สร้าง board ไม่ได้
- ผู้ที่ไม่เป็นสมาชิก workspace เข้า `/board/[boardId]` ไม่ได้
- dashboard แสดง boards เฉพาะ workspace ที่ user เป็นสมาชิก
- หน้า create board แสดงเฉพาะ workspace ที่ user มี role `owner` หรือ `admin`
- management flow add/change/remove member ทำงานได้ และสะท้อนสิทธิ์บน dashboard/board ทันทีหลัง refresh

## Assumptions

- ใช้หน้าใหม่ `/admin/workspaces` แทนการยัด flow นี้ลง `/dashboard`
- ผู้สร้าง workspace คือ system actor; owner ของ workspace คือ user ที่ถูกเลือกในฟอร์ม create
- system `admin/manager` ไม่ถูกเพิ่มเป็น workspace member อัตโนมัติ เว้นแต่มีการเพิ่มภายหลัง
- รอบนี้ยังไม่รองรับ invite ทาง email, token, หรือ acceptance flow
- หากต้องมี owner มากกว่า 1 คนในอนาคต ให้เป็นงานถัดไป; รอบนี้บังคับมี owner อย่างน้อย 1 คน และเลือก 1 คนตอน create

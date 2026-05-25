Plan

## Step ถัดไป: เพิ่ม workspace_members Model

Summary
เพิ่มตารางสมาชิกของ workspace เพื่อเปลี่ยนจาก “workspace มีผู้สร้างคนเดียว” ไปสู่ “workspace มีผู้ใช้งานหลายคนพร้อม role” โดยยังไม่ย้าย boards.userId เป็น workspaceId ในรอบนี้ Step นี้เป็นฐานสำหรับ RBAC, workspace router, และการย้าย board ในขั้นต่อไป

## Key Changes

เพิ่ม enum workspace_role ใน db/schema/workspace.ts:
owner,admin,member
เพิ่มตาราง workspace_members พร้อมฟิลด์:
id, workspaceId, userId, role, joinedAt
เพิ่ม unique constraint (workspaceId, userId) เพื่อกัน user เดิมถูกเพิ่มซ้ำใน workspace เดียวกัน
เพิ่ม relation:
workspace -> members
workspaceMember -> workspace
workspaceMember -> user
user -> workspaceMemberships
Export type สำหรับใช้ต่อ:
WorkspaceRole
WorkspaceMember
Implementation Details
แก้หลัก ๆ ที่ workspace.ts (line 1):

import เพิ่มจาก pg-core: pgEnum, uniqueIndex, index
เปลี่ยน workspaceRelations จากมีแค่ createdByUser เป็นมี members: many(workspaceMembers) ด้วย
สร้าง workspaceMembers หลัง workspaces
สร้าง workspaceMemberRelations
แก้ auth.ts (line 1):

import workspaceMembers เพิ่มจาก ./workspace
เพิ่ม workspaceMemberships: many(workspaceMembers) ใน userRelations
ยังไม่แก้:

boards.userId
board/list/card routers
UI dashboard
invite flow
Expected Schema Shape
export const workspaceRoleEnum = pgEnum("workspace_role", [
"owner",
"admin",
"member",
]);

export type WorkspaceRole = "owner" | "admin" | "member";

export const workspaceMembers = pgTable(
"workspace_members",
{
id: text("id").primaryKey(),
workspaceId: text("workspace_id")
.notNull()
.references(() => workspaces.id, { onDelete: "cascade" }),
userId: text("user_id")
.notNull()
.references(() => user.id, { onDelete: "cascade" }),
role: workspaceRoleEnum("role").notNull(),
joinedAt: timestamp("joined_at").defaultNow().notNull(),
},
(table) => [
uniqueIndex("workspace_members_workspace_user_unique").on(
table.workspaceId,
table.userId,
),
index("workspace_members_user_id_idx").on(table.userId),
index("workspace_members_workspace_id_idx").on(table.workspaceId),
],
);

## Test Plan

Run pnpm exec drizzle-kit generate
Review migration ว่ามี:
workspace_role enum
workspace_members table
foreign keys ไป workspaces.id และ user.id
unique index (workspace_id, user_id)
Run pnpm lint
ถ้ามี lint fail จากไฟล์เดิม ให้แยกจดไว้ ไม่ถือว่า step นี้พังถ้า schema ไม่มี error ใหม่
Assumptions
ใช้ role v1 เป็น owner/admin/member ตามเอกสารล่าสุด
ผู้สร้าง workspace จะถูกเพิ่มเป็น member role admin ใน step ถัดไปตอนทำ workspace.create
รอบนี้เป็น schema-only step เพื่อให้เข้าใจ relation ก่อน แล้วค่อยต่อ business logic ทีละก้อน

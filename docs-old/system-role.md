Plan

## Step ถัดไป: แยก System Role กับ Workspace Role ให้ชัด

# Summary

คง lib/permissions.ts ไว้เป็น Better Auth system RBAC เหมือนเดิม แล้วเพิ่ม workspace role ที่ db/schema/workspace.ts ผ่าน enum/table workspace_members เพื่อไม่ให้สิทธิ์ระดับระบบกับสิทธิ์ภายใน workspace ปนกัน

## Key Changes

ไม่แก้ ROLES = ["user", "officer", "manager", "admin"] ใน lib/permissions.ts
เพิ่ม workspaceRoleEnum ใน db/schema/workspace.ts:
owner,admin, member
เพิ่ม type WorkspaceRole
เพิ่ม table workspace_members
เพิ่ม relation ระหว่าง user, workspace, และ workspace_members
ภายหลังค่อยสร้าง helper แยก เช่น requireWorkspaceRole(...) หรือ hasWorkspacePermission(...) ในไฟล์ server-side ใหม่
Why
admin ใน Better Auth หมายถึง admin ของระบบ
admin ใน workspace หมายถึง admin ของ workspace นั้น
user คนเดียวอาจเป็น user ระดับระบบ แต่เป็น admin ใน workspace A และเป็น member ใน workspace B ได้
ถ้าเอา workspace role ไปใส่ lib/permissions.ts ตอนนี้ จะทำให้หน้า admin/user management สับสนกับ role ของ workspace
Test Plan
หลังเพิ่ม workspace_members ให้ generate migration
ตรวจว่า enum/table ใหม่อยู่ใน migration
ตรวจว่า lib/auth.ts และ lib/auth-client.ts ยัง import role เดิมได้ปกติ
ยังไม่แตะหน้า admin หรือ Better Auth role select ในรอบนี้
Assumptions
lib/permissions.ts = system-level permission
workspace_members.role = workspace-level permission
ชุด role workspace v1 ใช้ owner/admin/member ตามเอกสารล่าสุด

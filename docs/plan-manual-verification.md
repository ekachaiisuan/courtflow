# Manual Verification Task List: Multi-User Workspace Flow

## Summary

ใช้ checklist นี้เพื่อตรวจ manual flow ของ workspace collaboration รอบปัจจุบัน โดยโฟกัสสิ่งที่มีในระบบแล้วจริง:

- dashboard เห็น boards ตาม workspace membership
- การสร้าง board ผูกกับ `workspaceId`
- สิทธิ์ `owner` / `admin` / `member` ถูกบังคับที่ server สำหรับ board, list, card
- ผู้ที่ไม่เป็น member ของ workspace ต้องเข้า board ไม่ได้

ขอบเขตรอบนี้ยังไม่รวม invite flow เต็มรูปแบบ, workspace switcher เต็ม UI, หรือ workspace management screen

## Test Setup

เตรียมข้อมูลทดสอบดังนี้:

- User A = `owner`
- User B = `admin`
- User C = `member`
- User D = non-member
- Workspace 1 มี A, B, C อยู่ใน workspace เดียวกัน
- Workspace 2 มีเฉพาะ A หรือ D ไว้ใช้ทดสอบ cross-workspace access
- Board 1 อยู่ใน Workspace 1
- Board 2 อยู่ใน Workspace 2

ถ้ายังไม่มี UI จัดการสมาชิก:

- ใช้วิธีเตรียม membership จาก DB/seed/manual insert ก่อนเริ่ม verify
- ให้จด `workspaceId` และ `boardId` ที่ใช้ทดสอบไว้ล่วงหน้า

## Verification Tasks

1. Login และ dashboard visibility

- Login เป็น A, B, C แล้วเข้า `/dashboard`
- ยืนยันว่าแต่ละคนเห็นเฉพาะ boards ของ workspace ที่ตัวเองเป็นสมาชิก
- Login เป็น D แล้วต้องไม่เห็น Board 1 จาก Workspace 1
- ถ้ามีหลาย workspace ให้ตรวจว่า board แต่ละใบยังเปิดเข้าได้ถูกใบจาก dashboard

2. Create board permission

- Login เป็น A ที่ `/dashboard`
- เปิด create board form และสร้าง board ใหม่ใน Workspace 1 ได้สำเร็จ
- Login เป็น B แล้วสร้าง board ใหม่ใน Workspace 1 ได้สำเร็จ
- Login เป็น C แล้วลองเปิด create board flow
- ถ้า UI ยังเปิดให้กดได้ ต้องถูก server ปฏิเสธเมื่อ submit
- ถ้าไม่มี createable workspace ให้ถือว่าผ่านในเชิง UI guard

3. Open board access control

- Login เป็น A, B, C แล้วเปิด `/board/[boardId]` ของ Board 1 ได้
- Login เป็น D แล้วเปิด URL ของ Board 1 โดยตรง ต้องเข้าไม่ได้
- Login เป็น C แล้วเปิด URL ของ Board 2 ที่อยู่นอก workspace ต้องเข้าไม่ได้
- กรณีเข้าไม่ได้ ให้ยืนยันว่าไม่มีข้อมูล board/list/card รั่วออกมาทางหน้า UI

4. Board-level admin actions

- Login เป็น A แล้วแก้ชื่อ board ของ Board 1 ได้
- Login เป็น B แล้วแก้ชื่อ board ของ Board 1 ได้
- Login เป็น C แล้วลองแก้ชื่อ board
- ถ้า UI ยังแก้ได้ ต้องถูก server ปฏิเสธและชื่อจริงต้องไม่เปลี่ยน
- Login เป็น A หรือ B แล้วลบ board ทดสอบได้
- Login เป็น C แล้วลองลบ board
- ถ้า UI ยังมีปุ่ม delete ต้องถูก server ปฏิเสธ

5. Member list actions

- Login เป็น C แล้วเข้า Board 1
- สร้าง list ใหม่ได้
- duplicate list ได้
- delete list ได้
- ตรวจว่า list order ยังถูกต้องหลัง create/copy/delete
- Login เป็น A หรือ B แล้วทำซ้ำอย่างน้อย 1 รอบเพื่อยืนยันว่า admin path ยังปกติ

6. Member card actions

- Login เป็น C แล้วเพิ่ม card ใน list ได้
- แก้ไข card ได้
- ลบ card ได้
- reorder card ภายใน list ได้
- reorder card ข้าม list ได้ ถ้า flow นี้มีใน UI
- duplicate list ที่มี cards แล้วตรวจว่า cards ถูก copy ไปยัง `newListId` ถูกต้อง
- หลัง copy list ให้เปิดใช้งาน cards ที่ถูก copy ต่อได้จริง

7. List reorder / board interaction consistency

- Login เป็น C แล้ว reorder lists ได้
- Refresh หน้าแล้วลำดับ list/card ต้องคงอยู่
- ทำ action ต่อเนื่องหลายครั้งแล้วหน้า board ยังโหลดกลับมาได้ปกติ
- ตรวจว่าไม่มี action ไหนใน member flow ไปติด board-admin permission ผิดจุด

8. Negative regression checks

- User ที่ไม่อยู่ใน workspace ต้อง:
- เข้า board URL ตรงไม่ได้
- สร้าง/แก้/ลบ list หรือ card ผ่าน UI flow ไม่ได้ถ้าฝืนยิง request
- Member ต้อง:
- อ่าน board ได้
- ใช้งาน list/card ได้
- แต่แก้ชื่อหรือลบ board ไม่ได้
- Owner/Admin ต้องทำทุก flow ข้างต้นได้โดยไม่ regress

## Evidence To Record

เก็บหลักฐานอย่างน้อยดังนี้:

- ตารางผลลัพธ์ต่อ role: A / B / C / D
- สถานะของแต่ละหัวข้อ: Pass / Fail
- ข้อความ error ที่เจอจาก toast หรือ UI
- URL/board/workspace ที่ใช้ทดสอบ
- screenshot เฉพาะจุดที่ fail หรือ permission behavior สำคัญ

## Exit Criteria

ถือว่ารอบ manual verification นี้ผ่านเมื่อ:

- `owner` และ `admin` จัดการ board ได้
- `member` ใช้งาน board/list/card ได้ แต่จัดการ board ไม่ได้
- non-member เข้า board ของ workspace อื่นไม่ได้
- dashboard และ board page ไม่แสดงข้อมูลข้าม workspace
- flow `copyList` ไม่ทำให้ cards หลุด relation
- ไม่พบ regression สำคัญใน create/update/delete/reorder flow

## Assumptions

- รอบนี้ตรวจเฉพาะสิ่งที่มีอยู่แล้วใน codebase ตอนนี้
- ใช้ `/login`, `/signup`, `/dashboard`, `/board/[boardId]` เป็น entrypoints หลัก
- ถ้ายังไม่มี UI จัดการสมาชิก ให้เตรียม workspace membership จาก DB เพื่อ unblock manual verification
- ถ้า UI ยังไม่ซ่อน action ตาม role ให้ยึดผล server enforcement เป็นหลักในการตัดสินผ่าน/ไม่ผ่าน

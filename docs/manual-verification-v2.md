# Manual Verification Plan - Workspace V2 (RBAC)

ไฟล์นี้เป็น Task Checklist สำหรับการทดสอบ (Manual Verification) ระบบ Board และ Workspace ตาม Policy V2 โดยเน้นไปที่สิทธิ์ของ `owner`, `admin` และ `member`

## 📝 การเตรียมข้อมูล (Preparation)
- [x] Login ด้วย User ระดับ `System Admin` หรือ `System Manager`
- [x] ไปที่เมนูจัดการ Workspaces (เช่น `/app/workspaces`)
- [x] สร้าง Workspace ใหม่ (สมมติชื่อ "QA Workspace")
- [x] กำหนดให้ **User 1** เป็น `owner` ของ QA Workspace
- [ ] เพิ่ม **User 2** เป็น `admin` ของ QA Workspace
- [ ] เพิ่ม **User 3** เป็น `member` ของ QA Workspace
- [ ] สมัคร/เตรียม **User 4** ที่ไม่ได้อยู่ใน QA Workspace ไว้สำหรับทดสอบการเข้าถึง

---

## 👑 1. ทดสอบสิทธิ์ของ `owner` (User 1)
**เป้าหมาย:** owner ต้องทำได้ทุกอย่างใน Workspace รวมถึงการตั้งค่าและการจัดการระดับ Board

- [ ] **Login เป็น User 1** (`owner`)
- [ ] **สร้าง Board:** สร้าง Board ใหม่ได้อย่างน้อย 2 Boards
- [ ] **แก้ไข Board:** แก้ไขชื่อ Board ได้สำเร็จ
- [ ] **ลบ Board:** ลบ Board ออก 1 Board ได้สำเร็จ
- [ ] **การตั้งค่า Workspace:** เข้าถึงเมนู Workspace Settings ได้ (ถ้าเมนูนี้พร้อมใช้งาน) และสามารถจัดการกำหนดสมาชิกคนอื่นให้เป็น admin ได้
- [ ] **การจัดการ List/Card:**
  - [ ] สร้าง List ใหม่ (เช่น To Do, In Progress, Review, Done)
  - [ ] เปลี่ยน Role ของ List "Review" ให้เป็น `review`
  - [ ] เปลี่ยน Role ของ List "Done" ให้เป็น `done`
  - [ ] สร้าง Card ใหม่ และสามารถลากเปลี่ยน List ได้ปกติ
- [ ] **ฟีเจอร์ Review:**
  - [ ] เมื่อ Card ถูกย้ายมาที่ List `review`, สามารถทำการ "Review" (Approve/Reject) Card นั้นได้สำเร็จ

---

## 🛡️ 2. ทดสอบสิทธิ์ของ `admin` (User 2)
**เป้าหมาย:** admin ต้องจัดการ Board ได้เหมือน owner แต่ไม่สามารถยุ่งกับตั้งค่า Workspace ได้

- [ ] **Login เป็น User 2** (`admin`)
- [ ] **สร้าง Board:** สร้าง Board ใหม่ได้สำเร็จ
- [ ] **แก้ไข Board:** แก้ไขชื่อ Board ได้สำเร็จ
- [ ] **ลบ Board:** ลบ Board ได้สำเร็จ
- [ ] **การตั้งค่า Workspace:** ต้อง **ไม่สามารถ** เข้าถึง Workspace Settings ได้ หรือไม่มีสิทธิ์แก้ไขค่า
- [ ] **การจัดการ List/Card:**
  - [ ] สร้าง แก้ไข ลบ จัดเรียง List และ Card ได้ปกติ
- [ ] **ฟีเจอร์ Review:**
  - [ ] เมื่อ Card ถูกย้ายมาที่ List `review`, สามารถทำการ "Review" (Approve/Reject) Card นั้นได้สำเร็จ (ช่วย owner ทำงานได้)

---

## 👥 3. ทดสอบสิทธิ์ของ `member` (User 3)
**เป้าหมาย:** member สามารถทำงานภายใน Board (List/Card) ได้ แต่ไม่สามารถตั้งค่า Board หรือ Workspace ได้

- [ ] **Login เป็น User 3** (`member`)
- [ ] **เข้าถึง Board:** สามารถเปิดดู Board ใน QA Workspace ได้
- [ ] **สร้าง Board:** ต้อง **ไม่สามารถ** สร้าง Board ใหม่ได้ (ปุ่มซ่อนอยู่ หรือ API คืนค่า Error ถ้าฝืนยิง)
- [ ] **แก้ไข Board:** ต้อง **ไม่สามารถ** แก้ไขชื่อหรือข้อมูลของ Board ได้
- [ ] **ลบ Board:** ต้อง **ไม่สามารถ** ลบ Board ได้
- [ ] **การจัดการ List/Card:**
  - [ ] สร้าง แก้ไข ลบ List ได้สำเร็จ
  - [ ] สร้าง แก้ไข ลบ จัดเรียง Card ได้สำเร็จ
- [ ] **ข้อจำกัด List Role `review`:**
  - [ ] สามารถลาก Card เข้าไปใส่ใน List `review` ได้
  - [ ] ต้อง **ไม่สามารถ** กดทำการ "Review" Card ด้วยตนเองได้
  - [ ] ต้อง **ไม่สามารถ** ลาก Card ออกจาก List `review` ไปยัง List อื่นได้ **ถ้า Card นั้นยังไม่ได้รับการ Review** จาก `owner` หรือ `admin`

---

## 🚫 4. ทดสอบความปลอดภัยจากการเข้าถึงผิดวิธี (User 4)
**เป้าหมาย:** ตรวจสอบว่าผู้ที่ไม่มีสิทธิ์ จะไม่สามารถเข้าถึงข้อมูล Workspace และ Board ได้

- [ ] **Login เป็น User 4** (ไม่มีรายชื่อใน QA Workspace)
- [ ] **ดูผ่าน Dashboard:** ต้องไม่เห็น QA Workspace โผล่มาให้เลือก
- [ ] **การเข้าถึงโดยตรง:** ลอง Copy URL ของ Board ใน QA Workspace (จาก User 1-3) แล้วนำมาเปิด
  - [ ] ผลลัพธ์: ระบบต้องเตือนว่าไม่มีสิทธิ์เข้าถึง (Access Denied / 404 / 403) และหน้า Board จะต้องไม่แสดงข้อมูลใดๆ

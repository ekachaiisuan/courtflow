# Courtflow

Courtflow คือระบบจัดการงานภายในองค์กรในรูปแบบ Workflow Board ที่พัฒนาด้วย Next.js 16, Better Auth, tRPC, Drizzle และ Neon โดยแนวคิดหลักของระบบคือช่วยให้ผู้ใช้สามารถจัดการงานผ่านบอร์ด, ลิสต์ และการ์ดได้อย่างเป็นระเบียบ พร้อมมีระบบยืนยันตัวตน, ควบคุมสิทธิ์การเข้าถึง และบันทึกกิจกรรมสำคัญเพื่อให้ติดตามการเปลี่ยนแปลงได้ง่ายขึ้น

ปัจจุบันระบบอยู่ในช่วงที่สามารถใช้งาน flow หลักของ Trello-like board ได้จริงแล้ว โดยเฉพาะการสร้างและจัดการบอร์ด รวมถึงการลากวางและคัดลอกข้อมูลภายในบอร์ด

## ความสามารถของระบบในตอนนี้

### 1. ระบบยืนยันตัวตนและจัดการบัญชีผู้ใช้
- สมัครสมาชิกด้วยอีเมลและรหัสผ่าน
- ยืนยันอีเมลก่อนเข้าใช้งานระบบ
- เข้าสู่ระบบและออกจากระบบ
- ลืมรหัสผ่านและรีเซ็ตรหัสผ่านผ่านอีเมล
- เข้าสู่ระบบด้วย Social Login ผ่าน GitHub
- เปิดใช้งาน Two-Factor Authentication (2FA) แบบ TOTP
- ใช้ Backup Codes สำหรับเข้าระบบเมื่อไม่สามารถใช้แอปยืนยันตัวตนได้
- เปลี่ยนรหัสผ่านหรือส่งลิงก์ตั้งรหัสผ่านให้บัญชีที่สมัครผ่าน Social Login
- ดูรายการอุปกรณ์หรือ session ที่กำลังใช้งานอยู่
- ยกเลิก session อื่น ๆ หรือ revoke session รายตัวได้
- เชื่อมต่อและยกเลิกการเชื่อมต่อบัญชี Social Login จากหน้า Profile

### 2. ระบบสิทธิ์และการจัดการผู้ใช้
- ใช้แนวทาง RBAC (Role-Based Access Control)
- มี role หลักในระบบ ได้แก่ `user`, `officer`, `manager`, `admin`
- มีหน้า Admin สำหรับดูรายการผู้ใช้ในระบบ
- จัดการ role ของผู้ใช้จากหน้า Admin ได้
- การเข้าถึงหน้าที่สำคัญจะตรวจสอบ session และ permission จากฝั่ง server ก่อนเสมอ

### 3. ระบบ Workflow Board
- ผู้ใช้ที่ล็อกอินแล้วสามารถเข้าสู่หน้า Dashboard เพื่อดูบอร์ดของตัวเอง
- สร้าง board ใหม่ได้
- เปลี่ยนชื่อ board ได้
- ลบ board ได้
- แสดงรายการ board ของผู้ใช้ในมุมมองแบบ grid และ list

### 4. การจัดการลิสต์ภายในบอร์ด
- สร้าง list ภายใน board ได้
- เปลี่ยนชื่อ list ได้
- ลบ list ได้
- ลากวางเพื่อเรียงลำดับ list ใหม่ได้
- คัดลอก list ได้
- เมื่อคัดลอก list ระบบจะคัดลอก card ที่อยู่ภายใน list นั้นตาม workflow ที่มีอยู่ในระบบด้วย

### 5. การจัดการการ์ดภายในลิสต์
- สร้าง card ใหม่ได้
- แก้ไขชื่อและรายละเอียดของ card ได้
- ลบ card ได้
- คัดลอก card ได้
- ลากวางเพื่อเรียงลำดับ card ใหม่ได้
- ย้าย card ข้าม list ผ่าน drag and drop ได้
- เปิด modal เพื่อดูและแก้ไขรายละเอียดของ card ได้

### 6. Activity Log และการติดตามการเปลี่ยนแปลง
- ระบบมีการบันทึกกิจกรรมสำคัญของ board, list และ card เช่น create, update, delete
- แสดง activity log ในมุมมองของ board/card เพื่อช่วยติดตามความเคลื่อนไหวของงาน
- โครงสร้างข้อมูลรองรับการต่อยอดไปยัง approval flow, notification และ audit trail ที่ละเอียดขึ้นในอนาคต

## แนวทางด้านความปลอดภัย

### Authentication
- ใช้ Better Auth เป็นแหล่งข้อมูล session เพียงแหล่งเดียว
- protected page และ tRPC procedure จะอ่าน session จากฝั่ง server ก่อนเข้าถึงข้อมูลสำคัญ
- ต้องยืนยันอีเมลก่อนใช้งาน flow ที่ต้องพึ่งพาบัญชีผู้ใช้
- รองรับ 2FA เพื่อเพิ่มความปลอดภัยให้บัญชี

### Authorization
- ใช้ RBAC เพื่อกำหนดสิทธิ์การเข้าถึงตามบทบาทของผู้ใช้
- หน้าที่มีความสำคัญ เช่นหน้า Admin จะตรวจสอบ permission ก่อนแสดงข้อมูล
- การจัดการ board, list และ card ใช้การตรวจสอบ ownership ของเจ้าของบอร์ดก่อน mutation สำคัญ
- ไม่พึ่งพา client-side condition เป็น security layer หลัก

### API และ Abuse Protection
- ใช้ Arcjet ป้องกัน bot traffic บนเส้นทาง `/api/auth`
- มี rate limiting สำหรับ auth flows โดยเฉพาะ sign-up และ request ที่เกี่ยวข้อง
- ปฏิเสธการสมัครด้วย disposable email
- ลดโอกาส brute force และ spam ต่อ auth endpoint

### Data Validation และ Error Safety
- ใช้ Zod สำหรับตรวจสอบ input ของหลาย flow ก่อนทำ business logic
- ใช้ Drizzle ORM เพื่อให้การเข้าถึงฐานข้อมูลเป็นแบบ type-safe
- หลีกเลี่ยงการ expose internal error detail กลับไปยัง client โดยตรง
- ความสัมพันธ์ในฐานข้อมูลตั้งค่า cascade บางส่วนเพื่อช่วยรักษาความสอดคล้องของข้อมูลเมื่อมีการลบข้อมูลหลัก

## Tech Stack

- Frontend: Next.js 16, React 19, Shadcn UI, Tailwind CSS 4
- Authentication: Better Auth
- Security: Arcjet
- Backend / API: tRPC
- Database: PostgreSQL on Neon
- ORM: Drizzle ORM
- Form / Validation: React Hook Form + Zod
- State / UX: TanStack Query, Zustand
- Drag and Drop: Atlassian Pragmatic Drag and Drop
- Email: Resend + React Email

## โครงสร้างสำคัญของโปรเจกต์

- `app/` routes, layouts และ route handlers
- `app/dashboard` หน้าแสดงรายการบอร์ด
- `app/board/[boardId]` หน้าใช้งานบอร์ดแบบลากวาง
- `app/profile` จัดการข้อมูลบัญชี, session, 2FA และการเชื่อมบัญชี
- `app/admin` จัดการผู้ใช้และ role
- `trpc/server/routers` business logic ของ board, list, card และ page data
- `lib/auth.ts` และ `lib/permissions.ts` ศูนย์กลางของ auth และ RBAC
- `db/schema/` schema ของฐานข้อมูลผ่าน Drizzle

## การพัฒนาและรันโปรเจกต์

```bash
pnpm install
pnpm dev
```

คำสั่งที่ใช้บ่อย:

```bash
pnpm lint
pnpm build
pnpm start
pnpm exec drizzle-kit generate
pnpm exec drizzle-kit migrate
```

## สถานะปัจจุบันของระบบ

ตอนนี้ระบบมีแกนหลักของ Office Workflow Board ที่ใช้งานได้แล้ว ตั้งแต่การสมัครสมาชิก, ควบคุมสิทธิ์ผู้ใช้, การสร้างบอร์ด, การสร้างลิสต์/การ์ด, การลากวางเรียงลำดับ, การคัดลอกข้อมูล และการติดตาม activity log ภายในบอร์ด

ฟีเจอร์ระดับถัดไปที่ต่อยอดได้จากโครงสร้างปัจจุบัน ได้แก่ multi-workspace, notification, analytics dashboard, file attachment, approval workflow, search, export report และ AI summary

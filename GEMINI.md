# CourtFlow (better-auth-admin)

ระบบบริหารจัดการ (Administration) และการจัดตารางเวลา (Scheduling) ที่พัฒนาด้วย Next.js โดยเน้นความปลอดภัย (Security), Type-safety และประสบการณ์การพัฒนาที่ทันสมัย

## ภาพรวมโครงการ (Project Overview)

- **Core Framework:** Next.js 16 (App Router) ร่วมกับ React 19
- **Authentication:** ใช้งาน [Better-Auth](https://www.better-auth.com/)
  - ฟีเจอร์: Email/Password, GitHub Social Login, 2FA (TOTP/Backup codes), Session Caching
  - ติดตั้ง Admin plugin สำหรับการจัดการสิทธิ์ (Role-based management)
- **API & Type Safety:** ใช้งาน [tRPC](https://trpc.io/) เพื่อให้การสื่อสารระหว่าง Client และ Server เป็น Type-safe แบบ end-to-end
  - ใช้ `Superjson` สำหรับการจัดการข้อมูลประเภทที่ซับซ้อน (เช่น Dates)
- **Database:** [PostgreSQL](https://neon.tech/) จัดการผ่าน [Drizzle ORM](https://orm.drizzle.team/)
  - แยก Schema เป็นโมดูลภายใน `db/schema/`
- **Security:** [Arcjet](https://arcjet.com/) สำหรับทำ Rate limiting และ Bot protection (โดยเฉพาะในส่วนของ Signup และ Login)
- **UI & Styling:**
  - [Tailwind CSS v4](https://tailwindcss.com/) สำหรับการกำหนดสไตล์
  - [shadcn/ui](https://ui.shadcn.com/) สำหรับส่วนประกอบ UI ที่เข้าถึงง่าย (Accessible components)
  - `Sonner` สำหรับระบบแจ้งเตือน (Toast notifications)
- **Emails:** [Resend](https://resend.com/) พร้อมเทมเพลตที่สร้างด้วย [React Email](https://react.email/)

## สถาปัตยกรรมและโครงสร้างไดเรกทอรี (Architecture & Directory Structure)

- `app/`: หน้าเว็บและ Layouts ของ Next.js
  - `(auth)/`: เส้นทางที่เกี่ยวข้องกับการยืนยันตัวตน
  - `admin/`: แผงควบคุมผู้ดูแลระบบและการจัดการผู้ใช้
  - `api/auth/`: ตัวจัดการ Better-Auth
  - `api/trpc/`: จุดเชื่อมต่อ tRPC API
- `components/`: ส่วนประกอบ UI
  - `ui/`: shadcn/ui primitives
  - `forms/`: แบบฟอร์มการยืนยันตัวตนและการใช้งานแอปพลิเคชัน
  - `email/`: เทมเพลต React Email
- `db/`: การตั้งค่าฐานข้อมูลและ Drizzle schemas
  - `schema/auth.ts`: ตารางที่เกี่ยวข้องกับการยืนยันตัวตน
  - `schema/schedule.ts`: ตารางเกี่ยวกับโดเมนของแอปพลิเคชัน (Boards, Actions)
- `lib/`: ไลบรารีหลักและการตั้งค่าต่างๆ
  - `auth.ts`: การตั้งค่า Better-Auth ฝั่ง Server และ Plugin
  - `auth-client.ts`: อินสแตนซ์ Better-Auth ฝั่ง Client
  - `permissions.ts`: การกำหนด Role-Based Access Control (RBAC)
- `trpc/`: โครงสร้างพื้นฐานของ tRPC
  - `server/`: Routers, Procedures (base/protected), และ Context
  - `client/`: การตั้งค่า React Query และ tRPC client

## ข้อกำหนดการพัฒนา (Development Conventions)

- **API Procedures:**
  - ใช้ `baseProcedure` สำหรับเส้นทางสาธารณะ
  - ใช้ `protectedProcedure` สำหรับเส้นทางที่ต้องยืนยันตัวตน (จะมี `ctx.user` ให้ใช้งานโดยอัตโนมัติ)
- **RBAC:** สิทธิ์การใช้งานประกอบด้วย `user`, `officer`, `manager`, และ `admin` โดยกำหนดสิทธิ์ใน `lib/permissions.ts`
- **Database Changes:** เมื่อแก้ไข `db/schema/` ต้องใช้ `drizzle-kit` เพื่อทำการ Migration ทุกครั้ง
- **Client State:** ส่วนประกอบที่ต้องการบริบทของ tRPC หรือ React Query ต้องอยู่ภายใต้ `<Provider />` จาก `providers/index.tsx`

## คำสั่งที่สำคัญ (Key Commands)

### การพัฒนา (Development)
- `pnpm dev`: เริ่มเซิร์ฟเวอร์สำหรับการพัฒนา
- `pnpm lint`: ตรวจสอบคุณภาพโค้ดด้วย ESLint

### การสร้างและใช้งานจริง (Build & Production)
- `pnpm build`: คอมไพล์แอปพลิเคชันสำหรับการใช้งานจริง
- `pnpm start`: เริ่มเซิร์ฟเวอร์สำหรับการใช้งานจริง

### การจัดการฐานข้อมูล (Drizzle Kit)
- `pnpm drizzle-kit generate`: สร้างไฟล์ Migration เมื่อมีการเปลี่ยนแปลง Schema
- `pnpm drizzle-kit push`: อัปเดต Schema ไปยังฐานข้อมูลโดยตรง (เหมาะสำหรับการพัฒนาที่รวดเร็ว)
- `pnpm drizzle-kit studio`: เปิดหน้าเว็บสำหรับดูข้อมูลในฐานข้อมูล

## รายละเอียดการติดตั้งที่สำคัญ (Important Implementation Details)
- **Rate Limiting:** Arcjet ถูกตั้งค่าไว้เพื่อป้องกันการโจมตีแบบ Brute force ในส่วนของการยืนยันตัวตน
- **Session Optimization:** Better-Auth ใช้ Cookie cache เพื่อลดภาระการ Query ฐานข้อมูลในการตรวจสอบ Session
- **Email Verification:** บังคับใช้สำหรับการสมัครสมาชิกใหม่ จัดการผ่าน Resend

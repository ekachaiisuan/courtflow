## Core Framework & Rendering Strategy

Next.js 16 (App Router): โปรเจกต์ใช้โครงสร้าง App Router เป็นหลัก โดยยึดกฎ "Server-First" ตามที่ระบุใน AGENTS.md คือการใช้ Server Components เป็นค่าเริ่มต้น และใช้ use client เฉพาะส่วนที่เป็น Interactive UI เช่น ระบบ Drag and Drop หรือ Modal
Module Organization: มีการแบ่งโฟลเดอร์ชัดเจนตามหน้าที่ เช่น app/ สำหรับ Routing, components/ สำหรับ UI ที่ใช้ซ้ำได้ และ db/schema/ สำหรับนิยามฐานข้อมูล

## API & Data Flow (tRPC Layer)

End-to-End Type-safety: เลือกใช้ tRPC เป็นตัวกลางในการทำ Business Logic ซึ่งสอดคล้องกับแนวทางใน AGENTS.md ที่ห้าม Query Database จาก Client Component โดยตรง
Validation: ใช้ Zod ในการตรวจสอบความถูกต้องของข้อมูล (Input Validation) ก่อนที่จะประมวลผลหรือบันทึกลงฐานข้อมูล เพื่อลดความผิดพลาดและเพิ่มความปลอดภัย

## Authentication & Identity (Better Auth)

Single Source of Truth: ใช้ Better-Auth เป็นแหล่งข้อมูล Session เพียงแหล่งเดียวตามกฎเหล็กของโปรเจกต์
Server-Side Security: ระบบถูกตั้งค่าให้ตรวจสอบ Session ฝั่ง Server เสมอ (ผ่าน auth.ts และ Middleware) และรองรับฟีเจอร์ความปลอดภัยสมัยใหม่ เช่น 2FA และ Email Verification ผ่าน Resend

## Authorization (RBAC Strategy)

อ้างอิงจาก lib/permissions.ts:
Defined Roles: มีการแบ่งสิทธิ์ผู้ใช้เป็น 4 ระดับ: user, officer, manager, และ admin
Access Control: ใช้ createAccessControl จาก Better-Auth เพื่อกำหนด Statement ของสิทธิ์ เช่น ใครสามารถ create, read, update หรือ delete ในทรัพยากรประเภท project ได้บ้าง
Enforcement: กฎใน AGENTS.md บังคับให้ตรวจสอบสิทธิ์ใน 3 ระดับเสมอ คือ Server Components, Route Handlers และ Server Actions โดยห้ามพึ่งพาการเช็คฝั่ง UI เพียงอย่างเดียว

## Data Persistence (Drizzle ORM + Neon)

Type-safe Queries: ใช้ Drizzle ORM จัดการฐานข้อมูล PostgreSQL บน Neon แบบ Serverless
Modular Schema: มีการแยก Schema ออกเป็นส่วนๆ (เช่น auth.ts, schedule.ts) ภายใต้ db/schema/ และใช้ drizzle-kit ในการจัดการ Migration เพื่อให้โครงสร้างฐานข้อมูลตรงกับโค้ด TypeScript เสมอ

## Security Layer (Arcjet)

Abuse Protection: ใช้ Arcjet ทำหน้าที่เป็นปราการด่านหน้าในการทำ Rate Limiting และ Bot Protection โดยเฉพาะในจุดที่เสี่ยงต่อการถูกโจมตีอย่าง /api/auth และระบบสมัครสมาชิก

## Client-Side State & Interaction

Zustand: ใช้สำหรับจัดการ Client UI State ที่ไม่จำเป็นต้องเก็บลงฐานข้อมูล
Pragmatic Drag and Drop: ใช้ไลบรารีของ Atlassian เพื่อสร้างประสบการณ์ Trello Clone ที่ลื่นไหลและมีประสิทธิภาพสูง
TanStack Query: ทำงานร่วมกับ tRPC เพื่อจัดการ Caching และ Synchronization ของข้อมูลฝั่ง Server

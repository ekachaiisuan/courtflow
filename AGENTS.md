# Repository Guidelines
## Project Structure & Module Organization
นี่คือโปรเจกต์ Next.js 16 + TypeScript (App Router)
-	app/: ใช้สำหรับ routes, layouts และ API handlers (ตัวอย่างเช่น app/api/auth/[...all]/route.ts)
-	components/: reusable UI (components/ui/*) และ feature components (components/forms/*, components/email/*)
-	lib/, hooks/, server/: shared utilities, React hooks และ server-side helpers
-	db/schema/ และ migrations/: Drizzle schema และไฟล์ SQL migrations ที่ generate แล้ว
-	public/: static assets
ให้ใช้ alias @/* สำหรับ import (ตั้งค่าไว้ใน tsconfig.json)

# Build, Test และ Development Commands
ใช้ pnpm (lockfile: pnpm-lock.yaml)
-	pnpm install: ติดตั้ง dependencies
-	pnpm dev: รัน local development server
-	pnpm build: สร้าง production build
-	pnpm start: รัน production server
-	pnpm lint: รัน ESLint (Next.js core-web-vitals + TypeScript rules)
-	pnpm exec drizzle-kit generate: generate migration files ใหม่จาก schema changes
-	pnpm exec drizzle-kit migrate: apply migrations ไปยัง database ที่ตั้งค่าไว้

# Coding Style & Naming Conventions
-	ภาษา: ใช้ TypeScript และเปิด strict mode
-	Indentation: 2 spaces
-	ใช้ double quotes และ trailing commas ตามที่ formatter/linter กำหนด
-	Components: ใช้ PascalCase (เช่น UserRow.tsx)
-	form components using React Hook Form (ใช้ useForm และ Controller)
-	Route folders ใน app/ ควรเป็น lowercase และสื่อความหมายชัดเจน
-	Components ที่ใช้เฉพาะใน route ใด route หนึ่ง ให้ colocate ไว้ในโฟลเดอร์ _components/
-	ควรเขียน utilities ใน lib/ ให้เล็กและ composable
-	หลีกเลี่ยงการเขียน auth/permission logic ซ้ำซ้อน

# Testing Guidelines
ปัจจุบันยังไม่มี automated test runner อย่างเป็นทางการ
**ข้อกำหนดขั้นต่ำก่อน merge**:
 - รัน pnpm lint
 - ทดสอบ flow สำคัญด้วยตนเอง เช่น
/login, /signup, /profile, /admin
-	หากมี schema changes ให้รัน migrations ในเครื่อง และตรวจสอบหน้าหรือ API routes ที่ได้รับผลกระทบ
**หากเพิ่ม tests**:
 - วางไฟล์ไว้ใกล้ feature นั้น ๆ (*.test.ts[x]) หรือในโฟลเดอร์ __tests__/
 - เพิ่ม test command ไว้ใน package.json และอธิบายวิธีใช้งาน

# Commit & Pull Request Guidelines
จากประวัติที่ผ่านมา ใช้ commit message แบบสั้น กระชับ และเป็น imperative tense
ตัวอย่างเช่น:
-	setup admin
-	set Role
-	update schema
**แนวทางที่ควรปฏิบัติ**:
 - เขียน subject line ให้สั้น ใช้ present tense และโฟกัสเพียงหนึ่งการเปลี่ยนแปลง
**ใน PR ควรระบุ**:
 - วัตถุประสงค์ของการเปลี่ยนแปลง
 - ไฟล์สำคัญที่แก้ไข
 - การเปลี่ยนแปลงด้าน migration หรือ environment variables
 - แนบ UI screenshots หากมีการเปลี่ยนแปลงด้านหน้าตา
 - แนบลิงก์ issue/task ที่เกี่ยวข้อง
 - ระบุขั้นตอน manual verification ที่ reviewer สามารถทดสอบตามได้

## Architecture Rules
**General Architecture Principles**:
 - ใช้ Next.js 16 (App Router) เท่านั้น
 - Default เป็น Server Component
 - ใช้ "use client" เฉพาะเมื่อจำเป็นจริง ๆ (เช่น interactive UI, event handler)
 - ห้าม query database จาก Client Component
 - Business logic และ access control ต้องอยู่ฝั่ง server เท่านั้น
 - หลีกเลี่ยงการเขียน logic ซ้ำ โดยแยก reusable logic ไว้ใน lib/ หรือ server/

# Authentication (Better Auth)
- ใช้ Better Auth เป็นแหล่งข้อมูล session เพียงแหล่งเดียว
- ห้ามเช็ค auth logic ฝั่ง client อย่างเดียว
- การดึง session ต้องทำฝั่ง server ก่อนทุกครั้งที่มีการเข้าถึงข้อมูลสำคัญ
**หลีกเลี่ยงการ duplicate auth check ในหลายไฟล์ ให้สร้าง helper กลาง**:
 - requireAuth()
 - requireAdmin()

# Authorization (RBAC)
**ใช้แนวทาง RBAC (Role-Based Access Control) เท่านั้น**:
 - ทุก protected route หรือ server action ต้องมีการตรวจสอบ role
 - ห้ามพึ่งพา UI condition (if (role === "admin")) เพียงอย่างเดียว
**Permission check ต้องทำที่**:
 - Server Components
 - Route Handlers
 - Server Actions
- หลีกเลี่ยง hard-coded role string หลายที่ ควรมี role constants กลาง
**ตัวอย่างแนวคิด**:
 - requireRole("admin")
 - hasPermission(user, "manage_users")

# Database (Drizzle ORM + Neon)
- ใช้ Drizzle ORM สำหรับ database access เท่านั้น
- ห้ามใช้ raw SQL เว้นแต่จำเป็นจริง ๆ
- Schema definition ต้องอยู่ใน db/schema/
- ทุก schema change ใช้ npx drizzle-kit push
- ห้าม query database ใน Client Component
- Query ต้องเป็น type-safe และหลีกเลี่ยง any

# Server Actions
- ใช้ Server Actions สำหรับ form handling และ mutation logic
- Validation ควรทำก่อน execute business logic ด้วย Zod
**ทุก Server Action ที่แก้ไขข้อมูลสำคัญต้อง**:
 - ตรวจสอบ auth
 - ตรวจสอบ role/permission

# API Route Handlers
- ใช้ app/api/*/route.ts ตาม App Router convention
- Response ต้องชัดเจน และไม่ expose internal error detail โดยตรง
**ทุก endpoint ที่เกี่ยวข้องกับข้อมูลสำคัญต้อง**:
 - ตรวจสอบ auth
 - ตรวจสอบ role


# Access Control
- RBAC logic แยกไว้ใน lib/permissions.ts
- ห้าม import permission logic ไปใช้ใน Client Component
- UI สามารถใช้ role เพื่อแสดง/ซ่อนปุ่มได้ แต่ไม่ถือเป็น security layer

# Security Rules
- ห้ามส่ง sensitive data ไปยัง client โดยไม่จำเป็น
- ห้าม expose database structure หรือ internal error message
- ตรวจสอบ input ทุกครั้งก่อนเขียนลง database
- หลีกเลี่ยงการใช้ any ใน layer ที่เกี่ยวกับ auth และ database

# Performance & Best Practices
- ใช้ Server Component สำหรับ data fetching
- ใช้ caching อย่างเหมาะสมตาม Next.js App Router pattern
- หลีกเลี่ยง N+1 query
- แยก business logic ออกจาก UI component
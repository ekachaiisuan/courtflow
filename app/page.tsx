import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Blocks,
  ClipboardList,
  FolderKanban,
  LayoutGrid,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const capabilities = [
  {
    icon: ShieldCheck,
    title: "1. ระบบยืนยันตัวตนและจัดการบัญชีผู้ใช้",
    description:
      "รองรับการสมัครสมาชิก เข้าสู่ระบบ ยืนยันอีเมล รีเซ็ตรหัสผ่าน Social Login, 2FA และการจัดการ session เพื่อให้การเข้าถึงระบบมีความปลอดภัยและยืดหยุ่นมากขึ้น",
  },
  {
    icon: Users,
    title: "2. ระบบสิทธิ์และการจัดการผู้ใช้",
    description:
      "กำหนดสิทธิ์ด้วย RBAC ตามบทบาทของผู้ใช้งาน เช่น user, officer, manager และ admin พร้อมตรวจสอบ session และ permission จากฝั่ง server ก่อนเข้าถึงข้อมูลสำคัญ",
  },
  {
    icon: LayoutGrid,
    title: "3. ระบบ Workflow Board",
    description:
      "ช่วยให้ผู้ใช้งานสร้าง จัดการ และติดตามบอร์ดงานของตนเองได้ในมุมมองที่เข้าใจง่าย รองรับการจัดระเบียบงานในลักษณะ workflow board อย่างเป็นระบบ",
  },
  {
    icon: Blocks,
    title: "4. การจัดการลิสต์ภายในบอร์ด",
    description:
      "สร้าง แก้ไข ลบ จัดเรียง และคัดลอกลิสต์ภายในบอร์ดได้อย่างคล่องตัว ช่วยแบ่งขั้นตอนงานให้ชัดเจนและรองรับการปรับ workflow ตามการทำงานจริง",
  },
  {
    icon: ClipboardList,
    title: "5. การจัดการการ์ดภายในลิสต์",
    description:
      "รองรับการสร้าง แก้ไข ลบ คัดลอก และย้ายการ์ดข้ามลิสต์ด้วย drag and drop พร้อมดูรายละเอียดงานผ่าน modal เพื่อให้การติดตามงานทำได้สะดวกขึ้น",
  },
  {
    icon: FolderKanban,
    title: "6. Activity Log และการติดตามการเปลี่ยนแปลง",
    description:
      "บันทึกกิจกรรมสำคัญของ board, list และ card เพื่อช่วยตรวจสอบความเคลื่อนไหวของงานย้อนหลัง และเป็นฐานสำคัญสำหรับการต่อยอดด้าน audit trail ในอนาคต",
  },
];

const securityHighlights = [
  "ใช้ Better Auth เป็นศูนย์กลางของ session และตรวจสอบสิทธิ์จากฝั่ง server ก่อนเข้าถึงข้อมูลสำคัญ",
  "รองรับการยืนยันอีเมล, Two-Factor Authentication และการจัดการ session เพื่อเพิ่มความมั่นใจในการใช้งาน",
  "ควบคุมสิทธิ์ด้วย RBAC และไม่พึ่งพา client-side condition เป็น security layer หลัก",
  "ป้องกัน abuse บน auth flow ด้วย Arcjet, rate limiting และการคัดกรอง disposable email",
  "ตรวจสอบข้อมูลนำเข้าด้วย Zod และใช้ Drizzle ORM แบบ type-safe เพื่อลดความเสี่ยงของข้อมูลผิดพลาด",
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eef6ff_48%,#ffffff_100%)] text-foreground">
      <section className="relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.18),_transparent_45%),radial-gradient(circle_at_top_right,_rgba(16,185,129,0.16),_transparent_40%)]" />
        <div className="relative mx-auto flex max-w-7xl flex-col gap-12 px-6 py-20 md:px-10 lg:px-12 lg:py-28">
          <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-8">
              <Badge
                variant="outline"
                className="rounded-full border-blue-200 bg-white/80 px-4 py-1 text-blue-700 backdrop-blur"
              >
                <Sparkles className="size-3.5" />
                Courtflow Workflow Board
              </Badge>

              <div className="space-y-5">
                <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl lg:text-6xl">
                  ระบบจัดการงานภายในองค์กรที่ออกแบบมาเพื่อให้ทีมทำงานเป็นขั้นตอน
                  ติดตามง่าย และปลอดภัย
                </h1>
                <p className="max-w-3xl text-base leading-8 text-slate-600 md:text-lg">
                  Courtflow คือระบบบริหารงานในรูปแบบ Workflow Board ที่ช่วยจัดการงานผ่าน
                  board, list และ card อย่างเป็นระเบียบ เหมาะสำหรับการติดตามสถานะงานภายในหน่วยงาน
                  ลดความซ้ำซ้อนในการทำงาน และทำให้การประสานงานมีความชัดเจนมากขึ้น
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg" variant="primary" className="rounded-full px-6">
                  <Link href="/login">
                    เริ่มต้นใช้งาน
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded-full px-6">
                  <Link href="/dashboard">ดูหน้าระบบ</Link>
                </Button>
              </div>
            </div>

            <Card className="border-white/70 bg-white/80 shadow-xl shadow-blue-100/60 backdrop-blur">
              <CardHeader className="space-y-4">
                <Badge variant="secondary" className="w-fit rounded-full px-3 py-1">
                  ภาพรวมระบบ
                </Badge>
                <CardTitle className="text-2xl text-slate-950">
                  เครื่องมือกลางสำหรับบริหาร workflow ขององค์กร
                </CardTitle>
                <CardDescription className="text-sm leading-7 text-slate-600">
                  ระบบรองรับการจัดลำดับงาน การกำหนดสิทธิ์ตามบทบาท การติดตามประวัติการเปลี่ยนแปลง
                  และมาตรการด้านความปลอดภัยที่ช่วยให้ข้อมูลสำคัญอยู่ภายใต้การควบคุมอย่างเหมาะสม
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-500">แนวทางการทำงาน</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">
                    Workflow Board ที่เข้าใจง่าย
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-500">การควบคุมสิทธิ์</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">
                    RBAC และ server-side checks
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-500">การติดตามงาน</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">
                    Activity Log ตรวจสอบย้อนหลังได้
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-500">ความปลอดภัย</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">
                    Better Auth, 2FA, Arcjet
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-8 md:px-10 lg:px-12">
        <div className="mb-8 max-w-3xl space-y-3">
          <Badge variant="outline" className="rounded-full px-3 py-1">
            ความสามารถของระบบ
          </Badge>
          <h2 className="text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">
            ฟังก์ชันหลัก 6 ด้านที่ช่วยให้งานเป็นระบบมากขึ้น
          </h2>
          <p className="text-base leading-8 text-slate-600">
            สรุปเฉพาะภาพรวมของความสามารถหลักที่มีในระบบตามเอกสาร เพื่อให้เห็นภาพว่า Courtflow
            ช่วยจัดการงานภายในองค์กรอย่างไร
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {capabilities.map((item) => {
            const Icon = item.icon;

            return (
              <Card
                key={item.title}
                className="h-full border-slate-200 bg-white/85 shadow-sm shadow-slate-200/60 transition-transform duration-200 hover:-translate-y-1"
              >
                <CardHeader className="space-y-4">
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                    <Icon className="size-6" />
                  </div>
                  <CardTitle className="text-xl leading-8 text-slate-950">
                    {item.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-7 text-slate-600">{item.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 md:px-10 lg:px-12 lg:py-20">
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <Card className="border-slate-900 bg-slate-950 text-white shadow-xl shadow-slate-300/40">
            <CardHeader className="space-y-4">
              <Badge className="w-fit rounded-full bg-white/12 px-3 py-1 text-white">
                ความปลอดภัยของระบบ
              </Badge>
              <CardTitle className="flex items-center gap-3 text-3xl">
                <LockKeyhole className="size-7 text-emerald-300" />
                ออกแบบให้ความปลอดภัยเป็นส่วนหนึ่งของ workflow
              </CardTitle>
              <CardDescription className="leading-7 text-slate-300">
                Courtflow ให้ความสำคัญกับการยืนยันตัวตน การกำหนดสิทธิ์ การป้องกัน abuse
                และการตรวจสอบข้อมูลก่อนประมวลผล เพื่อให้ข้อมูลสำคัญขององค์กรได้รับการดูแลอย่างรัดกุม
              </CardDescription>
            </CardHeader>
          </Card>

          <div className="grid gap-4">
            {securityHighlights.map((item) => (
              <Card key={item} className="border-slate-200 bg-white/90 shadow-sm">
                <CardContent className="flex items-start gap-4 pt-6">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                    <BadgeCheck className="size-5" />
                  </div>
                  <p className="text-sm leading-7 text-slate-700">{item}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

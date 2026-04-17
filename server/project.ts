"use server"

import z from "zod"
const PROJECT_STATUSES = ["draft", "active", "finished"] as const
const projectSchema = z.object({
  name: z.string().min(3),
  status: z.enum(PROJECT_STATUSES),
  description: z.string().optional(),
  notifications: z.object({
    email: z.boolean(),
    sms: z.boolean(),
    push: z.boolean(),
  }),
  users: z
    .array(z.object({ email: z.email() }))
    .min(1)
    .max(5),
})

export async function createProject(unsafeData: unknown) {
  const data = projectSchema.safeParse(unsafeData)

  if (!data.success) return { success: false }

  // Save to DB

  return { success: true }
}
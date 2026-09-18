import { eq } from "drizzle-orm"
import { db, users } from "@/db"
import { hashPassword } from "@/lib/security"
import {
  ConflictError,
  createApiHandler,
  PERMISSIONS,
} from "@/server/core"
import { CreateLocalUserSchema } from "@/server/schemas/user.schema"

export const POST = createApiHandler({
  permissions: [PERMISSIONS.USER_CREATE],
  bodySchema: CreateLocalUserSchema,
  handler: async ({ body }) => {
    if (body.email) {
      const [existing] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, body.email.trim()))
        .limit(1)
      if (existing) {
        throw new ConflictError("Email đã được đăng ký trong hệ thống")
      }
    }

    const passwordHash = await hashPassword(body.password)

    const [created] = await db
      .insert(users)
      .values({
        fullName: body.fullName,
        email: body.email,
        passwordHash,
        systemRole: body.role || "USER",
        status: "ACTIVE",
        provider: "LOCAL",
      })
      .returning()

    return {
      data: created,
      message: "Tạo người dùng thành công",
    }
  },
})

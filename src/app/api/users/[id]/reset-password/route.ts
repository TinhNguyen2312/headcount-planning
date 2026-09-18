import { eq } from "drizzle-orm"
import { db, users } from "@/db"
import { hashPassword } from "@/lib/security"
import {
  createApiHandler,
  IdParamSchema,
  NotFoundError,
  PERMISSIONS,
} from "@/server/core"
import { ResetPasswordSchema } from "@/server/schemas/user.schema"

export const POST = createApiHandler({
  permissions: [PERMISSIONS.USER_RESET_PASSWORD],
  paramsSchema: IdParamSchema,
  bodySchema: ResetPasswordSchema,
  handler: async ({ params, body }) => {
    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, params.id))

    if (!existing) {
      throw new NotFoundError("Không tìm thấy người dùng")
    }

    const passwordHash = await hashPassword(body.newPassword)

    await db
      .update(users)
      .set({
        passwordHash,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(users.id, params.id))

    return {
      data: { message: "Đặt lại mật khẩu thành công" },
      message: "Đặt lại mật khẩu thành công",
    }
  },
})

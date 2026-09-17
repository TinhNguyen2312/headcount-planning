import type { NextRequest } from "next/server"
import { getCurrentUserFromSession } from "@/lib/session"
import type { users } from "@/db"
import { ForbiddenError, UnauthorizedError } from "./errors"

export type AuthenticatedUser = typeof users.$inferSelect

const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "JSESSIONID"

export async function getOptionalUser(
  req: NextRequest,
): Promise<AuthenticatedUser | null> {
  let sessionId = req.cookies?.get(SESSION_COOKIE_NAME)?.value

  if (!sessionId && req.headers?.get) {
    const rawCookie = req.headers.get("cookie")
    if (rawCookie) {
      const match = rawCookie.match(
        new RegExp(`(?:^|;\\s*)${SESSION_COOKIE_NAME}=([^;]+)`),
      )
      if (match) sessionId = decodeURIComponent(match[1])
    }
  }

  if (!sessionId) return null
  return await getCurrentUserFromSession(sessionId)
}

export async function requireAuth(
  req: NextRequest,
): Promise<AuthenticatedUser> {
  const user = await getOptionalUser(req)
  if (!user) {
    throw new UnauthorizedError("Vui lòng đăng nhập để tiếp tục")
  }
  return user
}

export function requireRoles(
  user: AuthenticatedUser,
  allowedRoles: string[],
): void {
  // SUPER_ADMIN luôn có toàn quyền
  if (user.systemRole === "SUPER_ADMIN") {
    return
  }

  if (!allowedRoles.includes(user.systemRole)) {
    throw new ForbiddenError(
      "Tài khoản không đủ quyền truy cập tính năng này",
    )
  }
}

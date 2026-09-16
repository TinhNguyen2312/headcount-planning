import { NextRequest } from "next/server"
import { apiSuccess } from "@/lib/apiResponse"
import { deleteSession } from "@/lib/session"

const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "JSESSIONID"

export async function POST(req: NextRequest) {
  const sessionId = req.cookies.get(SESSION_COOKIE_NAME)?.value
  if (sessionId) {
    await deleteSession(sessionId)
  }

  const response = apiSuccess(
    { message: "Đăng xuất thành công" },
    "Đăng xuất thành công",
  )
  response.cookies.delete(SESSION_COOKIE_NAME)
  return response
}

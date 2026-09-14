import crypto from "crypto"
import { eq, and, gt, lt } from "drizzle-orm"
import { db, sessions, users } from "@/db"

const SESSION_EXPIRE_MINUTES = parseInt(
  process.env.SESSION_EXPIRE_MINUTES || "480",
  10,
)

export async function createSession(userId: number) {
  const sessionId = crypto.randomBytes(32).toString("base64url")
  const expiresAt = new Date(Date.now() + SESSION_EXPIRE_MINUTES * 60 * 1000)

  const [session] = await db
    .insert(sessions)
    .values({
      id: sessionId,
      userId,
      expiresAt: expiresAt.toISOString(),
      createdAt: new Date().toISOString(),
    })
    .returning()

  return session
}

export async function getValidSession(sessionId: string) {
  if (!sessionId) return null

  const now = new Date().toISOString()
  const [session] = await db
    .select()
    .from(sessions)
    .where(eq(sessions.id, sessionId))

  if (!session) return null

  if (session.expiresAt && new Date(session.expiresAt).getTime() < Date.now()) {
    await db.delete(sessions).where(eq(sessions.id, sessionId))
    return null
  }

  return session
}

export async function touchSession(sessionId: string) {
  const expiresAt = new Date(Date.now() + SESSION_EXPIRE_MINUTES * 60 * 1000)
  await db
    .update(sessions)
    .set({ expiresAt: expiresAt.toISOString() })
    .where(eq(sessions.id, sessionId))
}

export async function deleteSession(sessionId: string) {
  if (!sessionId) return
  await db.delete(sessions).where(eq(sessions.id, sessionId))
}

export async function getCurrentUserFromSession(sessionId?: string) {
  if (!sessionId) return null

  const session = await getValidSession(sessionId)
  if (!session) return null

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.userId))

  if (!user || user.status !== "ACTIVE") return null

  return user
}

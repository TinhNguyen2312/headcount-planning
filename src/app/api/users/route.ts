import {
  asc,
  count,
  desc,
  eq,
  ilike,
  or,
  type SQL,
} from "drizzle-orm"
import { db, roles, users } from "@/db"
import { hashPassword } from "@/lib/security"
import {
  ConflictError,
  createApiHandler,
  createPaginationMeta,
  PERMISSIONS,
} from "@/server/core"
import {
  CreateUserSchema,
  QueryUserSchema,
} from "@/server/schemas/user.schema"
import {
  buildProjectsSubquery,
  formatUserRow,
  managers,
} from "./user.helper"

export const GET = createApiHandler({
  permissions: [PERMISSIONS.USER_VIEW],
  querySchema: QueryUserSchema,
  handler: async ({ query }) => {
    const page = query.page ?? 0
    const limit = Math.min(200, query.limit ?? 100)
    const offset = page * limit
    const order = query.order === "desc" ? "desc" : "asc"

    const conditions: SQL[] = []

    if (query.status) {
      conditions.push(eq(users.status, query.status))
    }
    if (query.role) {
      conditions.push(eq(users.systemRole, query.role))
    }
    if (query.provider) {
      conditions.push(eq(users.provider, query.provider))
    }

    const keyword = query.keyword || query.fullName
    if (keyword) {
      const kw = or(
        ilike(users.fullName, `%${keyword}%`),
        ilike(users.email, `%${keyword}%`),
        ilike(users.phone, `%${keyword}%`),
        ilike(users.perNumber, `%${keyword}%`),
      )
      if (kw) conditions.push(kw)
    }

    const whereClause = conditions.length > 0 ? or(...conditions) : undefined

    const [{ value: total }] = await db
      .select({ value: count() })
      .from(users)
      .where(whereClause)

    const userRows = await db
      .select({
        user: users,
        role: roles,
        manager: managers,
        projects: buildProjectsSubquery(),
      })
      .from(users)
      .leftJoin(roles, eq(users.roleId, roles.id))
      .leftJoin(managers, eq(users.managerPerNumber, managers.perNumber))
      .where(whereClause)
      .orderBy(order === "desc" ? desc(users.id) : asc(users.id))
      .offset(offset)
      .limit(limit)

    return {
      data: userRows.map(formatUserRow),
      message: "Thành công",
      meta: createPaginationMeta(page, limit, Number(total)),
    }
  },
})

export const POST = createApiHandler({
  permissions: [PERMISSIONS.USER_CREATE],
  bodySchema: CreateUserSchema,
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

    if (body.phone) {
      const [existing] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.phone, body.phone.trim()))
        .limit(1)
      if (existing) {
        throw new ConflictError("Số điện thoại đã được đăng ký trong hệ thống")
      }
    }

    if (body.perNumber) {
      const [existing] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.perNumber, body.perNumber.trim()))
        .limit(1)
      if (existing) {
        throw new ConflictError("Mã nhân viên (perNumber) đã tồn tại")
      }
    }

    const passwordHash = await hashPassword(body.password)

    const [created] = await db
      .insert(users)
      .values({
        status: "ACTIVE",
        provider: "LOCAL",
        ...body,
        passwordHash,
      })
      .returning()

    return {
      data: created,
      message: "Tạo người dùng thành công",
    }
  },
})

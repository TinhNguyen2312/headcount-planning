import { NextRequest } from "next/server"
import {
  ilike,
  or,
  count,
  desc,
  asc,
  eq,
  and,
  inArray,
  type SQL,
} from "drizzle-orm"
import { db, users, roles, userProjects, projects, departments } from "@/db"
import { getCurrentUserFromSession } from "@/lib/session"
import { hashPassword } from "@/lib/security"
import { apiError, apiSuccess, createPaginationMeta } from "@/lib/apiResponse"
import { getUserProjectSummaries } from "@/lib/userHelpers"

const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "JSESSIONID"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const keyword =
      searchParams.get("keyword") || searchParams.get("fullName") || ""
    const status = searchParams.get("status")
    const role = searchParams.get("role")
    const provider = searchParams.get("provider")
    const departmentIdParam = searchParams.get("departmentId")
    const departmentId = departmentIdParam
      ? parseInt(departmentIdParam, 10)
      : undefined
    const projectIdParam = searchParams.get("projectId")
    const projectId = projectIdParam ? parseInt(projectIdParam, 10) : undefined
    const page = parseInt(searchParams.get("page") || "0", 10)
    const limit = Math.min(
      200,
      parseInt(searchParams.get("limit") || "100", 10),
    )
    const order =
      searchParams.get("order")?.toLowerCase() === "desc" ? "desc" : "asc"

    const conditions: SQL[] = []
    if (status) conditions.push(eq(users.status, status))
    if (role) conditions.push(eq(users.systemRole, role))
    if (provider) conditions.push(eq(users.provider, provider))
    if (keyword) {
      const kw = or(
        ilike(users.fullName, `%${keyword}%`),
        ilike(users.email, `%${keyword}%`),
        ilike(users.phone, `%${keyword}%`),
        ilike(users.perNumber, `%${keyword}%`),
      )
      if (kw) conditions.push(kw)
    }

    if (departmentId !== undefined && !isNaN(departmentId)) {
      // Find role ids in this department
      const deptRoles = await db
        .select({ id: roles.id })
        .from(roles)
        .where(eq(roles.departmentId, departmentId))
      const roleIds = deptRoles.map((r) => r.id)
      if (roleIds.length > 0) {
        conditions.push(inArray(users.roleId, roleIds))
      } else {
        return apiSuccess(
          [],
          "Thành công",
          createPaginationMeta(page, limit, 0),
        )
      }
    }

    if (projectId !== undefined && !isNaN(projectId)) {
      // Find user ids in this project
      const upRows = await db
        .select({ userId: userProjects.userId })
        .from(userProjects)
        .where(
          and(
            eq(userProjects.projectId, projectId),
            eq(userProjects.status, "ACTIVE"),
          ),
        )
      const uids = upRows.map((u) => u.userId)
      if (uids.length > 0) {
        conditions.push(inArray(users.id, uids))
      } else {
        return apiSuccess(
          [],
          "Thành công",
          createPaginationMeta(page, limit, 0),
        )
      }
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined

    const [{ value: total }] = await db
      .select({ value: count() })
      .from(users)
      .where(whereClause)

    const userList = await db
      .select()
      .from(users)
      .where(whereClause)
      .orderBy(order === "desc" ? desc(users.id) : asc(users.id))
      .offset(page * limit)
      .limit(limit)

    // Resolve role names and manager names
    const roleMap = new Map<number, string>()
    const allRoles = await db.select().from(roles)
    allRoles.forEach((r) => roleMap.set(r.id, r.name))

    const mgrMap = new Map<string, string>()
    const allMgrs = await db
      .select({ perNumber: users.perNumber, fullName: users.fullName })
      .from(users)
    allMgrs.forEach((m) => {
      if (m.perNumber) mgrMap.set(m.perNumber, m.fullName)
    })

    const result = await Promise.all(
      userList.map(async (u) => {
        const pSummaries = await getUserProjectSummaries(u.id)
        return {
          id: u.id,
          fullName: u.fullName,
          phone: u.phone,
          email: u.email,
          status: u.status,
          roleId: u.roleId,
          systemRole: u.systemRole,
          perNumber: u.perNumber,
          novatorStatus: u.novatorStatus,
          departmentCode: u.departmentCode,
          divisionCode: u.divisionCode,
          managerPerNumber: u.managerPerNumber,
          provider: u.provider,
          azureOid: u.azureOid,
          lastLoginAt: u.lastLoginAt,
          updatedAt: u.updatedAt,
          createdAt: u.createdAt,
          roleName: u.roleId ? roleMap.get(u.roleId) || null : null,
          managerName: u.managerPerNumber
            ? mgrMap.get(u.managerPerNumber) || null
            : null,
          projects: pSummaries,
        }
      }),
    )

    return apiSuccess(
      result,
      "Thành công",
      createPaginationMeta(page, limit, Number(total)),
    )
  } catch (error) {
    console.error("Get users error:", error)
    return apiError("Lỗi lấy danh sách người dùng", 500)
  }
}

export async function POST(req: NextRequest) {
  try {
    const sessionId = req.cookies.get(SESSION_COOKIE_NAME)?.value
    const currentUser = await getCurrentUserFromSession(sessionId)
    if (!currentUser) return apiError("Chưa đăng nhập", 401, 401)

    const body = await req.json()
    const {
      fullName,
      email,
      phone,
      password,
      roleId,
      systemRole,
      perNumber,
      managerPerNumber,
    } = body

    if (!fullName || !fullName.trim())
      return apiError("Họ và tên không được để trống", 422)
    if (!password || password.length < 6)
      return apiError("Mật khẩu phải có ít nhất 6 ký tự", 422)

    if (email && email.trim()) {
      const [existing] = await db
        .select()
        .from(users)
        .where(eq(users.email, email.trim()))
      if (existing) return apiError("Email đã được đăng ký trong hệ thống", 409)
    }

    if (phone && phone.trim()) {
      const [existing] = await db
        .select()
        .from(users)
        .where(eq(users.phone, phone.trim()))
      if (existing)
        return apiError("Số điện thoại đã được đăng ký trong hệ thống", 409)
    }

    if (perNumber && perNumber.trim()) {
      const [existing] = await db
        .select()
        .from(users)
        .where(eq(users.perNumber, perNumber.trim()))
      if (existing)
        return apiError("Mã nhân viên đã tồn tại trong hệ thống", 409)
    }

    const passwordHash = await hashPassword(password)

    const [created] = await db
      .insert(users)
      .values({
        fullName: fullName.trim(),
        email: email ? email.trim() : null,
        phone: phone ? phone.trim() : null,
        passwordHash,
        roleId: roleId || null,
        systemRole: systemRole || "USER",
        perNumber: perNumber ? perNumber.trim() : null,
        managerPerNumber: managerPerNumber ? managerPerNumber.trim() : null,
        status: "ACTIVE",
        provider: "LOCAL",
      })
      .returning()

    return apiSuccess(created, "Tạo người dùng thành công")
  } catch (error) {
    console.error("Create user error:", error)
    return apiError("Lỗi tạo người dùng", 500)
  }
}

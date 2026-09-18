import {
  and,
  asc,
  count,
  desc,
  eq,
  ilike,
  or,
  type SQL,
  sql,
} from "drizzle-orm"
import { db, departments, roles, userProjects, users } from "@/db"
import { calculatePagination } from "@/server/core/pagination"
import type {
  CreateRoleInput,
  QueryRoleInput,
  UpdateRoleInput,
} from "./role.schema"

const formatRoleRow = (row: {
  role: typeof roles.$inferSelect
  department: typeof departments.$inferSelect | null
}) => ({
  role: {
    ...row.role,
    department: row.department,
  },
})

export class RoleRepository {
  static async findManyAndCount(query: QueryRoleInput) {
    const { page, limit, offset } = calculatePagination(query.page, query.limit)
    const order = query.order === "asc" ? "asc" : "desc"

    const conditions: SQL[] = []

    if (query.departmentId !== undefined && !isNaN(query.departmentId)) {
      conditions.push(eq(roles.departmentId, query.departmentId))
    }

    if (query.parentRoleId !== undefined && !isNaN(query.parentRoleId)) {
      conditions.push(eq(roles.parentRoleId, query.parentRoleId))
    }

    if (query.planningMethod) {
      conditions.push(eq(roles.planningMethod, query.planningMethod))
    }

    if (query.keyword) {
      const kw = or(
        ilike(roles.name, `%${query.keyword}%`),
        ilike(roles.shortCode, `%${query.keyword}%`),
        ilike(roles.code, `%${query.keyword}%`),
      )
      if (kw) conditions.push(kw)
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined

    const [{ value: total }] = await db
      .select({ value: count() })
      .from(roles)
      .where(whereClause)

    const rows = await db
      .select({
        role: roles,
        department: departments,
      })
      .from(roles)
      .leftJoin(departments, eq(roles.departmentId, departments.id))
      .where(whereClause)
      .orderBy(order === "asc" ? asc(roles.id) : desc(roles.id))
      .offset(offset)
      .limit(limit)

    return {
      rows: rows.map(formatRoleRow),
      total: Number(total),
      page,
      limit,
    }
  }

  static async findById(id: number) {
    const [row] = await db
      .select({
        role: roles,
        department: departments,
      })
      .from(roles)
      .leftJoin(departments, eq(roles.departmentId, departments.id))
      .where(eq(roles.id, id))

    return row ? formatRoleRow(row) : null
  }

  static async findByCode(code: string) {
    const [role] = await db
      .select()
      .from(roles)
      .where(eq(roles.code, code))
    return role || null
  }

  static async getTree(departmentId?: number) {
    const rows = await db
      .select({
        role: roles,
        department: departments,
      })
      .from(roles)
      .leftJoin(departments, eq(roles.departmentId, departments.id))
      .where(departmentId ? eq(roles.departmentId, departmentId) : undefined)
      .orderBy(asc(roles.level), asc(roles.name))

    const map = new Map<number, any>()
    const roots: any[] = []

    for (const r of rows) {
      map.set(r.role.id, {
        ...r.role,
        department: r.department,
        children: [],
      })
    }

    for (const r of rows) {
      const node = map.get(r.role.id)!
      if (r.role.parentRoleId && map.has(r.role.parentRoleId)) {
        map.get(r.role.parentRoleId)!.children.push(node)
      } else {
        roots.push(node)
      }
    }

    return roots
  }

  static async hasChildRoles(id: number): Promise<boolean> {
    const [child] = await db
      .select({ id: roles.id })
      .from(roles)
      .where(eq(roles.parentRoleId, id))
      .limit(1)
    return Boolean(child)
  }

  static async hasAssignedUsers(id: number): Promise<boolean> {
    const [user] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.roleId, id))
      .limit(1)
    return Boolean(user)
  }

  static async hasAssignedProjects(id: number): Promise<boolean> {
    const [up] = await db
      .select({ id: userProjects.id })
      .from(userProjects)
      .where(eq(userProjects.roleId, id))
      .limit(1)
    return Boolean(up)
  }

  static async getAncestorIds(roleId: number): Promise<number[]> {
    const query = sql`
      WITH RECURSIVE role_ancestors AS (
        SELECT id, parent_role_id FROM roles WHERE id = ${roleId}
        UNION
        SELECT r.id, r.parent_role_id FROM roles r
        INNER JOIN role_ancestors ra ON r.id = ra.parent_role_id
      )
      SELECT id FROM role_ancestors WHERE id != ${roleId}
    `
    const result = await db.execute<{ id: number }>(query)
    return (result as unknown as Array<{ id: number }>).map((r) => Number(r.id))
  }

  static async create(input: CreateRoleInput) {
    const [created] = await db.insert(roles).values(input).returning()
    return created
  }

  static async update(id: number, input: UpdateRoleInput) {
    const [updated] = await db
      .update(roles)
      .set(input)
      .where(eq(roles.id, id))
      .returning()
    return updated || null
  }

  static async delete(id: number) {
    await db.delete(roles).where(eq(roles.id, id))
  }
}

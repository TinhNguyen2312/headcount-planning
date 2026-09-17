import { and, asc, count, desc, eq, type SQL } from "drizzle-orm"
import { alias } from "drizzle-orm/pg-core"
import {
  accessRoles,
  db,
  departments,
  projects,
  roles,
  userProjects,
  users,
} from "@/db"
import { calculatePagination } from "@/server/core/pagination"
import type {
  AssignReplacementInput,
  CreateUserProjectRoleInput,
  QueryUserProjectRoleInput,
  UpdateUserProjectRoleInput,
} from "./user-project-role.schema"

const repUsers = alias(users, "repUsers")

const formatUserProjectRoleRow = (row) => ({
  userProject: {
    ...row.userProject,
    project: row.project,
    role: row.role,
    department: row.department,
    accessRole: row.accessRole,
    user: row.user,
    replacementUser: row.replacementUser,
  },
})

export class UserProjectRoleRepository {
  static async findManyAndCount(query: QueryUserProjectRoleInput) {
    const { page, limit, offset } = calculatePagination(query.page, query.limit)
    const order = query.order === "asc" ? "asc" : "desc"

    const conditions: SQL[] = []

    if (query.userId !== undefined && !isNaN(query.userId)) {
      conditions.push(eq(userProjects.userId, query.userId))
    }
    if (query.projectId !== undefined && !isNaN(query.projectId)) {
      conditions.push(eq(userProjects.projectId, query.projectId))
    }
    if (query.roleId !== undefined && !isNaN(query.roleId)) {
      conditions.push(eq(userProjects.roleId, query.roleId))
    }
    if (query.status) {
      conditions.push(eq(userProjects.status, query.status))
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined

    const [{ value: total }] = await db
      .select({ value: count() })
      .from(userProjects)
      .where(whereClause)

    const rows = await db
      .select({
        userProject: userProjects,
        project: projects,
        role: roles,
        department: departments,
        accessRole: accessRoles,
        user: users,
        replacementUser: repUsers,
      })
      .from(userProjects)
      .leftJoin(projects, eq(userProjects.projectId, projects.id))
      .leftJoin(roles, eq(userProjects.roleId, roles.id))
      .leftJoin(departments, eq(roles.departmentId, departments.id))
      .leftJoin(accessRoles, eq(userProjects.accessRoleId, accessRoles.id))
      .leftJoin(users, eq(userProjects.userId, users.id))
      .leftJoin(repUsers, eq(userProjects.replacementUserId, repUsers.id))
      .where(whereClause)
      .orderBy(order === "asc" ? asc(userProjects.id) : desc(userProjects.id))
      .offset(offset)
      .limit(limit)

    return {
      rows: rows.map(formatUserProjectRoleRow),
      total: Number(total),
      page,
      limit,
    }
  }

  static async findById(id: number) {
    const [row] = await db
      .select({
        userProject: userProjects,
        project: projects,
        role: roles,
        department: departments,
        accessRole: accessRoles,
        user: users,
        replacementUser: repUsers,
      })
      .from(userProjects)
      .leftJoin(projects, eq(userProjects.projectId, projects.id))
      .leftJoin(roles, eq(userProjects.roleId, roles.id))
      .leftJoin(departments, eq(roles.departmentId, departments.id))
      .leftJoin(accessRoles, eq(userProjects.accessRoleId, accessRoles.id))
      .leftJoin(users, eq(userProjects.userId, users.id))
      .leftJoin(repUsers, eq(userProjects.replacementUserId, repUsers.id))
      .where(eq(userProjects.id, id))

    return row ? formatUserProjectRoleRow(row) : null
  }

  static async create(input: CreateUserProjectRoleInput) {
    const [created] = await db
      .insert(userProjects)
      .values({
        effectiveFrom: new Date().toISOString().split("T")[0],
        ...input,
        status: input.status || "ACTIVE",
      })
      .returning()

    if (!created) return null
    return await this.findById(created.id)
  }

  static async update(id: number, input: UpdateUserProjectRoleInput) {
    const [updated] = await db
      .update(userProjects)
      .set({
        ...input,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(userProjects.id, id))
      .returning()

    if (!updated) return null
    return await this.findById(id)
  }

  static async delete(id: number) {
    const [deleted] = await db
      .delete(userProjects)
      .where(eq(userProjects.id, id))
      .returning()

    return deleted || null
  }

  static async assignReplacement(id: number, input: AssignReplacementInput) {
    const [updated] = await db
      .update(userProjects)
      .set({
        replacementUserId: input.replacementUserId,
        replacementFrom:
          input.replacementFrom || new Date().toISOString().split("T")[0],
        replacementTo: input.replacementTo || null,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(userProjects.id, id))
      .returning()

    if (!updated) return null
    return await this.findById(id)
  }

  static async cancelReplacement(id: number) {
    const [updated] = await db
      .update(userProjects)
      .set({
        replacementUserId: null,
        replacementFrom: null,
        replacementTo: null,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(userProjects.id, id))
      .returning()

    if (!updated) return null
    return await this.findById(id)
  }
}

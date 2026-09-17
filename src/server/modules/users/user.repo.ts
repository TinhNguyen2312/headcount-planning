import {
  and,
  asc,
  count,
  desc,
  eq,
  ilike,
  inArray,
  or,
  type SQL,
  sql,
} from "drizzle-orm"
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
  AssignProjectRoleInput,
  CreateUserInput,
  QueryUserInput,
  QueryUserTreeInput,
  UpdateUserInput,
} from "./user.schema"

const managers = alias(users, "managers")
const repUsers = alias(users, "repUsers")
const buildProjectsSubquery = () => sql<any[]>`COALESCE(
  (
    SELECT json_agg(
      json_build_object(
        'id', up.id,
        'userId', up.user_id,
        'projectId', up.project_id,
        'roleId', up.role_id,
        'accessRoleId', up.access_role_id,
        'status', up.status,
        'project', row_to_json(p.*),
        'role', row_to_json(pr.*),
        'department', row_to_json(pd.*),
        'accessRole', row_to_json(par.*)
      )
    )
    FROM user_projects up
    INNER JOIN projects p ON up.project_id = p.id
    INNER JOIN roles pr ON up.role_id = pr.id
    LEFT JOIN departments pd ON pr.department_id = pd.id
    LEFT JOIN access_roles par ON up.access_role_id = par.id
    WHERE up.user_id = ${users.id} AND up.status = 'ACTIVE'
  ),
  '[]'::json
)`

const formatUserRow = (row: any) => {
  const { passwordHash: _, ...rest } = row.user

  return {
    user: {
      ...rest,
      role: row.role,
      manager: row.manager,
      projects: row.projects,
    },
  }
}

export class UserRepository {
  static async findManyAndCount(query: QueryUserInput) {
    const { page, limit, offset } = calculatePagination(query.page, query.limit)
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

    if (query.departmentId !== undefined && !isNaN(query.departmentId)) {
      const deptRoles = await db
        .select({ id: roles.id })
        .from(roles)
        .where(eq(roles.departmentId, query.departmentId))
      const roleIds = deptRoles.map((r) => r.id)
      if (roleIds.length > 0) {
        conditions.push(inArray(users.roleId, roleIds))
      } else {
        return { rows: [], total: 0, page, limit }
      }
    }

    if (query.projectId !== undefined && !isNaN(query.projectId)) {
      const upRows = await db
        .select({ userId: userProjects.userId })
        .from(userProjects)
        .where(
          and(
            eq(userProjects.projectId, query.projectId),
            eq(userProjects.status, "ACTIVE"),
          ),
        )
      const uids = upRows.map((u) => u.userId)
      if (uids.length > 0) {
        conditions.push(inArray(users.id, uids))
      } else {
        return { rows: [], total: 0, page, limit }
      }
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined

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
      rows: userRows.map(formatUserRow),
      total: Number(total),
      page,
      limit,
    }
  }

  static async findById(id: number) {
    const [row] = await db
      .select({
        user: users,
        role: roles,
        manager: managers,
        projects: buildProjectsSubquery(),
      })
      .from(users)
      .leftJoin(roles, eq(users.roleId, roles.id))
      .leftJoin(managers, eq(users.managerPerNumber, managers.perNumber))
      .where(eq(users.id, id))

    if (!row) return null
    return formatUserRow(row)
  }

  static async findByEmail(email: string) {
    const [user] = await db
      .select({ id: users.id, email: users.email })
      .from(users)
      .where(eq(users.email, email))
    return user || null
  }

  static async findByPerNumber(perNumber: string) {
    const [user] = await db
      .select({ id: users.id, perNumber: users.perNumber })
      .from(users)
      .where(eq(users.perNumber, perNumber))
    return user || null
  }

  static async create(input: CreateUserInput & { passwordHash: string }) {
    const [created] = await db
      .insert(users)
      .values({
        status: "ACTIVE",
        provider: "LOCAL",
        ...input,
      })
      .returning()

    return created || null
  }

  static async update(id: number, input: UpdateUserInput) {
    const [updated] = await db
      .update(users)
      .set({
        ...input,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(users.id, id))
      .returning()

    if (!updated) return null
    return await this.findById(id)
  }

  static async updatePassword(id: number, passwordHash: string) {
    await db
      .update(users)
      .set({
        passwordHash,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(users.id, id))
  }

  static async updateRole(
    id: number,
    systemRole?: string,
    roleId?: number | null,
  ) {
    await db
      .update(users)
      .set({
        ...(systemRole !== undefined && { systemRole }),
        ...(roleId !== undefined && { roleId }),
        updatedAt: new Date().toISOString(),
      })
      .where(eq(users.id, id))

    return await this.findById(id)
  }

  static async toggleBlock(id: number) {
    const [user] = await db
      .select({ id: users.id, status: users.status })
      .from(users)
      .where(eq(users.id, id))

    if (!user) return null

    const newStatus = user.status === "LOCKED" ? "ACTIVE" : "LOCKED"

    await db
      .update(users)
      .set({
        status: newStatus,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(users.id, id))

    return {
      user: await this.findById(id),
      newStatus,
    }
  }

  static async delete(id: number) {
    const [deleted] = await db
      .delete(users)
      .where(eq(users.id, id))
      .returning()
    return deleted || null
  }

  static async getProjectRoles(userId: number) {
    return await db
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
      .where(eq(userProjects.userId, userId))
  }

  static async assignProjectRole(
    userId: number,
    input: AssignProjectRoleInput,
  ) {
    const [created] = await db
      .insert(userProjects)
      .values({
        effectiveFrom: new Date().toISOString().split("T")[0],
        ...input,
        userId,
        status: input.status || "ACTIVE",
      })
      .returning()

    return created
  }

  static async getTree(query: QueryUserTreeInput) {
    const conditions: SQL[] = []
    if (query.status) conditions.push(eq(users.status, query.status))

    if (query.projectId !== undefined && !isNaN(query.projectId)) {
      const upRows = await db
        .select({ userId: userProjects.userId })
        .from(userProjects)
        .where(
          and(
            eq(userProjects.projectId, query.projectId),
            eq(userProjects.status, "ACTIVE"),
          ),
        )
      const uids = upRows.map((u) => u.userId)
      if (uids.length > 0) {
        conditions.push(inArray(users.id, uids))
      } else {
        return []
      }
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined

    // Query all matching users with single join and embedded aggregated projects
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
      .orderBy(asc(users.perNumber), asc(users.fullName))

    // Build hierarchical tree in-memory in O(N)
    const nodesByPer = new Map<string, any>()
    const allNodes: any[] = []

    for (const r of userRows) {
      const node = {
        ...formatUserRow(r),
        children: [] as any[],
      }
      allNodes.push(node)
      if (r.user.perNumber) {
        nodesByPer.set(r.user.perNumber, node)
      }
    }

    const roots: any[] = []
    for (const node of allNodes) {
      const mgrPer = node.user.managerPerNumber
      const parent = mgrPer ? nodesByPer.get(mgrPer) : null
      if (parent && parent.user.id !== node.user.id) {
        parent.children.push(node)
      } else {
        roots.push(node)
      }
    }

    return roots
  }
}

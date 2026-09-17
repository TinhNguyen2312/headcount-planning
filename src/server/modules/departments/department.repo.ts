import { and, asc, count, desc, eq, ilike, or, type SQL } from "drizzle-orm"
import { db, departments, roles } from "@/db"
import { calculatePagination } from "@/server/core/pagination"
import type {
  CreateDepartmentInput,
  QueryDepartmentInput,
  UpdateDepartmentInput,
} from "./department.schema"

export class DepartmentRepository {
  static async findManyAndCount(query: QueryDepartmentInput) {
    const { page, limit, offset } = calculatePagination(query.page, query.limit)
    const order = query.order === "asc" ? "asc" : "desc"

    const conditions: SQL[] = []

    if (query.status && query.status !== "ALL") {
      conditions.push(eq(departments.status, query.status))
    }

    if (query.type) {
      conditions.push(eq(departments.type, query.type))
    }

    if (query.level !== undefined && !isNaN(query.level)) {
      conditions.push(eq(departments.level, query.level))
    }

    if (query.parentId !== undefined && !isNaN(query.parentId)) {
      conditions.push(eq(departments.parentId, query.parentId))
    }

    if (query.keyword) {
      const kw = or(
        ilike(departments.name, `%${query.keyword}%`),
        ilike(departments.code, `%${query.keyword}%`),
      )
      if (kw) conditions.push(kw)
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined

    const [{ value: total }] = await db
      .select({ value: count() })
      .from(departments)
      .where(whereClause)

    const rows = await db
      .select()
      .from(departments)
      .where(whereClause)
      .orderBy(order === "asc" ? asc(departments.id) : desc(departments.id))
      .offset(offset)
      .limit(limit)

    return {
      rows,
      total: Number(total),
      page,
      limit,
    }
  }

  static async findById(id: number) {
    const [dept] = await db
      .select()
      .from(departments)
      .where(eq(departments.id, id))
    return dept || null
  }

  static async findByCode(code: string) {
    const [dept] = await db
      .select()
      .from(departments)
      .where(eq(departments.code, code))
    return dept || null
  }

  static async create(input: CreateDepartmentInput) {
    const [created] = await db
      .insert(departments)
      .values({
        name: input.name,
        code: input.code,
        type: input.type,
        level: input.level,
        parentId: input.parentId || null,
        status: input.status,
        description: input.description || null,
        metadata:
          input.metadata !== undefined
            ? input.metadata
            : input.metadataJson || null,
      })
      .returning()

    return created
  }

  static async update(id: number, input: UpdateDepartmentInput) {
    const [updated] = await db
      .update(departments)
      .set({
        name: input.name !== undefined ? input.name : undefined,
        code: input.code !== undefined ? input.code : undefined,
        type: input.type !== undefined ? input.type : undefined,
        level: input.level !== undefined ? input.level : undefined,
        parentId: input.parentId !== undefined ? input.parentId : undefined,
        status: input.status !== undefined ? input.status : undefined,
        description:
          input.description !== undefined ? input.description : undefined,
        metadata:
          input.metadata !== undefined
            ? input.metadata
            : input.metadataJson !== undefined
              ? input.metadataJson
              : undefined,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(departments.id, id))
      .returning()

    return updated || null
  }

  static async delete(id: number) {
    const [deleted] = await db
      .delete(departments)
      .where(eq(departments.id, id))
      .returning()
    return deleted || null
  }

  static async hasChildDepartments(id: number) {
    const [child] = await db
      .select({ id: departments.id })
      .from(departments)
      .where(eq(departments.parentId, id))
      .limit(1)
    return Boolean(child)
  }

  static async hasAssignedRoles(id: number) {
    const [role] = await db
      .select({ id: roles.id })
      .from(roles)
      .where(eq(roles.departmentId, id))
      .limit(1)
    return Boolean(role)
  }
}

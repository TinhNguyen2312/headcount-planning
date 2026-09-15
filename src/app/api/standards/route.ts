import { NextRequest } from "next/server"
import { ilike, or, and, count, desc, asc, eq, type SQL } from "drizzle-orm"
import {
  db,
  headcountStandards,
  headcountCriteria,
  headcountMonthlyFactors,
  roles,
  milestones,
  properties,
} from "@/db"
import { getCurrentUserFromSession } from "@/lib/session"
import { apiError, apiSuccess, createPaginationMeta } from "@/lib/apiResponse"
import type {
  ConditionOperator,
  HeadcountCriteriaInput,
  HeadcountMonthlyFactorInput,
  HeadcountStandardCreatePayload,
  HeadcountStandardResponse,
} from "@/types"

const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "JSESSIONID"

function formatStandard(standard: any): HeadcountStandardResponse {
  const roleObj = standard.role
    ? {
        id: standard.role.id,
        code: standard.role.code,
        shortCode: standard.role.shortCode,
        name: standard.role.name,
        level: standard.role.level,
        parentRoleId: standard.role.parentRoleId,
        departmentId: standard.role.departmentId,
        departmentName: standard.role.department?.name || null,
        departmentCode: standard.role.department?.code || null,
        planningMethod: standard.role.planningMethod,
        leadTimeMonths: standard.role.leadTimeMonths,
        description: standard.role.description,
        createdAt: standard.role.createdAt,
      }
    : ({} as any)

  const milestoneObj = standard.milestone
    ? {
        id: standard.milestone.id,
        code: standard.milestone.code,
        name: standard.milestone.name,
        description: standard.milestone.description,
        isActive: standard.milestone.isActive,
        createdAt: standard.milestone.createdAt,
      }
    : ({} as any)

  const criteriaList = (standard.headcountCriteria || []).map((c: any) => ({
    id: c.id,
    standardId: c.standardId,
    propertyId: c.propertyId,
    conditionOperator: c.conditionOperator as ConditionOperator,
    minValue: c.minValue !== null ? Number(c.minValue) : null,
    maxValue: c.maxValue !== null ? Number(c.maxValue) : null,
    valueText: c.valueText || null,
    note: c.note || null,
    property: c.property
      ? {
          id: c.property.id,
          code: c.property.code,
          name: c.property.name,
          dataType: c.property.dataType,
          unit: c.property.unit,
          options: c.property.options,
          description: c.property.description,
          isActive: c.property.isActive,
          createdAt: c.property.createdAt,
          updatedAt: c.property.updatedAt,
        }
      : ({} as any),
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  }))

  const durationMonths = standard.durationMonths
    ? Number(standard.durationMonths)
    : 12
  const rawFactors = Array.isArray(standard.monthlyFactors)
    ? standard.monthlyFactors.map((f: any) => Number(f))
    : []
  const monthlyFactorsList =
    rawFactors.length > 0 ? rawFactors : Array(durationMonths).fill(1.0)

  return {
    id: standard.id,
    roleId: standard.roleId,
    role: roleObj,
    milestoneId: standard.milestoneId,
    milestone: milestoneObj,
    headcount: Number(standard.headcount),
    headcountMin:
      standard.headcountMin !== null ? Number(standard.headcountMin) : null,
    headcountMax:
      standard.headcountMax !== null ? Number(standard.headcountMax) : null,
    note: standard.note ?? null,
    durationMonths,
    monthlyFactors: monthlyFactorsList,
    criteriaCount: criteriaList.length,
    criteria: criteriaList,
    createdAt: standard.createdAt,
    updatedAt: standard.updatedAt,
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const keyword = searchParams.get("keyword")?.trim() || ""
    const roleIdParam = searchParams.get("roleId")
    const milestoneIdParam = searchParams.get("milestoneId")
    const page = parseInt(searchParams.get("page") || "0", 10)
    const limit = Math.min(500, parseInt(searchParams.get("limit") || "50", 10))
    const order =
      searchParams.get("order")?.toLowerCase() === "asc" ? "asc" : "desc"

    const conditions: SQL[] = []

    if (roleIdParam) {
      conditions.push(eq(headcountStandards.roleId, parseInt(roleIdParam, 10)))
    }
    if (milestoneIdParam) {
      conditions.push(
        eq(headcountStandards.milestoneId, parseInt(milestoneIdParam, 10)),
      )
    }

    const whereCondition =
      conditions.length > 0 ? and(...conditions) : undefined

    const [{ value: total }] = await db
      .select({ value: count() })
      .from(headcountStandards)
      .where(whereCondition)

    const standardsList = await db.query.headcountStandards.findMany({
      where: whereCondition,
      with: {
        role: {
          with: {
            department: true,
          },
        },
        milestone: true,
        headcountCriteria: {
          with: {
            property: true,
          },
        },
      },
      orderBy:
        order === "asc"
          ? asc(headcountStandards.id)
          : desc(headcountStandards.id),
      offset: page * limit,
      limit,
    })

    let formatted = standardsList.map(formatStandard)

    // In-memory keyword search across role name/code and milestone name/code if specified
    if (keyword) {
      const lower = keyword.toLowerCase()
      formatted = formatted.filter(
        (item) =>
          item.role?.name?.toLowerCase().includes(lower) ||
          item.role?.code?.toLowerCase().includes(lower) ||
          item.milestone?.name?.toLowerCase().includes(lower) ||
          item.milestone?.code?.toLowerCase().includes(lower) ||
          (item.note && item.note.toLowerCase().includes(lower)),
      )
    }

    const pagination = createPaginationMeta(page, limit, total)
    return apiSuccess(
      formatted,
      "Lấy danh sách định biên chuẩn thành công",
      pagination,
    )
  } catch (error: any) {
    console.error("GET /api/standards error:", error)
    return apiError(
      "Lỗi hệ thống khi tải danh sách định biên chuẩn",
      500,
      500,
      error.message,
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get(SESSION_COOKIE_NAME)?.value
    const user = await getCurrentUserFromSession(sessionToken)
    if (!user) {
      return apiError("Unauthorized", 401, 401)
    }

    const body: HeadcountStandardCreatePayload = await req.json()

    if (!body.roleId) {
      return apiError("Vui lòng chọn chức danh áp dụng định biên", 400, 400)
    }
    if (!body.milestoneId) {
      return apiError("Vui lòng chọn mốc kiểm soát áp dụng", 400, 400)
    }
    if (
      body.headcount === undefined ||
      body.headcount === null ||
      isNaN(Number(body.headcount))
    ) {
      return apiError("Vui lòng nhập số định biên chuẩn hợp lệ", 400, 400)
    }

    // Verify role exists
    const [existingRole] = await db
      .select({ id: roles.id })
      .from(roles)
      .where(eq(roles.id, body.roleId))
      .limit(1)
    if (!existingRole) {
      return apiError("Chức danh không tồn tại trong hệ thống", 400, 400)
    }

    // Verify milestone exists
    const [existingMilestone] = await db
      .select({ id: milestones.id })
      .from(milestones)
      .where(eq(milestones.id, body.milestoneId))
      .limit(1)
    if (!existingMilestone) {
      return apiError("Mốc kiểm soát không tồn tại trong hệ thống", 400, 400)
    }

    // Validate & normalize durationMonths and monthlyFactors
    const durationMonths = body.durationMonths
      ? Number(body.durationMonths)
      : 12
    if (durationMonths < 6 || durationMonths > 60) {
      return apiError(
        `Thời lượng chu kỳ phân bổ phải từ 6 đến 60 tháng (nhận ${durationMonths} tháng)`,
        400,
        400,
      )
    }

    let normalizedFactors: number[] = []
    if (Array.isArray(body.monthlyFactors) && body.monthlyFactors.length > 0) {
      if (typeof body.monthlyFactors[0] === "number") {
        normalizedFactors = body.monthlyFactors.map((f: any) => Number(f))
      } else if (
        typeof body.monthlyFactors[0] === "object" &&
        body.monthlyFactors[0] !== null
      ) {
        normalizedFactors = body.monthlyFactors.map((f: any) =>
          Number(f.factor ?? 1.0),
        )
      }
    }

    // Pad or trim to durationMonths
    if (normalizedFactors.length < durationMonths) {
      while (normalizedFactors.length < durationMonths) {
        normalizedFactors.push(1.0)
      }
    } else if (normalizedFactors.length > durationMonths) {
      normalizedFactors = normalizedFactors.slice(0, durationMonths)
    }

    for (let i = 0; i < normalizedFactors.length; i++) {
      const f = normalizedFactors[i]
      if (isNaN(f) || f < 0 || f > 10) {
        return apiError(
          `Hệ số phân bổ của tháng T${i + 1} phải nằm trong khoảng từ 0.0 đến 10.0`,
          400,
          400,
        )
      }
    }

    // Execute atomic composite insert
    const createdStandardId = await db.transaction(async (tx) => {
      const [insertedStandard] = await tx
        .insert(headcountStandards)
        .values({
          roleId: body.roleId,
          milestoneId: body.milestoneId,
          headcount: String(body.headcount),
          headcountMin:
            body.headcountMin !== undefined && body.headcountMin !== null
              ? String(body.headcountMin)
              : null,
          headcountMax:
            body.headcountMax !== undefined && body.headcountMax !== null
              ? String(body.headcountMax)
              : null,
          note: body.note?.trim() || null,
          durationMonths,
          monthlyFactors: normalizedFactors,
        })
        .returning({ id: headcountStandards.id })

      const standardId = insertedStandard.id

      // Insert criteria if provided
      if (body.criteria && body.criteria.length > 0) {
        const criteriaToInsert = body.criteria.map(
          (c: HeadcountCriteriaInput) => ({
            standardId,
            propertyId: c.propertyId,
            conditionOperator: c.conditionOperator,
            minValue:
              c.minValue !== undefined && c.minValue !== null
                ? String(c.minValue)
                : null,
            maxValue:
              c.maxValue !== undefined && c.maxValue !== null
                ? String(c.maxValue)
                : null,
            valueText: c.valueText?.trim() || null,
            note: c.note?.trim() || null,
          }),
        )
        await tx.insert(headcountCriteria).values(criteriaToInsert)
      }

      return standardId
    })

    // Fetch created record with all relations
    const createdRecord = await db.query.headcountStandards.findFirst({
      where: eq(headcountStandards.id, createdStandardId),
      with: {
        role: {
          with: {
            department: true,
          },
        },
        milestone: true,
        headcountCriteria: {
          with: {
            property: true,
          },
        },
      },
    })

    if (!createdRecord) {
      return apiError("Không thể tìm thấy định biên vừa tạo", 500, 500)
    }

    return apiSuccess(
      formatStandard(createdRecord),
      "Tạo định biên chuẩn thành công",
    )
  } catch (error: any) {
    console.error("POST /api/standards error:", error)
    return apiError(
      "Lỗi hệ thống khi tạo định biên chuẩn",
      500,
      500,
      error.message,
    )
  }
}

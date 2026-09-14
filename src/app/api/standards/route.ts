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

  const fromMilestoneObj =
    standard.milestone_fromMilestoneId || standard.fromMilestone
      ? {
          id: (standard.milestone_fromMilestoneId || standard.fromMilestone).id,
          code: (standard.milestone_fromMilestoneId || standard.fromMilestone)
            .code,
          name: (standard.milestone_fromMilestoneId || standard.fromMilestone)
            .name,
          description: (
            standard.milestone_fromMilestoneId || standard.fromMilestone
          ).description,
          isActive: (
            standard.milestone_fromMilestoneId || standard.fromMilestone
          ).isActive,
          createdAt: (
            standard.milestone_fromMilestoneId || standard.fromMilestone
          ).createdAt,
        }
      : ({} as any)

  const rawToMilestone =
    standard.milestone_toMilestoneId || standard.toMilestone
  const toMilestoneObj = rawToMilestone
    ? {
        id: rawToMilestone.id,
        code: rawToMilestone.code,
        name: rawToMilestone.name,
        description: rawToMilestone.description,
        isActive: rawToMilestone.isActive,
        createdAt: rawToMilestone.createdAt,
      }
    : null

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

  const monthlyFactorsList = (standard.headcountMonthlyFactors || []).map(
    (f: any) => ({
      id: f.id,
      standardId: f.standardId,
      durationMonths: f.durationMonths,
      monthNo: f.monthNo,
      factor: Number(f.factor),
      createdAt: f.createdAt,
      updatedAt: f.updatedAt,
    }),
  )

  return {
    id: standard.id,
    roleId: standard.roleId,
    role: roleObj,
    fromMilestoneId: standard.fromMilestoneId,
    fromMilestone: fromMilestoneObj,
    toMilestoneId: standard.toMilestoneId ?? null,
    toMilestone: toMilestoneObj,
    headcount: Number(standard.headcount),
    headcountMin:
      standard.headcountMin !== null ? Number(standard.headcountMin) : null,
    headcountMax:
      standard.headcountMax !== null ? Number(standard.headcountMax) : null,
    note: standard.note ?? null,
    criteriaCount: criteriaList.length,
    monthlyFactorCount: monthlyFactorsList.length,
    criteria: criteriaList,
    monthlyFactors: monthlyFactorsList,
    createdAt: standard.createdAt,
    updatedAt: standard.updatedAt,
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const keyword = searchParams.get("keyword")?.trim() || ""
    const roleIdParam = searchParams.get("roleId")
    const fromMilestoneIdParam = searchParams.get("fromMilestoneId")
    const toMilestoneIdParam = searchParams.get("toMilestoneId")
    const page = parseInt(searchParams.get("page") || "0", 10)
    const limit = Math.min(500, parseInt(searchParams.get("limit") || "50", 10))
    const order =
      searchParams.get("order")?.toLowerCase() === "asc" ? "asc" : "desc"

    const conditions: SQL[] = []

    if (roleIdParam) {
      conditions.push(eq(headcountStandards.roleId, parseInt(roleIdParam, 10)))
    }
    if (fromMilestoneIdParam) {
      conditions.push(
        eq(
          headcountStandards.fromMilestoneId,
          parseInt(fromMilestoneIdParam, 10),
        ),
      )
    }
    if (toMilestoneIdParam) {
      conditions.push(
        eq(headcountStandards.toMilestoneId, parseInt(toMilestoneIdParam, 10)),
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
        milestone_fromMilestoneId: true,
        milestone_toMilestoneId: true,
        headcountCriteria: {
          with: {
            property: true,
          },
        },
        headcountMonthlyFactors: true,
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
          item.fromMilestone?.name?.toLowerCase().includes(lower) ||
          item.fromMilestone?.code?.toLowerCase().includes(lower) ||
          (item.toMilestone &&
            (item.toMilestone.name.toLowerCase().includes(lower) ||
              item.toMilestone.code.toLowerCase().includes(lower))) ||
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
    if (!body.fromMilestoneId) {
      return apiError("Vui lòng chọn mốc bắt đầu", 400, 400)
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

    // Verify fromMilestone exists
    const [existingMilestone] = await db
      .select({ id: milestones.id })
      .from(milestones)
      .where(eq(milestones.id, body.fromMilestoneId))
      .limit(1)
    if (!existingMilestone) {
      return apiError("Mốc bắt đầu không tồn tại trong hệ thống", 400, 400)
    }

    if (body.toMilestoneId) {
      const [existingToMilestone] = await db
        .select({ id: milestones.id })
        .from(milestones)
        .where(eq(milestones.id, body.toMilestoneId))
        .limit(1)
      if (!existingToMilestone) {
        return apiError("Mốc kết thúc không tồn tại trong hệ thống", 400, 400)
      }
    }

    // Validate monthly factors constraints
    if (body.monthlyFactors && body.monthlyFactors.length > 0) {
      for (const f of body.monthlyFactors) {
        if (!f.durationMonths || f.durationMonths < 6) {
          return apiError(
            `Thời lượng phân bổ tối thiểu phải từ 6 tháng trở lên (phát hiện ${f.durationMonths} tháng)`,
            400,
            400,
          )
        }
        if (f.durationMonths > 60) {
          return apiError(
            `Thời lượng phân bổ tối đa không vượt quá 60 tháng (phát hiện ${f.durationMonths} tháng)`,
            400,
            400,
          )
        }
        if (!f.monthNo || f.monthNo < 1 || f.monthNo > f.durationMonths) {
          return apiError(
            `Mốc tháng T${f.monthNo} không hợp lệ trong chu kỳ ${f.durationMonths} tháng (phải từ T1 đến T${f.durationMonths})`,
            400,
            400,
          )
        }
        if (
          f.factor === undefined ||
          f.factor === null ||
          f.factor < 0 ||
          f.factor > 10
        ) {
          return apiError(
            `Hệ số phân bổ của tháng T${f.monthNo} phải nằm trong khoảng từ 0.0 đến 10.0`,
            400,
            400,
          )
        }
      }
    }

    // Execute atomic composite insert
    const createdStandardId = await db.transaction(async (tx) => {
      const [insertedStandard] = await tx
        .insert(headcountStandards)
        .values({
          roleId: body.roleId,
          fromMilestoneId: body.fromMilestoneId,
          toMilestoneId: body.toMilestoneId || null,
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

      // Insert monthly factors if provided
      if (body.monthlyFactors && body.monthlyFactors.length > 0) {
        const factorsToInsert = body.monthlyFactors.map(
          (f: HeadcountMonthlyFactorInput) => ({
            standardId,
            durationMonths: f.durationMonths,
            monthNo: f.monthNo,
            factor: String(f.factor),
          }),
        )
        await tx.insert(headcountMonthlyFactors).values(factorsToInsert)
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
        milestone_fromMilestoneId: true,
        milestone_toMilestoneId: true,
        headcountCriteria: {
          with: {
            property: true,
          },
        },
        headcountMonthlyFactors: true,
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

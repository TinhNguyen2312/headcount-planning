import { NextRequest } from "next/server"
import { eq } from "drizzle-orm"
import {
  db,
  headcountStandards,
  headcountCriteria,
  headcountMonthlyFactors,
  roles,
  milestones,
} from "@/db"
import { getCurrentUserFromSession } from "@/lib/session"
import { apiError, apiSuccess } from "@/lib/apiResponse"
import type {
  ConditionOperator,
  HeadcountCriteriaInput,
  HeadcountMonthlyFactorInput,
  HeadcountStandardResponse,
  HeadcountStandardUpdatePayload,
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

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: rawId } = await params
    const id = parseInt(rawId, 10)
    if (isNaN(id)) {
      return apiError("ID không hợp lệ", 400, 400)
    }

    const standard = await db.query.headcountStandards.findFirst({
      where: eq(headcountStandards.id, id),
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

    if (!standard) {
      return apiError("Không tìm thấy định biên chuẩn", 404, 404)
    }

    return apiSuccess(
      formatStandard(standard),
      "Lấy chi tiết định biên chuẩn thành công",
    )
  } catch (error: any) {
    console.error("GET /api/standards/[id] error:", error)
    return apiError(
      "Lỗi hệ thống khi tải định biên chuẩn",
      500,
      500,
      error.message,
    )
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const sessionToken = req.cookies.get(SESSION_COOKIE_NAME)?.value
    const user = await getCurrentUserFromSession(sessionToken)
    if (!user) {
      return apiError("Unauthorized", 401, 401)
    }

    const { id: rawId } = await params
    const id = parseInt(rawId, 10)
    if (isNaN(id)) {
      return apiError("ID không hợp lệ", 400, 400)
    }

    const [existing] = await db
      .select({ id: headcountStandards.id })
      .from(headcountStandards)
      .where(eq(headcountStandards.id, id))
      .limit(1)

    if (!existing) {
      return apiError("Không tìm thấy định biên chuẩn để cập nhật", 404, 404)
    }

    const body: HeadcountStandardUpdatePayload = await req.json()

    // Validate role if updating roleId
    if (body.roleId) {
      const [existingRole] = await db
        .select({ id: roles.id })
        .from(roles)
        .where(eq(roles.id, body.roleId))
        .limit(1)
      if (!existingRole) {
        return apiError("Chức danh không tồn tại trong hệ thống", 400, 400)
      }
    }

    // Validate milestone if updating fromMilestoneId
    if (body.fromMilestoneId) {
      const [existingMilestone] = await db
        .select({ id: milestones.id })
        .from(milestones)
        .where(eq(milestones.id, body.fromMilestoneId))
        .limit(1)
      if (!existingMilestone) {
        return apiError("Mốc bắt đầu không tồn tại trong hệ thống", 400, 400)
      }
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

    await db.transaction(async (tx) => {
      // 1. Build standard update values
      const updateValues: Record<string, any> = {
        updatedAt: new Date().toISOString(),
      }

      if (body.roleId !== undefined) updateValues.roleId = body.roleId
      if (body.fromMilestoneId !== undefined)
        updateValues.fromMilestoneId = body.fromMilestoneId
      if (body.toMilestoneId !== undefined)
        updateValues.toMilestoneId = body.toMilestoneId || null
      if (body.headcount !== undefined)
        updateValues.headcount = String(body.headcount)
      if (body.headcountMin !== undefined)
        updateValues.headcountMin =
          body.headcountMin !== null ? String(body.headcountMin) : null
      if (body.headcountMax !== undefined)
        updateValues.headcountMax =
          body.headcountMax !== null ? String(body.headcountMax) : null
      if (body.note !== undefined) updateValues.note = body.note?.trim() || null

      await tx
        .update(headcountStandards)
        .set(updateValues)
        .where(eq(headcountStandards.id, id))

      // 2. Sync criteria if provided
      if (body.criteria !== undefined) {
        await tx
          .delete(headcountCriteria)
          .where(eq(headcountCriteria.standardId, id))

        if (body.criteria && body.criteria.length > 0) {
          const criteriaToInsert = body.criteria.map(
            (c: HeadcountCriteriaInput) => ({
              standardId: id,
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
      }

      // 3. Sync monthly factors if provided
      if (body.monthlyFactors !== undefined) {
        await tx
          .delete(headcountMonthlyFactors)
          .where(eq(headcountMonthlyFactors.standardId, id))

        if (body.monthlyFactors && body.monthlyFactors.length > 0) {
          const factorsToInsert = body.monthlyFactors.map(
            (f: HeadcountMonthlyFactorInput) => ({
              standardId: id,
              durationMonths: f.durationMonths,
              monthNo: f.monthNo,
              factor: String(f.factor),
            }),
          )
          await tx.insert(headcountMonthlyFactors).values(factorsToInsert)
        }
      }
    })

    // Fetch updated standard with relations
    const updatedRecord = await db.query.headcountStandards.findFirst({
      where: eq(headcountStandards.id, id),
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

    return apiSuccess(
      formatStandard(updatedRecord),
      "Cập nhật định biên chuẩn thành công",
    )
  } catch (error: any) {
    console.error("PATCH /api/standards/[id] error:", error)
    return apiError(
      "Lỗi hệ thống khi cập nhật định biên chuẩn",
      500,
      500,
      error.message,
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const sessionToken = req.cookies.get(SESSION_COOKIE_NAME)?.value
    const user = await getCurrentUserFromSession(sessionToken)
    if (!user) {
      return apiError("Unauthorized", 401, 401)
    }

    const { id: rawId } = await params
    const id = parseInt(rawId, 10)
    if (isNaN(id)) {
      return apiError("ID không hợp lệ", 400, 400)
    }

    const [existing] = await db
      .select({ id: headcountStandards.id })
      .from(headcountStandards)
      .where(eq(headcountStandards.id, id))
      .limit(1)

    if (!existing) {
      return apiError("Không tìm thấy định biên chuẩn để xóa", 404, 404)
    }

    await db.delete(headcountStandards).where(eq(headcountStandards.id, id))

    return apiSuccess(null, "Xóa định biên chuẩn thành công")
  } catch (error: any) {
    console.error("DELETE /api/standards/[id] error:", error)
    return apiError(
      "Lỗi hệ thống khi xóa định biên chuẩn",
      500,
      500,
      error.message,
    )
  }
}

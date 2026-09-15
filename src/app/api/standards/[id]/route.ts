import { NextRequest } from "next/server"
import { eq } from "drizzle-orm"
import {
  db,
  headcountStandards,
  headcountCriteria,
  roles,
  milestones,
} from "@/db"
import { getCurrentUserFromSession } from "@/lib/session"
import { apiError, apiSuccess } from "@/lib/apiResponse"
import type {
  ConditionOperator,
  HeadcountCriteriaInput,
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
        description: standard.role.description,
        createdAt: standard.role.createdAt,
      }
    : ({} as any)

  const fromMilestoneObj = standard.fromMilestone
    ? {
        id: standard.fromMilestone.id,
        code: standard.fromMilestone.code,
        name: standard.fromMilestone.name,
        description: standard.fromMilestone.description,
        isActive: standard.fromMilestone.isActive,
        createdAt: standard.fromMilestone.createdAt,
      }
    : ({} as any)

  const toMilestoneObj = standard.toMilestone
    ? {
        id: standard.toMilestone.id,
        code: standard.toMilestone.code,
        name: standard.toMilestone.name,
        description: standard.toMilestone.description,
        isActive: standard.toMilestone.isActive,
        createdAt: standard.toMilestone.createdAt,
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
    fromLeadTimeMonths: standard.fromLeadTimeMonths ?? 0,
    toLeadTimeMonths: standard.toLeadTimeMonths ?? 0,
    durationMonths,
    monthlyFactors: monthlyFactorsList,
    projectType: (standard.projectType || "ALL") as any,
    criteriaCount: criteriaList.length,
    criteria: criteriaList,
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
        fromMilestone: true,
        toMilestone: true,
        headcountCriteria: {
          with: {
            property: true,
          },
        },
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
      .select({
        id: headcountStandards.id,
        durationMonths: headcountStandards.durationMonths,
      })
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

    // Validate fromMilestone if updating fromMilestoneId
    if (body.fromMilestoneId) {
      const [existingFromMilestone] = await db
        .select({ id: milestones.id })
        .from(milestones)
        .where(eq(milestones.id, body.fromMilestoneId))
        .limit(1)
      if (!existingFromMilestone) {
        return apiError("Mốc bắt đầu không tồn tại trong hệ thống", 400, 400)
      }
    }

    // Validate toMilestone if updating toMilestoneId
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

    const currentDuration =
      body.durationMonths !== undefined
        ? Number(body.durationMonths)
        : existing.durationMonths
          ? Number(existing.durationMonths)
          : 12

    if (body.durationMonths !== undefined) {
      if (currentDuration < 1 || currentDuration > 60) {
        return apiError(
          `Thời lượng chu kỳ phân bổ phải từ 1 đến 60 tháng (nhận ${currentDuration} tháng)`,
          400,
          400,
        )
      }
    }

    let normalizedFactors: number[] | undefined = undefined
    if (body.monthlyFactors !== undefined) {
      if (Array.isArray(body.monthlyFactors)) {
        if (typeof body.monthlyFactors[0] === "number") {
          normalizedFactors = body.monthlyFactors.map((f: any) => Number(f))
        } else if (
          typeof body.monthlyFactors[0] === "object" &&
          body.monthlyFactors[0] !== null
        ) {
          normalizedFactors = body.monthlyFactors.map((f: any) =>
            Number(f.factor ?? 1.0),
          )
        } else {
          normalizedFactors = []
        }
      } else {
        normalizedFactors = []
      }

      // Pad or trim
      if (normalizedFactors.length < currentDuration) {
        while (normalizedFactors.length < currentDuration) {
          normalizedFactors.push(1.0)
        }
      } else if (normalizedFactors.length > currentDuration) {
        normalizedFactors = normalizedFactors.slice(0, currentDuration)
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
    }

    // Atomic update
    await db.transaction(async (tx) => {
      const updateData: Record<string, any> = {
        updatedAt: new Date().toISOString(),
      }

      if (body.roleId !== undefined) updateData.roleId = body.roleId
      if (body.fromMilestoneId !== undefined)
        updateData.fromMilestoneId = body.fromMilestoneId
      if (body.toMilestoneId !== undefined)
        updateData.toMilestoneId = body.toMilestoneId || null
      if (body.headcount !== undefined)
        updateData.headcount = String(body.headcount)
      if (body.headcountMin !== undefined)
        updateData.headcountMin =
          body.headcountMin !== null ? String(body.headcountMin) : null
      if (body.headcountMax !== undefined)
        updateData.headcountMax =
          body.headcountMax !== null ? String(body.headcountMax) : null
      if (body.note !== undefined) updateData.note = body.note?.trim() || null
      if (body.fromLeadTimeMonths !== undefined)
        updateData.fromLeadTimeMonths = Math.max(
          0,
          Number(body.fromLeadTimeMonths),
        )
      if (body.toLeadTimeMonths !== undefined)
        updateData.toLeadTimeMonths = Math.max(0, Number(body.toLeadTimeMonths))
      if (body.durationMonths !== undefined)
        updateData.durationMonths = currentDuration
      if (normalizedFactors !== undefined)
        updateData.monthlyFactors = normalizedFactors
      if (
        body.projectType !== undefined &&
        ["ALL", "LOW_RISE", "HIGH_RISE", "MIXED"].includes(body.projectType)
      ) {
        updateData.projectType = body.projectType
      }

      await tx
        .update(headcountStandards)
        .set(updateData)
        .where(eq(headcountStandards.id, id))

      // Sync criteria if provided
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
    })

    // Fetch updated
    const updatedRecord = await db.query.headcountStandards.findFirst({
      where: eq(headcountStandards.id, id),
      with: {
        role: {
          with: {
            department: true,
          },
        },
        fromMilestone: true,
        toMilestone: true,
        headcountCriteria: {
          with: {
            property: true,
          },
        },
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
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
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

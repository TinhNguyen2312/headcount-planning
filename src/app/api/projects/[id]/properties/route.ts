import { NextRequest } from "next/server"
import { eq } from "drizzle-orm"
import { db, projects, properties, propertyValues } from "@/db"
import { getCurrentUserFromSession } from "@/lib/session"
import { apiError, apiSuccess } from "@/lib/apiResponse"
import type { SaveProjectPropertiesPayload } from "@/types"

const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "JSESSIONID"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const projectId = parseInt(id, 10)
    if (isNaN(projectId)) return apiError("ID dự án không hợp lệ", 400)

    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId))
    if (!project) return apiError("Không tìm thấy dự án", 404)

    // 1. Fetch all active properties
    const rawProperties = await db
      .select({
        id: properties.id,
        code: properties.code,
        name: properties.name,
        dataType: properties.dataType,
        projectType: properties.projectType,
        unit: properties.unit,
        options: properties.options,
        description: properties.description,
        isActive: properties.isActive,
        createdAt: properties.createdAt,
        updatedAt: properties.updatedAt,
      })
      .from(properties)
      .where(eq(properties.isActive, true))
      .orderBy(properties.id)

    const activeProperties = rawProperties.map((p) => ({
      ...p,
      scope: p.projectType,
    }))

    // 2. Fetch existing values for this project
    const existingValues = await db
      .select({
        id: propertyValues.id,
        projectId: propertyValues.projectId,
        propertyId: propertyValues.propertyId,
        projectType: propertyValues.projectType,
        valueText: propertyValues.valueText,
        valueNumber: propertyValues.valueNumber,
        updatedAt: propertyValues.updatedAt,
      })
      .from(propertyValues)
      .where(eq(propertyValues.projectId, projectId))

    const propMap = new Map(activeProperties.map((p) => [p.id, p]))

    const formattedValues = existingValues.map((val) => {
      const prop = propMap.get(val.propertyId)
      return {
        id: val.id,
        projectId: val.projectId,
        propertyId: val.propertyId,
        projectType:
          val.projectType === "COMMON" ? "ALL" : val.projectType || "ALL",
        propertyCode: prop?.code || "",
        propertyName: prop?.name || "",
        dataType: (prop?.dataType as any) || "NUMBER",
        projectTypeProperty: (prop?.projectType as any) || "ALL",
        unit: prop?.unit || null,
        options: (prop?.options as any) || null,
        valueText: val.valueText,
        valueNumber: val.valueNumber ? Number(val.valueNumber) : null,
        updatedAt: val.updatedAt,
      }
    })

    return apiSuccess({
      projectId,
      projectType: (project.projectType as any) || "HIGH_RISE",
      properties: activeProperties,
      values: formattedValues,
    })
  } catch (error) {
    console.error("Get project properties error:", error)
    return apiError("Lỗi lấy cơ sở định biên của dự án", 500)
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const sessionId = req.cookies.get(SESSION_COOKIE_NAME)?.value
    const user = await getCurrentUserFromSession(sessionId)
    if (!user) return apiError("Chưa đăng nhập", 401, 401)

    const { id } = await params
    const projectId = parseInt(id, 10)
    if (isNaN(projectId)) return apiError("ID dự án không hợp lệ", 400)

    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId))
    if (!project) return apiError("Không tìm thấy dự án", 404)

    const body = (await req.json()) as SaveProjectPropertiesPayload
    const { values = [] } = body

    if (!Array.isArray(values)) {
      return apiError("Dữ liệu gửi lên không đúng định dạng mảng", 422)
    }

    if (values.length > 0) {
      for (const item of values) {
        if (!item.propertyId) continue

        const valNum =
          item.valueNumber !== undefined && item.valueNumber !== null
            ? String(item.valueNumber)
            : null

        const valTxt =
          item.valueText !== undefined && item.valueText !== null
            ? String(item.valueText).trim()
            : null

        const targetProjectType =
          item.projectType === "COMMON" ? "ALL" : item.projectType || "ALL"

        await db
          .insert(propertyValues)
          .values({
            projectId,
            propertyId: item.propertyId,
            projectType: targetProjectType,
            valueNumber: valNum as any,
            valueText: valTxt,
          })
          .onConflictDoUpdate({
            target: [
              propertyValues.projectId,
              propertyValues.propertyId,
              propertyValues.projectType,
            ],
            set: {
              valueNumber: valNum as any,
              valueText: valTxt,
              updatedAt: new Date().toISOString(),
            },
          })
      }
    }

    return apiSuccess(null, "Lưu cơ sở định biên dự án thành công")
  } catch (error) {
    console.error("Save project properties error:", error)
    return apiError("Lỗi lưu cơ sở định biên dự án", 500)
  }
}

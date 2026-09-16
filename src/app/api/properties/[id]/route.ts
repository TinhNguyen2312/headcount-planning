import { NextRequest } from "next/server"
import { eq, inArray } from "drizzle-orm"
import {
  db,
  properties,
  propertyValues,
  propertyDepartments,
  departments,
} from "@/db"
import { getCurrentUserFromSession } from "@/lib/session"
import { apiError, apiSuccess } from "@/lib/apiResponse"

const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "JSESSIONID"

/** Helper: lấy departments của một property */
async function getPropertyDepts(propertyId: number) {
  return db
    .select({
      departmentId: propertyDepartments.departmentId,
      departmentCode: departments.code,
      departmentName: departments.name,
    })
    .from(propertyDepartments)
    .innerJoin(
      departments,
      eq(propertyDepartments.departmentId, departments.id),
    )
    .where(eq(propertyDepartments.propertyId, propertyId))
}

/** Helper: đồng bộ danh sách departments của property (delete-then-insert) */
async function syncPropertyDepartments(
  propertyId: number,
  newDeptIds: number[],
) {
  // Xóa tất cả gán cũ
  await db
    .delete(propertyDepartments)
    .where(eq(propertyDepartments.propertyId, propertyId))

  // Insert mới nếu có
  if (newDeptIds.length > 0) {
    await db
      .insert(propertyDepartments)
      .values(
        newDeptIds.map((deptId) => ({ propertyId, departmentId: deptId })),
      )
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const propertyId = parseInt(id, 10)
    if (isNaN(propertyId)) return apiError("ID thuộc tính không hợp lệ", 400)

    const [prop] = await db
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
      .where(eq(properties.id, propertyId))

    if (!prop) return apiError("Không tìm thấy cơ sở định biên", 404)

    const depts = await getPropertyDepts(propertyId)
    return apiSuccess({
      ...prop,
      scope: prop.projectType,
      departmentIds: depts.map((d) => d.departmentId),
      departments: depts.map((d) => ({
        departmentId: d.departmentId,
        departmentCode: d.departmentCode ?? "",
        departmentName: d.departmentName,
      })),
    })
  } catch (error) {
    console.error("Get property detail error:", error)
    return apiError("Lỗi hệ thống", 500)
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const sessionId = req.cookies.get(SESSION_COOKIE_NAME)?.value
    const user = await getCurrentUserFromSession(sessionId)
    if (!user) return apiError("Chưa đăng nhập", 401, 401)

    const { id } = await params
    const propertyId = parseInt(id, 10)
    if (isNaN(propertyId)) return apiError("ID thuộc tính không hợp lệ", 400)

    const body = await req.json()
    const {
      code,
      name,
      dataType,
      projectType,
      scope,
      unit,
      options,
      description,
      isActive,
      departmentIds, // optional — nếu undefined thì không thay đổi gán department
    } = body

    if (code !== undefined && !code.trim()) {
      return apiError("Mã thuộc tính không được để trống", 422)
    }
    if (name !== undefined && !name.trim()) {
      return apiError("Tên thuộc tính không được để trống", 422)
    }

    if (code) {
      const [existing] = await db
        .select()
        .from(properties)
        .where(eq(properties.code, code.trim()))
      if (existing && existing.id !== propertyId) {
        return apiError("Mã thuộc tính đã tồn tại", 409)
      }
    }

    const resolvedType =
      projectType !== undefined
        ? projectType
        : scope !== undefined
          ? scope === "LOW_RISE_ONLY"
            ? "LOW_RISE"
            : scope === "HIGH_RISE_ONLY"
              ? "HIGH_RISE"
              : scope === "PER_TYPE"
                ? "MIXED"
                : "ALL"
          : undefined

    const [updated] = await db
      .update(properties)
      .set({
        code: code !== undefined ? code.trim() : undefined,
        name: name !== undefined ? name.trim() : undefined,
        dataType: dataType !== undefined ? dataType : undefined,
        projectType: resolvedType,
        unit: unit !== undefined ? (unit ? unit.trim() : null) : undefined,
        options: options !== undefined ? options : undefined,
        description: description !== undefined ? description : undefined,
        isActive: isActive !== undefined ? Boolean(isActive) : undefined,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(properties.id, propertyId))
      .returning()

    if (!updated) return apiError("Không tìm thấy cơ sở định biên", 404)

    // Đồng bộ departments nếu được truyền vào
    if (Array.isArray(departmentIds)) {
      const validIds = departmentIds.filter(
        (id): id is number => typeof id === "number" && !isNaN(id),
      )
      await syncPropertyDepartments(propertyId, validIds)
    }

    const depts = await getPropertyDepts(propertyId)
    return apiSuccess(
      {
        ...updated,
        departmentIds: depts.map((d) => d.departmentId),
        departments: depts.map((d) => ({
          departmentId: d.departmentId,
          departmentCode: d.departmentCode ?? "",
          departmentName: d.departmentName,
        })),
      },
      "Cập nhật cơ sở định biên thành công",
    )
  } catch (error) {
    console.error("Update property error:", error)
    return apiError("Lỗi cập nhật cơ sở định biên", 500)
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const sessionId = req.cookies.get(SESSION_COOKIE_NAME)?.value
    const user = await getCurrentUserFromSession(sessionId)
    if (!user) return apiError("Chưa đăng nhập", 401, 401)

    const { id } = await params
    const propertyId = parseInt(id, 10)
    if (isNaN(propertyId)) return apiError("ID thuộc tính không hợp lệ", 400)

    // Check if property is in use in property_values
    const [valRef] = await db
      .select({ id: propertyValues.id })
      .from(propertyValues)
      .where(eq(propertyValues.propertyId, propertyId))
      .limit(1)

    if (valRef) {
      return apiError(
        "Không thể xóa cơ sở định biên đã được nhập liệu tại các Dự án",
        400,
      )
    }

    // property_departments xóa tự động do CASCADE
    await db.delete(properties).where(eq(properties.id, propertyId))
    return apiSuccess(
      { message: "Xóa cơ sở định biên thành công" },
      "Xóa cơ sở định biên thành công",
    )
  } catch (error) {
    console.error("Delete property error:", error)
    return apiError("Lỗi xóa cơ sở định biên", 500)
  }
}

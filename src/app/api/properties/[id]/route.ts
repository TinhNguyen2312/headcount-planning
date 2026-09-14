import { NextRequest } from "next/server"
import { eq } from "drizzle-orm"
import { db, properties, propertyValues } from "@/db"
import { getCurrentUserFromSession } from "@/lib/session"
import { apiError, apiSuccess } from "@/lib/apiResponse"

const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "JSESSIONID"

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
    return apiSuccess(prop)
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
    const { code, name, dataType, unit, options, description, isActive } = body

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

    const [updated] = await db
      .update(properties)
      .set({
        code: code !== undefined ? code.trim() : undefined,
        name: name !== undefined ? name.trim() : undefined,
        dataType: dataType !== undefined ? dataType : undefined,
        unit: unit !== undefined ? (unit ? unit.trim() : null) : undefined,
        options: options !== undefined ? options : undefined,
        description: description !== undefined ? description : undefined,
        isActive: isActive !== undefined ? Boolean(isActive) : undefined,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(properties.id, propertyId))
      .returning()

    if (!updated) return apiError("Không tìm thấy cơ sở định biên", 404)
    return apiSuccess(updated, "Cập nhật cơ sở định biên thành công")
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

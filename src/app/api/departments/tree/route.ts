import { NextRequest } from "next/server"
import { asc } from "drizzle-orm"
import { db, departments } from "@/db"
import { apiError, apiSuccess } from "@/lib/apiResponse"
import { buildTree } from "@/lib/tree"

export async function GET(_req: NextRequest) {
  try {
    const all = await db
      .select()
      .from(departments)
      .orderBy(asc(departments.level), asc(departments.name))

    const tree = buildTree(all)
    return apiSuccess(tree)
  } catch (error) {
    console.error("Get department tree error:", error)
    return apiError("Lỗi lấy cây phòng ban", 500)
  }
}

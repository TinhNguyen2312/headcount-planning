import { NextRequest } from "next/server"
import { notInArray, eq } from "drizzle-orm"
import { db, headcountProjects, projects, regions, sectors } from "@/db"
import { apiError, apiSuccess } from "@/lib/apiResponse"

export async function GET(_req: NextRequest) {
  try {
    // 1. Get existing projectIds in headcount_projects
    const existingHP = await db
      .select({ projectId: headcountProjects.projectId })
      .from(headcountProjects)

    const existingProjectIds = existingHP.map((hp) => hp.projectId)

    // 2. Query available projects
    const availableProjects = await db
      .select({
        id: projects.id,
        code: projects.code,
        name: projects.name,
        address: projects.address,
        status: projects.status,
        regionId: regions.id,
        regionName: regions.name,
        sectorId: sectors.id,
        sectorName: sectors.name,
      })
      .from(projects)
      .leftJoin(regions, eq(projects.regionId, regions.id))
      .leftJoin(sectors, eq(regions.sectorId, sectors.id))
      .where(
        existingProjectIds.length > 0
          ? notInArray(projects.id, existingProjectIds)
          : undefined,
      )
      .orderBy(projects.name)

    return apiSuccess(
      availableProjects,
      "Lấy danh sách dự án khả dụng thành công",
    )
  } catch (error: any) {
    console.error(
      "GET /api/headcount-projects/available-projects error:",
      error,
    )
    return apiError(
      "Lỗi hệ thống khi lấy danh sách dự án khả dụng",
      500,
      500,
      error.message,
    )
  }
}

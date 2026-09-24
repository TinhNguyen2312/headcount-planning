import { eq, notInArray } from "drizzle-orm"
import { db, headcountProjects, projects, regions, sectors } from "@/db"
import { createApiHandler, PERMISSIONS } from "@/server/core"

export const GET = createApiHandler({
  permissions: [PERMISSIONS.HEADCOUNT_PROJECT_VIEW],
  handler: async () => {
    // 1. Get existing projectIds in headcount_projects
    const existingHP = await db
      .select({ projectId: headcountProjects.projectId })
      .from(headcountProjects)

    const existingProjectIds = existingHP.map((hp) => hp.projectId)

    // 2. Query available projects with native joins
    const rows = await db
      .select({
        project: projects,
        region: regions,
        sector: sectors,
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

    const availableProjects = rows.map((r) => ({
      ...r.project,
      region: r.region,
      sector: r.sector,
      regionName: r.region?.name ?? null,
      sectorName: r.sector?.name ?? null,
    }))

    return {
      data: availableProjects,
      message: "Lấy danh sách dự án khả dụng thành công",
    }
  },
})

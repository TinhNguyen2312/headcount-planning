import { headcountProjects, projects, regions, sectors } from "@/db"

export const formatHeadcountProjectRow = (row: any) => ({
  ...row.headcountProject,
  project: {
    ...row.project,
    region: row.region,
    sector: row.sector,
    regionName: row.region?.name ?? null,
    sectorName: row.sector?.name ?? null,
  },
})

export const headcountProjectSelection = {
  headcountProject: headcountProjects,
  project: projects,
  region: regions,
  sector: sectors,
}

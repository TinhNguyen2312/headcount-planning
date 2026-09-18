import { asc } from "drizzle-orm"
import { db, departments } from "@/db"
import { createApiHandler, PERMISSIONS } from "@/server/core"
import { QueryDepartmentTreeSchema } from "@/server/schemas/department.schema"
import { buildTree } from "@/lib/tree"

function pruneTreeByStatus(nodes: any[], targetStatus: string): any[] {
  const result: any[] = []
  for (const node of nodes) {
    if (node.status === targetStatus) {
      result.push({
        ...node,
        children: node.children
          ? pruneTreeByStatus(node.children, targetStatus)
          : [],
      })
    }
  }
  return result
}

export const GET = createApiHandler({
  permissions: [PERMISSIONS.DEPARTMENT_VIEW],
  querySchema: QueryDepartmentTreeSchema,
  handler: async ({ query }) => {
    const all = await db
      .select()
      .from(departments)
      .orderBy(asc(departments.level), asc(departments.name))

    const fullTree = buildTree(all)

    if (query.status === "ALL") {
      return {
        data: fullTree,
        message: "Thành công",
      }
    }

    const filterStatus = query.status || "ACTIVE"
    const prunedTree = pruneTreeByStatus(fullTree, filterStatus)

    return {
      data: prunedTree,
      message: "Thành công",
    }
  },
})

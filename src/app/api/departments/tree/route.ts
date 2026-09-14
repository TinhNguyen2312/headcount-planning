import { NextRequest } from "next/server"
import { asc } from "drizzle-orm"
import { db, departments } from "@/db"
import { apiError, apiSuccess } from "@/lib/apiResponse"
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

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const statusParam = searchParams.get("status")

    // Lấy toàn bộ cây phòng ban để giữ đúng liên kết cha - con
    const all = await db
      .select()
      .from(departments)
      .orderBy(asc(departments.level), asc(departments.name))

    const fullTree = buildTree(all)

    // Nếu truyền status=ALL thì trả về tất cả
    // Mặc định chỉ lấy các nhánh ACTIVE (nếu cha INACTIVE thì ẩn luôn toàn bộ con của nó)
    if (statusParam === "ALL") {
      return apiSuccess(fullTree)
    }

    const filterStatus = statusParam || "ACTIVE"
    const prunedTree = pruneTreeByStatus(fullTree, filterStatus)

    return apiSuccess(prunedTree)
  } catch (error) {
    console.error("Get department tree error:", error)
    return apiError("Lỗi lấy cây phòng ban", 500)
  }
}

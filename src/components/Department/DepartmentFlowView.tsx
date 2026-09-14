"use client"

import {
  Background,
  Controls,
  type Edge,
  type Node,
  ReactFlow,
} from "@xyflow/react"
import { useCallback, useMemo, useState } from "react"
import "@xyflow/react/dist/style.css"
import { departmentQueries } from "@/hooks/server/departments"
import type { DepartmentResponse } from "@/types"
import DepartmentFlowNode, {
  type DepartmentFlowNodeData,
  type DepartmentFlowNodeType,
} from "./DepartmentFlowNode"
import {
  flattenDepartmentTree,
  layoutDepartmentTree,
} from "./departmentTreeLayout"

const nodeTypes = { departmentNode: DepartmentFlowNode }

interface DepartmentFlowViewProps {
  onEditDepartment: (dept: DepartmentResponse) => void
}

const DepartmentFlowView = ({ onEditDepartment }: DepartmentFlowViewProps) => {
  const { data: rawDepartments = [] } = departmentQueries.useSuspenseTree()

  // Lọc chỉ hiển thị các phòng ban có status = ACTIVE (loại bỏ inactive)
  const departments = useMemo(() => {
    const filterActive = (
      nodes: typeof rawDepartments,
    ): typeof rawDepartments => {
      const result: typeof rawDepartments = []
      for (const node of nodes) {
        if (node.status && node.status !== "ACTIVE") {
          continue
        }
        result.push({
          ...node,
          children: node.children ? filterActive(node.children) : [],
        })
      }
      return result
    }
    return filterActive(rawDepartments)
  }, [rawDepartments])

  // Mặc định collapse tất cả node có children → chỉ hiển thị root nodes lúc đầu
  const [collapsedIds, setCollapsedIds] = useState<Set<number>>(() => {
    const ids = new Set<number>()
    const collectCollapsible = (nodes: typeof departments) => {
      for (const node of nodes) {
        if (node.children && node.children.length > 0) {
          ids.add(node.id)
          collectCollapsible(node.children)
        }
      }
    }
    collectCollapsible(departments)
    return ids
  })

  const toggleCollapsed = useCallback((id: number) => {
    setCollapsedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const { nodes, edges } = useMemo(() => {
    if (!departments || departments.length === 0) {
      return { nodes: [] as DepartmentFlowNodeType[], edges: [] as Edge[] }
    }

    const entries = flattenDepartmentTree(departments, collapsedIds)
    const { positions, stackedChildIds } = layoutDepartmentTree(entries)

    const flowNodes: DepartmentFlowNodeType[] = entries.map((entry) => ({
      id: entry.id,
      type: "departmentNode",
      position: positions.get(entry.id) ?? { x: 0, y: 0 },
      data: {
        department: entry.department,
        childCount: entry.department.children?.length ?? 0,
        expanded: !collapsedIds.has(entry.department.id),
        onToggleExpand: () => toggleCollapsed(entry.department.id),
        onEdit: onEditDepartment,
      },
      className: "nodrag nopan",
      draggable: false,
      selectable: false,
      style: { pointerEvents: "all" as const },
    }))

    const flowEdges: Edge[] = entries
      .filter((entry) => entry.parentId)
      .map((entry) => {
        const isStacked = stackedChildIds.has(entry.id)
        return {
          id: `dept-${entry.parentId}-${entry.id}`,
          source: entry.parentId as string,
          sourceHandle: "bottom",
          target: entry.id,
          targetHandle: isStacked ? "left" : "top",
          type: "smoothstep",
          style: { stroke: "var(--muted-foreground)", strokeWidth: 2 },
        }
      })

    return { nodes: flowNodes, edges: flowEdges }
  }, [departments, collapsedIds, toggleCollapsed, onEditDepartment])

  if (!departments || departments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-160 rounded-lg border bg-background text-center p-8">
        <p className="text-muted-foreground text-sm">
          Chưa có phòng ban nào được thiết lập. Hãy nhấn nút "Thêm phòng ban" để
          bắt đầu xây dựng sơ đồ tổ chức.
        </p>
      </div>
    )
  }

  return (
    <div className="h-160 w-full overflow-hidden rounded-lg border bg-background">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        onNodeDoubleClick={(_, node: Node) => {
          const nodeData = node.data as DepartmentFlowNodeData | undefined
          if (nodeData?.department) onEditDepartment(nodeData.department)
        }}
        proOptions={{ hideAttribution: true }}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.2}
      >
        <Background gap={20} />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  )
}

export default DepartmentFlowView

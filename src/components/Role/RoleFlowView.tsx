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
import RoleBusEdge from "./RoleBusEdge"
import RoleFlowNode, {
  type RoleFlowNodeData,
  type RoleFlowNodeType,
} from "./RoleFlowNode"
import {
  flattenVisible,
  isSpecialistRole,
  layoutPcdRoleTree,
  layoutWithDagre,
} from "./roleTreeLayout"
import { roleQueries } from "@/hooks/server/roles"
import type { RoleResponse } from "@/types"

const nodeTypes = { roleNode: RoleFlowNode }
const edgeTypes = { roleBus: RoleBusEdge }

interface RoleFlowViewProps {
  onEditRole: (role: RoleResponse) => void
}

const RoleFlowView = ({ onEditRole }: RoleFlowViewProps) => {
  const { data: roles = [] } = roleQueries.useSuspenseTree()
  const [collapsedIds, setCollapsedIds] = useState<Set<number>>(() => new Set())

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
    if (!roles || roles.length === 0) {
      return { nodes: [] as RoleFlowNodeType[], edges: [] as Edge[] }
    }

    const entries = flattenVisible(roles, collapsedIds)
    const positions = layoutPcdRoleTree(entries) ?? layoutWithDagre(entries)

    const flowNodes: RoleFlowNodeType[] = entries.map((entry) => ({
      id: entry.id,
      type: "roleNode",
      position: positions.get(entry.id) ?? { x: 0, y: 0 },
      data: {
        role: entry.role,
        childCount: entry.role.children.length,
        expanded: !collapsedIds.has(entry.role.id),
        onToggleExpand: () => toggleCollapsed(entry.role.id),
        onEdit: onEditRole,
      },
      className: "nodrag nopan",
      draggable: false,
      selectable: false,
      style: { pointerEvents: "all" as const },
    }))

    const flowEdges: Edge[] = entries
      .filter((entry) => entry.parentId)
      .map((entry) => {
        const isSpecialistNode = isSpecialistRole(entry.role)
        return {
          id: `${entry.parentId}-${entry.id}`,
          source: entry.parentId as string,
          sourceHandle: "bottom",
          target: entry.id,
          targetHandle: isSpecialistNode ? "left" : "top",
          type: "roleBus",
          style: { stroke: "var(--muted-foreground)", strokeWidth: 2 },
        }
      })

    return { nodes: flowNodes, edges: flowEdges }
  }, [roles, collapsedIds, toggleCollapsed, onEditRole])

  if (!roles || roles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-160 rounded-lg border bg-background text-center p-8">
        <p className="text-muted-foreground text-sm">
          Chưa có chức vụ nào được thiết lập. Hãy nhấn nút "Thêm chức vụ" để bắt
          đầu.
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
        edgeTypes={edgeTypes}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        onNodeDoubleClick={(_, node: Node) => {
          const nodeData = node.data as RoleFlowNodeData | undefined
          if (nodeData?.role) onEditRole(nodeData.role)
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

export default RoleFlowView

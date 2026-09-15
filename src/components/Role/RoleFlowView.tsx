/* eslint-disable no-useless-assignment */
"use client"

import {
  Background,
  Controls,
  type Edge,
  type Node,
  ReactFlow,
  ReactFlowProvider,
} from "@xyflow/react"
import { useCallback, useMemo, useState } from "react"
import "@xyflow/react/dist/style.css"
import { Building2 } from "lucide-react"
import { roleQueries } from "@/hooks/server/roles"
import type { RoleResponse } from "@/types"
import DepartmentGroupNode from "./DepartmentGroupNode"
import RoleBusEdge from "./RoleBusEdge"
import RoleFlowNode, { type RoleFlowNodeData } from "./RoleFlowNode"
import { flattenVisible, layoutDepartmentGroupedTree } from "./roleTreeLayout"

const nodeTypes = {
  roleNode: RoleFlowNode,
  departmentGroup: DepartmentGroupNode,
}

const edgeTypes = {
  roleBus: RoleBusEdge,
}

interface RoleFlowViewProps {
  onEditRole: (role: RoleResponse) => void
}

const FlowContent = ({ onEditRole }: RoleFlowViewProps) => {
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
      return { nodes: [] as Node[], edges: [] as Edge[] }
    }

    const entries = flattenVisible(roles, collapsedIds)

    let flowNodes: Node[] = []
    let flowEdges: Edge[] = []
    let positions = new Map<string, { x: number; y: number }>()

    const res = layoutDepartmentGroupedTree(entries)
    positions = res.positions

    const groupNodes: Node[] = res.groups.map((g) => ({
      id: g.id,
      type: "departmentGroup",
      position: { x: g.x, y: g.y },
      data: g,
      draggable: false,
      selectable: false,
      zIndex: -1,
      style: { pointerEvents: "none" as const },
    }))

    const roleNodes: Node[] = entries.map((entry) => ({
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
      zIndex: 10,
      style: { pointerEvents: "all" as const },
    }))

    flowNodes = [...groupNodes, ...roleNodes]
    flowEdges = res.edges.map((e) => ({
      id: `${e.source}-${e.target}`,
      source: e.source,
      sourceHandle: "bottom",
      target: e.target,
      targetHandle: e.targetHandle ?? "top",
      type: "roleBus",
      style: { stroke: "#475569", strokeWidth: 1.8, opacity: 0.9 },
    }))
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
    <div className="flex flex-col gap-2.5 w-full">
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg border bg-card/60 backdrop-blur-xs"></div>

      <div className="h-170 w-full overflow-hidden rounded-lg border bg-background relative">
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
          fitViewOptions={{ padding: 0.1 }}
          minZoom={0.1}
          maxZoom={1.5}
        >
          <Background gap={24} size={1} />
          <Controls showInteractive={false} />
        </ReactFlow>

        <div className="absolute bottom-3 left-3 z-20 flex flex-col gap-1 px-3 py-2 rounded-md border bg-card/90 backdrop-blur-sm text-[11px] shadow-xs select-none pointer-events-none">
          <span className="font-semibold text-muted-foreground text-[10px] uppercase tracking-wider">
            Sơ đồ tổ chức
          </span>
          <div className="flex flex-wrap items-center gap-3 mt-0.5 text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-foreground" />
              Tuyến báo cáo trực tiếp
            </span>
            <span className="flex items-center gap-1.5">
              <Building2 className="size-3 text-muted-foreground" />
              Nhóm theo Phòng / Ban chức năng
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

const RoleFlowView = (props: RoleFlowViewProps) => {
  return (
    <ReactFlowProvider>
      <FlowContent {...props} />
    </ReactFlowProvider>
  )
}

export default RoleFlowView

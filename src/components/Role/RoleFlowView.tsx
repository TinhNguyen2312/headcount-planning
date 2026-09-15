/* eslint-disable no-useless-assignment */
"use client"

import {
  Background,
  Controls,
  type Edge,
  type Node,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
} from "@xyflow/react"
import { Button, Segmented } from "antd"
import {
  Building2,
  GitGraph,
  Maximize2,
  Table as TableIcon,
} from "lucide-react"
import { useCallback, useMemo, useState } from "react"
import "@xyflow/react/dist/style.css"
import { roleQueries } from "@/hooks/server/roles"
import type { RoleResponse, RoleTreeNodeResponse } from "@/types"
import DepartmentGroupNode from "./DepartmentGroupNode"
import RoleBusEdge from "./RoleBusEdge"
import RoleFlowNode, { type RoleFlowNodeData } from "./RoleFlowNode"
import RoleTableView from "./RoleTableView"
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

interface FlowContentProps {
  roles: RoleTreeNodeResponse[]
  onEditRole: (role: RoleResponse) => void
}

const FlowContent = ({ roles, onEditRole }: FlowContentProps) => {
  const { fitView } = useReactFlow()
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

      {/* Floating Action to Fit View */}
      <div className="absolute top-3 right-3 z-20">
        <Button
          icon={<Maximize2 className="size-3.5" />}
          size="small"
          onClick={() => fitView({ padding: 0.1, duration: 400 })}
          className="bg-card/90 backdrop-blur shadow-xs"
        >
          Căn chỉnh góc nhìn
        </Button>
      </div>

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
  )
}

const RoleFlowView = ({ onEditRole }: RoleFlowViewProps) => {
  const [viewMode, setViewMode] = useState<"FLOW" | "TABLE">("FLOW")
  const { data: roles = [], isLoading } = roleQueries.useSuspenseTree()

  return (
    <div className="flex flex-col gap-2.5 w-full">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2.5 rounded-lg border bg-card/60 backdrop-blur-xs">
        <div className="flex items-center gap-2">
          <Segmented
            value={viewMode}
            onChange={(val) => setViewMode(val as "FLOW" | "TABLE")}
            options={[
              {
                value: "FLOW",
                label: (
                  <div className="flex items-center gap-1.5 px-1 py-0.5">
                    <GitGraph className="size-4" />
                    <span>Sơ đồ</span>
                  </div>
                ),
              },
              {
                value: "TABLE",
                label: (
                  <div className="flex items-center gap-1.5 px-1 py-0.5">
                    <TableIcon className="size-4" />
                    <span>Bảng</span>
                  </div>
                ),
              },
            ]}
          />
        </div>
      </div>

      {/* Main Content View */}
      {viewMode === "FLOW" ? (
        <ReactFlowProvider>
          <FlowContent roles={roles} onEditRole={onEditRole} />
        </ReactFlowProvider>
      ) : (
        <RoleTableView
          roles={roles}
          isLoading={isLoading}
          onEditRole={onEditRole}
        />
      )}
    </div>
  )
}

export default RoleFlowView

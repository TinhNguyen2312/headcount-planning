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
import { useCallback, useMemo, useState } from "react"
import "@xyflow/react/dist/style.css"
import { Button, Input, Select } from "antd"
import { Building2, RotateCcw, Search } from "lucide-react"
import { roleQueries } from "@/hooks/server/roles"
import type { RoleResponse, RoleTreeNodeResponse } from "@/types"
import DepartmentGroupNode from "./DepartmentGroupNode"
import RoleBusEdge from "./RoleBusEdge"
import RoleFlowNode, { type RoleFlowNodeData } from "./RoleFlowNode"
import {
  flattenVisible,
  layoutDepartmentGroupedTree,
  layoutWithDagre,
} from "./roleTreeLayout"

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
  const { fitView } = useReactFlow()

  const [collapsedIds, setCollapsedIds] = useState<Set<number>>(() => new Set())
  const [selectedDeptId, setSelectedDeptId] = useState<number | "ALL">("ALL")
  const [searchKeyword, setSearchKeyword] = useState<string>("")
  const [groupByDept, setGroupByDept] = useState<boolean>(true)

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

  const departmentOptions = useMemo(() => {
    const map = new Map<number, { id: number; name: string; code?: string }>()
    const scan = (nodes: RoleTreeNodeResponse[]) => {
      for (const n of nodes) {
        if (n.departmentId && n.departmentName) {
          map.set(n.departmentId, {
            id: n.departmentId,
            name: n.departmentName,
            code: n.departmentCode ?? undefined,
          })
        }
        if (n.children) scan(n.children)
      }
    }
    scan(roles)

    return [
      { value: "ALL", label: "Tất cả Phòng ban" },
      ...Array.from(map.values()).map((d) => ({
        value: d.id,
        label: `${d.name}`,
      })),
    ]
  }, [roles])

  const filteredRoles = useMemo(() => {
    if (selectedDeptId === "ALL") return roles

    const filterNodes = (
      nodes: RoleTreeNodeResponse[],
    ): RoleTreeNodeResponse[] => {
      const matched: RoleTreeNodeResponse[] = []
      for (const n of nodes) {
        const matchesSelf = n.departmentId === selectedDeptId
        const filteredChildren = n.children ? filterNodes(n.children) : []
        if (matchesSelf || filteredChildren.length > 0) {
          matched.push({
            ...n,
            children: filteredChildren,
          })
        }
      }
      return matched
    }
    return filterNodes(roles)
  }, [roles, selectedDeptId])

  const { nodes, edges } = useMemo(() => {
    if (!filteredRoles || filteredRoles.length === 0) {
      return { nodes: [] as Node[], edges: [] as Edge[] }
    }

    const entries = flattenVisible(filteredRoles, collapsedIds)

    const visibleEntries = searchKeyword.trim()
      ? entries.filter(
          (e) =>
            e.role.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
            e.role.code?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
            e.role.shortCode
              ?.toLowerCase()
              .includes(searchKeyword.toLowerCase()) ||
            e.role.departmentName
              ?.toLowerCase()
              .includes(searchKeyword.toLowerCase()),
        )
      : entries

    let flowNodes: Node[] = []
    let flowEdges: Edge[] = []
    let positions = new Map<string, { x: number; y: number }>()

    if (groupByDept && selectedDeptId === "ALL") {
      const res = layoutDepartmentGroupedTree(visibleEntries)
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

      const roleNodes: Node[] = visibleEntries.map((entry) => ({
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
    } else {
      positions = layoutWithDagre(visibleEntries)
      flowNodes = visibleEntries.map((entry) => ({
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

      const visibleIdSet = new Set(visibleEntries.map((e) => e.id))
      flowEdges = visibleEntries
        .filter((entry) => entry.parentId && visibleIdSet.has(entry.parentId))
        .map((entry) => ({
          id: `${entry.parentId}-${entry.id}`,
          source: entry.parentId as string,
          sourceHandle: "bottom",
          target: entry.id,
          targetHandle: "top",
          type: "roleBus",
          style: { stroke: "#475569", strokeWidth: 1.8, opacity: 0.9 },
        }))
    }

    return { nodes: flowNodes, edges: flowEdges }
  }, [
    filteredRoles,
    collapsedIds,
    toggleCollapsed,
    onEditRole,
    searchKeyword,
    groupByDept,
    selectedDeptId,
  ])

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
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg border bg-card/60 backdrop-blur-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            <Building2 className="size-3.5" />
            Lọc theo phòng ban:
          </span>
          <Select
            value={selectedDeptId}
            onChange={(val) => setSelectedDeptId(val)}
            options={departmentOptions}
            className="w-72!"
            showSearch
            filterOption={(input, option) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
          />

          <Input
            placeholder="Tìm kiếm chức vụ..."
            prefix={<Search className="size-3.5 text-muted-foreground" />}
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            allowClear
            className="w-56!"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="small"
            type={groupByDept ? "primary" : "default"}
            onClick={() => setGroupByDept(!groupByDept)}
          >
            {groupByDept ? "✓ Nhóm theo Phòng ban" : "Dạng phẳng"}
          </Button>

          <Button
            size="small"
            icon={<RotateCcw className="size-3.5" />}
            onClick={() => {
              setCollapsedIds(new Set())
              setSelectedDeptId("ALL")
              setSearchKeyword("")
              setTimeout(() => fitView({ padding: 0.1, duration: 400 }), 100)
            }}
          >
            Đặt lại
          </Button>
        </div>
      </div>

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

import { Background, Controls, MiniMap, ReactFlow } from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import { useCallback, useMemo, useState } from "react"

import DepartmentGroupNode from "@/components/Role/DepartmentGroupNode"
import RoleBusEdge from "@/components/Role/RoleBusEdge"
import type {
  ProjectResponse,
  RoleTreeNodeResponse,
  UserTreeNodeResponse,
} from "@/types"
import ProjectGroupFlowNode from "./ProjectGroupFlowNode"
import RoleGroupFlowNode from "./RoleGroupFlowNode"
import { buildRoleFlowElements } from "./roleOrgChart"

const nodeTypes = {
  roleGroupNode: RoleGroupFlowNode,
  departmentGroupNode: DepartmentGroupNode,
  projectGroupNode: ProjectGroupFlowNode,
}

const edgeTypes = {
  roleBus: RoleBusEdge,
}

interface RoleTreeViewProps {
  trees: UserTreeNodeResponse[]
  roles: RoleTreeNodeResponse[]
  projects?: ProjectResponse[]
  selectedProjectId?: number
}

export const RoleTreeView = ({
  trees,
  roles,
  projects,
  selectedProjectId,
}: RoleTreeViewProps) => {
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
    return buildRoleFlowElements(
      trees,
      roles,
      projects,
      selectedProjectId,
      collapsedIds,
      toggleCollapsed,
    )
  }, [trees, roles, projects, selectedProjectId, collapsedIds, toggleCollapsed])

  return (
    <div
      style={{ height: 680 }}
      className="w-full overflow-hidden rounded-lg border bg-background relative shadow-xs mt-1"
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        proOptions={{ hideAttribution: true }}
        fitView
        minZoom={0.15}
        maxZoom={1.5}
      >
        <Background gap={20} size={1} />
        <Controls showInteractive={false} />
        <MiniMap pannable zoomable className="bg-card! border shadow-xs" />
      </ReactFlow>
    </div>
  )
}

export default RoleTreeView

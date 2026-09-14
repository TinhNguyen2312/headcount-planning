import { Background, Controls, MiniMap, ReactFlow } from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import { useMemo } from "react"

import type {
  ProjectResponse,
  RoleResponse,
  UserTreeNodeResponse,
} from "@/types"
import ProjectGroupFlowNode from "./ProjectGroupFlowNode"
import RoleGroupFlowNode from "./RoleGroupFlowNode"
import { buildRoleFlowElements } from "./roleOrgChart"

const nodeTypes = {
  roleGroupNode: RoleGroupFlowNode,
  projectGroupNode: ProjectGroupFlowNode,
}

interface RoleTreeViewProps {
  trees: UserTreeNodeResponse[]
  roles: RoleResponse[]
  projects?: ProjectResponse[]
  selectedProjectId?: number
}

export const RoleTreeView = ({
  trees,
  roles,
  projects,
  selectedProjectId,
}: RoleTreeViewProps) => {
  const { nodes, edges } = useMemo(() => {
    return buildRoleFlowElements(trees, roles, projects, selectedProjectId)
  }, [trees, roles, projects, selectedProjectId])

  return (
    <div
      style={{ height: 680 }}
      className="w-full overflow-hidden rounded-lg border bg-background relative shadow-xs mt-1"
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
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

import { Handle, type Node, type NodeProps, Position } from "@xyflow/react"

import type { RoleResponse } from "@/types"
import RoleNode from "./RoleNode"

export interface RoleFlowNodeData extends Record<string, unknown> {
  role: RoleResponse
  childCount: number
  expanded: boolean
  onToggleExpand: () => void
  onEdit?: (role: RoleResponse) => void
}

export type RoleFlowNodeType = Node<RoleFlowNodeData, "roleNode">

const RoleFlowNode = ({ data }: NodeProps<RoleFlowNodeType>) => {
  const { role, childCount, expanded, onToggleExpand, onEdit } = data

  return (
    <div className="nodrag nopan relative">
      <Handle
        type="target"
        id="top"
        position={Position.Top}
        className="!opacity-0"
        isConnectable={false}
      />
      <Handle
        type="target"
        id="left"
        position={Position.Left}
        className="!opacity-0"
        isConnectable={false}
      />
      <Handle
        type="source"
        id="source-left"
        position={Position.Left}
        className="!opacity-0"
        isConnectable={false}
      />
      <RoleNode
        role={role}
        childCount={childCount}
        expanded={expanded}
        onToggleExpand={onToggleExpand}
        onEdit={onEdit}
      />
      <Handle
        type="source"
        id="bottom"
        position={Position.Bottom}
        className="!opacity-0"
        isConnectable={false}
      />
    </div>
  )
}

export default RoleFlowNode

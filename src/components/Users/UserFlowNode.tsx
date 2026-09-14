import { Handle, type Node, type NodeProps, Position } from "@xyflow/react"

import type { UserTreeNodeResponse } from "@/types"
import UserNode from "./UserNode"

export interface UserFlowNodeData extends Record<string, unknown> {
  user: UserTreeNodeResponse
  childCount: number
  expanded: boolean
  onToggleExpand: () => void
  isHighlighted?: boolean
}

export type UserFlowNodeType = Node<UserFlowNodeData, "userNode">

const UserFlowNode = ({ data }: NodeProps<UserFlowNodeType>) => {
  const { user, childCount, expanded, onToggleExpand, isHighlighted } = data

  return (
    <div className="nodrag nopan">
      <Handle
        type="target"
        position={Position.Top}
        className="!opacity-0"
        isConnectable={false}
      />
      <UserNode
        user={user}
        childCount={childCount}
        expanded={expanded}
        onToggleExpand={onToggleExpand}
        isHighlighted={isHighlighted}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!opacity-0"
        isConnectable={false}
      />
    </div>
  )
}

export default UserFlowNode

import { Handle, type Node, type NodeProps, Position } from "@xyflow/react"
import UserRoleNode, { type UserRoleNodeProps } from "./RoleGroupNode"

export type UserRoleFlowNodeData = UserRoleNodeProps & Record<string, unknown>
export type RoleGroupFlowNodeType = Node<UserRoleFlowNodeData, "roleGroupNode">

const RoleGroupFlowNode = ({ data }: NodeProps<RoleGroupFlowNodeType>) => {
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
      <UserRoleNode {...data} />
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

export default RoleGroupFlowNode

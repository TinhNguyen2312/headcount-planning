import { Handle, type Node, type NodeProps, Position } from "@xyflow/react"
import RoleGroupNode, { type RoleGroupNodeData } from "./RoleGroupNode"

export type RoleGroupFlowNodeType = Node<RoleGroupNodeData, "roleGroupNode">

const RoleGroupFlowNode = ({ data }: NodeProps<RoleGroupFlowNodeType>) => {
  return (
    <div className="nodrag nopan w-[260px]">
      <Handle
        type="target"
        position={Position.Top}
        className="!opacity-0"
        isConnectable={false}
      />
      <RoleGroupNode data={data} />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!opacity-0"
        isConnectable={false}
      />
    </div>
  )
}

export default RoleGroupFlowNode

import { Handle, type Node, type NodeProps, Position } from "@xyflow/react"
import type { DepartmentResponse } from "@/types"
import DepartmentNode from "./DepartmentNode"

export interface DepartmentFlowNodeData extends Record<string, unknown> {
  department: DepartmentResponse
  childCount: number
  expanded: boolean
  onToggleExpand: () => void
  onEdit?: (department: DepartmentResponse) => void
}

export type DepartmentFlowNodeType = Node<
  DepartmentFlowNodeData,
  "departmentNode"
>

const DepartmentFlowNode = ({ data }: NodeProps<DepartmentFlowNodeType>) => {
  const { department, childCount, expanded, onToggleExpand, onEdit } = data

  return (
    <div className="nodrag nopan">
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
        type="target"
        id="right"
        position={Position.Right}
        className="!opacity-0"
        isConnectable={false}
      />
      <DepartmentNode
        department={department}
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

export default DepartmentFlowNode

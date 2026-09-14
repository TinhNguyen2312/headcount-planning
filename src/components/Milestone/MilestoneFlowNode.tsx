import { Handle, type Node, type NodeProps, Position } from "@xyflow/react"
import React from "react"
import type { MilestoneResponse } from "@/types"
import MilestoneNode from "./MilestoneNode"

export interface MilestoneFlowNodeData extends Record<string, unknown> {
  milestone: MilestoneResponse
  onEdit?: (milestone: MilestoneResponse) => void
  onDelete?: (milestone: MilestoneResponse) => void
}

export type MilestoneFlowNodeType = Node<MilestoneFlowNodeData, "milestoneNode">

const MilestoneFlowNode: React.FC<NodeProps<MilestoneFlowNodeType>> = ({
  data,
}) => {
  const { milestone, onEdit, onDelete } = data

  return (
    <div className="nodrag nopan relative">
      {/* Target Handles (incoming dependencies) */}
      <Handle
        type="target"
        id="left"
        position={Position.Left}
        className="size-2! bg-primary! border-2! border-background!"
        isConnectable={false}
      />
      <Handle
        type="target"
        id="top"
        position={Position.Top}
        className="size-2! bg-primary! border-2! border-background! opacity-0!"
        isConnectable={false}
      />

      <MilestoneNode
        milestone={milestone}
        onEdit={onEdit}
        onDelete={onDelete}
      />

      {/* Source Handles (outgoing dependencies) */}
      <Handle
        type="source"
        id="right"
        position={Position.Right}
        className="size-2! bg-primary! border-2! border-background!"
        isConnectable={false}
      />
      <Handle
        type="source"
        id="bottom"
        position={Position.Bottom}
        className="size-2! bg-primary! border-2! border-background! opacity-0!"
        isConnectable={false}
      />
    </div>
  )
}

export default MilestoneFlowNode

import type { Node, NodeProps } from "@xyflow/react"
import ProjectGroupNode, { type ProjectGroupNodeData } from "./ProjectGroupNode"

export type ProjectGroupFlowNodeType = Node<
  ProjectGroupNodeData,
  "projectGroupNode"
>

const ProjectGroupFlowNode = ({
  data,
}: NodeProps<ProjectGroupFlowNodeType>) => {
  return (
    <div className="nodrag nopan pointer-events-none">
      <ProjectGroupNode data={data} />
    </div>
  )
}

export default ProjectGroupFlowNode

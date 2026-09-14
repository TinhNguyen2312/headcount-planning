import { Background, Controls, MiniMap, ReactFlow } from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import { Button } from "antd"
import { ChevronsDownUp, ChevronsUpDown } from "lucide-react"
import { useCallback, useMemo, useState } from "react"

import type { UserTreeNodeResponse } from "@/types"
import { buildManagerFlowElements } from "./managerOrgChart"
import UserFlowNode from "./UserFlowNode"

const nodeTypes = {
  userNode: UserFlowNode,
}

interface ManagerTreeViewProps {
  trees: UserTreeNodeResponse[]
}

export const ManagerTreeView = ({ trees }: ManagerTreeViewProps) => {
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

  const handleExpandAll = useCallback(() => {
    setCollapsedIds(new Set())
  }, [])

  const handleCollapseAll = useCallback(() => {
    if (!trees || trees.length === 0) return
    const parentIds = new Set<number>()
    const findParents = (nodes: UserTreeNodeResponse[]) => {
      for (const node of nodes) {
        if (node.children && node.children.length > 0) {
          parentIds.add(node.id)
          findParents(node.children)
        }
      }
    }
    findParents(trees)
    setCollapsedIds(parentIds)
  }, [trees])

  const { nodes, edges } = useMemo(() => {
    return buildManagerFlowElements(trees, collapsedIds, toggleCollapsed)
  }, [trees, collapsedIds, toggleCollapsed])

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-end gap-2">
        <Button
          size="small"
          onClick={handleExpandAll}
          className="h-8 text-base gap-1"
          title="Mở rộng toàn bộ cây phân cấp"
          icon={<ChevronsUpDown className="size-3.5" />}
        >
          Mở rộng
        </Button>

        <Button
          size="small"
          onClick={handleCollapseAll}
          className="h-8 text-base gap-1"
          title="Thu gọn toàn bộ cây phân cấp"
          icon={<ChevronsDownUp className="size-3.5" />}
        >
          Thu gọn
        </Button>
      </div>

      <div
        style={{ height: 680 }}
        className="w-full overflow-hidden rounded-lg border bg-background relative shadow-xs"
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
    </div>
  )
}

export default ManagerTreeView

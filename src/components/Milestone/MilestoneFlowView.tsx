"use client"

import {
  Background,
  Controls,
  type Edge,
  MarkerType,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
} from "@xyflow/react"
import { Button, Radio, Segmented, Tooltip } from "antd"
import {
  ArrowDownUp,
  ArrowLeftRight,
  GitGraph,
  Maximize2,
  Table as TableIcon,
} from "lucide-react"
import React, { useCallback, useMemo, useState } from "react"
import "@xyflow/react/dist/style.css"

import { milestoneQueries } from "@/hooks/server/milestones"
import type { MilestoneResponse } from "@/types"
import MilestoneFlowNode, {
  type MilestoneFlowNodeType,
} from "./MilestoneFlowNode"
import MilestoneTableView from "./MilestoneTableView"
import { layoutMilestonesDag } from "./milestoneTreeLayout"

const nodeTypes = { milestoneNode: MilestoneFlowNode }

interface MilestoneFlowViewProps {
  onEditMilestone: (milestone: MilestoneResponse) => void
  onDeleteMilestone?: (milestone: MilestoneResponse) => void
}

const FlowCanvas: React.FC<{
  milestones: MilestoneResponse[]
  direction: "LR" | "TB"
  onEditMilestone: (milestone: MilestoneResponse) => void
  onDeleteMilestone: (milestone: MilestoneResponse) => void
}> = ({ milestones, direction, onEditMilestone, onDeleteMilestone }) => {
  const { fitView } = useReactFlow()

  const { nodes, edges } = useMemo(() => {
    if (!milestones || milestones.length === 0) {
      return { nodes: [] as MilestoneFlowNodeType[], edges: [] as Edge[] }
    }

    const { positions } = layoutMilestonesDag(milestones, direction)

    const flowNodes: MilestoneFlowNodeType[] = milestones.map((m) => ({
      id: String(m.id),
      type: "milestoneNode",
      position: positions.get(String(m.id)) ?? { x: 0, y: 0 },
      data: {
        milestone: m,
        onEdit: onEditMilestone,
        onDelete: onDeleteMilestone,
      },
      className: "nodrag nopan",
      draggable: false,
      selectable: false,
      style: { pointerEvents: "all" as const },
    }))

    const flowEdges: Edge[] = []
    for (const m of milestones) {
      if (m.predecessorIds && m.predecessorIds.length > 0) {
        for (const predId of m.predecessorIds) {
          flowEdges.push({
            id: `edge-${predId}-${m.id}`,
            source: String(predId),
            sourceHandle: direction === "LR" ? "right" : "bottom",
            target: String(m.id),
            targetHandle: direction === "LR" ? "left" : "top",
            type: "smoothstep",
            animated: true,
            markerEnd: {
              type: MarkerType.ArrowClosed,
              width: 14,
              height: 14,
              color: "var(--color-primary, #1890ff)",
            },
            style: {
              stroke: "var(--color-primary, #1890ff)",
              strokeWidth: 2,
            },
          })
        }
      }
    }

    return { nodes: flowNodes, edges: flowEdges }
  }, [milestones, direction, onEditMilestone, onDeleteMilestone])

  return (
    <div className="relative h-[650px] w-full rounded-lg border bg-background/50 overflow-hidden shadow-inner">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.2}
        maxZoom={1.5}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        proOptions={{ hideAttribution: true }}
      >
        <Background gap={20} size={1} color="var(--border, #e5e7eb)" />
        <Controls
          showInteractive={false}
          className="bg-card! border-border! shadow-sm!"
        />
        <MiniMap
          nodeStrokeColor="#1890ff"
          nodeColor="#e6f7ff"
          className="bg-card! border-border! rounded-lg overflow-hidden shadow-md!"
        />
      </ReactFlow>

      {/* Floating Action to Fit View */}
      <div className="absolute top-3 right-3 z-10">
        <Button
          icon={<Maximize2 className="size-3.5" />}
          size="small"
          onClick={() => fitView({ padding: 0.2, duration: 400 })}
          className="bg-card/90 backdrop-blur"
        >
          Căn chỉnh góc nhìn
        </Button>
      </div>
    </div>
  )
}

const MilestoneFlowView: React.FC<MilestoneFlowViewProps> = ({
  onEditMilestone,
}) => {
  const [viewMode, setViewMode] = useState<"DAG" | "TABLE">("DAG")
  const [direction, setDirection] = useState<"LR" | "TB">("LR")

  const { data: milestones = [], isLoading } = milestoneQueries.useList({
    limit: 200,
  })
  const deleteMutation = milestoneQueries.useDelete()

  const handleDelete = useCallback(
    async (milestone: MilestoneResponse) => {
      await deleteMutation.mutateAsync(milestone.id)
    },
    [deleteMutation],
  )

  return (
    <div className="space-y-4">
      {/* Top Toolbar */}
      <div className="flex items-center justify-between gap-4 flex-wrap bg-card/60 p-2.5 rounded-lg border border-border/50">
        <div className="flex items-center gap-2">
          <Segmented
            value={viewMode}
            onChange={(val) => setViewMode(val as "DAG" | "TABLE")}
            options={[
              {
                value: "DAG",
                label: (
                  <div className="flex items-center gap-1.5 px-1 py-0.5">
                    <GitGraph className="size-4" />
                    <span>Sơ đồ</span>
                  </div>
                ),
              },
              {
                value: "TABLE",
                label: (
                  <div className="flex items-center gap-1.5 px-1 py-0.5">
                    <TableIcon className="size-4" />
                    <span>Bảng</span>
                  </div>
                ),
              },
            ]}
          />
        </div>

        {viewMode === "DAG" && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Hướng luồng:</span>
            <Radio.Group
              value={direction}
              onChange={(e) => setDirection(e.target.value)}
              size="small"
              optionType="button"
              buttonStyle="solid"
            >
              <Radio.Button value="LR">
                <Tooltip title="Luồng ngang (Trái sang phải - Tiến độ thời gian)">
                  <div className="flex items-center gap-1">
                    <ArrowLeftRight className="size-3" />
                    <span>Ngang</span>
                  </div>
                </Tooltip>
              </Radio.Button>
              <Radio.Button value="TB">
                <Tooltip title="Luồng dọc (Trên xuống dưới)">
                  <div className="flex items-center gap-1">
                    <ArrowDownUp className="size-3" />
                    <span>Dọc</span>
                  </div>
                </Tooltip>
              </Radio.Button>
            </Radio.Group>
          </div>
        )}
      </div>

      {/* Main Content */}
      {viewMode === "DAG" ? (
        <ReactFlowProvider>
          <FlowCanvas
            milestones={milestones}
            direction={direction}
            onEditMilestone={onEditMilestone}
            onDeleteMilestone={handleDelete}
          />
        </ReactFlowProvider>
      ) : (
        <MilestoneTableView
          milestones={milestones}
          isLoading={isLoading}
          onEditMilestone={onEditMilestone}
          onDeleteMilestone={handleDelete}
        />
      )}
    </div>
  )
}

export default MilestoneFlowView

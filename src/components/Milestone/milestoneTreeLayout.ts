import dagre from "dagre"
import type { MilestoneResponse } from "@/types"

export const MILESTONE_NODE_WIDTH = 250
export const MILESTONE_NODE_HEIGHT = 100

export interface MilestoneLayoutResult {
  positions: Map<string, { x: number; y: number }>
}

export const layoutMilestonesDag = (
  milestones: MilestoneResponse[],
  direction: "LR" | "TB" = "LR",
): MilestoneLayoutResult => {
  const positions = new Map<string, { x: number; y: number }>()

  if (!milestones || milestones.length === 0) {
    return { positions }
  }

  const graph = new dagre.graphlib.Graph()
  graph.setDefaultEdgeLabel(() => ({}))
  graph.setGraph({
    rankdir: direction,
    nodesep: 50,
    ranksep: 90,
    marginx: 30,
    marginy: 30,
  })

  // 1. Add all nodes
  for (const m of milestones) {
    graph.setNode(String(m.id), {
      width: MILESTONE_NODE_WIDTH,
      height: MILESTONE_NODE_HEIGHT,
    })
  }

  // 2. Add all directed dependency edges (from predecessor -> to milestone)
  for (const m of milestones) {
    if (m.predecessorIds && m.predecessorIds.length > 0) {
      for (const predId of m.predecessorIds) {
        // Ensure both nodes exist in the graph before setting edge
        if (graph.hasNode(String(predId)) && graph.hasNode(String(m.id))) {
          graph.setEdge(String(predId), String(m.id))
        }
      }
    }
  }

  // 3. Compute layout
  dagre.layout(graph)

  // 4. Extract positions
  for (const m of milestones) {
    const node = graph.node(String(m.id))
    if (node) {
      positions.set(String(m.id), {
        x: node.x - MILESTONE_NODE_WIDTH / 2,
        y: node.y - MILESTONE_NODE_HEIGHT / 2,
      })
    }
  }

  return { positions }
}

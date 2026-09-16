import type { Edge } from "@xyflow/react"
import dagre from "dagre"
import type { UserTreeNodeResponse } from "@/types"
import type { UserFlowNodeType } from "./UserFlowNode"
import { USER_NODE_HEIGHT, USER_NODE_WIDTH } from "./UserNode"

export interface FlatEntry {
  id: string
  user: UserTreeNodeResponse
  parentId: string | null
}

export const filterLockedUsers = (
  nodes: UserTreeNodeResponse[],
): UserTreeNodeResponse[] => {
  const result: UserTreeNodeResponse[] = []
  for (const node of nodes) {
    const filteredChildren = filterLockedUsers(node.children || [])
    if (node.status === "LOCKED") {
      result.push(...filteredChildren)
    } else {
      result.push({
        ...node,
        children: filteredChildren,
      })
    }
  }
  return result
}

export const collectAllNodeIds = (nodes: UserTreeNodeResponse[]): number[] => {
  const ids: number[] = []
  const visit = (node: UserTreeNodeResponse) => {
    ids.push(node.id)
    for (const child of node.children || []) {
      visit(child)
    }
  }
  for (const node of nodes) {
    visit(node)
  }
  return ids
}

export const layoutManagerHierarchyWithDagre = (
  roots: UserTreeNodeResponse[],
  collapsedIds: Set<number>,
) => {
  const positionMap = new Map<string, { x: number; y: number }>()
  const entries: FlatEntry[] = []

  const treeRoots: UserTreeNodeResponse[] = []
  const standaloneRoots: UserTreeNodeResponse[] = []

  for (const root of roots) {
    if (root.children && root.children.length > 0) {
      treeRoots.push(root)
    } else {
      standaloneRoots.push(root)
    }
  }

  if (treeRoots.length === 0 && standaloneRoots.length > 0) {
    treeRoots.push(...standaloneRoots)
    standaloneRoots.length = 0
  }

  let currentXOffset = 0
  let maxTreeY = 0

  for (const root of treeRoots) {
    const subEntries: FlatEntry[] = []
    const visit = (user: UserTreeNodeResponse, parentId: string | null) => {
      const id = String(user.id)
      const entry = { id, user, parentId }
      subEntries.push(entry)
      entries.push(entry)
      if (!collapsedIds.has(user.id)) {
        for (const child of user.children || []) {
          visit(child, id)
        }
      }
    }
    visit(root, null)

    const graph = new dagre.graphlib.Graph()
    graph.setDefaultEdgeLabel(() => ({}))
    graph.setGraph({
      rankdir: "TB",
      nodesep: 32,
      ranksep: 72,
    })

    for (const entry of subEntries) {
      graph.setNode(entry.id, {
        width: USER_NODE_WIDTH,
        height: USER_NODE_HEIGHT,
      })
    }
    for (const entry of subEntries) {
      if (entry.parentId) {
        graph.setEdge(entry.parentId, entry.id)
      }
    }

    dagre.layout(graph)

    let minX = Infinity
    let maxX = -Infinity
    let maxY = -Infinity

    for (const entry of subEntries) {
      const node = graph.node(entry.id)
      minX = Math.min(minX, node.x - USER_NODE_WIDTH / 2)
      maxX = Math.max(maxX, node.x + USER_NODE_WIDTH / 2)
      maxY = Math.max(maxY, node.y + USER_NODE_HEIGHT / 2)
    }

    const treeWidth = maxX - minX

    for (const entry of subEntries) {
      const node = graph.node(entry.id)
      const posX = currentXOffset + (node.x - USER_NODE_WIDTH / 2 - minX)
      const posY = node.y - USER_NODE_HEIGHT / 2
      positionMap.set(entry.id, { x: posX, y: posY })
    }

    currentXOffset += treeWidth + 96
    maxTreeY = Math.max(maxTreeY, maxY)
  }

  if (standaloneRoots.length > 0) {
    const standaloneY = maxTreeY > 0 ? maxTreeY + 96 : 0
    let standaloneX = 0

    for (const root of standaloneRoots) {
      const id = String(root.id)
      entries.push({ id, user: root, parentId: null })
      positionMap.set(id, { x: standaloneX, y: standaloneY })
      standaloneX += USER_NODE_WIDTH + 24
    }
  }

  return { entries, positionMap }
}

export const buildManagerFlowElements = (
  activeTree: UserTreeNodeResponse[],
  collapsedIds: Set<number>,
  toggleCollapsed: (id: number) => void,
) => {
  if (!activeTree || activeTree.length === 0) {
    return { nodes: [] as UserFlowNodeType[], edges: [] as Edge[] }
  }

  const { entries, positionMap } = layoutManagerHierarchyWithDagre(
    activeTree,
    collapsedIds,
  )

  const nodes: UserFlowNodeType[] = entries.map((entry) => ({
    id: entry.id,
    type: "userNode",
    position: positionMap.get(entry.id) ?? { x: 0, y: 0 },
    data: {
      user: entry.user,
      childCount: entry.user.children ? entry.user.children.length : 0,
      expanded: !collapsedIds.has(entry.user.id),
      onToggleExpand: () => toggleCollapsed(entry.user.id),
      isHighlighted: false,
    },
    className: "nodrag nopan",
    draggable: false,
    selectable: false,
    style: { pointerEvents: "all" as const },
  }))

  const edges: Edge[] = entries
    .filter((entry) => entry.parentId)
    .map((entry) => ({
      id: `${entry.parentId}-${entry.id}`,
      source: entry.parentId as string,
      target: entry.id,
      type: "smoothstep",
      style: { stroke: "var(--muted-foreground)", strokeWidth: 2 },
    }))

  return { nodes, edges }
}

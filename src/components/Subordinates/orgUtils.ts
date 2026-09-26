import type { UserTreeNodeResponse } from "@/types"
import type { SubordinateEmployee, SubordinateTreeNode } from "./types"

export const getInitials = (name: string): string =>
  name
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("")

export const toSubordinateEmployee = (
  node: UserTreeNodeResponse,
): SubordinateEmployee => ({
  id: node.id,
  name: node.fullName,
  initials: getInitials(node.fullName),
  title: node.roleName ?? "Chưa cập nhật chức danh",
  department: node.departmentCode ?? "—",
  phone: node.phone ?? "—",
  email: node.email ?? "—",
  perNumber: node.perNumber,
})

export const toSubordinateTreeNode = (
  node: UserTreeNodeResponse,
): SubordinateTreeNode => ({
  id: node.id,
  name: node.fullName,
  initials: getInitials(node.fullName),
  title: node.roleName ?? "Chưa cập nhật chức danh",
  department: node.departmentCode ?? "—",
  phone: node.phone ?? "—",
  email: node.email ?? "—",
  perNumber: node.perNumber,
  childrenCount: node.children?.length ?? 0,
  children: (node.children || []).map(toSubordinateTreeNode),
})

export const sortSubordinateNodes = (
  nodes: SubordinateTreeNode[],
): SubordinateTreeNode[] => {
  return [...nodes]
    .sort((a, b) => {
      const countA = a.childrenCount ?? a.children.length
      const countB = b.childrenCount ?? b.children.length
      if (countB !== countA) {
        return countB - countA
      }
      return a.name.localeCompare(b.name, "vi")
    })
    .map((node) => ({
      ...node,
      children: sortSubordinateNodes(node.children),
    }))
}

export const flattenUserTree = (
  nodes: UserTreeNodeResponse[],
): UserTreeNodeResponse[] =>
  nodes.flatMap((node) => [node, ...flattenUserTree(node.children ?? [])])

export const flattenSubordinateTree = (
  nodes: SubordinateTreeNode[],
): SubordinateTreeNode[] =>
  nodes.flatMap((node) => [
    node,
    ...flattenSubordinateTree(node.children ?? []),
  ])

export const extractSubordinateTree = (
  nodes: UserTreeNodeResponse[],
  currentUserId: number,
  isSuperUser = false,
): SubordinateTreeNode[] => {
  if (!nodes || nodes.length === 0) return []

  if (nodes.length === 1 && nodes[0].id === currentUserId) {
    const tree = (nodes[0].children || []).map(toSubordinateTreeNode)
    return sortSubordinateNodes(tree)
  }

  const findUserNode = (
    list: UserTreeNodeResponse[],
    targetId: number,
  ): UserTreeNodeResponse | null => {
    for (const node of list) {
      if (node.id === targetId) return node
      if (node.children && node.children.length > 0) {
        const found = findUserNode(node.children, targetId)
        if (found) return found
      }
    }
    return null
  }

  const self = findUserNode(nodes, currentUserId)

  if (self?.children && self.children.length > 0) {
    const tree = self.children.map(toSubordinateTreeNode)
    return sortSubordinateNodes(tree)
  }

  if (isSuperUser) {
    const tree = nodes
      .filter((node) => node.id !== currentUserId)
      .map(toSubordinateTreeNode)
    return sortSubordinateNodes(tree)
  }

  return []
}

export const extractSubordinates = (
  nodes: UserTreeNodeResponse[],
  currentUserId: number,
  isSuperUser = false,
): SubordinateEmployee[] => {
  const tree = extractSubordinateTree(nodes, currentUserId, isSuperUser)
  const flattened = flattenSubordinateTree(tree)
  return flattened.map((item) => ({
    id: item.id,
    name: item.name,
    initials: item.initials,
    title: item.title,
    department: item.department,
    phone: item.phone,
    email: item.email,
    perNumber: item.perNumber,
  }))
}

export const findNodePath = (
  nodes: SubordinateTreeNode[],
  targetId: number,
): SubordinateTreeNode[] => {
  for (const node of nodes) {
    if (node.id === targetId) {
      return [node]
    }
    if (node.children.length > 0) {
      const subPath = findNodePath(node.children, targetId)
      if (subPath.length > 0) {
        return [node, ...subPath]
      }
    }
  }
  return []
}

export const getSubtreeUserIds = (node: SubordinateTreeNode): number[] => [
  node.id,
  ...flattenSubordinateTree(node.children ?? []).map((c) => c.id),
]

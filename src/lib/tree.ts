/* eslint-disable @typescript-eslint/no-explicit-any */
export function buildTree<T extends { id: number; parentId?: number | null }>(
  items: T[],
): (T & { children: any[] })[] {
  const map = new Map<number, T & { children: any[] }>()
  const roots: (T & { children: any[] })[] = []

  for (const item of items) {
    map.set(item.id, { ...item, children: [] })
  }

  for (const item of items) {
    const node = map.get(item.id)!
    if (item.parentId && map.has(item.parentId)) {
      map.get(item.parentId)!.children.push(node)
    } else {
      roots.push(node)
    }
  }

  return roots
}

export type TreeNode<T> = T & {
  children?: TreeNode<T>[] | null
}

export function flattenTree<T>(tree: TreeNode<T>[]): T[] {
  return tree.flatMap(({ children, ...node }) => [
    node as T,
    ...(children && children.length > 0
      ? flattenTree(children as TreeNode<T>[])
      : []),
  ])
}

import { TreeSelect, type TreeSelectProps } from "antd"
import { useMemo } from "react"
import { taskItemQueries } from "@/hooks/server/taskItems"
import type { BusinessMatrixResponse } from "@/types"

export interface TreeSelectNode extends BusinessMatrixResponse {
  title: string
  value: number
  key: number
  selectable: boolean
  disabled: boolean
  children: TreeSelectNode[]
}

export interface TaskTreeSelectProps
  extends Omit<
    TreeSelectProps,
    "treeData" | "loading" | "onChange" | "value" | "styles"
  > {
  value?: number | null
  onChange?: (value: number | null, node?: TreeSelectNode | null) => void
  leafOnly?: boolean
  maxHeight?: number
  popupStyles?: React.CSSProperties
}
const findNode = (
  nodes: TreeSelectNode[],
  targetId: number,
): TreeSelectNode | null => {
  for (const node of nodes) {
    if (node.value === targetId) return node
    if (node.children && node.children.length > 0) {
      const found = findNode(node.children, targetId)
      if (found) return found
    }
  }
  return null
}

const formatNodes = (
  nodes: BusinessMatrixResponse[],
  leafOnly: boolean,
): TreeSelectNode[] => {
  return nodes.map((node) => {
    const hasChildren = Array.isArray(node.children) && node.children.length > 0
    return {
      ...node,
      title: node.title,
      value: node.id,
      key: node.id,
      selectable: leafOnly ? !hasChildren : true,
      disabled: false,
      children: hasChildren ? formatNodes(node.children, leafOnly) : [],
    }
  })
}

export function TaskTreeSelect({
  value,
  onChange,
  placeholder = "Chọn nghiệp vụ...",
  allowClear = true,
  leafOnly = true,
  maxHeight = 320,
  className,
  status,
  disabled,
  size,
  id,
  popupStyles,
  ...restProps
}: TaskTreeSelectProps) {
  const { data: res = [], isLoading } = taskItemQueries.useBusinessMatrix()
  const treeData = useMemo(() => formatNodes(res, leafOnly), [res, leafOnly])
  return (
    <TreeSelect
      id={id}
      placeholder={placeholder}
      loading={isLoading}
      treeData={treeData}
      value={value ?? undefined}
      onChange={(val) => {
        const numericVal = typeof val === "number" ? val : null
        const selectedNode =
          numericVal !== null ? findNode(treeData, numericVal) : null
        onChange?.(numericVal, selectedNode)
      }}
      showSearch={{
        treeNodeFilterProp: "title",
      }}
      treeExpandAction="click"
      allowClear={allowClear}
      disabled={disabled}
      status={status}
      size={size}
      className={className}
      styles={{
        popup: {
          root: {
            maxHeight,
            overflow: "auto",
            ...popupStyles,
          },
        },
      }}
      {...restProps}
    />
  )
}

export type { TaskTreeSelectProps as TaskItemTreeSelectProps }
export { TaskTreeSelect as TaskItemTreeSelect }
export default TaskTreeSelect

import { Breadcrumb, Button, Select, Skeleton, Tag } from "antd"
import { ChevronRight, RotateCcw, Users } from "lucide-react"
import { useMemo } from "react"
import {
  findNodePath,
  flattenSubordinateTree,
  sortSubordinateNodes,
} from "./orgUtils"
import type { SubordinateTreeNode } from "./types"

interface SubordinateFilterBarProps {
  tree: SubordinateTreeNode[]
  selectedPath: number[]
  onSelectPath: (path: number[]) => void
  isLoading?: boolean
}

export const SubordinateFilterBar = ({
  tree,
  selectedPath,
  onSelectPath,
  isLoading,
}: SubordinateFilterBarProps) => {
  const totalCount = useMemo(() => flattenSubordinateTree(tree).length, [tree])

  const selectedUserId = selectedPath[selectedPath.length - 1]

  const pathNodes = useMemo(() => {
    if (!selectedUserId) return []
    return findNodePath(tree, selectedUserId)
  }, [tree, selectedUserId])

  const levels = useMemo(() => {
    const result: {
      levelIndex: number
      parentName?: string
      items: SubordinateTreeNode[]
      selectedId?: number
    }[] = []

    let currentItems = tree

    for (let i = 0; i <= selectedPath.length; i++) {
      if (!currentItems || currentItems.length === 0) break

      const currentSelectedId = selectedPath[i]
      const parentNodes =
        i > 0 && selectedPath[i - 1]
          ? findNodePath(tree, selectedPath[i - 1])
          : []
      const parentNode =
        parentNodes.length > 0 ? parentNodes[parentNodes.length - 1] : undefined

      const sortedItems = sortSubordinateNodes(currentItems)

      result.push({
        levelIndex: i,
        parentName: parentNode?.name,
        items: sortedItems,
        selectedId: currentSelectedId,
      })

      if (currentSelectedId) {
        const selectedNode = sortedItems.find((n) => n.id === currentSelectedId)
        if (selectedNode?.children && selectedNode.children.length > 0) {
          currentItems = selectedNode.children
        } else {
          break
        }
      } else {
        break
      }
    }

    return result
  }, [tree, selectedPath])

  if (isLoading) {
    return <Skeleton.Button active block className="h-11! rounded-xl" />
  }

  if (tree.length === 0) {
    return null
  }

  const handleSelectAllAtLevel = (levelIndex: number) => {
    onSelectPath(selectedPath.slice(0, levelIndex))
  }

  const handleSelectNodeAtLevel = (
    levelIndex: number,
    node: SubordinateTreeNode,
  ) => {
    onSelectPath([...selectedPath.slice(0, levelIndex), node.id])
  }

  return (
    <div className="flex flex-col gap-2.5 rounded-xl border border-border/70 bg-card p-3 shadow-2xs">
      <div className="flex items-center justify-between gap-2 text-xs border-b border-border/50 pb-2 flex-wrap">
        <Breadcrumb
          items={[
            {
              title: (
                <button
                  type="button"
                  onClick={() => onSelectPath([])}
                  className={`flex items-center gap-1 cursor-pointer hover:text-primary transition-colors ${
                    pathNodes.length === 0
                      ? "font-bold text-primary"
                      : "font-medium text-muted-foreground"
                  }`}
                >
                  <Users className="size-3.5" />
                  <span>Tất cả nhân sự ({totalCount})</span>
                </button>
              ),
            },
            ...pathNodes.map((pn, idx) => ({
              title: (
                <button
                  type="button"
                  key={pn.id}
                  onClick={() => onSelectPath(selectedPath.slice(0, idx + 1))}
                  className={`cursor-pointer hover:text-primary transition-colors ${
                    idx === pathNodes.length - 1
                      ? "font-bold text-primary"
                      : "font-medium text-foreground"
                  }`}
                >
                  {pn.name}
                  {pn.title && pn.title !== "Chưa cập nhật chức danh" && (
                    <span className="text-[10px] text-muted-foreground ml-1">
                      ({pn.title})
                    </span>
                  )}
                </button>
              ),
            })),
          ]}
        />

        {selectedUserId !== undefined && (
          <Button
            size="small"
            type="text"
            icon={<RotateCcw className="size-3" />}
            onClick={() => onSelectPath([])}
            className="text-[11px] h-6 px-1.5 text-muted-foreground hover:text-foreground"
          >
            Đặt lại
          </Button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {levels.map((level, idx) => {
          const selectValue = level.selectedId
            ? String(level.selectedId)
            : "all"

          const options = [
            {
              value: "all",
              filterText:
                level.levelIndex === 0
                  ? "Tất cả nhân sự"
                  : `Tất cả thuộc ${level.parentName || "bộ phận"}`,
              label: (
                <div className="flex items-center gap-1.5 py-0.5 font-medium text-base">
                  <Users className="size-3.5 text-primary shrink-0" />
                  <span>
                    {level.levelIndex === 0
                      ? `Tất cả nhân sự`
                      : `Tất cả thuộc ${level.parentName || "bộ phận"} `}
                  </span>
                </div>
              ),
            },
            ...level.items.map((node) => ({
              value: String(node.id),
              filterText: `${node.name} ${node.title} ${node.perNumber || ""}`,
              label: (
                <div className="flex items-center justify-between gap-1.5 py-0.5 w-full">
                  <span className="font-semibold text-foreground truncate">
                    {node.name}
                  </span>

                  {(node.childrenCount ?? node.children.length) > 0 && (
                    <Tag
                      color="processing"
                      className="m-0 text-[10px] px-1 py-0 rounded shrink-0 flex items-center gap-0.5"
                    >
                      <span>
                        {node.childrenCount ?? node.children.length} cấp dưới
                      </span>
                    </Tag>
                  )}
                </div>
              ),
            })),
          ]

          return (
            <div key={level.levelIndex} className="flex items-center gap-2">
              {idx > 0 && (
                <ChevronRight className="size-4 text-muted-foreground shrink-0" />
              )}
              <div className="w-full sm:w-300px">
                <Select
                  value={selectValue}
                  onChange={(val) => {
                    if (val === "all") {
                      handleSelectAllAtLevel(level.levelIndex)
                    } else {
                      const targetNode = level.items.find(
                        (item) => String(item.id) === val,
                      )
                      if (targetNode) {
                        handleSelectNodeAtLevel(level.levelIndex, targetNode)
                      }
                    }
                  }}
                  options={options}
                  optionFilterProp="filterText"
                  showSearch
                  className="w-full"
                  size="middle"
                  popupMatchSelectWidth={false}
                  placeholder={
                    level.levelIndex === 0
                      ? "Chọn Quản lý / Nhân sự..."
                      : `Chọn cấp dưới của ${level.parentName}...`
                  }
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

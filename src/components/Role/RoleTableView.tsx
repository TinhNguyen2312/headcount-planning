"use client"

import {
  Button,
  Input,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
} from "antd"
import type { TableColumnsType } from "antd"
import {
  Building2,
  List,
  ListTree,
  Pencil,
  RotateCcw,
  Search,
  Trash2,
} from "lucide-react"
import React, { useMemo, useState } from "react"

import { departmentQueries } from "@/hooks/server/departments"
import { roleQueries } from "@/hooks/server/roles"
import {
  PLANNING_METHOD_OPTIONS,
  type PlanningMethod,
  type RoleResponse,
  type RoleTreeNodeResponse,
} from "@/types"

export interface RoleTreeTableItem extends RoleResponse {
  children?: RoleTreeTableItem[]
}

interface RoleTableViewProps {
  roles: RoleTreeNodeResponse[]
  isLoading?: boolean
  onEditRole: (role: RoleResponse) => void
  onDeleteRole?: (role: RoleResponse) => void
}

/** Recursively clean tree node children so empty arrays don't trigger expand icon */
function sanitizeTreeData(
  nodes: RoleTreeNodeResponse[],
): RoleTreeTableItem[] {
  return nodes.map((node) => ({
    ...node,
    children:
      node.children && node.children.length > 0
        ? sanitizeTreeData(node.children)
        : undefined,
  }))
}

/** Flatten hierarchical tree into a 1D list of roles */
function flattenTreeData(nodes: RoleTreeNodeResponse[]): RoleResponse[] {
  const result: RoleResponse[] = []
  const traverse = (items: RoleTreeNodeResponse[]) => {
    for (const item of items) {
      const { children, ...rest } = item
      result.push(rest)
      if (children && children.length > 0) {
        traverse(children)
      }
    }
  }
  traverse(nodes)
  return result
}

const RoleTableView: React.FC<RoleTableViewProps> = ({
  roles,
  isLoading = false,
  onEditRole,
  onDeleteRole,
}) => {
  const [keyword, setKeyword] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState<number | undefined>(
    undefined,
  )
  const [planningMethodFilter, setPlanningMethodFilter] = useState<
    PlanningMethod | "ALL"
  >("ALL")
  const [forceFlatView, setForceFlatView] = useState(false)

  const { data: departments = [] } = departmentQueries.useList()
  const deleteMutation = roleQueries.useDelete()

  const departmentOptions = useMemo(() => {
    return (departments || []).map((d) => ({
      value: d.id,
      label: d.name,
    }))
  }, [departments])

  const isFiltering =
    Boolean(keyword.trim()) ||
    departmentFilter !== undefined ||
    planningMethodFilter !== "ALL"

  // Should display as flat table if user actively toggles or applies filters
  const displayAsFlat = forceFlatView || isFiltering

  const flatList = useMemo(() => flattenTreeData(roles), [roles])

  const filteredFlatData = useMemo(() => {
    return flatList.filter((r) => {
      const matchKeyword =
        !keyword.trim() ||
        r.name.toLowerCase().includes(keyword.trim().toLowerCase()) ||
        (r.code &&
          r.code.toLowerCase().includes(keyword.trim().toLowerCase())) ||
        (r.shortCode &&
          r.shortCode.toLowerCase().includes(keyword.trim().toLowerCase())) ||
        (r.description &&
          r.description.toLowerCase().includes(keyword.trim().toLowerCase()))

      const matchDept =
        departmentFilter === undefined || r.departmentId === departmentFilter

      const matchPlanningMethod =
        planningMethodFilter === "ALL" ||
        r.planningMethod === planningMethodFilter

      return matchKeyword && matchDept && matchPlanningMethod
    })
  }, [flatList, keyword, departmentFilter, planningMethodFilter])

  const treeData = useMemo(() => sanitizeTreeData(roles), [roles])

  const handleDelete = async (role: RoleResponse) => {
    if (onDeleteRole) {
      onDeleteRole(role)
    } else {
      await deleteMutation.mutateAsync(role.id)
    }
  }

  const handleResetFilters = () => {
    setKeyword("")
    setDepartmentFilter(undefined)
    setPlanningMethodFilter("ALL")
  }

  const columns: TableColumnsType<RoleTreeTableItem> = [
    {
      title: "Tên chức vụ",
      dataIndex: "name",
      key: "name",
      width: 280,
      render: (name: string, record: RoleResponse) => (
        <div className="py-0.5">
          <div className="font-medium text-foreground text-sm">{name}</div>
          {record.description && record.description.trim() !== name.trim() && (
            <div
              className="text-xs text-muted-foreground line-clamp-1 mt-0.5"
              title={record.description}
            >
              {record.description}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Mã chức vụ",
      dataIndex: "code",
      key: "code",
      width: 140,
      render: (code: string | null) =>
        code ? (
          <Tag color="blue" className="font-mono font-semibold text-xs">
            {code}
          </Tag>
        ) : (
          <span className="text-muted-foreground text-xs">—</span>
        ),
    },
    {
      title: "Mã viết tắt",
      dataIndex: "shortCode",
      key: "shortCode",
      width: 120,
      render: (shortCode: string | null) =>
        shortCode ? (
          <Tag className="font-mono text-xs text-slate-700 dark:text-slate-300">
            {shortCode}
          </Tag>
        ) : (
          <span className="text-muted-foreground text-xs">—</span>
        ),
    },
    {
      title: "Phòng ban",
      dataIndex: "departmentName",
      key: "departmentName",
      width: 200,
      render: (deptName: string | null) =>
        deptName ? (
          <div className="flex items-center gap-1.5 text-xs text-foreground">
            <Building2 className="size-3.5 text-muted-foreground shrink-0" />
            <span className="truncate" title={deptName}>
              {deptName}
            </span>
          </div>
        ) : (
          <span className="text-muted-foreground text-xs italic">
            Chưa gán
          </span>
        ),
    },
    {
      title: "Cấp bậc",
      dataIndex: "level",
      key: "level",
      width: 90,
      align: "center",
      render: (level?: number) => (
        <Tag color="purple" className="text-xs font-semibold">
          Cấp {level ?? 1}
        </Tag>
      ),
    },
    {
      title: "Định biên",
      dataIndex: "planningMethod",
      key: "planningMethod",
      width: 160,
      render: (method: PlanningMethod | null) => {
        switch (method) {
          case "BY_PROJECT":
            return (
              <Tag color="blue" className="text-xs font-medium">
                Theo Dự án
              </Tag>
            )
          case "BY_REGION":
            return (
              <Tag color="green" className="text-xs font-medium">
                Theo Vùng
              </Tag>
            )
          case "BY_SECTOR":
            return (
              <Tag color="orange" className="text-xs font-medium">
                Theo Khu vực
              </Tag>
            )
          default:
            return (
              <Tag color="default" className="text-xs">
                Mặc định
              </Tag>
            )
        }
      },
    },
    {
      title: "Thao tác",
      key: "action",
      width: 100,
      fixed: "right",
      align: "center",
      render: (_: unknown, record: RoleResponse) => (
        <Space size="small">
          <Tooltip title="Chỉnh sửa chức vụ">
            <Button
              type="text"
              size="small"
              icon={<Pencil className="size-3.5 text-primary" />}
              onClick={() => onEditRole(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Xóa chức vụ?"
            description={`Bạn có chắc muốn xóa chức vụ "${record.name}" không?`}
            onConfirm={() => handleDelete(record)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Xóa chức vụ">
              <Button
                type="text"
                size="small"
                danger
                icon={<Trash2 className="size-3.5" />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div className="space-y-3">
      {/* Search & Filter Bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap bg-card/60 p-3 rounded-lg border border-border">
        <div className="flex items-center gap-2.5 flex-wrap flex-1">
          <Input
            placeholder="Tìm theo tên, mã hoặc mô tả chức vụ..."
            prefix={<Search className="size-4 text-muted-foreground" />}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            allowClear
            className="w-full sm:w-72"
          />

          <Select
            placeholder="Lọc phòng ban"
            value={departmentFilter}
            onChange={setDepartmentFilter}
            allowClear
            showSearch
            filterOption={(input, option) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
            options={departmentOptions}
            className="w-48"
          />

          <Select
            value={planningMethodFilter}
            onChange={setPlanningMethodFilter}
            className="w-44"
            options={[
              { value: "ALL", label: "Tất cả định biên" },
              ...PLANNING_METHOD_OPTIONS.map((opt) => ({
                value: opt.value,
                label: opt.label,
              })),
            ]}
          />

          {isFiltering && (
            <Button
              type="dashed"
              size="middle"
              icon={<RotateCcw className="size-3.5" />}
              onClick={handleResetFilters}
            >
              Đặt lại
            </Button>
          )}
        </div>

        {/* Toggle between Hierarchical tree view and Flat list view when not actively filtering */}
        {!isFiltering && (
          <div className="flex items-center gap-1 border border-border rounded-md p-0.5 bg-background">
            <Button
              type={!forceFlatView ? "primary" : "text"}
              size="small"
              icon={<ListTree className="size-3.5" />}
              onClick={() => setForceFlatView(false)}
            >
              Cây phân cấp
            </Button>
            <Button
              type={forceFlatView ? "primary" : "text"}
              size="small"
              icon={<List className="size-3.5" />}
              onClick={() => setForceFlatView(true)}
            >
              Danh sách phẳng
            </Button>
          </div>
        )}
      </div>

      {/* Main Table */}
      <Table<RoleTreeTableItem>
        rowKey="id"
        loading={isLoading || deleteMutation.isPending}
        dataSource={displayAsFlat ? filteredFlatData : treeData}
        columns={columns}
        pagination={{
          pageSize: 15,
          showSizeChanger: true,
          pageSizeOptions: ["10", "15", "25", "50"],
          showTotal: (total) =>
            displayAsFlat
              ? `Tổng số ${total} chức vụ`
              : `Tổng số ${total} chức vụ cấp cao nhất`,
        }}
        size="middle"
        bordered
        scroll={{ x: 900 }}
      />
    </div>
  )
}

export default RoleTableView

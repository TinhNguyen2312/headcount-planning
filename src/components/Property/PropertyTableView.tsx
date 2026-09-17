"use client"

import {
  Button,
  Empty,
  Input,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
} from "antd"
import type { ColumnsType } from "antd/es/table"
import { Building2, Edit, Search, Trash2 } from "lucide-react"
import React, { useMemo, useState } from "react"
import DepartmentSelect from "@/components/Common/DepartmentSelect"
import { propertyQueries } from "@/hooks/server/properties"
import type {
  ProjectType,
  PropertyDataType,
  PropertyResponse,
  PropertyScope,
} from "@/types"

interface PropertyTableViewProps {
  onEditProperty: (property: PropertyResponse) => void
}

const DATA_TYPE_BADGES: Record<
  PropertyDataType,
  { label: string; color: string }
> = {
  NUMBER: { label: "Số", color: "blue" },
  STRING: { label: "Văn bản", color: "cyan" },
  BOOLEAN: { label: "Đúng / Sai", color: "purple" },
  SELECT: { label: "Chọn", color: "orange" },
}

const PROJECT_TYPE_BADGES: Record<
  ProjectType,
  { label: string; color: string }
> = {
  ALL: { label: "Toàn dự án", color: "blue" },
  MIXED: { label: "Thấp và Cao tầng", color: "geekblue" },
  LOW_RISE: { label: "Thấp tầng", color: "green" },
  HIGH_RISE: { label: "Cao tầng", color: "purple" },
}

const SCOPE_BADGES = PROJECT_TYPE_BADGES

export const PropertyTableView: React.FC<PropertyTableViewProps> = ({
  onEditProperty,
}) => {
  const [searchText, setSearchText] = useState("")
  const [filterDeptId, setFilterDeptId] = useState<number | undefined>(
    undefined,
  )

  // Gọi API với departmentId filter (server-side)
  const { data: properties = [], isLoading } = propertyQueries.useList(
    filterDeptId ? { departmentId: filterDeptId } : {},
  )

  const deleteMutation = propertyQueries.useDelete()

  // Client-side search thêm theo tên/code/đơn vị
  const filteredProperties = useMemo(() => {
    if (!searchText.trim()) return properties
    const lower = searchText.toLowerCase()
    return properties.filter(
      (p) =>
        p.name.toLowerCase().includes(lower) ||
        p.code.toLowerCase().includes(lower) ||
        (p.unit && p.unit.toLowerCase().includes(lower)),
    )
  }, [properties, searchText])

  const columns: ColumnsType<PropertyResponse> = [
    {
      title: "Mã định danh",
      dataIndex: "code",
      key: "code",
      width: 170,
      render: (code: string) => (
        <span className="font-mono font-semibold text-xs text-primary">
          {code}
        </span>
      ),
    },
    {
      title: "Tên chỉ số",
      dataIndex: "name",
      key: "name",
      render: (name: string, record) => (
        <div>
          <div className="font-medium text-sm">{name}</div>
          {record.description && (
            <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
              {record.description}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Phòng ban áp dụng",
      key: "departments",
      width: 240,
      render: (_, record) => {
        const depts = record.departments ?? []
        if (depts.length === 0) {
          return (
            <Tag color="default" className="text-xs">
              Tất cả phòng ban
            </Tag>
          )
        }
        return (
          <div className="flex flex-wrap gap-1">
            {depts.slice(0, 3).map((d) => (
              <Tag key={d.departmentId} color="blue" className="text-xs m-0">
                {d.departmentCode}
              </Tag>
            ))}
            {depts.length > 3 && (
              <Tooltip
                title={depts
                  .slice(3)
                  .map((d) => d.departmentName)
                  .join(", ")}
              >
                <Tag className="text-xs m-0 cursor-pointer">
                  +{depts.length - 3}
                </Tag>
              </Tooltip>
            )}
          </div>
        )
      },
    },
    {
      title: "Kiểu dữ liệu",
      dataIndex: "dataType",
      key: "dataType",
      width: 130,
      render: (dt: PropertyDataType) => {
        const badge = DATA_TYPE_BADGES[dt] || { label: dt, color: "default" }
        return <Tag color={badge.color}>{badge.label}</Tag>
      },
    },
    {
      title: "Loại dự án",
      dataIndex: "projectType",
      key: "projectType",
      width: 160,
      render: (_: any, record: PropertyResponse) => {
        const pType = (record.projectType ||
          record.scope ||
          "ALL") as ProjectType
        const badge = (pType && PROJECT_TYPE_BADGES[pType]) || {
          label: "Toàn dự án",
          color: "blue",
        }
        return <Tag color={badge.color}>{badge.label}</Tag>
      },
    },
    {
      title: "Đơn vị",
      dataIndex: "unit",
      key: "unit",
      width: 100,
      render: (unit?: string | null) =>
        unit ? <Tag className="font-mono text-xs">{unit}</Tag> : "-",
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      width: 120,
      render: (isActive: boolean) => (
        <Tag color={isActive ? "success" : "default"}>
          {isActive ? "Đang dùng" : "Tạm khóa"}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 100,
      align: "center",
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              size="small"
              icon={<Edit className="size-3.5 text-blue-500" />}
              onClick={() => onEditProperty(record)}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Popconfirm
              title="Xác nhận xóa chỉ số định biên này?"
              description="Hành động này sẽ không thể hoàn tác nếu đã có dự án sử dụng chỉ số này."
              onConfirm={() => deleteMutation.mutate(record.id)}
              okText="Xóa"
              cancelText="Hủy"
              okButtonProps={{
                danger: true,
                loading: deleteMutation.isPending,
              }}
            >
              <Button
                type="text"
                size="small"
                danger
                icon={<Trash2 className="size-3.5" />}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      {/* Toolbar: Search + Filter phòng ban */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <Input
            placeholder="Tìm theo tên, mã code, đơn vị tính..."
            prefix={<Search className="size-4 text-muted-foreground" />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
            className="w-72"
          />

          <DepartmentSelect
            placeholder={
              <span className="flex items-center gap-1.5">
                <Building2 className="size-3.5" />
                Lọc theo Phòng ban
              </span>
            }
            allowClear
            className="w-64"
            selectedId={filterDeptId}
            setSelectedId={setFilterDeptId}
          />

          {filterDeptId && (
            <span className="text-xs text-muted-foreground">
              (bao gồm cả chỉ số dùng chung toàn hệ thống)
            </span>
          )}
        </div>

        <div className="text-xs text-muted-foreground">
          Tổng số:{" "}
          <span className="font-semibold">{filteredProperties.length}</span> cơ
          sở định biên
        </div>
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={filteredProperties}
        loading={isLoading}
        pagination={{ pageSize: 10, showSizeChanger: true }}
        locale={{
          emptyText: (
            <Empty
              description="Chưa có cơ sở định biên nào"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ),
        }}
        className="border border-border/60 rounded-lg overflow-hidden bg-card"
      />
    </div>
  )
}

export default PropertyTableView

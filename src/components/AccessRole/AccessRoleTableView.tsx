"use client"

import {
  Badge,
  Button,
  Card,
  Empty,
  Input,
  Popconfirm,
  Radio,
  Space,
  Table,
  Tag,
  Tooltip,
} from "antd"
import type { ColumnsType } from "antd/es/table"
import { Copy, Edit, Layers, Search, ShieldCheck, Trash2 } from "lucide-react"
import React, { useMemo, useState } from "react"
import { accessRoleQueries } from "@/hooks/server"
import type { AccessRoleResponse, AccessRoleScope } from "@/types"

interface AccessRoleTableViewProps {
  onEditRole: (role: AccessRoleResponse) => void
  onDuplicateRole?: (role: AccessRoleResponse) => void
}

export const AccessRoleTableView: React.FC<AccessRoleTableViewProps> = ({
  onEditRole,
  onDuplicateRole,
}) => {
  const [scopeFilter, setScopeFilter] = useState<AccessRoleScope | "ALL">("ALL")
  const [keyword, setKeyword] = useState("")

  const { data: roles = [], isLoading } = accessRoleQueries.useList({
    scope: scopeFilter === "ALL" ? undefined : scopeFilter,
    keyword: keyword ? keyword.trim() : undefined,
    limit: 100,
  })

  const { mutate: deleteRole, isPending: isDeleting } =
    accessRoleQueries.useDelete()

  const columns: ColumnsType<AccessRoleResponse> = useMemo(
    () => [
      {
        title: "Tên vai trò",
        dataIndex: "name",
        key: "name",
        render: (name: string, record: AccessRoleResponse) => (
          <div className="flex flex-col">
            <div className="flex items-center gap-2 font-medium text-slate-800">
              <ShieldCheck
                className={`size-4 ${
                  record.scope === "GLOBAL"
                    ? "text-purple-600"
                    : "text-blue-600"
                }`}
              />
              <span>{name}</span>
              {record.isSystem && (
                <Tag color="red" className="text-xs">
                  Hệ thống
                </Tag>
              )}
            </div>
            {record.description && (
              <span className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                {record.description}
              </span>
            )}
          </div>
        ),
      },
      {
        title: "Phạm vi",
        dataIndex: "scope",
        key: "scope",
        width: 150,
        render: (scope: AccessRoleScope) =>
          scope === "GLOBAL" ? (
            <Tag color="purple" className="font-medium">
              SYSTEM
            </Tag>
          ) : (
            <Tag color="blue" className="font-medium">
              PROJECT
            </Tag>
          ),
      },
      {
        title: "Kế thừa vai trò cha",
        dataIndex: "parentName",
        key: "parentName",
        width: 180,
        render: (parentName: string | null) =>
          parentName ? (
            <Tag color="default" className="flex items-center gap-1 w-fit">
              <Layers className="size-3 text-slate-400" />
              <span>{parentName}</span>
            </Tag>
          ) : (
            <span className="text-slate-400 text-xs italic">Không kế thừa</span>
          ),
      },
      {
        title: "Số quyền hạn",
        dataIndex: "permissionsCount",
        key: "permissionsCount",
        width: 140,
        align: "center",
        render: (count: number) => (
          <Badge
            count={count ?? 0}
            overflowCount={999}
            style={{
              backgroundColor: count > 0 ? "#10b981" : "#d1d5db",
              fontWeight: 500,
            }}
          />
        ),
      },
      {
        title: "Thao tác",
        key: "action",
        width: 140,
        align: "center",
        render: (_, record: AccessRoleResponse) => (
          <Space orientation="horizontal" size="small">
            <Tooltip title="Chỉnh sửa vai trò & phân quyền">
              <Button
                type="text"
                size="small"
                icon={<Edit className="size-4 text-blue-600" />}
                onClick={() => onEditRole(record)}
              />
            </Tooltip>

            {onDuplicateRole && (
              <Tooltip title="Nhân bản vai trò">
                <Button
                  type="text"
                  size="small"
                  icon={<Copy className="size-4 text-slate-600" />}
                  onClick={() => onDuplicateRole(record)}
                />
              </Tooltip>
            )}

            <Tooltip
              title={
                record.isSystem
                  ? "Vai trò hệ thống không thể xóa"
                  : "Xóa vai trò"
              }
            >
              <Popconfirm
                title="Xác nhận xóa vai trò"
                description={`Bạn có chắc chắn muốn xóa vai trò "${record.name}"?`}
                okText="Xóa"
                cancelText="Hủy"
                okButtonProps={{ danger: true }}
                disabled={record.isSystem}
                onConfirm={() => deleteRole(record.id)}
              >
                <Button
                  type="text"
                  size="small"
                  danger
                  disabled={record.isSystem}
                  icon={<Trash2 className="size-4" />}
                />
              </Popconfirm>
            </Tooltip>
          </Space>
        ),
      },
    ],
    [onEditRole, onDuplicateRole, deleteRole],
  )

  return (
    <div className="flex flex-col gap-4">
      {/* Bộ lọc & Tìm kiếm */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-lg border border-slate-200">
        <Space wrap>
          <Radio.Group
            value={scopeFilter}
            onChange={(e) => setScopeFilter(e.target.value)}
            buttonStyle="solid"
          >
            <Radio.Button value="ALL">Tất cả phạm vi</Radio.Button>
            <Radio.Button value="GLOBAL">Toàn cục (GLOBAL)</Radio.Button>
            <Radio.Button value="PROJECT">Dự án (PROJECT)</Radio.Button>
          </Radio.Group>
        </Space>

        <div className="w-72">
          <Input
            placeholder="Tìm kiếm vai trò theo tên, mô tả..."
            prefix={<Search className="size-4 text-slate-400" />}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            allowClear
          />
        </div>
      </div>

      {/* Bảng danh sách */}
      <Card
        className="shadow-sm border-slate-200"
        styles={{ body: { padding: 0 } }}
      >
        <Table<AccessRoleResponse>
          rowKey="id"
          columns={columns}
          dataSource={roles}
          loading={isLoading || isDeleting}
          pagination={{
            pageSize: 15,
            showSizeChanger: true,
            pageSizeOptions: ["10", "15", "25", "50"],
            showTotal: (total) => `Tổng cộng ${total} vai trò truy cập`,
          }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Chưa có vai trò truy cập nào"
              />
            ),
          }}
        />
      </Card>
    </div>
  )
}

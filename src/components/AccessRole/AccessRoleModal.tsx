"use client"

import {
  Badge,
  Button,
  Card,
  Checkbox,
  Divider,
  Empty,
  Form,
  Input,
  Modal,
  Radio,
  Select,
  Spin,
  Tag,
} from "antd"
import { CheckSquare, Key, Search, Shield, Square } from "lucide-react"
import React, { useEffect, useMemo, useState } from "react"
import { accessRoleQueries } from "@/hooks/server"
import type {
  AccessRoleResponse,
  AccessRoleScope,
  PermissionResponse,
} from "@/types"

interface AccessRoleModalProps {
  open: boolean
  role: AccessRoleResponse | null
  isDuplicate?: boolean
  onCancel: () => void
  onSuccess?: () => void
}

interface FormValues {
  name: string
  scope: AccessRoleScope
  parentId?: number | null
  description?: string
}

export const AccessRoleModal: React.FC<AccessRoleModalProps> = ({
  open,
  role,
  isDuplicate = false,
  onCancel,
  onSuccess,
}) => {
  const [form] = Form.useForm<FormValues>()
  const selectedScope = Form.useWatch("scope", form) || "PROJECT"

  // Selected permission IDs
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<number[]>(
    [],
  )
  const [permissionSearch, setPermissionSearch] = useState("")

  // Fetch full detail for editing role (to get assigned permissionIds)
  const { data: roleDetail, isLoading: isLoadingDetail } =
    accessRoleQueries.useDetail(role?.id, {
      enabled: open && !!role?.id,
    })

  // Fetch all available permissions
  const { data: allPermissions = [], isLoading: isLoadingPermissions } =
    accessRoleQueries.usePermissions()

  // Fetch existing roles for parent selection (same scope)
  const { data: existingRoles = [] } = accessRoleQueries.useList({
    limit: 200,
  })

  const { mutate: createRole, isPending: isCreating } =
    accessRoleQueries.useCreate()
  const { mutate: updateRole, isPending: isUpdating } =
    accessRoleQueries.useUpdate()

  // Initialize form and permissions when modal opens or role changes
  useEffect(() => {
    if (open) {
      if (role) {
        form.setFieldsValue({
          name: isDuplicate ? `${role.name} (Bản sao)` : role.name,
          scope: role.scope,
          parentId: role.parentId,
          description: role.description ?? undefined,
        })

        // If detail is loaded, sync permissions
        if (roleDetail?.permissionIds) {
          setSelectedPermissionIds(roleDetail.permissionIds)
        } else if (role.permissionIds) {
          setSelectedPermissionIds(role.permissionIds)
        }
      } else {
        form.resetFields()
        form.setFieldsValue({ scope: "PROJECT" })
        setSelectedPermissionIds([])
      }
      setPermissionSearch("")
    }
  }, [open, role, isDuplicate, roleDetail, form])

  // Scope-filtered permissions
  const scopeFilteredPermissions = useMemo(() => {
    return allPermissions.filter((p) => {
      if (selectedScope === "PROJECT") {
        return p.scope === "PROJECT"
      }
      // GLOBAL scope roles can manage global permissions or all
      return true
    })
  }, [allPermissions, selectedScope])

  // Search-filtered permissions
  const filteredPermissions = useMemo(() => {
    if (!permissionSearch.trim()) return scopeFilteredPermissions
    const kw = permissionSearch.toLowerCase().trim()
    return scopeFilteredPermissions.filter(
      (p) =>
        p.label.toLowerCase().includes(kw) ||
        p.key.toLowerCase().includes(kw) ||
        p.groupName.toLowerCase().includes(kw),
    )
  }, [scopeFilteredPermissions, permissionSearch])

  // Group permissions by groupName
  const groupedPermissions = useMemo(() => {
    const groups: Record<string, PermissionResponse[]> = {}
    filteredPermissions.forEach((p) => {
      if (!groups[p.groupName]) {
        groups[p.groupName] = []
      }
      groups[p.groupName].push(p)
    })
    return groups
  }, [filteredPermissions])

  // Eligible parent roles (same scope, cannot be itself)
  const parentRoleOptions = useMemo(() => {
    const rolesList = existingRoles
    return rolesList
      .filter((r) => r.scope === selectedScope && (!role || r.id !== role.id))
      .map((r) => ({
        label: `${r.name}${r.isSystem ? " (Hệ thống)" : ""}`,
        value: r.id,
      }))
  }, [existingRoles, selectedScope, role])

  // Permission selection toggle handlers
  const handleTogglePermission = (permissionId: number) => {
    setSelectedPermissionIds((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId],
    )
  }

  const handleToggleGroup = (
    groupPermissions: PermissionResponse[],
    isChecked: boolean,
  ) => {
    const groupIds = groupPermissions.map((p) => p.id)
    if (isChecked) {
      // Add all group permissions
      setSelectedPermissionIds((prev) =>
        Array.from(new Set([...prev, ...groupIds])),
      )
    } else {
      // Remove all group permissions
      setSelectedPermissionIds((prev) =>
        prev.filter((id) => !groupIds.includes(id)),
      )
    }
  }

  const handleSelectAllVisible = () => {
    const visibleIds = filteredPermissions.map((p) => p.id)
    setSelectedPermissionIds((prev) =>
      Array.from(new Set([...prev, ...visibleIds])),
    )
  }

  const handleDeselectAllVisible = () => {
    const visibleIds = new Set(filteredPermissions.map((p) => p.id))
    setSelectedPermissionIds((prev) => prev.filter((id) => !visibleIds.has(id)))
  }

  // Submit form
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      if (role && !isDuplicate) {
        updateRole(
          {
            id: role.id,
            data: {
              name: values.name,
              scope: values.scope,
              description: values.description || null,
              parentId: values.parentId || null,
              permissionIds: selectedPermissionIds,
            },
          },
          {
            onSuccess: () => {
              onSuccess?.()
              onCancel()
            },
          },
        )
      } else {
        createRole(
          {
            name: values.name,
            scope: values.scope,
            description: values.description,
            parentId: values.parentId || null,
            permissionIds: selectedPermissionIds,
          },
          {
            onSuccess: () => {
              onSuccess?.()
              onCancel()
            },
          },
        )
      }
    } catch {
      // Validation error handled by AntD form
    }
  }

  const isSubmitting = isCreating || isUpdating
  const isEditingSystem = Boolean(role && !isDuplicate && role.isSystem)

  return (
    <Modal
      title={
        <div className="flex items-center gap-2 text-base font-semibold text-slate-800">
          <Shield className="size-5 text-blue-600" />
          <span>
            {isDuplicate
              ? `Nhân bản vai trò "${role?.name}"`
              : role
                ? `Chỉnh sửa vai trò: ${role.name}`
                : "Thêm vai trò truy cập mới"}
          </span>
        </div>
      }
      open={open}
      onCancel={onCancel}
      width={900}
      footer={[
        <Button key="cancel" onClick={onCancel} disabled={isSubmitting}>
          Hủy
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={handleSubmit}
          loading={isSubmitting}
        >
          {role && !isDuplicate ? "Lưu thay đổi" : "Tạo vai trò"}
        </Button>,
      ]}
      destroyOnClose
      centered
    >
      <Spin spinning={isLoadingDetail || isLoadingPermissions}>
        <div className="max-h-[75vh] overflow-y-auto px-1 pt-2">
          <Form form={form} layout="vertical">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                name="name"
                label="Tên vai trò truy cập"
                rules={[
                  { required: true, message: "Vui lòng nhập tên vai trò" },
                  { max: 100, message: "Tối đa 100 ký tự" },
                ]}
              >
                <Input
                  placeholder="VD: Giám đốc Dự án, Kỹ sư Thẩm định..."
                  disabled={isEditingSystem}
                />
              </Form.Item>

              <Form.Item
                name="scope"
                label="Phạm vi ủy quyền (Scope)"
                rules={[{ required: true }]}
              >
                <Radio.Group
                  disabled={isEditingSystem}
                  onChange={() => {
                    // Reset parentId when scope changes
                    form.setFieldValue("parentId", null)
                  }}
                  className="w-full"
                >
                  <Radio.Button value="PROJECT" className="w-1/2 text-center">
                    Dự án (PROJECT)
                  </Radio.Button>
                  <Radio.Button value="GLOBAL" className="w-1/2 text-center">
                    Toàn cục (GLOBAL)
                  </Radio.Button>
                </Radio.Group>
              </Form.Item>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                name="parentId"
                label="Vai trò cha kế thừa (Hierarchical RBAC)"
                tooltip="Vai trò này sẽ tự động kế thừa tất cả các quyền hạn từ vai trò cha"
              >
                <Select
                  placeholder="Chọn vai trò cha để kế thừa quyền (nếu có)"
                  allowClear
                  options={parentRoleOptions}
                  notFoundContent="Không có vai trò cha phù hợp trong phạm vi này"
                />
              </Form.Item>

              <Form.Item
                name="description"
                label="Mô tả nhiệm vụ"
                rules={[{ max: 500, message: "Tối đa 500 ký tự" }]}
              >
                <Input
                  placeholder="Mô tả trách nhiệm hoặc quyền hạn của vai trò..."
                  allowClear
                />
              </Form.Item>
            </div>
          </Form>

          <Divider className="my-3" />

          {/* Ma trận phân quyền (Permission Matrix Grid) */}
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Key className="size-4 text-emerald-600" />
                <span className="font-semibold text-slate-800">
                  Ma trận phân quyền hạn
                </span>
                <Badge
                  count={`${selectedPermissionIds.length} / ${scopeFilteredPermissions.length} quyền`}
                  style={{
                    backgroundColor:
                      selectedPermissionIds.length > 0 ? "#10b981" : "#94a3b8",
                  }}
                />
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="small"
                  onClick={handleSelectAllVisible}
                  icon={<CheckSquare className="size-3.5" />}
                >
                  Chọn tất cả
                </Button>
                <Button
                  size="small"
                  onClick={handleDeselectAllVisible}
                  icon={<Square className="size-3.5" />}
                >
                  Bỏ chọn tất cả
                </Button>
              </div>
            </div>

            <div className="w-full">
              <Input
                placeholder="Tìm kiếm quyền theo tên, mã quyền, hoặc phân hệ..."
                prefix={<Search className="size-4 text-slate-400" />}
                value={permissionSearch}
                onChange={(e) => setPermissionSearch(e.target.value)}
                allowClear
                size="middle"
              />
            </div>

            {/* Danh sách quyền theo nhóm */}
            <div className="flex flex-col gap-3 mt-1">
              {Object.keys(groupedPermissions).length === 0 ? (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="Không tìm thấy quyền hạn phù hợp"
                />
              ) : (
                Object.entries(groupedPermissions).map(
                  ([groupName, groupPerms]) => {
                    const groupPermIds = groupPerms.map((p) => p.id)
                    const selectedInGroup = groupPermIds.filter((id) =>
                      selectedPermissionIds.includes(id),
                    ).length
                    const isAllChecked =
                      selectedInGroup === groupPerms.length &&
                      groupPerms.length > 0
                    const isIndeterminate =
                      selectedInGroup > 0 && selectedInGroup < groupPerms.length

                    return (
                      <Card
                        key={groupName}
                        size="small"
                        className="border border-slate-200 shadow-none hover:border-slate-300 transition-colors"
                        title={
                          <div className="flex items-center justify-between py-1">
                            <Checkbox
                              checked={isAllChecked}
                              indeterminate={isIndeterminate}
                              onChange={(e) =>
                                handleToggleGroup(groupPerms, e.target.checked)
                              }
                              className="font-medium text-slate-800"
                            >
                              <span>{groupName}</span>
                            </Checkbox>
                            <Tag
                              color={
                                selectedInGroup > 0 ? "processing" : "default"
                              }
                              className="text-xs mr-0"
                            >
                              {selectedInGroup} / {groupPerms.length}
                            </Tag>
                          </div>
                        }
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 py-1">
                          {groupPerms.map((permission) => {
                            const isChecked = selectedPermissionIds.includes(
                              permission.id,
                            )
                            return (
                              <div
                                key={permission.id}
                                onClick={() =>
                                  handleTogglePermission(permission.id)
                                }
                                className={`flex items-start gap-2.5 p-2 rounded cursor-pointer border transition-colors ${
                                  isChecked
                                    ? "bg-emerald-50/70 border-emerald-300 text-emerald-950"
                                    : "bg-slate-50/50 border-slate-100 hover:bg-slate-100/70"
                                }`}
                              >
                                <Checkbox
                                  checked={isChecked}
                                  onChange={() =>
                                    handleTogglePermission(permission.id)
                                  }
                                  onClick={(e) => e.stopPropagation()}
                                  className="mt-0.5"
                                />
                                <div className="flex flex-col flex-1 leading-snug">
                                  <span className="text-xs font-medium text-slate-800">
                                    {permission.label}
                                  </span>
                                  <span className="text-[11px] font-mono text-slate-400 mt-0.5">
                                    {permission.key}
                                  </span>
                                  {permission.description && (
                                    <span className="text-[11px] text-slate-500 mt-0.5">
                                      {permission.description}
                                    </span>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </Card>
                    )
                  },
                )
              )}
            </div>
          </div>
        </div>
      </Spin>
    </Modal>
  )
}

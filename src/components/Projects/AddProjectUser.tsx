import { Button, DatePicker, Form, Modal, Tag } from "antd"
import dayjs, { type Dayjs } from "dayjs"
import { Trash2, UserPlus } from "lucide-react"
import { useState } from "react"

import InfiniteSelect from "@/components/Common/InfiniteSelect"
import { getRolePermissionGroup } from "@/constants"
import { projectQueries } from "@/hooks/server/projects"
import { userQueries } from "@/hooks/server/users"
import { useUI } from "@/hooks/useUI"
import type { UserWithProjectsResponse, ZoneResponse } from "@/types"

interface AddProjectUserFormValues {
  userId: string
  zones: ZoneResponse[]
}

interface AddProjectUserProps {
  projectId: number
  excludeUserIds: number[]
}

const AddProjectUser = ({ projectId, excludeUserIds }: AddProjectUserProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedUser, setSelectedUser] =
    useState<UserWithProjectsResponse | null>(null)
  const [dates, setDates] = useState<Record<number, Dayjs>>({})

  const [form] = Form.useForm<AddProjectUserFormValues>()
  const selectedZones = Form.useWatch("zones", form) ?? []

  const mutation = projectQueries.useAddUser(projectId)
  const { message } = useUI()

  const selectedProjectRole = getRolePermissionGroup(selectedUser?.roleName)

  const resetState = () => {
    form.resetFields()
    setSelectedUser(null)
    setDates({})
  }

  const onFinish = async (values: AddProjectUserFormValues) => {
    if (!selectedUser?.id || !selectedUser?.roleId || !selectedProjectRole) {
      message.error("Vui lòng chọn nhân sự có chức danh hợp lệ")
      return
    }

    const roleId = selectedUser.roleId as number
    setIsSubmitting(true)
    try {
      await Promise.all(
        values.zones.map((zone) =>
          mutation.mutateAsync({
            userId: selectedUser.id,
            roleId,
            zoneId: zone.id,
            projectRole: selectedProjectRole,
            effectiveFrom: (dates[zone.id] ?? dayjs()).format("YYYY-MM-DD"),
          }),
        ),
      )

      resetState()
      setIsOpen(false)
    } catch {
      message.error("Thêm nhân sự vào dự án thất bại.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) resetState()
  }

  return (
    <>
      <Button
        type="primary"
        icon={<UserPlus />}
        onClick={() => handleOpenChange(true)}
      >
        Thêm nhân sự
      </Button>
      <Modal
        open={isOpen}
        onCancel={() => handleOpenChange(false)}
        onOk={() => form.submit()}
        confirmLoading={isSubmitting}
        okText="Thêm"
        cancelText="Hủy"
        title="Thêm nhân sự vào dự án"
        centered
        destroyOnHidden
        width={540}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          className="pt-2"
        >
          <Form.Item
            name="userId"
            label="Nhân sự cần thêm"
            rules={[{ required: true, message: "Vui lòng chọn nhân sự" }]}
          >
            <InfiniteSelect<UserWithProjectsResponse, string>
              placeholder="Chọn nhân sự (tìm theo tên, email, chức danh)..."
              onChange={(_, option) => {
                const user =
                  option && !Array.isArray(option)
                    ? (option as UserWithProjectsResponse)
                    : null
                setSelectedUser(user)
                form.resetFields(["zones"])
                setDates({})
              }}
              useList={userQueries.useList}
              extraParams={{ status: "ACTIVE" }}
              filterItem={(user) => {
                if (
                  user.status !== "ACTIVE" ||
                  excludeUserIds.includes(user.id)
                )
                  return false
                if (getRolePermissionGroup(user.roleName) === "PROJECT_ADMIN")
                  return false
                return true
              }}
              transformItem={(user) => ({
                value: String(user.id),
                label: user.email
                  ? `${user.fullName} (${user.email})`
                  : user.roleName
                    ? `${user.fullName} (${user.roleName})`
                    : `${user.fullName} (Chưa có chức danh)`,
                disabled: !user.roleId,
                ...user,
              })}
              optionRender={(option) => {
                const roleName = option.data.roleName
                const email = option.data.email
                const hasRole = Boolean(option.data.roleId)
                return (
                  <div className="flex items-center justify-between gap-2 py-0.5">
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="font-medium truncate">
                        {option.data.fullName}
                      </span>
                      {email && (
                        <span className="text-xs text-muted-foreground truncate">
                          {email}
                        </span>
                      )}
                    </div>
                    {hasRole ? (
                      <Tag className="mr-0 text-[11px] shrink-0">
                        {roleName}
                      </Tag>
                    ) : (
                      <span className="text-xs text-destructive shrink-0">
                        Chưa có chức danh
                      </span>
                    )}
                  </div>
                )
              }}
            />
          </Form.Item>

          <Form.Item
            name="zones"
            label="Khu vực phụ trách (có thể chọn nhiều)"
            rules={[
              {
                required: true,
                type: "array",
                message: "Vui lòng chọn ít nhất 1 khu vực phụ trách",
              },
            ]}
            className="mb-2"
          >
            {null}
          </Form.Item>

          {selectedZones.length > 0 && (
            <div className="flex flex-col gap-2 rounded-md border p-3 bg-muted/20">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Ngày hiệu lực từng phân khu ({selectedZones.length})
              </span>

              <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
                {selectedZones.map((zone) => {
                  return (
                    <div
                      key={zone.id}
                      className="flex items-center justify-between gap-2 p-2 rounded border bg-background"
                    >
                      <span className="font-medium text-sm truncate flex-1">
                        {zone.name}
                      </span>
                      <div className="flex items-center gap-2">
                        <DatePicker
                          value={dates[zone.id] ?? dayjs()}
                          onChange={(d) =>
                            d &&
                            setDates((prev) => ({
                              ...prev,
                              [zone.id]: d,
                            }))
                          }
                          format="DD/MM/YYYY"
                          allowClear={false}
                          className="w-36"
                        />
                        <Button
                          type="text"
                          danger
                          size="small"
                          icon={<Trash2 className="size-4" />}
                          onClick={() =>
                            form.setFieldValue(
                              "zones",
                              selectedZones.filter((z) => z.id !== zone.id),
                            )
                          }
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </Form>
      </Modal>
    </>
  )
}

export default AddProjectUser

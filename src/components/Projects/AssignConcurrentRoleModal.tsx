import { Button, DatePicker, Form, Modal, Table, Tag } from "antd"
import dayjs, { type Dayjs } from "dayjs"
import { Trash2 } from "lucide-react"
import { useState } from "react"
import RoleSelect from "@/components/Common/RoleSelect"
import { getRolePermissionGroup } from "@/constants"
import { projectQueries } from "@/hooks/server/projects"
import type {
  RoleResponse,
  UserProjectRoleDetailResponse,
  ZoneResponse,
} from "@/types"

interface AssignConcurrentRoleFormValues {
  role: RoleResponse
  zones: ZoneResponse[]
}

interface AssignConcurrentRoleModalProps {
  projectId: number
  member: UserProjectRoleDetailResponse
  open: boolean
  onCancel: () => void
}

const AssignConcurrentRoleModal = ({
  projectId,
  member,
  open,
  onCancel,
}: AssignConcurrentRoleModalProps) => {
  const [form] = Form.useForm<AssignConcurrentRoleFormValues>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [dates, setDates] = useState<Record<number, Dayjs>>({})

  const { data: projectUsers = [] } = projectQueries.useUsers(projectId, {
    status: "ACTIVE",
  })
  const assignMutation = projectQueries.useAddUser(projectId)
  const removeMutation = projectQueries.useRemoveUser(projectId)

  const selectedZones = Form.useWatch("zones", form) ?? []

  const memberRoles = projectUsers.filter((u) => u.userId === member.userId)

  const resetState = () => {
    form.resetFields()
    setDates({})
  }

  const onSubmit = async (values: AssignConcurrentRoleFormValues) => {
    const projectRole = getRolePermissionGroup(values.role)
    if (!projectRole || projectRole === "PROJECT_ADMIN") return
    if (!values.zones || values.zones.length === 0) return

    setIsSubmitting(true)
    try {
      await Promise.all(
        values.zones.map((zone) =>
          assignMutation.mutateAsync({
            userId: member.userId,
            roleId: values.role.id,
            zoneId: zone.id,
            projectRole,
            isPrimary: false,
            effectiveFrom: (dates[zone.id] ?? dayjs()).format("YYYY-MM-DD"),
          }),
        ),
      )
      resetState()
    } catch {
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRemove = (record: UserProjectRoleDetailResponse) => {
    Modal.confirm({
      title: "Gỡ chức danh kiêm nhiệm",
      content: `Bạn có chắc chắn muốn gỡ chức danh "${record.roleName}" (kiêm nhiệm) của "${member.userFullName}"?`,
      okText: "Gỡ",
      okType: "danger",
      cancelText: "Hủy",
      onOk: () => removeMutation.mutate(record.id),
    })
  }

  const handleCancel = () => {
    resetState()
    onCancel()
  }

  return (
    <Modal
      open={open}
      onCancel={handleCancel}
      onOk={() => form.submit()}
      confirmLoading={assignMutation.isPending || isSubmitting}
      okText="Thêm chức danh"
      cancelText="Đóng"
      title={`Kiêm nhiệm chức danh - ${member.userFullName}`}
      centered
      width={680}
    >
      <div className="flex flex-col gap-4">
        <Table<UserProjectRoleDetailResponse>
          size="small"
          rowKey="id"
          pagination={false}
          dataSource={memberRoles}
          locale={{ emptyText: "Chưa có chức danh nào" }}
          columns={[
            {
              title: "Khu vực",
              render: (_, record) => record.zoneName || "—",
            },
            {
              title: "Chức danh",
              render: (_, record) => (
                <div className="flex items-center gap-1.5">
                  <span>{record.roleName}</span>
                  {record.isPrimary === false && (
                    <Tag color="blue" className="mr-0 text-[11px]">
                      Kiêm nhiệm
                    </Tag>
                  )}
                </div>
              ),
            },
            {
              title: "",
              width: 40,
              align: "right",
              render: (_, record) =>
                record.isPrimary === false && (
                  <Button
                    type="text"
                    danger
                    size="small"
                    icon={<Trash2 className="size-4" />}
                    onClick={() => handleRemove(record)}
                  />
                ),
            },
          ]}
        />

        <Form
          form={form}
          layout="vertical"
          onFinish={onSubmit}
          className="flex flex-col gap-3 border-t pt-3"
        >
          <Form.Item
            label="Chức danh kiêm nhiệm"
            name="role"
            className="mb-0"
            rules={[{ required: true, message: "Vui lòng chọn chức danh" }]}
          >
            <RoleSelect
              valueType="object"
              projectRole={[
                "ZONE_ADMIN",
                "TASK_INSPECTOR",
                "TASK_EXECUTOR",
                "VIEWER",
              ]}
              placeholder="Chọn chức danh..."
              onChange={() => {
                form.resetFields(["zones"])
                setDates({})
              }}
            />
          </Form.Item>

          <Form.Item
            label="Khu vực phụ trách (có thể chọn nhiều)"
            name="zones"
            className="mb-0"
            rules={[
              {
                required: true,
                type: "array",
                message: "Vui lòng chọn ít nhất 1 khu vực phụ trách",
              },
            ]}
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
                  const zoneLabel = zone.code
                    ? `${zone.name} (${zone.code})`
                    : zone.name

                  return (
                    <div
                      key={zone.id}
                      className="flex items-center justify-between gap-2 p-2 rounded border bg-background"
                    >
                      <span className="font-medium text-sm truncate flex-1">
                        {zoneLabel}
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
      </div>
    </Modal>
  )
}

export default AssignConcurrentRoleModal

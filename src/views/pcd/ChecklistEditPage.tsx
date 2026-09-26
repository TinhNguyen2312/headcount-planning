import { useNavigate, useParams } from "@/lib/routerAdapter"
import { Button, Form, Input, Tag } from "antd"
import { FileCheck, Save } from "lucide-react"
import { useEffect } from "react"
import ChecklistDetailsTable from "@/components/Checklists/ChecklistDetailsTable"
import PageHeader from "@/components/Common/PageHeader"
import { TaskTreeSelect } from "@/components/Common/TaskTreeSelect"
import UnsavedChangesModal from "@/components/Common/UnsavedChangesModal"
import { checklistQueries } from "@/hooks/server/checklists"
import { useProjectAuth } from "@/hooks/useProjectAuth"
import { useUI } from "@/hooks/useUI"
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges"
import type { ChecklistUpdate } from "@/types"

export default function ChecklistEditPage() {
  const params = useParams()
  const id = params?.id
  const checklistId = Number(id)
  const navigate = useNavigate()

  const { data: checklist, isSuccess } =
    checklistQueries.useSuspenseDetail(checklistId)
  const updateMutation = checklistQueries.useUpdate()
  const { isSuperUser } = useProjectAuth()
  const { message } = useUI()

  const [form] = Form.useForm<ChecklistUpdate>()
  Form.useWatch([], form)

  const {
    isDirty,
    showWarning,
    setSnapshot,
    confirmLeave,
    cancelLeave,
    markClean,
  } = useUnsavedChanges<ChecklistUpdate>({
    getCurrentValue: () => {
      const values: ChecklistUpdate = form.getFieldsValue(true)
      return values
    },
  })

  useEffect(() => {
    if (checklist) {
      form.setFieldsValue(checklist)
      setSnapshot(checklist)
    }
  }, [checklist, form, setSnapshot, isSuccess])

  const handleSaveAllHeader = async (values: ChecklistUpdate) => {
    try {
      await updateMutation.mutateAsync({
        id: checklistId,
        data: {
          code: values.code?.trim(),
          name: values.name?.trim(),
          taskItemId: values.taskItemId ?? undefined,
        },
      })
      markClean()
      message.success("Cập nhật thông tin mẫu Checklist thành công!")
    } catch {
      // Error handled by query mutation interceptor / toast
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={
          <div className="flex flex-wrap items-center gap-2">
            <FileCheck className="size-6 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight">
              Chỉnh sửa Checklist
            </h1>

            {isDirty && (
              <Tag color="warning" className="text-sm">
                Có thay đổi chưa lưu
              </Tag>
            )}
          </div>
        }
        subtitle={
          checklist?.name && (
            <Tag color="blue" className="font-mono text-base">
              {checklist.name}
            </Tag>
          )
        }
        onBack={() => {
          navigate({ to: "/checklists" })
        }}
        className="border-b pb-4"
      />

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSaveAllHeader}
        disabled={!isSuperUser}
        className="rounded-lg border p-4 bg-card flex flex-col gap-4"
      >
        <div className="flex items-center justify-between p-2!">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold">Thông tin mẫu biểu</h2>
            {isDirty && (
              <Tag color="warning" className="text-xs">
                Chưa lưu thay đổi
              </Tag>
            )}
          </div>
          <Button
            type="primary"
            htmlType="submit"
            icon={<Save className="size-4" />}
            loading={updateMutation.isPending}
            disabled={!isSuperUser || !isDirty}
          >
            Lưu thông tin
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-2">
          <Form.Item<ChecklistUpdate>
            name="code"
            label={
              <span className="text-base font-semibold">Mã Checklist</span>
            }
            rules={[
              { required: true, message: "Mã Checklist không được để trống" },
              { whitespace: true, message: "Mã Checklist không được để trống" },
            ]}
          >
            <Input placeholder="VD: NVLG-PCD-SOP07.F11.01" className="h-9" />
          </Form.Item>

          <Form.Item<ChecklistUpdate>
            name="name"
            label={
              <span className="text-base font-semibold">Tên Checklist</span>
            }
            rules={[
              {
                required: true,
                message: "Tên Checklist không được để trống",
              },
              {
                whitespace: true,
                message: "Tên Checklist không được để trống",
              },
            ]}
          >
            <Input
              placeholder="VD: Hồ sơ hệ thống điện tạm thi công"
              className="h-9"
            />
          </Form.Item>

          <Form.Item<ChecklistUpdate>
            name="taskItemId"
            label={
              <span className="text-base font-semibold">Nghiệp vụ áp dụng</span>
            }
          >
            <TaskTreeSelect
              placeholder="Chọn nghiệp vụ..."
              className="w-full"
              maxHeight={350}
            />
          </Form.Item>
        </div>
      </Form>

      <ChecklistDetailsTable checklistId={checklistId} />

      <UnsavedChangesModal
        open={showWarning}
        onConfirm={confirmLeave}
        onCancel={cancelLeave}
      />
    </div>
  )
}

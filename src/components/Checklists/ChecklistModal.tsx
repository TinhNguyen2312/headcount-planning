import { Button, Input, Modal } from "antd"
import { Plus } from "lucide-react"
import { useState } from "react"
import { TaskTreeSelect } from "@/components/Common/TaskTreeSelect"
import { checklistQueries } from "@/hooks/server/checklists"
import ProtectedButton from "../Common/ProtectedButton"

const ChecklistModal = () => {
  const [open, setOpen] = useState(false)
  const [taskItemId, setTaskItemId] = useState<number | null>(null)
  const [code, setCode] = useState("")
  const [name, setName] = useState("")
  const [custodian, setCustodian] = useState("")
  const [recipients, setRecipients] = useState("")

  const createMutation = checklistQueries.useCreate()

  const resetForm = () => {
    setOpen(false)
    setTaskItemId(null)
    setCode("")
    setName("")
    setCustodian("")
    setRecipients("")
  }

  const handleCreate = () => {
    if (!code.trim() || !name.trim() || !taskItemId) return
    createMutation.mutate(
      {
        taskItemId,
        code: code.trim(),
        name: name.trim(),
        custodianDepartment: custodian.trim() || null,
        recipients: recipients.trim() || null,
      },
      {
        onSuccess: resetForm,
      },
    )
  }

  return (
    <>
      <ProtectedButton
        type="primary"
        size="small"
        className="h-9"
        icon={<Plus className="size-4" />}
        onClick={() => setOpen(true)}
      >
        Tạo checklist mới
      </ProtectedButton>
      <Modal
        open={open}
        onCancel={resetForm}
        title="Tạo Checklist Mới"
        footer={
          <>
            <Button onClick={resetForm}>Huỷ</Button>
            <Button
              type="primary"
              loading={createMutation.isPending}
              disabled={!code.trim() || !name.trim() || !taskItemId}
              onClick={handleCreate}
            >
              Xác nhận
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <label
              className="text-sm font-medium leading-none"
              htmlFor="tpl-task-item"
            >
              Nghiệp vụ áp dụng *
            </label>
            <TaskTreeSelect
              id="tpl-task-item"
              placeholder="Chọn nghiệp vụ..."
              value={taskItemId}
              onChange={(val) => setTaskItemId(val)}
              className="w-full"
              maxHeight={350}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label
              className="text-sm font-medium leading-none"
              htmlFor="tpl-code"
            >
              Mã biểu mẫu *
            </label>
            <Input
              id="tpl-code"
              placeholder="VD: NVLG-PCD-SOP07.F11.18"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label
              className="text-sm font-medium leading-none"
              htmlFor="tpl-name"
            >
              Tên biểu mẫu *
            </label>
            <Input
              id="tpl-name"
              placeholder="VD: Kiểm tra công tác giàn giáo..."
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label
              className="text-sm font-medium leading-none"
              htmlFor="tpl-custodian"
            >
              Ban/Phòng chịu trách nhiệm lưu bản gốc
            </label>
            <Input
              id="tpl-custodian"
              placeholder="VD: Ban Quản lý Thi công PCD"
              value={custodian}
              onChange={(e) => setCustodian(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label
              className="text-sm font-medium leading-none"
              htmlFor="tpl-recipients"
            >
              Nơi nhận thông tin
            </label>
            <Input.TextArea
              id="tpl-recipients"
              rows={2}
              placeholder="VD: BQLDA, Tư vấn giám sát, Nhà thầu"
              value={recipients}
              onChange={(e) => setRecipients(e.target.value)}
            />
          </div>
        </div>
      </Modal>
    </>
  )
}

export default ChecklistModal

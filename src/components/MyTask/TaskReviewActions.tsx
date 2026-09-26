import { Button, Input, Modal } from "antd"
import { CheckCircle2, XCircle } from "lucide-react"
import { useState } from "react"

interface TaskReviewActionsProps {
  isPending: boolean
  onApprove: (note?: string) => void
  onReject: (reason: string) => void
}

// Approve/Reject action bar for a task awaiting review, with note/reason modals
export function TaskReviewActions({
  isPending,
  onApprove,
  onReject,
}: TaskReviewActionsProps) {
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState("")

  const [approveModalOpen, setApproveModalOpen] = useState(false)
  const [approveNote, setApproveNote] = useState("")

  const handleConfirmReject = () => {
    if (!rejectReason.trim()) return
    onReject(rejectReason.trim())
    setRejectModalOpen(false)
    setRejectReason("")
  }

  const handleConfirmApprove = () => {
    onApprove(approveNote.trim() || undefined)
    setApproveModalOpen(false)
    setApproveNote("")
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          danger
          size="middle"
          icon={<XCircle className="size-4" />}
          loading={isPending}
          onClick={() => setRejectModalOpen(true)}
        >
          Từ chối
        </Button>
        <Button
          type="primary"
          size="middle"
          icon={<CheckCircle2 className="size-4" />}
          loading={isPending}
          onClick={() => setApproveModalOpen(true)}
        >
          Duyệt
        </Button>
      </div>

      {/* Modal Phê duyệt (nhập ghi chú) */}
      <Modal
        open={approveModalOpen}
        onCancel={() => {
          setApproveModalOpen(false)
          setApproveNote("")
        }}
        title="Phê duyệt công việc"
        onOk={handleConfirmApprove}
        confirmLoading={isPending}
        okText="Xác nhận duyệt"
        cancelText="Hủy"
      >
        <div className="flex flex-col gap-2 py-2">
          <p className="text-sm text-muted-foreground">
            Ghi chú phê duyệt (tùy chọn):
          </p>
          <Input.TextArea
            rows={3}
            placeholder="Nhập ý kiến / ghi chú phê duyệt..."
            value={approveNote}
            onChange={(e) => setApproveNote(e.target.value)}
          />
        </div>
      </Modal>

      {/* Modal Từ chối (nhập lý do bắt buộc) */}
      <Modal
        open={rejectModalOpen}
        onCancel={() => {
          setRejectModalOpen(false)
          setRejectReason("")
        }}
        title="Từ chối công việc"
        onOk={handleConfirmReject}
        confirmLoading={isPending}
        okText="Xác nhận từ chối"
        okButtonProps={{ danger: true, disabled: !rejectReason.trim() }}
        cancelText="Hủy"
      >
        <div className="flex flex-col gap-2 py-2">
          <p className="text-sm text-muted-foreground">
            Nêu lý do không đạt để nhân sự thực hiện khắc phục (bắt buộc):
          </p>
          <Input.TextArea
            rows={3}
            placeholder="Lý do từ chối..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
        </div>
      </Modal>
    </>
  )
}

import { Modal } from "antd"
import { AlertTriangle } from "lucide-react"

interface UnsavedChangesModalProps {
  open: boolean
  onConfirm: () => void
  onCancel: () => void
  title?: string
  description?: string
}

export default function UnsavedChangesModal({
  open,
  onConfirm,
  onCancel,
  title = "Bạn có thay đổi chưa lưu",
  description = "Nếu thoát bây giờ, các thay đổi sẽ bị mất. Bạn có chắc muốn thoát không?",
}: UnsavedChangesModalProps) {
  return (
    <Modal
      open={open}
      title={
        <div className="flex gap-2 items-center">
          <AlertTriangle className="size-5 text-amber-500" />
          <span>{title}</span>
        </div>
      }
      okText="Thoát"
      cancelText="Ở lại"
      okButtonProps={{ danger: true }}
      onOk={onConfirm}
      onCancel={onCancel}
      mask={{ closable: false }}
      closable={false}
      centered
      width={420}
    >
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </Modal>
  )
}

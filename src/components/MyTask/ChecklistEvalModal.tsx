import { useEffect } from "react"
import { Form, type FormInstance, Input, Modal } from "antd"
import type {
  ChecklistInstanceItemTreeNodeResponse,
  ChecklistItemStatus,
} from "@/types"
import type { ChecklistEvalFormValues } from "./useChecklistEvaluation"

interface ChecklistEvalModalProps {
  item: ChecklistInstanceItemTreeNodeResponse | null
  status?: ChecklistItemStatus
  form: FormInstance<ChecklistEvalFormValues>
  onCancel: () => void
  onConfirm: () => void
  confirmLoading: boolean
}

export function ChecklistEvalModal({
  item,
  status = "ACCEPTED",
  form,
  onCancel,
  onConfirm,
  confirmLoading,
}: ChecklistEvalModalProps) {
  const isReject = status === "REJECTED"
  const isAccept = status === "ACCEPTED"

  useEffect(() => {
    if (item) {
      form.setFieldsValue({
        reasonDescription: item.reasonDescription ?? "",
      })
    }
  }, [item, form])

  return (
    <Modal
      open={item !== null}
      onCancel={onCancel}
      title={
        isReject
          ? "Đánh giá: Không đạt"
          : isAccept
            ? "Đánh giá: Đạt"
            : "Đánh giá: N/A (Không áp dụng)"
      }
      onOk={onConfirm}
      confirmLoading={confirmLoading}
      okText={
        isReject
          ? "Xác nhận không đạt"
          : isAccept
            ? "Xác nhận Đạt"
            : "Xác nhận N/A"
      }
      okButtonProps={{
        danger: isReject,
      }}
      cancelText="Hủy"
      destroyOnHidden
    >
      <Form form={form} layout="vertical">
        <div className="flex flex-col gap-2 py-2">
          <p className="text-base font-medium text-foreground">
            {item?.checklistItem.title}
          </p>
          <Form.Item
            name="reasonDescription"
            label={
              <span className="text-base text-muted-foreground font-normal">
                {isReject ? (
                  <>
                    Lý do / Nguyên nhân không đạt{" "}
                    <span className="text-red-500">*</span>
                  </>
                ) : isAccept ? (
                  "Ghi chú / Nhận xét nghiệm thu (Tùy chọn)"
                ) : (
                  "Lý do không áp dụng (Tùy chọn)"
                )}
              </span>
            }
            rules={[
              {
                validator: async (_, value: string | undefined) => {
                  if (isReject && (!value || !value.trim())) {
                    return Promise.reject(
                      new Error(
                        "* Bắt buộc phải nhập lý do khi đánh giá Không đạt",
                      ),
                    )
                  }
                  return Promise.resolve()
                },
              },
            ]}
          >
            <Input.TextArea
              rows={3}
              autoFocus
              placeholder={
                isReject
                  ? "Nhập chi tiết nguyên nhân không đạt..."
                  : isAccept
                    ? "Nhập ghi chú hoặc nhận xét nếu có..."
                    : "Nhập lý do không áp dụng tiêu chí này..."
              }
            />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  )
}

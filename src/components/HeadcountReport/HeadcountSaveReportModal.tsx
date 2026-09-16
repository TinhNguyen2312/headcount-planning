"use client"

import { Form, Input, Modal, Tag, message } from "antd"
import { FileSpreadsheet, Hash } from "lucide-react"
import { useEffect } from "react"

interface HeadcountSaveReportModalProps {
  open: boolean
  scopeName: string
  fromMonth: string
  toMonth: string
  totalStandard: number
  totalActual: number
  onCancel: () => void
  onSuccess: (savedReport: any) => void
}

export const HeadcountSaveReportModal = ({
  open,
  scopeName,
  fromMonth,
  toMonth,
  totalStandard,
  totalActual,
  onCancel,
  onSuccess,
}: HeadcountSaveReportModalProps) => {
  const [form] = Form.useForm()

  const generatedReportCode = `BC_${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}_${Math.floor(100 + Math.random() * 900)}`

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        reportCode: generatedReportCode,
        title: `Báo cáo Định biên Nhân sự - ${scopeName} (${fromMonth} -> ${toMonth})`,
        notes: "",
      })
    }
  }, [open, scopeName, fromMonth, toMonth, form, generatedReportCode])

  const handleFinish = (values: any) => {
    const newReport = {
      id: `rep-${Date.now()}`,
      reportCode: values.reportCode,
      title: values.title,
      scopeName,
      fromMonth,
      toMonth,
      totalStandard,
      totalActual,
      totalSurplus: 4.5,
      totalShortage: 3.0,
      fulfillmentRate:
        totalStandard > 0 ? (totalActual / totalStandard) * 100 : 100,
      status: "APPROVED",
      createdBy: "HRBP - Người dùng hiện tại",
      createdAt: new Date().toISOString().replace("T", " ").substring(0, 19),
    }

    message.success(`Đã lưu Báo cáo thành công với Mã BC: ${values.reportCode}`)
    onSuccess(newReport)
    onCancel()
  }

  return (
    <Modal
      open={open}
      title={
        <div className="flex items-center gap-2 text-base font-bold text-foreground">
          <FileSpreadsheet className="size-5 text-primary" />
          Lưu Báo cáo Định biên Nhân sự
        </div>
      }
      onCancel={onCancel}
      onOk={() => form.submit()}
      okText="Lưu Báo cáo"
      cancelText="Hủy bỏ"
      width={520}
      destroyOnClose
    >
      <div className="py-2 flex flex-col gap-4">
        <div className="p-3 bg-muted/40 rounded-xl border border-border/70 text-xs flex flex-col gap-1.5">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Phạm vi chạy:</span>
            <span className="font-semibold text-foreground">{scopeName}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Kỳ phân tích:</span>
            <Tag color="blue">
              {fromMonth} $\rightarrow$ {toMonth}
            </Tag>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Tổng ĐB / Thực tế:</span>
            <span className="font-medium text-foreground">
              {totalStandard.toFixed(1)} ĐB / {totalActual.toFixed(1)} TT
            </span>
          </div>
        </div>

        <Form form={form} layout="vertical" onFinish={handleFinish}>
          <Form.Item
            name="reportCode"
            label="Mã Báo cáo (Tự động sinh duy nhất)"
            rules={[{ required: true }]}
          >
            <Input
              prefix={<Hash className="size-4 text-muted-foreground" />}
              disabled
              className="font-mono font-bold bg-muted/30"
            />
          </Form.Item>

          <Form.Item
            name="title"
            label="Tên Báo cáo định biên"
            rules={[{ required: true, message: "Vui lòng nhập tên báo cáo" }]}
          >
            <Input placeholder="Nhập tên tiêu đề báo cáo..." />
          </Form.Item>

          <Form.Item name="notes" label="Ghi chú / Căn cứ rà soát">
            <Input.TextArea
              rows={3}
              placeholder="Nhập ghi chú hoặc căn cứ đề xuất kế hoạch tuyển dụng/thuyên chuyển..."
            />
          </Form.Item>
        </Form>
      </div>
    </Modal>
  )
}

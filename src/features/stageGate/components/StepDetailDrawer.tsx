import React from "react"
import { Drawer, Tag, Descriptions, Button, Space, Typography, Card, Divider } from "antd"
import { Clock, Building2, UserCheck, FileText, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react"
import type { WorkflowStep } from "../types"

const { Text, Title, Paragraph } = Typography

interface StepDetailDrawerProps {
  step: WorkflowStep | null
  visible: boolean
  onClose: () => void
}

export const StepDetailDrawer: React.FC<StepDetailDrawerProps> = ({
  step,
  visible,
  onClose,
}) => {
  if (!step) return null

  const isDmd = step.performer.includes("DMD")

  return (
    <Drawer
      title={
        <div className="flex items-center gap-2">
          <span className="font-mono bg-primary/10 text-primary font-bold px-2 py-0.5 rounded text-xs">
            BƯỚC {step.stt}
          </span>
          <span className="font-bold text-sm text-foreground truncate max-w-[360px]">
            {step.step_name}
          </span>
        </div>
      }
      placement="right"
      width={520}
      onClose={onClose}
      open={visible}
      extra={
        <Space>
          <Button size="small" onClick={onClose}>
            Đóng
          </Button>
          <Button size="small" type="primary" icon={<CheckCircle2 size={14} />}>
            Xác Nhận Đạt Bước
          </Button>
        </Space>
      }
    >
      <div className="space-y-4">
        {/* Core Metadata */}
        <Card size="small" className="border-border">
          <Descriptions column={1} size="small">
            <Descriptions.Item label={<span className="text-xs text-muted-foreground">Đơn vị chủ trì thực hiện (*)</span>}>
              <span className={`font-semibold text-xs ${isDmd ? "text-primary" : "text-foreground"}`}>
                <UserCheck size={14} className="inline mr-1" />
                {step.performer}
              </span>
            </Descriptions.Item>

            <Descriptions.Item label={<span className="text-xs text-muted-foreground">Đơn vị cung cấp thông tin</span>}>
              <span className="text-xs font-medium text-foreground">
                <Building2 size={13} className="inline mr-1 text-muted-foreground" />
                {step.info_provider || "N/A"}
              </span>
            </Descriptions.Item>

            <Descriptions.Item label={<span className="text-xs text-muted-foreground">Thời hạn cam kết SLA</span>}>
              <Tag color="volcano" className="font-mono text-xs">
                <Clock size={12} className="inline mr-1" />
                {step.duration || "Theo MTL"}
              </Tag>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Detailed Operational Description from SOP09 */}
        <div>
          <Title level={5} className="!mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <FileText size={15} className="text-primary" /> Diễn Giải Trình Tự & Yêu Cầu Chi Tiết (SOP09)
          </Title>
          <div className="p-3.5 rounded-lg border border-border bg-muted/30 text-xs leading-relaxed text-foreground">
            {step.notes_and_forms || "Thực hiện theo tiến độ hợp đồng tư vấn thiết kế và phân công của lãnh đạo phòng."}
          </div>
        </div>

        {/* Branching Logic */}
        <div>
          <Title level={5} className="!mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <ArrowRight size={15} className="text-blue-500" /> Điều Kiện Rẽ Nhánh & Phê Duyệt Cổng
          </Title>
          <div className="space-y-2">
            <div className="p-2.5 rounded-lg border border-emerald-500/30 bg-emerald-500/5 text-xs">
              <div className="font-semibold text-emerald-600 dark:text-emerald-400">
                Trường Hợp Phê Duyệt (Đồng ý):
              </div>
              <div className="text-muted-foreground mt-0.5">
                Chuyển tiếp sang bước quy trình kế tiếp hoặc thực hiện đóng dấu pháp nhân chuyển giai đoạn.
              </div>
            </div>

            <div className="p-2.5 rounded-lg border border-rose-500/30 bg-rose-500/5 text-xs">
              <div className="font-semibold text-rose-600 dark:text-rose-400">
                Trường Hợp Không Duyệt (Cần hiệu chỉnh):
              </div>
              <div className="text-muted-foreground mt-0.5">
                Chuyển trả đơn vị TVTK hoặc chuyên gia bộ môn DMD cập nhật, giải trình lại theo ý kiến của Lãnh đạo / Cơ quan thẩm định.
              </div>
            </div>
          </div>
        </div>

        {/* Reference Standards */}
        <div className="p-3 rounded-lg bg-card border border-border text-xs text-muted-foreground">
          <div className="font-semibold text-foreground mb-1">Căn cứ quy trình & quy chuẩn:</div>
          <div>• Quy trình Quản lý Thiết kế: <strong>NVLG-DMD-SOP09</strong></div>
          <div>• Bảng phân quyền phê duyệt thẩm quyền: <strong>AM hiện hành</strong></div>
          <div>• Quy định lưu trữ Novagen: <strong>NVG-ODD-REG05</strong></div>
        </div>
      </div>
    </Drawer>
  )
}

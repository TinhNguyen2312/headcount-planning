import React, { useState } from "react"
import { Table, Tag, Tooltip, Typography, Select, Button, Space, DatePicker, message, Card } from "antd"
import { Check, Clock, AlertCircle, FileCheck, Layers, Calendar } from "lucide-react"
import type { DmdMatrixStep, DmdCompetency } from "../types"

const { Text } = Typography

interface InteractiveMatrixViewProps {
  steps: DmdMatrixStep[]
  competencies: DmdCompetency[]
  stageName: string
  onUpdateStepStatus: (stepStt: string, status: "TODO" | "IN_PROGRESS" | "DONE") => void
}

export const InteractiveMatrixView: React.FC<InteractiveMatrixViewProps> = ({
  steps,
  competencies,
  stageName,
  onUpdateStepStatus,
}) => {
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<string>("ALL")

  // Group competencies into 5 main groups
  const groups = [
    { key: "G1", label: "1. Kế Hoạch & Tiến Độ MTL", prefix: "1." },
    { key: "G2", label: "2. Chất Lượng, Ngân Sách & Phối Hợp", prefix: "2." },
    { key: "G3", label: "3. Chuẩn Hóa & VE", prefix: "3." },
    { key: "G4", label: "4. Lưu Trữ Hồ Sơ", prefix: "4." },
    { key: "G5", label: "5. Hợp Đồng & Thanh Quyết Toán", prefix: "2.5." },
  ]

  const filteredCompetencies = competencies.filter((comp) => {
    if (selectedGroupFilter === "ALL") return true
    if (selectedGroupFilter === "G5") return comp.code.startsWith("2.5.")
    if (selectedGroupFilter === "G2") return comp.code.startsWith("2.") && !comp.code.startsWith("2.5.")
    if (selectedGroupFilter === "G1") return comp.code.startsWith("1.")
    if (selectedGroupFilter === "G3") return comp.code.startsWith("3.")
    if (selectedGroupFilter === "G4") return comp.code.startsWith("4.")
    return true
  })

  // Fixed columns on the left: STT, Step Name, Weight, Action Status
  const columns: any[] = [
    {
      title: "Mã Bước",
      dataIndex: "stt",
      key: "stt",
      fixed: "left",
      width: 90,
      render: (stt: string) => (
        <span className="font-mono font-bold text-xs bg-muted px-2 py-0.5 rounded text-foreground">
          {stt}
        </span>
      ),
    },
    {
      title: "Công Việc Chuẩn Hóa DMD (Theo SOP09)",
      dataIndex: "name",
      key: "name",
      fixed: "left",
      width: 280,
      render: (name: string, record: DmdMatrixStep) => (
        <div>
          <div className="font-semibold text-xs text-foreground">{name}</div>
          <div className="flex items-center gap-2 mt-1">
            {record.weight !== null && (
              <Tag color="cyan" className="text-[10px] font-mono mr-0">
                Trọng số: {record.weight}
              </Tag>
            )}
            <span className="text-[11px] text-muted-foreground">
              {record.ticked_nv.length} nghiệp vụ áp dụng
            </span>
          </div>
        </div>
      ),
    },
    {
      title: "Trạng Thái Thực Hiện",
      key: "status",
      fixed: "left",
      width: 140,
      render: (_: any, record: DmdMatrixStep) => {
        const currentStatus = record.status || "IN_PROGRESS"
        return (
          <Select
            size="small"
            value={currentStatus}
            style={{ width: "100%" }}
            onChange={(val) => {
              onUpdateStepStatus(record.stt, val)
              message.success(`Đã cập nhật trạng thái bước ${record.stt}!`)
            }}
            options={[
              { label: "Chưa thực hiện", value: "TODO" },
              { label: "Đang xử lý", value: "IN_PROGRESS" },
              { label: "Đã hoàn thành", value: "DONE" },
            ]}
          />
        )
      },
    },
  ]

  // Add 23 dynamic competency columns
  filteredCompetencies.forEach((comp) => {
    columns.push({
      title: (
        <Tooltip title={`${comp.code}: ${comp.name}`} placement="topLeft">
          <div className="text-center cursor-pointer select-none">
            <div className="font-mono font-bold text-xs text-primary">{comp.code}</div>
            <div className="text-[10px] text-muted-foreground truncate w-16 mx-auto">
              {comp.name.split(" ")[0]}...
            </div>
          </div>
        </Tooltip>
      ),
      key: comp.code,
      width: 65,
      align: "center",
      render: (_: any, record: DmdMatrixStep) => {
        const isTicked = record.ticked_nv.some((t) => t.code === comp.code)
        if (!isTicked) {
          return <span className="text-muted/40 font-mono text-xs">·</span>
        }
        return (
          <Tooltip title={`${comp.code} áp dụng cho: ${record.name}`}>
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold shadow-2xs">
              <Check size={14} />
            </span>
          </Tooltip>
        )
      },
    })
  })

  return (
    <div>
      {/* Matrix Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <Space size="middle">
          <span className="text-xs font-semibold text-muted-foreground">Lọc nhóm nghiệp vụ:</span>
          <Select
            value={selectedGroupFilter}
            onChange={setSelectedGroupFilter}
            style={{ width: 260 }}
            options={[
              { label: "Tất cả 23 Nghiệp vụ DMD", value: "ALL" },
              ...groups.map((g) => ({ label: g.label, value: g.key })),
            ]}
          />
        </Space>

        <div className="text-xs text-muted-foreground flex items-center gap-2">
          <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
            <Check size={13} /> Ô có dấu tích
          </span>
          <span>: Nghiệp vụ DMD chuẩn hóa bắt buộc phải thực hiện tại bước đó</span>
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={steps}
        rowKey="stt"
        pagination={false}
        scroll={{ x: 1600 }}
        size="small"
        className="border border-border rounded-lg"
      />

      <div className="mt-3 p-3 bg-muted/40 rounded-lg text-xs text-muted-foreground flex items-start gap-2">
        <AlertCircle size={15} className="text-primary mt-0.5 shrink-0" />
        <div>
          <strong>Cơ chế tính điểm KPI (Sheet Note):</strong> Mỗi bước công việc có trọng số riêng (`weight`). Khi chuyên gia hoàn tất tất cả các nghiệp vụ chuyên môn trong bước và chuyển trạng thái sang <strong>Đã hoàn thành</strong>, điểm số sẽ tự động được ghi nhận vào kết quả thực hiện tháng của cá nhân theo đúng công thức KPI mẹ trong tài liệu SOP.
        </div>
      </div>
    </div>
  )
}

import React, { useState } from "react"
import { Table, Tag, Input, Space, Button, Select, Tooltip, Badge } from "antd"
import { Clock, Building2, UserCheck, ArrowRight, Eye, GitBranch, Search, Filter } from "lucide-react"
import type { WorkflowStep } from "../types"

interface WorkflowProcessViewProps {
  steps: WorkflowStep[]
  stageName: string
  onSelectStep: (step: WorkflowStep) => void
}

export const WorkflowProcessView: React.FC<WorkflowProcessViewProps> = ({
  steps,
  stageName,
  onSelectStep,
}) => {
  const [searchText, setSearchText] = useState("")
  const [filterPerformer, setFilterPerformer] = useState("ALL")

  // Extract unique performers for filtering
  const performers = Array.from(new Set(steps.map((s) => s.performer.trim()))).filter(Boolean)

  const filteredSteps = steps.filter((step) => {
    const matchSearch =
      step.step_name.toLowerCase().includes(searchText.toLowerCase()) ||
      step.notes_and_forms?.toLowerCase().includes(searchText.toLowerCase()) ||
      step.stt.toLowerCase().includes(searchText.toLowerCase())

    const matchPerformer =
      filterPerformer === "ALL" ||
      (filterPerformer === "DMD_ONLY" && step.performer.includes("DMD")) ||
      step.performer === filterPerformer

    return matchSearch && matchPerformer
  })

  const getSlaTag = (duration: string) => {
    if (!duration || duration === "-") {
      return <span className="text-muted-foreground text-xs">-</span>
    }
    if (duration.includes("8h")) {
      return <Tag color="volcano" className="font-mono text-[11px]"><Clock size={11} className="inline mr-1" />{duration}</Tag>
    }
    if (duration.includes("01 ngày") || duration.includes("1 ngày")) {
      return <Tag color="blue" className="font-mono text-[11px]"><Clock size={11} className="inline mr-1" />{duration}</Tag>
    }
    if (duration.includes("02 ngày") || duration.includes("2 ngày")) {
      return <Tag color="cyan" className="font-mono text-[11px]"><Clock size={11} className="inline mr-1" />{duration}</Tag>
    }
    if (duration.includes("3 ngày") || duration.includes("03 ngày")) {
      return <Tag color="purple" className="font-mono text-[11px]"><Clock size={11} className="inline mr-1" />{duration}</Tag>
    }
    return <Tag color="default" className="text-[11px]">{duration}</Tag>
  }

  const columns = [
    {
      title: "STT",
      dataIndex: "stt",
      key: "stt",
      width: 75,
      render: (stt: string) => (
        <span className="font-mono font-bold text-xs bg-muted px-2 py-0.5 rounded text-foreground">
          {stt}
        </span>
      ),
    },
    {
      title: "Bước Công Việc (Theo Lưu Đồ SOP09)",
      dataIndex: "step_name",
      key: "step_name",
      render: (name: string, record: WorkflowStep) => {
        const isDmd = record.performer.includes("DMD")
        return (
          <div>
            <div className="flex items-center gap-2">
              <span className={`font-semibold text-sm ${isDmd ? "text-primary" : "text-foreground"}`}>
                {name}
              </span>
              {isDmd && (
                <Tag color="green" className="text-[10px] font-bold">
                  DMD Chủ Trì
                </Tag>
              )}
            </div>
            <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {record.notes_and_forms}
            </div>
          </div>
        )
      },
    },
    {
      title: "Cung Cấp Thông Tin",
      dataIndex: "info_provider",
      key: "info_provider",
      width: 150,
      render: (provider: string) => (
        <div className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
          <Building2 size={13} className="text-muted-foreground/70" />
          <span>{provider || "-"}</span>
        </div>
      ),
    },
    {
      title: "Thực Hiện (*)",
      dataIndex: "performer",
      key: "performer",
      width: 140,
      render: (performer: string) => {
        const isDmd = performer.includes("DMD")
        return (
          <div className="text-xs font-semibold flex items-center gap-1.5">
            <UserCheck size={14} className={isDmd ? "text-primary" : "text-blue-500"} />
            <span className={isDmd ? "text-primary font-bold" : "text-foreground"}>
              {performer}
            </span>
          </div>
        )
      },
    },
    {
      title: "Thời Hạn SLA",
      dataIndex: "duration",
      key: "duration",
      width: 125,
      render: (duration: string) => getSlaTag(duration),
    },
    {
      title: "Nhánh Rẽ & Phê Duyệt",
      key: "branching",
      width: 180,
      render: (_: any, record: WorkflowStep) => {
        const desc = record.notes_and_forms || ""
        const hasApproval = desc.includes("Duyệt:") || desc.includes("Đồng ý:")
        if (!hasApproval) {
          return <span className="text-xs text-muted-foreground">Tuần tự theo MTL</span>
        }
        return (
          <div className="text-[11px] leading-tight space-y-0.5">
            <div className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Đạt: Đi tiếp bước sau
            </div>
            <div className="text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              Không đạt: Quay lại sửa
            </div>
          </div>
        )
      },
    },
    {
      title: "Chi Tiết",
      key: "action",
      width: 80,
      render: (_: any, record: WorkflowStep) => (
        <Tooltip title="Xem chi tiết diễn giải và biểu mẫu">
          <Button
            size="small"
            type="text"
            icon={<Eye size={15} />}
            onClick={() => onSelectStep(record)}
          />
        </Tooltip>
      ),
    },
  ]

  return (
    <div>
      {/* Search & Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <Space size="middle">
          <Input
            placeholder="Tìm kiếm bước quy trình, biểu mẫu..."
            prefix={<Search size={15} className="text-muted-foreground" />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 280 }}
            allowClear
          />

          <Select
            value={filterPerformer}
            onChange={setFilterPerformer}
            style={{ width: 200 }}
            options={[
              { label: "Tất cả đơn vị thực hiện", value: "ALL" },
              { label: "Chỉ đơn vị DMD chủ trì", value: "DMD_ONLY" },
              ...performers.map((p) => ({ label: p, value: p })),
            ]}
          />
        </Space>

        <div className="text-xs text-muted-foreground">
          Hiển thị <strong>{filteredSteps.length}</strong> / {steps.length} bước quy trình
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={filteredSteps}
        rowKey="stt"
        pagination={false}
        className="border border-border rounded-lg"
        size="middle"
      />
    </div>
  )
}

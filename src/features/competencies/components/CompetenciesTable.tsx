import React from "react"
import { Table, Tag, Tooltip, Button, Space, Typography } from "antd"
import {
  FileText,
  Layers,
  Users,
  CheckCircle2,
  ExternalLink,
  ShieldAlert,
} from "lucide-react"
import type { SubCompetency, MainGroupId } from "../types"

const { Text, Paragraph } = Typography

interface CompetenciesTableProps {
  data: SubCompetency[]
  onSelectCompetency: (comp: SubCompetency) => void
}

const GROUP_TAG_COLORS: Record<MainGroupId, string> = {
  G1: "green",
  G2: "blue",
  G3: "orange",
  G4: "cyan",
  G5: "purple",
}

export const CompetenciesTable: React.FC<CompetenciesTableProps> = ({
  data,
  onSelectCompetency,
}) => {
  const columns: any[] = [
    {
      title: "Mã NV",
      dataIndex: "code",
      key: "code",
      width: 90,
      fixed: "left",
      render: (code: string, record: SubCompetency) => {
        const color = GROUP_TAG_COLORS[record.groupId] || "default"
        return (
          <Tag color={color} className="font-mono font-bold text-xs px-2 py-0.5 m-0">
            {code}
          </Tag>
        )
      },
    },
    {
      title: "Tên Nghiệp Vụ Chuyên Môn & Phạm Vi Công Việc",
      dataIndex: "name",
      key: "name",
      minWidth: 320,
      render: (name: string, record: SubCompetency) => (
        <div className="space-y-1">
          <div
            onClick={() => onSelectCompetency(record)}
            className="font-semibold text-sm text-foreground hover:text-primary cursor-pointer transition-colors leading-snug"
          >
            {name}
          </div>
          <div className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {record.detailedScope}
          </div>
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] text-muted-foreground">Đầu ra chính:</span>
            <span className="text-[11px] font-medium text-foreground bg-muted/60 px-1.5 py-0.5 rounded">
              {record.keyDeliverables}
            </span>
          </div>
        </div>
      ),
    },
    {
      title: "Nhóm Chính",
      dataIndex: "groupTitle",
      key: "groupTitle",
      width: 170,
      render: (groupTitle: string, record: SubCompetency) => {
        const color = GROUP_TAG_COLORS[record.groupId] || "default"
        return (
          <div className="text-xs font-medium">
            <span className="text-foreground">{groupTitle}</span>
          </div>
        )
      },
    },
    {
      title: "Quy Trình & Mẫu Biểu",
      key: "sopAndForms",
      width: 220,
      render: (_: any, record: SubCompetency) => (
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-xs">
            <FileText size={12} className="text-primary shrink-0" />
            <span className="font-mono text-[11px] text-primary font-semibold">
              {record.sopRef}
            </span>
          </div>
          <div className="flex flex-wrap gap-1">
            {record.standardForms.map((form, i) => (
              <Tag key={i} className="text-[10px] m-0 font-mono bg-muted text-muted-foreground">
                {form.split(" ")[0]}
              </Tag>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: "Cổng Stage Áp Dụng",
      dataIndex: "applicableStages",
      key: "applicableStages",
      width: 150,
      render: (stages: string[]) => (
        <div className="flex flex-wrap gap-1">
          {stages.map((stg) => (
            <Tag key={stg} color="geekblue" className="text-[10px] font-mono m-0 px-1">
              {stg}
            </Tag>
          ))}
        </div>
      ),
    },
    {
      title: "Phối Hợp",
      dataIndex: "coordinatingDepts",
      key: "coordinatingDepts",
      width: 140,
      render: (depts: string[]) => (
        <div className="flex flex-wrap gap-1">
          {depts.slice(0, 3).map((dept) => (
            <span
              key={dept}
              className="text-[10px] font-semibold bg-muted px-1.5 py-0.5 rounded text-foreground"
            >
              {dept}
            </span>
          ))}
          {depts.length > 3 && (
            <span className="text-[10px] text-muted-foreground self-center">
              +{depts.length - 3}
            </span>
          )}
        </div>
      ),
    },
    {
      title: "RACI",
      dataIndex: "raciRole",
      key: "raciRole",
      width: 70,
      align: "center",
      render: (role: string) => {
        const color = role === "R" ? "success" : role === "A" ? "error" : "default"
        return (
          <Tooltip title={`Vai trò của DMD: ${role === "R" ? "Chịu trách nhiệm thực hiện (Responsible)" : role === "A" ? "Phê duyệt / Giải trình (Accountable)" : "Tham vấn (Consulted)"}`}>
            <Tag color={color} className="font-bold text-xs m-0">
              {role}
            </Tag>
          </Tooltip>
        )
      },
    },
    {
      title: "Thao Tác",
      key: "action",
      width: 90,
      fixed: "right",
      align: "center",
      render: (_: any, record: SubCompetency) => (
        <Button
          size="small"
          type="primary"
          ghost
          icon={<ExternalLink size={13} />}
          onClick={() => onSelectCompetency(record)}
          className="text-xs"
        >
          Xem
        </Button>
      ),
    },
  ]

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <Table
        columns={columns}
        dataSource={data}
        rowKey="code"
        pagination={{
          pageSize: 23,
          showTotal: (total) => `Tổng cộng: ${total} nghiệp vụ chuyên môn DMD`,
          size: "small",
        }}
        scroll={{ x: 1200 }}
        size="middle"
      />
    </div>
  )
}

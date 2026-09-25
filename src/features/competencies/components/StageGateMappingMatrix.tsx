import React from "react"
import { Table, Tag, Tooltip } from "antd"
import { Check, Minus } from "lucide-react"
import type { SubCompetency, MainGroupId } from "../types"

interface StageGateMappingMatrixProps {
  data: SubCompetency[]
  onSelectCompetency: (comp: SubCompetency) => void
}

const STAGE_COLUMNS = [
  { key: "G1", label: "G1: Concept QH", sub: "NVLG-SOP09.F03" },
  { key: "G2", label: "G2: QH 1/500", sub: "NVLG-SOP09.F04" },
  { key: "G3", label: "G3: Ý Tưởng TK", sub: "NVLG-SOP09.F05" },
  { key: "G4", label: "G4: TK Cơ Sở", sub: "NVLG-SOP09.F06" },
  { key: "G5", label: "G5: TK Kỹ Thuật", sub: "NVLG-SOP09.F07" },
  { key: "G6", label: "G6: Bản Vẽ TC", sub: "NVLG-SOP09.F07" },
  { key: "G7", label: "G7: Bàn Giao AFC", sub: "Bàn Giao PCD" },
  { key: "G8", label: "G8: Hoàn Công", sub: "Nghiệm Thu" },
]

export const StageGateMappingMatrix: React.FC<StageGateMappingMatrixProps> = ({
  data,
  onSelectCompetency,
}) => {
  const columns: any[] = [
    {
      title: "Mã NV",
      dataIndex: "code",
      key: "code",
      width: 85,
      fixed: "left",
      render: (code: string) => (
        <span className="font-mono font-bold text-xs bg-muted px-2 py-0.5 rounded text-foreground">
          {code}
        </span>
      ),
    },
    {
      title: "Nghiệp Vụ Chuyên Môn DMD",
      dataIndex: "name",
      key: "name",
      minWidth: 280,
      fixed: "left",
      render: (name: string, record: SubCompetency) => (
        <div
          onClick={() => onSelectCompetency(record)}
          className="font-medium text-xs text-foreground hover:text-primary cursor-pointer line-clamp-2"
        >
          {name}
        </div>
      ),
    },
    ...STAGE_COLUMNS.map((stage) => ({
      title: (
        <div className="text-center">
          <div className="font-bold text-xs">{stage.label.split(":")[0]}</div>
          <div className="text-[10px] text-muted-foreground truncate">{stage.label.split(":")[1]}</div>
        </div>
      ),
      key: stage.key,
      width: 100,
      align: "center",
      render: (_: any, record: SubCompetency) => {
        const isActive = record.applicableStages.includes(stage.key)
        return isActive ? (
          <Tooltip title={`Nghiệp vụ ${record.code} kích hoạt tại ${stage.label}`}>
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <Check size={14} className="stroke-[3]" />
            </span>
          </Tooltip>
        ) : (
          <span className="text-muted-foreground/30">
            <Minus size={14} />
          </span>
        )
      },
    })),
  ]

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <div className="p-3 bg-muted/40 border-b border-border flex items-center justify-between text-xs text-muted-foreground">
        <div>
          Ma Trận Phân Bổ: <strong className="text-foreground">23 Nghiệp Vụ Chuyên Môn</strong> ×{" "}
          <strong className="text-foreground">8 Cổng Stage-Gate (G1-G8)</strong>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-emerald-500/20 text-emerald-600 inline-flex items-center justify-center text-[10px]">
              ✓
            </span>
            Nghiệp vụ được kích hoạt
          </span>
          <span className="flex items-center gap-1 text-muted-foreground">
            <span>—</span> Không áp dụng
          </span>
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="code"
        pagination={false}
        scroll={{ x: 1100 }}
        size="small"
      />
    </div>
  )
}

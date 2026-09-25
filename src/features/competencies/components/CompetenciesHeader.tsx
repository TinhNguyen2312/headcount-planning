import React from "react"
import { Typography, Tag, Space, Input, Select, Button } from "antd"
import { Search, ShieldCheck, BookOpen, Layers } from "lucide-react"
import type { CompetencyFilterState, MainGroupId } from "../types"

interface CompetenciesHeaderProps {
  filters: CompetencyFilterState
  onFilterChange: (filters: Partial<CompetencyFilterState>) => void
  totalCount: number
  filteredCount: number
}

export const CompetenciesHeader: React.FC<CompetenciesHeaderProps> = ({
  filters,
  onFilterChange,
  totalCount,
  filteredCount,
}) => {
  return (
    <div className="bg-card p-4 rounded-lg border border-border shadow-xs space-y-3">
      {/* Title & Quick Stats Row */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
            <Layers size={18} />
          </span>
          <div>
            <h2 className="text-base font-bold text-foreground leading-tight">
              Khung Nghiệp Vụ Chuyên Môn DMD
            </h2>
            <div className="text-xs text-muted-foreground">
              Phân định 5 nhóm nghiệp vụ chính và 23 nghiệp vụ con theo chuẩn SOP09 & RACI
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <Tag color="green" className="font-semibold text-xs m-0">
            5 Nhóm Chính
          </Tag>
          <Tag color="purple" className="font-semibold text-xs m-0">
            23 Nghiệp Vụ Con
          </Tag>
          <Tag color="blue" className="font-semibold text-xs m-0">
            SOP09 Chuẩn Hóa
          </Tag>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
          <Input
            placeholder="Tìm theo mã (1.1, 2.5...), tên nghiệp vụ hoặc SOP..."
            prefix={<Search size={15} className="text-muted-foreground mr-1" />}
            value={filters.searchQuery}
            onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
            className="w-full sm:w-72"
            allowClear
            size="middle"
          />

          <Select
            value={filters.selectedGroup}
            onChange={(val) => onFilterChange({ selectedGroup: val as MainGroupId | "ALL" })}
            style={{ width: 220 }}
            size="middle"
            options={[
              { label: "Tất cả 5 Nhóm Nghiệp Vụ", value: "ALL" },
              { label: "1. Kế Hoạch & Tiến Độ MTL (5 NV)", value: "G1" },
              { label: "2. Chất Lượng & Ngân Sách (10 NV)", value: "G2" },
              { label: "3. Chuẩn Hóa & Tham Mưu (3 NV)", value: "G3" },
              { label: "4. Quản Lý Lưu Trữ Hồ Sơ (2 NV)", value: "G4" },
              { label: "5. Hợp Đồng & Thanh Quyết Toán (3 NV)", value: "G5" },
            ]}
          />

          <Select
            value={filters.selectedStage}
            onChange={(val) => onFilterChange({ selectedStage: val })}
            style={{ width: 160 }}
            size="middle"
            options={[
              { label: "Tất cả Cổng Stage", value: "ALL" },
              { label: "Cổng G1: Concept QH", value: "G1" },
              { label: "Cổng G2: QH 1/500", value: "G2" },
              { label: "Cổng G3: Ý Tưởng TK", value: "G3" },
              { label: "Cổng G4: TK Cơ Sở", value: "G4" },
              { label: "Cổng G5: TK Kỹ Thuật", value: "G5" },
              { label: "Cổng G6: BV Thi Công", value: "G6" },
              { label: "Cổng G7: Bàn Giao AFC", value: "G7" },
              { label: "Cổng G8: Hoàn Công", value: "G8" },
            ]}
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Hiển thị: </span>
          <strong className="text-foreground font-semibold">{filteredCount}</strong> / {totalCount} nghiệp vụ
          {(filters.searchQuery || filters.selectedGroup !== "ALL" || filters.selectedStage !== "ALL") && (
            <Button
              size="small"
              type="link"
              onClick={() =>
                onFilterChange({
                  searchQuery: "",
                  selectedGroup: "ALL",
                  selectedStage: "ALL",
                  selectedDept: "ALL",
                })
              }
              className="text-xs p-0 ml-1"
            >
              Đặt lại
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

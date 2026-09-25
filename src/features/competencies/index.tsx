import React, { useState, useMemo } from "react"
import { Card, Segmented, Space, Typography } from "antd"
import { Table as TableIcon, LayoutGrid, Network } from "lucide-react"
import { CompetenciesHeader } from "./components/CompetenciesHeader"
import { MainGroupCards } from "./components/MainGroupCards"
import { CompetenciesTable } from "./components/CompetenciesTable"
import { CompetenciesGrid } from "./components/CompetenciesGrid"
import { StageGateMappingMatrix } from "./components/StageGateMappingMatrix"
import { CompetencyDetailDrawer } from "./components/CompetencyDetailDrawer"
import { SUB_COMPETENCIES } from "./data/competenciesData"
import type { SubCompetency, CompetencyFilterState, MainGroupId } from "./types"

export const CompetenciesFeature: React.FC = () => {
  const [filters, setFilters] = useState<CompetencyFilterState>({
    searchQuery: "",
    selectedGroup: "ALL",
    selectedStage: "ALL",
    selectedDept: "ALL",
  })

  const [activeViewMode, setActiveViewMode] = useState<"TABLE" | "GRID" | "MATRIX">("TABLE")
  const [selectedCompetency, setSelectedCompetency] = useState<SubCompetency | null>(null)
  const [drawerVisible, setDrawerVisible] = useState(false)

  const handleFilterChange = (newFilters: Partial<CompetencyFilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
  }

  const handleSelectGroup = (groupId: MainGroupId | "ALL") => {
    setFilters((prev) => ({ ...prev, selectedGroup: groupId }))
  }

  const handleOpenDetail = (comp: SubCompetency) => {
    setSelectedCompetency(comp)
    setDrawerVisible(true)
  }

  // Filtered competencies based on user search and dropdowns
  const filteredData = useMemo(() => {
    return SUB_COMPETENCIES.filter((comp) => {
      // Search Query filter
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase().trim()
        const matchCode = comp.code.toLowerCase().includes(query)
        const matchName = comp.name.toLowerCase().includes(query)
        const matchScope = comp.detailedScope.toLowerCase().includes(query)
        const matchSop = comp.sopRef.toLowerCase().includes(query)
        if (!matchCode && !matchName && !matchScope && !matchSop) return false
      }

      // Group filter
      if (filters.selectedGroup !== "ALL") {
        if (comp.groupId !== filters.selectedGroup) return false
      }

      // Stage filter
      if (filters.selectedStage !== "ALL") {
        if (!comp.applicableStages.includes(filters.selectedStage)) return false
      }

      return true
    })
  }, [filters])

  return (
    <div className="space-y-4">
      {/* 1. Header Banner & Filter */}
      <CompetenciesHeader
        filters={filters}
        onFilterChange={handleFilterChange}
        totalCount={SUB_COMPETENCIES.length}
        filteredCount={filteredData.length}
      />

      {/* 2. Main 5 Groups Cards */}
      <MainGroupCards
        selectedGroup={filters.selectedGroup}
        onSelectGroup={handleSelectGroup}
      />

      {/* 3. Main Content with View Switcher */}
      <Card className="border-border shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-4 border-b border-border">
          <div>
            <div className="font-bold text-base text-foreground">
              {filters.selectedGroup === "ALL"
                ? "Tất Cả 23 Nghiệp Vụ Chuyên Môn DMD"
                : `Nghiệp Vụ Thuộc Nhóm ${filters.selectedGroup}`}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              Hiển thị <strong>{filteredData.length}</strong> / 23 nghiệp vụ phù hợp điều kiện lọc
            </div>
          </div>

          {/* View Mode Toggle */}
          <Space size="middle">
            <Segmented
              value={activeViewMode}
              onChange={(val) => setActiveViewMode(val as "TABLE" | "GRID" | "MATRIX")}
              options={[
                {
                  label: (
                    <span className="flex items-center gap-1.5 px-1 py-0.5">
                      <TableIcon size={14} />
                      Bảng Chi Tiết
                    </span>
                  ),
                  value: "TABLE",
                },
                {
                  label: (
                    <span className="flex items-center gap-1.5 px-1 py-0.5">
                      <LayoutGrid size={14} />
                      Lưới Phân Nhóm
                    </span>
                  ),
                  value: "GRID",
                },
                {
                  label: (
                    <span className="flex items-center gap-1.5 px-1 py-0.5">
                      <Network size={14} />
                      Ma Trận Stage-Gate (2D)
                    </span>
                  ),
                  value: "MATRIX",
                },
              ]}
            />
          </Space>
        </div>

        {/* View Mode Contents */}
        {activeViewMode === "TABLE" && (
          <CompetenciesTable
            data={filteredData}
            onSelectCompetency={handleOpenDetail}
          />
        )}

        {activeViewMode === "GRID" && (
          <CompetenciesGrid
            data={filteredData}
            onSelectCompetency={handleOpenDetail}
          />
        )}

        {activeViewMode === "MATRIX" && (
          <StageGateMappingMatrix
            data={filteredData}
            onSelectCompetency={handleOpenDetail}
          />
        )}
      </Card>

      {/* 4. Detail Drawer */}
      <CompetencyDetailDrawer
        competency={selectedCompetency}
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
      />
    </div>
  )
}

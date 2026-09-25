import React from "react"
import { Card, Row, Col, Progress, Tag } from "antd"
import {
  CalendarClock,
  ShieldAlert,
  Lightbulb,
  Archive,
  FileCheck2,
  ChevronRight,
} from "lucide-react"
import { MAIN_COMPETENCY_GROUPS } from "../data/competenciesData"
import type { MainGroupId } from "../types"

interface MainGroupCardsProps {
  selectedGroup: MainGroupId | "ALL"
  onSelectGroup: (groupId: MainGroupId | "ALL") => void
}

const GROUP_ICONS: Record<MainGroupId, React.ReactNode> = {
  G1: <CalendarClock size={20} className="text-emerald-500" />,
  G2: <ShieldAlert size={20} className="text-blue-500" />,
  G3: <Lightbulb size={20} className="text-amber-500" />,
  G4: <Archive size={20} className="text-cyan-500" />,
  G5: <FileCheck2 size={20} className="text-purple-500" />,
}

export const MainGroupCards: React.FC<MainGroupCardsProps> = ({
  selectedGroup,
  onSelectGroup,
}) => {
  return (
    <Row gutter={[12, 12]}>
      {MAIN_COMPETENCY_GROUPS.map((group) => {
        const isSelected = selectedGroup === group.id
        return (
          <Col xs={24} sm={12} lg={selectedGroup === "ALL" ? 4.8 : 4.8} key={group.id} style={{ flex: "1 1 200px" }}>
            <Card
              size="small"
              onClick={() => onSelectGroup(isSelected ? "ALL" : group.id)}
              className={`cursor-pointer transition-all duration-200 h-full border ${
                isSelected
                  ? "ring-2 ring-primary border-primary shadow-md bg-primary/5"
                  : "hover:border-primary/50 hover:shadow-xs bg-card"
              }`}
            >
              <div className="flex flex-col h-full justify-between gap-2.5">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-md ${group.bgColor}`}>
                        {GROUP_ICONS[group.id]}
                      </div>
                      <span className="font-mono font-bold text-xs px-1.5 py-0.5 rounded bg-muted text-foreground">
                        {group.code}
                      </span>
                    </div>
                    <Tag
                      color={group.badgeColor}
                      className="font-semibold text-[11px] m-0"
                    >
                      {group.subCompetencyCount} NV con
                    </Tag>
                  </div>

                  <h3 className="font-bold text-xs text-foreground line-clamp-2 leading-tight mt-1">
                    {group.shortTitle}
                  </h3>

                  <p className="text-[11px] text-muted-foreground line-clamp-2 mt-1 leading-snug">
                    {group.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-border flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground truncate max-w-[130px]" title={group.keyDepartment}>
                    {group.keyDepartment}
                  </span>
                  <span
                    className={`font-semibold text-xs flex items-center gap-0.5 ${
                      isSelected ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    {isSelected ? "Đang chọn" : "Xem"}
                    <ChevronRight size={13} />
                  </span>
                </div>
              </div>
            </Card>
          </Col>
        )
      })}
    </Row>
  )
}

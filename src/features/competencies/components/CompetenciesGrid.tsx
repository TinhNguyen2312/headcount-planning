import React from "react"
import { Card, Tag, Button, Typography, Space } from "antd"
import { FileText, Layers, Users, ExternalLink, ShieldCheck } from "lucide-react"
import { MAIN_COMPETENCY_GROUPS } from "../data/competenciesData"
import type { SubCompetency, MainGroupId } from "../types"

const { Text, Paragraph } = Typography

interface CompetenciesGridProps {
  data: SubCompetency[]
  onSelectCompetency: (comp: SubCompetency) => void
}

const GROUP_COLORS: Record<MainGroupId, { headerBg: string; text: string; border: string }> = {
  G1: { headerBg: "bg-emerald-500/10", text: "text-emerald-700 dark:text-emerald-300", border: "border-emerald-500/20" },
  G2: { headerBg: "bg-blue-500/10", text: "text-blue-700 dark:text-blue-300", border: "border-blue-500/20" },
  G3: { headerBg: "bg-amber-500/10", text: "text-amber-700 dark:text-amber-300", border: "border-amber-500/20" },
  G4: { headerBg: "bg-cyan-500/10", text: "text-cyan-700 dark:text-cyan-300", border: "border-cyan-500/20" },
  G5: { headerBg: "bg-purple-500/10", text: "text-purple-700 dark:text-purple-300", border: "border-purple-500/20" },
}

export const CompetenciesGrid: React.FC<CompetenciesGridProps> = ({
  data,
  onSelectCompetency,
}) => {
  return (
    <div className="space-y-6">
      {MAIN_COMPETENCY_GROUPS.map((group) => {
        const groupItems = data.filter((item) => item.groupId === group.id)
        if (groupItems.length === 0) return null

        const style = GROUP_COLORS[group.id]

        return (
          <div key={group.id} className="space-y-3">
            {/* Group Header */}
            <div className={`p-3 rounded-lg border ${style.border} ${style.headerBg} flex items-center justify-between`}>
              <div className="flex items-center gap-2.5">
                <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-card text-foreground border border-border">
                  {group.code}
                </span>
                <span className={`font-bold text-sm ${style.text}`}>
                  {group.title}
                </span>
              </div>
              <Tag color={group.badgeColor} className="font-semibold text-xs m-0">
                {groupItems.length} Nghiệp vụ phụ
              </Tag>
            </div>

            {/* Cards in this Group */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {groupItems.map((comp) => (
                <Card
                  key={comp.code}
                  size="small"
                  className="border-border hover:border-primary/50 transition-all hover:shadow-xs flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Tag color="geekblue" className="font-mono font-bold text-xs m-0">
                        MÃ {comp.code}
                      </Tag>
                      <Tag color={comp.raciRole === "R" ? "success" : "error"} className="font-semibold text-[10px] m-0">
                        RACI: {comp.raciRole}
                      </Tag>
                    </div>

                    <h4
                      onClick={() => onSelectCompetency(comp)}
                      className="font-semibold text-xs text-foreground hover:text-primary cursor-pointer transition-colors leading-snug line-clamp-2"
                    >
                      {comp.name}
                    </h4>

                    <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                      {comp.detailedScope}
                    </p>

                    <div className="pt-2 border-t border-border space-y-1.5 text-[11px]">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <FileText size={12} className="text-primary shrink-0" />
                        <span className="font-mono text-[10px] text-foreground truncate">
                          {comp.sopRef}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-muted-foreground">Cổng áp dụng:</span>
                        <div className="flex gap-1 overflow-x-auto">
                          {comp.applicableStages.slice(0, 4).map((s) => (
                            <span key={s} className="font-mono text-[9px] bg-muted px-1 rounded text-foreground">
                              {s}
                            </span>
                          ))}
                          {comp.applicableStages.length > 4 && (
                            <span className="text-[9px] text-muted-foreground">
                              +{comp.applicableStages.length - 4}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-border flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground">
                      Tần suất: <strong className="text-foreground">{comp.frequency.split(" ")[0]}</strong>
                    </span>
                    <Button
                      size="small"
                      type="link"
                      onClick={() => onSelectCompetency(comp)}
                      className="text-xs p-0 flex items-center gap-1"
                    >
                      Chi tiết <ExternalLink size={11} />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

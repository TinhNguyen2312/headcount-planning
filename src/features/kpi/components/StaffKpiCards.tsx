import React from "react"
import { Row, Col, Card, Avatar, Tag, Progress, Typography, Tooltip } from "antd"
import { Award, CheckCircle2, Clock, Target } from "lucide-react"
import { StaffKpiRecord } from "../types"

const { Text } = Typography

interface StaffKpiCardsProps {
  staffList: StaffKpiRecord[]
}

export const StaffKpiCards: React.FC<StaffKpiCardsProps> = ({ staffList }) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-xs text-foreground uppercase tracking-wider">
          Bảng Đánh Giá Hiệu Suất SMART Chuyên Gia DMD (Tháng 09/2026)
        </span>
        <span className="text-xs text-muted-foreground">
          Đánh giá định kỳ tuần/tháng theo chính sách Tổng Công ty (RACI 3.2)
        </span>
      </div>

      <Row gutter={[12, 12]}>
        {staffList.map((staff) => {
          const initials = staff.staffName
            .split(" ")
            .slice(-2)
            .map((w) => w[0])
            .join("")

          return (
            <Col key={staff.id} xs={24} sm={12} md={8} lg={6}>
              <Card
                size="small"
                className="border-border shadow-xs hover:border-primary/50 transition-all h-full flex flex-col justify-between"
              >
                <div>
                  {/* Top info */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <Avatar
                        style={{ backgroundColor: staff.avatarBg }}
                        className="font-bold text-xs"
                      >
                        {initials}
                      </Avatar>
                      <div>
                        <div className="font-bold text-xs text-foreground truncate max-w-[130px]">
                          {staff.staffName}
                        </div>
                        <div className="text-[10px] text-muted-foreground truncate max-w-[130px]">
                          {staff.staffRole}
                        </div>
                      </div>
                    </div>

                    <Tag
                      color={staff.kpiGrade === "A" ? "success" : "processing"}
                      className="font-mono font-bold text-xs py-0.5"
                    >
                      Hạng {staff.kpiGrade}
                    </Tag>
                  </div>

                  {/* KPI Score and Progress */}
                  <div className="my-3 p-2.5 bg-muted/20 rounded-lg border border-border">
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="text-muted-foreground">Điểm KPI tháng:</span>
                      <span className="font-mono font-bold text-primary text-sm">
                        {staff.kpiScore} / 100
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-[11px] text-muted-foreground mb-1">
                      <span>Hoàn thành:</span>
                      <strong className="text-foreground">
                        {staff.doneTasks} / {staff.totalTasks} việc
                      </strong>
                    </div>

                    <Progress
                      percent={Math.round((staff.doneTasks / staff.totalTasks) * 100)}
                      size="small"
                      strokeColor={staff.onTimeRate >= 90 ? "#2db34b" : "#faad14"}
                    />
                  </div>

                  {/* Strengths */}
                  <div className="text-[11px] text-muted-foreground line-clamp-2">
                    <strong className="text-foreground">Thế mạnh: </strong>
                    {staff.keyStrengths}
                  </div>
                </div>

                <div className="border-t border-border pt-2 mt-3 flex justify-between text-[10px] text-muted-foreground">
                  <span>Tỷ lệ đúng hạn:</span>
                  <span className="font-semibold text-emerald-600 font-mono">
                    {staff.onTimeRate}%
                  </span>
                </div>
              </Card>
            </Col>
          )
        })}
      </Row>
    </div>
  )
}

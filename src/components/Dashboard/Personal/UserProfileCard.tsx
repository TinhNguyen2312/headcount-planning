import { Avatar, Card, Col, Row, Statistic, Tag, Typography } from "antd"
import { Briefcase, Building2, CheckCircle2 } from "lucide-react"
import React from "react"
import type { UserPerformanceReportResponse } from "@/types"

const { Text, Title } = Typography

interface UserProfileCardProps {
  userPerf: UserPerformanceReportResponse
  roleName?: string
  departmentName?: string
}

const getInitials = (name?: string) => {
  if (!name) return "KS"
  const parts = name.trim().split(" ")
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export const UserProfileCard: React.FC<UserProfileCardProps> = ({
  userPerf,
  roleName = "Kỹ sư chuyên môn",
  departmentName = "Phòng Quản lý Xây dựng (PCD)",
}) => {
  const passRate = userPerf.passRate ?? 100
  const isExcellent = passRate >= 95
  const isGood = passRate >= 85 && passRate < 95

  const ratingTag = isExcellent ? (
    <Tag color="success" className="font-bold">
      Xuất sắc
    </Tag>
  ) : isGood ? (
    <Tag color="processing" className="font-bold">
      Hoàn thành tốt
    </Tag>
  ) : (
    <Tag color="warning" className="font-bold">
      Cần nỗ lực
    </Tag>
  )

  return (
    <Card className="shadow-2xs rounded-2xl">
      <Row gutter={[24, 24]} align="middle" justify="space-between">
        <Col xs={24} md={14}>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar
                size={58}
                className="bg-primary/10 text-primary font-black text-lg border-2 border-primary/20"
              >
                {getInitials(userPerf.userName)}
              </Avatar>
              <span className="absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full bg-emerald-500 text-white shadow-xs">
                <CheckCircle2 className="size-3.5" />
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex flex-wrap items-center gap-2">
                <Title level={4} className="!mb-0 !text-foreground font-bold">
                  {userPerf.userName || "Kỹ sư giám sát"}
                </Title>
                {ratingTag}
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-base text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Briefcase className="size-3.5 text-primary" />
                  <Text type="secondary">{roleName}</Text>
                </span>
                <span className="flex items-center gap-1.5">
                  <Building2 className="size-3.5 text-muted-foreground" />
                  <Text type="secondary">{departmentName}</Text>
                </span>
              </div>
            </div>
          </div>
        </Col>

        <Col xs={24} md={10}>
          <div className="flex items-center justify-start md:justify-end gap-8 border-t md:border-t-0 md:border-l border-border/60 pt-3 md:pt-0 md:pl-8">
            <Statistic
              title={
                <span className="text-base text-muted-foreground">
                  Tỷ lệ hoàn thành công việc
                </span>
              }
              value={passRate}
              precision={1}
              suffix="%"
              valueStyle={{
                color: "var(--primary)",
                fontWeight: 900,
                fontSize: 24,
              }}
            />
            <Statistic
              title={
                <span className="text-base text-muted-foreground">
                  Thời gian Sớm SLA
                </span>
              }
              value={userPerf.totalEarlyHours || 0}
              precision={1}
              prefix="+"
              suffix="h"
              valueStyle={{
                color: "#1677ff",
                fontWeight: 900,
                fontSize: 24,
                fontFamily: "monospace",
              }}
            />
          </div>
        </Col>
      </Row>
    </Card>
  )
}

export default UserProfileCard

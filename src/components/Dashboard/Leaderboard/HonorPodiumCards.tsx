import { Avatar, Card, Col, Row, Statistic, Tag, Typography } from "antd"
import { Award, Medal, Trophy } from "lucide-react"
import React from "react"
import type { LeaderboardUserResponse } from "@/types"

const { Text } = Typography

interface HonorPodiumCardsProps {
  topEfficiency: LeaderboardUserResponse[]
  topSpeed: LeaderboardUserResponse[]
}

const RANK_CONFIG = [
  {
    rank: 1,
    tagColor: "gold" as const,
    avatarBg: "#faad14",
    label: "#1 Xuất sắc",
    icon: Trophy,
  },
  {
    rank: 2,
    tagColor: "default" as const,
    avatarBg: "#8c8c8c",
    label: "#2 Nhì bảng",
    icon: Medal,
  },
  {
    rank: 3,
    tagColor: "orange" as const,
    avatarBg: "#d46b08",
    label: "#3 Ba bảng",
    icon: Award,
  },
]

const getInitials = (name?: string) => {
  if (!name) return "KS"
  const parts = name.trim().split(" ")
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export const HonorPodiumCards: React.FC<HonorPodiumCardsProps> = ({
  topEfficiency,
}) => {
  return (
    <div className="flex flex-col justify-between gap-2">
      <Card
        className="shadow-2xs rounded-2xl h-full flex flex-col justify-between"
        title={
          <div className="flex items-center gap-2.5 py-1">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Trophy size={18} />
            </div>
            <div>
              <span className="text-base font-bold text-foreground">
                Hiệu quả
              </span>
              <p className="text-xs text-muted-foreground font-normal">
                Top 3 hoàn thành đúng hạn nhất
              </p>
            </div>
          </div>
        }
        extra={
          <Tag color="success" className="mr-0 font-bold">
            ĐÚNG HẠN
          </Tag>
        }
      >
        <Row gutter={[12, 12]}>
          {topEfficiency.slice(0, 3).map((user, idx) => {
            const config = RANK_CONFIG[idx] || RANK_CONFIG[2]
            const RankIcon = config.icon

            return (
              <Col xs={24} sm={8} key={user.userId}>
                <Card
                  size="small"
                  className="h-full text-center hover:border-primary/50 transition-colors"
                >
                  <div className="flex justify-center mb-2.5">
                    <Tag
                      color={config.tagColor}
                      className="mr-0 inline-flex items-center gap-1 font-bold"
                    >
                      <RankIcon size={12} />
                      {config.label}
                    </Tag>
                  </div>

                  <div className="flex flex-col items-center mb-3">
                    <Avatar
                      size={46}
                      style={{ backgroundColor: config.avatarBg }}
                      className="font-black text-white shadow-xs mb-1.5"
                    >
                      {getInitials(user.userName)}
                    </Avatar>
                    <Text strong className="text-xs line-clamp-1">
                      {user.userName}
                    </Text>
                    <Text type="secondary" className="text-[11px] line-clamp-1">
                      {user.roleName || "Kỹ sư chuyên môn"}
                    </Text>
                  </div>

                  <div className="rounded-lg bg-muted/40 p-2">
                    <Statistic
                      value={user.onTimeRate}
                      precision={1}
                      suffix="%"
                      valueStyle={{
                        color: "var(--primary)",
                        fontSize: 16,
                        fontWeight: 900,
                      }}
                    />
                    <div className="text-[12px] text-muted-foreground mt-0.5">
                      <span>
                        {user.onTimeTasks}/{user.totalTasks} việc
                      </span>
                      {user.overdueTasks > 0 && (
                        <span className="text-destructive font-semibold ml-1">
                          - {user.overdueTasks} trễ
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              </Col>
            )
          })}
        </Row>
      </Card>

      {/* <Card
        className="shadow-2xs rounded-2xl h-full flex flex-col justify-between"
        title={
          <div className="flex items-center gap-2.5 py-1">
            <div className="flex size-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Zap size={18} />
            </div>
            <div>
              <span className="text-base font-bold text-foreground">
                Vinh danh Tốc độ
              </span>
              <p className="text-xs text-muted-foreground font-normal">
                Top 3 sớm so với deadline
              </p>
            </div>
          </div>
        }
        extra={
          <Tag color="processing" className="mr-0 font-bold">
            SỚM HẠN
          </Tag>
        }
      >
        <Row gutter={[12, 12]}>
          {topSpeed.slice(0, 3).map((user, idx) => {
            const config = RANK_CONFIG[idx] || RANK_CONFIG[2]
            const RankIcon = config.icon

            return (
              <Col xs={24} sm={8} key={user.userId}>
                <Card
                  size="small"
                  className="h-full text-center hover:border-blue-500/50 transition-colors"
                >
                  <div className="flex justify-center mb-2.5">
                    <Tag
                      color={config.tagColor}
                      className="mr-0 inline-flex items-center gap-1 font-bold"
                    >
                      <RankIcon size={12} />
                      {config.label}
                    </Tag>
                  </div>

                  <div className="flex flex-col items-center mb-3">
                    <Avatar
                      size={46}
                      style={{ backgroundColor: config.avatarBg }}
                      className="font-black text-white shadow-xs mb-1.5"
                    >
                      {getInitials(user.userName)}
                    </Avatar>
                    <Text strong className="text-xs line-clamp-1">
                      {user.userName}
                    </Text>
                    <Text type="secondary" className="text-[11px] line-clamp-1">
                      {user.roleName || "Kỹ sư chuyên môn"}
                    </Text>
                  </div>

                  <div className="rounded-lg bg-muted/40 p-2">
                    <Statistic
                      value={user.totalEarlyHours}
                      precision={1}
                      // prefix="+"
                      suffix="h"
                      valueStyle={{
                        color: "#1677ff",
                        fontSize: 16,
                        fontWeight: 900,
                      }}
                    />
                    <div className="inline-flex items-center gap-1 text-[12px] text-muted-foreground mt-0.5">
                      <Clock size={11} />
                      <span>Thời gian </span>
                    </div>
                  </div>
                </Card>
              </Col>
            )
          })}
        </Row>
      </Card> */}
    </div>
  )
}

export default HonorPodiumCards

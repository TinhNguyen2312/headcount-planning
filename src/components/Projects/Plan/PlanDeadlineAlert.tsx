import { Alert } from "antd"
import dayjs from "dayjs"
import { AlertTriangle } from "lucide-react"
import React from "react"

import type { PhaseWithMetrics } from "./types"

interface PlanDeadlineAlertProps {
  deadlineWarnings: PhaseWithMetrics[]
  projectEndDate?: string | null
}

export const PlanDeadlineAlert: React.FC<PlanDeadlineAlertProps> = ({
  deadlineWarnings,
  projectEndDate,
}) => {
  if (deadlineWarnings.length === 0) return null

  return (
    <Alert
      type="warning"
      showIcon
      icon={<AlertTriangle className="size-5 text-amber-500" />}
      title="Cảnh báo tiến độ giai đoạn vượt hạn dự án"
      description={
        <div className="text-base">
          Có <strong>{deadlineWarnings.length}</strong> giai đoạn có ngày dự
          kiến hoàn thành vượt quá ngày kết thúc cam kết của dự án (
          {dayjs(projectEndDate).format("DD/MM/YYYY")}):{" "}
          {deadlineWarnings
            .map(
              (w) =>
                `${w.milestone?.name || w.milestoneId} (Tháng ${w.endMonth})`,
            )
            .join(", ")}
          . Vui lòng rà soát lại thời lượng hoặc điều chỉnh ngày kết thúc dự án.
        </div>
      }
    />
  )
}

import { Button, Skeleton } from "antd"
import { ChevronLeft, ChevronRight, Inbox } from "lucide-react"

import NoProjectAccess from "@/components/Common/NoProjectAccess"
import PageContainer from "@/components/Common/PageContainer"
import { usePersonalSchedule } from "@/components/Schedules/hooks"
import PersonalCoverageMatrix from "@/components/Schedules/PersonalCoverageMatrix"
import { useProjectAuth } from "@/hooks/useProjectAuth"
import ScheduleCoveragePage from "./ScheduleCoveragePage"

export default function WorkSchedulePage() {
  const { isSuperUser, canEditSchedule } = useProjectAuth()

  if (isSuperUser || canEditSchedule) {
    return <ScheduleCoveragePage />
  }

  return <PersonalScheduleView />
}

function PersonalScheduleView() {
  const {
    projectId,
    weekLabel,
    weekNumber,
    weekStartISO,
    isCurrentWeek,
    matrixRows,
    isLoading,
    shiftWeek,
    goThisWeek,
  } = usePersonalSchedule()

  if (!projectId) {
    return <NoProjectAccess />
  }

  return (
    <PageContainer
      title="Lịch làm việc của tôi"
      subtitle={`Tuần ${weekNumber}`}
      rightSlot={
        <div className="flex items-center gap-1">
          <Button
            icon={<ChevronLeft size={14} />}
            onClick={() => shiftWeek(-1)}
          />
          <Button
            type={isCurrentWeek ? "primary" : "default"}
            onClick={goThisWeek}
          >
            Tuần này ({weekLabel})
          </Button>
          <Button
            icon={<ChevronRight size={14} />}
            onClick={() => shiftWeek(1)}
          />
        </div>
      }
    >
      {isLoading ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : matrixRows.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border bg-card py-16 text-center">
          <Inbox className="size-10 text-muted-foreground" />
          <p className="text-muted-foreground">
            Chức vụ của bạn chưa có công việc nào có thể lên lịch, hoặc bạn chưa
            được phân công vào phân khu nào
          </p>
        </div>
      ) : (
        <PersonalCoverageMatrix rows={matrixRows} weekStart={weekStartISO} />
      )}
    </PageContainer>
  )
}

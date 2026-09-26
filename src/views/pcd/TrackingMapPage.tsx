"use client"

import { useQueries } from "@tanstack/react-query"
import dayjs from "dayjs"
import dynamic from "next/dynamic"
import { useEffect, useMemo, useState } from "react"
import PageContainer from "@/components/Common/PageContainer"
import TrackingFilterBar from "@/components/TrackingMap/TrackingFilterBar"
import type { SessionTrackData } from "@/components/TrackingMap/TrackingMapView"

const TrackingMapView = dynamic(
  () => import("@/components/TrackingMap/TrackingMapView"),
  { ssr: false }
)
import TrackingSessionList from "@/components/TrackingMap/TrackingSessionList"
import { getSessionColor } from "@/components/TrackingMap/utils"
import { projectQueries } from "@/hooks/server/projects"
import { trackingQueries, useTrackingSessions } from "@/hooks/server/tracking"
import useFilterParams from "@/hooks/useFilterParams"
import { useProjectSelector } from "@/hooks/useProjectSelector"
import type { IQueryTrackingSessions, TrackingSessionResponse } from "@/types"

interface TrackingMapPageProps {
  embedded?: boolean
}

export default function TrackingMapPage({
  embedded = false,
}: TrackingMapPageProps = {}) {
  const { projects, selectedProjectId, setSelectedProjectId } =
    useProjectSelector()

  const { data: project } = projectQueries.useDetail(selectedProjectId)

  const todayStr = useMemo(() => dayjs().format("YYYY-MM-DD"), [])

  const [filters, setFilter] = useFilterParams<IQueryTrackingSessions>({
    projectId: selectedProjectId,
    fromDate: todayStr,
    toDate: todayStr,
    limit: 100,
    sortBy: "createdAt",
    order: "DESC",
  })

  // Synchronize filters.projectId when selectedProjectId is resolved or changed
  useEffect(() => {
    if (selectedProjectId && filters.projectId !== selectedProjectId) {
      setFilter({ projectId: selectedProjectId })
    }
  }, [selectedProjectId, filters.projectId, setFilter])

  // Ensure default fromDate and toDate are always present and default to today
  useEffect(() => {
    if (!filters.fromDate || !filters.toDate) {
      setFilter({
        fromDate: filters.fromDate || todayStr,
        toDate: filters.toDate || todayStr,
      })
    }
  }, [filters.fromDate, filters.toDate, todayStr, setFilter])

  const {
    items: sessions = [],
    isLoading: isLoadingSessions,
    isFetching: isFetchingSessions,
    refetch: refetchSessions,
  } = useTrackingSessions(filters, { enabled: !!filters.projectId })

  // Multi-selection: store selected session IDs
  const [selectedSessionIds, setSelectedSessionIds] = useState<number[]>([])

  // Focused session for playback / detail stats
  const [focusedSessionId, setFocusedSessionId] = useState<number | undefined>(
    undefined,
  )

  // When sessions list loads or changes, default to selecting all sessions
  useEffect(() => {
    if (sessions.length > 0) {
      setSelectedSessionIds((prev) => {
        // If nothing is selected yet, or all previous selections are no longer in this sessions list
        const validPrev = prev.filter((id) => sessions.some((s) => s.id === id))
        if (validPrev.length === 0) {
          return sessions.map((s) => s.id)
        }
        return validPrev
      })
    } else {
      setSelectedSessionIds([])
      setFocusedSessionId(undefined)
    }
  }, [sessions])

  // Color map for each session
  const colorMap = useMemo(() => {
    const map: Record<number, string> = {}
    sessions.forEach((s) => {
      map[s.id] = getSessionColor(s.id)
    })
    return map
  }, [sessions])

  // Fetch points in parallel for all selected sessions using useQueries
  const pointsQueries = useQueries({
    queries: selectedSessionIds.map((sessionId) => ({
      ...trackingQueries.points(sessionId),
      enabled: !!sessionId,
      staleTime: 60 * 1000,
    })),
  })

  const isLoadingPoints = pointsQueries.some((q) => q.isLoading)

  // Map each selected session to its track data
  const sessionsTrackData: SessionTrackData[] = useMemo(() => {
    return selectedSessionIds
      .map((sessionId, idx) => {
        const session = sessions.find((s) => s.id === sessionId)
        if (!session) return null

        const rawPoints = pointsQueries[idx]?.data?.result || []
        // Filter by date if filters.fromDate is active
        const filteredPoints = filters.fromDate
          ? rawPoints.filter(
              (p) =>
                dayjs(p.recordedAt).format("YYYY-MM-DD") === filters.fromDate,
            )
          : rawPoints

        return {
          session,
          points: filteredPoints,
          color: colorMap[sessionId] || getSessionColor(sessionId),
        }
      })
      .filter((item): item is SessionTrackData => item !== null)
  }, [selectedSessionIds, sessions, filters.fromDate, colorMap])

  // Handlers for selection
  const handleToggleSession = (sessionId: number, checked: boolean) => {
    if (checked) {
      setSelectedSessionIds((prev) => [...prev, sessionId])
    } else {
      setSelectedSessionIds((prev) => prev.filter((id) => id !== sessionId))
      if (focusedSessionId === sessionId) {
        setFocusedSessionId(undefined)
      }
    }
  }

  const handleToggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedSessionIds(sessions.map((s) => s.id))
    } else {
      setSelectedSessionIds([])
      setFocusedSessionId(undefined)
    }
  }

  const handleFocusSession = (session: TrackingSessionResponse) => {
    if (focusedSessionId === session.id) {
      setFocusedSessionId(undefined)
    } else {
      setFocusedSessionId(session.id)
      // Ensure the focused session is also selected so its track is visible
      if (!selectedSessionIds.includes(session.id)) {
        setSelectedSessionIds((prev) => [...prev, session.id])
      }
    }
  }

  const handleReset = () => {
    setFilter({
      projectId: selectedProjectId,
      zoneId: undefined,
      userId: undefined,
      fromDate: todayStr,
      toDate: todayStr,
    })
  }

  const handleRefresh = () => {
    refetchSessions()
    pointsQueries.forEach((q) => q.refetch())
  }

  const content = (
    <div className="flex flex-col gap-4">
      <TrackingFilterBar
        projects={projects}
        filters={filters}
        onFilterChange={(v) => {
          if (v.projectId !== undefined) {
            setSelectedProjectId(v.projectId)
          }
          setFilter(v)
        }}
        onReset={handleReset}
        onRefresh={handleRefresh}
        isFetching={isFetchingSessions}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        <div className="lg:col-span-4 xl:col-span-4 h-[calc(100vh-250px)] min-h-[600px]">
          <TrackingSessionList
            sessions={sessions}
            selectedSessionIds={selectedSessionIds}
            onToggleSession={handleToggleSession}
            onToggleSelectAll={handleToggleSelectAll}
            onFocusSession={handleFocusSession}
            isLoading={isLoadingSessions}
            colorMap={colorMap}
          />
        </div>

        <div className="lg:col-span-8 xl:col-span-8 h-[calc(100vh-250px)] min-h-[600px]">
          <TrackingMapView
            sessionsTrackData={sessionsTrackData}
            focusedSessionId={focusedSessionId}
            onFocusSession={(session) =>
              setFocusedSessionId(session ? session.id : undefined)
            }
            isLoadingPoints={isLoadingPoints}
            boundaryGeojson={project?.boundaryGeojson}
            projectName={project?.name}
          />
        </div>
      </div>
    </div>
  )

  if (embedded) {
    return content
  }

  return (
    <PageContainer title="Bản đồ Lộ trình di chuyển">
      {content}
    </PageContainer>
  )
}

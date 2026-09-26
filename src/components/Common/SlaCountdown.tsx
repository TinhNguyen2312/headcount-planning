import { Clock } from "lucide-react"
import { useEffect, useState } from "react"

import { getSlaUrgency } from "@/lib/utils"
import type { SlaUrgency } from "@/types"

export interface SlaCountdownProps {
  slaDeadline: string | null
  locked?: boolean
}

const URGENCY_TEXT_CLASS: Record<SlaUrgency, string> = {
  ON_TRACK: "text-emerald-600",
  WARNING: "text-amber-600",
  OVERDUE: "text-red-600",
}

const formatRemaining = (ms: number): string => {
  const totalSeconds = Math.floor(Math.abs(ms) / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  const pad = (n: number) => n.toString().padStart(2, "0")
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
}

export function SlaCountdown({ slaDeadline, locked }: SlaCountdownProps) {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    if (locked || !slaDeadline) return
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [locked, slaDeadline])

  if (!slaDeadline) return null

  const urgency = getSlaUrgency(slaDeadline, now)
  const remainingMs = new Date(slaDeadline).getTime() - now.getTime()
  const label = locked
    ? "SLA đã khóa"
    : remainingMs <= 0
      ? `Quá hạn ${formatRemaining(remainingMs)}`
      : `Còn lại ${formatRemaining(remainingMs)}`

  return (
    <div
      className={`flex items-center gap-1 font-medium ${URGENCY_TEXT_CLASS[urgency]}`}
    >
      <Clock className="size-3.5" />
      <span>{label}</span>
    </div>
  )
}

export default SlaCountdown

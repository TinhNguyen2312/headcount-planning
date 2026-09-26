import dayjs from "dayjs"
import type { TrackingPointResponse } from "@/types"

/**
 * Calculates distance between two points in kilometers using Haversine formula
 */
export function calcDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371 // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/**
 * Calculates total route distance in kilometers
 */
export function calcTotalDistanceKm(points: TrackingPointResponse[]): number {
  if (!points || points.length < 2) return 0
  let total = 0
  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i]
    const p2 = points[i + 1]
    total += calcDistanceKm(p1.lat, p1.lng, p2.lat, p2.lng)
  }
  return total
}

/**
 * Calculates duration in minutes/hours formatted
 */
export function calcDurationFormatted(
  startTime?: string,
  endTime?: string,
): string {
  if (!startTime || !endTime) return "0 phút"
  const start = new Date(startTime).getTime()
  const end = new Date(endTime).getTime()
  const diffMs = Math.max(0, end - start)
  const diffMins = Math.round(diffMs / (1000 * 60))
  if (diffMins < 60) return `${diffMins} phút`
  const hours = Math.floor(diffMins / 60)
  const mins = diffMins % 60
  return `${hours} giờ ${mins > 0 ? `${mins} phút` : ""}`
}

/**
 * Calculates average speed in km/h directly from GPS speed property.
 * Returns null if points have no valid speed data.
 */
export function calcAvgSpeed(points: TrackingPointResponse[]): number | null {
  if (!points || points.length === 0) return null
  const speeds = points
    .map((p) => p.speed)
    .filter((s): s is number => typeof s === "number" && s > 0)
  if (speeds.length === 0) return null
  const sum = speeds.reduce((acc, curr) => acc + curr, 0)
  return sum / speeds.length
}

export const formatTime = (x: string) => dayjs(x).format("HH:mm:ss DD/MM")

export const ROUTE_COLORS = [
  "#2563eb", // Blue
  "#16a34a", // Green
  "#dc2626", // Red
  "#9333ea", // Purple
  "#ea580c", // Orange
  "#0891b2", // Cyan
  "#d97706", // Amber
  "#db2777", // Pink
  "#4f46e5", // Indigo
  "#059669", // Emerald
  "#7c3aed", // Violet
  "#b45309", // Warm Amber
  "#0284c7", // Sky Blue
  "#e11d48", // Rose
  "#15803d", // Forest Green
  "#84cc16", // Lime
  "#6366f1", // Periwinkle
  "#f97316", // Bright Orange
  "#14b8a6", // Teal
  "#a855f7", // Bright Purple
  "#ec4899", // Fuchsia
  "#f43f5e", // Crimson
  "#10b981", // Mint
  "#3b82f6", // Royal Blue
  "#8b5cf6", // Lavender
  "#f59e0b", // Golden
  "#06b6d4", // Electric Cyan
  "#ef4444", // Coral Red
  "#22c55e", // Kelly Green
  "#64748b", // Slate
]

export function getSessionColor(idOrIndex: number): string {
  const idx = Math.abs(idOrIndex) % ROUTE_COLORS.length
  return ROUTE_COLORS[idx]
}

/**
 * Calculates bearing/heading angle in degrees (0 = North, 90 = East, 180 = South, 270 = West)
 * between two GPS coordinates
 */
export function calcBearingDegrees(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const toDeg = (rad: number) => (rad * 180) / Math.PI

  const dLon = toRad(lon2 - lon1)
  const y = Math.sin(dLon) * Math.cos(toRad(lat2))
  const x =
    Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
    Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLon)

  const brng = toDeg(Math.atan2(y, x))
  return (brng + 360) % 360
}

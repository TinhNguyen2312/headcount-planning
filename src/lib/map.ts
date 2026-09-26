import { VIETNAM_BOUNDARY_GEOJSON } from "@/constants/map"
import type { GeoJSONPolygon } from "@/types"

/**
 * Kiểm tra một điểm (lat, lng) có nằm trong đa giác ranh giới Việt Nam hay không
 * Thuật toán Ray-casting algorithm
 */
export function isPointInVietnam(lat: number, lng: number): boolean {
  const coords = VIETNAM_BOUNDARY_GEOJSON.coordinates[0]
  let inside = false
  for (let i = 0, j = coords.length - 1; i < coords.length; j = i++) {
    const xi = coords[i][0] // lng
    const yi = coords[i][1] // lat
    const xj = coords[j][0]
    const yj = coords[j][1]

    const intersect =
      yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi
    if (intersect) inside = !inside
  }
  return inside
}

/**
 * Phân tích chuỗi đầu vào thành cặp tọa độ GPS [lat, lng]
 * Hỗ trợ các định dạng: "10.762622, 106.660172" hoặc "10.762622 106.660172"
 * Tự động nhận diện và đảo nếu người dùng nhập ngược [lng, lat]
 */
export function parseCoordinates(input: string): [number, number] | null {
  const trimmed = input.trim()
  const match = trimmed.match(
    /^([+-]?\d+(?:\.\d+)?)[,\s]+([+-]?\d+(?:\.\d+)?)$/,
  )
  if (!match) return null
  const num1 = parseFloat(match[1])
  const num2 = parseFloat(match[2])
  if (isNaN(num1) || isNaN(num2)) return null

  // In Vietnam: Lat ~ 8.4 - 23.6, Lng ~ 102 - 109.7
  if (num1 >= 8 && num1 <= 24 && num2 >= 102 && num2 <= 110) {
    return [num1, num2]
  }
  // If swapped [lng, lat] -> reverse to [lat, lng]
  if (num2 >= 8 && num2 <= 24 && num1 >= 102 && num1 <= 110) {
    return [num2, num1]
  }
  return [num1, num2]
}

/**
 * Chuyển đổi GeoJSON Polygon [lng, lat] sang mảng tọa độ Leaflet [lat, lng]
 * Tự động loại bỏ điểm đóng vòng (closing duplicate) nếu có
 */
export function geoJsonPolygonToLatLngs(
  geojson?: GeoJSONPolygon | null,
): [number, number][] {
  if (!geojson?.coordinates?.[0]) return []
  const ring = geojson.coordinates[0]
  if (!Array.isArray(ring) || ring.length < 3) return []

  const points = [...ring]
  if (
    points.length > 3 &&
    points[0][0] === points[points.length - 1][0] &&
    points[0][1] === points[points.length - 1][1]
  ) {
    points.pop()
  }

  return points.map(([lng, lat]) => [lat, lng])
}

/**
 * Chuyển đổi mảng tọa độ Leaflet [lat, lng] sang GeoJSON Polygon chuẩn [lng, lat]
 * Tự động thêm điểm đóng vòng (closing point)
 */
export function latLngsToGeoJsonPolygon(
  latLngs: [number, number][],
): GeoJSONPolygon | null {
  if (!latLngs || latLngs.length < 3) return null

  const ring: [number, number][] = latLngs.map(([lat, lng]) => [lng, lat])
  // Ensure closed ring
  const first = ring[0]
  const last = ring[ring.length - 1]
  if (first[0] !== last[0] || first[1] !== last[1]) {
    ring.push([first[0], first[1]])
  }

  return {
    type: "Polygon",
    coordinates: [ring],
  }
}

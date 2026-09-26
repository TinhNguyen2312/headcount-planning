import type { LatLngBoundsExpression } from "leaflet"
import type { GeoJSONPolygon } from "@/types"

/**
 * Tọa độ Đa giác giới hạn phạm vi toàn vẹn lãnh thổ Việt Nam
 */
export const VIETNAM_BOUNDARY_GEOJSON: GeoJSONPolygon = {
  type: "Polygon",
  coordinates: [
    [
      [104.68049047360799, 8.573264065827871],
      [105.64759034589243, 8.627557838300623],
      [107.40595375004588, 9.603465076480063],
      [108.42724154234813, 10.749249712223252],
      [109.29543347314886, 11.43359212013981],
      [109.59215729759978, 13.322433961360616],
      [109.36686698644257, 15.248651875724132],
      [107.60850358228912, 17.17311812291503],
      [106.1468640025866, 19.1608269644004],
      [107.08648944668106, 20.194898495556405],
      [108.08655863279337, 20.97112015073288],
      [108.18546657427702, 21.35006360797214],
      [107.95468137748185, 21.77393147735732],
      [107.44365701314975, 22.043941972964223],
      [107.15242807433685, 22.450529432132633],
      [106.83921959297199, 22.995986125420544],
      [106.20730774460435, 23.233350073441112],
      [105.75672712229002, 23.384638856182104],
      [105.42153909837326, 23.495474350214252],
      [104.78962725000562, 23.384638856182104],
      [104.25662334312159, 23.21821173824092],
      [103.46076875274133, 23.026311254171482],
      [102.49366888045695, 22.995986125420544],
      [102.11452177143633, 22.753140409033094],
      [102.3092528307022, 21.273750526194597],
      [102.48508917111755, 20.699544888381492],
      [102.48508917111755, 20.061273325902324],
      [102.61696642642909, 19.31678762452588],
      [102.60597665515311, 18.442421444161017],
      [102.78181299556849, 15.966812475582364],
      [102.73785391046462, 15.205173378669377],
      [102.97962887853572, 13.640833075840863],
      [103.00160842108764, 12.75338946668504],
      [103.25437660358567, 11.474555335952125],
      [103.50714134293273, 9.790805391412956],
      [103.7599060822798, 9.346799215258942],
      [104.68049047360799, 8.573264065827871],
    ],
  ],
}

/**
 * Bounding box bao bọc đa giác ranh giới Việt Nam (kèm vùng đệm nhỏ)
 */
export const VIETNAM_BOUNDS: LatLngBoundsExpression = [
  [8.4, 102.0], // Tây Nam [minLat, minLng]
  [23.6, 109.7], // Đông Bắc [maxLat, maxLng]
]

/**
 * Tọa độ trung tâm mặc định (Aqua City / Đồng Nai - TP.HCM)
 */
export const DEFAULT_MAP_CENTER: [number, number] = [10.9205, 106.8505]
export const DEFAULT_MAP_ZOOM = 14
export const MIN_MAP_ZOOM = 5

/**
 * Quy chuẩn màu vẽ Đa giác Ranh giới dự án (Green theme chuẩn thương hiệu)
 */
export const PROJECT_BOUNDARY_STYLE = {
  color: "#16a34a",
  weight: 3,
  fillColor: "#22c55e",
  fillOpacity: 0.25,
} as const

/**
 * Cấu hình các lớp bản đồ TileLayer
 */
export const TILE_PROVIDERS = {
  standard: {
    name: "Bản đồ đường bộ",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
  },
  satellite: {
    name: "Ảnh vệ tinh",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution:
      "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
    maxZoom: 19,
  },
} as const

export type MapMode = keyof typeof TILE_PROVIDERS

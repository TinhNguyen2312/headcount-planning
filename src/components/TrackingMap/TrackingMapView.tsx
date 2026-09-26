"use client"

import { Button, Spin, Tooltip } from "antd"
import L from "leaflet"
import { useEffect, useMemo, useRef, useState } from "react"
import "leaflet/dist/leaflet.css"
import { Focus, ZoomIn, ZoomOut } from "lucide-react"
import { MapModeToggle } from "@/components/Common/Map"
import {
  DEFAULT_MAP_CENTER,
  DEFAULT_MAP_ZOOM,
  MIN_MAP_ZOOM,
  PROJECT_BOUNDARY_STYLE,
  TILE_PROVIDERS,
  VIETNAM_BOUNDS,
  type MapMode,
} from "@/constants/map"
import type {
  GeoJSONPolygon,
  TrackingPointResponse,
  TrackingSessionResponse,
} from "@/types"
import TrackingMapEmpty from "./TrackingMapEmpty"
import TrackingMapPlaybackBar from "./TrackingMapPlaybackBar"
import TrackingMapStatsOverlay from "./TrackingMapStatsOverlay"
import { calcBearingDegrees, calcDurationFormatted } from "./utils"

export interface SessionTrackData {
  session: TrackingSessionResponse
  points: TrackingPointResponse[]
  color: string
}

const createCurrentIcon = (bearing: number = 0) =>
  L.divIcon({
    className: "custom-leaflet-marker-current",
    html: `
      <div style="
        position: relative;
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: rgba(37, 99, 235, 0.35);
          animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
        "></div>
        <div style="
          background: #2563eb;
          color: white;
          width: 26px;
          height: 26px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.35);
          transform: rotate(${bearing}deg);
          transition: transform 0.25s ease-out;
        ">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="12 2 19 21 12 17 5 21 12 2"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  })

interface TrackingMapViewProps {
  sessionsTrackData: SessionTrackData[]
  focusedSessionId?: number
  onFocusSession?: (session: TrackingSessionResponse | null) => void
  isLoadingPoints: boolean
  boundaryGeojson?: GeoJSONPolygon | null
  projectName?: string
}

export default function TrackingMapView({
  sessionsTrackData,
  focusedSessionId,
  isLoadingPoints,
  boundaryGeojson,
  projectName,
}: TrackingMapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const boundaryLayerRef = useRef<L.LayerGroup | null>(null)
  const layerGroupRef = useRef<L.LayerGroup | null>(null)
  const playbackLayerRef = useRef<L.LayerGroup | null>(null)
  const currentMarkerRef = useRef<L.Marker | null>(null)
  const playedPolylineRef = useRef<L.Polyline | null>(null)

  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackIndex, setPlaybackIndex] = useState(0)
  const [speedMultiplier, setSpeedMultiplier] = useState(1)
  const [autoFollow, setAutoFollow] = useState(true)

  const [mapMode, setMapMode] = useState<MapMode>("standard")
  const tileLayerRef = useRef<L.TileLayer | null>(null)

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return

    const map = L.map(mapContainerRef.current, {
      center: DEFAULT_MAP_CENTER,
      zoom: DEFAULT_MAP_ZOOM,
      minZoom: MIN_MAP_ZOOM,
      zoomControl: false,
      maxBounds: VIETNAM_BOUNDS,
      maxBoundsViscosity: 1.0,
    })

    const initialProvider = TILE_PROVIDERS.standard
    const tileLayer = L.tileLayer(initialProvider.url, {
      minZoom: MIN_MAP_ZOOM,
      maxZoom: initialProvider.maxZoom,
      attribution: initialProvider.attribution,
      bounds: VIETNAM_BOUNDS,
    }).addTo(map)
    tileLayerRef.current = tileLayer

    const boundaryLayerGroup = L.layerGroup().addTo(map)
    const routeLayerGroup = L.layerGroup().addTo(map)
    const playbackLayerGroup = L.layerGroup().addTo(map)
    boundaryLayerRef.current = boundaryLayerGroup
    layerGroupRef.current = routeLayerGroup
    playbackLayerRef.current = playbackLayerGroup
    mapInstanceRef.current = map

    return () => {
      map.remove()
      mapInstanceRef.current = null
      boundaryLayerRef.current = null
      layerGroupRef.current = null
      playbackLayerRef.current = null
      currentMarkerRef.current = null
      playedPolylineRef.current = null
    }
  }, [])

  // Switch Tile layer (Standard OpenStreetMap vs Esri Satellite)
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current)
    }

    const provider = TILE_PROVIDERS[mapMode]
    tileLayerRef.current = L.tileLayer(provider.url, {
      minZoom: MIN_MAP_ZOOM,
      maxZoom: provider.maxZoom,
      attribution: provider.attribution,
      bounds: VIETNAM_BOUNDS,
    }).addTo(map)
  }, [mapMode])

  // Focused track (if any)
  const focusedTrack = useMemo(() => {
    if (focusedSessionId == null) return null
    return (
      sessionsTrackData.find((t) => t.session.id === focusedSessionId) || null
    )
  }, [sessionsTrackData, focusedSessionId])

  const focusedPoints = useMemo(
    () => focusedTrack?.points || [],
    [focusedTrack],
  )

  // Reset playback when focused track changes
  useEffect(() => {
    setPlaybackIndex(0)
    setIsPlaying(false)
  }, [focusedSessionId])

  // Draw Route Polylines for all sessionsTrackData (static layer)
  useEffect(() => {
    const map = mapInstanceRef.current
    const layerGroup = layerGroupRef.current
    if (!map || !layerGroup) return

    layerGroup.clearLayers()

    const allLatLngs: L.LatLngTuple[] = []

    sessionsTrackData.forEach((track) => {
      if (!track.points || track.points.length === 0) return

      const isFocused =
        focusedSessionId != null && track.session.id === focusedSessionId
      const latLngs: L.LatLngTuple[] = track.points.map((p) => [p.lat, p.lng])
      allLatLngs.push(...latLngs)

      // Polyline
      const poly = L.polyline(latLngs, {
        color: track.color,
        weight: isFocused ? 6 : 3.5,
        opacity: isFocused ? 1.0 : 0.8,
        lineCap: "round",
        lineJoin: "round",
      }).addTo(layerGroup)

      poly.bindTooltip(
        `<div style="font-family: sans-serif; font-size: 12px; line-height: 1.4;">
           <b style="color: ${track.color}; font-size: 13px;">${track.session.userName}</b><br/>
           <b>Khu vực:</b> ${track.session.zoneName || "Khu vực chung"}
         </div>`,
        { sticky: true },
      )

      // Hover-only: highlight route and display info tooltip, no click to select
      poly.on("mouseover", () => {
        poly.setStyle({
          weight: isFocused ? 8 : 5.5,
          opacity: 1.0,
        })
      })

      poly.on("mouseout", () => {
        poly.setStyle({
          weight: isFocused ? 6 : 3.5,
          opacity: isFocused ? 1.0 : 0.8,
        })
      })
    })

    // Fit map bounds: focused track -> all points -> fallback to boundaryGeojson
    let targetBounds: L.LatLngBounds | null = null
    if (focusedTrack && focusedTrack.points.length > 0) {
      targetBounds = L.latLngBounds(
        focusedTrack.points.map((p) => [p.lat, p.lng]),
      )
    } else if (allLatLngs.length > 0) {
      targetBounds = L.latLngBounds(allLatLngs)
    } else if (boundaryGeojson) {
      try {
        const tempLayer = L.geoJSON(boundaryGeojson as any)
        const b = tempLayer.getBounds()
        if (b.isValid()) {
          targetBounds = b
        }
      } catch {
        // ignore
      }
    }

    if (targetBounds && targetBounds.isValid()) {
      map.fitBounds(targetBounds, {
        padding: [50, 50],
        maxZoom: 17,
        animate: false,
      })
      map.setMinZoom(5)
      map.setMaxBounds(VIETNAM_BOUNDS)
    } else {
      map.setMinZoom(5)
      map.setMaxBounds(VIETNAM_BOUNDS)
    }
  }, [sessionsTrackData, focusedSessionId, focusedTrack, boundaryGeojson])

  // Render Project boundary GeoJSON
  useEffect(() => {
    const boundaryLayer = boundaryLayerRef.current
    if (!boundaryLayer) return

    boundaryLayer.clearLayers()
    if (!boundaryGeojson) return

    try {
      const geoJsonLayer = L.geoJSON(boundaryGeojson as any, {
        style: PROJECT_BOUNDARY_STYLE,
      })

      if (projectName) {
        geoJsonLayer.bindTooltip(
          `<div style="font-family: sans-serif; font-size: 12px; font-weight: 600; color: #15803d;">
            Ranh giới dự án: ${projectName}
          </div>`,
          { sticky: true },
        )
      }

      geoJsonLayer.addTo(boundaryLayer)

      // Automatically fit map view to project boundary if there are no sessions active
      const bBounds = geoJsonLayer.getBounds()
      if (
        bBounds &&
        bBounds.isValid() &&
        mapInstanceRef.current &&
        sessionsTrackData.length === 0
      ) {
        mapInstanceRef.current.fitBounds(bBounds, {
          padding: [50, 50],
          animate: false,
        })
        mapInstanceRef.current.setMinZoom(5)
        mapInstanceRef.current.setMaxBounds(VIETNAM_BOUNDS)
      }
    } catch (err) {
      console.warn("Failed to render project boundary GeoJSON:", err)
    }
  }, [boundaryGeojson, projectName, sessionsTrackData.length])

  // Manage moving marker and green played polyline in dedicated playbackLayer
  useEffect(() => {
    const playbackLayer = playbackLayerRef.current
    if (!playbackLayer) return

    // Clear previous playback elements
    playbackLayer.clearLayers()
    currentMarkerRef.current = null
    playedPolylineRef.current = null

    if (!focusedTrack || focusedPoints.length === 0) return

    const curIdx = Math.min(playbackIndex, focusedPoints.length - 1)
    const currentPoint = focusedPoints[curIdx]
    if (!currentPoint) return

    const latLng: L.LatLngTuple = [currentPoint.lat, currentPoint.lng]

    // 1. Draw green played polyline up to curIdx
    const playedLatLngs = focusedPoints
      .slice(0, curIdx + 1)
      .map((p) => [p.lat, p.lng] as L.LatLngTuple)

    const playedPoly = L.polyline(playedLatLngs, {
      color: "#16a34a",
      weight: 6,
      opacity: 0.95,
      lineCap: "round",
      lineJoin: "round",
    }).addTo(playbackLayer)
    playedPolylineRef.current = playedPoly

    // 2. Calculate bearing angle to rotate icon in the direction of travel
    let bearing = 0
    if (focusedPoints.length > 1) {
      if (curIdx < focusedPoints.length - 1) {
        const nextPoint = focusedPoints[curIdx + 1]
        bearing = calcBearingDegrees(
          currentPoint.lat,
          currentPoint.lng,
          nextPoint.lat,
          nextPoint.lng,
        )
      } else if (curIdx > 0) {
        const prevPoint = focusedPoints[curIdx - 1]
        bearing = calcBearingDegrees(
          prevPoint.lat,
          prevPoint.lng,
          currentPoint.lat,
          currentPoint.lng,
        )
      }
    }

    // 3. Create SINGLE navigation arrow marker
    const marker = L.marker(latLng, {
      icon: createCurrentIcon(bearing),
      zIndexOffset: 1000,
    }).addTo(playbackLayer)
    currentMarkerRef.current = marker

    // 4. Pan map if autoFollow is enabled
    if (autoFollow && mapInstanceRef.current && isPlaying) {
      mapInstanceRef.current.panTo(latLng, { animate: true, duration: 0.3 })
    }
  }, [playbackIndex, focusedTrack, focusedPoints, autoFollow, isPlaying])

  // Playback timer interval
  useEffect(() => {
    if (!isPlaying || focusedPoints.length <= 1) return

    const intervalTime = Math.max(100, 1000 / speedMultiplier)
    const timer = setInterval(() => {
      setPlaybackIndex((prev) => {
        if (prev >= focusedPoints.length - 1) {
          setIsPlaying(false)
          return prev
        }
        return prev + 1
      })
    }, intervalTime)

    return () => clearInterval(timer)
  }, [isPlaying, focusedPoints.length, speedMultiplier])

  // Calculate stats
  const focusedDuration = useMemo(
    () =>
      focusedTrack && focusedTrack.points.length > 0
        ? calcDurationFormatted(
            focusedTrack.points[0]?.recordedAt,
            focusedTrack.points[focusedTrack.points.length - 1]?.recordedAt,
          )
        : "0 phút",
    [focusedTrack],
  )

  // Center map on route or project boundary
  const handleRecenter = () => {
    const map = mapInstanceRef.current
    if (!map) return

    if (focusedTrack && focusedTrack.points.length > 0) {
      const b = L.latLngBounds(focusedTrack.points.map((p) => [p.lat, p.lng]))
      if (b.isValid()) {
        map.fitBounds(b, { padding: [50, 50] })
        return
      }
    }

    const allPoints = sessionsTrackData.flatMap((t) => t.points)
    if (allPoints.length > 0) {
      const b = L.latLngBounds(allPoints.map((p) => [p.lat, p.lng]))
      if (b.isValid()) {
        map.fitBounds(b, { padding: [50, 50] })
        return
      }
    }

    if (boundaryGeojson) {
      try {
        const temp = L.geoJSON(boundaryGeojson as any)
        const b = temp.getBounds()
        if (b.isValid()) {
          map.fitBounds(b, { padding: [50, 50] })
          return
        }
      } catch {
        // ignore
      }
    }

    map.fitBounds(VIETNAM_BOUNDS, { padding: [20, 20] })
  }

  return (
    <div
      className={`relative flex flex-col h-full bg-card rounded-xl border border-border shadow-sm overflow-hidden min-h-560px`}
    >
      <div ref={mapContainerRef} className="w-full flex-1 min-h-[400px] z-0" />

      {/* Floating Action Controls (Top-Right): Zoom In/Out, Recenter, Satellite Toggle */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2 bg-background/90 backdrop-blur-md p-1.5 rounded-lg border border-border shadow-md">
        <Tooltip title="Phóng to" placement="left">
          <Button
            type="text"
            size="small"
            icon={<ZoomIn className="size-4" />}
            onClick={() => mapInstanceRef.current?.zoomIn()}
          />
        </Tooltip>
        <Tooltip title="Thu nhỏ" placement="left">
          <Button
            type="text"
            size="small"
            icon={<ZoomOut className="size-4" />}
            onClick={() => mapInstanceRef.current?.zoomOut()}
          />
        </Tooltip>
        <div className="w-full h-px bg-border my-0.5" />
        <Tooltip title="Căn giữa lộ trình / dự án" placement="left">
          <Button
            type="text"
            size="small"
            icon={<Focus className="size-4" />}
            onClick={handleRecenter}
          />
        </Tooltip>
        <MapModeToggle mode={mapMode} onChange={setMapMode} />
      </div>

      <TrackingMapStatsOverlay
        sessionsTrackData={sessionsTrackData}
        focusedTrack={focusedTrack}
        focusedDuration={focusedDuration}
      />

      {isLoadingPoints && (
        <div className="absolute inset-0 z-20 bg-background/40 backdrop-blur-2xs flex items-center justify-center">
          <div className="bg-card p-4 rounded-xl shadow-lg border border-border flex items-center gap-3">
            <Spin />
            <span className="text-sm font-medium">
              Đang tải dữ liệu lộ trình GPS...
            </span>
          </div>
        </div>
      )}

      <TrackingMapEmpty
        visible={
          !isLoadingPoints && sessionsTrackData.length === 0 && !boundaryGeojson
        }
      />

      {focusedTrack && (
        <TrackingMapPlaybackBar
          points={focusedPoints}
          playbackIndex={playbackIndex}
          isPlaying={isPlaying}
          speedMultiplier={speedMultiplier}
          autoFollow={autoFollow}
          onTogglePlay={() => {
            if (playbackIndex >= focusedPoints.length - 1) {
              setPlaybackIndex(0)
            }
            setIsPlaying(!isPlaying)
          }}
          onRestart={() => {
            setIsPlaying(false)
            setPlaybackIndex(0)
          }}
          onSeek={(val) => {
            setPlaybackIndex(val)
            setIsPlaying(false)
          }}
          onChangeSpeed={setSpeedMultiplier}
          onToggleAutoFollow={() => setAutoFollow(!autoFollow)}
        />
      )}
    </div>
  )
}

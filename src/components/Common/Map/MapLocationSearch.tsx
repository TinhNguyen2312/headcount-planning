import { Input } from "antd"
import L from "leaflet"
import { Loader2, MapPin, Search } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { parseCoordinates } from "@/lib/map"

export interface MapLocationSearchProps {
  map: L.Map | null
  projectAddress?: string | null
  className?: string
  placeholder?: string
  onLocationSelected?: (lat: number, lng: number, name: string) => void
}

export default function MapLocationSearch({
  map,
  projectAddress,
  className = "",
  placeholder = "Tìm địa chỉ, địa danh hoặc tọa độ GPS...",
  onLocationSelected,
}: MapLocationSearchProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<
    Array<{
      id: string
      name: string
      lat: number
      lng: number
      type?: string
    }>
  >([])
  const [isSearching, setIsSearching] = useState(false)
  const [isOpenResults, setIsOpenResults] = useState(false)
  const searchMarkerRef = useRef<L.Marker | null>(null)
  const searchContainerRef = useRef<HTMLDivElement>(null)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Prevent Leaflet map click/scroll propagation on search container
  useEffect(() => {
    if (searchContainerRef.current) {
      L.DomEvent.disableClickPropagation(searchContainerRef.current)
      L.DomEvent.disableScrollPropagation(searchContainerRef.current)
    }
  }, [])

  // Clean up search marker on unmount
  useEffect(() => {
    return () => {
      if (searchMarkerRef.current && map) {
        map.removeLayer(searchMarkerRef.current)
        searchMarkerRef.current = null
      }
    }
  }, [map])

  // Execute free geocoding search
  const executeSearch = async (text: string) => {
    const query = text.trim()
    if (!query) {
      setSearchResults([])
      setIsSearching(false)
      return
    }

    // 1. Direct GPS coordinate jump
    const parsedCoords = parseCoordinates(query)
    if (parsedCoords) {
      const [lat, lng] = parsedCoords
      setSearchResults([
        {
          id: `coord-${lat}-${lng}`,
          name: `Tọa độ GPS: ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
          lat,
          lng,
          type: "gps",
        },
      ])
      setIsSearching(false)
      setIsOpenResults(true)
      return
    }

    // 2. OpenStreetMap Nominatim (Free, Vietnam territory only)
    setIsSearching(true)
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        query,
      )}&format=json&countrycodes=vn&limit=6&addressdetails=1`
      const res = await fetch(url, {
        headers: {
          "Accept-Language": "vi,en",
        },
      })
      if (!res.ok) throw new Error("Search failed")
      const data = await res.json()
      const items = data.map((item: any) => ({
        id: String(item.place_id),
        name: item.display_name,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        type: item.type,
      }))
      setSearchResults(items)
      setIsOpenResults(true)
    } catch (err) {
      console.error("Geocoding search error:", err)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  // Handle input change with debounce (450ms)
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setSearchQuery(val)

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    if (!val.trim()) {
      setSearchResults([])
      setIsOpenResults(false)
      if (searchMarkerRef.current && map) {
        map.removeLayer(searchMarkerRef.current)
        searchMarkerRef.current = null
      }
      return
    }

    debounceTimerRef.current = setTimeout(() => {
      executeSearch(val)
    }, 450)
  }

  // Handle select search result
  const handleSelectLocation = (lat: number, lng: number, name: string) => {
    if (!map) return

    map.flyTo([lat, lng], 16, { duration: 1.2 })
    setIsOpenResults(false)

    // Add or replace pin marker
    if (searchMarkerRef.current) {
      map.removeLayer(searchMarkerRef.current)
    }

    const pinIcon = L.divIcon({
      className: "custom-search-pin",
      html: `
        <div style="
          background-color: #ef4444;
          color: white;
          padding: 6px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
          border: 2px solid white;
          width: 18px;
          height: 18px;
        ">
          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
    })

    const marker = L.marker([lat, lng], { icon: pinIcon })
      .addTo(map)
      .bindPopup(
        `
        <div style="font-family: inherit; font-size: 13px; max-width: 250px; line-height: 1.4;">
          <div style="font-weight: 600; color: #111; margin-bottom: 4px;">${name}</div>
        </div>
      `,
      )
      .openPopup()

    searchMarkerRef.current = marker
    onLocationSelected?.(lat, lng, name)
  }

  // Quick action: search by project address
  const handleSearchProjectAddress = () => {
    if (!projectAddress) return
    setSearchQuery(projectAddress)
    executeSearch(projectAddress)
  }

  // Clear search query & marker
  const handleClearSearch = () => {
    setSearchQuery("")
    setSearchResults([])
    setIsOpenResults(false)
    if (searchMarkerRef.current && map) {
      map.removeLayer(searchMarkerRef.current)
      searchMarkerRef.current = null
    }
  }

  return (
    <div
      ref={searchContainerRef}
      className={`flex flex-col gap-1.5 ${className}`}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onDoubleClick={(e) => e.stopPropagation()}
    >
      {/* Search Input Box using Ant Design Input */}
      <Input
        value={searchQuery}
        onChange={handleSearchInputChange}
        onClear={handleClearSearch}
        onFocus={() => {
          if (searchResults.length > 0) setIsOpenResults(true)
        }}
        placeholder={placeholder}
        allowClear
        prefix={
          isSearching ? (
            <Loader2 className="size-4 animate-spin text-primary mr-1" />
          ) : (
            <Search className="size-4 text-muted-foreground mr-1" />
          )
        }
        className="shadow-lg rounded-xl backdrop-blur-md bg-background/95 border-border text-xs py-1.5"
        size="middle"
      />

      {/* Quick chip for Project Address if available */}
      {projectAddress && !searchQuery && (
        <button
          type="button"
          onClick={handleSearchProjectAddress}
          className="self-start inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium bg-background/90 hover:bg-background backdrop-blur-md rounded-lg border border-border shadow-sm text-foreground-muted hover:text-primary transition-all text-left max-w-full truncate"
          title={`Tìm theo địa chỉ dự án: ${projectAddress}`}
        >
          <MapPin className="size-3 text-red-500 shrink-0" />
          <span className="truncate">Dự án: {projectAddress}</span>
        </button>
      )}

      {/* Search Results Dropdown */}
      {isOpenResults && (
        <div className="bg-background/95 backdrop-blur-md rounded-xl border border-border shadow-xl overflow-hidden max-h-64 overflow-y-auto">
          {searchResults.length > 0 ? (
            <div className="py-1">
              <div className="px-3 py-1 text-[10px] uppercase font-semibold tracking-wider text-foreground-muted border-b border-border/50">
                Kết quả tìm kiếm ({searchResults.length})
              </div>
              {searchResults.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() =>
                    handleSelectLocation(item.lat, item.lng, item.name)
                  }
                  className="w-full px-3 py-2 text-left hover:bg-muted/60 flex items-start gap-2.5 border-b border-border/30 last:border-b-0 transition-colors group"
                >
                  <MapPin className="size-4 text-red-500 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-foreground line-clamp-2 leading-snug">
                      {item.name}
                    </div>
                    <div className="text-[10px] text-foreground-muted mt-0.5">
                      {item.lat.toFixed(5)}, {item.lng.toFixed(5)}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : !isSearching && searchQuery.trim() ? (
            <div className="p-3 text-center text-xs text-foreground-muted">
              Không tìm thấy địa điểm phù hợp trong lãnh thổ Việt Nam
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}

import { Modal } from "antd"
import { useMemo, useState } from "react"
import { regionQueries } from "@/hooks/server/regions"
import { sectorQueries } from "@/hooks/server/sectors"
import type { RegionDetail, SectorResponse } from "@/types"

export const useSectorRegionManager = () => {
  const { data: sectors = [], isLoading: isLoadingSectors } =
    sectorQueries.useList()
  const { data: regions = [], isLoading: isLoadingRegions } =
    regionQueries.useList()

  const deleteSectorMutation = sectorQueries.useDelete()
  const deleteRegionMutation = regionQueries.useDelete()

  // Selected sector state
  const [selectedSectorId, setSelectedSectorId] = useState<number | null>(null)
  const [sectorSearch, setSectorSearch] = useState("")
  const [regionSearch, setRegionSearch] = useState("")

  // Modal states
  const [isSectorModalOpen, setIsSectorModalOpen] = useState(false)
  const [editingSector, setEditingSector] = useState<SectorResponse | null>(
    null,
  )

  const [isRegionModalOpen, setIsRegionModalOpen] = useState(false)
  const [editingRegion, setEditingRegion] = useState<RegionDetail | null>(null)

  // Map regions count by sector
  const regionsCountBySector = useMemo(() => {
    const map = new Map<number, number>()
    for (const r of regions) {
      map.set(r.sectorId, (map.get(r.sectorId) ?? 0) + 1)
    }
    return map
  }, [regions])

  // Active sector fallback to first sector
  const activeSectorId = useMemo(() => {
    if (selectedSectorId && sectors.some((s) => s.id === selectedSectorId)) {
      return selectedSectorId
    }
    return sectors[0]?.id ?? null
  }, [selectedSectorId, sectors])

  const activeSector = useMemo(() => {
    return sectors.find((s) => s.id === activeSectorId) ?? null
  }, [sectors, activeSectorId])

  // Filtered sectors
  const filteredSectors = useMemo(() => {
    if (!sectorSearch.trim()) return sectors
    const q = sectorSearch.toLowerCase().trim()
    return sectors.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (s.code && s.code.toLowerCase().includes(q)),
    )
  }, [sectors, sectorSearch])

  // Filtered regions for active sector
  const filteredRegions = useMemo(() => {
    let list = regions
    if (activeSectorId != null) {
      list = list.filter((r) => r.sectorId === activeSectorId)
    }
    if (regionSearch.trim()) {
      const q = regionSearch.toLowerCase().trim()
      list = list.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          (r.code && r.code.toLowerCase().includes(q)) ||
          (r.description && r.description.toLowerCase().includes(q)),
      )
    }
    return list
  }, [regions, activeSectorId, regionSearch])

  // Modal actions
  const openCreateSector = () => {
    setEditingSector(null)
    setIsSectorModalOpen(true)
  }

  const openEditSector = (sector: SectorResponse) => {
    setEditingSector(sector)
    setIsSectorModalOpen(true)
  }

  const closeSectorModal = () => {
    setIsSectorModalOpen(false)
    setEditingSector(null)
  }

  const openCreateRegion = () => {
    setEditingRegion(null)
    setIsRegionModalOpen(true)
  }

  const openEditRegion = (region: RegionDetail) => {
    setEditingRegion(region)
    setIsRegionModalOpen(true)
  }

  const closeRegionModal = () => {
    setIsRegionModalOpen(false)
    setEditingRegion(null)
  }

  // Delete Sector confirmation
  const handleDeleteSector = (sector: SectorResponse) => {
    Modal.confirm({
      title: "Xác nhận xóa khu vực",
      content: `Bạn có chắc muốn xóa khu vực "${sector.name}" không? Nếu còn vùng dự án trực thuộc sẽ không thể xóa.`,
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      centered: true,
      onOk: async () => {
        await deleteSectorMutation.mutateAsync(sector.id)
      },
    })
  }

  // Delete Region confirmation
  const handleDeleteRegion = (region: RegionDetail) => {
    Modal.confirm({
      title: "Xác nhận xóa vùng dự án",
      content: `Bạn có chắc muốn xóa vùng "${region.name}" không? Nếu còn dự án trực thuộc sẽ không thể xóa.`,
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      centered: true,
      onOk: async () => {
        await deleteRegionMutation.mutateAsync(region.id)
      },
    })
  }

  return {
    // Data & loading
    sectors,
    regions,
    filteredSectors,
    filteredRegions,
    regionsCountBySector,
    isLoadingSectors,
    isLoadingRegions,
    isLoading: isLoadingSectors || isLoadingRegions,

    // Sector selection
    activeSectorId,
    activeSector,
    setSelectedSectorId,

    // Search filters
    sectorSearch,
    setSectorSearch,
    regionSearch,
    setRegionSearch,

    // Sector modal
    isSectorModalOpen,
    editingSector,
    openCreateSector,
    openEditSector,
    closeSectorModal,

    // Region modal
    isRegionModalOpen,
    editingRegion,
    openCreateRegion,
    openEditRegion,
    closeRegionModal,

    // Delete actions
    handleDeleteSector,
    handleDeleteRegion,
  }
}

export type UseSectorRegionManagerReturn = ReturnType<
  typeof useSectorRegionManager
>

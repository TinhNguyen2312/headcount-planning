import RegionModal from "@/components/Projects/RegionModal"
import SectorModal from "@/components/Projects/SectorModal"
import {
  RegionTableCard,
  SectorListCard,
  useSectorRegionManager,
} from "@/components/Projects/SectorRegion"

export const SectorRegionManager = () => {
  const {
    filteredSectors,
    filteredRegions,
    regionsCountBySector,
    isLoading,
    activeSectorId,
    activeSector,
    setSelectedSectorId,
    sectorSearch,
    setSectorSearch,
    regionSearch,
    setRegionSearch,
    isSectorModalOpen,
    editingSector,
    openCreateSector,
    openEditSector,
    closeSectorModal,
    isRegionModalOpen,
    editingRegion,
    openCreateRegion,
    openEditRegion,
    closeRegionModal,
    handleDeleteSector,
    handleDeleteRegion,
  } = useSectorRegionManager()

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Cột trái: Quản lý Khu vực (Sector) */}
      <SectorListCard
        sectors={filteredSectors}
        activeSectorId={activeSectorId}
        regionsCountBySector={regionsCountBySector}
        searchValue={sectorSearch}
        onSearchChange={setSectorSearch}
        onSelectSector={setSelectedSectorId}
        onAddSector={openCreateSector}
        onEditSector={openEditSector}
        onDeleteSector={handleDeleteSector}
      />

      {/* Cột phải: Quản lý Vùng dự án (Region) */}
      <RegionTableCard
        regions={filteredRegions}
        activeSector={activeSector}
        isLoading={isLoading}
        searchValue={regionSearch}
        onSearchChange={setRegionSearch}
        onAddRegion={openCreateRegion}
        onEditRegion={openEditRegion}
        onDeleteRegion={handleDeleteRegion}
      />

      {/* Modals */}
      <SectorModal
        open={isSectorModalOpen}
        sector={editingSector}
        onCancel={closeSectorModal}
      />

      <RegionModal
        open={isRegionModalOpen}
        region={editingRegion}
        defaultSectorId={activeSectorId}
        onCancel={closeRegionModal}
      />
    </div>
  )
}

export default SectorRegionManager

"use client"

import PageContainer from "@/components/Common/PageContainer"
import SectorRegionManager from "@/components/Projects/SectorRegionManager"

export default function SectorRegionPage() {
  return (
    <PageContainer title="Quản lý Khu vực & Vùng">
      <div className="pt-2">
        <SectorRegionManager />
      </div>
    </PageContainer>
  )
}

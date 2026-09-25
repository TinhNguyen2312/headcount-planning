import React, { useState } from "react"
import { Tabs, Card } from "antd"
import { BookOpen, Layers, CheckCircle2 } from "lucide-react"
import { StandardsHeader } from "./components/StandardsHeader"
import { SpecDocumentGrid } from "./components/SpecDocumentGrid"
import { DesignTemplatesTab } from "./components/DesignTemplatesTab"
import { MaterialApprovalTab } from "./components/MaterialApprovalTab"
import {
  SPEC_STANDARDS_DATA,
  DESIGN_TEMPLATES_DATA,
  MATERIAL_APPROVALS_DATA,
} from "./data/standardsData"

export const StandardsFeature: React.FC = () => {
  const [searchText, setSearchText] = useState("")
  const [selectedDiscipline, setSelectedDiscipline] = useState("ALL")
  const [activeTab, setActiveTab] = useState("specs")

  // Filter SPEC standards
  const filteredSpecs = SPEC_STANDARDS_DATA.filter((spec) => {
    const matchesSearch =
      spec.specCode.toLowerCase().includes(searchText.toLowerCase()) ||
      spec.specTitle.toLowerCase().includes(searchText.toLowerCase()) ||
      spec.summary.toLowerCase().includes(searchText.toLowerCase())

    const matchesDiscipline =
      selectedDiscipline === "ALL" || spec.discipline === selectedDiscipline

    return matchesSearch && matchesDiscipline
  })

  // Filter Design templates
  const filteredTemplates = DESIGN_TEMPLATES_DATA.filter((template) => {
    const matchesSearch =
      template.templateCode.toLowerCase().includes(searchText.toLowerCase()) ||
      template.templateTitle.toLowerCase().includes(searchText.toLowerCase()) ||
      template.buildingType.toLowerCase().includes(searchText.toLowerCase())

    const matchesDiscipline =
      selectedDiscipline === "ALL" || template.discipline === selectedDiscipline

    return matchesSearch && matchesDiscipline
  })

  // Approved material count
  const approvedMaterialsCount = MATERIAL_APPROVALS_DATA.filter(
    (m) => m.approvalStatus === "APPROVED"
  ).length

  return (
    <div className="space-y-6">
      <StandardsHeader
        searchText={searchText}
        onSearchChange={setSearchText}
        selectedDiscipline={selectedDiscipline}
        onDisciplineChange={setSelectedDiscipline}
        totalSpecs={SPEC_STANDARDS_DATA.length}
        totalTemplates={DESIGN_TEMPLATES_DATA.length}
        approvedMaterials={approvedMaterialsCount}
        totalMaterials={MATERIAL_APPROVALS_DATA.length}
      />

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: "specs",
            label: (
              <span className="flex items-center gap-2">
                <BookOpen size={16} />
                9 Tiêu Chuẩn Kỹ Thuật (NVLG-DMD-SPEC01 → SPEC09)
              </span>
            ),
            children: <SpecDocumentGrid specs={filteredSpecs} />,
          },
          {
            key: "templates",
            label: (
              <span className="flex items-center gap-2">
                <Layers size={16} />
                Thư Viện Thiết Kế Điển Hình (NVLG-GMS.DMD-SOP03)
              </span>
            ),
            children: <DesignTemplatesTab templates={filteredTemplates} />,
          },
          {
            key: "materials",
            label: (
              <span className="flex items-center gap-2">
                <CheckCircle2 size={16} />
                Trình Duyệt Mẫu Vật Tư & Mockup Hiện Trường (SOP08)
              </span>
            ),
            children: <MaterialApprovalTab materials={MATERIAL_APPROVALS_DATA} />,
          },
        ]}
      />
    </div>
  )
}
export default StandardsFeature

import { Select } from "antd"
import type { ProjectFilterOption } from "@/hooks/useProjectSelector"

interface ProjectFilterSelectProps {
  projects: ProjectFilterOption[]
  value: number | undefined
  onChange: (projectId: number | undefined) => void
  allowAll?: boolean
  className?: string
}

export const ProjectFilterSelect = ({
  projects,
  value,
  onChange,
  allowAll = false,
  className,
}: ProjectFilterSelectProps) => {
  const options = [
    ...(allowAll ? [{ value: undefined, label: "Tất cả dự án" }] : []),
    ...projects.map((p) => ({ value: p.id, label: p.name })),
  ]

  return (
    <Select
      showSearch={{
        optionFilterProp: "label",
      }}
      className={className ?? "w-56"}
      placeholder="Dự án"
      value={value}
      onChange={onChange}
      options={options}
    />
  )
}

export default ProjectFilterSelect

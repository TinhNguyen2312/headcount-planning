import type { DefaultOptionType, SelectProps } from "antd/es/select"

import InfiniteSelect, {
  type InfiniteSelectProps,
} from "@/components/Common/InfiniteSelect"
import { projectQueries } from "@/hooks/server/projects"
import type { ProjectMemberQueryParams, ProjectMemberResponse } from "@/types"

export interface ProjectUserSelectProps
  extends Omit<
    InfiniteSelectProps<
      ProjectMemberResponse,
      number | number[],
      ProjectMemberQueryParams
    >,
    "useList" | "factoryQueries" | "onChange"
  > {
  projectId?: number
  zoneId?: number | null
  roleId?: number
  onChange?: (member?: ProjectMemberResponse) => void
}

export const ProjectUserSelect = ({
  projectId,
  zoneId,
  roleId,
  disabled,
  placeholder = "Tìm kiếm nhân sự...",
  allowClear = true,
  extraParams: passedExtraParams,
  onChange,
  ...selectProps
}: ProjectUserSelectProps) => {
  const handleChange: SelectProps<
    number | number[],
    DefaultOptionType
  >["onChange"] = (_val, opt) => {
    if (!onChange) return
    const selectedOpt = opt as
      | (DefaultOptionType & { data?: ProjectMemberResponse })
      | undefined
    onChange(Array.isArray(selectedOpt) ? undefined : selectedOpt?.data)
  }

  return (
    <InfiniteSelect<
      ProjectMemberResponse,
      number | number[],
      ProjectMemberQueryParams
    >
      disabled={disabled || !projectId}
      enabled={Boolean(projectId)}
      useList={(params, options) =>
        projectQueries.useMembers(projectId, params, options)
      }
      extraParams={{
        zoneId: zoneId ?? undefined,
        roleId: roleId ?? undefined,
        status: "ACTIVE",
        ...passedExtraParams,
      }}
      searchParamKey="keyword"
      fieldNames={{ value: "userId", label: "userFullName" }}
      placeholder={placeholder}
      allowClear={allowClear}
      transformItem={
        selectProps.transformItem ??
        ((item) => ({
          value: item.userId,
          label: item.userFullName,
          data: item,
        }))
      }
      onChange={handleChange}
      showSearch={{
        filterOption: (input, option) => {
          if (!input) return true
          const text = String(option?.label ?? "").toLowerCase()
          return text.includes(input.toLowerCase().trim())
        },
      }}
      {...selectProps}
    />
  )
}

export default ProjectUserSelect

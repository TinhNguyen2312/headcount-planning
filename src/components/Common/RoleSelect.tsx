import type { DefaultOptionType, SelectProps } from "antd/es/select"
import { useMemo } from "react"

import InfiniteSelect from "@/components/Common/InfiniteSelect"
import { getRolePermissionGroup } from "@/constants"
import { roleQueries } from "@/hooks/server/roles"
import type { ProjectRole, RoleResponse } from "@/types"

export type RoleSelectValueType = "id" | "object"

export type RoleSelectValue =
  | number
  | string
  | RoleResponse
  | (number | string | RoleResponse)[]
  | null
  | undefined

export type RoleOptionType = DefaultOptionType & RoleResponse

interface RoleSelectBaseProps {
  placeholder?: string
  className?: string
  disabled?: boolean
  allowClear?: boolean
  suffixIcon?: React.ReactNode
  departmentId?: number
  projectRole?: ProjectRole | ProjectRole[] | null
  projectRoles?: ProjectRole[] | null
  filterItem?: (role: RoleResponse) => boolean
  extraParams?: Record<string, unknown>
  options?: DefaultOptionType[]
}

export interface RoleSelectSingleIdProps extends RoleSelectBaseProps {
  mode?: never
  valueType?: "id"
  value?: number | string | RoleResponse | null
  onChange?: (value: number | undefined) => void
}

export interface RoleSelectSingleObjectProps extends RoleSelectBaseProps {
  mode?: never
  valueType: "object"
  value?: RoleResponse | number | string | null
  onChange?: (value: RoleResponse | null) => void
}

export interface RoleSelectMultipleIdProps extends RoleSelectBaseProps {
  mode: "multiple" | "tags"
  valueType?: "id"
  value?: (number | string | RoleResponse)[] | null
  onChange?: (value: number[]) => void
}

export interface RoleSelectMultipleObjectProps extends RoleSelectBaseProps {
  mode: "multiple" | "tags"
  valueType: "object"
  value?: RoleResponse[] | (number | string)[] | null
  onChange?: (value: RoleResponse[]) => void
}

export type RoleSelectProps =
  | RoleSelectSingleIdProps
  | RoleSelectSingleObjectProps
  | RoleSelectMultipleIdProps
  | RoleSelectMultipleObjectProps

export const RoleSelect = (props: RoleSelectProps) => {
  const {
    mode,
    valueType = "id",
    value,
    onChange,
    placeholder,
    className = "w-full",
    disabled,
    allowClear,
    suffixIcon,
    departmentId,
    projectRole,
    projectRoles,
    filterItem,
    extraParams,
    options,
  } = props

  const isMultiple = mode === "multiple" || mode === "tags"

  const allowedProjectRoles = useMemo(() => {
    const roles = projectRole ?? projectRoles
    if (!roles) return null
    return new Set(Array.isArray(roles) ? roles : [roles])
  }, [projectRole, projectRoles])

  const internalValue = useMemo<number | number[] | undefined>(() => {
    if (value == null) return isMultiple ? [] : undefined
    if (Array.isArray(value)) {
      return value.map((v) =>
        typeof v === "object" && v !== null ? v.id : Number(v),
      )
    }
    return typeof value === "object" && value !== null
      ? value.id
      : Number(value)
  }, [value, isMultiple])

  const defaultPlaceholder = isMultiple
    ? "Chọn 1 hoặc nhiều chức danh..."
    : allowClear
      ? "Tất cả chức danh"
      : "Chọn chức danh..."

  const combinedFilter = (role: RoleResponse) => {
    if (departmentId != null && role.departmentId !== departmentId) {
      return false
    }
    if (allowedProjectRoles) {
      const group = getRolePermissionGroup(role)
      if (!group || !allowedProjectRoles.has(group)) {
        return false
      }
    }
    if (filterItem && !filterItem(role)) {
      return false
    }
    return true
  }

  const handleChange: SelectProps<
    number | number[],
    DefaultOptionType
  >["onChange"] = (val, opt) => {
    if (!onChange) return

    if (isMultiple) {
      if (valueType === "object") {
        const handler = onChange as (v: RoleResponse[]) => void
        handler((opt as RoleResponse[] | undefined) ?? [])
      } else {
        const handler = onChange as (v: number[]) => void
        handler((val as number[] | undefined) ?? [])
      }
    } else {
      if (valueType === "object") {
        const handler = onChange as (v: RoleResponse | null) => void
        handler((opt as RoleResponse | undefined) ?? null)
      } else {
        const handler = onChange as (v: number | undefined) => void
        handler(val as number | undefined)
      }
    }
  }

  const defaultOptions = useMemo<DefaultOptionType[] | undefined>(() => {
    if (options) return options
    if (value && typeof value === "object") {
      const arr = Array.isArray(value) ? value : [value]
      return arr
        .filter(
          (v): v is RoleResponse =>
            typeof v === "object" && v !== null && "id" in v,
        )
        .map((r) => ({
          value: r.id,
          label: r.name,
          ...r,
        }))
    }
    return undefined
  }, [options, value])

  return (
    <InfiniteSelect<RoleResponse, number | number[]>
      mode={isMultiple ? mode : undefined}
      value={internalValue}
      onChange={handleChange}
      placeholder={placeholder ?? defaultPlaceholder}
      className={className}
      disabled={disabled}
      allowClear={allowClear}
      suffixIcon={suffixIcon}
      useList={roleQueries.useList}
      options={defaultOptions}
      extraParams={extraParams}
      filterItem={combinedFilter}
      fieldNames={{ label: "name", value: "id" }}
      transformItem={(role) => ({
        value: role.id,
        label: role.name,
        ...role,
      })}
    />
  )
}

export default RoleSelect

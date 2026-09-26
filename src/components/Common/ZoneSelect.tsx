import type { DefaultOptionType, SelectProps } from "antd/es/select"
import { type ReactNode, useMemo } from "react"

import InfiniteSelect from "@/components/Common/InfiniteSelect"
import { projectQueries, zoneQueries } from "@/hooks/server/projects"
import type { ProjectRole, ZoneResponse } from "@/types"

export type ZoneSelectValueType = "id" | "object"

export type ZoneSelectValue =
  | number
  | string
  | ZoneResponse
  | (number | string | ZoneResponse)[]
  | null
  | undefined

export type ZoneOptionType = DefaultOptionType & ZoneResponse

interface ZoneSelectBaseProps {
  projectId?: number
  placeholder?: string
  className?: string
  disabled?: boolean
  allowClear?: boolean
  suffixIcon?: ReactNode
  filterItem?: (zone: ZoneResponse) => boolean
  projectRole?: ProjectRole | null
  excludeUserId?: number
  options?: DefaultOptionType[]
}

export interface ZoneSelectSingleIdProps extends ZoneSelectBaseProps {
  mode?: never
  valueType?: "id"
  value?: number | string | ZoneResponse | null
  onChange?: (value: number | undefined) => void
}

export interface ZoneSelectSingleObjectProps extends ZoneSelectBaseProps {
  mode?: never
  valueType: "object"
  value?: ZoneResponse | number | string | null
  onChange?: (value: ZoneResponse | null) => void
}

export interface ZoneSelectMultipleObjectProps extends ZoneSelectBaseProps {
  mode: "multiple" | "tags"
  valueType?: "object"
  value?: ZoneResponse[] | (number | string)[] | null
  onChange?: (value: ZoneResponse[]) => void
}

export interface ZoneSelectMultipleIdProps extends ZoneSelectBaseProps {
  mode: "multiple" | "tags"
  valueType: "id"
  value?: (number | string | ZoneResponse)[] | null
  onChange?: (value: number[]) => void
}

export type ZoneSelectProps =
  | ZoneSelectSingleIdProps
  | ZoneSelectSingleObjectProps
  | ZoneSelectMultipleObjectProps
  | ZoneSelectMultipleIdProps

export const ZoneSelect = (props: ZoneSelectProps) => {
  const {
    projectId,
    mode,
    valueType,
    value,
    onChange,
    placeholder,
    className,
    disabled,
    allowClear,
    suffixIcon,
    filterItem,
    projectRole,
    excludeUserId,
    options,
  } = props

  const isMultiple = mode === "multiple" || mode === "tags"
  const isZoneAdmin = projectRole === "ZONE_ADMIN"
  const isEnabled = projectId !== undefined ? Boolean(projectId) : true

  const { data: zones = [] } = projectQueries.useZones(projectId, {
    enabled: isEnabled,
  }) ?? { data: [] }

  const { data: projectUsers = [] } = projectQueries.useUsers(
    projectId,
    { status: "ACTIVE" },
    { enabled: Boolean(projectId && isZoneAdmin) },
  ) ?? { data: [] }

  const takenZoneIds = useMemo(() => {
    if (!isZoneAdmin) return new Set<number>()
    return new Set(
      projectUsers
        .filter(
          (u) =>
            u.status === "ACTIVE" &&
            u.projectRole === "ZONE_ADMIN" &&
            u.zoneId != null &&
            (excludeUserId === undefined || u.userId !== excludeUserId),
        )
        .map((u) => u.zoneId as number),
    )
  }, [isZoneAdmin, projectUsers, excludeUserId])

  const internalValue = useMemo<number | number[] | undefined>(() => {
    if (value == null) return isMultiple ? [] : undefined
    if (Array.isArray(value)) {
      return value.map((item) =>
        typeof item === "object" && item !== null ? item.id : Number(item),
      )
    }
    return typeof value === "object" && value !== null
      ? value.id
      : Number(value)
  }, [value, isMultiple])

  const defaultPlaceholder = isMultiple
    ? "Chọn 1 hoặc nhiều phân khu..."
    : allowClear
      ? "Tất cả phân khu"
      : "Chọn phân khu..."

  const handleChange: SelectProps<
    number | number[],
    DefaultOptionType
  >["onChange"] = (val, opt) => {
    if (!onChange) return

    if (isMultiple) {
      if (valueType === "id") {
        const handler = onChange as (v: number[]) => void
        handler((val as number[] | undefined) ?? [])
      } else {
        const handler = onChange as (v: ZoneResponse[]) => void
        handler((opt as ZoneResponse[] | undefined) ?? [])
      }
    } else {
      if (valueType === "object") {
        const handler = onChange as (v: ZoneResponse | null) => void
        handler((opt as ZoneResponse | undefined) ?? null)
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
          (v): v is ZoneResponse =>
            typeof v === "object" && v !== null && "id" in v,
        )
        .map((z) => ({
          value: z.id,
          label: z.code ? `${z.name} (${z.code})` : z.name,
          ...z,
        }))
    }
    if (typeof value === "number") {
      const found = zones.find((z) => z.id === value)
      if (found) {
        return [
          {
            value: found.id,
            label: found.code ? `${found.name} (${found.code})` : found.name,
            ...found,
          },
        ]
      }
    }
    return undefined
  }, [options, value, zones])

  return (
    <InfiniteSelect<ZoneResponse, number | number[]>
      mode={isMultiple ? mode : undefined}
      value={internalValue}
      onChange={handleChange}
      placeholder={placeholder ?? defaultPlaceholder}
      className={className}
      disabled={disabled}
      allowClear={allowClear}
      suffixIcon={suffixIcon}
      useList={zoneQueries.useList as any}
      options={defaultOptions}
      extraParams={projectId ? { projectId } : undefined}
      enabled={isEnabled}
      filterItem={filterItem}
      fieldNames={{ label: "name", value: "id" }}
      transformItem={(zone) => ({
        value: zone.id,
        label: zone.name,
        disabled: isZoneAdmin && takenZoneIds.has(zone.id),
        ...zone,
      })}
      optionRender={
        isZoneAdmin
          ? (option) => {
              const zone = option.data as unknown as ZoneResponse
              const isTaken = zone?.id != null && takenZoneIds.has(zone.id)
              return (
                <div className="flex items-center justify-between gap-2">
                  <span>{option.label}</span>
                  {isTaken && (
                    <span className="text-xs text-muted-foreground shrink-0">
                      Đã có Trưởng phòng khác
                    </span>
                  )}
                </div>
              )
            }
          : undefined
      }
    />
  )
}

export default ZoneSelect

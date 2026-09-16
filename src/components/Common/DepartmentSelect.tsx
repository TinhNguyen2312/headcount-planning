import type { DefaultOptionType } from "antd/es/select"
import { useMemo } from "react"
import InfiniteSelect, {
  type InfiniteSelectProps,
} from "@/components/Common/InfiniteSelect"
import { departmentQueries } from "@/hooks/server/departments"
import type { DepartmentResponse } from "@/types"

type DepartmentSelectProps = Omit<
  InfiniteSelectProps<DepartmentResponse, number | number[]>,
  "useList" | "value" | "onChange"
> & {
  selectedId?: number
  setSelectedId?: (id?: number) => void
  value?: number | number[] | null
  onChange?: (val: any) => void
}

export function DepartmentSelect({
  selectedId,
  setSelectedId,
  value,
  onChange,
  placeholder = "Chọn phòng ban...",
  mode,
  transformItem,
  options,
  allowClear = true,
  ...rest
}: DepartmentSelectProps) {
  const isMultiple = mode === "multiple" || mode === "tags"
  const rawValue = value !== undefined ? value : selectedId

  const internalValue = useMemo<number | number[] | undefined>(() => {
    if (rawValue == null) return isMultiple ? [] : undefined
    return rawValue as number | number[]
  }, [rawValue, isMultiple])

  const singleIdToFetch =
    !isMultiple && typeof internalValue === "number" && !isNaN(internalValue)
      ? internalValue
      : undefined

  const { data: fetchedDept } = departmentQueries.useDetail(singleIdToFetch, {
    enabled: !!singleIdToFetch,
  })

  const defaultOptions = useMemo<DefaultOptionType[] | undefined>(() => {
    if (options) return options
    if (fetchedDept) {
      return [
        {
          value: fetchedDept.id,
          label: `${fetchedDept.code} — ${fetchedDept.name}`,
          id: fetchedDept.id,
          name: fetchedDept.name,
        },
      ]
    }
    return undefined
  }, [options, fetchedDept])

  const defaultTransform = (dept: DepartmentResponse): DefaultOptionType => ({
    value: dept.id,
    label: `${dept.code} — ${dept.name}`,
    id: dept.id,
    name: dept.name,
  })

  return (
    <InfiniteSelect<DepartmentResponse, number | number[]>
      placeholder={placeholder}
      mode={mode}
      value={internalValue}
      onChange={(val) => {
        onChange?.(val)
        if (!isMultiple) {
          setSelectedId?.(val != null ? Number(val) : undefined)
        }
      }}
      useList={departmentQueries.useList as never}
      options={defaultOptions}
      transformItem={transformItem ?? defaultTransform}
      allowClear={allowClear}
      {...rest}
    />
  )
}

export default DepartmentSelect

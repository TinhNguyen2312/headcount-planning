import { Select, type SelectProps, Spin } from "antd"
import type { DefaultOptionType } from "antd/es/select"
import { isValidElement, type ReactNode, useCallback, useMemo } from "react"

import type { ListQueryResult } from "@/hooks/server/base"
import { useLazyAccumulator } from "@/hooks/useLazyAccumulator"
import { useLazyPagination } from "@/hooks/useLazyPagination"
import type { IBaseQuery } from "@/types/common"

const PAGE_SIZE = 20

export interface InfiniteSelectProps<
  T extends object,
  ValueType = DefaultOptionType["value"],
  TQuery extends IBaseQuery = IBaseQuery,
> extends Omit<SelectProps<ValueType, DefaultOptionType>, "searchValue"> {
  useList: (params?: never, options?: never) => ListQueryResult<T>
  extraParams?: Partial<TQuery> | Record<string, unknown>
  enabled?: boolean
  searchParamKey?: string
  transformItem?: (item: T) => DefaultOptionType
  filterItem?: (item: T) => boolean
}

export function InfiniteSelect<
  T extends object,
  ValueType = DefaultOptionType["value"],
  TQuery extends IBaseQuery = IBaseQuery,
>({
  useList,
  extraParams,
  enabled = true,
  searchParamKey = "keyword",
  transformItem,
  filterItem,
  ...selectProps
}: InfiniteSelectProps<T, ValueType, TQuery>) {
  const { page, search, setSearch, debouncedSearch, handlePopupScroll } =
    useLazyPagination({ pageSize: PAGE_SIZE })

  const {
    items,
    meta,
    isFetching = false,
  } = useList(
    {
      page,
      limit: PAGE_SIZE,
      [searchParamKey]: debouncedSearch || undefined,
      ...extraParams,
    } as never,
    { enabled } as never,
  )
  const { allItems, hasMore } = useLazyAccumulator<T>(
    items,
    meta,
    page,
    enabled,
    PAGE_SIZE,
  )

  const options = useMemo(() => {
    const valKey = selectProps.fieldNames?.value ?? "id"
    const lblKey = selectProps.fieldNames?.label ?? "name"

    const items = filterItem ? allItems.filter(filterItem) : allItems

    const apiOptions: DefaultOptionType[] = items.map((item) => {
      if (transformItem) {
        const transformed = transformItem(item)
        return {
          id: transformed.value,
          name: transformed.label,
          ...transformed,
        }
      }
      const val = Reflect.get(item, valKey)
      const lbl = Reflect.get(item, lblKey)
      const { options: _, ...rest } = item as Record<string, unknown>
      const resolvedValue =
        typeof val === "string" || typeof val === "number" ? val : undefined
      const resolvedLabel =
        typeof lbl === "string" || isValidElement(lbl) ? lbl : String(val ?? "")
      return {
        ...rest,
        value: resolvedValue,
        label: resolvedLabel,
        id: resolvedValue,
        name: resolvedLabel,
      }
    })

    if (!selectProps.options || selectProps.options.length === 0) {
      return apiOptions
    }

    const existingKeys = new Set(
      selectProps.options.map((opt) => opt.value ?? opt.key),
    )
    const uniqueApiOptions = apiOptions.filter(
      (opt) => !existingKeys.has(opt.value ?? opt.key),
    )

    return [...selectProps.options, ...uniqueApiOptions]
  }, [
    allItems,
    selectProps.options,
    selectProps.fieldNames?.value,
    selectProps.fieldNames?.label,
    filterItem,
    transformItem,
  ])

  const popupRender = selectProps.popupRender
  const renderPopup = useCallback(
    (menu: ReactNode) => {
      const content = (
        <>
          {menu}
          {isFetching && (
            <div className="flex justify-center py-2">
              <Spin size="small" />
            </div>
          )}
          {!hasMore && options.length > 0 && (
            <div className="py-1 text-center text-[11px] text-muted-foreground">
              Đã tải hết {options.length} kết quả
            </div>
          )}
        </>
      )
      return popupRender ? popupRender(content) : content
    },
    [isFetching, hasMore, options.length, popupRender],
  )

  return (
    <Select<ValueType, DefaultOptionType>
      placeholder="Vui lòng chọn..."
      className="w-full"
      showSearch={{
        filterOption: false,
        searchValue: search,
        onSearch: (val) => {
          setSearch(val)
          selectProps?.onSearch?.(val)
        },
      }}
      virtual={selectProps.virtual ?? false}
      fieldNames={{ value: "id", label: "name", ...selectProps.fieldNames }}
      {...selectProps}
      onOpenChange={(open) => {
        if (!open && search) setSearch("")
        selectProps.onOpenChange?.(open)
      }}
      onSelect={(val, option) => {
        if (
          !Array.isArray(selectProps.value) &&
          selectProps.mode !== "multiple" &&
          selectProps.mode !== "tags" &&
          search
        ) {
          setSearch("")
        }
        selectProps.onSelect?.(val, option)
      }}
      onPopupScroll={(e) => {
        handlePopupScroll(isFetching, hasMore)(e)
        selectProps.onPopupScroll?.(e)
      }}
      popupRender={renderPopup}
      notFoundContent={
        isFetching ? (
          <Spin size="small" />
        ) : (
          (selectProps.notFoundContent ?? "Không tìm thấy dữ liệu")
        )
      }
      options={options}
    />
  )
}

export default InfiniteSelect

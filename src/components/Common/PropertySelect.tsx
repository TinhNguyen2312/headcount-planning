import { propertyQueries } from "@/hooks/server/properties"
import InfiniteSelect, { type InfiniteSelectProps } from "./InfiniteSelect"

type PropertySelectProps = Omit<
  InfiniteSelectProps<object>,
  "useList" | "value" | "onChange"
> & {
  selectedId?: number
  setSelectedId?: (id?: number) => void
  // support Form.Item controlled mode
  value?: number
  onChange?: (val?: number) => void
}

function PropertySelect({
  selectedId,
  setSelectedId,
  value,
  onChange,
  placeholder = "Lọc cơ sở định biên",
  ...rest
}: PropertySelectProps) {
  const resolvedId = value !== undefined ? value : selectedId
  const { data: selectedProperty } = propertyQueries.useDetail(resolvedId, {
    enabled: !!resolvedId,
  })

  const initialOption = selectedProperty
    ? [
        {
          value: selectedProperty.id,
          label: selectedProperty.name,
          id: selectedProperty.id,
          name: selectedProperty.name,
        },
      ]
    : []

  return (
    <InfiniteSelect
      placeholder={placeholder}
      value={resolvedId}
      onChange={(val) => {
        const id = val != null ? Number(val) : undefined
        onChange?.(id)
        setSelectedId?.(id)
      }}
      useList={propertyQueries.useList}
      options={initialOption}
      {...rest}
    />
  )
}

export default PropertySelect

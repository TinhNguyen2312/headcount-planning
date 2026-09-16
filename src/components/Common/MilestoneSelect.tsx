import { milestoneQueries } from "@/hooks/server/milestones"
import InfiniteSelect, { type InfiniteSelectProps } from "./InfiniteSelect"

type MilestoneSelectProps = Omit<
  InfiniteSelectProps<object>,
  "useList" | "value" | "onChange"
> & {
  selectedId?: string | number | null
  setSelectedId?: (id?: string | number | null) => void
  // support Form.Item controlled mode
  value?: string | number | null
  onChange?: (val?: string | number | null) => void
}

function MilestoneSelect({
  selectedId,
  setSelectedId,
  value,
  onChange,
  placeholder = "Lọc theo mốc tiến độ",
  allowClear = true,
  ...rest
}: MilestoneSelectProps) {
  const resolvedId = value !== undefined ? value : selectedId
  const numericId = resolvedId ? Number(resolvedId) : undefined

  const { data: selectedMilestone } = milestoneQueries.useDetail(numericId, {
    enabled: !!numericId,
  })

  const initialOption = selectedMilestone
    ? [
        {
          value: selectedMilestone.id,
          label: selectedMilestone.name,
          id: selectedMilestone.id,
          name: selectedMilestone.name,
        },
      ]
    : []

  return (
    <InfiniteSelect
      placeholder={placeholder}
      value={resolvedId ?? undefined}
      onChange={(val) => {
        onChange?.(val as string | number | null)
        setSelectedId?.(val as string | number | null)
      }}
      useList={milestoneQueries.useList}
      options={initialOption}
      allowClear={allowClear}
      {...rest}
    />
  )
}

export default MilestoneSelect

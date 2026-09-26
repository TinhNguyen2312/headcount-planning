import { useState } from "react"

export default function useFilterParams<T>(
  initial: T,
): [T, (v: Partial<T>) => void] {
  const [filter, setFilter] = useState<T>(initial)
  const updateFilter = (v: Partial<T>) => setFilter((p) => ({ ...p, ...v }))

  return [filter, updateFilter]
}

import { SortOption } from "@/types"

export const DEFAULT_SORT_OPTIONS: SortOption[] = [
  { label: "Mới nhất", sortBy: "createdAt", order: "DESC" },
  { label: "Cũ nhất", sortBy: "createdAt", order: "ASC" },
  { label: "Tên (A-Z)", sortBy: "name", order: "ASC" },
  { label: "Tên (Z-A)", sortBy: "name", order: "DESC" },
]

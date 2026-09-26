import { BusinessMatrixResponse } from "@/types"

export const formatTree = (
  items: BusinessMatrixResponse[],
  prefix = "",
): BusinessMatrixResponse[] => {
  return items.map((item, index) => {
    const currentStt = prefix ? `${prefix}.${index + 1}` : `${index + 1}`
    return {
      ...item,
      stt: currentStt,
      children: item.children ? formatTree(item.children, currentStt) : [],
    }
  })
}

import { Pagination as AntdPagination, Flex, Typography } from "antd"

export interface PaginationProps {
  currentPage: number
  filteredCount: number
  pageSize: number
  onPageChange: (page: number) => void
  itemLabel: string
  containerClassName?: string
}

export const Pagination = ({
  currentPage,
  filteredCount,
  pageSize,
  onPageChange,
  itemLabel,
  containerClassName = "pt-4 mt-4 w-full border-t border-border flex flex-col items-center gap-3",
}: PaginationProps) => {
  const hasData = filteredCount > 0
  const startItem = hasData ? (currentPage - 1) * pageSize + 1 : 0
  const endItem = hasData ? Math.min(currentPage * pageSize, filteredCount) : 0

  return (
    <Flex align="center" vertical className={containerClassName}>
      <Typography.Text className="text-base text-muted-foreground">
        Hiển thị {startItem}-{endItem} trong tổng số {filteredCount} {itemLabel}
      </Typography.Text>

      <AntdPagination
        current={currentPage}
        total={filteredCount}
        pageSize={pageSize}
        onChange={onPageChange}
        showSizeChanger={false}
      />
    </Flex>
  )
}

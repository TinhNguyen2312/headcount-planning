import { Input } from "antd"
import { ClipboardCheck, Search } from "lucide-react"
import { useState } from "react"
import ChecklistModal from "@/components/Checklists/ChecklistModal"
import ChecklistTable from "@/components/Checklists/ChecklistTable"
import ImportChecklistModal from "@/components/Checklists/Import/ImportChecklistModal"
import { TaskTreeSelect } from "@/components/Common"
import PageContainer from "@/components/Common/PageContainer"
import { checklistQueries } from "@/hooks/server/checklists"
import { useListPageState } from "@/hooks/useListPageState"

interface ChecklistsPageProps {
  embedded?: boolean
}

export default function ChecklistsPage({
  embedded = false,
}: ChecklistsPageProps = {}) {
  const [taskItemId, setTaskItemId] = useState<number | null>(null)

  const {
    keyword,
    setKeyword,
    debouncedKeyword,
    page,
    setPage,
    limit,
    setLimit,
    queryParams,
  } = useListPageState({
    persistKey: "checklists",
    initialLimit: 20,
    initialSort: { sort: { sortBy: "createdAt", order: "DESC" } },
    resetPageOn: taskItemId,
  })

  const {
    data: checklists = [],
    meta,
    isLoading,
    isFetching,
  } = checklistQueries.useList(
    {
      ...queryParams,
      keyword: debouncedKeyword.trim() || undefined,
      taskItemId: taskItemId ?? undefined,
    },
    {
      placeholderData: (previousData) => previousData,
    },
  )

  const content = (
    <div className="flex flex-col gap-4 pt-2">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <Input
            placeholder="Tìm kiếm theo mã hoặc tên biểu mẫu..."
            allowClear
            prefix={<Search className="size-4 text-muted-foreground" />}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="sm:w-80"
          />
          <TaskTreeSelect
            placeholder="Lọc theo nghiệp vụ..."
            value={taskItemId}
            onChange={(val) => setTaskItemId(val)}
            className="w-64!"
            allowClear
          />
        </div>
        {embedded && (
          <div className="flex items-center gap-2">
            <ImportChecklistModal />
            <ChecklistModal />
          </div>
        )}
      </div>

      <ChecklistTable
        checklists={checklists}
        loading={isLoading || isFetching}
        pagination={{
          current: page,
          pageSize: limit,
          total: meta?.totalElements ?? 0,
          onChange: (newPage, newPageSize) => {
            setPage(newPage)
            setLimit(newPageSize)
          },
        }}
      />
    </div>
  )

  if (embedded) {
    return content
  }

  return (
    <PageContainer
      title={
        <div className="flex items-center gap-2">
          <ClipboardCheck className="size-7 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">
            Quản lý Checklist
          </h1>
        </div>
      }
      rightSlot={
        <div className="flex items-center gap-2">
          <ImportChecklistModal />
          <ChecklistModal />
        </div>
      }
    >
      {content}
    </PageContainer>
  )
}

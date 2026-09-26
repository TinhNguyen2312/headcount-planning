import { Empty, Form, Table } from "antd"
import {
  ChevronDown,
  ChevronRight,
  Folder,
  FolderOpen,
  Plus,
} from "lucide-react"
import { createBusinessMatrixColumns } from "@/components/BusinessMatrix/businessMatrixColumns"
import PageContainer from "@/components/Common/PageContainer"
import ProtectedButton from "@/components/Common/ProtectedButton"
import { taskItemQueries } from "@/hooks/server/taskItems"
import { useBusinessMatrixEditor } from "@/hooks/useBusinessMatrixEditor"
import { useProjectAuth } from "@/hooks/useProjectAuth"
import { formatTree } from "@/lib/task-item"
import type { BusinessMatrixResponse } from "@/types"

interface BusinessMatrixPageProps {
  embedded?: boolean
}

export default function BusinessMatrixPage({
  embedded = false,
}: BusinessMatrixPageProps = {}) {
  const { isSuperUser } = useProjectAuth()
  const { data: matrixList = [] } = taskItemQueries.useSuspenseBusinessMatrix({
    select: (res) => formatTree(res.result),
  })
  const {
    form,
    editingId,
    isSaving,
    isAddingRoot,
    handleEdit,
    handleCancel,
    handleSave,
    handleAddRoot,
    handleAddChild,
    handleAddSibling,
    handleDelete,
  } = useBusinessMatrixEditor(matrixList)

  const columns = createBusinessMatrixColumns({
    form,
    editingId,
    isSaving,
    isSuperUser,
    onStartEdit: handleEdit,
    onSave: handleSave,
    onCancel: handleCancel,
    onAddChild: handleAddChild,
    onAddSibling: handleAddSibling,
    onDelete: handleDelete,
  })

  const content =
    matrixList.length === 0 ? (
      <Empty description="Chưa có bộ công việc nào được thiết lập." />
    ) : (
      <div className="flex flex-col gap-3">
        <Form form={form} component={false}>
          <Table<BusinessMatrixResponse>
            dataSource={matrixList}
            columns={columns}
            rowKey="id"
            pagination={false}
            size="small"
            expandable={{
              defaultExpandAllRows: true,
              expandIcon: ({ expanded, onExpand, record, expandable }) => {
                if (record.parentTaskId || !expandable) {
                  return null
                }
                return (
                  <button
                    type="button"
                    aria-label={expanded ? "Thu gọn" : "Mở rộng"}
                    onClick={(e) => onExpand(record, e)}
                    className="inline-flex items-center gap-1 p-0.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer mr-1"
                  >
                    {expanded ? (
                      <>
                        <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
                        <FolderOpen className="size-4 shrink-0 text-primary" />
                      </>
                    ) : (
                      <>
                        <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                        <Folder className="size-4 shrink-0 text-muted-foreground" />
                      </>
                    )}
                  </button>
                )
              },
            }}
            rowClassName={(record) =>
              !record.parentTaskId ? "bg-muted/50 font-bold" : ""
            }
          />
        </Form>
        <ProtectedButton
          projectRoles={[]}
          className="self-start"
          disabled={isAddingRoot}
          onClick={handleAddRoot}
          icon={<Plus className="size-4" />}
        >
          Thêm nhóm nghiệp vụ
        </ProtectedButton>
      </div>
    )

  if (embedded) {
    return content
  }

  return (
    <PageContainer title="Ma trận nghiệp vụ">
      {content}
    </PageContainer>
  )
}

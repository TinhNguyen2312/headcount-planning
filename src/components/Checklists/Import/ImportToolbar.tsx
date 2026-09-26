import { Button, Tag, Upload } from "antd"
import { TaskTreeSelect } from "@/components/Common/TaskTreeSelect"

interface ImportToolbarProps {
  fileName: string
  isParsing?: boolean
  onFileUpload: (file: File) => Promise<boolean>
  onApplyTaskItemToAll: (taskItemId: number | null) => void
}

export function ImportToolbar({
  fileName,
  isParsing = false,
  onFileUpload,
  onApplyTaskItemToAll,
}: ImportToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
      <div className="flex items-center gap-2">
        <p className="text-base text-muted-foreground">Tệp:</p>
        <Tag color="cyan" className="font-mono text-base">
          {fileName}
        </Tag>
        <Upload
          accept=".xlsx,.xls"
          showUploadList={false}
          beforeUpload={onFileUpload}
          disabled={isParsing}
        >
          <Button size="small" type="link" loading={isParsing}>
            Chọn file khác
          </Button>
        </Upload>
      </div>

      <div className="flex items-center gap-2">
        <p className="text-base text-muted-foreground">
          Chọn nghiệp vụ cho tất cả:
        </p>
        <TaskTreeSelect
          placeholder="Chọn nghiệp vụ chung..."
          onChange={(val) => onApplyTaskItemToAll(val)}
          className="w-100"
          maxHeight={300}
        />
      </div>
    </div>
  )
}

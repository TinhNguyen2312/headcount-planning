import { Upload } from "antd"
import { UploadCloud } from "lucide-react"

interface ImportUploadStepProps {
  isParsing: boolean
  onFileUpload: (file: File) => Promise<boolean>
}

export function ImportUploadStep({
  isParsing,
  onFileUpload,
}: ImportUploadStepProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12">
      <Upload.Dragger
        accept=".xlsx,.xls"
        multiple={false}
        showUploadList={false}
        beforeUpload={onFileUpload}
        disabled={isParsing}
        className="w-full max-w-xl p-6"
      >
        <div className="flex flex-col items-center gap-2">
          <UploadCloud className="size-12 text-primary/70" />
          <p className="text-sm font-medium">
            Kéo thả file Excel checklist (.xlsx) vào đây, hoặc click để chọn
          </p>
        </div>
      </Upload.Dragger>
    </div>
  )
}

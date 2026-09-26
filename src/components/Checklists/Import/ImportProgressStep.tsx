import { Progress } from "antd"
import { RefreshCw } from "lucide-react"
import type { ImportExecutionProgress } from "./useExecuteChecklistImport"

interface ImportProgressStepProps {
  progress: ImportExecutionProgress
}

export function ImportProgressStep({ progress }: ImportProgressStepProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12">
      <RefreshCw className="size-10 animate-spin text-primary" />
      <div className="text-center">
        <h3 className="text-base font-medium">Đang import dữ liệu...</h3>
        <p className="text-base text-muted-foreground mt-1">
          {progress.currentSheet}
        </p>
      </div>
      <div className="w-96 max-w-full">
        <Progress percent={progress.percent} status="active" />
      </div>
    </div>
  )
}

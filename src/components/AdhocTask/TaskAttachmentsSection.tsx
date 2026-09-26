import { Upload as AntUpload, Button, Col, Form, Row } from "antd"
import { FileText, Paperclip, Trash2 } from "lucide-react"
import type { TaskAttachment } from "./useTaskAttachments"

interface TaskAttachmentsSectionProps {
  attachedFiles: TaskAttachment[]
  isUploading: boolean
  disabled?: boolean
  onUploadFile: (file: File) => void
  onRemoveFile: (uid: string) => void
}

export const TaskAttachmentsSection = ({
  attachedFiles,
  isUploading,
  disabled = false,
  onUploadFile,
  onRemoveFile,
}: TaskAttachmentsSectionProps) => {
  return (
    <div className="border-t border-border pt-4">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
        3. Tài liệu & Tệp đính kèm
      </h2>
      <Row gutter={16}>
        <Col xs={24}>
          <Form.Item
            label={
              <div className="flex items-center gap-1.5 font-medium">
                <Paperclip className="size-4 text-primary" />
                <span>
                  Tài liệu & Tệp đính kèm khi giao việc (Bản vẽ, ảnh hiện
                  trạng...)
                </span>
              </div>
            }
          >
            <div className="flex flex-col gap-3">
              <AntUpload
                multiple
                showUploadList={false}
                customRequest={({ file }) => onUploadFile(file as File)}
                disabled={isUploading || disabled}
              >
                <Button
                  icon={<Paperclip className="size-4" />}
                  loading={isUploading}
                  disabled={disabled}
                >
                  Đính kèm tệp / hình ảnh
                </Button>
              </AntUpload>

              {attachedFiles.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {attachedFiles.map((file) => (
                    <div
                      key={file.uid}
                      className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-1.5 text-sm"
                    >
                      <FileText className="size-4 text-primary shrink-0" />
                      <span className="max-w-240px truncate font-medium text-foreground">
                        {file.name}
                      </span>
                      {file.size && (
                        <span className="text-xs text-muted-foreground">
                          ({(file.size / 1024).toFixed(0)} KB)
                        </span>
                      )}
                      <Button
                        type="text"
                        size="small"
                        className="size-6 p-0 text-destructive hover:bg-destructive/10"
                        icon={<Trash2 className="size-3.5" />}
                        onClick={() => onRemoveFile(file.uid)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Form.Item>
        </Col>
      </Row>
    </div>
  )
}

export default TaskAttachmentsSection

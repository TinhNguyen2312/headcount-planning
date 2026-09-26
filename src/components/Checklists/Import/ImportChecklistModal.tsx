import { Button, Modal, Tag, Upload } from "antd"
import { FileSpreadsheet } from "lucide-react"
import { useState } from "react"
import ProtectedButton from "@/components/Common/ProtectedButton"
import { useUI } from "@/hooks/useUI"
import { parseChecklistExcel } from "@/lib/excel"
import { ImportItemsTable } from "./ImportItemsTable"
import { ImportProgressStep } from "./ImportProgressStep"
import { ImportSheetSidebar } from "./ImportSheetSidebar"
import { ImportTemplateForm } from "./ImportTemplateForm"
import { ImportToolbar } from "./ImportToolbar"
import { useChecklistImportState } from "./useChecklistImportState"
import { useExecuteChecklistImport } from "./useExecuteChecklistImport"

export default function ImportChecklistModal() {
  const [open, setOpen] = useState(false)
  const [isParsing, setIsParsing] = useState(false)

  const { message } = useUI()

  const {
    fileName,
    templates,
    activeSheetIndex,
    activeTemplate,
    validationStatus,
    setActiveSheetIndex,
    loadParsedTemplates,
    resetState: resetImportState,
    updateActiveTemplate,
    applyTaskItemToAll,
    updateItem,
    deleteItem,
    addItem,
  } = useChecklistImportState()

  const { isImporting, importProgress, executeImport, resetProgress } =
    useExecuteChecklistImport()

  const handleClose = () => {
    setOpen(false)
    setIsParsing(false)
    resetImportState()
    resetProgress()
  }

  // Parse uploaded Excel file and immediately open the preview modal on success
  const handleFileUpload = async (file: File) => {
    setIsParsing(true)
    try {
      const parsed = await parseChecklistExcel(file)
      if (parsed.length === 0) {
        message.error("Không tìm thấy sheet biểu mẫu hợp lệ nào trong file.")
        return false
      }
      loadParsedTemplates(file.name, parsed)
      setOpen(true)
      message.success(`Đã đọc thành công ${parsed.length} biểu mẫu từ file!`)
    } catch {
      message.error("Không thể đọc file Excel. Vui lòng kiểm tra định dạng.")
    } finally {
      setIsParsing(false)
    }
    return false
  }

  const handleConfirmImport = () => {
    if (!validationStatus.isAllValid) {
      message.error(
        `Vui lòng bổ sung thông tin cho tất cả biểu mẫu (${validationStatus.errors[0]})`,
      )
      return
    }

    executeImport(templates, handleClose)
  }

  return (
    <>
      <Upload
        accept=".xlsx,.xls"
        showUploadList={false}
        beforeUpload={handleFileUpload}
        disabled={isParsing}
      >
        <ProtectedButton
          size="small"
          className="h-9"
          loading={isParsing}
          icon={
            <FileSpreadsheet className="size-4 text-emerald-600 dark:text-emerald-400" />
          }
        >
          Import Excel
        </ProtectedButton>
      </Upload>

      <Modal
        centered
        open={open}
        width={1600}
        onCancel={isImporting ? undefined : handleClose}
        title={
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="size-5 text-primary" />
            <span className="text-base font-semibold">Import Checklist</span>
            {templates.length > 0 && (
              <Tag color="blue" className="ml-2">
                Tìm thấy {templates.length} checklist
              </Tag>
            )}
          </div>
        }
        footer={
          templates.length === 0 ? null : (
            <div className="flex items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2 text-base text-muted-foreground">
                <span>
                  Đã cấu hình {validationStatus.validCount}/{templates.length}{" "}
                  checklist
                </span>
                {!validationStatus.isAllValid && (
                  <Tag color="warning" className="ml-1">
                    Cần chọn nghiệp vụ cho tất cả checklist
                  </Tag>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={handleClose} disabled={isImporting}>
                  Hủy
                </Button>
                <Button
                  type="primary"
                  loading={isImporting}
                  disabled={!validationStatus.isAllValid}
                  onClick={handleConfirmImport}
                >
                  Xác nhận Import ({templates.length} checklist)
                </Button>
              </div>
            </div>
          )
        }
      >
        {isImporting ? (
          <ImportProgressStep progress={importProgress} />
        ) : (
          <div className="flex flex-col gap-4 py-2">
            <ImportToolbar
              fileName={fileName}
              isParsing={isParsing}
              onFileUpload={handleFileUpload}
              onApplyTaskItemToAll={applyTaskItemToAll}
            />

            <div className="grid grid-cols-12 gap-4">
              <ImportSheetSidebar
                templates={templates}
                activeSheetIndex={activeSheetIndex}
                onSelectSheet={setActiveSheetIndex}
              />

              <div className="col-span-10 flex flex-col gap-4">
                {activeTemplate && (
                  <>
                    <ImportTemplateForm
                      template={activeTemplate}
                      onUpdateTemplate={updateActiveTemplate}
                    />

                    <ImportItemsTable
                      items={activeTemplate.items}
                      onUpdateItem={updateItem}
                      onDeleteItem={deleteItem}
                      onAddItem={addItem}
                    />
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}

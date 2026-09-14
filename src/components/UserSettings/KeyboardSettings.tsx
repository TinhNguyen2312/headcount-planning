import { Button, Empty, Modal, message, Table, Tag, Tooltip } from "antd"
import { Keyboard, RotateCcw } from "lucide-react"
import { useMemo, useState, useSyncExternalStore } from "react"
import {
  type CommandEntry,
  formatShortcutKeys,
  getActiveCommands,
  resetKeybindingOverride,
  setKeybindingOverride,
  subscribeCommands,
} from "@/keyboard"

const KeyboardSettings = () => {
  const [editingCommand, setEditingCommand] = useState<CommandEntry | null>(
    null,
  )
  const [recordedKeys, setRecordedKeys] = useState<string>("")

  const commands = useSyncExternalStore(
    subscribeCommands,
    getActiveCommands,
    getActiveCommands,
  )

  const categorizedCommands = useMemo(() => {
    return [...commands].sort((a, b) => {
      const catA = a.category || "Chung"
      const catB = b.category || "Chung"
      if (catA !== catB) return catA.localeCompare(catB)
      return a.label.localeCompare(b.label)
    })
  }, [commands])

  const handleOpenEdit = (command: CommandEntry) => {
    setEditingCommand(command)
    setRecordedKeys(command.keys[0] || "")
  }

  const handleSaveCustomKey = () => {
    if (!editingCommand) return
    if (!recordedKeys.trim()) {
      message.warning("Vui lòng nhập hoặc ghi nhận tổ hợp phím")
      return
    }
    setKeybindingOverride(editingCommand.storageId, recordedKeys.trim())
    message.success(`Đã cập nhật phím tắt cho: ${editingCommand.label}`)
    setEditingCommand(null)
  }

  const handleReset = (storageId: string, label: string) => {
    resetKeybindingOverride(storageId)
    message.info(`Đã đặt lại phím tắt mặc định cho: ${label}`)
  }

  const columns = [
    {
      title: "Chức năng",
      dataIndex: "label",
      key: "label",
      render: (label: string, record: CommandEntry) => (
        <div className="flex flex-col">
          <span className="font-medium text-foreground">{label}</span>
          <span className="text-base text-muted-foreground">
            {record.storageId}
          </span>
        </div>
      ),
    },
    {
      title: "Nhóm",
      dataIndex: "category",
      key: "category",
      width: 140,
      render: (category?: string) => (
        <Tag className="border-0 bg-muted text-muted-foreground text-base">
          {category || "Chung"}
        </Tag>
      ),
    },
    {
      title: "Phím tắt",
      dataIndex: "keys",
      key: "keys",
      width: 200,
      render: (keys: string[]) => (
        <div className="flex flex-wrap gap-1">
          {keys && keys.length > 0 ? (
            keys.map((k) => (
              <kbd
                key={k}
                className="rounded border border-border bg-muted/60 px-2 py-0.5 text-base font-semibold text-foreground shadow-2xs"
              >
                {formatShortcutKeys(k)}
              </kbd>
            ))
          ) : (
            <span className="text-base text-muted-foreground italic">
              Chưa gán
            </span>
          )}
        </div>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 130,
      render: (_: unknown, record: CommandEntry) => (
        <div className="flex items-center gap-2">
          <Button
            size="small"
            type="link"
            className="p-0 text-base"
            onClick={() => handleOpenEdit(record)}
          >
            Đổi phím
          </Button>
          <Tooltip title="Đặt lại phím mặc định">
            <Button
              size="small"
              type="text"
              icon={<RotateCcw className="size-3 text-muted-foreground" />}
              onClick={() => handleReset(record.storageId, record.label)}
            />
          </Tooltip>
        </div>
      ),
    },
  ]

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between py-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Keyboard className="size-5 text-primary" />
            Phím tắt hệ thống
          </h3>
          <p className="text-base text-muted-foreground mt-1">
            Danh sách các phím tắt điều hướng nhanh và thao tác nghiệp vụ. Nhấn{" "}
            <kbd className="px-1 py-0.5 text-[11px] rounded bg-muted border border-border font-semibold">
              Ctrl K
            </kbd>{" "}
            hoặc{" "}
            <kbd className="px-1 py-0.5 text-[11px] rounded bg-muted border border-border font-semibold">
              Ctrl Shift P
            </kbd>{" "}
            để mở bảng tìm kiếm lệnh ở bất kỳ đâu.
          </p>
        </div>
      </div>

      {categorizedCommands.length === 0 ? (
        <Empty
          description="Chưa có phím tắt nào được kích hoạt"
          className="py-12"
        />
      ) : (
        <div className="rounded-lg border border-border overflow-hidden bg-background">
          <Table
            dataSource={categorizedCommands}
            columns={columns}
            rowKey="storageId"
            pagination={false}
            size="small"
            className="[&_.ant-table-thead_th]:bg-muted/40 [&_.ant-table-thead_th]:text-base [&_.ant-table-thead_th]:font-semibold"
          />
        </div>
      )}

      <Modal
        title={`Đổi phím tắt: ${editingCommand?.label}`}
        open={!!editingCommand}
        onCancel={() => setEditingCommand(null)}
        onOk={handleSaveCustomKey}
        okText="Lưu phím tắt"
        cancelText="Hủy"
        destroyOnHidden
      >
        <div className="py-4 space-y-4">
          <p className="text-sm text-muted-foreground">
            Nhấn tổ hợp phím bạn muốn gán hoặc nhập định dạng (Ví dụ:{" "}
            <code className="text-primary font-mono text-base">mod+alt+t</code>,{" "}
            <code className="text-primary font-mono text-base">
              mod+shift+f
            </code>
            ):
          </p>

          <div
            onKeyDown={(e) => {
              e.preventDefault()
              const parts: string[] = []
              if (e.ctrlKey || e.metaKey) parts.push("mod")
              if (e.altKey) parts.push("alt")
              if (e.shiftKey) parts.push("shift")
              if (!["Control", "Meta", "Alt", "Shift"].includes(e.key)) {
                parts.push(e.key.toLowerCase())
              }
              if (parts.length > 0) {
                setRecordedKeys(parts.join("+"))
              }
            }}
            className="flex items-center justify-center p-6 rounded-lg border-2 border-dashed border-primary/40 bg-primary/5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {recordedKeys ? (
              <kbd className="rounded-md border border-primary/40 bg-background px-3 py-1.5 text-base font-bold text-primary shadow-xs">
                {formatShortcutKeys(recordedKeys)}
              </kbd>
            ) : (
              <span className="text-sm text-muted-foreground">
                Nhấn tổ hợp phím trên bàn phím của bạn...
              </span>
            )}
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default KeyboardSettings

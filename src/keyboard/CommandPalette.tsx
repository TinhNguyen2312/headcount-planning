import { Empty, Input, Modal, Tag } from "antd"
import { Search } from "lucide-react"
import {
  type KeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react"
import { OPEN_COMMAND_PALETTE_EVENT } from "."
import { formatShortcutKeys } from "./combo"
import {
  type CommandEntry,
  getActiveCommands,
  subscribeCommands,
} from "./commandRegistry"
import { useShortcuts } from "./useShortcuts"

export interface CommandPaletteProps {
  openKeys?: string | string[]
}

const CommandPalette = ({
  openKeys = ["mod+k", "mod+shift+p"],
}: CommandPaletteProps) => {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [activeIndex, setActiveIndex] = useState(0)
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])

  const commands = useSyncExternalStore(
    subscribeCommands,
    getActiveCommands,
    getActiveCommands,
  )

  const handleToggle = useCallback(() => {
    setOpen((prev) => !prev)
  }, [])

  useShortcuts({
    toggle: { keys: openKeys, handler: handleToggle },
  })

  useEffect(() => {
    const handleOpenEvent = () => setOpen(true)
    window.addEventListener(OPEN_COMMAND_PALETTE_EVENT, handleOpenEvent)
    return () => {
      window.removeEventListener(OPEN_COMMAND_PALETTE_EVENT, handleOpenEvent)
    }
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return commands
    return commands.filter(
      (c) =>
        c.label.toLowerCase().includes(q) ||
        c.category?.toLowerCase().includes(q),
    )
  }, [commands, query])

  useEffect(() => {
    itemRefs.current[activeIndex]?.scrollIntoView({ block: "nearest" })
  }, [activeIndex])

  const runCommand = (command: CommandEntry): void => {
    setOpen(false)
    command.handler()
  }

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>): void => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === "Enter") {
      e.preventDefault()
      const command = filtered[activeIndex]
      if (command) runCommand(command)
    } else if (e.key === "Escape") {
      setOpen(false)
    }
  }

  return (
    <Modal
      open={open}
      onCancel={() => setOpen(false)}
      footer={null}
      closable={false}
      width={560}
      styles={{
        body: { padding: 0, overflow: "hidden", borderRadius: 12 },
      }}
      destroyOnHidden
    >
      <div onKeyDown={onKeyDown} className="flex flex-col">
        <div className="flex items-center px-4 py-3 border-b border-border bg-background">
          <Search className="size-5 text-muted-foreground mr-2 shrink-0" />
          <Input
            autoFocus
            variant="borderless"
            placeholder="Tìm kiếm lệnh, chức năng hoặc chuyển trang..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="p-0 text-base font-medium shadow-none focus:ring-0"
          />
        </div>

        <div className="max-h-80 overflow-y-auto divide-y divide-border/40 p-2">
          {filtered.length === 0 ? (
            <Empty
              description="Không tìm thấy chức năng phù hợp"
              className="py-8 text-muted-foreground"
            />
          ) : (
            filtered.map((command, index) => {
              const isSelected = index === activeIndex
              return (
                <div
                  key={command.storageId}
                  ref={(el) => {
                    itemRefs.current[index] = el
                  }}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => runCommand(command)}
                  className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-muted/50 text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm font-medium truncate">
                      {command.label}
                    </span>
                    {command.category && (
                      <Tag className="text-[10px] px-1.5 py-0 border-0 bg-muted text-muted-foreground">
                        {command.category}
                      </Tag>
                    )}
                  </div>

                  {command.keys && command.keys.length > 0 && (
                    <div className="flex items-center gap-1 shrink-0">
                      {command.keys.map((k) => (
                        <kbd
                          key={k}
                          className="rounded border border-border bg-background px-1.5 py-0.5 text-base font-semibold text-muted-foreground shadow-xs"
                        >
                          {formatShortcutKeys(k)}
                        </kbd>
                      ))}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>

        <div className="flex items-center justify-between border-t border-border px-4 py-2 text-base text-muted-foreground bg-muted/20">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="font-semibold text-foreground">↑↓</kbd> điều hướng
            </span>
            <span>
              <kbd className="font-semibold text-foreground">↵</kbd> chọn
            </span>
            <span>
              <kbd className="font-semibold text-foreground">Esc</kbd> đóng
            </span>
          </div>
          <span className="text-[11px] opacity-70">
            {filtered.length} chức năng
          </span>
        </div>
      </div>
    </Modal>
  )
}

export default CommandPalette

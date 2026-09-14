import { formatShortcutKeys } from "./combo"
import { resolveKeybinding } from "./keybindingsStore"
import { useShortcuts } from "./useShortcuts"

export interface ShortcutHintProps {
  keys: string | string[]
  handler?: (() => void) | undefined
  shortcutStorageId?: string
  shortcutLabel?: string
  className?: string
  showKey?: boolean
}

const ShortcutHint = ({
  keys,
  handler,
  shortcutStorageId,
  shortcutLabel,
  className,
  showKey,
}: ShortcutHintProps) => {
  const effectiveKeys = shortcutStorageId
    ? resolveKeybinding(shortcutStorageId, keys)
    : keys

  useShortcuts(
    handler
      ? {
          hint: {
            keys,
            handler,
            storageId: shortcutStorageId,
            label: shortcutLabel,
          },
        }
      : {},
  )

  const list = Array.isArray(effectiveKeys) ? effectiveKeys : [effectiveKeys]
  if (list.length === 0) return null
  return (
    <kbd
      className={["hidden", showKey && "block", className]
        .filter(Boolean)
        .join(" ")}
    >
      {list.map(formatShortcutKeys).join(" / ")}
    </kbd>
  )
}

export default ShortcutHint

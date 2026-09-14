export interface CommandEntry {
  storageId: string
  label: string
  handler: () => void
  keys: string[]
  category?: string
}

const activeCommands = new Map<string, CommandEntry>()
const listeners = new Set<() => void>()

let cachedSnapshot: CommandEntry[] = []
let dirty = true

const notify = (): void => {
  dirty = true
  listeners.forEach((fn) => {
    fn()
  })
}

export const registerCommand = (entry: CommandEntry): (() => void) => {
  if (import.meta.env.DEV && activeCommands.has(entry.storageId)) {
    console.error(
      `[commandRegistry] storageId "${entry.storageId}" đã được đăng ký, đang bị ghi đè`,
    )
  }
  activeCommands.set(entry.storageId, entry)
  notify()
  return () => {
    if (activeCommands.get(entry.storageId) === entry) {
      activeCommands.delete(entry.storageId)
      notify()
    }
  }
}

export const getActiveCommands = (): CommandEntry[] => {
  if (dirty) {
    cachedSnapshot = Array.from(activeCommands.values())
    dirty = false
  }
  return cachedSnapshot
}

export const subscribeCommands = (listener: () => void): (() => void) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export const OPEN_COMMAND_PALETTE_EVENT = "taskmgmt:open-command-palette"

export const openCommandPalette = (): void => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(OPEN_COMMAND_PALETTE_EVENT))
  }
}

export interface KeybindingEntry {
  key: string
  command: string
  when: string
}

const STORAGE_KEY = "shortcut-keybindings"

const listeners = new Set<() => void>()

const notify = (): void => {
  listeners.forEach((fn) => {
    fn()
  })
}

export const subscribeKeybindings = (listener: () => void): (() => void) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === STORAGE_KEY) notify()
  })
}

const readEntries = (): KeybindingEntry[] => {
  if (typeof localStorage === "undefined") return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as KeybindingEntry[]) : []
  } catch {
    return []
  }
}

const writeEntries = (entries: KeybindingEntry[]): void => {
  if (typeof localStorage === "undefined") return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
}

export const resolveKeybinding = (
  storageId: string,
  defaultKeys: string | string[],
): string[] => {
  const entries = readEntries()
  const isRemoved = entries.some((e) => e.command === `-${storageId}`)
  const customKeys = entries
    .filter((e) => e.command === storageId)
    .map((e) => e.key)
  const defaults = isRemoved
    ? []
    : Array.isArray(defaultKeys)
      ? defaultKeys
      : [defaultKeys]
  return [...defaults, ...customKeys]
}

export const setKeybindingOverride = (storageId: string, key: string): void => {
  const entries = readEntries().filter(
    (e) => e.command !== storageId && e.command !== `-${storageId}`,
  )
  entries.push({ key: "", command: `-${storageId}`, when: "" })
  entries.push({ key, command: storageId, when: "" })
  writeEntries(entries)
  notify()
}

export const resetKeybindingOverride = (storageId: string): void => {
  const entries = readEntries().filter(
    (e) => e.command !== storageId && e.command !== `-${storageId}`,
  )
  writeEntries(entries)
  notify()
}

const MODIFIER_KEYS = new Set(["Control", "Meta", "Alt", "Shift"])

const KEY_ALIASES: Record<string, string> = {
  " ": "space",
  Escape: "esc",
  Delete: "delete",
  Backspace: "backspace",
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
}

const normalizeKey = (key: string): string =>
  KEY_ALIASES[key] ?? key.toLowerCase()

const DIGIT_CODE = /^Digit(\d)$/

const baseKeyFromEvent = (e: KeyboardEvent): string => {
  const digitMatch = DIGIT_CODE.exec(e.code)
  if (digitMatch) return digitMatch[1]
  return normalizeKey(e.key)
}

export const comboFromEvent = (e: KeyboardEvent): string => {
  if (MODIFIER_KEYS.has(e.key)) return ""
  const parts: string[] = []
  if (e.ctrlKey || e.metaKey) parts.push("mod")
  if (e.shiftKey) parts.push("shift")
  if (e.altKey) parts.push("alt")
  parts.push(baseKeyFromEvent(e))
  return parts.join("+")
}

const AUTHORED_ALIASES: Record<string, string> = {
  ctrl: "mod",
  control: "mod",
  cmd: "mod",
  command: "mod",
  meta: "mod",
  win: "mod",
  windows: "mod",
  option: "alt",
  opt: "alt",
  escape: "esc",
  del: "delete",
  arrowup: "up",
  arrowdown: "down",
  arrowleft: "left",
  arrowright: "right",
  spacebar: "space",
  " ": "space",
}

const MODIFIER_ORDER = ["mod", "shift", "alt"]

export const normalizeCombo = (raw: string): string => {
  const parts = raw
    .toLowerCase()
    .split("+")
    .map((p) => p.trim())
    .map((p) => AUTHORED_ALIASES[p] ?? p)

  const modifiers = MODIFIER_ORDER.filter((m) => parts.includes(m))
  const key = parts.find((p) => !MODIFIER_ORDER.includes(p)) ?? ""
  return [...modifiers, key].filter(Boolean).join("+")
}

const isEditableElement = (el: EventTarget | null): boolean => {
  if (!(el instanceof HTMLElement)) return false
  const tag = el.tagName
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    el.isContentEditable
  )
}

// Ignore shortcuts while the user is typing in a field (antd Input/Select render as input tags)
export const isTypingTarget = (target: EventTarget | null): boolean =>
  isEditableElement(target)

// navigator.platform is deprecated; prefer the newer userAgentData hint (Chromium) and
// fall back through platform/userAgent for browsers that don't support it yet
const detectIsMac = (): boolean => {
  if (typeof navigator === "undefined") return false
  const uaDataPlatform = (
    navigator as Navigator & { userAgentData?: { platform?: string } }
  ).userAgentData?.platform
  const platform = uaDataPlatform || navigator.platform || navigator.userAgent
  return /Mac|iPhone|iPod|iPad/.test(platform)
}

const IS_MAC = detectIsMac()

const DISPLAY_ALIASES: Record<string, string> = {
  mod: IS_MAC ? "⌘" : "Ctrl",
  shift: IS_MAC ? "⇧" : "Shift",
  alt: IS_MAC ? "⌥" : "Alt",
  esc: "Esc",
  delete: "Delete",
  backspace: "Backspace",
  space: "Space",
  up: "↑",
  down: "↓",
  left: "←",
  right: "→",
}

const displayPart = (part: string): string =>
  DISPLAY_ALIASES[part] ??
  (part.length === 1
    ? part.toUpperCase()
    : part[0].toUpperCase() + part.slice(1))

// Mac convention has no separators ("⌘⇧S"), Windows/Linux joins with "+" ("Ctrl+Shift+S")
export const formatShortcutKeys = (keys: string): string =>
  normalizeCombo(keys)
    .split("+")
    .map(displayPart)
    .join(IS_MAC ? "" : "+")

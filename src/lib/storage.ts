// Safe localStorage helpers with error handling and non-browser environment guards

export const STORAGE_PREFIX = "tm:"

export function getStoredItem<T>(
  key: string,
  fallback: T,
  validator?: (value: unknown) => boolean,
): T {
  if (typeof window === "undefined" || typeof localStorage === "undefined") {
    return fallback
  }

  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback

    const parsed = JSON.parse(raw)
    if (validator && !validator(parsed)) {
      return fallback
    }
    return parsed as T
  } catch {
    return fallback
  }
}

export function setStoredItem<T>(key: string, value: T): void {
  if (typeof window === "undefined" || typeof localStorage === "undefined") {
    return
  }

  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Ignore storage quota errors silently
  }
}

export function removeStoredItem(key: string): void {
  if (typeof window === "undefined" || typeof localStorage === "undefined") {
    return
  }

  try {
    localStorage.removeItem(key)
  } catch {
    // Ignore removal errors silently
  }
}

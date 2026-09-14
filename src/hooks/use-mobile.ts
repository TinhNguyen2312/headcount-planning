import { useSyncExternalStore } from "react"

const MOBILE_BREAKPOINT = 768
const QUERY = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`

const subscribe = (callback: () => void) => {
  const mql = window.matchMedia(QUERY)
  mql.addEventListener("change", callback)
  return () => mql.removeEventListener("change", callback)
}

const getSnapshot = () =>
  typeof window !== "undefined" ? window.matchMedia(QUERY).matches : false

const getServerSnapshot = () => false

export const useIsMobile = (): boolean =>
  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

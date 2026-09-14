"use client"

import cloneDeep from "lodash/cloneDeep"
import isEqual from "lodash/isEqual"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

interface UseUnsavedChangesOptions<T> {
  getCurrentValue: () => T
}

interface UseUnsavedChangesReturn<T> {
  isDirty: boolean
  showWarning: boolean
  setSnapshot: (value: T) => void
  confirmLeave: () => void
  cancelLeave: () => void
  allowLeave: () => void
  markClean: () => void
}

const normalizeValue = (value: unknown): unknown => {
  if (value instanceof File) {
    return `__file__:${value.name}|${value.size}|${value.lastModified}`
  }
  if (Array.isArray(value)) {
    return value.map(normalizeValue)
  }
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => [k, normalizeValue(v)]),
    )
  }
  return value
}

function useUnsavedChanges<T>({
  getCurrentValue,
}: UseUnsavedChangesOptions<T>): UseUnsavedChangesReturn<T> {
  const [snapshot, setSnapshot] = useState<unknown>(undefined)
  const allowNextNavigateRef = useRef(false)
  const [showWarning, setShowWarning] = useState(false)

  const isDirty = useMemo(() => {
    if (snapshot === undefined) return false
    const current = normalizeValue(getCurrentValue())
    return !isEqual(snapshot, current)
  }, [snapshot, getCurrentValue])

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty && !allowNextNavigateRef.current) {
        e.preventDefault()
        e.returnValue = ""
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [isDirty])

  const updateSnapshot = useCallback((value: T) => {
    setSnapshot(normalizeValue(cloneDeep(value)))
  }, [])

  const markClean = useCallback(() => {
    setSnapshot(normalizeValue(getCurrentValue()))
  }, [getCurrentValue])

  const allowLeave = useCallback(() => {
    allowNextNavigateRef.current = true
  }, [])

  const confirmLeave = useCallback(() => {
    setShowWarning(false)
  }, [])

  const cancelLeave = useCallback(() => {
    setShowWarning(false)
  }, [])

  return {
    isDirty,
    showWarning,
    setSnapshot: updateSnapshot,
    confirmLeave,
    cancelLeave,
    allowLeave,
    markClean,
  }
}

export default useUnsavedChanges
export { useUnsavedChanges }

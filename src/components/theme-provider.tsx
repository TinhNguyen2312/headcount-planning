"use client"

import { createContext, useContext, useEffect, useState } from "react"

export type Theme = "dark" | "light"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  resolvedTheme: "dark" | "light"
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: "light",
  resolvedTheme: "light",
  setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export const ThemeProvider = ({
  children,
  defaultTheme = "light",
  storageKey = "app-ui-theme",
  ...props
}: ThemeProviderProps) => {
  const [theme, setTheme] = useState<Theme>(defaultTheme)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey) as Theme
      if (saved) {
        setTheme(saved)
      }
    } catch {
      // ignore
    }
  }, [storageKey])

  useEffect(() => {
    if (typeof window === "undefined") return
    const root = window.document.documentElement
    root.classList.remove("light", "dark")
    root.classList.add(theme)
  }, [theme])

  const value = {
    theme,
    resolvedTheme: theme,
    setTheme: (newTheme: Theme) => {
      try {
        localStorage.setItem(storageKey, newTheme)
      } catch {
        // ignore
      }
      setTheme(newTheme)
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)
  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")
  return context
}

import { describe, expect, it } from "vitest"
import { getAntdTheme } from "@/theme/antdTheme"

describe("antdTheme", () => {
  describe("Breadcrumb dark mode contrast", () => {
    it("provides light text for Breadcrumb in dark mode (contrast WCAG AA)", () => {
      const darkTheme = getAntdTheme(true)
      const breadcrumb = darkTheme.components?.Breadcrumb

      expect(breadcrumb).toBeDefined()
      // In dark mode, lastItemColor must use light heading color (#f3f4f6), not dark #1e293b
      expect(breadcrumb?.lastItemColor).toBe("#f3f4f6")
      expect(breadcrumb?.itemColor).toBe("#9ca3af")
      expect(breadcrumb?.separatorColor).toBe("#6b7280")
      expect(breadcrumb?.linkColor).toBe("#9ca3af")
      expect(breadcrumb?.linkHoverColor).toBe("#e2e8f0")
    })

    it("provides dark text for Breadcrumb in light mode", () => {
      const lightTheme = getAntdTheme(false)
      const breadcrumb = lightTheme.components?.Breadcrumb

      expect(breadcrumb).toBeDefined()
      expect(breadcrumb?.lastItemColor).toBe("#1e293b")
      expect(breadcrumb?.itemColor).toBe("#64748b")
      expect(breadcrumb?.separatorColor).toBe("#94a3b8")
      expect(breadcrumb?.linkColor).toBe("#64748b")
      expect(breadcrumb?.linkHoverColor).toBe("#334155")
    })
  })

  describe("General component theme adaptation", () => {
    it("adapts Divider, Tabs, Table, and Segmented colors between dark and light modes", () => {
      const darkTheme = getAntdTheme(true)
      const lightTheme = getAntdTheme(false)

      // Divider
      expect(darkTheme.components?.Divider?.colorSplit).toBe("#2b352f")
      expect(lightTheme.components?.Divider?.colorSplit).toBe("#e2e8f0")

      // Tabs
      expect(darkTheme.components?.Tabs?.itemHoverColor).toBe("#e2e8f0")
      expect(lightTheme.components?.Tabs?.itemHoverColor).toBe("#334155")

      // Table
      expect(darkTheme.components?.Table?.borderColor).toBe("#2b352f")
      expect(lightTheme.components?.Table?.borderColor).toBe("#e2e8f0")
      expect(darkTheme.components?.Table?.footerColor).toBe("#9ca3af")
      expect(lightTheme.components?.Table?.footerColor).toBe("#64748b")

      // Segmented
      expect(darkTheme.components?.Segmented?.itemSelectedColor).toBe("#f3f4f6")
      expect(lightTheme.components?.Segmented?.itemSelectedColor).toBe(
        "#1e293b",
      )
    })
  })
})

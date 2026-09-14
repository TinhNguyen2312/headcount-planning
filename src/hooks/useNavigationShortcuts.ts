import { useMemo } from "react"
import type { MenuItemConfig, UserNavigationContext } from "@/constants/menu"
import { type ShortcutBindings, useShortcuts } from "@/keyboard"

export interface UseNavigationShortcutsOptions {
  items: MenuItemConfig[]
  context: UserNavigationContext
  onNavigate: (item: MenuItemConfig) => void
}

export const useNavigationShortcuts = ({
  items,
  context,
  onNavigate,
}: UseNavigationShortcutsOptions) => {
  const shortcutBindings = useMemo(() => {
    const bindings: ShortcutBindings = {}
    for (const item of items) {
      if (!item.shortcut) continue
      const labelText = item.resolveLabel?.(context) ?? item.label

      bindings[`nav-${item.key}`] = {
        keys: item.shortcut,
        storageId: `nav.${item.key}`,
        label: `Mở ${labelText}`,
        category: item.category || "Điều hướng",
        handler: () => onNavigate(item),
      }
    }
    return bindings
  }, [items, context, onNavigate])

  useShortcuts(shortcutBindings)
}

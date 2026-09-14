"use client"

import { useRouter, usePathname } from "next/navigation"
import type { MenuProps } from "antd"
import { useCallback, useMemo } from "react"
import {
  filterMenuItemsByRole,
  findActiveMenuItem,
  MENU_ITEMS,
  type MenuItemConfig,
  type UserNavigationContext,
} from "@/constants/menu"
import type { AppRole } from "@/types"
import useAuth from "./useAuth"
import { useNavigationShortcuts } from "./useNavigationShortcuts"

export const useLayout = () => {
  const router = useRouter()
  const pathname = usePathname() || ""
  const { user, isSuperUser } = useAuth()
  const projectId = user?.currentProject?.id
  const currentRole: AppRole | null = isSuperUser
    ? "SUPER_ADMIN"
    : (user?.currentProject?.projectRole ?? user?.role ?? null)

  const navContext: UserNavigationContext = useMemo(
    () => ({
      projectId,
      isSuperUser,
    }),
    [projectId, isSuperUser],
  )

  const visibleItems = useMemo(
    () => filterMenuItemsByRole(MENU_ITEMS, currentRole),
    [currentRole],
  )

  const activeItem = useMemo(
    () => findActiveMenuItem(visibleItems, pathname),
    [visibleItems, pathname],
  )

  const handleNavigate = useCallback(
    (item: MenuItemConfig) => {
      const target = item.resolveNavigation?.(navContext) ?? { to: item.path }
      const url =
        typeof target === "string" ? target : (target as any).to || item.path
      router.push(url)
    },
    [navContext, router],
  )

  useNavigationShortcuts({
    items: visibleItems,
    context: navContext,
    onNavigate: handleNavigate,
  })

  const createAntdMenuItems = useCallback(
    (position?: "top" | "bottom"): MenuProps["items"] =>
      visibleItems
        .filter((item) =>
          position === "bottom"
            ? item.position === "bottom"
            : item.position !== "bottom",
        )
        .map((item) => {
          const Icon = item.icon
          return {
            key: item.key,
            icon: <Icon className="size-4" />,
            label: item.resolveLabel?.(navContext) ?? item.label,
            onClick: () => handleNavigate(item),
          }
        }),
    [visibleItems, navContext, handleNavigate],
  )

  const topMenuItems = useMemo(
    () => createAntdMenuItems("top"),
    [createAntdMenuItems],
  )

  const bottomMenuItems = useMemo(
    () => createAntdMenuItems("bottom"),
    [createAntdMenuItems],
  )

  const menuItems = useMemo(
    () => [...(topMenuItems ?? []), ...(bottomMenuItems ?? [])],
    [topMenuItems, bottomMenuItems],
  )

  return {
    items: visibleItems,
    menuItems,
    topMenuItems,
    bottomMenuItems,
    activeKey: activeItem?.key ?? "",
    activeLabel: activeItem?.label,
    navigateHome: useCallback(() => router.push("/projects"), [router]),
  }
}

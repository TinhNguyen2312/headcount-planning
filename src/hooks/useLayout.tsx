"use client"

import { useRouter, usePathname } from "next/navigation"
import type { MenuProps } from "antd"
import { useCallback, useMemo } from "react"
import {
  filterMenuItemsByRole,
  findActiveMenuItem,
  HEADCOUNT_MENU_ITEMS,
  TIMELINE_MENU_ITEMS,
  DRAWING_CHECKER_MENU_ITEMS,
  DMD_MENU_ITEMS,
  PCD_MENU_ITEMS,
  type MenuItemConfig,
  type UserNavigationContext,
} from "@/constants/menu"
import type { AppRole } from "@/types"
import { useMtlUiStore } from "@/stores/useMtlUiStore"
import useAuth from "./useAuth"
import { useNavigationShortcuts } from "./useNavigationShortcuts"

export const useLayout = () => {
  const router = useRouter()
  const pathname = usePathname() || ""
  const { user, isSuperUser } = useAuth()
  const { view: mtlView, setView: setMtlView } = useMtlUiStore()

  const isTimeline = pathname.startsWith("/timeline")
  const isDmd = pathname.startsWith("/dmd")
  const isPcd = pathname.startsWith("/pcd")
  const isDrawingChecker = pathname.startsWith("/drawing-checker")

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

  const rawMenuItems = useMemo(() => {
    if (isTimeline) return TIMELINE_MENU_ITEMS
    if (isDmd) return DMD_MENU_ITEMS
    if (isPcd) return PCD_MENU_ITEMS
    if (isDrawingChecker) return DRAWING_CHECKER_MENU_ITEMS
    return HEADCOUNT_MENU_ITEMS
  }, [isTimeline, isDmd, isPcd, isDrawingChecker])

  const visibleItems = useMemo(
    () => filterMenuItemsByRole(rawMenuItems, currentRole),
    [rawMenuItems, currentRole],
  )

  const activeItem = useMemo(() => {
    if (isTimeline) {
      const match = visibleItems.find((item) => item.path.includes(`tab=${mtlView}`))
      return match || visibleItems[0]
    }
    if (isDmd || isPcd) {
      if (typeof window !== "undefined") {
        const search = window.location.search
        if (search) {
          const match = visibleItems.find((item) => item.path.includes(search))
          if (match) return match
        }
      }
      return visibleItems[0]
    }
    return findActiveMenuItem(visibleItems, pathname)
  }, [isTimeline, isDmd, isPcd, visibleItems, mtlView, pathname])

  const handleNavigate = useCallback(
    (item: MenuItemConfig) => {
      if (isTimeline && item.path.startsWith("/timeline?tab=")) {
        const tab = item.path.replace("/timeline?tab=", "") as any
        setMtlView(tab)
      }
      const target = item.resolveNavigation?.(navContext) ?? { to: item.path }
      const url =
        typeof target === "string" ? target : (target as any).to || item.path
      router.push(url)
    },
    [isTimeline, navContext, router, setMtlView],
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
    isTimeline,
    isDrawingChecker,
    items: visibleItems,
    menuItems,
    topMenuItems,
    bottomMenuItems,
    activeKey: activeItem?.key ?? "",
    activeLabel: activeItem?.label,
    navigateHome: useCallback(() => {
      if (isTimeline) return router.push("/timeline")
      if (isDrawingChecker) return router.push("/drawing-checker")
      return router.push("/projects")
    }, [router, isTimeline, isDrawingChecker]),
  }
}

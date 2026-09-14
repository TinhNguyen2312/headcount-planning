import { describe, expect, it } from "vitest"
import {
  filterMenuItemsByRole,
  findActiveMenuItem,
  MENU_ITEMS,
  type UserNavigationContext,
} from "@/constants/menu"

describe("Menu Configuration & Pure Functions", () => {
  describe("filterMenuItemsByRole", () => {
    it("returns public items when role is null", () => {
      const filtered = filterMenuItemsByRole(MENU_ITEMS, null)
      const keys = filtered.map((i) => i.key)

      // Items without explicit roles should be present
      expect(keys).toContain("dashboard")
      expect(keys).toContain("create-adhoc")
      expect(keys).toContain("projects")
      expect(keys).toContain("business-matrix")
      expect(keys).toContain("checklists")
      expect(keys).toContain("settings")

      // Role-protected items should not be present
      expect(keys).not.toContain("my-task")
      expect(keys).not.toContain("subordinates")
      expect(keys).not.toContain("staff")
      expect(keys).not.toContain("user")
      expect(keys).not.toContain("roles")
    })

    it("allows SUPER_ADMIN to see administration items but not personal/project schedule items", () => {
      const filtered = filterMenuItemsByRole(MENU_ITEMS, "SUPER_ADMIN")
      const keys = filtered.map((i) => i.key)

      expect(keys).toContain("dashboard")
      expect(keys).toContain("create-adhoc")
      expect(keys).toContain("projects")
      expect(keys).toContain("user")
      expect(keys).toContain("business-matrix")
      expect(keys).toContain("checklists")
      expect(keys).toContain("settings")
      expect(keys).toContain("roles")

      // schedules is only for project roles
      expect(keys).not.toContain("schedules")
      expect(keys).not.toContain("my-task")
      expect(keys).not.toContain("subordinates")
      expect(keys).not.toContain("staff")
      expect(keys).toHaveLength(8)
    })

    it("allows TASK_EXECUTOR to see my-task and schedules but not management items", () => {
      const filtered = filterMenuItemsByRole(MENU_ITEMS, "TASK_EXECUTOR")
      const keys = filtered.map((i) => i.key)

      expect(keys).toContain("my-task")
      expect(keys).toContain("schedules")
      expect(keys).not.toContain("subordinates")
      expect(keys).not.toContain("staff")
      expect(keys).not.toContain("user")
      expect(keys).not.toContain("roles")
    })

    it("allows PROJECT_ADMIN to see subordinates and staff", () => {
      const filtered = filterMenuItemsByRole(MENU_ITEMS, "PROJECT_ADMIN")
      const keys = filtered.map((i) => i.key)

      expect(keys).toContain("subordinates")
      expect(keys).toContain("staff")
      expect(keys).toContain("schedules")
      expect(keys).toContain("my-task")
      expect(keys).not.toContain("user")
      expect(keys).not.toContain("roles")
    })
  })

  describe("findActiveMenuItem", () => {
    it("matches root path '/' exactly", () => {
      const active = findActiveMenuItem(MENU_ITEMS, "/")
      expect(active?.key).toBe("dashboard")
    })

    it("does not falsely match other paths to root", () => {
      const active = findActiveMenuItem(MENU_ITEMS, "/my-task")
      expect(active?.key).toBe("my-task")
    })

    it("matches sub-routes with prefix", () => {
      const active = findActiveMenuItem(MENU_ITEMS, "/projects/123/edit")
      expect(active?.key).toBe("projects")
    })

    it("returns undefined for unrecognized routes", () => {
      const active = findActiveMenuItem(MENU_ITEMS, "/unknown-page")
      expect(active).toBeUndefined()
    })
  })

  describe("Dynamic route & label resolver for projects", () => {
    const projectItem = MENU_ITEMS.find((i) => i.key === "projects")!

    it("exists in MENU_ITEMS", () => {
      expect(projectItem).toBeDefined()
    })

    it("resolves to project edit page and 'Dự án của tôi' for standard project member", () => {
      const ctx: UserNavigationContext = {
        projectId: 42,
        isSuperUser: false,
      }

      const target = projectItem.resolveNavigation?.(ctx)
      expect(target).toEqual({
        to: "/projects/$projectId/edit",
        params: { projectId: "42" },
      })

      const label = projectItem.resolveLabel?.(ctx)
      expect(label).toBe("Dự án của tôi")
    })

    it("resolves to '/projects' and 'Dự án' for super admin even if projectId is set", () => {
      const ctx: UserNavigationContext = {
        projectId: 42,
        isSuperUser: true,
      }

      const target = projectItem.resolveNavigation?.(ctx)
      expect(target).toEqual({ to: "/projects" })

      const label = projectItem.resolveLabel?.(ctx)
      expect(label).toBe("Dự án")
    })

    it("resolves to '/projects' when user has no projectId", () => {
      const ctx: UserNavigationContext = {
        projectId: undefined,
        isSuperUser: false,
      }

      const target = projectItem.resolveNavigation?.(ctx)
      expect(target).toEqual({ to: "/projects" })

      const label = projectItem.resolveLabel?.(ctx)
      expect(label).toBe("Dự án")
    })
  })
})

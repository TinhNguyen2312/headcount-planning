import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { AppRole, ProjectSummary, UserMeResponse } from "@/types"

interface AuthState {
  currentProject: ProjectSummary | null
  role: AppRole | null

  setUser: (user: UserMeResponse | null) => void
  setProjectRole: (row: ProjectSummary) => void
  clearAuth: () => void
}

export const authStore = create<AuthState>()(
  persist(
    (set, get) => ({
      currentProject: null,
      role: null,

      setUser: (user) => {
        if (!user) {
          set({ currentProject: null, role: null })
          return
        }

        if (user.systemRole === "SUPER_ADMIN") {
          set({ currentProject: null, role: "SUPER_ADMIN" })
          return
        }

        const rows = user.projects ?? []
        const pickedRoleId = get().currentProject?.roleId
        const row =
          rows.length === 1
            ? rows[0]
            : (rows.find((r) => r.roleId === pickedRoleId) ?? null)

        set({ currentProject: row, role: row?.projectRole ?? null })
      },

      setProjectRole: (row) =>
        set({ currentProject: row, role: row.projectRole }),

      clearAuth: () => set({ currentProject: null, role: null }),
    }),
    {
      name: "auth-store",
      partialize: (state) => ({ currentProject: state.currentProject }),
    },
  ),
)

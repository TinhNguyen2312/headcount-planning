import { Button, Select } from "antd"
import { useMemo, useState } from "react"

import useAuth from "@/hooks/useAuth"
import { authStore } from "@/stores/authStore"
import type { ProjectSummary } from "@/types"

const ProjectRoleSettings = () => {
  const { user } = useAuth()
  const setProjectRole = authStore((s) => s.setProjectRole)

  const projects = useMemo(() => {
    const seen = new Map<number, string>()
    for (const r of user?.projects ?? []) {
      if (r.id != null) seen.set(r.id, r.name ?? "")
    }
    return Array.from(seen, ([id, name]) => ({ id, name }))
  }, [user?.projects])

  const [projectId, setProjectId] = useState<number | undefined>(
    user?.currentProject?.id,
  )

  const roleChoices = useMemo(
    () => (user?.projects ?? []).filter((r) => r.id === projectId),
    [user?.projects, projectId],
  )

  const [roleId, setRoleId] = useState<number | undefined>(
    user?.currentProject?.roleId,
  )

  const isDirty =
    projectId !== user?.currentProject?.id ||
    roleId !== user?.currentProject?.roleId

  const handleProjectChange = (nextProjectId: number) => {
    setProjectId(nextProjectId)
    const roles = (user?.projects ?? []).filter((r) => r.id === nextProjectId)
    setRoleId(roles.length === 1 ? roles[0].roleId : undefined)
  }

  const handleApply = () => {
    const row: ProjectSummary | undefined = roleChoices.find(
      (r) => r.roleId === roleId,
    )
    if (!row) return
    setProjectRole(row)
    window.location.reload()
  }

  return (
    <div className="max-w-md">
      <h3 className="text-lg font-semibold py-4">Dự án & Quyền</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Chọn dự án và vai trò bạn muốn sử dụng cho phiên làm việc hiện tại.
      </p>

      <div className="flex flex-col gap-4">
        <div>
          <p className="text-sm font-medium mb-1">Dự án</p>
          <Select
            className="w-full"
            value={projectId}
            onChange={handleProjectChange}
            options={projects.map((p) => ({ value: p.id, label: p.name }))}
          />
        </div>

        <div>
          <p className="text-sm font-medium mb-1">Vai trò</p>
          <Select
            className="w-full"
            value={roleId}
            onChange={setRoleId}
            disabled={roleChoices.length === 0}
            options={roleChoices.map((r) => ({
              value: r.roleId,
              label: r.roleName || r.projectRole,
            }))}
          />
        </div>

        <Button
          type="primary"
          className="self-start"
          disabled={!projectId || !isDirty}
          onClick={handleApply}
        >
          Lưu & áp dụng
        </Button>
      </div>
    </div>
  )
}

export default ProjectRoleSettings

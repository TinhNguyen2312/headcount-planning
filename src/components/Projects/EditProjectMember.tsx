import { Button, DatePicker, Input, Modal } from "antd"
import dayjs, { type Dayjs } from "dayjs"
import { Trash2 } from "lucide-react"
import { useMemo, useState } from "react"

import { projectQueries } from "@/hooks/server/projects"
import { useUI } from "@/hooks/useUI"
import type { UserProjectRoleDetailResponse, ZoneResponse } from "@/types"

interface EditProjectMemberProps {
  projectId: number
  member: UserProjectRoleDetailResponse
  open: boolean
  onCancel: () => void
}

interface EditProjectMemberFormProps {
  projectId: number
  member: UserProjectRoleDetailResponse
  onCancel: () => void
}

const EditProjectMemberForm = ({
  projectId,
  member,
  onCancel,
}: EditProjectMemberFormProps) => {
  const { data: projectUsers = [] } = projectQueries.useUsers(projectId, {
    status: "ACTIVE",
  })
  const addRole = projectQueries.useAddUser(projectId)
  const updateRole = projectQueries.useUpdateUserRole(projectId)
  const removeRole = projectQueries.useRemoveUser(projectId)
  const { message } = useUI()

  const [isSubmitting, setIsSubmitting] = useState(false)

  const userActiveRoles = useMemo(
    () =>
      projectUsers.filter(
        (u) =>
          u.userId === member.userId &&
          u.roleId === member.roleId &&
          u.status === "ACTIVE",
      ),
    [projectUsers, member.userId, member.roleId],
  )

  const initialRoleMap = useMemo(() => {
    const map = new Map<number, UserProjectRoleDetailResponse>()
    for (const r of userActiveRoles) {
      if (r.zoneId != null) {
        map.set(r.zoneId, r)
      }
    }
    return map
  }, [userActiveRoles])

  const [selectedZones, setSelectedZones] = useState<ZoneResponse[]>(() =>
    userActiveRoles
      .filter((r) => r.zoneId != null)
      .map(
        (r) =>
          ({
            id: r.zoneId,
            name: r.zoneName || `Khu ${r.zoneId}`,
            projectId,
          }) as ZoneResponse,
      ),
  )

  const [dates, setDates] = useState<Record<number, Dayjs>>(() => {
    const initialDates: Record<number, Dayjs> = {}
    for (const r of userActiveRoles) {
      if (r.zoneId != null) {
        initialDates[r.zoneId] = dayjs(r.effectiveFrom || undefined)
      }
    }
    return initialDates
  })

  const onSubmit = async () => {
    if (selectedZones.length === 0 && member.projectRole !== "PROJECT_ADMIN") {
      message.error("Vui lòng chọn ít nhất 1 khu vực phụ trách")
      return
    }

    setIsSubmitting(true)
    try {
      const currentZoneIds = new Set(selectedZones.map((z) => z.id))
      const toAdd = selectedZones.filter((z) => !initialRoleMap.has(z.id))
      const toRemove = userActiveRoles.filter(
        (r) => r.zoneId != null && !currentZoneIds.has(r.zoneId),
      )
      const toUpdate = selectedZones.filter((z) => {
        const r = initialRoleMap.get(z.id)
        if (!r) return false
        const currentDate = (dates[z.id] ?? dayjs()).format("YYYY-MM-DD")
        return currentDate !== r.effectiveFrom
      })

      await Promise.all([
        ...toAdd.map((zone) =>
          addRole.mutateAsync({
            userId: member.userId,
            roleId: member.roleId,
            zoneId: zone.id,
            projectRole: member.projectRole,
            effectiveFrom: (dates[zone.id] ?? dayjs()).format("YYYY-MM-DD"),
          }),
        ),
        ...toRemove.map((r) => removeRole.mutateAsync(r.id)),
        ...toUpdate.map((zone) => {
          const r = initialRoleMap.get(zone.id)!
          return updateRole.mutateAsync({
            id: r.id,
            data: {
              roleId: member.roleId,
              zoneId: zone.id,
              effectiveFrom: (dates[zone.id] ?? dayjs()).format("YYYY-MM-DD"),
            },
          })
        }),
      ])

      message.success("Cập nhật khu vực phụ trách thành công")
      onCancel()
    } catch {
      message.error("Cập nhật khu vực phụ trách thất bại.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <p className="mb-3 text-sm text-muted-foreground">
        Cập nhật khu vực phụ trách và ngày hiệu lực của "{member.userFullName}".
      </p>

      <div className="flex flex-col gap-3">
        <div>
          <label className="text-sm font-medium mb-1 block">
            Chức danh / Quyền trong dự án
          </label>
          <Input disabled value={member.roleName || "—"} />
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">
            Khu vực phụ trách
          </label>
          {null}
        </div>

        {selectedZones.length > 0 && (
          <div className="flex flex-col gap-2 rounded-md border p-3 bg-muted/20">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Ngày hiệu lực từng phân khu ({selectedZones.length})
            </span>

            <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
              {selectedZones.map((zone) => {
                const isNew = !initialRoleMap.has(zone.id)
                const zoneLabel = zone.code
                  ? `${zone.name} (${zone.code})`
                  : zone.name

                return (
                  <div
                    key={zone.id}
                    className="flex items-center justify-between gap-2 p-2 rounded border bg-background"
                  >
                    <span className="font-medium text-sm truncate flex-1">
                      {zoneLabel}
                      {isNew && (
                        <span className="text-xs text-primary font-normal ml-2">
                          (Mới)
                        </span>
                      )}
                    </span>
                    <div className="flex items-center gap-2">
                      <DatePicker
                        value={dates[zone.id] ?? dayjs()}
                        onChange={(d) =>
                          d &&
                          setDates((prev) => ({
                            ...prev,
                            [zone.id]: d,
                          }))
                        }
                        format="DD/MM/YYYY"
                        allowClear={false}
                        className="w-36"
                      />
                      <Button
                        type="text"
                        danger
                        size="small"
                        icon={<Trash2 className="size-4" />}
                        onClick={() =>
                          setSelectedZones((prev) =>
                            prev.filter((z) => z.id !== zone.id),
                          )
                        }
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      <div className="mt-5 flex justify-end gap-2">
        <Button onClick={onCancel} disabled={isSubmitting}>
          Hủy
        </Button>
        <Button type="primary" onClick={onSubmit} loading={isSubmitting}>
          Lưu
        </Button>
      </div>
    </>
  )
}

const EditProjectMember = ({
  projectId,
  member,
  open,
  onCancel,
}: EditProjectMemberProps) => {
  return (
    <Modal
      open={open}
      destroyOnHidden
      onCancel={onCancel}
      footer={null}
      title="Sửa khu vực phụ trách"
      centered
      width={540}
    >
      <EditProjectMemberForm
        projectId={projectId}
        member={member}
        onCancel={onCancel}
      />
    </Modal>
  )
}

export default EditProjectMember

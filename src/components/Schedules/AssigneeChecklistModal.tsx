import {
  Card,
  Checkbox,
  Flex,
  Modal,
  Select,
  Space,
  Tag,
  Typography,
} from "antd"
import { CheckCheck, ListChecks, Users } from "lucide-react"
import React, { useEffect, useState } from "react"
import type { AvailableUserResponse, ChecklistResponse } from "@/types"
import type { AssignedUser } from "./scheduleUtils"

const { Text } = Typography

export interface AssigneeChecklistModalProps {
  open: boolean
  taskTitle: string
  zoneName: string
  weekdayLabel: string
  date: string
  candidates: AvailableUserResponse[]
  checklists: ChecklistResponse[]
  initialAssignedUsers: AssignedUser[]
  onConfirm: (assignedUsers: AssignedUser[]) => void
  onCancel: () => void
}

interface UserAssignmentState {
  userId: number
  selected: boolean
  checklistId: number | null
}

const AssigneeChecklistModal = React.memo(
  ({
    open,
    taskTitle,
    zoneName,
    weekdayLabel,
    date,
    candidates,
    checklists,
    initialAssignedUsers,
    onConfirm,
    onCancel,
  }: AssigneeChecklistModalProps) => {
    const defaultChecklistId = checklists.length === 1 ? checklists[0].id : null

    const [assignments, setAssignments] = useState<
      Record<number, UserAssignmentState>
    >({})

    const [commonChecklistId, setCommonChecklistId] = useState<number | null>(
      null,
    )

    useEffect(() => {
      if (!open) return

      const initialMap: Record<number, UserAssignmentState> = {}
      const assignedIds = new Set(initialAssignedUsers.map((u) => u.id))
      const assignedChecklistMap = new Map(
        initialAssignedUsers.map((u) => [u.id, u.checklistId ?? null]),
      )

      for (const candidate of candidates) {
        const cId = candidate.id ?? candidate.userId ?? 0
        const isAssigned = assignedIds.has(cId)
        initialMap[cId] = {
          userId: cId,
          selected: isAssigned,
          checklistId: isAssigned
            ? (assignedChecklistMap.get(cId) ?? defaultChecklistId)
            : defaultChecklistId,
        }
      }

      setAssignments(initialMap)

      const firstChecklistId = initialAssignedUsers[0]?.checklistId ?? null
      const allSame =
        initialAssignedUsers.length > 0 &&
        initialAssignedUsers.every((u) => u.checklistId === firstChecklistId)
      setCommonChecklistId(allSame ? firstChecklistId : null)
    }, [open, initialAssignedUsers, candidates, defaultChecklistId])

    const handleToggleUser = (userId: number) => {
      setAssignments((prev) => {
        const current = prev[userId]
        if (!current) return prev
        const nextSelected = !current.selected
        return {
          ...prev,
          [userId]: {
            ...current,
            selected: nextSelected,
            checklistId:
              current.checklistId ?? commonChecklistId ?? defaultChecklistId,
          },
        }
      })
    }

    const handleChangeUserChecklist = (
      userId: number,
      checklistId: number | null,
    ) => {
      setAssignments((prev) => {
        const current = prev[userId]
        if (!current) return prev
        return {
          ...prev,
          [userId]: {
            ...current,
            checklistId,
          },
        }
      })
    }

    const handleApplyCommonChecklist = (clId: number | null) => {
      setCommonChecklistId(clId)
      setAssignments((prev) => {
        const next = { ...prev }
        for (const uId of Object.keys(next)) {
          const numId = Number(uId)
          if (next[numId]?.selected) {
            next[numId] = {
              ...next[numId],
              checklistId: clId,
            }
          }
        }
        return next
      })
    }

    const handleConfirm = () => {
      const result: AssignedUser[] = []

      for (const candidate of candidates) {
        const cId = candidate.id ?? candidate.userId ?? 0
        const assign = assignments[cId]
        if (assign?.selected) {
          const cl = checklists.find((c) => c.id === assign.checklistId)
          result.push({
            id: cId,
            name: candidate.fullName,
            phone: candidate.phone ?? null,
            roleId: candidate.roleId,
            checklistId: assign.checklistId ?? null,
            checklistName: cl?.name ?? null,
          })
        }
      }

      onConfirm(result)
    }

    const selectedCount = Object.values(assignments).filter(
      (a) => a.selected,
    ).length
    const hasMultipleChecklists = checklists.length > 1
    const checklistOptions = checklists.map((c) => ({
      value: c.id,
      label: c.name,
    }))

    return (
      <Modal
        title={
          <Space>
            <Users size={18} className="text-primary" />
            <span className="font-semibold">
              Phân công nhân sự & Biểu mẫu kiểm tra
            </span>
          </Space>
        }
        open={open}
        onOk={handleConfirm}
        onCancel={onCancel}
        okText={`Xác nhận phân công${selectedCount > 0 ? ` (${selectedCount})` : ""}`}
        cancelText="Hủy"
        width={680}
        destroyOnHidden
        centered
      >
        <Flex vertical gap="middle" className="mt-3">
          <Card size="small" className="bg-muted/40">
            <Flex vertical gap={4}>
              <Text strong className="text-base">
                {taskTitle}
              </Text>
              <Space
                separator="•"
                size="small"
                className="text-muted-foreground text-xs"
              >
                <span>{zoneName}</span>
                <span>
                  {weekdayLabel} ({date})
                </span>
                <span>
                  {checklists.length === 0
                    ? "Không yêu cầu biểu mẫu"
                    : `${checklists.length} biểu mẫu checklist`}
                </span>
              </Space>
            </Flex>
          </Card>

          {hasMultipleChecklists && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-lg border bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
              <div className="flex items-center gap-1.5 text-xs text-blue-800 dark:text-blue-300">
                <CheckCheck size={15} className="shrink-0" />
                <span className="font-medium">
                  Áp dụng chung checklist cho tất cả:
                </span>
              </div>
              <div className="w-full sm:w-64">
                <Select
                  placeholder="Chọn biểu mẫu chung..."
                  allowClear
                  className="w-full"
                  size="small"
                  value={commonChecklistId}
                  options={checklistOptions}
                  onChange={handleApplyCommonChecklist}
                />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2 max-h-380px overflow-y-auto pr-1">
            {candidates.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                Khu vực này hiện chưa có nhân sự phù hợp chuyên môn.
              </div>
            ) : (
              candidates.map((candidate) => {
                const candidateId = candidate.id ?? candidate.userId ?? 0
                const assign = assignments[candidateId]
                const isSelected = Boolean(assign?.selected)

                return (
                  <div
                    key={candidateId}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border transition-all ${
                      isSelected
                        ? "border-primary/50 bg-primary/5 dark:bg-primary/10 shadow-xs"
                        : "border-border hover:border-muted-foreground/30 bg-card"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={isSelected}
                        onChange={() => handleToggleUser(candidateId)}
                      />
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <Text strong>{candidate.fullName}</Text>
                          {candidate.roleName && (
                            <Tag className="text-[11px] m-0">
                              {candidate.roleName}
                            </Tag>
                          )}
                        </div>
                        {candidate.phone && (
                          <Text type="secondary" className="text-xs">
                            SĐT: {candidate.phone}
                          </Text>
                        )}
                      </div>
                    </div>

                    {isSelected && (
                      <div className="pl-7 sm:pl-0 w-full sm:w-64 shrink-0">
                        {hasMultipleChecklists ? (
                          <Select
                            placeholder="Chọn biểu mẫu..."
                            size="small"
                            className="w-full"
                            value={assign?.checklistId ?? undefined}
                            options={checklistOptions}
                            onChange={(val) =>
                              handleChangeUserChecklist(candidateId, val)
                            }
                          />
                        ) : checklists.length === 1 ? (
                          <div className="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-1 rounded border border-emerald-200 dark:border-emerald-900">
                            <ListChecks size={13} className="shrink-0" />
                            <span
                              className="truncate"
                              title={checklists[0].name}
                            >
                              {checklists[0].name}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">
                            Không có biểu mẫu
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </Flex>
      </Modal>
    )
  },
)

export default AssigneeChecklistModal
export { AssigneeChecklistModal }

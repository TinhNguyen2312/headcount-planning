import { Alert, Button, DatePicker, Modal } from "antd"
import dayjs, { type Dayjs } from "dayjs"
import { Info } from "lucide-react"
import { useMemo, useState } from "react"
import InfiniteSelect from "@/components/Common/InfiniteSelect"
import { userProjectRoleQueries } from "@/hooks/server/projects"
import { userQueries } from "@/hooks/server/users"
import type { UserProjectRoleDetailResponse } from "@/types"

const { RangePicker } = DatePicker

interface AssignReplacementModalProps {
  projectId: number
  projectName?: string
  member: UserProjectRoleDetailResponse
  open: boolean
  onCancel: () => void
}

interface AssignReplacementFormProps {
  projectId: number
  member: UserProjectRoleDetailResponse
  onCancel: () => void
}

const AssignReplacementForm = ({
  projectId,
  member,
  onCancel,
}: AssignReplacementFormProps) => {
  const [replacementUserId, setReplacementUserId] = useState<
    number | undefined
  >(() => member.replacementUserId ?? undefined)
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(() => {
    if (member.replacementFrom && member.replacementTo) {
      return [dayjs(member.replacementFrom), dayjs(member.replacementTo)]
    }
    const today = dayjs()
    return [today, today]
  })
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const assignReplacement = userQueries.useAssignReplacement(projectId)

  const handleSubmit = async () => {
    if (!replacementUserId) {
      setErrorMsg("Vui lòng chọn nhân sự thay thế")
      return
    }

    const payload = {
      replacementUserId,
      replacementFrom: dateRange?.[0]
        ? dateRange[0].format("YYYY-MM-DD")
        : dayjs().format("YYYY-MM-DD"),
      replacementTo: dateRange?.[1]
        ? dateRange[1].format("YYYY-MM-DD")
        : dayjs().format("YYYY-MM-DD"),
    }

    try {
      await assignReplacement.mutateAsync({
        userProjectRoleId: member.id,
        data: payload,
      })
      onCancel()
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { detail?: string } } }
      setErrorMsg(
        apiErr?.response?.data?.detail ??
          "Có lỗi xảy ra khi gán nhân sự thay thế",
      )
    }
  }

  const initialReplacementOptions = useMemo(
    () =>
      member.replacementUserId
        ? [
            {
              value: member.replacementUserId,
              label:
                member.replacementUserFullName ||
                `User #${member.replacementUserId}`,
            },
          ]
        : undefined,
    [member.replacementUserId, member.replacementUserFullName],
  )

  return (
    <>
      <div className="flex flex-col gap-4 py-3">
        <Alert
          type="info"
          showIcon
          icon={<Info className="size-4" />}
          message={
            <div className="text-base">
              Nhân sự được gán thay thế sẽ nhận toàn bộ thẩm quyền phê duyệt và
              nhiệm vụ của{" "}
              <strong>{member.userFullName || `User #${member.userId}`}</strong>{" "}
              trong khoảng thời gian này.
            </div>
          }
        />

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="replacement-user-select"
            className="text-base font-bold tracking-tight text-foreground uppercase"
          >
            Nhân sự thay thế <span className="text-destructive">*</span>
          </label>
          <InfiniteSelect<UserProjectRoleDetailResponse, number>
            id="replacement-user-select"
            allowClear
            placeholder="Chọn nhân sự cùng chức danh để thay thế"
            value={replacementUserId}
            onChange={(val) => {
              setReplacementUserId(val as number)
              if (val) setErrorMsg(null)
            }}
            useList={userProjectRoleQueries.useList}
            options={initialReplacementOptions}
            extraParams={{
              projectId,
              roleId: member.roleId,
              status: "ACTIVE",
            }}
            filterItem={(u) =>
              u.userId !== member.userId &&
              u.roleId === member.roleId &&
              (u.status === "ACTIVE" || !u.status)
            }
            transformItem={(item) => ({
              value: item.userId,
              label: item.roleName
                ? `${item.userFullName || item.userName} (${item.roleName})`
                : item.userFullName || item.userName || `User #${item.userId}`,
              ...item,
            })}
            fieldNames={{ label: "userFullName", value: "userId" }}
            filterOption={(input, option) =>
              String(option?.label ?? "")
                .toLowerCase()
                .includes(input.toLowerCase())
            }
            className="w-full h-10"
            status={errorMsg ? "error" : ""}
          />
          {errorMsg && (
            <span className="text-base text-destructive">{errorMsg}</span>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="replacement-range-picker"
            className="text-base font-bold tracking-tight text-foreground uppercase"
          >
            Khoảng ngày hiệu lực
          </label>
          <RangePicker
            id="replacement-range-picker"
            format="DD.MM.YYYY"
            value={dateRange}
            onChange={(dates) => {
              if (dates?.[0] && dates[1]) {
                setDateRange([dates[0], dates[1]])
              } else {
                setDateRange(null)
              }
            }}
            className="w-full h-10"
            placeholder={["Từ ngày", "Đến ngày"]}
          />
        </div>

        <Alert
          type="info"
          title=""
          icon={<Info />}
          description="Các phiếu công việc chưa hoàn thành từ hôm nay trong khoảng ngày này sẽ được chuyển sang cho nhân sự thay thế."
        />
      </div>

      <div className="mt-5 flex justify-end gap-2">
        <Button onClick={onCancel} disabled={assignReplacement.isPending}>
          Hủy
        </Button>
        <Button
          type="primary"
          onClick={handleSubmit}
          loading={assignReplacement.isPending}
        >
          Xác nhận thay thế
        </Button>
      </div>
    </>
  )
}

const AssignReplacementModal = ({
  projectId,
  projectName: _projectName,
  member,
  open,
  onCancel,
}: AssignReplacementModalProps) => {
  return (
    <Modal
      open={open}
      destroyOnHidden
      onCancel={onCancel}
      footer={null}
      title={
        <div className="flex items-center gap-2">
          Gán Nhân sự Thay thế Tạm thời
        </div>
      }
      width={680}
      centered
    >
      <AssignReplacementForm
        projectId={projectId}
        member={member}
        onCancel={onCancel}
      />
    </Modal>
  )
}

export default AssignReplacementModal

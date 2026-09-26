import type { TaskInstanceStageStatus } from "@/types"

export const STAGE_STATUS_TAG: Record<
  TaskInstanceStageStatus,
  { color: string; label: string; borderClass: string }
> = {
  TODO: {
    color: "default",
    label: "Chờ thực hiện",
    borderClass: "border-l-border!",
  },
  IN_REVIEW: {
    color: "processing",
    label: "Đang chờ duyệt",
    borderClass: "border-l-blue-500!",
  },
  APPROVED: {
    color: "success",
    label: "Đã duyệt",
    borderClass: "border-l-primary!",
  },
  REJECTED: {
    color: "error",
    label: "Bị từ chối",
    borderClass: "border-l-destructive!",
  },
  COMPLETED: {
    color: "success",
    label: "Hoàn thành",
    borderClass: "border-l-primary!",
  },
}

"use client"

import { useRouter } from "next/navigation"
import { Button, Card, Popconfirm, Tag, Tooltip } from "antd"
import dayjs from "dayjs"
import {
  Calendar,
  ExternalLink,
  ImageIcon,
  MapPin,
  Pencil,
  Trash2,
} from "lucide-react"

import { ActionMenu, type ActionMenuItem } from "@/components/Common/ActionMenu"
import { projectQueries } from "@/hooks/server/projects"
import { getFileUrl } from "@/lib/imageUtils"
import { cn } from "@/lib/utils"
import {
  PROJECT_REGION_LABELS,
  PROJECT_SECTOR_LABELS,
  type ProjectResponse,
  type ProjectStatus,
} from "@/types"

const statusLabel: Record<ProjectStatus, string> = {
  PLANNING: "Lên kế hoạch",
  ACTIVE: "Đang triển khai",
  PAUSED: "Tạm dừng",
  COMPLETED: "Hoàn thành",
}

const statusDotClass: Record<ProjectStatus, string> = {
  PLANNING: "bg-muted-foreground/60",
  ACTIVE: "bg-primary",
  PAUSED: "bg-accent-foreground",
  COMPLETED: "bg-chart-2",
}

interface ProjectCardProps {
  project: ProjectResponse
}

const ProjectCard = ({ project }: ProjectCardProps) => {
  const router = useRouter()
  const deleteMutation = projectQueries.useDelete()

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(project.id)
    } catch {}
  }

  const items: ActionMenuItem<ProjectResponse>[] = [
    {
      key: "general_info",
      label: "Trang thông tin chung",
      icon: <ExternalLink className="size-4" />,
      hidden: (p) => !p.generalInfo,
      onClick: (p) => {
        if (p.generalInfo) {
          window.open(p.generalInfo, "_blank")
        }
      },
    },
    {
      key: "delete",
      label: "Xóa dự án",
      icon: <Trash2 className="size-4" />,
      danger: true,
      confirm: (p) => ({
        title: "Xóa dự án",
        content: `Bạn có chắc chắn muốn xóa dự án "${p.name}"?`,
        okText: "Xóa",
        okType: "danger",
      }),
      onClick: handleDelete,
    },
  ]

  const regionText = project.region
    ? PROJECT_REGION_LABELS[project.region] || project.region
    : null

  const sectorText = project.sector
    ? PROJECT_SECTOR_LABELS[project.sector] || project.sector
    : null

  const startDateText = project.startDate
    ? dayjs(project.startDate).format("DD/MM/YYYY")
    : "Chưa cập nhật"

  return (
    <Card className="overflow-hidden p-0 shadow-sm transition-shadow hover:shadow-md">
      <div className="relative aspect-video w-full overflow-hidden bg-muted">
        {project.thumbnail ? (
          <img
            src={getFileUrl(project.thumbnail)}
            alt={project.name}
            className="size-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <ImageIcon className="size-12 text-muted-foreground/40" />
          </div>
        )}
        {(regionText || sectorText) && (
          <div className="absolute top-2 left-2 flex flex-wrap gap-1 max-w-[calc(100%-48px)]">
            {regionText && (
              <Tag className="m-0 border-none font-medium backdrop-blur-sm bg-primary/90 text-primary-foreground">
                {regionText}
              </Tag>
            )}
            {sectorText && (
              <Tag className="m-0 border-none font-medium backdrop-blur-sm bg-slate-900/80 text-white dark:bg-slate-100/90 dark:text-slate-900">
                {sectorText}
              </Tag>
            )}
          </div>
        )}
        <ActionMenu
          record={project}
          items={items}
          triggerButtonClassName="absolute top-2 right-2 size-7 p-0! rounded-full bg-background/80 shadow-sm backdrop-blur"
        />
      </div>

      <div className="flex flex-col gap-3 p-4">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-2">
            <span className="truncate font-semibold text-base">
              {project.name}
            </span>
            <Tooltip title={`Trạng thái: ${statusLabel[project.status]}`}>
              <span className="flex items-center gap-1 shrink-0">
                <span
                  className={cn(
                    "size-2.5 rounded-full",
                    statusDotClass[project.status],
                  )}
                />
                <span className="text-base text-muted-foreground hidden sm:inline">
                  {statusLabel[project.status]}
                </span>
              </span>
            </Tooltip>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="size-3.5 shrink-0 text-muted-foreground/70" />
            <span className="truncate">
              {project.address || "Chưa có địa chỉ"}
            </span>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Calendar className="size-3.5 shrink-0 text-muted-foreground/70" />
            <span className="truncate">Khởi công: {startDateText}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            className="flex-1"
            onClick={() => router.push(`/projects/${project.id}/edit`)}
            icon={<Pencil className="size-4" />}
          >
            Chỉnh sửa
          </Button>
          <Popconfirm
            title="Xóa dự án"
            description={`Bạn có chắc chắn muốn xóa dự án "${project.name}"?`}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true, loading: deleteMutation.isPending }}
            onConfirm={handleDelete}
          >
            <Button
              danger
              icon={<Trash2 className="size-4" />}
              aria-label="Xóa dự án"
              loading={deleteMutation.isPending}
            />
          </Popconfirm>
        </div>
      </div>
    </Card>
  )
}

export default ProjectCard

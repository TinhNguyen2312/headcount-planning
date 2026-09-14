"use client"

import { useRouter } from "next/navigation"
import { Button, Popconfirm, Tabs, Tag, Tooltip } from "antd"
import dayjs from "dayjs"
import {
  Building2,
  Calendar,
  ExternalLink,
  MapPin,
  Pencil,
  Trash2,
} from "lucide-react"
import { useMemo, useState } from "react"

import {
  type ButtonConfig,
  CollectionView,
  SearchBar,
} from "@/components/Common/Management"
import AddProject from "@/components/Projects/AddProject"
import ProjectCard from "@/components/Projects/ProjectCard"
import SectorRegionManager from "@/components/Projects/SectorRegionManager"
import { projectQueries } from "@/hooks/server/projects"
import { regionQueries } from "@/hooks/server/regions"
import { sectorQueries } from "@/hooks/server/sectors"
import { useFilterState } from "@/hooks/useFilter"
import { useListPageState } from "@/hooks/useListPageState"
import ManagementPageLayout from "@/layout/ManagementPageLayout"
import { createSelectFilter } from "@/lib/filter"
import { getFileUrl } from "@/lib/imageUtils"
import { cn } from "@/lib/utils"
import {
  PROJECT_REGION_LABELS,
  PROJECT_REGION_OPTIONS,
  PROJECT_SECTOR_LABELS,
  PROJECT_SECTOR_OPTIONS,
  type ProjectRegion,
  type ProjectResponse,
  type ProjectSector,
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

export default function ProjectsPage() {
  const router = useRouter()
  const deleteMutation = projectQueries.useDelete()

  const [activeTab, setActiveTab] = useState<"projects" | "sectors_regions">(
    "projects",
  )

  const { data: dbSectors = [] } = sectorQueries.useList()
  const { data: dbRegions = [] } = regionQueries.useList()

  const {
    state: filterState,
    update: updateFilter,
    reset: resetFilters,
  } = useFilterState({
    region: "all" as ProjectRegion | "all",
    sector: "all" as ProjectSector | "all",
    status: "all" as ProjectStatus | "all",
  })

  const { page, setPage, limit, viewMode, queryParams, searchBarProps } =
    useListPageState({
      persistKey: "projects",
      initialLimit: 12,
      initialSort: { sort: { sortBy: "createdAt", order: "DESC" } },
      resetPageOn: filterState,
    })

  const listQuery = projectQueries.useSuspenseList({
    ...queryParams,
    region: filterState.region === "all" ? undefined : filterState.region,
    sector: filterState.sector === "all" ? undefined : filterState.sector,
    status: filterState.status === "all" ? undefined : filterState.status,
  })

  const projects = listQuery?.data ?? []
  const meta = listQuery?.meta

  const sectorOptions = useMemo(() => {
    if (dbSectors.length > 0) {
      return [
        { label: "Tất cả khu vực", value: "all" as const },
        ...dbSectors.map((s) => ({
          label: s.name,
          value: (s.code || s.name) as ProjectSector,
        })),
      ]
    }
    return [
      { label: "Tất cả khu vực", value: "all" as const },
      ...PROJECT_SECTOR_OPTIONS,
    ]
  }, [dbSectors])

  const regionOptions = useMemo(() => {
    if (dbRegions.length > 0) {
      return [
        { label: "Tất cả các vùng", value: "all" as const },
        ...dbRegions.map((r) => ({
          label: r.name,
          value: (r.code || r.name) as ProjectRegion,
        })),
      ]
    }
    return [
      { label: "Tất cả các vùng", value: "all" as const },
      ...PROJECT_REGION_OPTIONS,
    ]
  }, [dbRegions])

  const filters = useMemo(
    () => [
      createSelectFilter<ProjectResponse, ProjectRegion | "all">({
        key: "region",
        label: "Vùng",
        value: filterState.region,
        onChange: (v) => updateFilter("region", v),
        getField: (p) => p.region as ProjectRegion,
        options: regionOptions,
        width: 200,
      }),
      createSelectFilter<ProjectResponse, ProjectSector | "all">({
        key: "sector",
        label: "Khu vực",
        value: filterState.sector,
        onChange: (v) => updateFilter("sector", v),
        getField: (p) => p.sector as ProjectSector,
        options: sectorOptions,
        width: 170,
      }),
      createSelectFilter<ProjectResponse, ProjectStatus | "all">({
        key: "status",
        label: "Trạng thái",
        value: filterState.status,
        onChange: (v) => updateFilter("status", v),
        getField: (p) => p.status,
        options: [
          { label: "Tất cả trạng thái", value: "all" },
          { label: "Lên kế hoạch", value: "PLANNING" },
          { label: "Đang triển khai", value: "ACTIVE" },
          { label: "Tạm dừng", value: "PAUSED" },
          { label: "Hoàn thành", value: "COMPLETED" },
        ],
        width: 170,
      }),
    ],
    [filterState, updateFilter, regionOptions, sectorOptions],
  )

  const buttons: ButtonConfig<ProjectResponse>[] = [
    {
      render: (project) => (
        <Button
          icon={<Pencil className="size-3.5" />}
          onClick={() => router.push(`/projects/${project.id}/edit`)}
          size="small"
        >
          Chỉnh sửa
        </Button>
      ),
    },
    {
      render: (project) =>
        project.generalInfo ? (
          <Button
            icon={<ExternalLink className="size-3.5" />}
            onClick={() => window.open(project.generalInfo!, "_blank")}
            size="small"
            title="Trang thông tin chung"
          >
            Thông tin
          </Button>
        ) : null,
    },
    {
      render: (project) => (
        <Popconfirm
          title="Xóa dự án"
          description={`Bạn có chắc chắn muốn xóa dự án "${project.name}"?`}
          okText="Xóa"
          cancelText="Hủy"
          okButtonProps={{ danger: true, loading: deleteMutation.isPending }}
          onConfirm={async () => {
            try {
              await deleteMutation.mutateAsync(project.id)
            } catch {}
          }}
        >
          <Button
            danger
            icon={<Trash2 className="size-3.5" />}
            aria-label="Xóa dự án"
            size="small"
            loading={deleteMutation.isPending}
          />
        </Popconfirm>
      ),
    },
  ]

  const renderProjectTitle = (project: ProjectResponse) => {
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
      <div className="flex flex-col gap-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-base text-foreground truncate">
            {project.name}
          </span>
          {regionText && (
            <Tag className="m-0 border-none text-base bg-primary/10 text-primary font-medium">
              {regionText}
            </Tag>
          )}
          {sectorText && (
            <Tag className="m-0 border-none text-base bg-secondary text-secondary-foreground font-medium">
              {sectorText}
            </Tag>
          )}
          <Tooltip title={`Trạng thái: ${statusLabel[project.status]}`}>
            <span className="flex items-center gap-1 shrink-0">
              <span
                className={cn(
                  "size-2 rounded-full",
                  statusDotClass[project.status],
                )}
              />
              <span className="text-base text-muted-foreground">
                {statusLabel[project.status]}
              </span>
            </span>
          </Tooltip>
        </div>

        <div className="flex items-center gap-4 text-base text-muted-foreground flex-wrap">
          <span className="flex items-center gap-1">
            <MapPin className="size-3 shrink-0" />
            <span className="truncate">
              {project.address || "Chưa có địa chỉ"}
            </span>
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="size-3 shrink-0" />
            <span>Khởi công: {startDateText}</span>
          </span>
        </div>
      </div>
    )
  }

  const tabItems = [
    {
      key: "projects",
      icon: <Building2 className="size-4" />,
      label: "Dự án",
      children: (
        <div className="flex flex-col gap-4">
          <SearchBar
            {...searchBarProps}
            searchPlaceholder="Tìm kiếm dự án theo tên..."
            filters={filters}
            onResetFilters={resetFilters}
          />

          <CollectionView<ProjectResponse>
            viewMode={viewMode}
            items={projects}
            renderCustomCard={(project) => <ProjectCard project={project} />}
            buttons={buttons}
            renderTitle={renderProjectTitle}
            emptyDescription="Không tìm thấy dự án"
            emptyHelperText="Thử thay đổi từ khóa tìm kiếm hoặc bỏ bớt các bộ lọc đang áp dụng."
            pagination={{
              page,
              total: meta?.totalElements ?? projects.length,
              pageSize: meta?.size ?? limit,
              onChange: setPage,
              itemLabel: "dự án",
            }}
            getImageSrc={(x) => getFileUrl(x.thumbnail)}
          />
        </div>
      ),
    },
    {
      key: "sectors_regions",
      icon: <MapPin className="size-4" />,
      label: "Khu vực & Vùng",
      children: (
        <div className="pt-2">
          <SectorRegionManager />
        </div>
      ),
    },
  ]

  return (
    <ManagementPageLayout
      title="Quản lý Dự án, Khu vực & Vùng"
      headerActions={activeTab === "projects" ? <AddProject /> : null}
    >
      <Tabs
        activeKey={activeTab}
        onChange={(k) => setActiveTab(k as "projects" | "sectors_regions")}
        items={tabItems}
        tabBarGutter={24}
        className="w-full"
      />
    </ManagementPageLayout>
  )
}

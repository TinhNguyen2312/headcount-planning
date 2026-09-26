import {
  Button,
  Card,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
} from "antd"
import type { ColumnsType } from "antd/es/table"
import dayjs from "dayjs"
import { AlertCircle, Clock, Database, RefreshCw, RotateCw } from "lucide-react"
import { useState } from "react"
import PageHeader from "@/components/Common/PageHeader"
import {
  accQueries,
  useTriggerAllSync,
  useTriggerRfiSync,
  useTriggerScheduleSync,
  useTriggerSubmittalSync,
} from "@/hooks/server/acc"
import type { SourceSystem, SyncLogResponse, SyncStatus } from "@/types"

type AccFilter = {
  sourceSystem: SourceSystem
  status: SyncStatus
  page: number
  limit: number
}

interface AccPageProps {
  embedded?: boolean
}

export default function AccPage({ embedded = false }: AccPageProps = {}) {
  const [filter, setFilter] = useState<AccFilter>({
    sourceSystem: "",
    status: "SUCCESS",
    page: 1,
    limit: 10,
  })
  const [detailModalLog, setDetailModalLog] = useState<SyncLogResponse | null>(
    null,
  )
  const handleUpdateFilter = (value: Partial<AccFilter>) => {
    setFilter((prev) => ({
      ...prev,
      ...value,
    }))
  }
  // Sync Mutations
  const triggerSubmittalMutation = useTriggerSubmittalSync()
  const triggerRfiMutation = useTriggerRfiSync()
  const triggerScheduleMutation = useTriggerScheduleSync()
  const triggerAllMutation = useTriggerAllSync()

  const isAnySyncing =
    triggerSubmittalMutation.isPending ||
    triggerRfiMutation.isPending ||
    triggerScheduleMutation.isPending ||
    triggerAllMutation.isPending

  const syncActions = [
    {
      key: "submittal",
      label: "Đồng bộ Submittals",
      title: "Đồng bộ hồ sơ Submittals từ ACC",
      description:
        "Hệ thống sẽ quét các dự án có liên kết với ACC và sinh thẻ việc từ Submittals.",
      type: "default" as const,
      iconColor: "text-blue-500",
      mutation: triggerSubmittalMutation,
    },
    {
      key: "rfi",
      label: "Đồng bộ RFIs",
      title: "Đồng bộ RFIs từ ACC",
      description:
        "Hệ thống sẽ quét các dự án có liên kết với ACC và sinh thẻ việc từ RFIs.",
      type: "default" as const,
      iconColor: "text-amber-500",
      mutation: triggerRfiMutation,
    },
    {
      key: "schedule",
      label: "Đồng bộ Schedule",
      title: "Đồng bộ Schedule từ ACC",
      description:
        "Hệ thống sẽ quét các dự án có liên kết với ACC và sinh thẻ việc từ Schedule.",
      type: "default" as const,
      iconColor: "text-amber-500",
      mutation: triggerScheduleMutation,
    },
    {
      key: "all",
      label: "Đồng bộ tất cả",
      title: "Đồng bộ toàn bộ dữ liệu ACC",
      description:
        "Hệ thống sẽ quét các dự án có liên kết với ACC và sinh thẻ việc từ Submittals và RFIs.",
      type: "primary" as const,
      iconColor: "",
      mutation: triggerAllMutation,
    },
  ]

  // Sync Logs Query
  const {
    data: logs = [],
    meta,
    isLoading,
    isFetching,
    refetch,
  } = accQueries.useSyncLogs({
    ...filter,
    sortBy: "startedAt",
    order: "DESC",
  })

  const total = meta?.totalElements

  const renderStatusTag = (status: SyncStatus) => {
    switch (status) {
      case "SUCCESS":
        return <Tag color="success">Thành công</Tag>
      case "FAILED":
        return <Tag color="error">Thất bại</Tag>
      case "RUNNING":
        return (
          <Tag color="processing" className="flex items-center gap-1 w-fit">
            <RefreshCw className="size-3 animate-spin" />
            Đang chạy
          </Tag>
        )
      case "PARTIAL":
        return <Tag color="warning">Một phần</Tag>
      default:
        return <Tag>{status}</Tag>
    }
  }

  const renderSourceTag = (source: string) => {
    const s = source?.toUpperCase()
    if (s === "SUBMITTAL" || s?.includes("SUBMITTAL")) {
      return <Tag color="blue">Submittals</Tag>
    }
    if (s === "SCHEDULE" || s?.includes("SCHEDULE")) {
      return <Tag color="blue">Schedules</Tag>
    }
    if (s === "RFI" || s?.includes("RFI")) {
      return <Tag color="orange">RFIs</Tag>
    }
    if (s === "ALL" || s?.includes("ALL")) {
      return <Tag color="purple">Toàn bộ (All)</Tag>
    }
    return <Tag color="geekblue">{source || "—"}</Tag>
  }

  const columns: ColumnsType<SyncLogResponse> = [
    {
      title: "Nguồn trên ACC",
      dataIndex: "sourceSystem",
      key: "sourceSystem",
      width: 140,
      render: (source: string) => renderSourceTag(source),
    },
    {
      title: "Hình thức",
      dataIndex: "triggerType",
      key: "triggerType",
      width: 130,
      render: (type: string) =>
        type === "MANUAL" ? (
          <Tag color="default">Thủ công</Tag>
        ) : (
          <Tag color="cyan">Tự động</Tag>
        ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 130,
      render: (status: SyncStatus) => renderStatusTag(status),
    },
    {
      title: "Số lượng tạo",
      dataIndex: "recordsCreated",
      key: "recordsCreated",
      width: 110,
      align: "center",
      render: (count: number | null | undefined) =>
        count !== null && count !== undefined ? (
          <span className="font-semibold text-foreground">{count}</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      title: "Số lượng update",
      dataIndex: "recordsUpdated",
      key: "recordsUpdated",
      width: 110,
      align: "center",
      render: (count: number | null | undefined) =>
        count !== null && count !== undefined ? (
          <span className="font-semibold text-foreground">{count}</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      title: "Bắt đầu lúc",
      dataIndex: "startedAt",
      key: "startedAt",
      width: 170,
      render: (date: string) =>
        date ? (
          <span className="text-base text-foreground">
            {dayjs(date).format("DD/MM/YYYY HH:mm:ss")}
          </span>
        ) : (
          "—"
        ),
    },
    {
      title: "Thời lượng",
      dataIndex: "durationSeconds",
      key: "durationSeconds",
      width: 110,
      render: (seconds: number | null | undefined) =>
        seconds !== null && seconds !== undefined ? (
          <span className="flex items-center gap-1 text-base text-muted-foreground">
            <Clock className="size-3.5" />
            {seconds}s
          </span>
        ) : (
          "—"
        ),
    },
    {
      title: "Chi tiết",
      key: "action",
      width: 120,
      render: (_, record) =>
        record.errorDetail ? (
          <Button
            type="link"
            danger
            size="small"
            className="p-0 text-xs flex items-center gap-1"
            onClick={() => setDetailModalLog(record)}
          >
            <AlertCircle className="size-3.5" />
            Xem lỗi
          </Button>
        ) : (
          <span className="text-muted-foreground" />
        ),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      {!embedded && (
        <PageHeader
          title={
            <div className="flex items-center gap-2.5">
              <Database className="size-6 text-primary" />
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Đồng bộ Autodesk Construction Cloud
              </h1>
            </div>
          }
          subtitle="Quản lý và đồng bộ dữ liệu Submittals, RFIs và Schedule từ ACC về hệ thống  ."
          className="border-b border-border pb-4"
        />
      )}
      <div className="flex flex-wrap items-center gap-3">
        {syncActions.map(
          ({ key, label, title, description, type, iconColor, mutation }) => (
            <Popconfirm
              key={key}
              title={title}
              description={description}
              okText="Đồng bộ ngay"
              cancelText="Hủy"
              okButtonProps={{ loading: mutation.isPending }}
              onConfirm={() => mutation.mutate()}
              disabled={isAnySyncing}
            >
              <Button
                type={type}
                icon={
                  <RefreshCw
                    className={`size-4 ${
                      mutation.isPending
                        ? `animate-spin ${iconColor}`.trim()
                        : ""
                    }`}
                  />
                }
                loading={mutation.isPending}
                disabled={isAnySyncing && !mutation.isPending}
              >
                {label}
              </Button>
            </Popconfirm>
          ),
        )}
      </div>

      <Card
        className="border border-border shadow-xs"
        title={
          <div className="flex items-center justify-between py-1">
            <div className="flex items-center gap-2 font-semibold text-base">
              <Clock className="size-4 text-primary" />
              <span>Nhật ký đồng bộ</span>
            </div>
            <Space>
              <Select<SourceSystem>
                placeholder="Lọc theo nguồn"
                allowClear
                className="w-50"
                value={filter.sourceSystem}
                onChange={(val) => {
                  handleUpdateFilter({ sourceSystem: val, page: 1 })
                }}
                options={[
                  { label: "Submittals", value: "ACC_SUBMITTAL" },
                  { label: "RFIs", value: "ACC_RFI" },
                  { label: "Schedules", value: "ACC_SCHEDULE" },
                  { label: "Toàn bộ", value: "" },
                ]}
              />

              <Select<SyncStatus>
                placeholder="Lọc trạng thái"
                allowClear
                className="w-36"
                value={filter.status}
                onChange={(val) => {
                  handleUpdateFilter({ status: val, page: 1 })
                }}
                options={[
                  { label: "Tất cả trạng thái", value: "" },
                  { label: "Thành công", value: "SUCCESS" },
                  { label: "Thất bại", value: "FAILED" },
                  { label: "Đang chạy", value: "RUNNING" },
                  { label: "Một phần", value: "PARTIAL" },
                ]}
              />
              <Tooltip title="Làm mới nhật ký">
                <Button
                  icon={
                    <RotateCw
                      className={`size-3.5 ${isFetching ? "animate-spin" : ""}`}
                    />
                  }
                  onClick={() => refetch()}
                />
              </Tooltip>
            </Space>
          </div>
        }
      >
        <Table<SyncLogResponse>
          rowKey="id"
          columns={columns}
          dataSource={logs}
          loading={isLoading}
          pagination={{
            current: filter.page,
            pageSize: filter.limit,
            total,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50"],
            onChange: (p, ps) => handleUpdateFilter({ page: p, limit: ps }),
            showTotal: () => ``,
          }}
          scroll={{ x: 900 }}
        />
      </Card>

      <Modal
        title={
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="size-5" />
            <span>Chi tiết lỗi của #{detailModalLog?.id}</span>
          </div>
        }
        open={!!detailModalLog}
        onOk={() => setDetailModalLog(null)}
        onCancel={() => setDetailModalLog(null)}
        cancelButtonProps={{ style: { display: "none" } }}
        okText="Đóng"
      >
        <div className="flex flex-col gap-3 py-2">
          <div className="text-base">
            <span className="font-semibold text-foreground">Nguồn: </span>
            {detailModalLog?.sourceSystem}
          </div>
          <div className="text-base">
            <span className="font-semibold text-foreground">Thời gian: </span>
            {detailModalLog?.startedAt
              ? dayjs(detailModalLog.startedAt).format("DD/MM/YYYY HH:mm:ss")
              : "—"}
          </div>
          <div className="flex flex-col gap-1.5 mt-2">
            <span className="text-base font-semibold text-foreground">
              Lỗi chi tiết:
            </span>
            <pre className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-xs font-mono whitespace-pre-wrap overflow-auto max-h-64">
              {detailModalLog?.errorDetail ||
                "Không có thông tin chi tiết lỗi."}
            </pre>
          </div>
        </div>
      </Modal>
    </div>
  )
}

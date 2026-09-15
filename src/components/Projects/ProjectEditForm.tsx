"use client"

import {
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  Popconfirm,
  Select,
  Space,
} from "antd"
import dayjs, { type Dayjs } from "dayjs"
import { ExternalLink, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

import UnsavedChangesModal from "@/components/Common/UnsavedChangesModal"
import { projectQueries } from "@/hooks/server/projects"
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges"
import {
  PROJECT_REGION_OPTIONS,
  PROJECT_SECTOR_OPTIONS,
  type ProjectRegion,
  type ProjectResponse,
  type ProjectSector,
  type ProjectStatus,
} from "@/types"

const statusOptions: { value: ProjectStatus; label: string }[] = [
  { value: "PLANNING", label: "Lên kế hoạch" },
  { value: "ACTIVE", label: "Đang triển khai" },
  { value: "PAUSED", label: "Tạm dừng" },
  { value: "COMPLETED", label: "Hoàn thành" },
]

export interface ProjectEditFormValues {
  name: string
  address?: string
  generalInfo?: string
  region?: ProjectRegion
  sector?: ProjectSector
  status: ProjectStatus
  startDate?: Dayjs | null
  endDate?: Dayjs | null
  accProjectId?: string | null
}

const getProjectFormValues = (p: ProjectResponse): ProjectEditFormValues => ({
  name: p.name ?? "",
  address: p.address ?? "",
  generalInfo: p.generalInfo ?? "",
  region: p.region ?? undefined,
  sector: p.sector ?? undefined,
  status: p.status,
  startDate: p.startDate ? dayjs(p.startDate) : null,
  endDate: p.endDate ? dayjs(p.endDate) : null,
  accProjectId: p.accProjectId ?? null,
})

const isValidHttpUrl = (url?: string | null): boolean => {
  if (!url || typeof url !== "string") return false
  const trimmed = url.trim()
  if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
    return false
  }
  try {
    const parsed = new URL(trimmed)
    return parsed.protocol === "http:" || parsed.protocol === "https:"
  } catch {
    return false
  }
}

const getAccProjectUrl = (id?: string | null): string => {
  if (!id || typeof id !== "string") return ""
  const trimmed = id.trim()
  if (!trimmed) return ""
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed
  }
  return `https://acc.autodesk.com/projects/${trimmed}`
}

interface ProjectEditFormProps {
  project: ProjectResponse
  viewOnly: boolean
}

const ProjectEditForm = ({ project, viewOnly }: ProjectEditFormProps) => {
  const router = useRouter()
  const mutation = projectQueries.useUpdate()
  const deleteMutation = projectQueries.useDelete()
  const [form] = Form.useForm<ProjectEditFormValues>()
  Form.useWatch([], form)
  const watchedGeneralInfo = Form.useWatch("generalInfo", form)

  const currentGeneralInfo =
    watchedGeneralInfo !== undefined ? watchedGeneralInfo : project.generalInfo
  const isGeneralInfoLinkValid = isValidHttpUrl(currentGeneralInfo)

  const watchedAccProjectId = Form.useWatch("accProjectId", form)
  const currentAccProjectId =
    watchedAccProjectId !== undefined
      ? watchedAccProjectId
      : project.accProjectId
  const isAccProjectValid = Boolean(currentAccProjectId?.trim())
  const accProjectUrl = getAccProjectUrl(currentAccProjectId)

  const { showWarning, confirmLeave, cancelLeave, markClean, setSnapshot } =
    useUnsavedChanges<ProjectEditFormValues>({
      getCurrentValue: () => {
        const values = form.getFieldsValue(true)
        return {
          name: values.name ?? "",
          address: values.address ?? "",
          generalInfo: values.generalInfo ?? "",
          region: values.region ?? undefined,
          sector: values.sector ?? undefined,
          status: values.status,
          startDate: values.startDate ?? null,
          endDate: values.endDate ?? null,
          accProjectId: values.accProjectId ?? null,
        }
      },
    })

  useEffect(() => {
    const initial = getProjectFormValues(project)
    form.setFieldsValue(initial)
    setSnapshot(initial)
  }, [project, form, setSnapshot])

  const onSubmit = (values: ProjectEditFormValues) => {
    if (viewOnly) return
    mutation.mutate(
      {
        id: project.id,
        data: {
          name: values.name.trim(),
          address: values.address?.trim() || null,
          generalInfo: values.generalInfo?.trim() || null,
          region: values.region || null,
          sector: values.sector || null,
          status: values.status,
          startDate: values.startDate
            ? values.startDate.format("YYYY-MM-DD")
            : null,
          endDate: values.endDate ? values.endDate.format("YYYY-MM-DD") : null,
          thumbnail: project.thumbnail || undefined,
          accProjectId: values.accProjectId?.trim() || null,
        },
      },
      {
        onSuccess: () => {
          markClean()
        },
      },
    )
  }

  return (
    <Card title="Thông tin dự án" className="flex-1!">
      <Form
        form={form}
        layout="vertical"
        onFinish={onSubmit}
        className="flex flex-col gap-1"
        initialValues={getProjectFormValues(project)}
        // disabled={viewOnly}
      >
        <Form.Item
          label="Tên Dự án"
          name="name"
          className="mb-0"
          rules={[
            { required: true, message: "Vui lòng nhập tên dự án" },
            { whitespace: true, message: "Vui lòng nhập tên dự án" },
            {
              validator(_, value) {
                if (value && value.trim().length < 2) {
                  return Promise.reject(
                    new Error("Tên dự án tối thiểu 2 ký tự"),
                  )
                }
                return Promise.resolve()
              },
            },
          ]}
        >
          <Input placeholder="Tên dự án" readOnly={viewOnly} />
        </Form.Item>

        <Form.Item label="Địa chỉ" name="address" className="mb-0">
          <Input placeholder="Địa chỉ" readOnly={viewOnly} />
        </Form.Item>

        <Form.Item
          label="Trang thông tin chung (Link)"
          name="generalInfo"
          className="mb-0"
          rules={[
            {
              validator(_, value) {
                if (!value || isValidHttpUrl(value)) {
                  return Promise.resolve()
                }
                return Promise.reject(
                  new Error(
                    "Đường dẫn không hợp lệ. Vui lòng nhập link bắt đầu bằng http:// hoặc https://",
                  ),
                )
              },
            },
          ]}
        >
          <Space.Compact style={{ width: "100%" }}>
            <Input
              placeholder="https://..."
              value={currentGeneralInfo ?? undefined}
              readOnly={viewOnly}
            />
            <Button
              type="default"
              icon={<ExternalLink className="size-3.5" />}
              disabled={!isGeneralInfoLinkValid}
              onClick={() => {
                if (currentGeneralInfo && isGeneralInfoLinkValid) {
                  window.open(currentGeneralInfo, "_blank")
                }
              }}
              title={
                isGeneralInfoLinkValid
                  ? "Mở liên kết trong tab mới"
                  : "Nhập đường dẫn hợp lệ để mở liên kết"
              }
            />
          </Space.Compact>
        </Form.Item>

        <Form.Item
          label="Mã dự án ACC (accProjectId)"
          name="accProjectId"
          className="mb-0"
        >
          <Space.Compact style={{ width: "100%" }}>
            <Input
              placeholder="Nhập mã dự án ACC (accProjectId)"
              value={currentAccProjectId ?? undefined}
              onChange={(e) =>
                form.setFieldValue("accProjectId", e.target.value)
              }
              readOnly={viewOnly}
              allowClear={!viewOnly}
            />
            <Button
              type="default"
              icon={<ExternalLink className="size-3.5" />}
              disabled={!isAccProjectValid}
              onClick={() => {
                if (currentAccProjectId && isAccProjectValid) {
                  window.open(accProjectUrl, "_blank")
                }
              }}
              title={
                isAccProjectValid
                  ? "Mở dự án trên Autodesk Construction Cloud"
                  : "Nhập mã dự án ACC để mở liên kết"
              }
            />
          </Space.Compact>
        </Form.Item>

        {/* <ProjectAdminSelect
          projectId={project.id}
          project={project}
          disabled={viewOnly}
        /> */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:max-w-full">
          <Form.Item label="Vùng" name="region" className="mb-0">
            <Select
              options={PROJECT_REGION_OPTIONS}
              placeholder="Chọn vùng miền"
              allowClear
              className={`w-full ${viewOnly ? "pointer-events-none" : ""}`}
            />
          </Form.Item>

          <Form.Item label="Khu vực" name="sector" className="mb-0">
            <Select
              className={`w-full ${viewOnly ? "pointer-events-none" : ""}`}
              options={PROJECT_SECTOR_OPTIONS}
              placeholder="Chọn khu vực"
              allowClear
            />
          </Form.Item>
          <Form.Item label="Trạng thái" name="status" className="mb-0">
            <Select
              className={`w-full ${viewOnly ? "pointer-events-none" : ""}`}
              options={statusOptions}
            />
          </Form.Item>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:max-w-md">
          <Form.Item label="Ngày bắt đầu" name="startDate" className="mb-0">
            <DatePicker
              format="DD/MM/YYYY"
              placeholder="DD/MM/YYYY"
              className={`w-full ${viewOnly ? "pointer-events-none" : ""}`}
            />
          </Form.Item>

          <Form.Item
            label="Ngày kết thúc"
            name="endDate"
            className="mb-0"
            dependencies={["startDate"]}
            rules={[
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const startDate = getFieldValue("startDate")
                  if (
                    !value ||
                    !startDate ||
                    !value.isBefore(startDate, "day")
                  ) {
                    return Promise.resolve()
                  }
                  return Promise.reject(
                    new Error("Ngày kết thúc phải sau hoặc bằng ngày bắt đầu"),
                  )
                },
              }),
            ]}
          >
            <DatePicker
              format="DD/MM/YYYY"
              placeholder="DD/MM/YYYY"
              className={`w-full ${viewOnly ? "pointer-events-none" : ""}`}
            />
          </Form.Item>
        </div>

        <div className="flex items-center justify-between pt-2">
          <Button
            type="primary"
            htmlType="submit"
            loading={mutation.isPending}
            disabled={viewOnly}
          >
            Lưu thay đổi
          </Button>

          <Popconfirm
            title="Xóa dự án"
            description={`Bạn có chắc chắn muốn xóa dự án "${project.name}"? Thao tác này không thể hoàn tác.`}
            okText="Xóa dự án"
            cancelText="Hủy"
            okButtonProps={{ danger: true, loading: deleteMutation.isPending }}
            onConfirm={async () => {
              try {
                await deleteMutation.mutateAsync(project.id)
                markClean()
                router.push("/projects")
              } catch {
                // Handled in mutation onError
              }
            }}
          >
            <Button
              danger
              type="dashed"
              icon={<Trash2 className="size-4" />}
              loading={deleteMutation.isPending}
              disabled={viewOnly}
            >
              Xóa dự án
            </Button>
          </Popconfirm>
        </div>
      </Form>

      <UnsavedChangesModal
        open={showWarning}
        onConfirm={confirmLeave}
        onCancel={cancelLeave}
      />
    </Card>
  )
}

export default ProjectEditForm

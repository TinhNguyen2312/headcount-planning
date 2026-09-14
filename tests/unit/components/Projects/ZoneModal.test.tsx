import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import ZoneModal from "@/components/Projects/ZoneModal"
import { projectQueries } from "@/hooks/server/projects"
import type { ZoneResponse } from "@/types"

vi.mock("@/hooks/server/projects", () => ({
  projectQueries: {
    useCreateZone: vi.fn(),
    useUpdateZone: vi.fn(),
  },
}))

const mockZone: ZoneResponse = {
  id: 101,
  projectId: 1,
  name: "Phân khu 1",
  code: "PK1",
  startTime: "09:00:00",
  endTime: "18:00:00",
  createdBy: 1,
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
}

const mockCreateMutation = {
  mutateAsync: vi.fn().mockResolvedValue({}),
  isPending: false,
}

const mockUpdateMutation = {
  mutateAsync: vi.fn().mockResolvedValue({}),
  isPending: false,
}

describe("ZoneModal Component", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(projectQueries.useCreateZone).mockReturnValue(
      mockCreateMutation as any,
    )
    vi.mocked(projectQueries.useUpdateZone).mockReturnValue(
      mockUpdateMutation as any,
    )
  })

  it("renders Add Zone modal and submits with default time range", async () => {
    const onCancel = vi.fn()
    render(<ZoneModal projectId={1} open={true} onCancel={onCancel} />)

    expect(screen.getByText("Thêm khu vực")).toBeTruthy()
    const nameInput = screen.getByPlaceholderText("ví dụ: Phân khu A, Tòa HH01")
    fireEvent.change(nameInput, { target: { value: "Khu vực mới" } })

    const submitBtn = screen.getByRole("button", { name: "Lưu" })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(mockCreateMutation.mutateAsync).toHaveBeenCalledTimes(1)
      const payload = mockCreateMutation.mutateAsync.mock.calls[0][0]
      expect(payload.name).toBe("Khu vực mới")
      expect(payload.startTime).toBe("08:30:00")
      expect(payload.endTime).toBe("17:30:00")
      expect(onCancel).toHaveBeenCalledTimes(1)
    })
  })

  it("renders Edit Zone modal with zone initial time range and submits updated data", async () => {
    const onCancel = vi.fn()
    render(
      <ZoneModal
        projectId={1}
        zone={mockZone}
        open={true}
        onCancel={onCancel}
      />,
    )

    expect(screen.getByText("Sửa khu vực")).toBeTruthy()
    expect(screen.getByDisplayValue("Phân khu 1")).toBeTruthy()
    expect(screen.getByDisplayValue("PK1")).toBeTruthy()

    const submitBtn = screen.getByRole("button", { name: "Lưu" })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(mockUpdateMutation.mutateAsync).toHaveBeenCalledTimes(1)
      const payload = mockUpdateMutation.mutateAsync.mock.calls[0][0]
      expect(payload.id).toBe(101)
      expect(payload.data.name).toBe("Phân khu 1")
      expect(payload.data.code).toBe("PK1")
      expect(payload.data.startTime).toBe("09:00:00")
      expect(payload.data.endTime).toBe("18:00:00")
      expect(onCancel).toHaveBeenCalledTimes(1)
    })
  })

  it("calls onCancel when clicking Hủy button", () => {
    const onCancel = vi.fn()
    render(<ZoneModal projectId={1} open={true} onCancel={onCancel} />)

    const cancelButton = screen.getByRole("button", { name: "Hủy" })
    fireEvent.click(cancelButton)

    expect(onCancel).toHaveBeenCalledTimes(1)
  })
})

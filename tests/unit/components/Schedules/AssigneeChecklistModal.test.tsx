import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import AssigneeChecklistModal from "@/components/Schedules/AssigneeChecklistModal"
import type { AvailableUserResponse, ChecklistResponse } from "@/types"

describe("AssigneeChecklistModal Component", () => {
  const mockCandidates: AvailableUserResponse[] = [
    {
      id: 1,
      userId: 1,
      fullName: "Nguyễn Văn A",
      phone: "0901234567",
      roleName: "Kỹ sư ATLĐ",
    },
    {
      id: 2,
      userId: 2,
      fullName: "Trần Văn B",
      phone: "0907654321",
      roleName: "Kỹ sư ATLĐ",
    },
  ]

  const mockChecklists: ChecklistResponse[] = [
    {
      id: 10,
      code: "CL-01",
      name: "Checklist An Toàn Lao Động",
      taskItemId: 101,
      createdAt: "",
    },
    {
      id: 20,
      code: "CL-02",
      name: "Checklist Vệ Sinh Môi Trường",
      taskItemId: 101,
      createdAt: "",
    },
  ]

  it("renders candidates and displays task summary info", () => {
    render(
      <AssigneeChecklistModal
        open={true}
        taskTitle="Kiểm tra an toàn định kỳ"
        zoneName="Phân khu 1"
        weekdayLabel="Thứ 2"
        date="2026-09-08"
        candidates={mockCandidates}
        checklists={mockChecklists}
        initialAssignedUsers={[]}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    )

    expect(screen.getByText("Kiểm tra an toàn định kỳ")).toBeTruthy()
    expect(screen.getByText("Phân khu 1")).toBeTruthy()
    expect(screen.getByText("Nguyễn Văn A")).toBeTruthy()
    expect(screen.getByText("Trần Văn B")).toBeTruthy()
  })

  it("allows selecting candidates and confirms assigned users with their selected checklist", () => {
    const handleConfirm = vi.fn()
    render(
      <AssigneeChecklistModal
        open={true}
        taskTitle="Kiểm tra an toàn định kỳ"
        zoneName="Phân khu 1"
        weekdayLabel="Thứ 2"
        date="2026-09-08"
        candidates={mockCandidates}
        checklists={mockChecklists}
        initialAssignedUsers={[]}
        onConfirm={handleConfirm}
        onCancel={vi.fn()}
      />,
    )

    const checkboxes = screen.getAllByRole("checkbox")
    // Select first candidate
    fireEvent.click(checkboxes[0])

    const confirmBtn = screen.getByRole("button", {
      name: /Xác nhận phân công/i,
    })
    fireEvent.click(confirmBtn)

    expect(handleConfirm).toHaveBeenCalledTimes(1)
    const assigned = handleConfirm.mock.calls[0][0]
    expect(assigned).toHaveLength(1)
    expect(assigned[0].id).toBe(1)
    expect(assigned[0].name).toBe("Nguyễn Văn A")
  })

  it("renders fixed checklist tag when task has exactly 1 checklist", () => {
    render(
      <AssigneeChecklistModal
        open={true}
        taskTitle="Kiểm tra an toàn định kỳ"
        zoneName="Phân khu 1"
        weekdayLabel="Thứ 2"
        date="2026-09-08"
        candidates={mockCandidates}
        checklists={[mockChecklists[0]]}
        initialAssignedUsers={[{ id: 1, name: "Nguyễn Văn A" }]}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    )

    expect(screen.getByText("Checklist An Toàn Lao Động")).toBeTruthy()
  })
})

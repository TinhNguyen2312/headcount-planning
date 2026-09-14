import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import ScheduleWeekControls from "@/components/Schedules/ScheduleWeekControls"

describe("ScheduleWeekControls", () => {
  const weekStart = new Date("2026-08-24T00:00:00Z")
  const nextWeekStart = new Date("2026-08-31T00:00:00Z")

  it("triggers onGenerateWeek when clicking Tạo công việc and confirming popconfirm", async () => {
    const onGenerateWeek = vi.fn()
    render(
      <ScheduleWeekControls
        isDirty={false}
        isSaving={false}
        onSave={vi.fn()}
        weekStart={weekStart}
        nextWeekStart={nextWeekStart}
        isCopying={false}
        onCopyNextWeek={vi.fn()}
        onShiftWeek={vi.fn()}
        onGoThisWeek={vi.fn()}
        isGenerating={false}
        onGenerateWeek={onGenerateWeek}
      />,
    )

    const generateBtn = screen.getByRole("button", { name: /Tạo công việc/i })
    expect(generateBtn).toBeTruthy()
    expect(generateBtn.getAttribute("disabled")).toBeNull()

    fireEvent.click(generateBtn)

    await waitFor(() => {
      expect(screen.getByText("Tạo công việc cho tuần này?")).toBeTruthy()
    })

    const okBtn = screen.getAllByRole("button", { name: "Tạo công việc" })[1]
    fireEvent.click(okBtn)

    expect(onGenerateWeek).toHaveBeenCalledTimes(1)
  })

  it("disables Tạo công việc when form is dirty", () => {
    const onGenerateWeek = vi.fn()
    render(
      <ScheduleWeekControls
        isDirty={true}
        isSaving={false}
        onSave={vi.fn()}
        weekStart={weekStart}
        nextWeekStart={nextWeekStart}
        isCopying={false}
        onCopyNextWeek={vi.fn()}
        onShiftWeek={vi.fn()}
        onGoThisWeek={vi.fn()}
        isGenerating={false}
        onGenerateWeek={onGenerateWeek}
      />,
    )

    const generateBtn = screen.getByRole("button", { name: /Tạo công việc/i })
    expect(generateBtn.hasAttribute("disabled")).toBe(true)
  })
})

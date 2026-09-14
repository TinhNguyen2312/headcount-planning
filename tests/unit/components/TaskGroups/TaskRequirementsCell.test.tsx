import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import TaskRequirementsCell from "@/components/TaskGroups/TaskRequirementsCell"
import type { BusinessMatrixResponse } from "@/types"

describe("TaskRequirementsCell", () => {
  it("renders dash when requirementType is null/empty", () => {
    const node: BusinessMatrixResponse = {
      id: 1,
      title: "Task without requirement",
      orderIndex: 0,
      requirementType: null,
    }
    render(<TaskRequirementsCell node={node} />)
    expect(screen.getByText("—")).toBeTruthy()
  })

  it("renders requirement type tag, label and required badge when set", () => {
    const node: BusinessMatrixResponse = {
      id: 2,
      title: "Task with requirement",
      orderIndex: 1,
      requirementType: "IMAGE",
      label: "Ảnh hiện trường",
      isRequired: true,
      minCount: 3,
    }
    render(<TaskRequirementsCell node={node} />)
    expect(screen.getByText("Hình ảnh")).toBeTruthy()
    expect(screen.getByText("(Ảnh hiện trường)")).toBeTruthy()
    expect(screen.getByText("Bắt buộc (≥3)")).toBeTruthy()
  })
})

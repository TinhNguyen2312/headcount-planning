import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { ProjectRoleSelectionModal } from "@/components/Common/ProjectRoleSelectionModal"

describe("ProjectRoleSelectionModal", () => {
  it("shows the project step and calls onSelectProject when a project is picked", () => {
    const onSelectProject = vi.fn()
    render(
      <ProjectRoleSelectionModal
        step="project"
        projectChoices={[
          { id: 1, name: "Project A" },
          { id: 2, name: "Project B" },
        ]}
        roleChoices={[]}
        onSelectProject={onSelectProject}
        onSelectRole={vi.fn()}
      />,
    )

    expect(screen.getByText("Chọn dự án làm việc")).toBeTruthy()
    fireEvent.click(screen.getByText("Project A"))

    expect(onSelectProject).toHaveBeenCalledWith(1)
  })

  it("shows the role step and calls onSelectRole when a role is picked", () => {
    const onSelectRole = vi.fn()
    render(
      <ProjectRoleSelectionModal
        step="role"
        projectChoices={[]}
        roleChoices={[
          {
            id: 5,
            name: "Project C",
            roleId: 51,
            roleName: "Quản lý",
            projectRole: "PROJECT_ADMIN",
          },
          {
            id: 5,
            name: "Project C",
            roleId: 52,
            roleName: "Kỹ sư",
            projectRole: "TASK_EXECUTOR",
          },
        ]}
        onSelectProject={vi.fn()}
        onSelectRole={onSelectRole}
      />,
    )

    expect(screen.getByText("Chọn vai trò làm việc")).toBeTruthy()
    fireEvent.click(screen.getByText(/Kỹ sư/))

    expect(onSelectRole).toHaveBeenCalledWith(52)
  })
})

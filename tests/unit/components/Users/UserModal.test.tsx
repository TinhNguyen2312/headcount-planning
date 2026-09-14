import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import UserModal from "@/components/Users/UserModal"
import { roleQueries } from "@/hooks/server/roles"
import { userQueries } from "@/hooks/server/users"
import type { RoleResponse, UserResponse } from "@/types"

vi.mock("@/hooks/server/roles", () => ({
  roleQueries: { useList: vi.fn() },
}))

vi.mock("@/hooks/server/users", () => ({
  userQueries: {
    useList: vi.fn(),
    useCreate: vi.fn(),
    useUpdate: vi.fn(),
    useResetPassword: vi.fn(),
  },
}))

const mockRoles: RoleResponse[] = [
  {
    id: 1,
    code: "CHT",
    name: "Chỉ huy trưởng",
    shortCode: "CHT",
    level: 1,
    parentRoleId: null,
    departmentId: 1,
    description: "Chỉ huy trưởng công trường",
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: 2,
    code: "KSGS",
    name: "Kỹ sư giám sát",
    shortCode: "KSGS",
    level: 2,
    parentRoleId: 1,
    departmentId: 1,
    description: "Kỹ sư giám sát thi công",
    createdAt: "2024-01-01T00:00:00Z",
  },
]

const mockUsersData = {
  data: [
    {
      id: 10,
      fullName: "Nguyễn Văn Trưởng",
      perNumber: "NV001",
      status: "ACTIVE" as const,
      roleId: 1,
      roleName: "Chỉ huy trưởng",
      phone: "0901234567",
      email: "truong@example.com",
      managerPerNumber: null,
      createdAt: "2024-01-01T00:00:00Z",
      projects: [],
    },
    {
      id: 20,
      fullName: "Trần Văn Giám Sát",
      perNumber: "NV002",
      status: "ACTIVE" as const,
      roleId: 2,
      roleName: "Kỹ sư giám sát",
      phone: "0907654321",
      email: "giamsat@example.com",
      managerPerNumber: "NV001",
      createdAt: "2024-01-01T00:00:00Z",
      projects: [],
    },
  ],
}

const mockUserToEdit: UserResponse = {
  id: 20,
  fullName: "Trần Văn Giám Sát",
  perNumber: "NV002",
  status: "ACTIVE",
  roleId: 2,
  roleName: "Kỹ sư giám sát",
  phone: "0907654321",
  email: "giamsat@example.com",
  managerPerNumber: "NV001",
  createdAt: "2024-01-01T00:00:00Z",
  novatorStatus: 0,
  departmentCode: null,
  divisionCode: null,
}

const mockCreateMutation = {
  mutate: vi.fn(),
  isPending: false,
}

const mockUpdateMutation = {
  mutate: vi.fn(),
  isPending: false,
}

const mockResetPasswordMutation = {
  mutate: vi.fn(),
  isPending: false,
}

describe("UserModal Component", () => {
  const onCancelMock = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(roleQueries.useList).mockReturnValue({
      data: { code: 1000, message: "Success", result: mockRoles },
    } as any)
    vi.mocked(userQueries.useList).mockReturnValue({
      data: { code: 1000, message: "Success", result: mockUsersData.data },
    } as any)
    vi.mocked(userQueries.useCreate).mockReturnValue(mockCreateMutation as any)
    vi.mocked(userQueries.useUpdate).mockReturnValue(mockUpdateMutation as any)
    vi.mocked(userQueries.useResetPassword).mockReturnValue(
      mockResetPasswordMutation as any,
    )
  })

  it("renders Add Mode properly with editable role and required fields", () => {
    render(<UserModal open={true} onCancel={onCancelMock} user={null} />)

    expect(screen.getByText("Thêm nhân sự")).toBeTruthy()
    const perNumberInput = screen.getByPlaceholderText(
      "ví dụ: 35285",
    ) as HTMLInputElement
    expect(perNumberInput.disabled).toBe(false)

    const fullNameInput = screen.getByPlaceholderText(
      "Họ tên",
    ) as HTMLInputElement
    expect(fullNameInput.disabled).toBe(false)
    expect(screen.getByPlaceholderText("Mật khẩu")).toBeTruthy()

    // Role selector is enabled in create mode
    const roleSelect = screen.getByRole("combobox", {
      name: "Chức danh chính",
    }) as HTMLInputElement
    expect(roleSelect.disabled).toBe(false)
  })

  it("renders Edit Mode properly with disabled role and prefilled values", () => {
    render(
      <UserModal open={true} onCancel={onCancelMock} user={mockUserToEdit} />,
    )

    expect(screen.getByText("Sửa nhân sự")).toBeTruthy()

    // Employee ID is disabled in edit mode
    const perNumberInput = screen.getByPlaceholderText(
      "ví dụ: 35285",
    ) as HTMLInputElement
    expect(perNumberInput.disabled).toBe(true)
    expect(perNumberInput.value).toBe("NV002")

    // Full name is disabled for synced user
    const fullNameInput = screen.getByPlaceholderText(
      "Họ tên",
    ) as HTMLInputElement
    expect(fullNameInput.disabled).toBe(true)
    expect(fullNameInput.value).toBe("Trần Văn Giám Sát")

    // Role selector MUST be disabled in edit mode per requirement
    const roleSelect = screen.getByRole("combobox", {
      name: "Chức danh chính",
    }) as HTMLInputElement
    expect(roleSelect.disabled).toBe(true)

    // Password placeholder indicates optional in edit mode
    expect(screen.getByPlaceholderText("Mật khẩu mới")).toBeTruthy()
  })

  it("calls onCancel when clicking cancel button", () => {
    render(<UserModal open={true} onCancel={onCancelMock} user={null} />)

    const cancelBtn = screen.getByRole("button", { name: "Hủy" })
    fireEvent.click(cancelBtn)

    expect(onCancelMock).toHaveBeenCalledTimes(1)
  })

  it("submits update mutation in edit mode when form is saved", async () => {
    render(
      <UserModal open={true} onCancel={onCancelMock} user={mockUserToEdit} />,
    )

    const phoneInput = screen.getByPlaceholderText("ví dụ: 0901234567")
    fireEvent.change(phoneInput, { target: { value: "0988888888" } })

    const saveBtn = screen.getByRole("button", { name: "Lưu" })
    fireEvent.click(saveBtn)

    await waitFor(
      () => {
        expect(mockUpdateMutation.mutate).toHaveBeenCalledWith(
          expect.objectContaining({
            id: mockUserToEdit.id,
            data: expect.objectContaining({
              fullName: "Trần Văn Giám Sát",
              perNumber: "NV002",
              phone: "0988888888",
            }),
          }),
          expect.any(Object),
        )
      },
      { timeout: 4000 },
    )
  })

  it("rejects invalid phone number format", async () => {
    render(
      <UserModal open={true} onCancel={onCancelMock} user={mockUserToEdit} />,
    )

    const phoneInput = screen.getByPlaceholderText("ví dụ: 0901234567")
    fireEvent.change(phoneInput, { target: { value: "abc123xyz" } })

    const saveBtn = screen.getByRole("button", { name: "Lưu" })
    fireEvent.click(saveBtn)

    await waitFor(
      () => {
        expect(screen.getByText("Số điện thoại không hợp lệ")).toBeTruthy()
        expect(mockUpdateMutation.mutate).not.toHaveBeenCalled()
      },
      { timeout: 4000 },
    )
  })
})

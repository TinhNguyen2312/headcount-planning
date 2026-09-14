import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { AppLayout } from "@/routes/_layout"

const mockNavigate = vi.fn()
const mockLogout = vi.fn()

vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => mockNavigate,
  useRouterState: () => "/my-task",
  Link: ({ children, to, ...props }: any) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
  Outlet: () => <div data-testid="outlet-content">Page Content</div>,
  createFileRoute: () => () => ({}),
  redirect: vi.fn(),
}))

vi.mock("@/hooks/useAuth", () => ({
  default: () => ({
    user: {
      id: "u-1",
      email: "pm@novagroup.vn",
      fullName: "Trần Minh Anh",
      systemRole: "USER",
      projects: [],
    },
    logout: mockLogout,
  }),
  isLoggedIn: () => true,
}))

vi.mock("@/hooks/useLayout", () => ({
  useLayout: () => ({
    topMenuItems: [
      {
        key: "my-task",
        icon: <span data-testid="icon-my-task" />,
        label: "Công việc của tôi",
        onClick: vi.fn(),
      },
      {
        key: "projects",
        icon: <span data-testid="icon-projects" />,
        label: "Dự án",
        onClick: vi.fn(),
      },
    ],
    bottomMenuItems: [
      {
        key: "roles",
        icon: <span data-testid="icon-roles" />,
        label: "Phân quyền",
        onClick: vi.fn(),
      },
    ],
    activeKey: "my-task",
    activeLabel: "Công việc của tôi",
    navigateHome: vi.fn(),
  }),
}))

vi.mock("@/components/Common/ThemeToggle", () => ({
  ThemeToggle: () => <button type="button">Toggle Theme</button>,
}))

vi.mock("@/components/AdhocTask/CreateAdhocTaskModal", () => ({
  CreateAdhocTaskModal: () => null,
  default: () => null,
}))

describe("AppLayout Sidebar & Branding", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders PCD Project Construction Management branding in expanded sidebar", () => {
    render(<AppLayout />)

    // Check PCD branding text
    const pcdElements = screen.getAllByText("PCD")
    expect(pcdElements.length).toBeGreaterThan(0)

    const projectText = screen.getAllByText("PROJECT CONSTRUCTION")
    expect(projectText.length).toBeGreaterThan(0)

    const managementText = screen.getAllByText("MANAGEMENT")
    expect(managementText.length).toBeGreaterThan(0)

    // Check Nova logo is present
    const logoImgs = screen.getAllByAltText("Novaland Logo")
    expect(logoImgs.length).toBeGreaterThan(0)
    expect(logoImgs[0].getAttribute("src")).toBe("/logo.png")
  })

  it("renders menu items and copyright footer in sidebar", () => {
    render(<AppLayout />)

    // Check menu labels
    expect(screen.getAllByText("Công việc của tôi").length).toBeGreaterThan(0)
    expect(screen.getAllByText("Dự án").length).toBeGreaterThan(0)
    expect(screen.getAllByText("Phân quyền").length).toBeGreaterThan(0)

    // Check footer copyright
    expect(screen.getAllByText("Version 1.0.0").length).toBeGreaterThan(0)
    expect(screen.getAllByText("© 2026 Nova Group").length).toBeGreaterThan(0)
  })

  it("toggles sidebar collapsed state when clicking menu collapse button", () => {
    render(<AppLayout />)

    const toggleBtn = screen.getByLabelText("Đóng/mở menu")
    expect(toggleBtn).toBeDefined()

    // Initial expanded state displays full branding
    expect(screen.getAllByText("PROJECT CONSTRUCTION").length).toBeGreaterThan(
      0,
    )

    // Click toggle to collapse
    fireEvent.click(toggleBtn)

    // Collapsed version indicator v1.0 is shown
    expect(screen.getByText("v1.0")).toBeDefined()
  })

  it("renders user information and content outlet", () => {
    render(<AppLayout />)

    expect(screen.getByText("Trần Minh Anh")).toBeDefined()
    expect(screen.getByText("pm@novagroup.vn")).toBeDefined()
    expect(screen.getByTestId("outlet-content")).toBeDefined()
  })
})

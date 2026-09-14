import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import ProjectsPage from "@/pages/ProjectsPage"
import type { ProjectResponse } from "@/types"

const mockNavigate = vi.fn()
const mockDeleteMutate = vi.fn()

vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => mockNavigate,
}))

const mockProjects: ProjectResponse[] = [
  {
    id: 1,
    name: "NovaWorld Phan Thiết",
    address: "Phan Thiết, Bình Thuận",
    region: "VUNG_PHAN_THIET_1",
    status: "ACTIVE",
    startDate: "2023-01-01",
    endDate: "2026-12-31",
    createdAt: "2023-01-01T00:00:00Z",
    thumbnail: "",
  },
  {
    id: 2,
    name: "Aqua City",
    address: "Biên Hòa, Đồng Nai",
    region: "VUNG_DONG_NAI_1",
    status: "PLANNING",
    startDate: "2023-05-01",
    endDate: null,
    createdAt: "2023-05-01T00:00:00Z",
    thumbnail: "",
  },
]

let mockProjectsResult: {
  data: any
  isLoading: boolean
  isError: boolean
  refetch: any
} = {
  data: {
    result: mockProjects,
    meta: {
      page: 1,
      limit: 12,
      total: 2,
      totalPages: 1,
    },
  },
  isLoading: false,
  isError: false,
  refetch: vi.fn(),
}

vi.mock("@/hooks/server/projects", () => ({
  projectQueries: {
    useSuspenseList: () => mockProjectsResult,
    useDelete: () => ({
      mutate: mockDeleteMutate,
      isPending: false,
    }),
    useCreate: () => ({
      mutate: vi.fn(),
      isPending: false,
    }),
  },
}))

describe("ProjectsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockProjectsResult = {
      data: {
        result: mockProjects,
        meta: {
          page: 1,
          limit: 12,
          total: 2,
          totalPages: 1,
        },
      },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    }
  })

  it("renders management layout with title, search bar, filters and project cards", () => {
    render(<ProjectsPage />)

    expect(screen.getByText("Dự án")).toBeTruthy()
    expect(
      screen.getByPlaceholderText("Tìm kiếm dự án theo tên..."),
    ).toBeTruthy()
    expect(screen.getByText("Bộ lọc")).toBeTruthy()
    expect(screen.getByText("Mới nhất")).toBeTruthy()
    expect(screen.getByText("NovaWorld Phan Thiết")).toBeTruthy()
    expect(screen.getByText("Aqua City")).toBeTruthy()
    expect(screen.getByText(/Hiển thị 1-2 trong tổng số 2 dự án/i)).toBeTruthy()
  })

  it("renders empty state when there are no projects", () => {
    mockProjectsResult = {
      data: {
        result: [],
        meta: { page: 1, limit: 12, total: 0, totalPages: 0 },
      },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    }

    render(<ProjectsPage />)

    expect(screen.getByText("Không tìm thấy dự án")).toBeTruthy()
    expect(
      screen.getByText(
        "Thử thay đổi từ khóa tìm kiếm hoặc bỏ bớt các bộ lọc đang áp dụng.",
      ),
    ).toBeTruthy()
  })
})

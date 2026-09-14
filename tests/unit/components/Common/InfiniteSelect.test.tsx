import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import InfiniteSelect from "@/components/Common/InfiniteSelect"

describe("InfiniteSelect Component", () => {
  let queryClient: QueryClient

  beforeEach(() => {
    vi.clearAllMocks()
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    })
  })

  const renderWithClient = (ui: React.ReactElement) =>
    render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>)

  it("renders with placeholder and maps default fieldNames", () => {
    const mockUseList = vi.fn().mockReturnValue({
      data: {
        result: [
          { id: 1, name: "Item One" },
          { id: 2, name: "Item Two" },
        ],
      },
      isFetching: false,
    })

    renderWithClient(
      <InfiniteSelect placeholder="Chọn mục..." useList={mockUseList} />,
    )

    expect(screen.getByText("Chọn mục...")).toBeTruthy()
    expect(mockUseList).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 1,
        limit: 20,
      }),
      { enabled: true },
    )
  })

  it("supports custom fieldNames (e.g. userId and userFullName)", () => {
    const mockUseList = vi.fn().mockReturnValue({
      data: {
        result: [
          { userId: 101, userFullName: "Nguyễn Văn A" },
          { userId: 102, userFullName: "Trần Thị B" },
        ],
      },
      isFetching: false,
    })

    renderWithClient(
      <InfiniteSelect
        placeholder="Chọn nhân viên..."
        useList={mockUseList}
        fieldNames={{ value: "userId", label: "userFullName" }}
      />,
    )

    expect(screen.getByText("Chọn nhân viên...")).toBeTruthy()
  })

  it("supports custom transformItem", () => {
    const mockUseList = vi.fn().mockReturnValue({
      data: {
        result: [{ id: 10, code: "NV10", title: "Kỹ sư" }],
      },
      isFetching: false,
    })

    renderWithClient(
      <InfiniteSelect
        placeholder="Chọn vị trí..."
        useList={mockUseList}
        transformItem={(item) => ({
          value: item.id,
          label: `${item.code} - ${item.title}`,
          ...item,
        })}
      />,
    )

    expect(screen.getByText("Chọn vị trí...")).toBeTruthy()
  })

  it("triggers useDetail for auto-hydration when value is not in page 1", () => {
    const mockUseList = vi.fn().mockReturnValue({
      data: {
        result: [{ id: 1, name: "Item One" }],
      },
      isFetching: false,
    })

    const mockUseDetail = vi.fn().mockReturnValue({
      data: { id: 99, name: "Item Ninety-Nine" },
      isFetching: false,
    })

    renderWithClient(
      <InfiniteSelect
        value={99}
        useList={mockUseList}
        useDetail={mockUseDetail}
      />,
    )

    expect(mockUseDetail).toHaveBeenCalledWith(99, { enabled: true })
  })
})

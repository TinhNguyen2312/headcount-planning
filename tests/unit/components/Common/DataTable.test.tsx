import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { DataTable } from "@/components/Common/DataTable"
import { createTextColumn } from "@/lib/tableHelpers"

interface SampleItem {
  id: number
  title: string
}

describe("DataTable component", () => {
  const columns = [
    createTextColumn<SampleItem>("title", "Tiêu đề", { sortable: true }),
  ]

  it("renders empty state with custom label when dataSource is empty", () => {
    render(
      <DataTable<SampleItem>
        columns={columns}
        dataSource={[]}
        totalItemLabel="dự án"
      />,
    )

    expect(screen.getByText("Chưa có dự án nào.")).toBeTruthy()
  })

  it("renders records and default total item label in pagination", () => {
    const data: SampleItem[] = [
      { id: 1, title: "Dự án A" },
      { id: 2, title: "Dự án B" },
    ]

    render(
      <DataTable<SampleItem>
        columns={columns}
        dataSource={data}
        totalItemLabel="dự án"
      />,
    )

    expect(screen.getByText("Dự án A")).toBeTruthy()
    expect(screen.getByText("Dự án B")).toBeTruthy()
    expect(screen.getByText("Hiển thị 1-2 của 2 dự án")).toBeTruthy()
  })

  it("disables pagination when pagination={false}", () => {
    const data: SampleItem[] = [{ id: 1, title: "Dự án A" }]

    const { container } = render(
      <DataTable<SampleItem>
        columns={columns}
        dataSource={data}
        pagination={false}
      />,
    )

    expect(container.querySelector(".ant-pagination")).toBeNull()
  })
})

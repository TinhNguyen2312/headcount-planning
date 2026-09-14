import { describe, expect, it } from "vitest"
import {
  createDateColumn,
  createNumberColumn,
  createStatusColumn,
  createTextColumn,
} from "@/lib/tableHelpers"

interface TestItem {
  id: number
  name: string
  status: "DRAFT" | "APPROVED" | "REJECTED"
  count: number
  createdAt?: string | null
}

describe("tableHelpers", () => {
  describe("createTextColumn", () => {
    it("creates column configuration with default alignment", () => {
      const col = createTextColumn<TestItem>("name", "Tên")
      expect(col.title).toBe("Tên")
      expect(col.dataIndex).toBe("name")
      expect(col.align).toBe("left")
      expect(col.sorter).toBeUndefined()
    })

    it("sorts Vietnamese strings correctly when sortable is true", () => {
      const col = createTextColumn<TestItem>("name", "Tên", { sortable: true })
      expect(typeof col.sorter).toBe("function")

      const sorter = col.sorter as (a: TestItem, b: TestItem) => number
      const itemA: TestItem = { id: 1, name: "Ánh", status: "DRAFT", count: 1 }
      const itemB: TestItem = { id: 2, name: "Bình", status: "DRAFT", count: 2 }

      // "Ánh" should sort before "Bình"
      expect(sorter(itemA, itemB)).toBeLessThan(0)
      expect(sorter(itemB, itemA)).toBeGreaterThan(0)
    })

    it("configures search filter dropdown and onFilter when searchable is true", () => {
      const col = createTextColumn<TestItem>("name", "Tên", {
        searchable: true,
      })

      expect(col.filterDropdown).toBeDefined()
      expect(col.filterIcon).toBeDefined()
      expect(typeof col.onFilter).toBe("function")

      const onFilter = col.onFilter as (
        value: unknown,
        record: TestItem,
      ) => boolean
      const record: TestItem = {
        id: 1,
        name: "Kiểm tra bê tông",
        status: "DRAFT",
        count: 1,
      }

      expect(onFilter("bê tông", record)).toBe(true)
      expect(onFilter("sắt thép", record)).toBe(false)
    })

    it("configures discrete filters when filters array is provided", () => {
      const col = createTextColumn<TestItem>("name", "Tên", {
        filters: [
          { text: "Mục 1", value: "Mục 1" },
          { text: "Mục 2", value: "Mục 2" },
        ],
      })

      expect(col.filters).toHaveLength(2)
      const onFilter = col.onFilter as (
        value: unknown,
        record: TestItem,
      ) => boolean
      expect(
        onFilter("Mục 1", { id: 1, name: "Mục 1", status: "DRAFT", count: 1 }),
      ).toBe(true)
    })
  })

  describe("createStatusColumn", () => {
    const statusMap = {
      DRAFT: { label: "Bản nháp" },
      APPROVED: { label: "Đã duyệt" },
      REJECTED: { label: "Từ chối" },
    }

    it("generates filters and matches records correctly", () => {
      const col = createStatusColumn<TestItem, TestItem["status"]>(
        "status",
        "Trạng thái",
        statusMap,
      )

      expect(col.filters).toEqual([
        { text: "Bản nháp", value: "DRAFT" },
        { text: "Đã duyệt", value: "APPROVED" },
        { text: "Từ chối", value: "REJECTED" },
      ])

      const onFilter = col.onFilter as (
        value: unknown,
        record: TestItem,
      ) => boolean
      const record: TestItem = {
        id: 1,
        name: "Test",
        status: "APPROVED",
        count: 1,
      }

      expect(onFilter("APPROVED", record)).toBe(true)
      expect(onFilter("DRAFT", record)).toBe(false)
    })
  })

  describe("createDateColumn", () => {
    it("formats ISO dates and sorts timestamps", () => {
      const col = createDateColumn<TestItem>("createdAt", "Ngày tạo", {
        sortable: true,
      })

      const itemOld: TestItem = {
        id: 1,
        name: "Old",
        status: "DRAFT",
        count: 1,
        createdAt: "2026-01-01T08:00:00Z",
      }
      const itemNew: TestItem = {
        id: 2,
        name: "New",
        status: "DRAFT",
        count: 2,
        createdAt: "2026-08-01T08:00:00Z",
      }

      const sorter = col.sorter as (a: TestItem, b: TestItem) => number
      expect(sorter(itemOld, itemNew)).toBeLessThan(0)
    })
  })

  describe("createNumberColumn", () => {
    it("sorts numbers and handles formatters", () => {
      const col = createNumberColumn<TestItem>("count", "Số lượng", {
        sortable: true,
        formatter: (val) => `${val} mục`,
      })

      const itemA: TestItem = { id: 1, name: "A", status: "DRAFT", count: 10 }
      const itemB: TestItem = { id: 2, name: "B", status: "DRAFT", count: 50 }

      const sorter = col.sorter as (a: TestItem, b: TestItem) => number
      expect(sorter(itemA, itemB)).toBeLessThan(0)

      const render = col.render as (val: number) => string
      expect(render(10)).toBe("10 mục")
    })
  })
})

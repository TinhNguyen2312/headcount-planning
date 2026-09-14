import { describe, expect, it } from "vitest"
import {
  flattenVisible,
  layoutPcdRoleTree,
  layoutWithDagre,
  ROLE_CODES,
} from "@/components/Role/roleTreeLayout"
import type { RoleTreeNodeResponse } from "@/types"

const createRoleTreeNode = (
  id: number,
  code: string,
  name: string,
  children: RoleTreeNodeResponse[] = [],
): RoleTreeNodeResponse => ({
  id,
  code,
  shortCode: name,
  name,
  level: 1,
  parentRoleId: null,
  departmentId: null,
  description: null,
  createdAt: "2026-01-01T00:00:00Z",
  children,
})

describe("roleTreeLayout", () => {
  it("flattens visible nodes respecting collapsed ids", () => {
    const child = createRoleTreeNode(2, ROLE_CODES.TRUONG_PHONG, "Trưởng phòng")
    const root = createRoleTreeNode(1, ROLE_CODES.GD_PGD, "GĐ/PGĐ", [child])

    const uncollapsed = flattenVisible([root], new Set())
    expect(uncollapsed).toHaveLength(2)

    const collapsed = flattenVisible([root], new Set([1]))
    expect(collapsed).toHaveLength(1)
    expect(collapsed[0].id).toBe("1")
  })

  it("calculates specialist stack vertically in PCD layout", () => {
    const kts = createRoleTreeNode(9, ROLE_CODES.KTS, "KTS")
    const cltd = createRoleTreeNode(10, ROLE_CODES.CLTD, "CLTD")
    const tracDac = createRoleTreeNode(11, ROLE_CODES.TRAC_DAC, "Trắc đạc")
    const atld = createRoleTreeNode(12, ROLE_CODES.ATLD, "ATLĐ")
    const cayXanh = createRoleTreeNode(13, ROLE_CODES.CAY_XANH, "Cây xanh")
    const thuKy = createRoleTreeNode(14, ROLE_CODES.THU_KY, "Thư ký")

    const gsCd = createRoleTreeNode(7, ROLE_CODES.GS_QLCD, "GS Cơ điện")
    const tbpCd = createRoleTreeNode(4, ROLE_CODES.TBP_QLCD, "TBP Cơ điện", [
      gsCd,
    ])

    const tp = createRoleTreeNode(2, ROLE_CODES.TRUONG_PHONG, "Trưởng phòng", [
      tbpCd,
      kts,
      cltd,
      tracDac,
      atld,
      cayXanh,
      thuKy,
    ])
    const root = createRoleTreeNode(1, ROLE_CODES.GD_PGD, "GĐ/PGĐ", [tp])

    const entries = flattenVisible([root], new Set())
    const positions = layoutPcdRoleTree(entries)

    expect(positions).not.toBeNull()
    if (!positions) return

    // Verify all 6 specialist nodes share the exact same X coordinate (stacked in column 4)
    const ktsPos = positions.get("9")
    const cltdPos = positions.get("10")
    const tracDacPos = positions.get("11")
    const atldPos = positions.get("12")
    const cayXanhPos = positions.get("13")
    const thuKyPos = positions.get("14")

    expect(ktsPos?.x).toBeDefined()
    expect(cltdPos?.x).toBe(ktsPos?.x)
    expect(tracDacPos?.x).toBe(ktsPos?.x)
    expect(atldPos?.x).toBe(ktsPos?.x)
    expect(cayXanhPos?.x).toBe(ktsPos?.x)
    expect(thuKyPos?.x).toBe(ktsPos?.x)

    // Verify their Y coordinates are strictly increasing
    expect(cltdPos!.y).toBeGreaterThan(ktsPos!.y)
    expect(tracDacPos!.y).toBeGreaterThan(cltdPos!.y)
    expect(atldPos!.y).toBeGreaterThan(tracDacPos!.y)
    expect(cayXanhPos!.y).toBeGreaterThan(atldPos!.y)
    expect(thuKyPos!.y).toBeGreaterThan(cayXanhPos!.y)
  })

  it("falls back to dagre layout when PCD role codes are missing", () => {
    const customChild = createRoleTreeNode(2, "CUSTOM_02", "Custom Child")
    const customRoot = createRoleTreeNode(1, "CUSTOM_01", "Custom Root", [
      customChild,
    ])

    const entries = flattenVisible([customRoot], new Set())
    const pcdPositions = layoutPcdRoleTree(entries)
    expect(pcdPositions).toBeNull()

    const dagrePositions = layoutWithDagre(entries)
    expect(dagrePositions.size).toBe(2)
    expect(dagrePositions.get("1")).toBeDefined()
    expect(dagrePositions.get("2")).toBeDefined()
  })

  it("stacks specialist roles vertically even when role codes are customized or non-standard", () => {
    const kts = createRoleTreeNode(
      9,
      "KTS_CUSTOM",
      "Kiến trúc sư cao cấp Công trường",
    )
    const cltd = createRoleTreeNode(
      10,
      "CLTD_CUSTOM",
      "Kỹ sư cao cấp Kiểm soát Chất lượng và tiến độ",
    )
    const tracDac = createRoleTreeNode(
      11,
      "TRAC_DAC_CUSTOM",
      "Kỹ sư cao cấp Kiểm soát Trắc đạc",
    )
    const tp = createRoleTreeNode(
      2,
      "TP_CUSTOM",
      "Trưởng phòng Quản lý Xây dựng, An toàn và Môi trường",
      [kts, cltd, tracDac],
    )
    const root = createRoleTreeNode(
      1,
      "GD_CUSTOM",
      "GĐ/PGĐ Phòng Quản lý Xây dựng",
      [tp],
    )

    const entries = flattenVisible([root], new Set())
    const positions = layoutPcdRoleTree(entries)

    expect(positions).not.toBeNull()
    if (!positions) return

    const ktsPos = positions.get("9")
    const cltdPos = positions.get("10")
    const tracDacPos = positions.get("11")

    expect(ktsPos).toBeDefined()
    expect(cltdPos?.x).toBe(ktsPos?.x)
    expect(tracDacPos?.x).toBe(ktsPos?.x)
    expect(cltdPos!.y).toBeGreaterThan(ktsPos!.y)
    expect(tracDacPos!.y).toBeGreaterThan(cltdPos!.y)
  })

  it("stacks specialist roles vertically even in dagre layout", () => {
    const kts = createRoleTreeNode(
      9,
      "KTS_CUSTOM",
      "Kiến trúc sư cao cấp Công trường",
    )
    const cltd = createRoleTreeNode(
      10,
      "CLTD_CUSTOM",
      "Kỹ sư cao cấp Kiểm soát Chất lượng và tiến độ",
    )
    const nonSpec = createRoleTreeNode(5, "NON_SPEC", "Bộ phận nghiệp vụ khác")
    const parent = createRoleTreeNode(2, "PARENT", "Lãnh đạo đơn vị", [
      nonSpec,
      kts,
      cltd,
    ])

    const entries = flattenVisible([parent], new Set())
    const positions = layoutWithDagre(entries)

    const ktsPos = positions.get("9")
    const cltdPos = positions.get("10")

    expect(ktsPos).toBeDefined()
    expect(cltdPos).toBeDefined()
    // Specialists share the same X in Dagre layout
    expect(cltdPos?.x).toBe(ktsPos?.x)
    expect(cltdPos!.y).toBeGreaterThan(ktsPos!.y)
  })
})

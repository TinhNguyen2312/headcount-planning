import * as fs from "node:fs"
import * as path from "node:path"
import { describe, expect, it } from "vitest"
import { mapRequirementType, parseChecklistExcel } from "@/lib/excel"

describe("checklistParser", () => {
  it("should correctly map requirement type keywords", () => {
    expect(mapRequirementType("File")).toBe("FILE")
    expect(mapRequirementType("Tệp đính kèm")).toBe("FILE")
    expect(mapRequirementType("Ảnh hiện trường")).toBe("IMAGE")
    expect(mapRequirementType("Video minh họa")).toBe("VIDEO")
    expect(mapRequirementType("Nhập số liệu")).toBe("DATA_ENTRY")
    expect(mapRequirementType("Đạt")).toBe("CHECKBOX")
    expect(mapRequirementType("Số")).toBe("NUMBER")
    expect(mapRequirementType(null)).toBe("none")
    expect(mapRequirementType("")).toBe("none")
    expect(mapRequirementType("không có gì")).toBe("none")
  })

  it("should parse docs/checklist.xlsx into multi-sheet checklist templates", async () => {
    const filePath = path.resolve(__dirname, "../../../../docs/checklist.xlsx")
    const buffer = fs.readFileSync(filePath)

    const templates = await parseChecklistExcel(buffer)

    expect(templates).toHaveLength(3)

    // Verify first sheet F1.2.01
    const sheet1 = templates[0]
    expect(sheet1.sheetName).toBe("F1.2.01")
    expect(sheet1.code).toBe("F1.2.01")
    expect(sheet1.name).toBe("Kiểm tra Kế hoạch thi công, nghiệm thu ngày")
    expect(sheet1.description).toContain("KSCC/KS Kiểm soát Giám sát Xây dựng")
    expect(sheet1.items).toHaveLength(4)
    expect(sheet1.items[0].title).toBe(
      "Rà soát danh mục yêu cầu nghiệm thu ngày so với kế hoạch ngày/tuần",
    )
    expect(sheet1.items[0].checkingMethod).toContain(
      "Kiểm tra danh sách các công tác Nhà thầu đăng ký nghiệm th",
    )
    expect(sheet1.items[0].notes).toBe("Hàng ngày")

    // Verify second sheet F1.2.02
    const sheet2 = templates[1]
    expect(sheet2.sheetName).toBe("F1.2.02")
    expect(sheet2.code).toBe("F1.2.02")
    expect(sheet2.name).toBe("Kiểm tra Kế hoạch thi công tuần")
    expect(sheet2.items).toHaveLength(4)
    expect(sheet2.items[0].requirementType).toBe("FILE")
    expect(sheet2.items[0].notes).toBe("File tracking tuần")
    expect(sheet2.items[2].requirementType).toBe("FILE")

    // Verify third sheet F1.2.03
    const sheet3 = templates[2]
    expect(sheet3.sheetName).toBe("F1.2.03")
    expect(sheet3.code).toBe("F1.2.03")
    expect(sheet3.name).toBe("Kiểm tra tiến độ thi công tổng thể")
    expect(sheet3.items).toHaveLength(5)
  })
})

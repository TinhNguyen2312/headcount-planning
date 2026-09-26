import * as XLSX from "xlsx"
import type {
  ChecklistRequirementType,
  ParsedChecklistItem,
  ParsedChecklistTemplate,
} from "@/types"

export type ExcelCellValue = string | number | boolean | Date | null | undefined

export type ExcelRow = ExcelCellValue[]

export function mapRequirementType(rawVal?: unknown): ChecklistRequirementType {
  if (!rawVal || typeof rawVal !== "string") return "none"
  const val = rawVal.trim().toLowerCase()
  if (!val) return "none"

  if (
    val.includes("file") ||
    val.includes("tệp") ||
    val.includes("tài liệu") ||
    val.includes("hồ sơ")
  ) {
    return "FILE"
  }
  if (
    val.includes("ảnh") ||
    val.includes("hình") ||
    val.includes("image") ||
    val.includes("photo")
  ) {
    return "IMAGE"
  }
  if (val.includes("video") || val.includes("clip")) {
    return "VIDEO"
  }
  if (
    val.includes("nhập") ||
    val.includes("data") ||
    val.includes("text") ||
    val.includes("văn bản")
  ) {
    return "DATA_ENTRY"
  }
  if (
    val.includes("đạt") ||
    val.includes("check") ||
    val.includes("tích") ||
    val.includes("pass")
  ) {
    return "CHECKBOX"
  }
  if (
    val.includes("số") ||
    val.includes("number") ||
    val.includes("lượng") ||
    val.includes("mét") ||
    val.includes("thước")
  ) {
    return "NUMBER"
  }

  return "none"
}

function generateItemId(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `item-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

export async function parseChecklistExcel(
  fileOrBuffer: File | ArrayBuffer | Uint8Array,
): Promise<ParsedChecklistTemplate[]> {
  let arrayBuffer: ArrayBuffer

  if (fileOrBuffer instanceof File) {
    arrayBuffer = await fileOrBuffer.arrayBuffer()
  } else if (fileOrBuffer instanceof Uint8Array) {
    arrayBuffer = fileOrBuffer.buffer.slice(
      fileOrBuffer.byteOffset,
      fileOrBuffer.byteOffset + fileOrBuffer.byteLength,
    ) as ArrayBuffer
  } else {
    arrayBuffer = fileOrBuffer
  }

  const workbook = XLSX.read(arrayBuffer, { type: "array" })
  const templates: ParsedChecklistTemplate[] = []

  for (const sheetName of workbook.SheetNames) {
    const ws = workbook.Sheets[sheetName]
    if (!ws) continue

    const cellB2 = ws["B2"]?.v != null ? String(ws["B2"].v).trim() : ""
    const cellA3 = ws["A3"]?.v != null ? String(ws["A3"].v).trim() : ""

    const templateName = cellB2 || sheetName
    const templateDescription = cellA3 || ""

    const rows = XLSX.utils.sheet_to_json<ExcelRow>(ws, {
      header: 1,
      blankrows: false,
    })
    if (!rows || rows.length === 0) continue

    let headerRowIdx = 7
    let colStt = 0
    let colTitle = 1
    let colDesc = 2
    let colEvidence = 5
    let colNotes = 6

    for (let r = 0; r < Math.min(rows.length, 15); r++) {
      const row = rows[r]
      if (!Array.isArray(row)) continue
      const lowerRow = row.map((c) =>
        c != null ? String(c).trim().toLowerCase() : "",
      )

      const hasStt = lowerRow.some((c) => c === "stt" || c.includes("thứ tự"))
      const hasTitle = lowerRow.some(
        (c) =>
          c.includes("công việc") ||
          c.includes("hạng mục") ||
          c.includes("nội dung"),
      )

      if (hasStt || hasTitle) {
        headerRowIdx = r
        colStt = lowerRow.findIndex((c) => c === "stt" || c.includes("thứ tự"))
        if (colStt === -1) colStt = 0

        colTitle = lowerRow.findIndex(
          (c) =>
            c.includes("công việc") ||
            c.includes("hạng mục") ||
            c.includes("tiêu đề"),
        )
        if (colTitle === -1) colTitle = 1

        colDesc = lowerRow.findIndex(
          (c) =>
            c.includes("mô tả") ||
            c.includes("chi tiết") ||
            c.includes("phương pháp"),
        )
        if (colDesc === -1) colDesc = 2

        colEvidence = lowerRow.findIndex(
          (c) =>
            c.includes("minh chứng") ||
            c.includes("bằng chứng") ||
            c.includes("yêu cầu"),
        )
        if (colEvidence === -1) colEvidence = 5

        colNotes = lowerRow.findIndex(
          (c) => c.includes("ghi chú") || c.includes("tần suất"),
        )
        if (colNotes === -1) colNotes = 6

        break
      }
    }

    const items: ParsedChecklistItem[] = []
    let fallbackOrderIndex = 1

    for (let r = headerRowIdx + 1; r < rows.length; r++) {
      const row = rows[r]
      if (!Array.isArray(row) || row.length === 0) continue

      const rawStt = row[colStt]
      const rawTitle = row[colTitle]
      const rawDesc = row[colDesc]
      const rawEvidence = row[colEvidence]
      const rawNotes = row[colNotes]

      const title = rawTitle != null ? String(rawTitle).trim() : ""
      const checkingMethod = rawDesc != null ? String(rawDesc).trim() : ""
      const notes = rawNotes != null ? String(rawNotes).trim() : ""

      if (!title && !checkingMethod) {
        continue
      }

      const parsedStt =
        typeof rawStt === "number"
          ? rawStt
          : Number.parseInt(
              rawStt != null ? String(rawStt).replace(/\D/g, "") : "",
              10,
            )

      const orderIndex =
        !Number.isNaN(parsedStt) && parsedStt > 0
          ? parsedStt
          : fallbackOrderIndex

      items.push({
        id: generateItemId(),
        orderIndex,
        title: title || checkingMethod,
        checkingMethod: title ? checkingMethod : "",
        requirementType: mapRequirementType(rawEvidence),
        notes: notes || undefined,
      })

      fallbackOrderIndex++
    }

    templates.push({
      sheetName,
      code: sheetName.trim(),
      name: templateName,
      description: templateDescription,
      taskItemId: null,
      items,
    })
  }

  return templates
}

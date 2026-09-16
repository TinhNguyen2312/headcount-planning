import { NextRequest } from "next/server"
import { apiError, apiSuccess } from "@/lib/apiResponse"
import { generateHeadcountReport } from "@/server/headcount-engine"
import type { HeadcountCalculationParams } from "@/server/headcount-engine/types"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { scopeType, scopeId, fromMonth, durationMonths = 6 } = body

    if (
      !scopeType ||
      !["BY_SECTOR", "BY_REGION", "BY_PROJECT"].includes(scopeType)
    ) {
      return apiError(
        "Loại phạm vi scopeType không hợp lệ. Chỉ chấp nhận BY_SECTOR, BY_REGION, BY_PROJECT.",
        400,
        400,
      )
    }

    if (!scopeId) {
      return apiError("Thiếu thông tin scopeId (mã/id phạm vi).", 400, 400)
    }

    if (!fromMonth || typeof fromMonth !== "string") {
      return apiError(
        "Thiếu thông tin fromMonth (tháng bắt đầu định dạng MM/YYYY).",
        400,
        400,
      )
    }

    const input: HeadcountCalculationParams = {
      scopeType,
      scopeId,
      fromMonth,
      durationMonths: Number(durationMonths) || 6,
    }

    const result = await generateHeadcountReport(input)

    return apiSuccess(result, "Tính toán báo cáo định biên thành công")
  } catch (error) {
    console.error("Calculate headcount report error:", error)
    return apiError(
      "Lỗi hệ thống khi tính toán báo cáo định biên",
      500,
      500,
      error?.message,
    )
  }
}

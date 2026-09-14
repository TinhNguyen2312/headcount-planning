import { NextRequest } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import crypto from "crypto"
import { apiError, apiSuccess } from "@/lib/apiResponse"

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return apiError("Không có tệp nào được tải lên", 400)
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const uploadDir = path.join(process.cwd(), "public", "uploads")
    await mkdir(uploadDir, { recursive: true })

    const ext = path.extname(file.name) || ".png"
    const filename = `${crypto.randomBytes(16).toString("hex")}${ext}`
    const filePath = path.join(uploadDir, filename)

    await writeFile(filePath, buffer)

    const fileUrl = `/uploads/${filename}`

    return apiSuccess(
      {
        url: fileUrl,
        fileUrl,
        filename: file.name,
        storedFileName: filename,
        content_type: file.type,
        contentType: file.type,
        size: file.size,
      },
      "Tải tệp lên thành công",
    )
  } catch (error) {
    console.error("Upload error:", error)
    return apiError("Lỗi tải tệp lên", 500)
  }
}

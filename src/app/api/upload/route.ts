import { NextRequest } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import crypto from "crypto"
import { apiError, apiSuccess } from "@/lib/apiResponse"
import { uploadToSupabaseStorage, isSupabaseConfigured } from "@/lib/supabase"

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return apiError("Không có tệp nào được tải lên", 400)
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const ext = path.extname(file.name) || ".png"
    const filename = `${crypto.randomBytes(16).toString("hex")}${ext}`
    const contentType = file.type || "application/octet-stream"

    // 1. Thử tải lên Supabase Storage nếu đã cấu hình
    if (isSupabaseConfigured) {
      const publicUrl = await uploadToSupabaseStorage(
        buffer,
        filename,
        contentType,
      )
      if (publicUrl) {
        return apiSuccess(
          {
            url: publicUrl,
            fileUrl: publicUrl,
            filename: file.name,
            storedFileName: filename,
            contentType,
            size: file.size,
            storage: "supabase",
          },
          "Tải tệp lên Supabase Storage thành công",
        )
      }
      console.warn(
        "Supabase Storage upload không thành công, chuyển sang lưu trữ cục bộ (local fallback)...",
      )
    }

    // 2. Dự phòng (Fallback): Lưu trữ vào thư mục public/uploads cục bộ
    const uploadDir = path.join(process.cwd(), "public", "uploads")
    await mkdir(uploadDir, { recursive: true })

    const filePath = path.join(uploadDir, filename)
    await writeFile(filePath, buffer)

    const fileUrl = `/uploads/${filename}`

    return apiSuccess(
      {
        url: fileUrl,
        fileUrl,
        filename: file.name,
        storedFileName: filename,
        contentType,
        size: file.size,
        storage: "local",
      },
      "Tải tệp lên thành công (cục bộ)",
    )
  } catch (error) {
    console.error("Upload error:", error)
    return apiError("Lỗi tải tệp lên", 500)
  }
}

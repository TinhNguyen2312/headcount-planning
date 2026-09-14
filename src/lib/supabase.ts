import { createClient } from "@supabase/supabase-js"

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  "https://aqcznssfntdqnttmmjsl.supabase.co"

const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  ""

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey)

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : null

/**
 * Upload buffer to Supabase Storage bucket
 * Returns public URL if successful, or null on failure
 */
export async function uploadToSupabaseStorage(
  fileBuffer: Buffer,
  filename: string,
  contentType: string,
  bucketName = process.env.SUPABASE_STORAGE_BUCKET || "uploads",
): Promise<string | null> {
  if (!supabase) {
    return null
  }

  try {
    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filename, fileBuffer, {
        contentType,
        upsert: true,
      })

    // If bucket does not exist, try creating it automatically as public
    if (
      uploadError &&
      (uploadError.statusCode === "404" ||
        uploadError.message?.toLowerCase().includes("not found"))
    ) {
      try {
        await supabase.storage.createBucket(bucketName, { public: true })
        const { error: retryError } = await supabase.storage
          .from(bucketName)
          .upload(filename, fileBuffer, {
            contentType,
            upsert: true,
          })
        if (retryError) {
          console.warn("Supabase Storage retry failed:", retryError.message)
          return null
        }
      } catch (bucketErr) {
        console.warn("Could not auto-create Supabase bucket:", bucketErr)
        return null
      }
    } else if (uploadError) {
      console.warn("Supabase Storage upload warning:", uploadError.message)
      return null
    }

    const { data } = supabase.storage.from(bucketName).getPublicUrl(filename)
    return data?.publicUrl || null
  } catch (err) {
    console.error("Supabase Storage exception:", err)
    return null
  }
}

/**
 * Generate direct public CDN URL for an object in Supabase Storage
 */
export function getSupabasePublicUrl(
  pathOrFilename: string,
  bucketName = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || "uploads",
): string {
  if (!pathOrFilename) return ""
  const trimmed = pathOrFilename.trim()
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed
  }
  const clean = trimmed
    .replace(/^\/+/, "")
    .replace(/^(api\/)?(uploads\/|data\/uploads\/)?/, "")
  return `${supabaseUrl}/storage/v1/object/public/${bucketName}/${clean}`
}

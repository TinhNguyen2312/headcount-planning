import * as dotenv from "dotenv"
dotenv.config()
import postgres from "postgres"
import { ALL_PERMISSIONS_METADATA } from "../src/server/core/permissions"

let connectionString =
  process.env.DATABASE_URL || process.env.SUPABASE_POSTGRES_URL || ""

if (connectionString.includes("pooler.supabase.com:5432")) {
  connectionString = connectionString.replace(":5432", ":6543")
}

if (!connectionString) {
  console.error("LỖI: DATABASE_URL hoặc SUPABASE_POSTGRES_URL chưa được cấu hình!")
  process.exit(1)
}

const sql = postgres(connectionString, {
  prepare: false,
  ssl: "require",
  max: 1,
})

async function seedPermissions() {
  console.log(`🚀 Bắt đầu seed ${ALL_PERMISSIONS_METADATA.length} permissions chi tiết vào database...`)

  let insertedCount = 0
  for (const perm of ALL_PERMISSIONS_METADATA) {
    await sql`
      INSERT INTO permissions (key, label, group_name, scope, description)
      VALUES (
        ${perm.key},
        ${perm.label},
        ${perm.groupName},
        ${perm.scope},
        ${perm.description}
      )
      ON CONFLICT (key) DO UPDATE SET
        label = EXCLUDED.label,
        group_name = EXCLUDED.group_name,
        scope = EXCLUDED.scope,
        description = EXCLUDED.description;
    `
    insertedCount++
  }

  console.log(`✅ Đã đồng bộ thành công ${insertedCount} permissions vào database!`)
  await sql.end()
  process.exit(0)
}

seedPermissions().catch(err => {
  console.error("Lỗi khi seed permissions:", err)
  process.exit(1)
})

import * as dotenv from "dotenv"
dotenv.config()
import postgres from "postgres"

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

async function runMigration() {
  console.log("🚀 Bắt đầu nâng cấp lên Hierarchical RBAC (RBAC1)...")

  try {
    // 1. Bổ sung cột parent_id và index vào access_roles
    console.log("-> 1. Bổ sung cột parent_id vào access_roles...")
    await sql`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'access_roles' AND column_name = 'parent_id'
        ) THEN
          ALTER TABLE access_roles
            ADD COLUMN parent_id INTEGER REFERENCES access_roles(id) ON DELETE SET NULL;
        END IF;
      END $$;
    `

    await sql`
      CREATE INDEX IF NOT EXISTS idx_access_roles_parent 
      ON access_roles(parent_id);
    `

    // 2. Thiết lập quan hệ kế thừa cho các System Roles mẫu
    console.log("-> 2. Cấu hình kế thừa cho các Vai trò hệ thống mẫu...")
    // "Người lập kế hoạch" kế thừa từ "Người xem dự án"
    await sql`
      UPDATE access_roles
      SET parent_id = (SELECT id FROM access_roles WHERE name = 'Người xem dự án')
      WHERE name = 'Người lập kế hoạch'
        AND parent_id IS NULL;
    `

    // "Người duyệt kế hoạch" kế thừa từ "Người lập kế hoạch"
    await sql`
      UPDATE access_roles
      SET parent_id = (SELECT id FROM access_roles WHERE name = 'Người lập kế hoạch')
      WHERE name = 'Người duyệt kế hoạch'
        AND parent_id IS NULL;
    `

    console.log("✅ Nâng cấp Hierarchical RBAC hoàn tất thành công 100%!")
  } catch (error) {
    console.error("❌ Lỗi khi nâng cấp Hierarchical RBAC:", error)
    process.exit(1)
  } finally {
    await sql.end()
  }
}

runMigration()

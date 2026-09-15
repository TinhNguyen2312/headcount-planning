import { sql } from "drizzle-orm"
import { db } from "../src/db"

async function runMigration() {
  console.log("=== Starting Migration: Move lead_time_months from roles to headcount_standards ===")

  try {
    // 1. Add lead_time_months to headcount_standards if not exists
    console.log("1. Adding column lead_time_months to headcount_standards...")
    await db.execute(sql`
      ALTER TABLE headcount_standards
      ADD COLUMN IF NOT EXISTS lead_time_months INTEGER NOT NULL DEFAULT 0;
    `)
    console.log("   Done adding lead_time_months to headcount_standards.")

    // 2. Backfill lead_time_months from roles if roles has lead_time_months column
    console.log("2. Backfilling lead_time_months from roles...")
    const checkRoleCol: any = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'roles' AND column_name = 'lead_time_months';
    `)

    if (checkRoleCol && checkRoleCol.length > 0) {
      await db.execute(sql`
        UPDATE headcount_standards hs
        SET lead_time_months = COALESCE(r.lead_time_months, 0)
        FROM roles r
        WHERE hs.role_id = r.id;
      `)
      console.log("   Backfilled lead_time_months from roles.")

      // 3. Drop lead_time_months column from roles
      console.log("3. Dropping column lead_time_months from roles...")
      await db.execute(sql`
        ALTER TABLE roles
        DROP COLUMN IF EXISTS lead_time_months;
      `)
      console.log("   Dropped lead_time_months from roles.")
    } else {
      console.log("   Column lead_time_months does not exist in roles, skipping drop.")
    }

    // 4. Verify columns in both tables
    console.log("4. Verifying columns...")
    const hsCols: any = await db.execute(sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'headcount_standards' AND column_name = 'lead_time_months';
    `)
    console.log("   headcount_standards.lead_time_months:", hsCols)

    const roleCols: any = await db.execute(sql`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'roles' AND column_name = 'lead_time_months';
    `)
    console.log("   roles.lead_time_months exists?:", roleCols && roleCols.length > 0)

    console.log("=== Migration successfully finished! ===")
    process.exit(0)
  } catch (err) {
    console.error("Migration failed:", err)
    process.exit(1)
  }
}

runMigration()

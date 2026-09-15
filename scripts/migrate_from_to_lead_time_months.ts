import { sql } from "drizzle-orm"
import { db } from "../src/db"

async function runMigration() {
  console.log("=== Starting Migration: Add from_lead_time_months & to_lead_time_months ===")

  let retries = 5
  while (retries > 0) {
    try {
      console.log(`Connecting to database (retries left: ${retries})...`)
      // 1. Check existing columns in headcount_standards
      const cols: any = await db.execute(sql`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'headcount_standards';
      `)
    const colNames = cols.map((c: any) => c.column_name)
    console.log("Existing columns in headcount_standards:", colNames)

    // 2. Add from_lead_time_months if not exists
    if (!colNames.includes("from_lead_time_months")) {
      console.log("2. Adding from_lead_time_months...")
      await db.execute(sql`
        ALTER TABLE headcount_standards
        ADD COLUMN from_lead_time_months INTEGER NOT NULL DEFAULT 0;
      `)

      // If old lead_time_months existed, copy data over
      if (colNames.includes("lead_time_months")) {
        console.log("   Copying data from lead_time_months to from_lead_time_months...")
        await db.execute(sql`
          UPDATE headcount_standards
          SET from_lead_time_months = COALESCE(lead_time_months, 0);
        `)
      }
    }

    // 3. Add to_lead_time_months if not exists
    if (!colNames.includes("to_lead_time_months")) {
      console.log("3. Adding to_lead_time_months...")
      await db.execute(sql`
        ALTER TABLE headcount_standards
        ADD COLUMN to_lead_time_months INTEGER NOT NULL DEFAULT 0;
      `)
    }

    // 4. Drop old lead_time_months if exists
    if (colNames.includes("lead_time_months")) {
      console.log("4. Dropping old lead_time_months column...")
      await db.execute(sql`
        ALTER TABLE headcount_standards
        DROP COLUMN IF EXISTS lead_time_months;
      `)
    }

    // 5. Verify columns in headcount_standards
    console.log("5. Verifying columns...")
    const verifiedCols: any = await db.execute(sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'headcount_standards' 
        AND column_name IN ('from_lead_time_months', 'to_lead_time_months', 'lead_time_months');
    `)
    console.log("   Verified columns:", verifiedCols)

    console.log("=== Migration successfully finished! ===")
    process.exit(0)
  } catch (err: any) {
    retries--
    console.error(`Attempt failed (${err.message}). Retries remaining: ${retries}`)
    if (retries === 0) {
      console.error("Migration failed after all retries:", err)
      process.exit(1)
    }
    await new Promise((resolve) => setTimeout(resolve, 3000))
  }
}
}

runMigration()

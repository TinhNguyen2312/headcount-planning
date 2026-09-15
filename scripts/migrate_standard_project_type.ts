import { sql } from "drizzle-orm"
import { db } from "../src/db"

async function runMigration() {
  console.log("=== Starting Migration: Add project_type to headcount_standards ===")

  let retries = 5
  while (retries > 0) {
    try {
      console.log(`Connecting to database (retries left: ${retries})...`)

      const cols: any = await db.execute(sql`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'headcount_standards';
      `)
      const colNames = cols.map((c: any) => c.column_name)
      console.log("Existing columns in headcount_standards:", colNames)

      if (!colNames.includes("project_type")) {
        console.log("Adding project_type column to headcount_standards...")
        await db.execute(sql`
          ALTER TABLE headcount_standards
          ADD COLUMN project_type VARCHAR(30) NOT NULL DEFAULT 'ALL';
        `)

        console.log("Adding CHECK constraint to project_type...")
        await db.execute(sql`
          ALTER TABLE headcount_standards
          ADD CONSTRAINT headcount_standards_project_type_check 
          CHECK (project_type IN ('ALL', 'LOW_RISE', 'HIGH_RISE', 'MIXED'));
        `)
      } else {
        console.log("Column project_type already exists in headcount_standards.")
      }

      console.log("=== Migration completed successfully! ===")
      const sampleStandards: any = await db.execute(sql`
        SELECT id, role_id, from_milestone_id, to_milestone_id, headcount, project_type 
        FROM headcount_standards 
        LIMIT 5;
      `)
      console.log("Sample standards:", sampleStandards)

      break
    } catch (err: any) {
      console.error(`Migration attempt failed: ${err.message}`)
      retries--
      if (retries === 0) {
        throw err
      }
      console.log("Waiting 3s before retry...")
      await new Promise((res) => setTimeout(res, 3000))
    }
  }
}

runMigration()
  .then(() => {
    console.log("Done.")
    process.exit(0)
  })
  .catch((err) => {
    console.error("Migration failed fatally:", err)
    process.exit(1)
  })

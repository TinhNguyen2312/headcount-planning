import { sql } from "drizzle-orm"
import { db } from "../src/db"

async function runMigration() {
  console.log("=== Starting Migration: Add duration_months to phases ===")

  let retries = 5
  while (retries > 0) {
    try {
      console.log(`Connecting to database (retries left: ${retries})...`)

      // 1. Check existing columns in phases
      const cols: any = await db.execute(sql`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'phases';
      `)
      const colNames = cols.map((c: any) => c.column_name)
      console.log("Existing columns in phases:", colNames)

      if (!colNames.includes("duration_months")) {
        console.log("Adding duration_months column to phases...")
        await db.execute(sql`
          ALTER TABLE phases
          ADD COLUMN duration_months INTEGER NOT NULL DEFAULT 1;
        `)

        console.log("Backfilling duration_months from start_date and end_date...")
        await db.execute(sql`
          UPDATE phases
          SET duration_months = GREATEST(
            1,
            ROUND((end_date - start_date + 1)::numeric / 30.4375)::integer
          );
        `)
      } else {
        console.log("Column duration_months already exists in phases.")
      }

      console.log("=== Migration completed successfully! ===")
      const samplePhases: any = await db.execute(sql`
        SELECT id, plan_id, milestone_id, start_date, end_date, duration_months FROM phases LIMIT 5;
      `)
      console.log("Sample phases:", samplePhases)

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

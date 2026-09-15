import * as dotenv from "dotenv"
dotenv.config()

import postgres from "postgres"

let connectionString =
  process.env.DATABASE_URL || process.env.SUPABASE_POSTGRES_URL || ""

if (connectionString.includes("pooler.supabase.com:5432")) {
  connectionString = connectionString.replace(":5432", ":6543")
}

const client = postgres(connectionString, {
  prepare: false,
  ssl: "require",
  max: 1,
})

async function runMigration() {
  console.log("Connecting to database...")

  try {
    // 1. Add columns start_date, end_date if not exists
    console.log("Adding columns start_date and end_date to phases...")
    await client`ALTER TABLE phases ADD COLUMN IF NOT EXISTS start_date date;`
    await client`ALTER TABLE phases ADD COLUMN IF NOT EXISTS end_date date;`

    // 2. Migrate existing data based on project start_date or current date
    console.log("Migrating existing data to start_date and end_date...")
    await client`
      UPDATE phases p
      SET 
        start_date = COALESCE(
          (pr.start_date + ((p.start_month - 1) || ' month')::interval)::date,
          (CURRENT_DATE + ((p.start_month - 1) || ' month')::interval)::date
        ),
        end_date = COALESCE(
          ((pr.start_date + ((p.start_month + p.duration_months - 1) || ' month')::interval) - interval '1 day')::date,
          ((CURRENT_DATE + ((p.start_month + p.duration_months - 1) || ' month')::interval) - interval '1 day')::date
        )
      FROM plans pl
      JOIN projects pr ON pl.project_id = pr.id
      WHERE p.plan_id = pl.id AND (p.start_date IS NULL OR p.end_date IS NULL);
    `

    // Fallback if any is still null
    await client`
      UPDATE phases
      SET 
        start_date = COALESCE(start_date, CURRENT_DATE),
        end_date = COALESCE(end_date, CURRENT_DATE + interval '30 days')
      WHERE start_date IS NULL OR end_date IS NULL;
    `

    // 3. Set NOT NULL
    console.log("Setting start_date and end_date NOT NULL...")
    await client`ALTER TABLE phases ALTER COLUMN start_date SET NOT NULL;`
    await client`ALTER TABLE phases ALTER COLUMN end_date SET NOT NULL;`

    // 4. Drop old columns
    console.log("Dropping old columns start_month, duration_months, is_anchor...")
    await client`ALTER TABLE phases DROP COLUMN IF EXISTS start_month;`
    await client`ALTER TABLE phases DROP COLUMN IF EXISTS duration_months;`
    await client`ALTER TABLE phases DROP COLUMN IF EXISTS is_anchor;`

    console.log("Checking updated table columns...")
    const cols = await client`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'phases'
      ORDER BY ordinal_position;
    `
    console.log("Updated phases columns:", cols)

    console.log("Phases migration completed successfully!")
  } catch (err) {
    console.error("Migration failed:", err)
    process.exit(1)
  } finally {
    await client.end()
    process.exit(0)
  }
}

runMigration()

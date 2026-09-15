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
    // 1. Add column milestone_id if not exists
    console.log("Adding column milestone_id...")
    await client`ALTER TABLE headcount_standards ADD COLUMN IF NOT EXISTS milestone_id integer;`

    // 2. Populate milestone_id from to_milestone_id or from_milestone_id
    console.log("Migrating data to milestone_id...")
    await client`
      UPDATE headcount_standards 
      SET milestone_id = COALESCE(to_milestone_id, from_milestone_id)
      WHERE milestone_id IS NULL;
    `

    // Fallback if any is still null, set to first milestone
    await client`
      UPDATE headcount_standards 
      SET milestone_id = (SELECT id FROM milestones ORDER BY id ASC LIMIT 1)
      WHERE milestone_id IS NULL;
    `

    // 3. Set NOT NULL
    console.log("Setting milestone_id NOT NULL...")
    await client`ALTER TABLE headcount_standards ALTER COLUMN milestone_id SET NOT NULL;`

    // 4. Drop old constraints
    console.log("Dropping old constraints...")
    await client`ALTER TABLE headcount_standards DROP CONSTRAINT IF EXISTS headcount_standards_from_milestone_id_fkey;`
    await client`ALTER TABLE headcount_standards DROP CONSTRAINT IF EXISTS headcount_standards_to_milestone_id_fkey;`
    await client`ALTER TABLE headcount_standards DROP CONSTRAINT IF EXISTS headcount_standards_milestone_id_fkey;`

    // 5. Add new foreign key constraint
    console.log("Adding new foreign key constraint on milestone_id...")
    await client`
      ALTER TABLE headcount_standards 
      ADD CONSTRAINT headcount_standards_milestone_id_fkey 
      FOREIGN KEY (milestone_id) REFERENCES milestones(id) ON DELETE CASCADE;
    `

    // 6. Drop old columns
    console.log("Dropping old columns from_milestone_id, to_milestone_id...")
    await client`ALTER TABLE headcount_standards DROP COLUMN IF EXISTS from_milestone_id;`
    await client`ALTER TABLE headcount_standards DROP COLUMN IF EXISTS to_milestone_id;`

    console.log("Checking updated table columns...")
    const cols = await client`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'headcount_standards'
      ORDER BY ordinal_position;
    `
    console.log("Updated headcount_standards columns:", cols)

    console.log("Migration completed successfully!")
  } catch (err) {
    console.error("Migration failed:", err)
    process.exit(1)
  } finally {
    await client.end()
    process.exit(0)
  }
}

runMigration()

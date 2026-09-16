import { sql } from "drizzle-orm"
import { db } from "../src/db"

async function runMigration() {
  console.log("=== Starting Migration: Unify project_type to ('ALL', 'LOW_RISE', 'HIGH_RISE', 'MIXED') ===")

  let retries = 5
  while (retries > 0) {
    try {
      console.log(`Connecting to database (retries left: ${retries})...`)

      // 1. Projects table: Check and migrate project_types -> project_type
      const projectCols: any = await db.execute(sql`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'projects';
      `)
      const projectColNames = projectCols.map((c: any) => c.column_name)
      console.log("Projects existing columns:", projectColNames)

      if (!projectColNames.includes("project_type")) {
        console.log("Adding project_type column to projects...")
        await db.execute(sql`
          ALTER TABLE projects
          ADD COLUMN project_type VARCHAR(30) NOT NULL DEFAULT 'HIGH_RISE';
        `)
      }

      if (projectColNames.includes("project_types")) {
        console.log("Migrating data from project_types (jsonb) to project_type (varchar)...")
        await db.execute(sql`
          UPDATE projects
          SET project_type = CASE
            WHEN project_types::text LIKE '%LOW_RISE%' AND project_types::text LIKE '%HIGH_RISE%' THEN 'MIXED'
            WHEN project_types::text LIKE '%LOW_RISE%' THEN 'LOW_RISE'
            ELSE 'HIGH_RISE'
          END;
        `)

        console.log("Dropping old project_types column from projects...")
        await db.execute(sql`
          ALTER TABLE projects
          DROP COLUMN project_types;
        `)
      }

      // Add CHECK constraint on projects.project_type
      await db.execute(sql`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_constraint WHERE conname = 'projects_project_type_check'
          ) THEN
            ALTER TABLE projects
            ADD CONSTRAINT projects_project_type_check 
            CHECK (project_type IN ('ALL', 'LOW_RISE', 'HIGH_RISE', 'MIXED'));
          END IF;
        END $$;
      `)

      // 2. Properties table: Migrate scope -> project_type
      const propCols: any = await db.execute(sql`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'properties';
      `)
      const propColNames = propCols.map((c: any) => c.column_name)
      console.log("Properties existing columns:", propColNames)

      if (!propColNames.includes("project_type")) {
        console.log("Adding project_type column to properties...")
        await db.execute(sql`
          ALTER TABLE properties
          ADD COLUMN project_type VARCHAR(30) NOT NULL DEFAULT 'ALL';
        `)
      }

      if (propColNames.includes("scope")) {
        console.log("Migrating data from scope to project_type in properties...")
        await db.execute(sql`
          UPDATE properties
          SET project_type = CASE
            WHEN scope = 'COMMON' THEN 'ALL'
            WHEN scope = 'LOW_RISE_ONLY' THEN 'LOW_RISE'
            WHEN scope = 'HIGH_RISE_ONLY' THEN 'HIGH_RISE'
            WHEN scope = 'PER_TYPE' THEN 'MIXED'
            ELSE 'ALL'
          END;
        `)

        console.log("Dropping old scope column and constraints from properties...")
        await db.execute(sql`
          ALTER TABLE properties
          DROP CONSTRAINT IF EXISTS properties_scope_check;
        `)
        await db.execute(sql`
          ALTER TABLE properties
          DROP COLUMN scope;
        `)
      }

      // Add CHECK constraint on properties.project_type
      await db.execute(sql`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_constraint WHERE conname = 'properties_project_type_check'
          ) THEN
            ALTER TABLE properties
            ADD CONSTRAINT properties_project_type_check 
            CHECK (project_type IN ('ALL', 'LOW_RISE', 'HIGH_RISE', 'MIXED'));
          END IF;
        END $$;
      `)

      // 3. Property_values table: Update COMMON to ALL
      console.log("Updating property_values: 'COMMON' -> 'ALL'...")
      await db.execute(sql`
        UPDATE property_values
        SET project_type = 'ALL'
        WHERE project_type = 'COMMON' OR project_type IS NULL;
      `)

      // 4. Verification samples
      const sampleProjects: any = await db.execute(sql`
        SELECT id, name, project_type FROM projects LIMIT 5;
      `)
      console.log("Sample projects after migration:", sampleProjects)

      const sampleProps: any = await db.execute(sql`
        SELECT id, code, name, project_type FROM properties;
      `)
      console.log("Sample properties after migration:", sampleProps)

      const samplePropValues: any = await db.execute(sql`
        SELECT DISTINCT project_type FROM property_values;
      `)
      console.log("Distinct project_type in property_values:", samplePropValues)

      console.log("=== Migration completed successfully! ===")
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
    console.error("Migration fatal error:", err)
    process.exit(1)
  })

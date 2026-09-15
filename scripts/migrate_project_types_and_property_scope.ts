import { sql } from "drizzle-orm"
import { db } from "../src/db"

async function runMigration() {
  console.log("=== Starting Migration: project_types & property scope ===")

  let retries = 5
  while (retries > 0) {
    try {
      console.log(`Connecting to database (retries left: ${retries})...`)

      // 1. Projects table: Add project_types JSONB column
      const projectCols: any = await db.execute(sql`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'projects';
      `)
      const projectColNames = projectCols.map((c: any) => c.column_name)
      console.log("Projects existing columns:", projectColNames)

      if (!projectColNames.includes("project_types")) {
        console.log("Adding project_types column to projects...")
        await db.execute(sql`
          ALTER TABLE projects
          ADD COLUMN project_types JSONB NOT NULL DEFAULT '["HIGH_RISE"]'::jsonb;
        `)
      } else {
        console.log("Column project_types already exists in projects.")
      }

      // 2. Properties table: Add scope column
      const propertyCols: any = await db.execute(sql`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'properties';
      `)
      const propertyColNames = propertyCols.map((c: any) => c.column_name)
      console.log("Properties existing columns:", propertyColNames)

      if (!propertyColNames.includes("scope")) {
        console.log("Adding scope column to properties...")
        await db.execute(sql`
          ALTER TABLE properties
          ADD COLUMN scope VARCHAR(20) NOT NULL DEFAULT 'COMMON';
        `)

        await db.execute(sql`
          DO $$
          BEGIN
            IF NOT EXISTS (
              SELECT 1 FROM pg_constraint WHERE conname = 'properties_scope_check'
            ) THEN
              ALTER TABLE properties
              ADD CONSTRAINT properties_scope_check 
              CHECK (scope IN ('COMMON', 'PER_TYPE', 'LOW_RISE_ONLY', 'HIGH_RISE_ONLY'));
            END IF;
          END $$;
        `)

        console.log("Categorizing existing properties...")
        await db.execute(sql`
          UPDATE properties 
          SET scope = 'PER_TYPE' 
          WHERE code ILIKE '%SO_CAN%' 
             OR code ILIKE '%DIEN_TICH_SAN%' 
             OR code ILIKE '%GFA%'
             OR name ILIKE '%Số căn%' 
             OR name ILIKE '%Diện tích sàn%';
        `)

        await db.execute(sql`
          UPDATE properties 
          SET scope = 'HIGH_RISE_ONLY' 
          WHERE code ILIKE '%TANG_HAM%' 
             OR code ILIKE '%CHIEU_CAO%'
             OR name ILIKE '%tầng hầm%' 
             OR name ILIKE '%chiều cao tầng%';
        `)
      } else {
        console.log("Column scope already exists in properties.")
      }

      console.log("Ensuring property_values.project_type defaults...")
      await db.execute(sql`
        UPDATE property_values 
        SET project_type = 'COMMON' 
        WHERE project_type IS NULL OR project_type = '';
      `)

      await db.execute(sql`
        ALTER TABLE property_values 
        ALTER COLUMN project_type SET DEFAULT 'COMMON';
      `)

      console.log("=== Migration completed successfully! ===")
      const sampleProjects: any = await db.execute(sql`
        SELECT id, name, project_types FROM projects LIMIT 3;
      `)
      console.log("Sample projects:", sampleProjects)

      const sampleProperties: any = await db.execute(sql`
        SELECT id, code, name, scope FROM properties LIMIT 5;
      `)
      console.log("Sample properties:", sampleProperties)

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

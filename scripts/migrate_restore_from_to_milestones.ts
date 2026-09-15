import { db } from "../src/db"
import { sql } from "drizzle-orm"

async function runMigration() {
  console.log("================================================================================")
  console.log("BẮT ĐẦU MIGRATION: KHÔI PHỤC FROM_MILESTONE_ID VÀ TO_MILESTONE_ID")
  console.log("================================================================================")

  // 1. Check current columns
  const cols = await db.execute(sql`
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = 'headcount_standards';
  `)
  const colNames = cols.map((c: any) => c.column_name)
  console.log("Current columns:", colNames)

  // 2. Add from_milestone_id if not exists
  if (!colNames.includes("from_milestone_id")) {
    console.log("-> Adding column from_milestone_id...")
    await db.execute(sql`
      ALTER TABLE headcount_standards 
      ADD COLUMN from_milestone_id INT REFERENCES milestones(id) ON DELETE CASCADE;
    `)
  }

  // 3. Add to_milestone_id if not exists
  if (!colNames.includes("to_milestone_id")) {
    console.log("-> Adding column to_milestone_id...")
    await db.execute(sql`
      ALTER TABLE headcount_standards 
      ADD COLUMN to_milestone_id INT REFERENCES milestones(id) ON DELETE SET NULL;
    `)
  }

  // 4. Migrate data from milestone_id if it exists
  if (colNames.includes("milestone_id")) {
    console.log("-> Migrating existing rows from milestone_id to from_milestone_id and to_milestone_id...")

    // First default from_milestone_id = milestone_id
    await db.execute(sql`
      UPDATE headcount_standards 
      SET from_milestone_id = milestone_id 
      WHERE from_milestone_id IS NULL AND milestone_id IS NOT NULL;
    `)

    // Intelligent mapping for known role stages based on notes / milestone_id:
    // San lấp (M01 -> M04): if milestone_id is 4 (M04), set from=1 (M01), to=4 (M04)
    await db.execute(sql`
      UPDATE headcount_standards 
      SET from_milestone_id = 1, to_milestone_id = 4 
      WHERE milestone_id = 4 AND (note ILIKE '%san lấp%' OR note ILIKE '%san lap%');
    `)

    // Cọc (M04 -> M06): if note mentions cọc / robot
    await db.execute(sql`
      UPDATE headcount_standards 
      SET from_milestone_id = 4, to_milestone_id = 6 
      WHERE note ILIKE '%cọc%' OR note ILIKE '%coc%' OR note ILIKE '%robot%';
    `)

    // Hạ tầng kỹ thuật (M04 -> M08)
    await db.execute(sql`
      UPDATE headcount_standards 
      SET from_milestone_id = 4, to_milestone_id = 8 
      WHERE note ILIKE '%hạ tầng%' OR note ILIKE '%ha tang%' OR note ILIKE '%htkt%';
    `)

    // Thi công nhà thấp tầng (M06 -> M10)
    await db.execute(sql`
      UPDATE headcount_standards 
      SET from_milestone_id = 6, to_milestone_id = 10 
      WHERE note ILIKE '%nhà thô%' OR note ILIKE '%villa%' OR note ILIKE '%thấp tầng%' OR note ILIKE '%thap tang%';
    `)

    // PMD (M01 -> M12)
    await db.execute(sql`
      UPDATE headcount_standards 
      SET from_milestone_id = 1, to_milestone_id = 12 
      WHERE role_id IN (30, 31, 32);
    `)

    // PLP (M01 -> M02 hoặc M01 -> M19)
    await db.execute(sql`
      UPDATE headcount_standards 
      SET from_milestone_id = 1, to_milestone_id = 2 
      WHERE role_id IN (33, 34, 35, 36, 37);
    `)

    // DMD (M01 -> M03)
    await db.execute(sql`
      UPDATE headcount_standards 
      SET from_milestone_id = 1, to_milestone_id = 3 
      WHERE role_id IN (22, 23, 24, 25, 26, 27, 28, 29);
    `)

    // 5. Ensure from_milestone_id is NOT NULL
    await db.execute(sql`
      UPDATE headcount_standards 
      SET from_milestone_id = 1 
      WHERE from_milestone_id IS NULL;
    `)

    await db.execute(sql`
      ALTER TABLE headcount_standards 
      ALTER COLUMN from_milestone_id SET NOT NULL;
    `)

    // 6. Drop milestone_id column
    console.log("-> Dropping milestone_id column...")
    await db.execute(sql`
      ALTER TABLE headcount_standards 
      DROP COLUMN milestone_id;
    `)
  }

  // 7. Verify result
  const finalCols = await db.execute(sql`
    SELECT column_name, data_type, is_nullable 
    FROM information_schema.columns 
    WHERE table_name = 'headcount_standards'
    ORDER BY ordinal_position;
  `)
  console.log("\nFINAL COLUMNS IN headcount_standards:")
  for (const c of finalCols) {
    console.log(`- ${c.column_name}: ${c.data_type} (nullable: ${c.is_nullable})`)
  }

  const sampleRows = await db.execute(sql`
    SELECT hs.id, r.name as role_name, m1.code as from_code, m2.code as to_code, hs.headcount, hs.duration_months
    FROM headcount_standards hs
    LEFT JOIN roles r ON hs.role_id = r.id
    LEFT JOIN milestones m1 ON hs.from_milestone_id = m1.id
    LEFT JOIN milestones m2 ON hs.to_milestone_id = m2.id
    LIMIT 10;
  `)
  console.log("\nSAMPLE MIGRATED ROWS:")
  for (const r of sampleRows) {
    console.log(`ID ${r.id} | Role: ${r.role_name} | ${r.from_code} -> ${r.to_code || 'null'} | Headcount: ${r.headcount} | Duration: ${r.duration_months}T`)
  }

  console.log("================================================================================")
  console.log("MIGRATION HOÀN TẤT THÀNH CÔNG!")
  console.log("================================================================================")
  process.exit(0)
}

runMigration().catch((e) => {
  console.error("Lỗi migration:", e)
  process.exit(1)
})

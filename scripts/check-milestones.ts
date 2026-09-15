import * as dotenv from "dotenv";
dotenv.config();

import { db } from "../src/db";
import { milestones, milestoneDependencies } from "../drizzle/schema";
import { sql } from "drizzle-orm";

async function main() {
  const allMilestones = await db.execute(sql`SELECT id, code, name, is_active FROM milestones ORDER BY id ASC;`);
  console.log("=== TỔNG SỐ MILESTONES HIỆN TẠI ===", allMilestones.length);
  console.table(allMilestones);

  const allDependencies = await db.execute(sql`
    SELECT md.id, md.from_milestone_id, m1.code as from_code, md.to_milestone_id, m2.code as to_code, md.dependency_type
    FROM milestone_dependencies md
    JOIN milestones m1 ON md.from_milestone_id = m1.id
    JOIN milestones m2 ON md.to_milestone_id = m2.id
    ORDER BY md.from_milestone_id ASC;
  `);
  console.log("=== TỔNG SỐ LIÊN KẾT DEPENDENCIES ===", allDependencies.length);
  console.table(allDependencies);

  process.exit(0);
}

main().catch(e => {
  console.error("Lỗi:", e);
  process.exit(1);
});

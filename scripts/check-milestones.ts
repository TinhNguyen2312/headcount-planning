import * as dotenv from "dotenv";
dotenv.config();

import { db } from "../src/db";
import { milestones, milestoneDependencies } from "../drizzle/schema";

async function main() {
  const m = await db.select().from(milestones);
  console.log("Milestones count:", m.length);
  if (m.length > 0) {
    console.log("Sample milestones:", m.slice(0, 5));
  }
  const md = await db.select().from(milestoneDependencies);
  console.log("Milestone dependencies count:", md.length);
  if (md.length > 0) {
    console.log("Sample dependencies:", md.slice(0, 5));
  }
  process.exit(0);
}

main().catch((e) => {
  console.error("Error:", e);
  process.exit(1);
});

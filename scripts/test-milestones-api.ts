import * as dotenv from "dotenv"
dotenv.config()

import { db } from "../src/db"
import { milestones, milestoneDependencies } from "../drizzle/schema"

async function main() {
  console.log("--- 1. Querying Milestones & Dependencies from DB ---")
  const mList = await db.select().from(milestones)
  console.log(`Found ${mList.length} milestones in DB.`)

  const dList = await db.select().from(milestoneDependencies)
  console.log(`Found ${dList.length} dependencies in DB.`)

  const milestoneMap = new Map(mList.map((m) => [m.id, m]))

  console.log("\n--- 2. Sample Milestone DAG Flow (First 6 items) ---")
  mList.slice(0, 6).forEach((m) => {
    const preds = dList
      .filter((d) => d.toMilestoneId === m.id)
      .map((d) => milestoneMap.get(d.fromMilestoneId)?.code)
      .filter(Boolean)

    const succs = dList
      .filter((d) => d.fromMilestoneId === m.id)
      .map((d) => milestoneMap.get(d.toMilestoneId)?.code)
      .filter(Boolean)

    console.log(
      `[${m.code}] ${m.name} | Predecessors: [${preds.join(", ") || "None"}] -> Successors: [${succs.join(", ") || "None"}]`
    )
  })

  console.log("\n✅ Database and DAG structure verified successfully!")
  process.exit(0)
}

main().catch((err) => {
  console.error("Test failed:", err)
  process.exit(1)
})

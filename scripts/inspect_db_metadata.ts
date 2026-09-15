import { db, roles, milestones, properties, departments } from "../src/db"

async function run() {
  const depts = await db.select().from(departments)
  console.log("=== DEPARTMENTS ===")
  for (const d of depts) {
    console.log(`${d.id} | ${d.code} | ${d.name}`)
  }

  const allRoles = await db.select().from(roles)
  console.log("\n=== ROLES (" + allRoles.length + ") ===")
  for (const r of allRoles) {
    console.log(`${r.id} | ${r.code || ""} | ${r.name} | dept:${r.departmentId} | method:${r.planningMethod}`)
  }

  const ms = await db.select().from(milestones)
  console.log("\n=== MILESTONES (" + ms.length + ") ===")
  for (const m of ms) {
    console.log(`${m.id} | ${m.code} | ${m.name}`)
  }

  const props = await db.select().from(properties)
  console.log("\n=== PROPERTIES (" + props.length + ") ===")
  for (const p of props) {
    console.log(`${p.id} | ${p.code} | ${p.name} | ${p.dataType} | unit:${p.unit}`)
  }

  process.exit(0)
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})

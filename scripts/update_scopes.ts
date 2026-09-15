import { sql } from "drizzle-orm"
import { db } from "../src/db"

async function updateSpecificScopes() {
  await db.execute(sql`UPDATE properties SET scope = 'PER_TYPE' WHERE id = 2;`)
  await db.execute(sql`UPDATE properties SET scope = 'LOW_RISE_ONLY' WHERE id = 3;`)
  await db.execute(sql`UPDATE properties SET scope = 'HIGH_RISE_ONLY' WHERE id = 7;`)
  const rows: any = await db.execute(sql`SELECT id, code, name, scope FROM properties WHERE id IN (2, 3, 7);`)
  console.log("Updated scopes:", rows)
}

updateSpecificScopes().then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1) })

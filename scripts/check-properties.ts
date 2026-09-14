import * as dotenv from "dotenv"
dotenv.config()

import { db } from "../src/db"
import { properties, propertyValues } from "../drizzle/schema"

async function main() {
  const pList = await db.select().from(properties)
  console.log("Properties in DB:", pList.length)
  if (pList.length > 0) {
    console.log(pList)
  }
  const pvList = await db.select().from(propertyValues)
  console.log("PropertyValues in DB:", pvList.length)
  if (pvList.length > 0) {
    console.log(pvList)
  }
  process.exit(0)
}

main().catch((err) => {
  console.error("Error:", err)
  process.exit(1)
})

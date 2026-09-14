import * as dotenv from "dotenv";
dotenv.config();

import { db, users, sectors, regions, projects } from "../db";
import { count } from "drizzle-orm";

async function main() {
  console.log("Connecting to Supabase PostgreSQL...");
  const userCount = await db.select({ value: count() }).from(users);
  const sectorCount = await db.select({ value: count() }).from(sectors);
  const regionCount = await db.select({ value: count() }).from(regions);
  const projectCount = await db.select({ value: count() }).from(projects);

  console.log("Supabase connection successful!");
  console.log(`Users: ${userCount[0].value}`);
  console.log(`Sectors: ${sectorCount[0].value}`);
  console.log(`Regions: ${regionCount[0].value}`);
  console.log(`Projects: ${projectCount[0].value}`);

  const allUsers = await db.select().from(users).limit(3);
  console.log("Sample users:", allUsers.map(u => ({ id: u.id, email: u.email, name: u.fullName })));
  process.exit(0);
}

main().catch((err) => {
  console.error("Connection failed:", err);
  process.exit(1);
});

import * as dotenv from "dotenv";
dotenv.config();

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { sql } from "drizzle-orm";
import { db, roles, users } from "../db";
import { hashPassword } from "../src/lib/security";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log("=".repeat(60));
  console.log("  Restore roles + users from mock-data");
  console.log("=".repeat(60));

  // ─── Reset sequences & clear only roles/users ──────────────────
  await db.execute(sql`TRUNCATE TABLE sessions RESTART IDENTITY CASCADE`);
  await db.execute(sql`TRUNCATE TABLE user_projects RESTART IDENTITY CASCADE`);
  await db.execute(sql`TRUNCATE TABLE users RESTART IDENTITY CASCADE`);
  await db.execute(sql`TRUNCATE TABLE roles RESTART IDENTITY CASCADE`);
  console.log("[+] Cleared roles, users, sessions, user_projects");

  // ─── Restore ROLES ─────────────────────────────────────────────
  const rolesJson = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, "../mock-data/roles.json"), "utf-8")
  );
  const roleRecords: any[] = rolesJson.result ?? [];

  // Sort by id để đảm bảo parent insert trước con
  roleRecords.sort((a: any, b: any) => a.id - b.id);

  // Map old id → new id (vì SERIAL reset về 1)
  const oldToNewRoleId = new Map<number, number>();

  for (const r of roleRecords) {
    const parentRoleId = r.parentRoleId
      ? (oldToNewRoleId.get(r.parentRoleId) ?? null)
      : null;

    const [inserted] = await db
      .insert(roles)
      .values({
        code: r.code ?? null,
        shortCode: r.shortCode ?? null,
        name: r.name,
        level: r.level ?? 1,
        parentRoleId: parentRoleId,
        departmentId: r.departmentId ?? null,
        description: r.description ?? null,
      })
      .returning({ id: roles.id });

    oldToNewRoleId.set(r.id, inserted.id);
    console.log(`  [role] "${r.shortCode ?? r.name}" → new id=${inserted.id}`);
  }
  console.log(`[+] Restored ${roleRecords.length} roles\n`);

  // ─── Restore USERS ─────────────────────────────────────────────
  const usersJson = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, "../mock-data/users.json"), "utf-8")
  );
  const userRecords: any[] = usersJson.list ?? [];

  // Map roleId by position (role code = positionId in users.json)
  // Build lookup: role.code → new role.id
  const allRoles = await db.select().from(roles);
  const roleCodeToId = new Map<string, number>(
    allRoles.map((r) => [r.code ?? "", r.id])
  );

  let userInserted = 0;
  for (const u of userRecords) {
    const email = u.email ?? null;
    const phone = u.phone ?? null;
    const perNumber = u.perNumber ?? null;

    // Resolve role via positionId → role.code
    const positionCode = String(u.position ?? u.positionId ?? "");
    const roleId = roleCodeToId.get(positionCode) ?? null;

    try {
      await db.insert(users).values({
        fullName: u.fullName ?? "N/A",
        email: email,
        phone: phone,
        perNumber: perNumber,
        status: u.status === 0 || u.status === "0" ? "ACTIVE" : "ACTIVE",
        roleId: roleId,
        systemRole: "USER",
        departmentCode: u.department ?? null,
        divisionCode: u.division ?? null,
        managerPerNumber: u.managerID ? String(u.managerID) : null,
        provider: "LOCAL",
      });
      userInserted++;
    } catch (err: any) {
      // Skip duplicates (email/phone/perNumber conflict)
      console.warn(`  [skip] ${u.fullName} (${email}): ${err?.message?.split("\n")[0]}`);
    }
  }
  console.log(`[+] Restored ${userInserted}/${userRecords.length} users\n`);

  // ─── Restore admin user ────────────────────────────────────────
  const adminPasswordHash = await hashPassword("123456");
  const adminExists = await db
    .select()
    .from(users)
    .where(sql`email = 'admin@gmail.com'`)
    .limit(1);

  if (adminExists.length === 0) {
    await db.insert(users).values({
      fullName: "Quản trị hệ thống",
      email: "admin@gmail.com",
      phone: "0328814770",
      perNumber: "00000",
      passwordHash: adminPasswordHash,
      status: "ACTIVE",
      roleId: null,
      systemRole: "SUPER_ADMIN",
      provider: "LOCAL",
    });
    console.log("[+] Re-inserted admin@gmail.com with password '123456'");
  } else {
    await db
      .update(users)
      .set({
        passwordHash: adminPasswordHash,
        status: "ACTIVE",
        systemRole: "SUPER_ADMIN",
      })
      .where(sql`email = 'admin@gmail.com'`);
    console.log("[+] Updated admin@gmail.com with password '123456'");
  }

  console.log("=".repeat(60));
  console.log("[Done] roles & users restored successfully.");
  console.log("=".repeat(60));
  process.exit(0);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});

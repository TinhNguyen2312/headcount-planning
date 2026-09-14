import * as dotenv from "dotenv";
dotenv.config();

import { db, departments } from "../db";
import { sql, count } from "drizzle-orm";

async function main() {
  // Bước 1: TRUNCATE toàn bộ departments + reset SERIAL id + cascade FK
  await db.execute(sql`TRUNCATE TABLE departments RESTART IDENTITY CASCADE`);
  console.log("[+] Truncated departments table (all records deleted, ID reset to 1).");

  // Bước 2: Re-insert 8 records gốc
  // Insert PCD trước vì PCD_XD, PCD_MEP, PCD_HTKT tham chiếu nó
  const [pcd] = await db
    .insert(departments)
    .values({
      code: "PCD",
      name: "Ban Quản lý Xây dựng",
      type: "Ban",
      level: 1,
      parentId: null,
      status: "ACTIVE",
      description: "Project Construction Department",
    })
    .returning({ id: departments.id });
  console.log(`[+] Inserted PCD (id=${pcd.id})`);

  // 3 bộ phận con của PCD
  const children = [
    { code: "PCD_XD",   name: "Bộ phận Quản lý Xây dựng",         description: "Bộ phận Giám sát Xây dựng" },
    { code: "PCD_MEP",  name: "Bộ phận Quản lý Cơ điện",           description: "Bộ phận Quản lý MEP" },
    { code: "PCD_HTKT", name: "Bộ phận Quản lý Hạ tầng kỹ thuật",  description: "Bộ phận Quản lý Hạ tầng" },
  ];
  for (const child of children) {
    await db.insert(departments).values({
      ...child,
      type: "Bộ phận",
      level: 2,
      parentId: pcd.id,
      status: "ACTIVE",
    });
    console.log(`[+] Inserted ${child.code}`);
  }

  // 4 ban độc lập (không có parent)
  const standalone = [
    { code: "PMD", name: "Ban Điều hành Dự án",          description: "Project Management Department" },
    { code: "PLP", name: "Ban Pháp lý Dự án",             description: "Project Legal Procedure" },
    { code: "DMD", name: "Ban Quản lý Thiết kế",          description: "Design Management Department" },
    { code: "OM",  name: "Ban Quản lý Vận hành Dự án",    description: "Operation Management" },
  ];
  for (const s of standalone) {
    await db.insert(departments).values({
      ...s,
      type: "Ban",
      level: 1,
      parentId: null,
      status: "ACTIVE",
    });
    console.log(`[+] Inserted ${s.code}`);
  }

  // Bước 3: Verify
  const [{ value: total }] = await db.select({ value: count() }).from(departments);
  console.log(`\n[Done] departments table now has ${total} records (should be 8).`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});

import * as dotenv from "dotenv";
dotenv.config();

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { eq, sql } from "drizzle-orm";
import { db, departments } from "../db";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// ── Types ──────────────────────────────────────────────────────────────────
interface DeptNode {
  code       : string;
  name       : string;
  type       : string;
  level      : number;
  status     : "ACTIVE" | "INACTIVE";
  parentCode : string | null;
  source     : string | null;
  startDate  : string | null;
  endDate    : string | null;
  createdAt  : string | null;
  updatedAt  : string | null;
  children   : DeptNode[];
}

// ── BFS flatten: trả về mảng đã sắp xếp cha trước con ────────────────────
function bfsFlat(root: DeptNode): DeptNode[] {
  const result: DeptNode[] = [];
  const queue: DeptNode[]  = [root];
  while (queue.length) {
    const node = queue.shift()!;
    result.push(node);
    for (const child of node.children) queue.push(child);
  }
  return result;
}

// ── Main ───────────────────────────────────────────────────────────────────
async function main() {
  console.log("=".repeat(62));
  console.log("  Seed departments.json → Supabase DB (upsert by code)  ");
  console.log("=".repeat(62));

  const jsonPath = path.resolve(__dirname, "../mock-data/departments.json");
  const raw      = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));

  // departments.json mới có dạng { meta: {...}, tree: <single root node> }
  const root: DeptNode = raw.tree ?? raw;

  console.log(`[*] Root     : [${root.code}] ${root.name}`);
  console.log(`[*] Excluded : ${JSON.stringify(raw.meta?.excluded ?? [])}`);
  console.log(`[*] Total    : ${raw.meta?.totalNodes ?? "?"} nodes`);
  console.log();

  const flatList = bfsFlat(root);
  console.log(`[*] BFS flattened: ${flatList.length} nodes\n`);

  // Map code → DB id (dùng để resolve parentId)
  const codeToId = new Map<string, number>();

  // Load existing departments để tránh reinsert
  const existing = await db.select({ id: departments.id, code: departments.code }).from(departments);
  for (const e of existing) {
    codeToId.set(e.code, e.id);
  }
  console.log(`[*] Existing in DB: ${existing.length} departments (giữ nguyên)\n`);

  let inserted  = 0;
  let updated   = 0;
  let skipped   = 0;
  let failed    = 0;
  const BATCH   = 50;

  for (let i = 0; i < flatList.length; i++) {
    const node = flatList[i];

    // Resolve parent_id
    const parentId = node.parentCode ? (codeToId.get(node.parentCode) ?? null) : null;

    const values = {
      code       : node.code,
      name       : node.name.slice(0, 254),
      type       : node.type,
      level      : Math.max(0, node.level),
      parentId   : parentId,
      status     : (node.status === "ACTIVE" ? "ACTIVE" : "INACTIVE") as "ACTIVE" | "INACTIVE",
      startDate  : node.startDate ?? null,
      endDate    : node.endDate   ?? null,
      metadata   : { source: node.source } as any,
    };

    try {
      const already = codeToId.get(node.code);

      if (already) {
        // Update để đảm bảo parentId và type đúng
        await db
          .update(departments)
          .set({ ...values, updatedAt: new Date().toISOString().replace("T", " ").slice(0, 19) })
          .where(eq(departments.code, node.code));
        updated++;
      } else {
        const [created] = await db
          .insert(departments)
          .values(values)
          .returning({ id: departments.id });
        codeToId.set(node.code, created.id);
        inserted++;
      }
    } catch (err: any) {
      console.error(`  [-] FAIL [${node.code}] ${node.name}: ${err?.message?.split("\n")[0]}`);
      failed++;
    }

    // Progress mỗi BATCH records
    if ((i + 1) % BATCH === 0 || i === flatList.length - 1) {
      const pct = (((i + 1) / flatList.length) * 100).toFixed(1);
      process.stdout.write(
        `\r    Progress: ${i + 1}/${flatList.length} (${pct}%)  ` +
        `inserted=${inserted} updated=${updated} failed=${failed}`
      );
    }
  }

  console.log("\n");
  console.log("=".repeat(62));
  console.log(`[Done]`);
  console.log(`  Inserted : ${inserted}`);
  console.log(`  Updated  : ${updated}`);
  console.log(`  Failed   : ${failed}`);
  console.log(`  Total DB : ${existing.length + inserted}`);
  console.log("=".repeat(62));

  process.exit(0);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});

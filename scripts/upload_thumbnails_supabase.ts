import * as dotenv from "dotenv";
dotenv.config();

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";
import { eq } from "drizzle-orm";
import { db, projects } from "../db";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  "https://aqcznssfntdqnttmmjsl.supabase.co";

const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "";

const BUCKET_NAME = process.env.SUPABASE_STORAGE_BUCKET || "uploads";

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("[-] Supabase URL or Key is missing from .env!");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

interface MockProject {
  id?: number;
  name: string;
  thumbnail?: string | null;
  [key: string]: unknown;
}

function getContentType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  switch (ext) {
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".webp":
      return "image/webp";
    case ".svg":
      return "image/svg+xml";
    case ".gif":
      return "image/gif";
    default:
      return "application/octet-stream";
  }
}

async function main() {
  console.log("============================================================");
  console.log("  Upload Project Thumbnails to Supabase Storage & Database  ");
  console.log("============================================================");
  console.log(`[*] Supabase URL   : ${SUPABASE_URL}`);
  console.log(`[*] Storage Bucket : ${BUCKET_NAME}`);

  // Ensure bucket exists
  const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
  if (bucketError) {
    console.warn("[!] Warning checking buckets:", bucketError.message);
  } else {
    const bucketExists = buckets?.some((b) => b.name === BUCKET_NAME);
    if (!bucketExists) {
      console.log(`[*] Creating public bucket '${BUCKET_NAME}'...`);
      await supabase.storage.createBucket(BUCKET_NAME, { public: true });
    }
  }

  // Load mock projects
  const jsonPath = path.resolve(__dirname, "../mock-data/projects.json");
  if (!fs.existsSync(jsonPath)) {
    console.error(`[-] File not found: ${jsonPath}`);
    process.exit(1);
  }

  const raw = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
  const mockProjects: MockProject[] = Array.isArray(raw)
    ? raw
    : raw.result || [];

  console.log(`[*] Loaded ${mockProjects.length} projects from ${path.basename(jsonPath)}`);

  // Load existing DB projects
  const dbProjects = await db.select().from(projects);
  console.log(`[*] Found ${dbProjects.length} projects in database\n`);

  const imagesDir = path.resolve(__dirname, "../downloaded_images");

  let updatedCount = 0;
  let failedCount = 0;

  for (const [idx, mockProj] of mockProjects.entries()) {
    const projName = mockProj.name;
    const thumbnailPath = mockProj.thumbnail;

    console.log(`[${idx + 1}/${mockProjects.length}] Processing '${projName}'...`);

    if (!thumbnailPath) {
      console.log(`    [-] No thumbnail defined in mock data. Skipping.`);
      continue;
    }

    // Find image file from downloaded_images directory
    const filename = path.basename(thumbnailPath);
    const localFilePath = path.join(imagesDir, filename);

    if (!fs.existsSync(localFilePath)) {
      console.warn(`    [-] Local image file not found: ${localFilePath}`);
      failedCount++;
      continue;
    }

    const fileBuffer = fs.readFileSync(localFilePath);
    const contentType = getContentType(filename);

    console.log(`    [*] Uploading '${filename}' (${(fileBuffer.length / 1024).toFixed(2)} KB, ${contentType})...`);

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filename, fileBuffer, {
        contentType,
        upsert: true,
      });

    if (uploadError) {
      console.error(`    [-] Upload to Supabase Storage failed: ${uploadError.message}`);
      failedCount++;
      continue;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filename);
    const publicUrl = urlData.publicUrl;

    console.log(`    [+] Storage Public URL: ${publicUrl}`);

    // Find matching project in DB by name
    const matchedDbProject = dbProjects.find(
      (p) => p.name.trim().toLowerCase() === projName.trim().toLowerCase()
    );

    if (!matchedDbProject) {
      console.warn(`    [!] No DB project found matching name '${projName}'.`);
      failedCount++;
      continue;
    }

    // Update thumbnail in DB
    await db
      .update(projects)
      .set({ thumbnail: publicUrl })
      .where(eq(projects.id, matchedDbProject.id));

    console.log(`    [+] Updated DB project [ID: ${matchedDbProject.id}] '${matchedDbProject.name}' thumbnail.`);
    updatedCount++;
    console.log();
  }

  console.log("============================================================");
  console.log(`[Done] Successfully updated: ${updatedCount} | Failed: ${failedCount}`);
  console.log("============================================================");

  process.exit(0);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});

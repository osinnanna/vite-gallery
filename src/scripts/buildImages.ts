/**
 * Build-time Image Processor
 * 
 * This script runs during the build/dev phase. It:
 * 1. Fetches all image metadata from Supabase Storage.
 * 2. Uses 'sharp' to probe image dimensions and generate tiny base64 placeholders.
 * 3. Writes a static JSON manifest to 'src/data/images.json'.
 * 
 * This approach mimics Next.js 'getStaticProps' but for a Vite SPA.
 */

import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure env vars are loaded (Bun handles .env automatically)
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;
const bucketName = process.env.VITE_SUPABASE_BUCKET || process.env.SUPABASE_BUCKET || "images";

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY env vars.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fetchBuffer(url: string): Promise<Buffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} fetching ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

async function describe(blobUrl: string): Promise<{
  width: number;
  height: number;
  blurDataUrl: string;
}> {
  try {
    const buf = await fetchBuffer(blobUrl);
    const meta = await sharp(buf).metadata();
    const placeholder = await sharp(buf)
      .resize(10)
      .jpeg({ quality: 70 })
      .toBuffer();
    return {
      width: meta.width ?? 0,
      height: meta.height ?? 0,
      blurDataUrl: `data:image/jpeg;base64,${placeholder.toString("base64")}`,
    };
  } catch (e) {
    console.error(`Error processing ${blobUrl}:`, e);
    return { width: 0, height: 0, blurDataUrl: "" };
  }
}

async function getResults() {
  console.log(`Listing images from Supabase bucket: ${bucketName}...`);
  const { data, error } = await supabase.storage.from(bucketName).list("", {
    sortBy: { column: "name", order: "asc" },
  });

  if (error) {
    console.error("Supabase Storage Error:", error.message);
    console.error("Full error object:", JSON.stringify(error, null, 2));
    throw error;
  }

  console.log("Raw data from Supabase:", JSON.stringify(data, null, 2));

  if (!data || data.length === 0) {
    console.warn(`No files found in bucket "${bucketName}".`);
    console.warn("Hint: Check if you have an RLS policy allowing 'SELECT' (list) access to the bucket.");
    return [];
  }

  const images = await Promise.all(
    data
      .filter((item) => item.id) // Files HAVE an id, folders DO NOT (opposite of my previous logic error)
      .filter((item) => /\.(jpe?g|png|webp|avif)$/i.test(item.name))
      .map(async (item, index) => {
        const { data: { publicUrl } } = supabase.storage
          .from(bucketName)
          .getPublicUrl(item.name);
        
        console.log(`Processing [${index + 1}/${data.length}]: ${item.name}`);
        const info = await describe(publicUrl);
        return {
          id: index,
          url: publicUrl,
          ...info,
        };
      })
  );

  return images;
}

async function main() {
  try {
    const results = await getResults();
    const outputPath = path.resolve(__dirname, "../data/images.json");
    fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
    console.log(`Successfully wrote ${results.length} images to ${outputPath}`);
  } catch (e) {
    console.error("Failed to build images:", e);
    process.exit(1);
  }
}

main();

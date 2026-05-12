/**
 * Admin CLI Tool
 * 
 * Features:
 * - Auto-provisions admin user in Supabase.
 * - Monitors a local directory for images.
 * - Processes 'links.txt' for remote image downloads.
 * - Optimizes images to WebP format using Sharp.
 * - Uploads to Supabase Storage.
 */

import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Load environment variables (Bun handles .env automatically)
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const bucketName = process.env.VITE_SUPABASE_BUCKET || "images";
const adminEmail = process.env.ADMIN_EMAIL;
const adminPassword = process.env.ADMIN_PASSWORD;
const uploadDir = path.resolve(process.env.UPLOAD_DIR || "./uploads");

if (!supabaseUrl || !secretKey || !adminEmail || !adminPassword) {
  console.error("Missing required environment variables (SUPABASE_URL, SECRET_KEY, ADMIN_EMAIL, ADMIN_PASSWORD)");
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, secretKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function ensureAdminUser() {
  console.log(`Checking admin user: ${adminEmail}...`);
  const { error } = await supabaseAdmin.auth.admin.createUser({
    email: adminEmail,
    password: adminPassword,
    email_confirm: true
  });

  if (error && error.message.includes("already registered")) {
    console.log("Admin user already exists.");
  } else if (error) {
    console.error("Error creating admin user:", error.message);
  } else {
    console.log("Admin user created successfully.");
  }
}

async function downloadImage(url: string): Promise<Buffer> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch ${url}`);
  return Buffer.from(await response.arrayBuffer());
}

async function processLinks() {
  const linksPath = path.join(uploadDir, "links.txt");
  if (!fs.existsSync(linksPath)) return;

  console.log("Found links.txt. Processing remote images...");
  const content = fs.readFileSync(linksPath, "utf-8");
  const urls = content.split("\n").map(u => u.trim()).filter(u => u.length > 0);

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    const fileName = `remote-${Date.now()}-${i}.webp`;
    console.log(`Processing link [${i + 1}/${urls.length}]: ${url}`);
    
    try {
      const buffer = await downloadImage(url);
      const optimized = await sharp(buffer).webp({ quality: 80 }).toBuffer();
      
      const { error } = await supabaseAdmin.storage
        .from(bucketName)
        .upload(fileName, optimized, { contentType: "image/webp", upsert: true });

      if (error) console.error(`Upload failed for ${fileName}:`, error.message);
      else console.log(`Successfully uploaded: ${fileName}`);
    } catch (e) {
      console.error(`Error processing ${url}:`, e);
    }
  }

  // Clear links.txt after processing
  fs.writeFileSync(linksPath, "");
  console.log("links.txt processed and cleared.");
}

async function processLocalFiles() {
  const files = fs.readdirSync(uploadDir);
  const imageFiles = files.filter(file => /\.(jpe?g|png|webp|avif)$/i.test(file));

  if (imageFiles.length === 0) return;

  console.log(`Found ${imageFiles.length} local images. Processing...`);

  for (const file of imageFiles) {
    const filePath = path.join(uploadDir, file);
    const fileName = path.parse(file).name + ".webp";
    
    try {
      const buffer = await sharp(filePath).webp({ quality: 80 }).toBuffer();
      const { error } = await supabaseAdmin.storage
        .from(bucketName)
        .upload(fileName, buffer, { contentType: "image/webp", upsert: true });

      if (error) console.error(`Upload failed for ${fileName}:`, error.message);
      else {
        console.log(`Successfully uploaded: ${fileName}`);
        fs.unlinkSync(filePath); // Delete local file after successful upload
      }
    } catch (e) {
      console.error(`Error processing ${file}:`, e);
    }
  }
}

async function main() {
  try {
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    await ensureAdminUser();
    await processLinks();
    await processLocalFiles();
    console.log("\nAdmin sync complete!");
  } catch (e) {
    console.error("Admin task failed:", e);
  }
}

main();

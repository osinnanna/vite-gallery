# Admin & Image Management Guide

This project includes a dual-interface system for managing your gallery images. Both tools automatically convert your images to **WebP** format to ensure the gallery stays fast.

## 1. Environment Configuration

Add these secret variables to your `.env` file. 

> **Security Note:** `SUPABASE_SECRET_KEY` is a secret key. It is used **only** by the local CLI tool and is never exposed to the browser.

```env
# Supabase Keys
SUPABASE_SECRET_KEY=sb_secret_...
```
# Admin Credentials

```env
ADMIN_EMAIL=your-admin@example.com
ADMIN_PASSWORD=your-secure-password
```

# Local Upload Directory
```txt
UPLOAD_DIR=./uploads
```

---

## 2. CLI Tool (Bulk Uploads)

The CLI tool is the most powerful way to manage your images. It uses `sharp` for high-quality optimization.

### Usage:
1. **Initialize:** Run the command once to create the upload folder and provision your admin user.
   ```bash
   bun run admin
   ```
2. **Local Sync:** Drop your images (`.jpg`, `.png`, etc.) into the `./uploads` folder and run `bun run admin`. Local files are deleted after successful upload.
3. **Remote Sync (Links):** Create a file at `./uploads/links.txt` and paste image URLs (one per line). Run `bun run admin`. The script will download, optimize, and upload them automatically. `links.txt` is cleared after processing.
4. **Update Gallery:** After uploading, run the build script to update the gallery data:
   ```bash
   bun run dev
   ```

---

## 3. Web Interface (Hosted Uploads)

A hidden administrative dashboard is available at `/admin`.

- **URL:** `http://localhost:5173/admin`
- **Features:** Login, Drag-and-drop uploads, and browser-side WebP conversion.

---

## 4. Supabase Setup (Required)

For the Web Interface to have permission to upload files, you must run this SQL in your **Supabase SQL Editor**:

```sql
-- 1. Allow authenticated users (Admins) to upload files
CREATE POLICY "Allow admin uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'images'); -- Or name of choice

-- 2. Allow authenticated users to overwrite existing files (upsert)
CREATE POLICY "Allow admin updates"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'images'); -- Or name of choice
```

---

## Troubleshooting
- **Zero images in gallery:** Ensure your `images` bucket is set to **Public** in Supabase.
- **CLI login fails:** Ensure your `ADMIN_EMAIL` and `ADMIN_PASSWORD` match what you provided in the `.env`.

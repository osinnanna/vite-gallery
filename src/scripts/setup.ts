/**
 * Template Setup Wizard & Intelligent Installer
 * 
 * Interactively prompts for configuration and generates the .env file.
 * Automatically detects if running in Node.js and pivots the project to be Node-compatible.
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const TSX_VERSION = "4.21.0";

async function setup() {
  console.log("\n🚀 Welcome to the Gallery Setup Wizard!\n");

  const isBun = !!(process as any).versions.bun;
  const runtime = isBun ? "Bun" : "Node.js";
  console.log(`Detected Runtime: ${runtime}\n`);

  const prompt = (question: string, defaultValue: string = "") => {
    const displayDefault = defaultValue ? ` (${defaultValue})` : "";
    process.stdout.write(`${question}${displayDefault}: `);
    return new Promise<string>((resolve) => {
      process.stdin.once("data", (data) => {
        const val = data.toString().trim();
        resolve(val || defaultValue);
      });
    });
  };

  // 1. Pivot to Node if necessary
  if (!isBun) {
    console.log("Since you are using Node.js, I will now configure the project for Node compatibility...");
    
    try {
      console.log(`Installing tsx@${TSX_VERSION} as a development dependency...`);
      execSync(`npm install -D tsx@${TSX_VERSION}`, { stdio: "inherit" });

      console.log("Updating package.json scripts to use 'tsx' instead of 'bun'...");
      const pkgPath = path.resolve("./package.json");
      const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
      
      Object.keys(pkg.scripts).forEach((key) => {
        if (typeof pkg.scripts[key] === "string") {
          pkg.scripts[key] = pkg.scripts[key].replace(/\bbun\b/g, "tsx");
        }
      });

      fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
      console.log("✅ Project pivoted to Node.js successfully.\n");
    } catch (e) {
      console.error("❌ Failed to pivot project to Node.js. You may need to install 'tsx' manually.");
    }
  }

  // 2. Standard Setup Questions
  const supabaseUrl = await prompt("Supabase Project URL");
  const publishableKey = await prompt("Supabase Publishable Key (sb_publishable_...)");
  const secretKey = await prompt("Supabase Secret Key (sb_secret_...)");
  const bucket = await prompt("Supabase Bucket Name", "images");
  
  console.log("\n--- Admin Credentials ---");
  const adminEmail = await prompt("Admin Email", "admin@example.com");
  const adminPassword = await prompt("Admin Password");

  const envContent = `# Supabase Configuration
VITE_SUPABASE_URL=${supabaseUrl}
VITE_SUPABASE_PUBLISHABLE_KEY=${publishableKey}
VITE_SUPABASE_BUCKET=${bucket}

# Admin Configuration
SUPABASE_SECRET_KEY=${secretKey}
ADMIN_EMAIL=${adminEmail}
ADMIN_PASSWORD=${adminPassword}
UPLOAD_DIR=./uploads
`;

  fs.writeFileSync(".env", envContent);
  
  // Initialize empty images data
  const dataDir = path.resolve("./src/data");
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(path.join(dataDir, "images.json"), "[]");

  console.log("\n✅ .env file generated successfully!");
  console.log("✅ src/data/images.json initialized.");
  
  const cmd = isBun ? "bun" : "npm";
  console.log("\nNext steps:");
  console.log(`1. Run '${cmd} run admin' to provision your admin user.`);
  console.log(`2. Drop images in ./uploads and run '${cmd} run admin' again.`);
  console.log(`3. Run '${cmd} run dev' to see your gallery!\n`);
  
  process.exit(0);
}

setup();

# Vite + Supabase Image Gallery

A high-performance image gallery ported from Next.js to a Vite-based Single Page Application (SPA), powered by **Bun** and **Supabase Storage**.

## Architecture

Unlike the original Next.js template which used `getStaticProps` for server-side processing, this port uses a **Build-time Data Pipeline**:

1.  **Pre-build Script:** A Bun script (`src/scripts/buildImages.ts`) runs before the app starts.
2.  **Image Processing:** The script fetches images from Supabase, uses **Sharp** to calculate dimensions and generate base64 blur placeholders.
3.  **Static Manifest:** Results are saved to `src/data/images.json`.
4.  **Vite SPA:** The React app imports this JSON, allowing for instant loads and "blur-up" effects without a running backend.

## Personalization
You can easily change the gallery title, descriptions, and links by editing:
`src/data/content.json`

## Aspect Ratios
The gallery uses a **Masonry Layout** (via Tailwind `columns`). Our custom `Image` component automatically reads the width/height metadata processed by `sharp` and applies the correct `aspect-ratio` via CSS. This ensures that portraits, landscapes, and panoramas all fit perfectly without layout shifts.

## Getting Started

### Installation
Choose your preferred way to get started:

**Option A: Via Bun Create (Recommended)**
```bash
bun create osinnanna/vite-gallery my-gallery
cd my-gallery
bun install
bun run setup
```

**Option B: Via Git Clone**
```bash
git clone https://github.com/osinnanna/vite-gallery.git
cd vite-gallery
bun install

# --- INITIALIZATION ---
# If using Bun:
bun run setup

# If using Node.js:
npx tsx src/scripts/setup.ts
```

*Note: Node.js users use `npx` for the first time to bootstrap the installer. The script will then automatically configure your `package.json` for Node compatibility.*

### 2. Prerequisites
- **Node.js 18+** or **Bun** installed.
- A Supabase project with a **Public** Storage bucket, set name of storage bucket in .env or export VARIABLE.

### 3. Admin Setup & Sync
Follow the [ADMIN.md](./ADMIN.md) guide to provision your admin user and upload your first images.

### 4. Development
Run the development server (automatically triggers the image build script):
```bash
# If using Bun:
bun run dev

# If using Node.js:
npm run dev
```

### 5. Production Build
Optimize and bundle for production:
```bash
# If using Bun:
bun run build

# If using Node.js:
npm run build
```

## Tech Stack
- **Bundler:** Vite
- **Runtime:** Bun
- **Styling:** Tailwind CSS
- **Animation:** Framer Motion
- **Storage:** Supabase Storage
- **Image Processing:** Sharp
- **Routing:** React Router (with Modal support)

## Contributing
Contributions are welcome! Here is how you can extend the project:
- **Personalization:** Edit `src/data/content.json` to change the gallery's branding and copy.
- **Theming:** Modify `src/styles/index.css` to update the Tailwind v4 theme and custom variables.
- **Storage Providers:** This project is designed to be storage-agnostic. You can add new adapters in `src/scripts/` to support S3, Cloudflare R2, or local storage.
- **Components:** UI components are located in `src/components/`. All logic has been ported to standard React hooks for easy modification.


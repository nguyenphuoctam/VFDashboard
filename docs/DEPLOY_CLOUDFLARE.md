# 🚀 Deploying to Cloudflare Pages (2026 Edition)

Based on the latest Cloudflare & Astro standards (Jan 2026), here is the optimal deployment strategy.

## 1. Configuration (Already Applied)

We have configured the project for **Edge-First** execution using `adapter: cloudflare()`.

### `astro.config.mjs`

```javascript
import cloudflare from "@astrojs/cloudflare";
export default defineConfig({
  output: "server",
  adapter: cloudflare(), // Auto-detects best mode (Platform Proxy enabled)
  // ...
});
```

### `wrangler.toml`

Crucial for Node.js compatibility (Buffer, process, etc.) at the Edge.

```toml
name = "vfdashboard"
compatibility_date = "2026-01-01"
compatibility_flags = ["nodejs_compat"]
pages_build_output_dir = "./dist"
```

## 2. Deployment Options

### Option A: Git Integration (Recommended)

This gives you **automatic deployments** on every push.

1.  Push your code to GitHub/GitLab.
2.  Log in to [Cloudflare Dashboard](https://dash.cloudflare.com) > **Workers & Pages**.
3.  Click **Create Application** > **Pages** > **Connect to Git**.
4.  Select `VFDashBoard`.
5.  **Build Settings:**
    - **Framework Preset:** `Astro`
    - **Build Command:** `npm run build`
    - **Build Output:** `dist`
    - **Root Directory:** `/` (or leave empty)

### Option B: CLI Deployment (Fastest)

Deploy directly from your terminal without waiting for Git CI.

1.  **Login** (One time):
    ```bash
    npx wrangler login
    ```
2.  **Build & Deploy**:
    ```bash
    npm run build
    npx wrangler pages deploy dist
    ```

## 3. Local Development (Platform Proxy)

The new adapter supports **Platform Proxy**, meaning `npm run dev` locally will simulate the Cloudflare Worker environment (KV, Headers, etc.) accurately.

```bash
npm run dev
```

---

## 4. Verification

After deployment, your app will be hosted at `https://vfdashboard.pages.dev`.

- **Performance**: Assets served globally via CDN.
- **API**: `/api/*` requests handled by Edge Workers (Serverless) with rotating IPs.

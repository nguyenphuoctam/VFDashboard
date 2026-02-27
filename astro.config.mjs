// @ts-check
import { defineConfig } from "astro/config";

import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

// ❌ bỏ cloudflare adapter
// import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
  output: "static", // ✅ phải là static
  devToolbar: {
    enabled: false,
  },
  integrations: [react()],

  vite: {
    plugins: [tailwindcss()],
  },

  // ❌ xóa adapter cloudflare
  // adapter: cloudflare({
  //   imageService: "compile",
  //   sessionKVBindingName: "VFDashboard",
  // }),

  site: "https://nguyenphuoctam.github.io",
  base: "/VFDashboard/",
});

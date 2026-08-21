import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  // GitHub Pages publishes under the repository name; local builds are served at `/`.
  base: process.env.GITHUB_ACTIONS === "true" ? "/HaiBaPM/" : "/",
  optimizeDeps: {
    include: ["vue", "@arco-design/web-vue"],
  },
  server: {
    warmup: {
      clientFiles: ["./src/main.js"],
    },
  },
  plugins: [vue()],
});

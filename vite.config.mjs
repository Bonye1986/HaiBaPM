import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  base: "/HaiBaPM/",
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

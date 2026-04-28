// electron.vite.config.ts
import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
var __electron_vite_injected_dirname = "C:\\Users\\user\\Desktop\\franciscan-system";
var electron_vite_config_default = defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        external: ["prisma-generated", "@prisma/client", "better-sqlite3"]
      }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    publicDir: resolve(__electron_vite_injected_dirname, "public"),
    resolve: {
      alias: {
        "@renderer": resolve("src/renderer")
      }
    },
    plugins: [react()]
  }
});
export {
  electron_vite_config_default as default
};

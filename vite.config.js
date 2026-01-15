import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import UnoCSS from "unocss/vite";
import { presetAttributify, presetIcons } from "unocss";
import presetWind3 from "@unocss/preset-wind3";
import path from "path";
import glsl from "vite-plugin-glsl";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    glsl(),
    UnoCSS({
      presets: [presetWind3(), presetAttributify(), presetIcons()],
      shortcuts: {
        "flex-center": "flex items-center justify-center",
        btn: "px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600",
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});

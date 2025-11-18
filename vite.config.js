import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import UnoCSS from "unocss/vite";
import { presetAttributify, presetIcons } from "unocss";
import { presetUno } from "@unocss/preset-uno";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    UnoCSS({
      presets: [presetUno(), presetAttributify(), presetIcons()],
      shortcuts: {
        "flex-center": "flex items-center justify-center",
        btn: "px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600",
      },
    }),
  ],
});

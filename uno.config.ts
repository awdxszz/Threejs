import {
  defineConfig,
  presetUno,
  presetAttributify,
  presetIcons,
} from "unocss";

export default defineConfig({
  // 扫描内容路径
  content: {
    pipeline: {
      include: [
        // 匹配 src 目录下所有 vue,js,ts,jsx,tsx 文件
        /\.(vue|js|ts|jsx|tsx)($|\?)/,
        // 匹配 src 目录
        "src/**/*.{vue,js,ts,jsx,tsx}",
      ],
    },
  },
  // 预设
  presets: [
    presetUno(), // 基础 UnoCSS 预设
    presetAttributify(), // 支持属性化写法，如 bg="blue-500"
    presetIcons({
      // 图标预设
      scale: 1.2, // 图标默认缩放
      warn: true, // 缺少图标时警告
    }),
  ],
  // 主题扩展
  theme: {
    extend: {
      // 断点
      screens: {
        xs: "480px",
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1536px",
      },
      // 颜色
      colors: {
        primary: "#3b82f6",
        secondary: "#10b981",
        danger: "#ef4444",
      },
      // 字体
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["Fira Code", "monospace"],
      },
      // 动画
      animation: {
        "fade-in": "fade-in 0.5s ease-in-out",
        "slide-up": "slide-up 0.3s ease-out",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-up": {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  // 自定义规则（已移除可能导致无效 CSS 的颜色规则）
  // rules: [[/^text-(.*)$/, ([, c]) => ({ color: c })]],
  // 自定义快捷方式
  shortcuts: {
    "flex-center": "flex items-center justify-center",
    "btn-primary": "bg-primary text-white px-4 py-2 rounded hover:bg-blue-600",
  },
});

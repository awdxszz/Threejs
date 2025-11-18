<script setup>
const stats = [
  { label: "场景对象", value: "12" },
  { label: "几何体", value: "28" },
  { label: "材质", value: "14" },
  { label: "灯光", value: "6" },
];
const concepts = [
  { title: "Scene 场景", desc: "承载所有对象的容器" },
  { title: "Camera 相机", desc: "决定视图投影与可见范围" },
  { title: "Renderer 渲染器", desc: "将场景绘制到画布" },
  { title: "Object3D", desc: "三维对象基类，支持层级变换" },
  { title: "Geometry 几何体", desc: "顶点数据与形状定义" },
  { title: "Material 材质", desc: "表面外观与光照响应" },
  { title: "Texture 纹理", desc: "贴图增强细节与效果" },
  { title: "Light 光源", desc: "影响物体明暗与阴影" },
];
const renderingTips = [
  "使用 OrbitControls 交互调试相机",
  "尽量复用几何体与材质以降低内存",
  "通过 requestAnimationFrame 驱动渲染循环",
  "使用纹理压缩与贴图合集优化 IO",
  "启用阴影时控制 shadow.mapSize 与软阴影",
  "用 Frustum Culling 与层级可见性提升性能",
];
const ecosystem = [
  "three-stdlib 提供丰富的辅助与加载器",
  "draco/gltf 压缩与模型加载",
  "Stats.js 监控帧率与性能",
  "dat.GUI/Leva 快速调参",
  "GSAP/Tween.js 动画控制",
];
</script>

<template>
  <div class="p-6 md:p-8 space-y-8">
    <div
      class="rounded-xl p-6 md:p-8 text-white bg-gradient-to-r from-blue-600 to-teal-500 shadow-md"
    >
      <div class="flex items-start justify-between">
        <div>
          <h1 class="text-2xl md:text-3xl font-bold">Three.js 仪表盘</h1>
          <p class="mt-2 opacity-90">快速总览与知识速查</p>
        </div>
        <div class="hidden md:flex items-center gap-3">
          <button
            class="px-4 py-2 rounded bg-white text-blue-700 hover:bg-blue-50"
          >
            开始学习
          </button>
          <div class="w-8 h-8 rounded-full bg-white/30"></div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <div
        v-for="s in stats"
        :key="s.label"
        class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition"
      >
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-blue-100"></div>
          <div class="text-3xl font-bold text-gray-800">{{ s.value }}</div>
        </div>
        <div class="mt-2 text-gray-600">{{ s.label }}</div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div
        class="lg:col-span-2 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        <h2 class="text-lg font-semibold text-gray-900">核心概念</h2>
        <div class="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div
            v-for="c in concepts"
            :key="c.title"
            class="flex items-start gap-3 rounded-lg border border-gray-100 p-4 hover:border-blue-200 transition"
          >
            <div class="w-6 h-6 rounded-md bg-teal-100"></div>
            <div>
              <div class="font-medium text-gray-800">{{ c.title }}</div>
              <div class="text-gray-600 text-sm mt-1">{{ c.desc }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 class="text-lg font-semibold text-gray-900">渲染与性能</h2>
        <ul class="mt-4 space-y-2">
          <li
            v-for="tip in renderingTips"
            :key="tip"
            class="flex items-start gap-2"
          >
            <div class="w-2 h-2 rounded-full bg-green-500 mt-1"></div>
            <span class="text-gray-700 text-sm">{{ tip }}</span>
          </li>
        </ul>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 class="text-lg font-semibold text-gray-900">常用几何体/材质</h2>
        <div class="mt-4 flex flex-wrap gap-2">
          <span class="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm"
            >BoxGeometry</span
          >
          <span class="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm"
            >SphereGeometry</span
          >
          <span class="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm"
            >PlaneGeometry</span
          >
          <span class="px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-sm"
            >MeshBasicMaterial</span
          >
          <span class="px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-sm"
            >MeshStandardMaterial</span
          >
          <span class="px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-sm"
            >MeshPhongMaterial</span
          >
        </div>
      </div>

      <div class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 class="text-lg font-semibold text-gray-900">生态与工具</h2>
        <ul class="mt-4 space-y-2">
          <li
            v-for="tool in ecosystem"
            :key="tool"
            class="flex items-start gap-2"
          >
            <div class="w-2 h-2 rounded-full bg-gray-400 mt-1"></div>
            <span class="text-gray-700 text-sm">{{ tool }}</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

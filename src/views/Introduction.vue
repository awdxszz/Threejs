<script setup>
const overview = [
  "Three.js 是基于 WebGL 的 3D 渲染库，帮助在浏览器中绘制复杂三维场景",
  "提供场景、相机、渲染器等核心组件，并封装几何体、材质、纹理、灯光等常用能力",
  "适用于可视化、游戏、交互艺术、产品展示、数字孪生等多个领域",
];
const core = [
  { title: "Scene", desc: "承载所有对象的容器，支持层级关系与遍历" },
  { title: "Camera", desc: "决定视图投影与可见范围，常用透视相机" },
  { title: "Renderer", desc: "将场景绘制到画布，常用 WebGLRenderer" },
  { title: "Object3D", desc: "三维对象基类，拥有位置/旋转/缩放与父子关系" },
];
const workflow = [
  "创建场景、相机、渲染器并设置尺寸与像素比",
  "创建网格：几何体 + 材质，加入场景",
  "添加灯光、纹理与控制器以增强效果与交互",
  "在动画循环中更新状态并调用渲染",
];
const materials = [
  "MeshBasicMaterial（不受光照影响）",
  "MeshStandardMaterial（PBR，常用）",
  "MeshPhongMaterial（高光+漫反射）",
];
const lights = [
  "AmbientLight（环境光）",
  "DirectionalLight（方向光，可投射阴影）",
  "PointLight/SpotLight（点光/聚光）",
];
const loaders = [
  "TextureLoader 加载贴图",
  "GLTFLoader 加载 glTF/GLB 模型（推荐）",
  "DRACOLoader/meshopt 几何压缩加速下载",
];
const tips = [
  "复用几何体与材质，避免频繁创建与销毁",
  "合理控制阴影尺寸与软阴影，减少 GPU 压力",
  "使用视锥裁剪与对象可见性开关优化渲染",
  "合并网格或使用 InstancedMesh 提升大数量对象性能",
  "压缩纹理并采用贴图合集降低 IO",
];
</script>

<template>
  <div class="p-6 md:p-8 space-y-6">
    <div
      class="rounded-xl p-6 md:p-8 text-white bg-gradient-to-r from-indigo-600 to-purple-500 shadow-md"
    >
      <div class="flex items-start justify-between">
        <div>
          <h1 class="text-2xl md:text-3xl font-bold">Three.js 介绍</h1>
          <p class="mt-2 opacity-90">在浏览器中构建与渲染三维世界</p>
        </div>
        <div class="hidden md:flex items-center gap-3">
          <div class="w-8 h-8 rounded-full bg-white/30"></div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 space-y-6">
        <div class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 class="text-lg font-semibold text-gray-900">概览</h2>
          <ul class="mt-4 space-y-2">
            <li v-for="o in overview" :key="o" class="flex items-start gap-2">
              <div class="w-2 h-2 rounded-full bg-blue-500 mt-1"></div>
              <span class="text-gray-700 text-sm">{{ o }}</span>
            </li>
          </ul>
        </div>

        <div class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 class="text-lg font-semibold text-gray-900">核心组件</h2>
          <div class="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              v-for="c in core"
              :key="c.title"
              class="flex items-start gap-3 rounded-lg border border-gray-100 p-4 hover:border-indigo-200 transition"
            >
              <div class="w-6 h-6 rounded-md bg-indigo-100"></div>
              <div>
                <div class="font-medium text-gray-800">{{ c.title }}</div>
                <div class="text-gray-600 text-sm mt-1">{{ c.desc }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 class="text-lg font-semibold text-gray-900">基础工作流</h2>
          <ul class="mt-4 space-y-2">
            <li v-for="w in workflow" :key="w" class="flex items-start gap-2">
              <div class="w-2 h-2 rounded-full bg-teal-500 mt-1"></div>
              <span class="text-gray-700 text-sm">{{ w }}</span>
            </li>
          </ul>
        </div>
      </div>

      <div class="space-y-6">
        <div class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 class="text-lg font-semibold text-gray-900">常用材质</h2>
          <ul class="mt-4 space-y-2">
            <li v-for="m in materials" :key="m" class="flex items-start gap-2">
              <div class="w-2 h-2 rounded-full bg-pink-500 mt-1"></div>
              <span class="text-gray-700 text-sm">{{ m }}</span>
            </li>
          </ul>
        </div>

        <div class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 class="text-lg font-semibold text-gray-900">常用灯光</h2>
          <ul class="mt-4 space-y-2">
            <li v-for="l in lights" :key="l" class="flex items-start gap-2">
              <div class="w-2 h-2 rounded-full bg-yellow-500 mt-1"></div>
              <span class="text-gray-700 text-sm">{{ l }}</span>
            </li>
          </ul>
        </div>

        <div class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 class="text-lg font-semibold text-gray-900">加载与压缩</h2>
          <ul class="mt-4 space-y-2">
            <li v-for="l in loaders" :key="l" class="flex items-start gap-2">
              <div class="w-2 h-2 rounded-full bg-purple-500 mt-1"></div>
              <span class="text-gray-700 text-sm">{{ l }}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 class="text-lg font-semibold text-gray-900">性能与优化</h2>
      <ul class="mt-4 space-y-2">
        <li v-for="t in tips" :key="t" class="flex items-start gap-2">
          <div class="w-2 h-2 rounded-full bg-green-600 mt-1"></div>
          <span class="text-gray-700 text-sm">{{ t }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

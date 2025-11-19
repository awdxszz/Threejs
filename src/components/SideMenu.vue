<script setup>
import { ref } from "vue";
import { RouterLink, useRouter, useRoute } from "vue-router";
// 引入lucide-vue-next图标组件
import {
  Smile,
  Bird,
  Cat,
  Helicopter,
  Bone,
  Hop,
  Ham,
  BicepsFlexed,
} from "lucide-vue-next";

const props = defineProps({
  collapsed: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:collapsed"]);

const router = useRouter();
const route = useRoute();

// 菜单项
const menuItems = [
  {
    key: "first",
    title: "初出茅庐",
    icon: Smile,
    children: [
      {
        key: "dashboard",
        title: "场景",
        path: "/",
      },
      {
        key: "intro",
        title: "Three.js介绍",
        path: "/introduction",
      },
    ],
  },
  {
    key: "second",
    title: "崭露头角",
    icon: Bird,
    children: [
      {
        key: "basic-animation",
        title: "基础动画示例",
        path: "/animation",
      },
      {
        key: "coordinate-assistant",
        title: "世界坐标辅助器",
        path: "/coordinate-assistant",
      },
      {
        key: "trackball-controller",
        title: "轨道控制器",
        path: "/trackball-controller",
      },
      {
        key: "position-movement",
        title: "位置移动",
        path: "/position-movement",
      },
      {
        key: "scaling",
        title: "缩放",
        path: "/scaling",
      },
      {
        key: "rotation",
        title: "旋转",
        path: "/rotation",
      },
      {
        key: "lil-gui",
        title: "Lil-GUI",
        path: "/lil-gui",
      },
      {
        key: "geometry",
        title: "几何体",
        path: "/geometry",
      },
      {
        key: "material",
        title: "材质",
        path: "/material",
      },
    ],
  },
  {
    key: "third",
    title: "小有成就",
    icon: Cat,
    children: [
      {
        key: "fog",
        title: "雾效",
        path: "/fog",
      },
      {
        key: "load-gltf",
        title: "加载GLTF模型",
        path: "/load-gltf",
      },
      {
        key: "scene-interaction",
        title: "场景交互",
        path: "/scene-interaction",
      },
      {
        key: "tween-animation",
        title: "补间动画",
        path: "/tween-animation",
      },
      {
        key: "uv-mapping",
        title: "UV映射",
        path: "/uv-mapping",
      },
      {
        key: "normal-vector",
        title: "法线向量",
        path: "/normal-vector",
      },
      {
        key: "bounding-box-helper",
        title: "包围盒辅助器",
        path: "/bounding-box-helper",
      },
    ],
  },
  {
    key: "fourth",
    title: "渐入佳境",
    icon: Helicopter,
    children: [
      {
        key: "basic-animation",
        title: "基础动画示例",
        path: "/animation",
      },
    ],
  },
  {
    key: "fifth",
    title: "如日中天",
    icon: Hop,
    children: [
      {
        key: "basic-animation",
        title: "基础动画示例",
        path: "/animation",
      },
    ],
  },
  {
    key: "sixth",
    title: "风头正劲",
    icon: Ham,
    children: [
      {
        key: "basic-animation",
        title: "基础动画示例",
        path: "/animation",
      },
    ],
  },
  {
    key: "sixth",
    title: "稳如老狗",
    icon: Bone,
    children: [
      {
        key: "basic-animation",
        title: "基础动画示例",
        path: "/animation",
      },
    ],
  },
];

// 菜单展开状态
const expandedKeys = ref(["foundation"]);

// 切换子菜单展开状态
const toggleSubMenu = (key) => {
  const index = expandedKeys.value.indexOf(key);
  if (index > -1) {
    expandedKeys.value.splice(index, 1);
  } else {
    expandedKeys.value.push(key);
  }
};

// 切换菜单折叠状态
const toggleCollapsed = () => {
  emit("update:collapsed", !props.collapsed);
};
</script>

<template>
  <div
    id="side-menu"
    class="w-[240px] flex-shrink-0 h-full bg-slate-800 text-white transition-all duration-300 relative"
    :class="{ 'w-[80px]': collapsed }"
  >
    <div class="h-[64px] p-[16px] flex-center border-b border-white/10">
      <h2 v-if="!collapsed" class="text-white">Three.js 管理系统</h2>
      <h2 v-else class="text-white">3D</h2>
    </div>

    <!-- 菜单 -->
    <div class="py-[16px]">
      <div v-for="item in menuItems" :key="item.key" class="mb-[4px]">
        <!-- 父菜单项 -->
        <div
          class="px-[16px] h-[50px] cursor-pointer"
          @click="
            item.children
              ? toggleSubMenu(item.key)
              : item.path
              ? router.push(item.path)
              : null
          "
        >
          <div
            class="flex items-center h-full text-white/65 hover:text-white"
            :class="{
              'text-white':
                expandedKeys.includes(item.key) || route.path === item.path,
            }"
          >
            <span class="mr-[10px] flex items-center">
              <!-- Ant Design 图标 -->
              <component :is="item.icon" class="text-lg" />
            </span>
            <span v-if="!collapsed" class="title flex-1">{{ item.title }}</span>
            <!-- 展开/折叠图标 -->
            <span v-if="!collapsed && item.children" class="ml-[8px]">
              <svg
                class="w-[12px] h-[12px] transition-transform duration-300"
                :class="{ 'rotate-90': expandedKeys.includes(item.key) }"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </span>
          </div>
        </div>

        <!-- 子菜单 -->
        <div
          v-if="item.children && expandedKeys.includes(item.key) && !collapsed"
          class="pl-[40px] overflow-hidden transition-all duration-300"
        >
          <div v-for="child in item.children" :key="child.key" class="h-[40px]">
            <RouterLink
              :to="child.path"
              class="flex items-center h-full text-white/50 hover:text-white no-underline"
            >
              <span v-if="!collapsed" class="title">{{ child.title }}</span>
            </RouterLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

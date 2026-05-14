<script setup>
import { ref } from "vue";
import { RouterView } from "vue-router";
import SideMenu from "./components/SideMenu.vue";

// 菜单折叠状态
const collapsed = ref(false);
</script>

<template>
  <div class="flex w-screen h-screen overflow-hidden">
    <!-- 左侧导航 -->
    <SideMenu v-model:collapsed="collapsed" />

    <!-- 右侧内容区 -->
    <div
      class="flex-1 min-w-0 flex flex-col bg-blue-100 transition-all duration-300 overflow-hidden"
    >
      <!-- 顶部导航栏 -->
      <div
        id="top-navbar"
        class="h-[64px] bg-white shadow-md flex-shrink-0 overflow-hidden"
      >
        <div
          class="w-full h-full flex items-center justify-between overflow-hidden"
        >
          <div class="flex items-center pl-[24px]">
            <!-- 折叠按钮 -->
            <button
              @click="collapsed = !collapsed"
              class="w-10 h-10 mr-2 rounded-full flex-center text-[#001529] hover:bg-gray-100"
            >
              <svg
                v-if="collapsed"
                viewBox="0 0 24 24"
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
              <svg
                v-else
                viewBox="0 0 24 24"
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
                <line x1="8" y1="3" x2="8" y2="21" />
              </svg>
            </button>
            <h2 class="text-xl font-bold text-gray-800">Three.js Vue 示例</h2>
          </div>
          <div class="pr-[24px]">
            <span class="flex-center gap-2 cursor-pointer">
              <span class="text-gray-700">老登</span>
              <button class="btn">登出</button>
            </span>
          </div>
        </div>
      </div>

      <!-- 内容区 -->
      <div class="flex-1 min-h-0 overflow-y-auto p-4">
        <div class="bg-white rounded-lg shadow-lg w-full h-full overflow-auto">
          <RouterView class="h-full" />
        </div>
      </div>
    </div>
  </div>
</template>

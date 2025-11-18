<script setup>
import { ref } from "vue";
import { RouterView } from "vue-router";
import { MenuUnfoldOutlined, MenuFoldOutlined } from "@ant-design/icons-vue";
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
            <a-button
              type="text"
              shape="circle"
              size="large"
              @click="collapsed = !collapsed"
              class="color-[#001529] mr-2"
            >
              <template #icon>
                <MenuUnfoldOutlined v-if="collapsed" />
                <MenuFoldOutlined v-else />
              </template>
            </a-button>
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

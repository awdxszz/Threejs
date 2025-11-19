import { createRouter, createWebHistory } from "vue-router";

const routes = [
  // 基础内容
  {
    path: "/foundation",
    name: "foundation",
    children: [
      {
        path: "/",
        name: "dashboard",
        component: () => import("../views/Dashboard.vue"),
      },
    ],
  },
  // 介绍
  {
    path: "/introduction",
    name: "introduction",
    component: () => import("../views/Introduction.vue"),
  },
  // 动画
  {
    path: "/animation",
    name: "animation",
    component: () => import("../views/AnimationView.vue"),
  },
  // 坐标辅助器
  {
    path: "/coordinate-assistant",
    name: "coordinate-assistant",
    component: () => import("../views/CoordinateAssistant.vue"),
  },
  // 轨道控制器
  {
    path: "/trackball-controller",
    name: "trackball-controller",
    component: () => import("../views/TrackballController.vue"),
  },
  // 位置移动
  {
    path: "/position-movement",
    name: "position-movement",
    component: () => import("../views/PositionMovement.vue"),
  },
  // 缩放
  {
    path: "/scaling",
    name: "scaling",
    component: () => import("../views/Scaling.vue"),
  },
  // 旋转
  {
    path: "/rotation",
    name: "rotation",
    component: () => import("../views/Rotation.vue"),
  },
  // Lil-GUI
  {
    path: "/lil-gui",
    name: "Lil-GUI",
    component: () => import("../views/LilGUI.vue"),
  },
  // 几何体
  {
    path: "/geometry",
    name: "geometry",
    component: () => import("../views/Geometry.vue"),
  },
  // 材质
  {
    path: "/material",
    name: "material",
    component: () => import("../views/Material.vue"),
  },
  // 雾效
  {
    path: "/fog",
    name: "fog",
    component: () => import("../views/Fog.vue"),
  },
  // 加载GLTF模型
  {
    path: "/load-gltf",
    name: "load-gltf",
    component: () => import("../views/LoadGLTF.vue"),
  },
  // 场景交互
  {
    path: "/scene-interaction",
    name: "scene-interaction",
    component: () => import("../views/SceneInteraction.vue"),
  },
  // 补间动画
  {
    path: "/tween-animation",
    name: "tween-animation",
    component: () => import("../views/TweenAnimation.vue"),
  },
  // UV映射
  {
    path: "/uv-mapping",
    name: "uv-mapping",
    component: () => import("../views/UVMapping.vue"),
  },
  // 法线向量
  {
    path: "/normal-vector",
    name: "normal-vector",
    component: () => import("../views/NormalVector.vue"),
  },
  // 包围盒辅助器
  {
    path: "/bounding-box-helper",
    name: "bounding-box-helper",
    component: () => import("../views/BoundingBoxHelper.vue"),
  },
  // 渲染设置
  {
    path: "/settings",
    name: "settings",
    component: () => import("../views/Settings.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;

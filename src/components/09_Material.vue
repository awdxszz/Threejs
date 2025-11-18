<script setup>
// 引入threejs
import * as THREE from "three";
import { onMounted, onUnmounted } from "vue";
import {
  resizeRendererToLayout,
  getContainerLayoutSize,
} from "../utils/layout.js";
// 导入轨道控制器
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
// 导入 lil-gui
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
// 导入HDR加载器
import { HDRCubeTextureLoader } from "three/examples/jsm/loaders/HDRCubeTextureLoader.js";

let scene, camera, renderer, cube, animationId, controls;
// 初始化场景
function initScene() {
  // 创建场景
  scene = new THREE.Scene();

  // 创建相机
  const container = document.getElementById("animation-container");
  const { width, height } = getContainerLayoutSize({
    containerEl: container,
    sidebarSelector: "#side-menu",
    headerSelector: "#top-navbar",
  });

  camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);

  // 创建渲染器
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(width, height, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  container.appendChild(renderer.domElement);
  renderer.domElement.style.width = "100%";
  renderer.domElement.style.height = "100%";

  // 设置相机位置
  camera.position.set(3, 3, 7);

  const ambient = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambient);
  const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
  dirLight.position.set(5, 10, 5);
  scene.add(dirLight);

  // 创建PMREM生成器
  const pmrem = new THREE.PMREMGenerator(renderer);
  // 加载HDR环境贴图
  const envLoader = new THREE.TextureLoader();
  // 加载HDR环境贴图
  envLoader.load(
    "/texture/hdr.jpg",
    (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace; // 确保HDR贴图颜色空间为SRGB
      tex.mapping = THREE.EquirectangularReflectionMapping; // 设置贴图映射为等矩形反射映射
      const envMap = pmrem.fromEquirectangular(tex).texture; // 从等矩形贴图生成环境贴图
      scene.environment = envMap; // 设置场景环境贴图
      scene.background = envMap; // 设置场景背景贴图
      pmrem.dispose(); // 释放PMREM生成器资源
    },
    undefined,
    () => {
      const envMap = pmrem.fromScene(new RoomEnvironment(), 0.1).texture; // 从场景生成环境贴图
      scene.environment = envMap; // 设置场景环境贴图
      pmrem.dispose(); // 释放PMREM生成器资源
    }
  );

  // 渲染场景
  renderer.render(scene, camera);
}

// 添加世界坐标辅助器
function addCoordinateAssistant() {
  const assistant = new THREE.AxesHelper(5); // 5 表示辅助线的长度
  scene.add(assistant);
}

// 添加轨道控制器
function addTrackballController() {
  controls = new OrbitControls(camera, renderer.domElement); // 轨道控制器
  controls.enableDamping = true; // 启用阻尼效果，使控制器更加平滑
  controls.dampingFactor = 0.05; // 阻尼系数，越小越平滑
  controls.autoRotate = false; // 自动旋转
  controls.update();
}

// 动画循环
function animate() {
  animationId = requestAnimationFrame(animate);
  controls.update(); // 在动画循环中更新控制器
  renderer.render(scene, camera);
}

// 窗口大小变化时调整渲染器大小
function handleResize() {
  resizeRendererToLayout({
    containerSelector: "#animation-container",
    camera,
    renderer,
    sidebarSelector: "#side-menu",
    headerSelector: "#top-navbar",
    onResized: () => {
      if (controls && typeof controls.handleResize === "function") {
        controls.handleResize();
      }
    },
  });
}

let gui;
function initGui() {
  const container = document.getElementById("animation-container");
  if (container) {
    container.style.position = "relative";
  }
  gui = new GUI({ autoPlace: false });
  if (container) {
    container.appendChild(gui.domElement);
    gui.domElement.style.position = "absolute";
    gui.domElement.style.top = "8px";
    gui.domElement.style.right = "8px";
    gui.domElement.style.zIndex = "10";
  }

  // 纹理加载器
  let textureLoader = new THREE.TextureLoader();

  // 加载纹理
  const texUrl = "./texture/watercover/CityNewYork002_COL_VAR1_1K.png";
  let texture = textureLoader.load(texUrl);

  // 加载ao贴图
  const aoUrl = "./texture/watercover/CityNewYork002_AO_1K.png";
  let aoTexture = textureLoader.load(aoUrl);

  // 加载透明度贴图
  const alphaUrl = "./texture/door/height.jpg";
  let alphaTexture = textureLoader.load(alphaUrl);

  // 加载光照贴图
  const lightUrl = "./texture/colors.png";
  let lightTexture = textureLoader.load(lightUrl);

  // 加载HDR环境贴图
  const hdrUrl = "./texture/Alex_Hart-Nature_Lab_Bones_2k.hdr";
  let hdrTexture = new HDRCubeTextureLoader().load(hdrUrl);

  // 创建平面几何体
  let planGeometry = new THREE.PlaneGeometry(4, 4);
  // 创建平面材质
  let planeMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff, // 平面颜色
    map: texture, // 平面纹理
    transparent: true, // 开启透明
    aoMap: aoTexture, // 开启ao贴图
    aoMapIntensity: 1, // ao贴图强度
    // alphaMap: alphaTexture, // 开启透明度贴图
    lightMap: lightTexture, // 开启光照贴图
    lightMapIntensity: 1, // 光照贴图强度
    envMap: hdrTexture, // 开启HDR环境贴图
  });
  let plane = new THREE.Mesh(planGeometry, planeMaterial);
  scene.add(plane);
  // 相机看向平面
  camera.lookAt(plane.position);
  gui
    .add(planeMaterial, "aoMapIntensity")
    .name("ao贴图强度")
    .min(0)
    .max(1)
    .step(0.01);
}

// 组件挂载时初始化场景
onMounted(() => {
  // 初始化场景
  initScene();
  // 添加世界坐标辅助器
  addCoordinateAssistant();
  // 添加轨道控制器
  addTrackballController();
  initGui();
  // 开始动画循环
  animate();
  window.addEventListener("resize", handleResize);
});

// 组件卸载时清理资源
onUnmounted(() => {
  cancelAnimationFrame(animationId);
  window.removeEventListener("resize", handleResize);
  if (renderer && renderer.domElement) {
    renderer.domElement.parentNode.removeChild(renderer.domElement);
  }
  if (gui) {
    gui.destroy();
  }
  scene = null;
  camera = null;
  renderer = null;
  cube = null;
});
</script>

<template>
  <div id="animation-container"></div>
</template>

<style scoped>
* {
  margin: 0;
  padding: 0;
}

#animation-container {
  width: 100%;
  height: 100%;
}

canvas {
  display: block;
  width: 100%;
  height: 100%;
}
</style>

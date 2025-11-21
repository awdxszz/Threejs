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
// 导入 HDR 环境贴图加载器
import { HDRLoader } from "three/examples/jsm/loaders/HDRLoader.js";
// 导入GLTF加载器
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

let scene, camera, renderer, animationId, controls;
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

  // 实例化GLTF加载器
  const loader = new GLTFLoader();
  let duck1, duck2;
  // 模型1：使用包围盒辅助器
  loader.load(
    "/model/Duck.glb",
    (gltf) => {
      duck1 = gltf.scene;
      duck1.position.set(-3, 0, 0);
      scene.add(duck1);

      // 添加包围盒辅助器
      const box = new THREE.Box3().setFromObject(duck1);
      // 创建包围盒辅助器
      const boxHelper = new THREE.Box3Helper(box, 0xffff00);
      scene.add(boxHelper);
    },
    undefined, // 加载进度回调
    (err) => console.error("Duck 加载失败:", err)
  );

  // 模型2：使用包围球辅助器
  loader.load(
    "/model/Duck.glb",
    (gltf) => {
      duck2 = gltf.scene;
      duck2.position.set(3, 0, 0);
      duck2.rotation.y = Math.PI; // 绕Y轴旋转180度
      scene.add(duck2);

      // 添加包围球辅助器
      const box = new THREE.Box3().setFromObject(duck2);
      // 创建包围球辅助器
      const sphere = new THREE.Sphere();
      // 计算模型的包围球
      box.getBoundingSphere(sphere);

      // 创建包围球辅助器
      const sphereGeometry = new THREE.SphereGeometry(sphere.radius, 24, 16);
      // 创建材质
      const sphereMaterial = new THREE.MeshBasicMaterial({
        color: 0xff0000,
        wireframe: true,
      });
      // 创建包围球辅助器
      const sphereHelper = new THREE.Mesh(sphereGeometry, sphereMaterial);
      // 位置辅助器的位置设置为模型的包围球中心
      sphereHelper.position.copy(sphere.center);
      scene.add(sphereHelper);

      // 添加合并包围盒辅助器
      duck1.updateMatrixWorld(true);
      duck2.updateMatrixWorld(true);
      // 合并模型的包围盒
      const outerBox = new THREE.Box3().setFromObject(duck1);
      outerBox.union(new THREE.Box3().setFromObject(duck2));
      // 创建合并包围盒辅助器
      const outerHelper = new THREE.Box3Helper(outerBox, 0x00ffff);
      scene.add(outerHelper);
    },
    // 加载进度回调
    undefined,
    (err) => console.error("building 加载失败:", err)
  );

  // 加载环境贴图（使用 PMREM 生成器获得更准确的反射）
  const pmrem = new THREE.PMREMGenerator(renderer);
  // 编译等矩形贴图的着色器
  pmrem.compileEquirectangularShader();
  // 加载HDR环境贴图
  const rgbeLoader = new HDRLoader();
  rgbeLoader.load(
    "/texture/Alex_Hart-Nature_Lab_Bones_2k.hdr",
    (hdrTexture) => {
      // 从 HDR 纹理生成环境贴图
      const envMap = pmrem.fromEquirectangular(hdrTexture).texture;
      // 设置场景背景贴图
      scene.background = envMap;
      // 设置场景环境贴图
      scene.environment = envMap;
      // 释放HDR纹理和PMREM生成器
      hdrTexture.dispose();
      // 释放PMREM生成器的渲染目标
      pmrem.dispose();
    }
  );
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

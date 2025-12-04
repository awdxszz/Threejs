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

let scene, camera, renderer, animationId, controls, points1, points2;
let clock = new THREE.Clock();
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

  camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 30);

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
  camera.position.set(1, 1, 40);

  const ambient = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambient);
  const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
  dirLight.position.set(0, 0, 0);
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
  // 更新动画时间
  const time = clock.getElapsedTime();
  if (points1) {
    points1.rotation.x = time * 0.3;
  }
  if (points2) {
    points2.rotation.x = time * 0.5;
    points2.rotation.y = time * 0.4;
  }
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

    const createPoints = (url, size = 0.5) => {
      const particlesGeometry = new THREE.BufferGeometry();
      const count = 10000;

      // 设置缓冲区数组
      const positions = new Float32Array(count * 3);
      // 设置粒子顶点颜色
      const colors = new Float32Array(count * 3);
      // 设置顶点
      for (let i = 0; i < count * 3; i++) {
        positions[i] = (Math.random() - size) * 100;
        colors[i] = Math.random();
      }
      // 设置缓冲区数组属性
      particlesGeometry.setAttribute(
        "position",
        new THREE.BufferAttribute(positions, 3)
      );
      // 设置粒子顶点颜色属性
      particlesGeometry.setAttribute(
        "color",
        new THREE.BufferAttribute(colors, 3)
      );

      // 创建点材质
      const pointMaterial = new THREE.PointsMaterial();
      // 设置点材质大小
      pointMaterial.size = 0.5;
      // 设置点材质颜色
      pointMaterial.color.set(0xfff000);
      // 启用点材质大小衰减
      pointMaterial.sizeAttenuation = true;

      // 载入纹理
      const textureLoader = new THREE.TextureLoader();
      const texture = textureLoader.load(`/texture/particles/${url}.png`);
      // 设置点材质的颜色贴图
      pointMaterial.map = texture;
      // 设置点材质的透明度贴图
      pointMaterial.alphaMap = texture;
      // 设置点材质为透明
      pointMaterial.transparent = true;
      // 禁用深度写入，防止粒子遮挡其他物体
      pointMaterial.depthWrite = false;
      // 更新点材质
      pointMaterial.needsUpdate = true;
      // 启用顶点颜色
      pointMaterial.vertexColors = true;

      const points = new THREE.Points(particlesGeometry, pointMaterial);
      scene.add(points);
      return points;
    };

    // 创建粒子特效
    points1 = createPoints("10");
    points2 = createPoints("5");
  }
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

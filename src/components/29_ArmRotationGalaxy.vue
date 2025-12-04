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

let scene, camera, renderer, animationId, controls, points;
let clock = new THREE.Clock();
const textureLoader = new THREE.TextureLoader();
const particlesTexture = textureLoader.load(
  new URL(`/texture/particles/1.png`, import.meta.url).href
);
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
  camera.position.set(1, 6, 4);

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
  animationId = requestAnimationFrame(animate);
  if (points) {
    const t = clock.getElapsedTime();
    points.rotation.y = t * 0.2;
  }
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

    const params = {
      count: 10000, // 点的数量
      size: 0.1, // 点的大小
      radius: 5, // 星系半径
      branch: 6, // 星系臂数
      color: "#ff6030", // 点的颜色
      rotateScale: 0.9, // 旋转缩放比例
      endColor: "#1b3984", // 点的颜色
    };

    let geometry = null;
    let material = null;
    const centerColor = new THREE.Color(params.color);
    const endColor = new THREE.Color(params.endColor);
    const generateGalaxy = () => {
      // 生成顶点
      geometry = new THREE.BufferGeometry();
      // 随机生成位置
      const positions = new Float32Array(params.count * 3);
      // 设置顶点颜色
      const colors = new Float32Array(params.count * 3);

      // 生成点的位置和颜色
      for (let i = 0; i < params.count; i++) {
        // 当前的点应该在哪一条分支的角度上
        const branchAngle =
          (i % params.branch) * ((Math.PI * 2) / params.branch);
        // 当前点距离圆心的距离
        const distance =
          params.radius * Math.random() * Math.pow(Math.random(), 3);
        const current = i * 3; // 当前点的索引

        // 随机生成点的位置，确保不在中心
        const randomX =
          (Math.pow(Math.random() * 2 - 1, 3) * (params.radius - distance)) / 5;
        const randomY =
          (Math.pow(Math.random() * 2 - 1, 3) * (params.radius - distance)) / 5;
        const randomZ =
          (Math.pow(Math.random() * 2 - 1, 3) * (params.radius - distance)) / 5;

        // 计算当前点的位置
        positions[current] =
          distance *
          Math.cos(branchAngle + distance * params.rotateScale + randomX); // 随机半径
        positions[current + 1] = 0 + randomY;
        positions[current + 2] =
          distance *
          Math.sin(branchAngle + distance * params.rotateScale + randomZ);

        // 混合颜色，形成渐变色
        const mixColor = centerColor.clone();
        // 计算当前点的颜色，根据距离插值
        mixColor.lerp(endColor, distance / params.radius);
        colors[current] = mixColor.r;
        colors[current + 1] = mixColor.g;
        colors[current + 2] = mixColor.b;
      }
      geometry.setAttribute(
        "position",
        new THREE.BufferAttribute(positions, 3)
      );
      geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
      // 设置点材质
      material = new THREE.PointsMaterial({
        size: params.size, // 点的大小
        sizeAttenuation: true, // 点大小是否衰减
        depthWrite: false, // 禁用深度写入
        blending: THREE.AdditiveBlending, // 加法混合模式
        map: particlesTexture, // 点的纹理
        alphaMap: particlesTexture, // 点的透明度纹理
        transparent: true, // 启用透明度
        vertexColors: true, // 启用顶点颜色
      });
      points = new THREE.Points(geometry, material);
      scene.add(points);
    };

    generateGalaxy();
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

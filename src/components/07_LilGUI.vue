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

let scene, camera, renderer, cube, animationId, controls, parentCube;

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
  container.appendChild(renderer.domElement);
  renderer.domElement.style.width = "100%";
  renderer.domElement.style.height = "100%";

  // 创建几何体
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  // 创建材质
  const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  const parentMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  // 创建网格
  cube = new THREE.Mesh(geometry, material);
  parentCube = new THREE.Mesh(geometry, parentMaterial);
  parentCube.add(cube);
  parentCube.position.set(-1, 0, 0);
  // 缩放
  cube.scale.set(2, 2, 2); // 子元素缩放
  parentCube.scale.set(0.5, 0.5, 0.5); // 父元素缩放
  // 旋转 (x, y, z)
  parentCube.rotation.set(Math.PI / 4, Math.PI / 4, 0); // 父元素旋转
  // 设置位置（x, y, z）
  cube.position.set(3, 0, 0);
  // 添加到场景
  scene.add(parentCube);

  // 设置相机位置
  camera.position.set(3, 3, 7);
  camera.lookAt(parentCube.position);

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
  if (parentCube) {
    controls.target.copy(parentCube.position);
  }
  controls.update();
}

// 动画循环
function animate() {
  animationId = requestAnimationFrame(animate);
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;
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

let eventObj = {
  FullScreen: () => {
    renderer.domElement.requestFullscreen();
    console.log("全屏");
  },
  ExitFullScreen: () => {
    document.exitFullscreen();
    console.log("退出全屏");
  },
};
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
  gui.add(eventObj, "FullScreen");
  gui.add(eventObj, "ExitFullScreen");
  if (parentCube) {
    let cubeFolder = gui.addFolder("子元素移动");
    cubeFolder.add(cube.position, "x", -5, 5).name("子元素X轴位置");
    cubeFolder.add(cube.position, "y", -5, 5).name("子元素Y轴位置");
    cubeFolder.add(cube.position, "z", -5, 5).name("子元素Z轴位置");
    let parentCubeFolder = gui.addFolder("父元素移动");
    parentCubeFolder.add(parentCube.position, "x", -5, 5).name("父元素X轴位置");
    parentCubeFolder.add(parentCube.position, "y", -5, 5).name("父元素Y轴位置");
    parentCubeFolder.add(parentCube.position, "z", -5, 5).name("父元素Z轴位置");
    let cubeColorFolder = gui.addFolder("子元素颜色");
    const initialColor = `#${cube.material.color.getHexString()}`;
    let color = { cubeColor: initialColor };
    cubeColorFolder
      .addColor(color, "cubeColor")
      .name("子元素颜色")
      .onChange(() => {
        cube.material.color.set(color.cubeColor);
      });
    let parentCubeWireframeFolder = gui.addFolder("子元素线框模式");
    parentCubeWireframeFolder
      .add(cube.material, "wireframe")
      .name("子元素线框模式");
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

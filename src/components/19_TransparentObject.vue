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

  // 厚度贴图
  const thicknessMap = new THREE.TextureLoader().load(
    "/texture/diamond/diamond_emissive.png"
  );
  // 法线贴图
  const normalMap = new THREE.TextureLoader().load(
    "/texture/diamond/diamond_normal.png"
  );
  // 碳纳米管法线贴图
  const carbonNormalMap = new THREE.TextureLoader().load(
    "/texture/carbon/Carbon_Normal.png"
  );
  // 划痕法线贴图
  const scratchNormalMap = new THREE.TextureLoader().load(
    "/texture/carbon/Scratched_gold_01_1K_Normal.png"
  );

  // 创建立方体
  const geometry = new THREE.BoxGeometry(2, 2, 2);
  // 创建物理材质
  const material = new THREE.MeshPhysicalMaterial({
    transparent: true, // 开启透明
    transmission: 0.95, // 透射率，1 表示完全透射
    roughness: 0.1, // 粗糙度，0 表示完全光滑
    thickness: 1, // 厚度，1 表示完全透射
    attenuationColor: 0x8000ff, // 透射颜色
    attenuationDistance: 1, // 透射距离
    thicknessMap, // 厚度贴图
  });
  // 创建立方体网格模型
  const cube = new THREE.Mesh(geometry, material);
  // 添加立方体到场景
  scene.add(cube);

  gui.add(cube.material, "attenuationDistance", 0, 1).name("透射距离");
  gui.add(cube.material, "transmission", 0, 1).name("透射率");
  gui.add(cube.material, "thickness", 0, 1).name("厚度");

  // 创建第二个立方体
  const geometry2 = new THREE.BoxGeometry(2, 2, 2);
  // 创建物理材质
  const material2 = new THREE.MeshPhysicalMaterial({
    transparent: true, // 开启透明
    color: 0xffff00, // 颜色
    roughness: 0.5, // 粗糙度，0 表示完全光滑
    clearcoat: 1, // 清漆层，0 表示没有清漆层
    clearcoatRoughness: 0, // 清漆层粗糙度，0 表示完全光滑
    // clearcoatMap: thicknessMap, // 清漆层贴图
    // clearcoatRoughnessMap: thicknessMap, // 清漆层粗糙度贴图
    clearcoatNormalMap: scratchNormalMap, // 清漆层法线贴图
    normalMap: carbonNormalMap, // 法线贴图
    clearcoatNormalScale: new THREE.Vector2(1, 1), // 清漆层法线贴图缩放
  });
  // 创建立方体网格模型
  const cube2 = new THREE.Mesh(geometry2, material2);
  // 设置立方体位置：x轴+3
  cube2.position.x = 3;
  // 添加立方体到场景
  scene.add(cube2);

  const brickRoughnessMap = new THREE.TextureLoader().load(
    "/texture/brick/brick_roughness.jpg"
  );
  // 创建球形几何体
  const geometry3 = new THREE.SphereGeometry(1, 32, 32);
  // 创建球材质
  const material3 = new THREE.MeshPhysicalMaterial({
    color: 0x222288, // 颜色
    sheen: 1, // 光泽度，0 表示没有光泽
    sheenColor: 0xffffff, // 光泽颜色
    roughness: 0.5, // 粗糙度，0 表示完全光滑
    sheenRoughness: 0.5, // 光泽粗糙度，0 表示完全光滑
    roughnessMap: brickRoughnessMap, // 粗糙度贴图
  });
  // 创建球网格模型
  const cube3 = new THREE.Mesh(geometry3, material3);
  // 添加球到场景
  scene.add(cube3);
  // 设置球位置：x轴-3
  cube3.position.x = -3;

  // 创建球形几何体
  const geometry4 = new THREE.SphereGeometry(1, 32, 32);
  // 创建球材质
  const material4 = new THREE.MeshPhysicalMaterial({
    color: 0xffffff, // 颜色
    roughness: 0.05, // 粗糙度，0 表示完全光滑
    transmission: 0.95, // 透射率，1 表示完全透射
    thickness: 0.1, // 厚度，1 表示完全透射
    iridescence: 1, // 折射度，0 表示没有折射
  });
  // 创建球网格模型
  const cube4 = new THREE.Mesh(geometry4, material4);
  // 添加球到场景
  scene.add(cube4);
  // 设置球位置：y轴+3
  cube4.position.y = 3;

  // gui控制折射度
  gui.add(cube4.material, "iridescence", 0, 1).name("折射度");
  // gui控制反射率
  gui.add(cube4.material, "reflectivity", 0, 1).name("反射率");
  // gui控制折射率
  gui.add(cube4.material, "iridescenceIOR", 0, 1).name("折射率");

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

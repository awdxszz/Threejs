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
  // 加载模型
  loader.load(
    // 模型路径
    "/model/Duck.glb",
    // 加载成功回调
    function (gltf) {
      console.log("模型加载成功:", gltf);
      // 将加载的模型添加到场景中
      scene.add(gltf.scene);

      // 获取模型中的小鸭子对象
      let duckMesh = gltf.scene.getObjectByName("LOD3spShape");
      // 获取小鸭子的几何体
      let duckGeometry = duckMesh.geometry;
      // 计算几何体的包围盒
      duckGeometry.computeBoundingBox();
      // 设置几何体居中
      duckGeometry.center();
      // 获取几何体的包围盒
      let boundingBox = duckGeometry.boundingBox;
      // 更新世界矩阵
      duckMesh.updateWorldMatrix();
      // 更新包围盒
      boundingBox.applyMatrix4(duckMesh.matrixWorld);
      // 获取包围盒中心点
      const center = boundingBox.getCenter(new THREE.Vector3());
      console.log("包围盒中心点:", center);
      // 创建包围盒辅助器(对象，颜色)
      const boxHelper = new THREE.Box3Helper(boundingBox, 0xffff00);
      scene.add(boxHelper);

      // 获取包围球
      let duckSphere = duckGeometry.boundingSphere;
      // 转换为世界坐标
      duckSphere.applyMatrix4(duckMesh.matrixWorld);
      // 创建包围球辅助器(半径，经度分段数，纬度分段数)
      let sphereGeometry = new THREE.SphereGeometry(duckSphere.radius, 16, 16);
      // 设置包围球材质
      let sphereMaterial = new THREE.MeshBasicMaterial({
        color: 0xff0000,
        wireframe: true,
      });
      // 创建包围球辅助器(对象，材质)
      let sphereHelper = new THREE.Mesh(sphereGeometry, sphereMaterial);
      // 设置包围球辅助器的位置
      sphereHelper.position.copy(duckSphere.center);
      scene.add(sphereHelper);
    },
    // 加载进度回调
    undefined,
    // 加载失败回调
    function (error) {
      console.error("模型加载失败:", error);
    }
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

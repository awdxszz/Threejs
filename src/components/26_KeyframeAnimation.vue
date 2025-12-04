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
// 导入GLTF加载器
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
// 导入HDR加载器
import { HDRLoader } from "three/examples/jsm/loaders/HDRLoader.js";
// 导入Draco加载器
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";

let scene, camera, renderer, animationId, controls, mixer, mixer1;
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
  camera.position.set(3, 3, 8);

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

// 添加网格辅助器
function addGridHelper() {
  const gridHelper = new THREE.GridHelper(10, 10); // 10 表示网格的大小，10 表示网格的数量
  gridHelper.material.opacity = 0.3; // 网格辅助器的透明度
  gridHelper.material.transparent = true; // 网格辅助器是否透明
  scene.add(gridHelper);
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
  // 更新动画混合器
  const delta = clock.getDelta();
  if (mixer) mixer.update(delta);
  if (mixer1) mixer1.update(delta);
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
  // 配置 Draco 解码器以支持压缩网格
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath("/draco/gltf/");
  loader.setDRACOLoader(dracoLoader);
  // 加载模型
  loader.load(
    // 模型路径
    "/model/moon.glb",
    // 加载成功回调
    function (gltf) {
      console.log("模型加载成功:", gltf);
      // 设置模型位置
      gltf.scene.position.set(-2, 2, 0);
      // 将加载的模型添加到场景中
      scene.add(gltf.scene);
      // 创建动画混合器
      mixer1 = new THREE.AnimationMixer(gltf.scene);
      // 创建旋转动画帧
      const quaternion1 = new THREE.Quaternion();
      // 设置欧拉角为0度
      quaternion1.setFromEuler(new THREE.Euler(0, 0, 0));
      const quaternion2 = new THREE.Quaternion();
      // 设置欧拉角为180度
      quaternion2.setFromEuler(new THREE.Euler(0, Math.PI, 0));
      const quaternion3 = new THREE.Quaternion();
      // 设置欧拉角为0度
      quaternion3.setFromEuler(new THREE.Euler(0, 0, 0));
      const finQ = quaternion1
        .toArray()
        .concat(quaternion2.toArray(), quaternion3.toArray());

      // 创建旋转动画帧
      const rotationKF = new THREE.QuaternionKeyframeTrack(
        ".quaternion",
        [0, 2, 4], // 时间数组，单位秒
        finQ // 四元数数组，x、y、z、w 分别对应每个时间点的四元数
      );
      // 执行动画
      const clip1 = new THREE.AnimationClip("rotateMoon", 4, [rotationKF]);
      const action1 = mixer1.clipAction(clip1);
      action1.play();
    },
    // 加载进度回调
    undefined,
    // 加载失败回调
    function (error) {
      console.error("模型加载失败:", error);
    }
  );

  // 创建立方体
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshStandardMaterial({ color: 0xff33ff });
  const cube = new THREE.Mesh(geometry, material);
  cube.name = "cube";
  scene.add(cube);

  // 创建位移动画帧
  const positionKF = new THREE.VectorKeyframeTrack(
    "cube.position",
    [0, 1, 2, 3, 4], // 时间数组，单位秒
    [0, 0, 0, 2, 0, 0, 4, 0, 0, 2, 0, 0, 0, 0, 0] // 位置数组，x、y、z 分别对应每个时间点的位置
  );

  // 创建旋转动画帧
  const quaternion1 = new THREE.Quaternion();
  // 绕x轴旋转0度
  // quaternion1.setFromAxisAngle(new THREE.Vector3(1, 0, 0), 0);
  // 设置欧拉角为0度
  quaternion1.setFromEuler(new THREE.Euler(0, 0, 0));
  const quaternion2 = new THREE.Quaternion();
  // 绕x轴旋转180度
  // quaternion2.setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI);
  // 设置欧拉角为180度
  quaternion2.setFromEuler(new THREE.Euler(Math.PI, 0, 0));
  const quaternion3 = new THREE.Quaternion();
  // 绕x轴旋转0度
  // quaternion3.setFromAxisAngle(new THREE.Vector3(1, 0, 0), 0);
  // 设置欧拉角为0度
  quaternion3.setFromEuler(new THREE.Euler(0, 0, 0));
  const finQ = quaternion1
    .toArray()
    .concat(quaternion2.toArray(), quaternion3.toArray());

  // 创建旋转动画帧
  const rotationKF = new THREE.QuaternionKeyframeTrack(
    "cube.quaternion",
    [0, 2, 4], // 时间数组，单位秒
    finQ // 四元数数组，x、y、z、w 分别对应每个时间点的四元数
  );

  // 创建布尔动画帧
  const booleanKF = new THREE.BooleanKeyframeTrack(
    "cube.visible",
    [0, 1, 2, 3, 4], // 时间数组，单位秒
    [true, false, true, false, true] // 布尔值数组，对应每个时间点的可见性
  );

  // 创建颜色动画帧
  const colorKF = new THREE.ColorKeyframeTrack(
    "cube.material.color",
    [0, 2, 4], // 时间数组，单位秒
    [0, 1, 0, 1, 1, 0, 1, 0, 1] // 颜色数组，对应每个时间点的颜色
  );

  // 创建动画混合器
  mixer = new THREE.AnimationMixer(cube);
  // 创建动画剪辑（名称，持续时间，关键帧轨道数组）
  const clip = new THREE.AnimationClip("move", 4, [
    positionKF,
    rotationKF,
    // booleanKF,
    colorKF,
  ]);
  // 创建动画操作
  const action = mixer.clipAction(clip);
  // 添加位移动画到混合器
  action.play();

  // 加载环境贴图（PMREM 预过滤）
  const pmrem = new THREE.PMREMGenerator(renderer);
  pmrem.compileEquirectangularShader();
  const hdrLoader = new HDRLoader();
  hdrLoader.load("/texture/Alex_Hart-Nature_Lab_Bones_2k.hdr", (hdrTexture) => {
    const envMap = pmrem.fromEquirectangular(hdrTexture).texture;
    scene.environment = envMap;
    scene.background = new THREE.Color(0xcccccc);
    hdrTexture.dispose();
    pmrem.dispose();
  });
}

// 组件挂载时初始化场景
onMounted(() => {
  // 初始化场景
  initScene();
  // 添加世界坐标辅助器
  addCoordinateAssistant();
  // 添加网格辅助器
  addGridHelper();
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

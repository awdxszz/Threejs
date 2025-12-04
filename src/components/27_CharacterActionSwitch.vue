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
// 导入Draco加载器
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";

let scene, camera, renderer, animationId, controls, mixer;
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
  camera.position.set(0, 1, 3);
  // 相机看向场景中心
  camera.lookAt(0, 0, 0);

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
  const delta = clock.getDelta();
  if (mixer) mixer.update(delta);
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
  dracoLoader.preload();
  loader.setDRACOLoader(dracoLoader);

  let waveAction,
    victoryAction,
    idleAction,
    happyAction,
    angryAction,
    runAction,
    poseAction,
    walkAction,
    byeAction;
  let currentAction = null; // 当前播放的动画

  // 加载模型
  loader.load(
    new URL(`/model/hilda_regular_00.glb`, import.meta.url).href,
    (gltf) => {
      let girl = gltf.scene;
      mixer = new THREE.AnimationMixer(girl);
      scene.add(girl);

      // 打招呼
      waveAction = mixer.clipAction(gltf.animations[0]);
      // 胜利
      victoryAction = mixer.clipAction(gltf.animations[3]);
      // 空闲
      idleAction = mixer.clipAction(gltf.animations[6]);
      // 开心
      happyAction = mixer.clipAction(gltf.animations[21]);
      // 生气
      angryAction = mixer.clipAction(gltf.animations[22]);
      // 奔跑
      runAction = mixer.clipAction(gltf.animations[27]);
      // 造型
      poseAction = mixer.clipAction(gltf.animations[31]);
      // 行走
      walkAction = mixer.clipAction(gltf.animations[37]);
      // 再见
      byeAction = mixer.clipAction(gltf.animations[38]);

      currentAction = idleAction; // 默认播放空闲动画
      currentAction.play(); // 空闲动画默认播放

      const playTo = (next) => {
        // 确保下一个动画是启用的
        next.enabled = true;
        // 设置下一个动画的时间缩放和权重
        next.setEffectiveTimeScale(1);
        // 设置下一个动画的权重
        next.setEffectiveWeight(1);
        // 播放下一个动画
        next.play();
        // 交叉融合当前动画和下一个动画
        currentAction.crossFadeTo(next, 0.5, true);
        // 更新当前播放的动画为下一个动画
        currentAction = next;
      };

      let eventObj = {
        stopAll: () => mixer.stopAllAction(),
        playRun: () => playTo(runAction),
        playWalk: () => playTo(walkAction),
        playPose: () => playTo(poseAction),
        playIdle: () => playTo(idleAction),
        playHappy: () => playTo(happyAction),
        playAngry: () => playTo(angryAction),
        playBye: () => playTo(byeAction),
        playWave: () => playTo(waveAction),
        playVictory: () => playTo(victoryAction),
      };

      gui.add(eventObj, "stopAll").name("停止所有动画");
      gui.add(eventObj, "playRun").name("奔跑动画");
      gui.add(eventObj, "playWalk").name("行走动画");
      gui.add(eventObj, "playPose").name("造型动画");
      gui.add(eventObj, "playIdle").name("空闲动画");
      gui.add(eventObj, "playHappy").name("开心动画");
      gui.add(eventObj, "playAngry").name("生气动画");
      gui.add(eventObj, "playBye").name("再见动画");
      gui.add(eventObj, "playWave").name("打招呼动画");
      gui.add(eventObj, "playVictory").name("胜利动画");
    },
    undefined, // 加载进度回调
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
      // scene.background = envMap;
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

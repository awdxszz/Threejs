<script setup>
import * as THREE from "three";
import { onMounted, onUnmounted, ref } from "vue";
// 导入轨道控制器
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
// 导入顶点着色器
import vertexShader from "@/shader/water/vertex.glsl";
// 导入片元着色器
import fragmentShader from "@/shader/water/fragment.glsl";
// 导入hdr加载器
import { HDRLoader } from "three/examples/jsm/loaders/HDRLoader.js";
// 导入gltf加载器
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
// 导入 GUI
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
// 导入gsap动画库
import gsap from "gsap";
// 导入water模型
import { Water } from "three/examples/jsm/objects/Water2.js";

let renderer, scene, camera, animationId, controls, gui, shaderMaterial;
const containerRef = ref(null);
const canvasRef = ref(null);

// 处理窗口 resize 事件
function resize() {
  // 确保容器元素存在、渲染器和相机已初始化
  if (!containerRef.value || !renderer || !camera) return;
  // 获取容器元素的宽度和高度
  const width = containerRef.value.clientWidth || 1;
  const height = containerRef.value.clientHeight || 1;
  // 设置渲染器的大小和相机的宽高比
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  // 更新相机的投影矩阵
  camera.updateProjectionMatrix();
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
  // controls.autoRotate = true; // 自动旋转
  // controls.autoRotateSpeed = 0.1; // 自动旋转速度
  controls.update();
}

const clock = new THREE.Clock();

// 动画循环函数
function animate() {
  const elapsedTime = clock.getElapsedTime();
  // 更新统一变量 uTime，传递给顶点着色器
  // cube.material.uniforms.uTime.value = elapsedTime;
  animationId = requestAnimationFrame(animate);
  if (controls) controls.update();
  // cube.rotation.x += 0.01;
  // cube.rotation.y += 0.015;
  renderer.render(scene, camera);
}

// 初始化 GUI
function initGui(water) {
  gui = new GUI({ container: containerRef.value });
  // 设置 GUI 样式使其绝对定位在容器右上角
  gui.domElement.style.position = "absolute";
  gui.domElement.style.top = "10px";
  gui.domElement.style.right = "10px";

  const uniforms = water.material.uniforms;
  gui.addColor(uniforms.color, "value").name("Color");
  gui.add(uniforms.config.value, "w", 0.1, 10).name("Scale");
  gui.add(uniforms.reflectivity, "value", 0, 1).name("Reflectivity");
  gui.add(uniforms.flowDirection.value, "x", -1, 1).name("Flow X");
  gui.add(uniforms.flowDirection.value, "y", -1, 1).name("Flow Y");
}

onMounted(() => {
  // 初始化场景、相机和渲染器
  scene = new THREE.Scene();
  // 初始化相机
  camera = new THREE.PerspectiveCamera(75, 1, 0.9, 100);

  // 初始化渲染器
  renderer = new THREE.WebGLRenderer({
    antialias: true, // 开启抗锯齿
    canvas: canvasRef.value, // 渲染到指定的 canvas 元素
  });
  // 设置渲染器的输出颜色空间为 sRGB，确保颜色显示正确
  renderer.outputEncoding = THREE.sRGBEncoding;
  // 开启色调映射，确保渲染结果在不同设备上显示一致
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  // 设置渲染器的像素比例，确保在高分辨率屏幕上渲染清晰
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  // 设置渲染器的输出颜色空间为 sRGB，确保颜色显示正确
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  // 设置渲染器的色调映射为 ACESFilmicToneMapping，模拟真实世界的色调
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  // 设置相机位置，确保相机在场景中可见
  camera.position.set(4, 4, 4);

  // 添加环境光
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambientLight);

  // 添加平行光
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(1, 1, 1);
  scene.add(directionalLight);

  // 加载 HDR 环境图
  const rgbeLoader = new HDRLoader();
  rgbeLoader.load("/texture/shatan.hdr", (texture) => {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.background = texture;
    scene.environment = texture;
  });

  // 加载浴缸
  const bathtubLoader = new GLTFLoader();
  bathtubLoader.load("/texture/yugang.glb", (gltf) => {
    // 获取浴缸模型
    const yugang = gltf.scene.children[0];
    // 设置材质为双面渲染，确保水波纹正常显示
    yugang.material.side = THREE.DoubleSide;

    const waterGeometry = gltf.scene.children[1].geometry;
    gltf.scene.children[1].visible = false; // 隐藏原始水面模型，防止重叠闪烁
    // 创建水材质
    const water = new Water(waterGeometry, {
      color: "#a5c6e8",
      scale: 1,
      flowDirection: new THREE.Vector2(1, 1),
      textureWidth: 512,
      textureHeight: 512,
      normalMap0: normalMap0,
      normalMap1: normalMap1,
      reflectivity: 0.1, // 增加反射率
    });

    scene.add(water);
    scene.add(gltf.scene);

    initGui(water);
  });

  // 加载水波法线贴图
  const textureLoader = new THREE.TextureLoader();
  const normalMap0 = textureLoader.load("/texture/carbon/Water_1_M_Normal.jpg");
  const normalMap1 = textureLoader.load("/texture/carbon/Water_1_M_Normal.jpg");

  resize();
  animate();
  // 添加世界坐标辅助器
  addCoordinateAssistant();
  // 添加轨道控制器
  addTrackballController();
  window.addEventListener("resize", resize);
});

onUnmounted(() => {
  // 组件卸载时取消动画循环
  cancelAnimationFrame(animationId);
  // 移除窗口 resize 事件监听器
  window.removeEventListener("resize", resize);
  // 释放渲染器占用的资源
  if (renderer) renderer.dispose();
  if (gui) gui.destroy();
});
</script>

<template>
  <div class="w-full h-full relative" ref="containerRef">
    <canvas ref="canvasRef" class="w-full h-full block"></canvas>
  </div>
</template>

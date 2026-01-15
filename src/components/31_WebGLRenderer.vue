<script setup>
import * as THREE from "three";
import { onMounted, onUnmounted, ref } from "vue";
// 导入轨道控制器
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
// 导入顶点着色器
import vertexShader from "@/shader/deep/vertex.glsl";
// 导入片元着色器
import fragmentShader from "@/shader/deep/fragment.glsl";

let renderer, scene, camera, animationId, cube, controls;
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
  controls.autoRotate = false; // 自动旋转
  controls.update();
}

// 创建纹理加载器对象
const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load("/texture/ca.jpeg");

const clock = new THREE.Clock();

// 动画循环函数
function animate() {
  const elapsedTime = clock.getElapsedTime();
  // 更新统一变量 uTime，传递给顶点着色器
  cube.material.uniforms.uTime.value = elapsedTime;
  animationId = requestAnimationFrame(animate);
  if (controls) controls.update();
  // cube.rotation.x += 0.01;
  // cube.rotation.y += 0.015;
  renderer.render(scene, camera);
}

onMounted(() => {
  // 初始化场景、相机和渲染器
  scene = new THREE.Scene();
  // 初始化相机
  camera = new THREE.PerspectiveCamera(75, 1, 0.1, 100);
  // 初始化渲染器
  renderer = new THREE.WebGLRenderer({
    antialias: true, // 开启抗锯齿
    canvas: canvasRef.value, // 渲染到指定的 canvas 元素
  });
  // 设置渲染器的像素比例，确保在高分辨率屏幕上渲染清晰
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  // 设置渲染器的输出颜色空间为 sRGB，确保颜色显示正确
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  // 设置渲染器的色调映射为 ACESFilmicToneMapping，模拟真实世界的色调
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  // 设置渲染器的色调映射曝光度，调整渲染结果的亮度
  renderer.toneMappingExposure = 1.2;
  // 设置相机位置，确保相机在场景中可见
  camera.position.set(0, 0, 5);
  // 创建原始着色器材质
  const rawShaderMaterial = new THREE.RawShaderMaterial({
    // 定义顶点着色器
    vertexShader,
    // 定义片元着色器
    fragmentShader,
    // 设置线框
    wireframe: true,
    // 双面可见
    side: THREE.DoubleSide,
    // 定义统一变量，用于在顶点着色器和片元着色器之间传递数据
    uniforms: {
      // 定义时间变量，用于在顶点着色器中实现动画效果
      uTime: { value: 0.0 },
      // 定义纹理变量，用于在片元着色器中采样纹理
      uTexture: { value: texture },
    },
  });

  // 初始化 cube 网格
  cube = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1, 64, 64),
    // new THREE.MeshStandardMaterial({ color: 0x3399ff })
    rawShaderMaterial
  );
  scene.add(cube);

  // 初始化环境光，设置颜色为 0xffffff，强度为 0.6
  const ambient = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambient);
  // 初始化方向光，设置颜色为 0xffffff，强度为 0.8
  const dir = new THREE.DirectionalLight(0xffffff, 0.8);
  // 设置方向光的位置，确保在场景中可见
  dir.position.set(3, 5, 2);
  scene.add(dir);

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
});
</script>

<template>
  <div id="animation-container" ref="containerRef">
    <canvas ref="canvasRef"></canvas>
  </div>
</template>

<style scoped>
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

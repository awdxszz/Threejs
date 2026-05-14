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
import { uniform } from "three/tsl";

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

const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load("/texture/ca.jpeg");

const clock = new THREE.Clock();

// 动画循环函数
function animate() {
  const elapsedTime = clock.getElapsedTime();
  if (shaderMaterial) {
    shaderMaterial.uniforms.uTime.value = elapsedTime;
  }
  // 更新统一变量 uTime，传递给顶点着色器
  // cube.material.uniforms.uTime.value = elapsedTime;
  animationId = requestAnimationFrame(animate);
  if (controls) controls.update();
  // cube.rotation.x += 0.01;
  // cube.rotation.y += 0.015;
  renderer.render(scene, camera);
}

// 初始化 GUI
function initGui(params, shaderMaterial) {
  gui = new GUI({ container: containerRef.value });
  // 设置 GUI 样式使其绝对定位在容器右上角
  gui.domElement.style.position = "absolute";
  gui.domElement.style.top = "10px";
  gui.domElement.style.right = "10px";

  gui
    .add(params, "uWaresFrequency")
    .min(1)
    .max(100)
    .step(0.1)
    .onChange((value) => {
      shaderMaterial.uniforms.uWaresFrequency.value = value;
    });
  gui
    .add(params, "uScale")
    .min(0)
    .max(0.2)
    .step(0.001)
    .onChange((value) => {
      shaderMaterial.uniforms.uScale.value = value;
    });
  gui
    .add(params, "uXzScale")
    .min(0)
    .max(5)
    .step(0.1)
    .onChange((value) => {
      shaderMaterial.uniforms.uXzScale.value = value;
    });
  gui
    .add(params, "uNoiseFrequency")
    .min(1)
    .max(100)
    .step(0.1)
    .onChange((value) => {
      shaderMaterial.uniforms.uNoiseFrequency.value = value;
    });
  gui
    .add(params, "uNoiseScale")
    .min(0)
    .max(5)
    .step(0.001)
    .onChange((value) => {
      shaderMaterial.uniforms.uNoiseScale.value = value;
    });
  gui.addColor(params, "uLowColor").onChange((value) => {
    shaderMaterial.uniforms.uLowColor.value = new THREE.Color(value);
  });
  gui.addColor(params, "uHighColor").onChange((value) => {
    shaderMaterial.uniforms.uHighColor.value = new THREE.Color(value);
  });
  gui
    .add(params, "uXspeed")
    .min(0)
    .max(5)
    .step(0.001)
    .onChange((value) => {
      shaderMaterial.uniforms.uXspeed.value = value;
    });
  gui
    .add(params, "uZspeed")
    .min(0)
    .max(5)
    .step(0.001)
    .onChange((value) => {
      shaderMaterial.uniforms.uZspeed.value = value;
    });
  gui
    .add(params, "uNoiseSpeed")
    .min(0)
    .max(5)
    .step(0.001)
    .onChange((value) => {
      shaderMaterial.uniforms.uNoiseSpeed.value = value;
    });
  gui
    .add(params, "uOpacity")
    .min(0)
    .max(1)
    .step(0.01)
    .onChange((value) => {
      shaderMaterial.uniforms.uOpacity.value = value;
    });
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
  camera.position.set(0, 0.5, 3);

  const params = {
    uWaresFrequency: 14.0, // 波浪频率
    uScale: 0.05, // 波浪高度缩放因子
    uXzScale: 1.5, // 波浪在 xz 平面上的缩放因子
    uNoiseFrequency: 10.0, // 噪声频率
    uNoiseScale: 1.5, // 噪声缩放因子
    uLowColor: "#ff0000", // 低颜色
    uHighColor: "#ffff00", // 高颜色
    uXspeed: 1.0, // x 轴速度
    uZspeed: 1.0, // z 轴速度
    uNoiseSpeed: 1.0, // 噪声速度
    uOpacity: 1.0, // 透明度
  };

  // 创建着色器材质
  shaderMaterial = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    side: THREE.DoubleSide,
    transparent: true,
    uniforms: {
      uWaresFrequency: {
        value: params.uWaresFrequency,
      },
      uScale: {
        value: params.uScale,
      },
      uXzScale: {
        value: params.uXzScale,
      },
      uNoiseFrequency: {
        value: params.uNoiseFrequency,
      },
      uNoiseScale: {
        value: params.uNoiseScale,
      },
      uTime: {
        value: params.uTime,
      },
      uLowColor: {
        value: new THREE.Color(params.uLowColor),
      },
      uHighColor: {
        value: new THREE.Color(params.uHighColor),
      },
      uXspeed: {
        value: params.uXspeed,
      },
      uZspeed: {
        value: params.uZspeed,
      },
      uNoiseSpeed: {
        value: params.uNoiseSpeed,
      },
      uOpacity: {
        value: params.uOpacity,
      },
    },
    transparent: true,
  });

  // 初始化平面，用于渲染烟雾效果
  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1, 1024, 1024),
    shaderMaterial,
  );
  // 平面旋转 90 度，使其垂直于场景
  plane.rotation.x = -Math.PI / 2;
  scene.add(plane);

  initGui(params, shaderMaterial);
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

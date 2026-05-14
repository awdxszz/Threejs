<script setup>
import * as THREE from "three";
import { onMounted, onUnmounted, ref } from "vue";
// 导入轨道控制器
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
// 导入顶点着色器
import vertexShader from "@/shader/flylight/vertex.glsl";
// 导入片元着色器
import fragmentShader from "@/shader/flylight/fragment.glsl";
// 导入hdr加载器
import { HDRLoader } from "three/examples/jsm/loaders/HDRLoader.js";
// 导入gltf加载器
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
// 导入gsap动画库
import gsap from "gsap";
// 导入烟花效果
import Firework from "./_utils/Firework.js";
// 导入水模块
import { Water } from "three/examples/jsm/objects/Water2.js";

let renderer, scene, camera, animationId, controls;
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
  // controls.maxPolarAngle = (Math.PI / 4) * 2.8; // 最大垂直角度，防止相机倒置
  // controls.minPolarAngle = (Math.PI / 4) * 2.8; // 最小垂直角度，防止相机倒置
  controls.update();
}

// 创建纹理加载器对象
const hdrLoader = new HDRLoader();
// 加载hdr环境贴图
hdrLoader.load("/texture/2k.hdr", (texture) => {
  // 设置环境贴图
  texture.mapping = THREE.EquirectangularReflectionMapping;
  scene.background = texture;
  scene.environment = texture;
});

const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load("/texture/ca.jpeg");

const clock = new THREE.Clock();

// 动画循环函数
function animate() {
  const elapsedTime = clock.getElapsedTime();
  animationId = requestAnimationFrame(animate);
  if (controls) controls.update();
  fireworks.forEach((firework) => {
    const type = firework.update();
    if (type === "remove") {
      fireworks.splice(fireworks.indexOf(firework), 1);
    }
  });
  renderer.render(scene, camera);
}

onMounted(() => {
  // 初始化场景、相机和渲染器
  scene = new THREE.Scene();
  // 初始化相机
  camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);

  // 创建着色器材质
  const shaderMaterial = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {},
    side: THREE.DoubleSide,
    transparent: true,
  });

  // 初始化渲染器
  renderer = new THREE.WebGLRenderer({
    antialias: true, // 开启抗锯齿
    canvas: canvasRef.value, // 渲染到指定的 canvas 元素
  });
  // 设置渲染器的输出颜色空间为 sRGB，确保颜色显示正确
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  // 开启色调映射，确保渲染结果在不同设备上显示一致
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  // 设置渲染器的像素比例，确保在高分辨率屏幕上渲染清晰
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  // 设置渲染器的色调映射曝光度，调整渲染结果的亮度
  renderer.toneMappingExposure = 0.1;
  // 设置相机位置，确保相机在场景中可见
  camera.position.set(15, 18, 40);

  // 初始化模型加载器对象
  const gltfLoader = new GLTFLoader();
  let lightBox = null;
  // 加载gltf模型(场景)
  gltfLoader.load("/model/newyears_min.glb", (gltf) => {
    scene.add(gltf.scene);
    // 创建水面
    const waterGemometry = new Water(new THREE.PlaneGeometry(100, 100), {
      scale: 10, // 缩放
      textureWidth: 512, // 宽度
      textureHeight: 512, // 高度
      waterNormals: texture, // 水波贴图
      alpha: 1.0, // 透明度
      sunDirection: new THREE.Vector3(0, 1, 0), // 太阳方向
      sunColor: 0xffffff, // 太阳颜色
      waterColor: 0x001e0f, // 水底颜色
      distortionScale: 3.7, // 扰动比例
      normalMap0: normalMap0, // 法线贴图
      normalMap1: normalMap1, // 法线贴图
    });
    // 设置水面的旋转
    waterGemometry.rotation.x = -Math.PI / 2;
    // 设置水面的位置(确保水面在场景中可见)
    waterGemometry.position.y = 1;
    // 将水面添加到场景中
    scene.add(waterGemometry);
  });
  // 加载gltf模型(灯笼)
  gltfLoader.load("/model/flyLight.glb", (gltf) => {
    // 存储加载的模型，方便后续操作
    lightBox = gltf.scene.children[0];
    lightBox.material = shaderMaterial;

    // 克隆模型并添加到场景中
    for (let i = 0; i < 50; i++) {
      // 克隆模型，true 表示递归克隆所有子对象
      let flyLight = gltf.scene.clone(true);
      // 随机设置模型的位置
      let x = (Math.random() - 0.5) * 300;
      let y = Math.random() * 60 + 5;
      let z = (Math.random() - 0.5) * 300;
      flyLight.position.set(x, y, z);
      // 设置模型的动画，随机移动模型位置
      gsap.to(flyLight.rotation, {
        duration: Math.random() * 20 + 2, // 随机动画时长
        y: Math.PI * 2, // 绕y轴旋转一周
        repeat: -1, // 无限循环
        ease: "none",
      });
      gsap.to(flyLight.position, {
        duration: Math.random() * 20 + 3, // 随机动画时长
        y: y + Math.random() * 30 - 10, // 随机上下漂浮
        repeat: -1,
        yoyo: true, // 往返动画
        ease: "sine.inOut",
      });
      // 将模型添加到场景中
      scene.add(flyLight);
    }
  });

  // 初始化环境光，设置颜色为 0xffffff，强度为 0.6
  const ambient = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambient);
  // 初始化方向光，设置颜色为 0xffffff，强度为 0.8
  const dir = new THREE.DirectionalLight(0xffffff, 0.8);
  // 设置方向光的位置，确保在场景中可见
  dir.position.set(3, 5, 2);
  scene.add(dir);

  // 加载水波法线贴图
  const textureLoader = new THREE.TextureLoader();
  const normalMap0 = textureLoader.load("/texture/carbon/Water_1_M_Normal.jpg");
  const normalMap1 = textureLoader.load("/texture/carbon/Water_1_M_Normal.jpg");
  // 设置法线贴图的重复模式
  normalMap0.wrapS = normalMap0.wrapT = THREE.RepeatWrapping;
  normalMap1.wrapS = normalMap1.wrapT = THREE.RepeatWrapping;
  // 设置法线贴图的颜色空间为无颜色空间
  normalMap0.colorSpace = THREE.NoColorSpace;
  normalMap1.colorSpace = THREE.NoColorSpace;

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

// 管理烟花
let fireworks = [];

// 设置创建烟花的函数
let createFirework = () => {
  // 随机生成颜色和烟花放的位置
  let color = `hsl(${Math.random() * 360}, 100%, 50%)`;
  let position = {
    x: (Math.random() - 0.5) * 40,
    y: 3 + Math.random() * 25,
    z: -(Math.random() - 0.5) * 40,
  };

  // 随机生成颜色和烟花放的位置
  let firework = new Firework(color, position);
  // 将烟花添加到场景中
  firework.addScene(scene, camera);
  // 将烟花添加到管理数组中
  fireworks.push(firework);
};

// 监听点击事件
window.addEventListener("click", () => {
  createFirework();
});
</script>

<template>
  <div class="w-full h-full" ref="containerRef">
    <canvas ref="canvasRef" class="w-full h-full block"></canvas>
  </div>
</template>

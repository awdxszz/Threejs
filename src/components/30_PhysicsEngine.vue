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
// 导入cannon引擎
import * as CANNON from "cannon-es";

let scene,
  camera,
  renderer,
  animationId,
  controls,
  world,
  sphere,
  sphereBody,
  boxes = [],
  boxBodies = [];
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

  camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 30);

  // 创建渲染器
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(width, height, false);
  renderer.shadowMap.enabled = true; // 开启阴影投射
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  container.appendChild(renderer.domElement);
  renderer.domElement.style.width = "100%";
  renderer.domElement.style.height = "100%";

  // 设置相机位置
  camera.position.set(0, 2, 14);

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
  let deltaTime = clock.getDelta();
  // 更新物理世界
  world.step(1 / 120, deltaTime); // 120fps
  // 更新球的位置
  sphere.position.copy(sphereBody.position);
  sphere.quaternion.copy(sphereBody.quaternion);
  for (let i = 0; i < boxBodies.length; i++) {
    boxes[i].position.copy(boxBodies[i].position);
    boxes[i].quaternion.copy(boxBodies[i].quaternion);
  }

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

    // 创建球和平面
    const sphereGeometry = new THREE.SphereGeometry(1, 20, 20);
    // 创建球材质
    const sphereMaterial = new THREE.MeshStandardMaterial();
    sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.position.set(0, 5, 0); // 球位置在Y轴5，与平面对齐
    sphere.castShadow = true; // 开启阴影投射
    scene.add(sphere);

    const positions = [
      new THREE.Vector3(-3, 0, -3),
      new THREE.Vector3(3, 0, -3),
      new THREE.Vector3(-3, 0, 3),
      new THREE.Vector3(3, 0, 3),
      new THREE.Vector3(0, 0, 0),
    ];
    for (let i = 0; i < positions.length; i++) {
      const m = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.MeshStandardMaterial({
          color: new THREE.Color().setHSL(i / positions.length, 0.6, 0.5),
        })
      );
      m.position.copy(positions[i]);
      m.castShadow = true;
      scene.add(m);
      boxes.push(m);
    }

    // 创建平面
    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(10, 10), // 平面大小为10×10
      new THREE.MeshStandardMaterial({ color: 0xffffff }) // 平面材质为白色
    );
    plane.position.set(0, -5, 0); // 平面位置在Y轴-5，与球对齐
    plane.rotation.x = Math.PI * -0.5; // 平面旋转90度，与球对齐
    plane.receiveShadow = true; // 开启阴影接收
    scene.add(plane);

    // 设置物体材质
    const sphereWorldMaterial = new CANNON.Material("default");

    // 创建物理世界
    world = new CANNON.World();
    world.gravity.set(0, -9.82, 0); // 设置重力
    // 创建物理球
    const sphereShape = new CANNON.Sphere(1); // 半径为1的球

    // 创建物理世界的物体
    sphereBody = new CANNON.Body({
      mass: 1, // 质量为1
      position: new CANNON.Vec3(0, 5, 0), // 初始位置在Y轴5，与球对齐
      shape: sphereShape, // 球的形状
      material: sphereWorldMaterial, // 球的材质
    });
    // 应用本地力，使球向右移动
    sphereBody.applyLocalForce(
      new CANNON.Vec3(100, 0, 0), // 应用本地力，使球向右移动
      new CANNON.Vec3(0, 0, 0) // 力的应用点在球心
    );
    // 添加物理球到物理世界
    world.addBody(sphereBody);

    // 添加监听碰撞事件
    sphereBody.addEventListener("collide", (e) => {
      console.log("碰撞发生", e);
      // 获取碰撞的强度
      const contact = e.contact;
      const impactStrength = contact.getImpactVelocityAlongNormal();
      console.log("碰撞强度", impactStrength);
    });

    // 创建物理世界的地面（与可视平面一致 10×10）
    const groundShape = new CANNON.Box(new CANNON.Vec3(5, 0.5, 5));
    // 创建地面材质
    const groundMaterial = new CANNON.Material("ground");
    // 创建地面物理体
    const groundBody = new CANNON.Body({
      mass: 0, // 质量为0，因为地面是静态的
      position: new CANNON.Vec3(0, -5 - 0.5, 0), // 地面位置在Y轴-5.5，与平面对齐
      shape: groundShape, // 地面形状为盒子
      material: groundMaterial, // 材质为地面材质
    });
    world.addBody(groundBody);

    for (let i = 0; i < boxes.length; i++) {
      const shape = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5));
      const body = new CANNON.Body({
        mass: 5,
        position: new CANNON.Vec3(
          boxes[i].position.x,
          boxes[i].position.y,
          boxes[i].position.z
        ),
        shape,
        material: sphereWorldMaterial,
        angularDamping: 0.2,
      });
      world.addBody(body);
      body.addEventListener("collide", (e) => {
        const contact = e.contact;
        const impactStrength = contact.getImpactVelocityAlongNormal();
        const s = Math.max(0.5, Math.min(5, Math.abs(impactStrength)));
        body.angularVelocity.set(s, s * 0.6, s * 0.3);
      });
      boxBodies.push(body);
    }

    // 设置2种材质碰撞的参数
    const defaultContactMaterial = new CANNON.ContactMaterial(
      sphereWorldMaterial,
      groundMaterial,
      {
        friction: 0.5, // 摩擦系数
        restitution: 0.5, // 弹性系数
      }
    );
    // 添加默认联系材质到物理世界
    world.addContactMaterial(defaultContactMaterial);

    // 添加环境光和平行光
    const ambient = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambient);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(0, 10, 0);
    dirLight.castShadow = true; // 开启阴影投射
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.bias = -0.0001; // 阴影偏移量，防止阴影 acne 问题
    scene.add(dirLight);

    // 开启灯光辅助器
    const lightHelper = new THREE.DirectionalLightHelper(dirLight, 5);
    scene.add(lightHelper);
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

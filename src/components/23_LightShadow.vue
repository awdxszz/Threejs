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
  // 开启阴影
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // 设置相机位置
  camera.position.set(0, 5, 20);
  // 相机看向场景中心
  camera.lookAt(0, 0, 0);

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

  // 添加几何体
  const geometry = new THREE.TorusKnotGeometry(1, 0.3, 100, 16);
  // 添加物理材质
  const material1 = new THREE.MeshPhysicalMaterial({
    color: 0xccccff,
  });
  // 创建网格
  const torusKnot = new THREE.Mesh(geometry, material1);
  // 设置网格位置
  torusKnot.position.set(4, 0, 0);
  // 开启阴影
  torusKnot.castShadow = true;
  // 设置接收阴影
  torusKnot.receiveShadow = true;
  // 添加网格到场景
  scene.add(torusKnot);

  // 添加球体
  let sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
  // 添加物理材质
  const material2 = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
  });
  // 创建网格
  const sphere = new THREE.Mesh(sphereGeometry, material2);
  // 开启阴影
  sphere.castShadow = true;
  // 接收阴影
  sphere.receiveShadow = true;
  // 添加网格到场景
  scene.add(sphere);

  // 添加立方体
  let boxGeometry = new THREE.BoxGeometry(2, 2, 2);
  // 加载透明纹理
  let alphaTexture = new THREE.TextureLoader().load("/texture/16.jpg");
  // 添加物理材质
  const material3 = new THREE.MeshPhysicalMaterial({
    color: 0xffcccc, // 立方体颜色
    alphaMap: alphaTexture, // 透明纹理
    transparent: true, // 开启透明
    side: THREE.DoubleSide, // 双面渲染
    alphaTest: 0.5, // 透明度测试阈值
    shadowSide: THREE.DoubleSide, // 阴影渲染方向
  });
  // 创建网格
  const box = new THREE.Mesh(boxGeometry, material3);
  // 设置网格位置
  box.position.set(-4, 0, 0);
  // 开启阴影
  box.castShadow = true;
  // 设置接收阴影
  box.receiveShadow = true;
  // 添加网格到场景
  scene.add(box);

  // 创建平面
  let planeGeometry = new THREE.PlaneGeometry(24, 24, 1, 1);
  // 添加物理材质
  let planeMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x999999,
  });
  // 创建网格
  let planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
  // 设置网格旋转
  planeMesh.rotation.x = -Math.PI / 2;
  // 设置网格位置
  planeMesh.position.set(0, -4, 0);
  // 添加网格到场景
  scene.add(planeMesh);
  // 设置接收阴影
  planeMesh.receiveShadow = true;
  // 设置开启阴影
  planeMesh.castShadow = true;

  // 添加环境光
  const ambient = new THREE.AmbientLight(0xffffff, 0.1);
  scene.add(ambient);

  // 添加平行光
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
  // 设置平行光位置
  directionalLight.position.set(0, 10, 0);
  // 默认平行光的目标是原点
  directionalLight.target.position.set(0, 0, 0);
  directionalLight.castShadow = true;
  scene.add(directionalLight);
  scene.add(directionalLight.target);

  // 设置阴影相机参数
  directionalLight.shadow.camera.near = 0.5; // 阴影相机近裁剪平面
  directionalLight.shadow.camera.far = 50; // 阴影相机远裁剪平面
  directionalLight.shadow.camera.left = -10; // 阴影相机左裁剪平面
  directionalLight.shadow.camera.right = 10; // 阴影相机右裁剪平面
  directionalLight.shadow.camera.top = 10; // 阴影相机上裁剪平面
  directionalLight.shadow.camera.bottom = -10; // 阴影相机下裁剪平面

  // 设置阴影贴图大小
  directionalLight.shadow.mapSize.width = 2048; // 阴影贴图宽度
  directionalLight.shadow.mapSize.height = 2048; // 阴影贴图高度

  // 添加相机辅助器
  const cameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
  scene.add(cameraHelper);
  cameraHelper.visible = false;

  // 添加平行光辅助器
  const directionalLightHelper = new THREE.DirectionalLightHelper(
    directionalLight,
    1
  );
  scene.add(directionalLightHelper);

  const dirParams = {
    visible: true,
    intensity: directionalLight.intensity,
    color: `#${directionalLight.color.getHexString()}`,
    x: directionalLight.position.x,
    y: directionalLight.position.y,
    z: directionalLight.position.z,
    castShadow: !!directionalLight.castShadow,
    helper: true,
    targetX: directionalLight.target.position.x,
    targetY: directionalLight.target.position.y,
    targetZ: directionalLight.target.position.z,
    camHelper: false,
  };
  const fDir = gui.addFolder("平行光");
  fDir
    .add(dirParams, "visible")
    .name("显示")
    .onChange((v) => {
      directionalLight.visible = v;
    });
  fDir
    .add(dirParams, "intensity", 0, 5, 0.01)
    .name("强度")
    .onChange((v) => {
      directionalLight.intensity = v;
    });
  fDir
    .addColor(dirParams, "color")
    .name("颜色")
    .onChange((v) => {
      directionalLight.color.set(v);
    });
  fDir
    .add(dirParams, "x", -20, 20, 0.1)
    .name("位置X")
    .onChange((v) => {
      directionalLight.position.x = v;
      directionalLightHelper.update();
      cameraHelper.update();
    });
  fDir
    .add(dirParams, "y", -20, 20, 0.1)
    .name("位置Y")
    .onChange((v) => {
      directionalLight.position.y = v;
      directionalLightHelper.update();
      cameraHelper.update();
    });
  fDir
    .add(dirParams, "z", -20, 20, 0.1)
    .name("位置Z")
    .onChange((v) => {
      directionalLight.position.z = v;
      directionalLightHelper.update();
      cameraHelper.update();
    });
  fDir
    .add(dirParams, "targetX", -10, 10, 0.1)
    .name("目标X")
    .onChange((v) => {
      directionalLight.target.position.x = v;
      directionalLightHelper.update();
      cameraHelper.update();
    });
  fDir
    .add(dirParams, "targetY", -10, 10, 0.1)
    .name("目标Y")
    .onChange((v) => {
      directionalLight.target.position.y = v;
      directionalLightHelper.update();
      cameraHelper.update();
    });
  fDir
    .add(dirParams, "targetZ", -10, 10, 0.1)
    .name("目标Z")
    .onChange((v) => {
      directionalLight.target.position.z = v;
      directionalLightHelper.update();
      cameraHelper.update();
    });
  fDir
    .add(dirParams, "castShadow")
    .name("阴影")
    .onChange((v) => {
      directionalLight.castShadow = v;
    });
  fDir
    .add(dirParams, "helper")
    .name("辅助器")
    .onChange((v) => {
      directionalLightHelper.visible = v;
    });
  fDir
    .add(dirParams, "camHelper")
    .name("相机辅助器")
    .onChange((v) => {
      cameraHelper.visible = v;
      cameraHelper.update();
    });

  // 添加聚光灯
  const spotLight = new THREE.SpotLight(0xffffff, 100);
  // 设置聚光灯位置
  spotLight.position.set(0, 10, 0);
  // 默认聚光灯的目标是原点
  spotLight.target.position.set(0, 0, 0);
  // 开启阴影
  spotLight.castShadow = true;
  scene.add(spotLight.target);
  // 设置聚光灯角度
  spotLight.angle = Math.PI / 6;
  // 设置聚光灯距离
  spotLight.distance = 20;
  // 设置聚光灯软阴影范围
  spotLight.penumbra = 0.5;
  // 设置阴影贴图大小
  spotLight.shadow.mapSize.width = 2048;
  spotLight.shadow.mapSize.height = 2048;
  scene.add(spotLight);

  // 添加聚光灯辅助器
  const spotLightHelper = new THREE.SpotLightHelper(spotLight);
  scene.add(spotLightHelper);

  const spotParams = {
    visible: true,
    intensity: spotLight.intensity,
    color: `#${spotLight.color.getHexString()}`,
    x: spotLight.position.x,
    y: spotLight.position.y,
    z: spotLight.position.z,
    angle: spotLight.angle,
    distance: spotLight.distance,
    penumbra: spotLight.penumbra,
    castShadow: spotLight.castShadow,
    helper: true,
    targetX: spotLight.target.position.x,
    targetY: spotLight.target.position.y,
    targetZ: spotLight.target.position.z,
  };
  const fSpot = gui.addFolder("聚光灯");
  fSpot
    .add(spotParams, "visible")
    .name("显示")
    .onChange((v) => {
      spotLight.visible = v;
    });
  fSpot
    .add(spotParams, "intensity", 0, 200, 1)
    .name("强度")
    .onChange((v) => {
      spotLight.intensity = v;
    });
  fSpot
    .addColor(spotParams, "color")
    .name("颜色")
    .onChange((v) => {
      spotLight.color.set(v);
    });
  fSpot
    .add(spotParams, "x", -20, 20, 0.1)
    .name("位置X")
    .onChange((v) => {
      spotLight.position.x = v;
      spotLightHelper.update();
    });
  fSpot
    .add(spotParams, "y", -20, 20, 0.1)
    .name("位置Y")
    .onChange((v) => {
      spotLight.position.y = v;
      spotLightHelper.update();
    });
  fSpot
    .add(spotParams, "z", -20, 20, 0.1)
    .name("位置Z")
    .onChange((v) => {
      spotLight.position.z = v;
      spotLightHelper.update();
    });
  fSpot
    .add(spotParams, "targetX", -10, 10, 0.1)
    .name("目标X")
    .onChange((v) => {
      spotLight.target.position.x = v;
      spotLightHelper.update();
    });
  fSpot
    .add(spotParams, "targetY", -10, 10, 0.1)
    .name("目标Y")
    .onChange((v) => {
      spotLight.target.position.y = v;
      spotLightHelper.update();
    });
  fSpot
    .add(spotParams, "targetZ", -10, 10, 0.1)
    .name("目标Z")
    .onChange((v) => {
      spotLight.target.position.z = v;
      spotLightHelper.update();
    });
  fSpot
    .add(spotParams, "angle", 0, Math.PI / 2, 0.001)
    .name("角度")
    .onChange((v) => {
      spotLight.angle = v;
      spotLightHelper.update();
    });
  fSpot
    .add(spotParams, "distance", 0, 50, 0.1)
    .name("距离")
    .onChange((v) => {
      spotLight.distance = v;
    });
  fSpot
    .add(spotParams, "penumbra", 0, 1, 0.01)
    .name("柔和")
    .onChange((v) => {
      spotLight.penumbra = v;
      spotLightHelper.update();
    });
  fSpot
    .add(spotParams, "castShadow")
    .name("阴影")
    .onChange((v) => {
      spotLight.castShadow = v;
    });
  fSpot
    .add(spotParams, "helper")
    .name("辅助器")
    .onChange((v) => {
      spotLightHelper.visible = v;
    });

  // 添加点光源
  const pointLight = new THREE.PointLight(0xffffff, 100);
  // 设置点光源位置
  pointLight.position.set(0, 10, 0);
  // 开启阴影
  pointLight.castShadow = true;
  // 设置阴影贴图大小
  pointLight.shadow.mapSize.width = 2048;
  pointLight.shadow.mapSize.height = 2048;
  // 设置点光源距离
  pointLight.distance = 20;
  // 设置点光源衰减
  pointLight.decay = 2;
  scene.add(pointLight);

  // 添加点光源辅助器
  const pointLightHelper = new THREE.PointLightHelper(pointLight, 1);
  scene.add(pointLightHelper);

  const pointParams = {
    visible: true,
    intensity: pointLight.intensity,
    color: `#${pointLight.color.getHexString()}`,
    x: pointLight.position.x,
    y: pointLight.position.y,
    z: pointLight.position.z,
    distance: pointLight.distance,
    decay: pointLight.decay,
    castShadow: pointLight.castShadow,
    helper: true,
  };
  const fPoint = gui.addFolder("点光源");
  fPoint
    .add(pointParams, "visible")
    .name("显示")
    .onChange((v) => {
      pointLight.visible = v;
    });
  fPoint
    .add(pointParams, "intensity", 0, 200, 1)
    .name("强度")
    .onChange((v) => {
      pointLight.intensity = v;
    });
  fPoint
    .addColor(pointParams, "color")
    .name("颜色")
    .onChange((v) => {
      pointLight.color.set(v);
    });
  fPoint
    .add(pointParams, "x", -20, 20, 0.1)
    .name("位置X")
    .onChange((v) => {
      pointLight.position.x = v;
      pointLightHelper.update();
    });
  fPoint
    .add(pointParams, "y", -20, 20, 0.1)
    .name("位置Y")
    .onChange((v) => {
      pointLight.position.y = v;
      pointLightHelper.update();
    });
  fPoint
    .add(pointParams, "z", -20, 20, 0.1)
    .name("位置Z")
    .onChange((v) => {
      pointLight.position.z = v;
      pointLightHelper.update();
    });
  fPoint
    .add(pointParams, "distance", 0, 50, 0.1)
    .name("距离")
    .onChange((v) => {
      pointLight.distance = v;
    });
  fPoint
    .add(pointParams, "decay", 0, 4, 0.01)
    .name("衰减")
    .onChange((v) => {
      pointLight.decay = v;
    });
  fPoint
    .add(pointParams, "castShadow")
    .name("阴影")
    .onChange((v) => {
      pointLight.castShadow = v;
    });
  fPoint
    .add(pointParams, "helper")
    .name("辅助器")
    .onChange((v) => {
      pointLightHelper.visible = v;
    });
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

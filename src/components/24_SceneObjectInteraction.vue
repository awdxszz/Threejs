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
// 导入变换控制器
import { TransformControls } from "three/examples/jsm/controls/TransformControls.js";

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
  // 开启色调映射
  renderer.toneMapping = THREE.ReinhardToneMapping;
  // 设置色调映射曝光度
  renderer.toneMappingExposure = 1;
  // 设置渲染器的像素比
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  // 设置渲染器的大小
  renderer.setSize(width, height, false);
  // 设置渲染器的输出颜色空间为SRGB
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  // 开启ACES色调映射
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  container.appendChild(renderer.domElement);
  renderer.domElement.style.width = "100%";
  renderer.domElement.style.height = "100%";

  // 设置相机位置
  camera.position.set(3, 2.5, 8);
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

// 添加网格辅助器
function addGridHelper() {
  const gridHelper = new THREE.GridHelper(50, 50); // 50 表示网格的大小，50 表示网格的数量
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
  controls.target.set(0, 1.2, 0); // 设置控制器的目标点
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

  let basicScene;

  // 实例化GLTF加载器
  const loader = new GLTFLoader();
  // 配置 Draco 解码器以支持压缩网格
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath("/draco/gltf/");
  dracoLoader.preload();
  loader.setDRACOLoader(dracoLoader);

  // 加载模型
  loader.load(
    new URL(`/model/house/house-scene-min.glb`, import.meta.url).href,
    (gltf) => {
      basicScene = gltf.scene;
    },
    undefined, // 加载进度回调
    (err) => console.error("building 加载失败:", err)
  );

  // 创建变换控制器
  const tControls = new TransformControls(camera, renderer.domElement);
  // 监听拖动时间，当拖动物体的时候，禁用轨道控制器
  tControls.addEventListener("dragging-changed", (event) => {
    controls.enabled = !event.value;
  });
  tControls.addEventListener("change", () => {
    if (eventObj.isClampGroup && tControls.object) {
      tControls.object.position.y = 0;
    }
  });
  scene.add(tControls.getHelper()); // 将变换控制器添加到场景中

  let eventObj = {
    addScene: () => {
      scene.add(basicScene);
    },
    setTranslate: () => {
      tControls.setMode("translate");
    },
    setRotate: () => {
      tControls.setMode("rotate");
    },
    setScale: () => {
      tControls.setMode("scale");
    },
    toggleSpace: () => {
      tControls.setSpace(tControls.space === "local" ? "world" : "local");
    },
    cancelMesh: () => {
      tControls.detach();
    },
    translateSnapNum: null,
    rotateSnapNum: 0,
    scaleSnapNum: 0,
    isClampGroup: false,
    isLight: true,
  };

  // 添加模型
  gui.add(eventObj, "addScene").name("添加户型基础模型");
  // 添加变换控制器的模式选择
  gui.add(eventObj, "setTranslate").name("设置平移模式");
  gui.add(eventObj, "setRotate").name("设置旋转模式");
  gui.add(eventObj, "setScale").name("设置缩放模式");
  gui.add(eventObj, "toggleSpace").name("切换空间");
  gui.add(eventObj, "cancelMesh").name("取消选择");
  // 添加是否添加光源
  gui
    .add(eventObj, "isLight")
    .name("是否开启灯光")
    .onChange((value) => {
      if (value) {
        // 开启灯光
        renderer.toneMappingExposure = 1;
      } else {
        // 关闭灯光
        renderer.toneMappingExposure = 0.1;
      }
    });

  // 添加物体的目录
  let meshList = [
    {
      name: "盆栽",
      path: "/model/house/plants-min.glb",
    },
    {
      name: "单人沙发",
      path: "/model/house/sofa_chair_min.glb",
    },
  ];
  let folderAddMesh = gui.addFolder("添加物体");
  let meshesFolder = gui.addFolder("家具列表");
  let smapFolder = gui.addFolder("固定设置");
  let sceneMeshList = [];
  let meshNumber = {};
  // 添加固定位移设置
  smapFolder
    .add(eventObj, "translateSnapNum", {
      不固定: null,
      0.5: 0.5,
      1: 1,
      10: 10,
    })
    .name("固定位移设置")
    .onChange(() => {
      // 当固定位移设置改变时，更新变换控制器的固定位移
      tControls.setTranslationSnap(eventObj.translateSnapNum);
    });
  // 添加固定旋转设置
  smapFolder
    .add(eventObj, "rotateSnapNum", 0, 1)
    .step(0.01)
    .name("固定旋转设置")
    .onChange(() => {
      // 当固定旋转设置改变时，更新变换控制器的固定旋转
      tControls.setRotationSnap(eventObj.rotateSnapNum * Math.PI * 2);
    });
  // 添加固定缩放设置
  smapFolder
    .add(eventObj, "scaleSnapNum", 0, 2)
    .step(0.01)
    .name("固定缩放设置")
    .onChange(() => {
      // 当固定缩放设置改变时，更新变换控制器的固定缩放
      tControls.setScaleSnap(eventObj.scaleSnapNum);
    });
  // 添加是否吸附在地面
  smapFolder.add(eventObj, "isClampGroup").name("是否吸附在地面");
  meshList.forEach((item) => {
    item.addMesh = () => {
      loader.load(
        new URL(item.path, import.meta.url).href,
        (gltf) => {
          // 从GLTF场景中获取物体
          sceneMeshList.push({
            ...item,
            object3d: gltf.scene,
          });
          let object3d = gltf.scene;
          scene.add(object3d);
          // 将物体添加到变换控制器中
          tControls.attach(object3d);
          let meshOpt = {
            toggleMesh: () => {
              tControls.attach(object3d);
            },
          };
          // 为每个物体添加一个编号
          meshNumber[item.name] = meshNumber[item.name]
            ? meshNumber[item.name] + 1
            : 1;
          // 添加到家具列表中
          meshesFolder
            .add(meshOpt, "toggleMesh")
            .name(item.name + meshNumber[item.name]);
        },
        undefined, // 加载进度回调
        (err) => console.error("mesh 加载失败:", err)
      );
    };
    folderAddMesh.add(item, "addMesh").name(item.name);
  });

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
      scene.background = new THREE.Color(0xcccccc);
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

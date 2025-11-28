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
// 导入 RGBE 环境贴图加载器
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

  // 实例化GLTF加载器 - Matcap材质
  const loader = new GLTFLoader();
  loader.load(
    "/model/Duck.glb",
    (gltf) => {
      const duck = gltf.scene;
      scene.add(duck);
      // 加载matcap贴图
      const matcapTexture = new THREE.TextureLoader().load(
        "/texture/matcaps/11.png"
      );
      // 开启matcap贴图的颜色空间转换
      matcapTexture.colorSpace = THREE.SRGBColorSpace;
      // 为目标模型设置matcap材质
      const target = gltf.scene.getObjectByName("LOD3spShape");
      // 之前的贴图
      let originalMaterial = target.material;
      // 为目标模型设置matcap材质
      const matcap = new THREE.MeshMatcapMaterial({
        matcap: matcapTexture,
        map: originalMaterial.map,
      });

      // 检查目标模型是否存在且是网格模型
      if (target && target.isMesh) {
        target.material = matcap;
        const paramsDuck1 = {
          useBaseColorMap: !!originalMaterial.map,
          useMatcap: true,
        };
        const f1 = gui.addFolder("Duck1-Matcap");
        f1.add(paramsDuck1, "useBaseColorMap")
          .name("使用原颜色贴图")
          .onChange((v) => {
            target.material.map = v ? originalMaterial.map : null;
            target.material.needsUpdate = true;
          });
        f1.add(paramsDuck1, "useMatcap")
          .name("启用Matcap")
          .onChange((v) => {
            target.material.matcap = v ? matcapTexture : null;
            target.material.needsUpdate = true;
          });
      }
    },
    undefined, // 加载进度回调
    (err) => console.error("Duck 加载失败:", err)
  );

  // 实例化第二个GLTF加载器 - Phong材质
  const loader2 = new GLTFLoader();
  loader2.load(
    "/model/Duck.glb",
    (gltf) => {
      const duck = gltf.scene;
      duck.position.x += 3;
      scene.add(duck);
      // 为目标模型设置matcap材质
      const target = gltf.scene.getObjectByName("LOD3spShape");
      // 添加高光贴图
      const specularTexture = new THREE.TextureLoader().load(
        "/texture/watercover/CityNewYork002_GLOSS_1K.jpg"
      );
      specularTexture.colorSpace = THREE.SRGBColorSpace;
      // 添加纹理
      let colorTexture = new THREE.TextureLoader().load(
        "/texture/watercover/CityNewYork002_COL_VAR1_1K.png"
      );
      // 添加凹凸贴图
      const bumpTexture = new THREE.TextureLoader().load(
        "/texture/watercover/CityNewYork002_DISP_1K.jpg"
      );
      bumpTexture.colorSpace = THREE.SRGBColorSpace;
      colorTexture.colorSpace = THREE.SRGBColorSpace;
      // 为目标模型设置matcap材质
      const phong = new THREE.MeshPhongMaterial({
        map: colorTexture, // 颜色贴图
        specularMap: specularTexture, // 高光贴图
        bumpMap: bumpTexture, // 凹凸贴图
        displacementMap: bumpTexture, // 位移贴图
        displacementScale: 0.05, // 位移贴图缩放比例
        transparent: false, // 是否透明
      });

      // 检查目标模型是否存在且是网格模型
      if (target && target.isMesh) {
        target.material = phong;
        const paramsDuck2 = {
          map: true,
          specularMap: true,
          bumpMap: true,
          displacementMap: true,
          displacementScale: phong.displacementScale,
        };
        const f2 = gui.addFolder("Duck2-Maps");
        f2.add(paramsDuck2, "map")
          .name("颜色贴图")
          .onChange((v) => {
            target.material.map = v ? colorTexture : null;
            target.material.needsUpdate = true;
          });
        f2.add(paramsDuck2, "specularMap")
          .name("高光贴图")
          .onChange((v) => {
            target.material.specularMap = v ? specularTexture : null;
            target.material.needsUpdate = true;
          });
        f2.add(paramsDuck2, "bumpMap")
          .name("凹凸贴图")
          .onChange((v) => {
            target.material.bumpMap = v ? bumpTexture : null;
            target.material.needsUpdate = true;
          });
        f2.add(paramsDuck2, "displacementMap")
          .name("位移贴图")
          .onChange((v) => {
            target.material.displacementMap = v ? bumpTexture : null;
            target.material.needsUpdate = true;
          });
        f2.add(paramsDuck2, "displacementScale", 0, 0.2, 0.005)
          .name("位移强度")
          .onChange((val) => {
            target.material.displacementScale = val;
          });
      }
    },
    undefined, // 加载进度回调
    (err) => console.error("Duck 加载失败:", err)
  );

  // 加载环境贴图（使用 PMREM 生成器获得更准确的反射）
  const pmrem = new THREE.PMREMGenerator(renderer);
  // 编译等矩形贴图的着色器
  pmrem.compileEquirectangularShader();
  // 加载HDR环境贴图
  const hdrLoader = new HDRLoader();
  hdrLoader.load("/texture/Alex_Hart-Nature_Lab_Bones_2k.hdr", (hdrTexture) => {
    // 从 HDR 纹理生成环境贴图
    const envMap = pmrem.fromEquirectangular(hdrTexture).texture;
    // 设置场景背景贴图
    scene.background = envMap;
    // 设置场景环境贴图
    scene.environment = envMap;

    // 实例化第三个GLTF加载器 - Phong材质
    const loader3 = new GLTFLoader();
    loader3.load(
      "/model/Duck.glb",
      (gltf) => {
        const duck = gltf.scene;
        duck.position.x -= 3;
        scene.add(duck);
        // 为目标模型设置phong材质
        const target = gltf.scene.getObjectByName("LOD3spShape");

        // 为目标模型设置Standard材质以实现反射
        const reflectiveMaterial = new THREE.MeshStandardMaterial({
          color: 0xffffff, // 基础颜色
          metalness: 1, // 金属度，1表示金属，0表示非金属
          roughness: 0.01, // 粗糙度，0表示光滑，1表示粗糙
          envMap: envMap, // 环境贴图
        });

        // 检查目标模型是否存在且是网格模型
        if (target && target.isMesh) {
          target.material = reflectiveMaterial;
          const paramsDuck3 = {
            metalness: reflectiveMaterial.metalness,
            roughness: reflectiveMaterial.roughness,
            envMap: true,
            envMapIntensity: reflectiveMaterial.envMapIntensity ?? 1,
          };
          const f3 = gui.addFolder("Duck3-PBR");
          f3.add(paramsDuck3, "metalness", 0, 1, 0.01)
            .name("金属度")
            .onChange((v) => {
              target.material.metalness = v;
            });
          f3.add(paramsDuck3, "roughness", 0, 1, 0.01)
            .name("粗糙度")
            .onChange((v) => {
              target.material.roughness = v;
            });
          f3.add(paramsDuck3, "envMap")
            .name("环境贴图")
            .onChange((v) => {
              target.material.envMap = v ? envMap : null;
              target.material.needsUpdate = true;
            });
          f3.add(paramsDuck3, "envMapIntensity", 0, 2, 0.05)
            .name("环境强度")
            .onChange((val) => {
              // MeshStandardMaterial 支持 envMapIntensity
              target.material.envMapIntensity = val;
            });
        }
      },
      undefined, // 加载进度回调
      (err) => console.error("Duck 加载失败:", err)
    );

    // 释放HDR纹理和PMREM生成器
    hdrTexture.dispose();
    // 释放PMREM生成器的渲染目标
    pmrem.dispose();
  });

  let params = {
    aoMap: true,
  };
  // 实例化GLTF加载器 - 综合材质 - 剑
  const loaderSword = new GLTFLoader();
  loaderSword.load(
    "/model/sword/sword.gltf",
    (gltf) => {
      const Sword = gltf.scene;
      Sword.position.y -= 1;
      scene.add(Sword);
      let mesh = Sword.getObjectByName("Garde_Plane002");
      if (
        mesh &&
        mesh.geometry &&
        !mesh.geometry.attributes.uv2 &&
        mesh.geometry.attributes.uv
      ) {
        // 为模型添加uv2属性，用于环境贴图
        mesh.geometry.setAttribute("uv2", mesh.geometry.attributes.uv);
      }
      // 为模型添加环境贴图
      const originalAoMap = mesh && mesh.material ? mesh.material.aoMap : null;
      // 初始化环境贴图参数
      params.aoMap = !!originalAoMap;
      gui.add(params, "aoMap").onChange((value) => {
        if (mesh && mesh.material) {
          // 为模型添加环境贴图
          mesh.material.aoMap = value ? originalAoMap : null;
          // 为模型添加环境贴图需要更新
          mesh.material.needsUpdate = true;
        }
      });
    },
    undefined, // 加载进度回调
    (err) => console.error("Sword 加载失败:", err)
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

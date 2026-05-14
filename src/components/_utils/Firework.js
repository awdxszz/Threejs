import * as THREE from "three";
import startVertexShader from "@/shader/startpoint/vertex.glsl";
import startFragmentShader from "@/shader/startpoint/fragment.glsl";
import fireworkVertexShader from "@/shader/firework/vertex.glsl";
import fireworkFragmentShader from "@/shader/firework/fragment.glsl";

export default class Firework {
  constructor(color, to, from = { x: 0, y: 0, z: 0 }) {
    // 保存颜色
    this.color = new THREE.Color(color);
    // 创建烟花发射的点
    this.startGeometry = new THREE.BufferGeometry();
    const startPositionArray = new Float32Array(3);
    startPositionArray[0] = from.x;
    startPositionArray[1] = from.y;
    startPositionArray[2] = from.z;
    this.startGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(startPositionArray, 3),
    );

    const astepArray = new Float32Array(3);
    astepArray[0] = to.x - from.x;
    astepArray[1] = to.y - from.y;
    astepArray[2] = to.z - from.z;
    this.startGeometry.setAttribute(
      "aStep", // 步长
      new THREE.BufferAttribute(astepArray, 3),
    );

    // 设置着色器材质
    this.startMaterial = new THREE.ShaderMaterial({
      vertexShader: startVertexShader, // 顶点着色器
      fragmentShader: startFragmentShader, // 片元着色器
      transparent: true, // 透明
      blending: THREE.AdditiveBlending, // 透明混合
      depthTest: false, // 不进行深度测试，否则会导致其他物体遮挡烟花
      uniforms: {
        uTime: { value: 0.0 },
        uSize: { value: 20.0 },
        uColor: { value: this.color },
      },
    });

    // 创建烟花点球
    this.startPoint = new THREE.Points(this.startGeometry, this.startMaterial);

    // 开始计时
    this.clock = new THREE.Clock();

    // 创建爆炸的烟花
    this.fireworkGeometry = new THREE.BufferGeometry();
    this.FireworksCount = 180 + Math.floor(Math.random() * 180);
    // 创建烟花粒子数组
    const fireworkPositionArray = new Float32Array(this.FireworksCount * 3);
    const scaleFireArray = new Float32Array(this.FireworksCount);
    const directionArray = new Float32Array(this.FireworksCount * 3);
    for (let i = 0; i < this.FireworksCount; i++) {
      // 一开始烟花的位置
      fireworkPositionArray[i * 3 + 0] = to.x;
      fireworkPositionArray[i * 3 + 1] = to.y;
      fireworkPositionArray[i * 3 + 2] = to.z;

      // 设置烟花所有粒子初始大小
      scaleFireArray[i] = Math.random();

      // 设置向四周发射的角度
      let theta = Math.random() * 2 * Math.PI;
      let beta = Math.random() * 2 * Math.PI;
      let r = Math.random();

      // 设置向四周发射的方向
      directionArray[i * 3 + 0] = r * Math.sin(theta) + r * Math.sin(beta);
      directionArray[i * 3 + 1] = r * Math.cos(theta) + r * Math.cos(beta);
      directionArray[i * 3 + 2] = r * Math.sin(theta) + r * Math.cos(beta);
    }

    // 设置烟花几何体的属性
    this.fireworkGeometry.setAttribute(
      "position", // 位置
      new THREE.BufferAttribute(fireworkPositionArray, 3),
    );
    this.fireworkGeometry.setAttribute(
      "aScale", // 大小
      new THREE.BufferAttribute(scaleFireArray, 1),
    );
    this.fireworkGeometry.setAttribute(
      "aRandom", // 随机数
      new THREE.BufferAttribute(directionArray, 3),
    );

    this.fireworkMaterial = new THREE.ShaderMaterial({
      vertexShader: fireworkVertexShader, // 顶点着色器
      fragmentShader: fireworkFragmentShader, // 片元着色器
      transparent: true, // 透明
      blending: THREE.AdditiveBlending, // 透明混合
      depthTest: false, // 不进行深度测试，否则会导致其他物体遮挡烟花
      depthWrite: false, // 不写入深度缓冲区，否则会导致其他物体遮挡烟花
      uniforms: {
        uTime: { value: 0.0 },
        uSize: { value: 0.0 },
        uColor: { value: this.color },
      },
    });

    this.fireworks = new THREE.Points(
      this.fireworkGeometry,
      this.fireworkMaterial,
    );

    // 创建音频效果
    this.listener = new THREE.AudioListener();
    this.sound = new THREE.Audio(this.listener);
    this.sendSound = new THREE.Audio(this.listener);

    // 创建音频加载器
    const audioLoader = new THREE.AudioLoader();
    audioLoader.load(
      `/audio/pow${Math.floor(Math.random() * 4) + 1}.ogg`,
      (buffer) => {
        this.sound.setBuffer(buffer); // 设置音频缓冲区
        this.sound.setLoop(false); // 不循环播放
        this.sound.setVolume(0.3); // 设置音量
      },
    );

    audioLoader.load(`/audio/send.mp3`, (buffer) => {
      this.sendSound.setBuffer(buffer); // 设置音频缓冲区
      this.sendSound.setLoop(false); // 不循环播放
      this.sendSound.setVolume(0.1); // 设置音量
    });
  }

  addScene(scene, camera) {
    if (scene && this.startPoint && this.startPoint.isObject3D) {
      scene.add(this.startPoint); // 添加点到场景中
      scene.add(this.fireworks); // 添加烟花到场景中
      this.scene = scene; // 保存场景
    }
  }

  // 更新烟花点球的位置
  update() {
    const elapsedTime = this.clock.getElapsedTime();
    if (elapsedTime < 1.0) {
      if (!this.sendSound.isPlaying && !this.sendSoundPlay) {
        this.sendSound.play(); // 播放音频
        this.sendSoundPlay = true; // 标记为已播放
      }
      this.startMaterial.uniforms.uTime.value = elapsedTime;
      this.startMaterial.uniforms.uSize.value = 20.0;
    } else {
      const time = elapsedTime - 1.0;
      // 让点元素消失
      if (this.startPoint) {
        this.scene.remove(this.startPoint);
        this.startPoint.clear();
        this.startGeometry.dispose();
        this.startMaterial.dispose();
        this.startPoint = null;
        if (!this.sound.isPlaying && !this.play) {
          this.sound.play(); // 播放音频
          this.play = true; // 标记为已播放
        }
      }

      // 设置烟花显示
      this.fireworkMaterial.uniforms.uSize.value = 20.0;
      this.fireworkMaterial.uniforms.uTime.value = time;

      if (time > 5.0) {
        if (this.fireworks) {
          this.fireworkMaterial.uniforms.uSize.value = 0.0;
          this.fireworks.clear();
          this.fireworkGeometry.dispose();
          this.fireworkMaterial.dispose();
          this.scene.remove(this.fireworks);
          this.scene.remove(this.startPoint);
          return "remove";
        }
      }
    }
  }
}

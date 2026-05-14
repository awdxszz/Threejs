attribute float aScale;
attribute vec3 aRandom;
uniform float uTime;
uniform float uSize;

void main() {
  vec4 modelPosition = modelMatrix * vec4(position, 1.0); // 模型空间位置

  modelPosition.xyz += aRandom * uTime * 10.0; // 按随机方向扩散

  vec4 viewPosition = viewMatrix * modelPosition; // 视图空间位置

  gl_Position = projectionMatrix * viewPosition; // 透视空间位置

  gl_PointSize = uSize * aScale - (uTime * 15.0); // 顶点大小
}

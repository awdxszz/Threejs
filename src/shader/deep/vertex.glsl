// 精度
precision lowp float;
// 顶点着色器
attribute vec3 position;
// 纹理坐标
attribute vec2 uv;

// 投影矩阵
uniform mat4 projectionMatrix;
// 模型矩阵
uniform mat4 modelMatrix;
// 视图矩阵
uniform mat4 viewMatrix;

// 时间变量，用于在顶点着色器中实现动画效果
uniform float uTime;

// varying 变量，用于在顶点着色器和片元着色器之间传递数据
varying vec2 vUv;

varying float vElevation;

void main() {
  vUv = uv;
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * viewMatrix * modelPosition;
}
// 精度
precision lowp float;

// 定义varying变量，用于在顶点着色器和片元着色器之间传递数据
varying vec4 vPosition;
// 定义局部坐标全局变量，用于在片元着色器中使用
varying vec4 gPosition;
void main() {
  // 计算模型位置
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  // 传递模型位置到片元着色器
  vPosition = modelPosition;
  // 传递局部坐标到片元着色器
  gPosition = vec4(position, 1.0);
  // 计算投影位置
  gl_Position = projectionMatrix * viewMatrix * modelPosition;
}
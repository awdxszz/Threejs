attribute vec3 aStep;
uniform float uTime;
uniform float uSize;

void main() {
  vec4 modelPosition = modelMatrix * vec4(position, 1.0); // 模型空间位置

  modelPosition.xyz += (aStep * uTime); // 更新位置

  vec4 viewPosition = viewMatrix * modelPosition; // 视图空间位置

  gl_Position = projectionMatrix * viewPosition; // 透视空间位置

  gl_PointSize = uSize; // 顶点大小


}

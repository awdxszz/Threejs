// 精度
precision lowp float;
// 定义varying变量，用于在顶点着色器和片元着色器之间传递数据
varying vec4 vPosition;
// 定义局部坐标全局变量，用于在片元着色器中使用
varying vec4 gPosition;

void main() {
  // 计算当前片元的颜色为红色 vec4(r, g, b, a)
  vec4 redColor = vec4(1.0, 0.0, 0.0, 1.0);
  // 计算当前片元的颜色为黄色
  vec4 yellowColor = vec4(1.0, 1.0, 0.5, 1.0);
  // 计算当前片元的颜色为红色和黄色的混合颜色
  vec4 mixColor = mix(yellowColor, redColor, gPosition.y / 3.0);

  // 处理正面可见的情况
  if(gl_FrontFacing) {
    // 输出正面的颜色
    gl_FragColor = vec4(mixColor.rgb - (vPosition.y - 20.0) / 80.0, 1.0);
  } else {
    // 输出反面/内部的颜色
    gl_FragColor = vec4(mixColor.rgb, 1.0);
  }
}
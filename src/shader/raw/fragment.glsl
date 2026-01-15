// 精度
precision lowp float;
// 片元着色器
varying vec2 vUv;
// 高度值
varying float vElevation;
// 定义纹理变量，用于在片元着色器中采样纹理
uniform sampler2D uTexture;



void main() {
  // gl_FragColor = vec4(vUv, 0.0, 1.0);
  // 基于高度值，调整颜色
  float height = vElevation + 0.05 * 10.0;
  // // 高度值范围在 [0, 1] 之间
  // height = clamp(height, 0.0, 1.0);
  // gl_FragColor = vec4(1.0 * height, 0.0, 0.0, 1.0);

  // 根据UV取出对应的颜色
  vec4 textureColor = texture2D(uTexture, vUv);
  textureColor.rgb *= height;
  gl_FragColor = textureColor;
}
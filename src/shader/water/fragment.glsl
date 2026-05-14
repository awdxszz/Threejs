precision lowp float;

uniform vec3 uLowColor;
uniform vec3 uHighColor;
varying float vElevation;
uniform float uOpacity;



void main() {
  float opacity = (vElevation + 1.0) / 2.0;
  // 混合颜色
  vec3 color = mix(uLowColor, uHighColor, opacity);
  // 计算当前片元的颜色为红色 vec4(r, g, b, a)
  gl_FragColor = vec4(color, uOpacity);
}
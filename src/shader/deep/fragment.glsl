// 精度
precision lowp float;
// 片元着色器
varying vec2 vUv;
// 时间变量，用于在片元着色器中实现动画效果
uniform float uTime;

#define PI 3.14159265359

// 随机函数，用于在片元着色器中实现随机效果
float random(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

// 旋转函数，用于在片元着色器中实现旋转效果
vec2 rotate(vec2 uv, float rotation, vec2 mid) {
  return vec2(
    cos(rotation) * (uv.x - mid.x) + sin(rotation) * (uv.y - mid.y) + mid.x,
    cos(rotation) * (uv.y - mid.y) + sin(rotation) * (uv.x - mid.x) + mid.y
  );
}

// 噪声函数，用于在片元着色器中实现随机效果
float noise(vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);

  float a = random(i);
  float b = random(i + vec2(1.0, 0.0));
  float c = random(i + vec2(0.0, 1.0));
  float d = random(i + vec2(1.0, 1.0));

  vec2 u = f * f * (3.0 - 2.0 * f);

  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

void main() {
  // 通过顶点对应的uv坐标，获取对应的颜色
  // gl_FragColor = vec4(vUv, 0, 1);

  // 对第一种变形
  // gl_FragColor = vec4(vUv, 1, 1);

  // 利用uv实现渐变效果，根据uv的x坐标，实现从左到右的渐变效果
  // float elevation = vUv.x;
  // gl_FragColor = vec4(elevation, elevation, elevation, 1);

  // 利用uv实现渐变效果，根据uv的y坐标，实现从下到上的渐变效果
  // float elevation = vUv.y;
  // gl_FragColor = vec4(elevation, elevation, elevation, 1);

  // 利用取模达到循环效果，实现从下到上的渐变效果
  // float elevation = mod(vUv.y * 5.0, 0.5);
  // gl_FragColor = vec4(elevation, elevation, elevation, 1);

  // 利用step函数实现从下到上的渐变效果
  // float elevation = step(0.5, mod(vUv.y * 5.0, 1.0));
  // gl_FragColor = vec4(elevation, elevation, elevation, 1);

  // 条纹相加
  // float elevation = step(0.5, mod(vUv.y * 5.0, 1.0)) + step(0.5, mod(vUv.x * 5.0, 1.0));
  // gl_FragColor = vec4(elevation, elevation, elevation, 1);

  // 方块图形
  // float elevation = step(0.2, mod(vUv.y * 5.0, 1.0)) * step(0.2, mod(vUv.x * 5.0, 1.0));
  // gl_FragColor = vec4(elevation, elevation, elevation, 1);

  // 条纹转角图形
  // float barx = step(0.4, mod((vUv.x + uTime * 0.2) * 10.0, 1.0)) * step(0.8, mod(vUv.y * 10.0, 1.0));
  // float bary = step(0.4, mod((vUv.y + uTime * 0.2) * 10.0, 1.0)) * step(0.8, mod(vUv.x * 10.0, 1.0));
  // float strength = barx + bary;
  // gl_FragColor = vec4(strength, strength, strength, 1);
  // // gl_FragColor = vec4(vUv, 1, strength);

  // 利用绝对值函数，实现从中心向四周扩散的效果
  // float strength = abs(vUv.x - 0.5) + abs(vUv.y - 0.5);
  // float strength = 1.0 - step(0.2, distanceToCenter);
  // gl_FragColor = vec4(strength, strength, strength, 1);

  // 利用取整，实现条纹渐变效果
  // float strength = floor(vUv.x * 10.0) / 10.0;
  // gl_FragColor = vec4(strength, strength, strength, 1);

  // 条纹相乘，实现渐变格子
  // float strength = floor(vUv.x * 10.0) / 10.0 * floor(vUv.y * 10.0) / 10.0;
  // gl_FragColor = vec4(strength, strength, strength, 1);

  // 随机效果
  // float strength = random(vUv);
  // gl_FragColor = vec4(strength, strength, strength, 1);

  // 随机+格子效果
  // float strength = ceil(vUv.x * 10.0) / 10.0 * ceil(vUv.y * 10.0) / 10.0;
  // strength = random(vec2(strength, strength));
  // gl_FragColor = vec4(strength, strength, strength, 1);

  // 依据length返回向量长度
  // float strength = length(vUv - 0.5);
  // gl_FragColor = vec4(strength, strength, strength, 1);

  // 根据相除，实现星星效果
  // float strength = 0.15 / distance(vUv, vec2(0.5, 0.5));
  // gl_FragColor = vec4(strength, strength, strength, 1);

  // 十字交叉的星星
  // float strength = 0.15 / distance(vec2(vUv.x, (vUv.y - 0.5) * 5.0 + 0.5), vec2(0.5, 0.5)) - 1.0;
  // strength *= 0.15 / distance(vec2(vUv.y, (vUv.x - 0.5) * 5.0 + 0.5), vec2(0.5, 0.5)) - 1.0;
  // gl_FragColor = vec4(strength, strength, strength, 1);

  // 旋转效果
  // vec2 rotatedUv = rotate(vUv, uTime, vec2(0.5));
  // float strength = 0.15 / distance(vec2(rotatedUv.x, (rotatedUv.y - 0.5) * 5.0 + 0.5), vec2(0.5, 0.5)) - 1.0;
  // strength += 0.15 / distance(vec2(rotatedUv.y, (rotatedUv.x - 0.5) * 5.0 + 0.5), vec2(0.5, 0.5)) - 1.0;
  // gl_FragColor = vec4(strength, strength, strength, 1);

  // 绘制圆形
  // float strength = 1.0 - step(0.5, distance(vUv, vec2(0.5, 0.5)) + 0.25);
  // gl_FragColor = vec4(strength, strength, strength, 1);

  // 绘制圆环
  // float strength = 1.0 - step(0.5, distance(vUv, vec2(0.5, 0.5)) + 0.25);
  // strength *= step(0.5, distance(vUv, vec2(0.5, 0.5)) + 0.35);
  // gl_FragColor = vec4(strength, strength, strength, 1);

  // 波浪圆环
  // vec2 wavedUv = vec2(vUv.x, vUv.y + sin(vUv.x * 10.0 + uTime) * 0.1);
  // float strength = 1.0 - step(0.5, distance(wavedUv, vec2(0.5, 0.5)) + 0.25);
  // strength *= step(0.5, distance(wavedUv, vec2(0.5, 0.5)) + 0.35);
  // gl_FragColor = vec4(strength, strength, strength, 1);

  // 实现雷达扫射效果
  // float alpha = 1.0 - step(0.5, distance(vUv, vec2(0.5, 0.5)) + 0.05);
  // float angle = atan(vUv.y - 0.5, vUv.x - 0.5);
  // // 根据uTime让角度随时间旋转，实现雷达扫描动画
  // float strength = mod((angle + 3.1415926 + uTime * 0.5) / (2.0 * 3.1415926), 1.0);
  // gl_FragColor = vec4(strength, strength, strength, alpha);

  // 万花筒
  // float angle = atan(vUv.x - 0.5, vUv.y - 0.5) / PI;
  // float strength = mod(angle * 10.0 + uTime * 0.5, 1.0);
  // gl_FragColor = vec4(strength, strength, strength, 1.0);

  // 使用噪声实现烟雾、波纹效果
  float noise = noise(vUv * 10.0 + uTime * 0.5);
  float strength = mod(noise * 10.0 + uTime * 0.5, 1.0);
  gl_FragColor = vec4(strength, strength, strength, 1.0);
} 
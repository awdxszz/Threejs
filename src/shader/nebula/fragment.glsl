varying vec2 vUv;

uniform sampler2D uTexture;

void main() {
  // gl_FragColor = vec4(gl_PointCoord.xy, 0.0, 1.0);

  // 设置圆
  // float strength = distance(gl_PointCoord.xy, vec2(0.5));
  // strength *= 2.0;
  // strength = 1.0 - strength;
  // gl_FragColor = vec4(strength);

  // 根据纹理采样颜色
  // vec4 textureColor = texture2D(uTexture, gl_PointCoord);
  // gl_FragColor = vec4(textureColor.rgb, textureColor.r);

  vec4 textureColor = texture2D(uTexture, gl_PointCoord);
  gl_FragColor = vec4(gl_PointCoord, 1.0, textureColor.r);
}
precision highp float;

varying vec2 vUv;

uniform sampler2D uTexture;

void main() {
  float offset = 0.0015;
  vec2 uvR = vUv + vec2(-offset, 0.0);
  vec2 uvB = vUv + vec2(offset, 0.0);

  vec4 colR = texture2D(uTexture, uvR);
  vec4 colG = texture2D(uTexture, vUv);
  vec4 colB = texture2D(uTexture, uvB);

  vec3 color = vec3(colR.r, colG.g, colB.b);

  float dist = distance(vUv, vec2(0.5));
  float vignette = smoothstep(0.9, 0.4, dist);

  gl_FragColor = vec4(color * vignette, 1.0);
}

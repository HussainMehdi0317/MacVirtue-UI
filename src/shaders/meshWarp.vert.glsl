precision highp float;

attribute vec3 position;
attribute vec2 uv;

uniform float uTime;
uniform float uProgress;
uniform vec3 uTarget;

varying vec2 vUv;

vec3 cubicBezier(vec3 p0, vec3 p1, vec3 p2, vec3 p3, float t) {
  float it = 1.0 - t;
  return it * it * it * p0 +
         3.0 * it * it * t * p1 +
         3.0 * it * t * t * p2 +
         t * t * t * p3;
}

void main() {
  vUv = uv;

  float influenceBasedOnVertexY = clamp(uv.y, 0.0, 1.0);

  float progress = uProgress;
  float warpBase = smoothstep(0.0, 0.9, progress);
  float tail = 1.0 - pow(1.0 - progress, 2.0);
  float warpFactor = warpBase * tail;

  vec3 p0 = position;
  vec3 p3 = uTarget;

  vec3 p1 = mix(p0, p3, 0.3) + vec3(0.0, 0.2, 0.0);
  vec3 p2 = mix(p0, p3, 0.7) + vec3(0.0, -0.1, 0.0);

  vec3 pathPoint = cubicBezier(p0, p1, p2, p3, progress);

  vec3 finalPos = mix(position, pathPoint, warpFactor * influenceBasedOnVertexY);

  gl_Position = vec4(finalPos, 1.0);
}

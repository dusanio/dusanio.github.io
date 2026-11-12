import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';

/**
 * Removes NaN/Inf pixels (e.g. from degenerate normals in compressed normal maps) and clamps extreme HDR
 * values before bloom. Without this a single bad pixel gets smeared by the bloom blur into black blocks.
 */
const SanitizeShader = {
  uniforms: { tDiffuse: { value: null } },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    varying vec2 vUv;
    void main() {
      vec4 c = texture2D(tDiffuse, vUv);
      // comparisons with NaN are false, so this catches NaN and Inf alike
      bool ok = abs(c.r) < 1e4 && abs(c.g) < 1e4 && abs(c.b) < 1e4;
      gl_FragColor = ok ? vec4(clamp(c.rgb, 0.0, 64.0), 1.0) : vec4(0.0, 0.0, 0.0, 1.0);
    }
  `,
};

/** Film finish applied after tone mapping: grain, vignette, slight chromatic aberration, and a dim control. */
const FinishShader = {
  uniforms: {
    tDiffuse: { value: null },
    uTime: { value: 0 },
    uDim: { value: 0 },
    uAberration: { value: 0.00035 },
    uGrain: { value: 0.032 },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float uTime;
    uniform float uDim;
    uniform float uAberration;
    uniform float uGrain;
    varying vec2 vUv;
    float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
    void main() {
      vec2 c = vUv - 0.5;
      float r2 = dot(c, c);
      vec2 off = c * r2 * uAberration * 40.0;
      vec3 col;
      col.r = texture2D(tDiffuse, vUv + off).r;
      col.g = texture2D(tDiffuse, vUv).g;
      col.b = texture2D(tDiffuse, vUv - off).b;
      float vig = smoothstep(0.85, 0.2, r2 * 1.6);
      col *= mix(0.45, 1.0, vig);
      col *= 1.0 - uDim;
      float g = hash(vUv * vec2(1920.0, 1080.0) + fract(uTime * 7.0) * 100.0) - 0.5;
      col += g * uGrain;
      gl_FragColor = vec4(col, 1.0);
    }
  `,
};

export function createPost(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera, mobile: boolean) {
  const composer = new EffectComposer(
    renderer,
    new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: mobile ? 0 : 4 }),
  );
  composer.setPixelRatio(renderer.getPixelRatio());
  composer.setSize(window.innerWidth, window.innerHeight);
  composer.addPass(new RenderPass(scene, camera));
  composer.addPass(new ShaderPass(SanitizeShader));
  const bloomScale = mobile ? 0.35 : 0.5;
  const bloom = new UnrealBloomPass(new THREE.Vector2(window.innerWidth * bloomScale, window.innerHeight * bloomScale), 0.55, 0.45, 0.92);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());
  const finish = new ShaderPass(FinishShader);
  if (mobile) {
    // small screens: fringing reads as a glitch and grain as noise
    finish.uniforms.uAberration.value = 0;
    finish.uniforms.uGrain.value = 0.018;
  }
  composer.addPass(finish);

  return {
    composer,
    finish,
    resize(w: number, h: number) {
      composer.setSize(w, h);
      bloom.resolution.set(w * bloomScale, h * bloomScale);
    },
  };
}

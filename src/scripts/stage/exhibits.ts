import * as THREE from 'three';
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

/**
 * Particle "exhibits": one point cloud per project (sampled from its logo), that morph into each other.
 * Every particle carries a from/to position; a single uniform drives the transition, with a per-particle
 * delay and a turbulent burst mid-way so the swap reads as the object dissolving and re-forming.
 */

function positionsOnly(geo: THREE.BufferGeometry): THREE.BufferGeometry {
  const g = geo.index ? geo.toNonIndexed() : geo.clone();
  for (const name of Object.keys(g.attributes)) if (name !== 'position') g.deleteAttribute(name);
  return g;
}

/** About page: an armillary "gyroscope" of three rings around a core. */
export function sampleGyro(count: number): Float32Array {
  const parts: THREE.BufferGeometry[] = [];
  const axes: [number, number][] = [
    [0, 0],
    [Math.PI / 2, 0],
    [Math.PI / 2, Math.PI / 2],
  ];
  axes.forEach(([rx, ry], i) => {
    const t = new THREE.TorusGeometry(1.25 - i * 0.18, 0.035, 12, 160);
    t.rotateX(rx);
    t.rotateY(ry);
    parts.push(positionsOnly(t));
  });
  parts.push(positionsOnly(new THREE.IcosahedronGeometry(0.42, 4)));
  const geo = mergeGeometries(parts)!;
  geo.rotateX(0.4);
  geo.rotateZ(0.2);
  const sampler = new MeshSurfaceSampler(new THREE.Mesh(geo)).build();
  const out = new Float32Array(count * 3);
  const p = new THREE.Vector3();
  for (let i = 0; i < count; i++) {
    sampler.sample(p);
    out.set([p.x, p.y, p.z], i * 3);
  }
  geo.dispose();
  return out;
}

/**
 * A logo as a particle cloud: points scattered over the mask's filled pixels, with a share placed on
 * edge pixels so the silhouette stays crisp, and a little depth so it reads as an object, not a decal.
 */
export function sampleLogo(img: HTMLImageElement, count: number, size = 3.1, depth = 0.32): Float32Array {
  const res = 200;
  const c = document.createElement('canvas');
  c.width = c.height = res;
  const ctx = c.getContext('2d', { willReadFrequently: true })!;
  ctx.drawImage(img, 0, 0, res, res);
  const a = ctx.getImageData(0, 0, res, res).data;
  const on = (x: number, y: number) => x >= 0 && y >= 0 && x < res && y < res && a[(y * res + x) * 4 + 3] > 127;

  const fill: number[] = [];
  const edge: number[] = [];
  let minX = res, maxX = 0, minY = res, maxY = 0;
  for (let y = 0; y < res; y++) {
    for (let x = 0; x < res; x++) {
      if (!on(x, y)) continue;
      fill.push(x, y);
      if (!on(x - 1, y) || !on(x + 1, y) || !on(x, y - 1) || !on(x, y + 1)) edge.push(x, y);
      minX = Math.min(minX, x); maxX = Math.max(maxX, x);
      minY = Math.min(minY, y); maxY = Math.max(maxY, y);
    }
  }
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  const scale = size / Math.max(maxX - minX, maxY - minY);
  const out = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const fromEdge = edge.length && Math.random() < 0.35;
    const src = fromEdge ? edge : fill;
    const k = (Math.random() * (src.length / 2)) | 0;
    const x = src[k * 2] + Math.random() - 0.5;
    const y = src[k * 2 + 1] + Math.random() - 0.5;
    // edges sit on the front/back faces; the fill spreads through the thickness
    const z = fromEdge ? (Math.random() < 0.5 ? -0.5 : 0.5) * depth : (Math.random() - 0.5) * depth;
    out.set([(x - cx) * scale, -(y - cy) * scale, z], i * 3);
  }
  return out;
}

const vertexShader = /* glsl */ `
  attribute vec3 aFrom;
  attribute vec3 aTo;
  attribute vec4 aRand;
  uniform float uMorph;
  uniform float uTime;
  uniform float uSize;
  uniform float uBurst;
  varying float vT;
  varying float vSpark;
  varying float vDepth;

  vec3 swirl(vec3 p, float t) {
    return vec3(
      sin(p.y * 1.9 + t * 1.3) + sin(p.z * 3.1 - t),
      sin(p.z * 1.7 + t * 1.1) + sin(p.x * 2.7 + t * 0.7),
      sin(p.x * 1.5 + t * 0.9) + sin(p.y * 2.3 - t * 1.2)
    );
  }

  void main() {
    float delay = aRand.x * 0.4;
    float t = smoothstep(delay, delay + 0.6, uMorph);
    vT = t;
    vec3 p = mix(aFrom, aTo, t);

    // dissolve: particles get flung along a swirl field and pulled back in
    float burst = sin(t * 3.14159) * uBurst;
    p += swirl(p * 0.9, uTime * 0.6) * burst * 0.55;
    p += (aRand.yzw - 0.5) * burst * 1.4;

    // idle breathing so the object never looks static
    p += normalize(p + 0.0001) * sin(uTime * 1.1 + aRand.x * 6.2831) * 0.018;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    vSpark = pow(clamp(0.5 + 0.5 * sin(uTime * (1.5 + aRand.y * 3.0) + aRand.z * 40.0), 0.0, 1.0), 12.0);
    vDepth = -mv.z;
    gl_PointSize = min(uSize * (0.55 + aRand.y * 0.9 + vSpark * 1.2) / max(-mv.z, 0.5), 48.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform float uIntensity;
  varying float vT;
  varying float vSpark;
  varying float vDepth;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float a = smoothstep(0.5, 0.05, d);
    vec3 col = mix(uColorA, uColorB, vT);
    // white-hot core on the sparkling particles
    col = mix(col, vec3(1.0), 0.45 + vSpark * 0.5);
    gl_FragColor = vec4(col * uIntensity * (1.0 + vSpark * 2.5), a * 0.6);
  }
`;

export interface Exhibits {
  points: THREE.Points;
  material: THREE.ShaderMaterial;
  /** Morph to a shape; resolves when done. */
  morphTo(key: string, accent: THREE.Color, instant?: boolean): void;
  update(dt: number, time: number): void;
}

/** `clouds` maps a key to `count` xyz positions; the first entry is shown initially. */
export function createExhibits(clouds: Map<string, Float32Array>, count: number, pixelRatio: number): Exhibits {
  const first = clouds.values().next().value as Float32Array;
  const geo = new THREE.BufferGeometry();
  // "position" is only used for bounds; real positions come from aFrom/aTo.
  geo.setAttribute('position', new THREE.BufferAttribute(first.slice(), 3));
  const aFrom = new THREE.BufferAttribute(first.slice(), 3);
  const aTo = new THREE.BufferAttribute(first.slice(), 3);
  geo.setAttribute('aFrom', aFrom);
  geo.setAttribute('aTo', aTo);
  const rand = new Float32Array(count * 4);
  for (let i = 0; i < rand.length; i++) rand[i] = Math.random();
  geo.setAttribute('aRand', new THREE.BufferAttribute(rand, 4));
  geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 4);

  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uMorph: { value: 1 },
      uTime: { value: 0 },
      uSize: { value: 26 * pixelRatio },
      uBurst: { value: 1 },
      uColorA: { value: new THREE.Color(1, 1, 1) },
      uColorB: { value: new THREE.Color(1, 1, 1) },
      uIntensity: { value: 0.5 },
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const points = new THREE.Points(geo, material);
  points.frustumCulled = false;

  let morphing = false;

  return {
    points,
    material,
    morphTo(key, accent, instant = false) {
      const target = clouds.get(key);
      if (!target) return;
      const u = material.uniforms;
      // Start from where particles are heading now; good enough even mid-morph.
      (aFrom.array as Float32Array).set(aTo.array as Float32Array);
      (aTo.array as Float32Array).set(target);
      aFrom.needsUpdate = aTo.needsUpdate = true;
      (u.uColorA.value as THREE.Color).copy(u.uColorB.value as THREE.Color);
      (u.uColorB.value as THREE.Color).copy(accent);
      u.uMorph.value = instant ? 1 : 0;
      u.uBurst.value = instant ? 0 : 1;
      morphing = !instant;
    },
    update(dt, time) {
      const u = material.uniforms;
      u.uTime.value = time;
      if (morphing) {
        u.uMorph.value = Math.min(1, u.uMorph.value + dt / 1.9);
        if (u.uMorph.value >= 1) morphing = false;
      }
    },
  };
}

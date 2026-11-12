import * as THREE from 'three';
import { Reflector } from 'three/examples/jsm/objects/Reflector.js';
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';

/**
 * The hall: a brutalist concrete room at night. Wet reflective floor, planters with real (CC0, Poly Haven)
 * plants under warm uplights, a cold skylight shaft, a suspended halo over a lit floor ring where the
 * exhibits float, and a tall window slit glowing with the city behind.
 */

export const ROOM = { halfW: 14, front: 18, back: -18, height: 20 };
export const EXHIBIT_POS = new THREE.Vector3(0, 3.9, 0);

export interface EnvAssets {
  wall: { diff: THREE.Texture; nor: THREE.Texture; rough: THREE.Texture; ao: THREE.Texture };
  floor: { diff: THREE.Texture; nor: THREE.Texture; rough: THREE.Texture };
  plants: Record<'pachira' | 'potted' | 'fern' | 'calathea', GLTF>;
}

export interface Environment {
  group: THREE.Group;
  /** Light tinted with the current project's accent. */
  accentLight: THREE.PointLight;
  halo: THREE.Mesh;
  ring: THREE.Mesh;
  floorUniforms: Record<string, THREE.IUniform>;
  update(time: number, accent: THREE.Color): void;
}

const FLOOR_LIGHTS = 4;

const floorShader = {
  name: 'WetFloor',
  uniforms: {
    color: { value: null },
    tDiffuse: { value: null },
    textureMatrix: { value: null },
    tMap: { value: null },
    tNormal: { value: null },
    tRough: { value: null },
    uRepeat: { value: new THREE.Vector2(7, 9) },
    uLightPos: { value: [] as THREE.Vector3[] },
    uLightColor: { value: [] as THREE.Color[] },
    uFogColor: { value: new THREE.Color() },
    uFogDensity: { value: 0.03 },
  },
  vertexShader: /* glsl */ `
    uniform mat4 textureMatrix;
    uniform vec2 uRepeat;
    varying vec4 vReflUv;
    varying vec2 vUv;
    varying vec3 vWorld;
    void main() {
      vReflUv = textureMatrix * vec4(position, 1.0);
      vUv = uv * uRepeat;
      vec4 world = modelMatrix * vec4(position, 1.0);
      vWorld = world.xyz;
      gl_Position = projectionMatrix * viewMatrix * world;
    }
  `,
  fragmentShader: /* glsl */ `
    #define LIGHTS ${FLOOR_LIGHTS}
    uniform sampler2D tDiffuse;
    uniform sampler2D tMap;
    uniform sampler2D tNormal;
    uniform sampler2D tRough;
    uniform vec3 uLightPos[LIGHTS];
    uniform vec3 uLightColor[LIGHTS];
    uniform vec3 uFogColor;
    uniform float uFogDensity;
    varying vec4 vReflUv;
    varying vec2 vUv;
    varying vec3 vWorld;

    void main() {
      vec3 n = texture2D(tNormal, vUv).xyz * 2.0 - 1.0;
      float rough = texture2D(tRough, vUv).r;
      // low-roughness hollows hold water: those become mirror-like puddles
      float wet = smoothstep(0.75, 0.45, rough + n.x * 0.15);
      float blur = mix(0.022, 0.003, wet);

      vec4 uv = vReflUv;
      uv.xy += n.xy * mix(0.06, 0.02, wet) * uv.w;
      vec3 refl = vec3(0.0);
      refl += texture2DProj(tDiffuse, uv).rgb * 0.36;
      refl += texture2DProj(tDiffuse, uv + vec4( blur, 0.0, 0.0, 0.0) * uv.w).rgb * 0.16;
      refl += texture2DProj(tDiffuse, uv + vec4(-blur, 0.0, 0.0, 0.0) * uv.w).rgb * 0.16;
      refl += texture2DProj(tDiffuse, uv + vec4(0.0,  blur * 1.6, 0.0, 0.0) * uv.w).rgb * 0.16;
      refl += texture2DProj(tDiffuse, uv + vec4(0.0, -blur * 1.6, 0.0, 0.0) * uv.w).rgb * 0.16;

      vec3 albedo = texture2D(tMap, vUv).rgb;
      vec3 light = vec3(0.012, 0.014, 0.02);
      for (int i = 0; i < LIGHTS; i++) {
        vec3 d = uLightPos[i] - vWorld;
        float falloff = 1.0 / (1.0 + dot(d, d) * 0.12);
        light += uLightColor[i] * falloff;
      }
      vec3 diffuse = albedo * light * (1.0 - wet * 0.5);

      vec3 V = normalize(cameraPosition - vWorld);
      float fres = 0.04 + 0.96 * pow(1.0 - max(V.y, 0.0), 5.0);
      vec3 col = diffuse + refl * mix(0.18, 0.95, wet) * mix(0.35, 1.0, fres);

      float dist = length(cameraPosition - vWorld);
      float fog = 1.0 - exp(-uFogDensity * uFogDensity * dist * dist);
      gl_FragColor = vec4(mix(col, uFogColor, fog), 1.0);
    }
  `,
};

/** Additive, soft-edged volume for light shafts. */
function shaftMaterial(color: THREE.Color, strength: number) {
  return new THREE.ShaderMaterial({
    uniforms: { uColor: { value: color }, uStrength: { value: strength }, uTime: { value: 0 } },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      varying vec3 vNormalV;
      varying vec3 vViewDir;
      void main() {
        vUv = uv;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vNormalV = normalize(normalMatrix * normal);
        vViewDir = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      uniform float uStrength;
      uniform float uTime;
      varying vec2 vUv;
      varying vec3 vNormalV;
      varying vec3 vViewDir;
      void main() {
        float edge = pow(abs(dot(vNormalV, vViewDir)), 1.6);
        float along = smoothstep(0.0, 0.25, vUv.y) * smoothstep(1.0, 0.55, vUv.y);
        float dust = 0.8 + 0.2 * sin(vUv.y * 40.0 - uTime * 0.6 + vUv.x * 12.0);
        gl_FragColor = vec4(uColor * edge * along * dust * uStrength, 1.0);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  });
}

function placeModel(gltf: GLTF, height: number, pos: THREE.Vector3, rotY: number, shadows: boolean) {
  const obj = gltf.scene.clone(true);
  const box = new THREE.Box3().setFromObject(obj);
  const size = box.getSize(new THREE.Vector3());
  const s = height / size.y;
  obj.scale.setScalar(s);
  obj.position.set(pos.x - ((box.min.x + box.max.x) / 2) * s, pos.y - box.min.y * s, pos.z - ((box.min.z + box.max.z) / 2) * s);
  obj.rotation.y = rotY;
  obj.traverse((o) => {
    const m = o as THREE.Mesh;
    if (m.isMesh) {
      m.castShadow = shadows;
      const mat = m.material as THREE.MeshStandardMaterial;
      if (mat) {
        mat.envMapIntensity = 0.6;
        if (mat.transparent || mat.alphaTest > 0) mat.side = THREE.DoubleSide;
      }
    }
  });
  return obj;
}

function tiled(t: THREE.Texture, x: number, y: number, srgb = false) {
  const c = t.clone();
  c.wrapS = c.wrapT = THREE.RepeatWrapping;
  c.repeat.set(x, y);
  c.anisotropy = 8;
  if (srgb) c.colorSpace = THREE.SRGBColorSpace;
  c.needsUpdate = true;
  return c;
}

export function createEnvironment(assets: EnvAssets, opts: { mobile: boolean; fogColor: THREE.Color; fogDensity: number }): Environment {
  const { mobile } = opts;
  const shadows = !mobile;
  const group = new THREE.Group();
  const { halfW, front, back, height } = ROOM;
  const depth = front - back;
  const midZ = (front + back) / 2;

  // ---- concrete shell ------------------------------------------------------
  const wallMat = (rx: number, ry: number, tint = 0.3) =>
    new THREE.MeshStandardMaterial({
      map: tiled(assets.wall.diff, rx, ry, true),
      normalMap: tiled(assets.wall.nor, rx, ry),
      roughnessMap: tiled(assets.wall.rough, rx, ry),
      aoMap: tiled(assets.wall.ao, rx, ry),
      color: new THREE.Color(tint, tint, tint * 1.04),
      roughness: 1,
      normalScale: new THREE.Vector2(1.2, 1.2),
    });

  for (const side of [-1, 1]) {
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(depth, height), wallMat(depth / 6, height / 6));
    wall.position.set(side * halfW, height / 2, midZ);
    wall.rotation.y = -side * (Math.PI / 2);
    wall.receiveShadow = shadows;
    group.add(wall);
  }

  // back wall with a tall window slit
  const slitW = 1.1;
  const slitH = 15;
  const slitX = -8.4;
  const backMat = wallMat(5, 3.5);
  const leftW = halfW + slitX - slitW / 2;
  const rightW = halfW - slitX - slitW / 2;
  const bl = new THREE.Mesh(new THREE.PlaneGeometry(leftW, height), backMat);
  bl.position.set(-halfW + leftW / 2, height / 2, back);
  const br = new THREE.Mesh(new THREE.PlaneGeometry(rightW, height), backMat);
  br.position.set(halfW - rightW / 2, height / 2, back);
  const btop = new THREE.Mesh(new THREE.PlaneGeometry(slitW, height - slitH - 1), backMat);
  btop.position.set(slitX, slitH + 1 + (height - slitH - 1) / 2, back);
  const bbot = new THREE.Mesh(new THREE.PlaneGeometry(slitW, 1), backMat);
  bbot.position.set(slitX, 0.5, back);
  for (const m of [bl, br, btop, bbot]) {
    m.receiveShadow = shadows;
    group.add(m);
  }
  // the city glow behind the slit
  const city = new THREE.Mesh(
    new THREE.PlaneGeometry(slitW, slitH),
    new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 } },
      vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
      fragmentShader: /* glsl */ `
        varying vec2 vUv;
        uniform float uTime;
        float h(vec2 p){ return fract(sin(dot(p, vec2(41.3, 289.1))) * 43758.5); }
        void main(){
          vec3 sky = mix(vec3(0.03, 0.05, 0.1), vec3(0.12, 0.18, 0.32), pow(vUv.y, 0.7));
          vec2 g = vec2(vUv.x * 14.0, vUv.y * 180.0);
          vec2 cell = floor(g);
          vec2 f = fract(g);
          float win = step(0.25, f.x) * step(f.x, 0.75) * step(0.3, f.y) * step(f.y, 0.7);
          float lit = step(0.86, h(cell)) * smoothstep(0.6, 0.3, vUv.y) * win * (0.7 + 0.3 * sin(uTime * 0.3 + h(cell) * 20.0));
          vec3 col = sky + vec3(1.0, 0.8, 0.55) * lit * 0.7;
          gl_FragColor = vec4(col, 1.0);
        }
      `,
    }),
  );
  city.position.set(slitX, 1 + slitH / 2, back - 0.6);
  group.add(city);

  const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(halfW * 2, depth), wallMat(6, 7, 0.2));
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.set(0, height, midZ);
  group.add(ceiling);

  // columns + beams
  const colMat = wallMat(1, 5, 0.5);
  const colGeo = new THREE.BoxGeometry(1.4, height, 1.4);
  for (const z of [10, 1, -8, -15]) {
    for (const side of [-1, 1]) {
      const c = new THREE.Mesh(colGeo, colMat);
      c.position.set(side * (halfW - 2.4), height / 2, z);
      c.castShadow = shadows;
      c.receiveShadow = shadows;
      group.add(c);
    }
    const beam = new THREE.Mesh(new THREE.BoxGeometry(halfW * 2, 1.2, 1.4), colMat);
    beam.position.set(0, height - 0.6, z);
    group.add(beam);
  }

  // ---- wet floor -----------------------------------------------------------
  const pr = Math.min(window.devicePixelRatio, 1.5);
  const reflScale = mobile ? 0.35 : 0.5;
  const floor = new Reflector(new THREE.PlaneGeometry(halfW * 2, depth), {
    textureWidth: Math.round(window.innerWidth * pr * reflScale),
    textureHeight: Math.round(window.innerHeight * pr * reflScale),
    clipBias: 0.003,
    shader: floorShader,
  });
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, 0, midZ);
  const fu = (floor.material as THREE.ShaderMaterial).uniforms;
  fu.tMap.value = tiled(assets.floor.diff, 7, 9, true);
  fu.tNormal.value = tiled(assets.floor.nor, 7, 9);
  fu.tRough.value = tiled(assets.floor.rough, 7, 9);
  fu.uFogColor.value = opts.fogColor;
  fu.uFogDensity.value = opts.fogDensity;
  group.add(floor);

  // ---- exhibit plinth: dark disc, floor ring, suspended halo ---------------
  const plinth = new THREE.Mesh(
    new THREE.CylinderGeometry(2.3, 2.45, 0.22, 96),
    new THREE.MeshStandardMaterial({ color: 0x0a0b0d, roughness: 0.18, metalness: 0.6 }),
  );
  plinth.position.set(0, 0.11, 0);
  group.add(plinth);

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(2.36, 0.022, 8, 160),
    new THREE.MeshBasicMaterial({ color: new THREE.Color(1.6, 1.7, 2) }),
  );
  ring.rotation.x = Math.PI / 2;
  ring.position.set(0, 0.23, 0);
  group.add(ring);

  const halo = new THREE.Mesh(
    new THREE.TorusGeometry(2.5, 0.035, 12, 200),
    new THREE.MeshBasicMaterial({ color: new THREE.Color(1.3, 1.36, 1.55) }),
  );
  halo.rotation.x = Math.PI / 2;
  halo.position.set(0, 8.8, 0);
  group.add(halo);
  // hanging cables
  const cableMat = new THREE.MeshBasicMaterial({ color: 0x1b1d22 });
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2;
    const cable = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, height - 8.8), cableMat);
    cable.position.set(Math.cos(a) * 2.5, 8.8 + (height - 8.8) / 2, Math.sin(a) * 2.5);
    group.add(cable);
  }

  // light cone from the halo down onto the exhibit
  const haloCone = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 3.4, 8.6, 64, 1, true), shaftMaterial(new THREE.Color(0.5, 0.58, 0.8), 0.06));
  haloCone.position.set(0, 4.6, 0);
  group.add(haloCone);

  // ---- skylight shaft (cold, slanted) --------------------------------------
  const shaftGeo = new THREE.CylinderGeometry(1.2, 3.2, 24, 48, 1, true);
  shaftGeo.translate(0, -12, 0);
  const shaft = new THREE.Mesh(shaftGeo, shaftMaterial(new THREE.Color(0.55, 0.68, 1.0), 0.16));
  shaft.position.set(-6.5, height, -9);
  shaft.rotation.set(0.32, 0, -0.38);
  group.add(shaft);

  const sky = new THREE.SpotLight(0x9fb8ff, 140, 45, 0.45, 0.6, 1.6);
  sky.position.set(-6.5, height - 0.5, -9);
  sky.target.position.set(-1.5, 0, -1);
  sky.castShadow = shadows;
  sky.shadow.mapSize.set(1024, 1024);
  sky.shadow.bias = -0.0004;
  sky.shadow.camera.near = 4;
  sky.shadow.camera.far = 40;
  group.add(sky, sky.target);

  // ---- planters + plants ---------------------------------------------------
  const planterMat = wallMat(1, 0.4, 0.55);
  const warm = new THREE.Color(1.0, 0.72, 0.45);
  const planters: { pos: THREE.Vector3; size: [number, number, number] }[] = [
    { pos: new THREE.Vector3(-8.2, 0, -1.5), size: [4.2, 0.9, 4.2] },
    { pos: new THREE.Vector3(8.4, 0, -4), size: [3.6, 0.9, 3.6] },
    { pos: new THREE.Vector3(-6.4, 0, 8.2), size: [3.2, 0.6, 2.2] },
    { pos: new THREE.Vector3(6.8, 0, 7.4), size: [3.0, 0.6, 2.4] },
  ];
  for (const p of planters) {
    const [w, h, d] = p.size;
    const box = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), planterMat);
    box.position.set(p.pos.x, h / 2, p.pos.z);
    box.castShadow = shadows;
    box.receiveShadow = shadows;
    group.add(box);
    const soil = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.3, d - 0.3), new THREE.MeshStandardMaterial({ color: 0x0b0907, roughness: 1 }));
    soil.rotation.x = -Math.PI / 2;
    soil.position.set(p.pos.x, h - 0.05, p.pos.z);
    group.add(soil);
    // a warm uplight strip along the planter lip
    const strip = new THREE.Mesh(new THREE.BoxGeometry(w - 0.4, 0.03, 0.03), new THREE.MeshBasicMaterial({ color: warm.clone().multiplyScalar(2.2) }));
    strip.position.set(p.pos.x, h + 0.01, p.pos.z + d / 2 - 0.2);
    group.add(strip);
  }

  const P = assets.plants;
  group.add(placeModel(P.pachira, 6.8, new THREE.Vector3(-8.2, 0.85, -1.5), 0.6, shadows));
  group.add(placeModel(P.calathea, 1.3, new THREE.Vector3(-9.3, 0.85, -0.2), 1.2, shadows));
  group.add(placeModel(P.potted, 3.6, new THREE.Vector3(8.4, 0.85, -4), -0.4, shadows));
  group.add(placeModel(P.fern, 1.5, new THREE.Vector3(7.6, 0.85, -2.6), 2.1, shadows));
  group.add(placeModel(P.fern, 1.4, new THREE.Vector3(-6.9, 0.55, 8.2), 0.3, shadows));
  group.add(placeModel(P.calathea, 1.2, new THREE.Vector3(-5.6, 0.55, 8.0), 2.4, shadows));
  group.add(placeModel(P.fern, 1.3, new THREE.Vector3(6.2, 0.55, 7.4), 4.0, shadows));
  group.add(placeModel(P.calathea, 1.25, new THREE.Vector3(7.5, 0.55, 7.6), 0.8, shadows));

  // uplights into the foliage
  const ups: [number, number, number][] = [
    [-8.2, 0.95, 0.3],
    [8.4, 0.95, -2.4],
    [-6.4, 0.65, 9],
    [6.8, 0.65, 8.3],
  ];
  for (const [x, y, z] of ups) {
    const up = new THREE.SpotLight(warm, mobile ? 30 : 40, 12, 0.75, 0.8, 1.5);
    up.position.set(x, y, z);
    up.target.position.set(x, y + 6, z - 0.6);
    group.add(up, up.target);
  }

  // ---- exhibit light (tinted with the project accent) ----------------------
  const accentLight = new THREE.PointLight(0xffffff, 26, 18, 1.6);
  accentLight.position.copy(EXHIBIT_POS);
  group.add(accentLight);

  const haloLight = new THREE.PointLight(0xc8d6ff, 18, 14, 1.8);
  haloLight.position.set(0, 8.6, 0);
  group.add(haloLight);

  // Floor lights mirror the strongest real lights (floor shader is custom-lit).
  fu.uLightPos.value = [
    new THREE.Vector3(0, 1.2, 0),
    new THREE.Vector3(-8.2, 1.5, 0.3),
    new THREE.Vector3(8.4, 1.5, -2.4),
    new THREE.Vector3(-3, 2, -4),
  ];
  fu.uLightColor.value = [
    new THREE.Color(1, 1, 1),
    warm.clone().multiplyScalar(1.6),
    warm.clone().multiplyScalar(1.4),
    new THREE.Color(0.35, 0.45, 0.7),
  ];

  // ---- airborne dust -------------------------------------------------------
  const dustCount = mobile ? 500 : 1500;
  const dp = new Float32Array(dustCount * 3);
  for (let i = 0; i < dustCount; i++) {
    dp[i * 3] = (Math.random() - 0.5) * halfW * 1.8;
    dp[i * 3 + 1] = Math.random() * height * 0.7;
    dp[i * 3 + 2] = back + Math.random() * depth * 0.85;
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dp, 3));
  const dust = new THREE.Points(
    dustGeo,
    new THREE.PointsMaterial({
      color: new THREE.Color(0.9, 0.95, 1.1),
      size: 0.03,
      transparent: true,
      opacity: 0.5,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
  group.add(dust);

  const shaftMats = [shaft.material, haloCone.material] as THREE.ShaderMaterial[];
  const ringMat = ring.material as THREE.MeshBasicMaterial;
  const accentFloor = fu.uLightColor.value[0] as THREE.Color;

  return {
    group,
    accentLight,
    halo,
    ring,
    floorUniforms: fu,
    update(time, accent) {
      for (const m of shaftMats) m.uniforms.uTime.value = time;
      (city.material as THREE.ShaderMaterial).uniforms.uTime.value = time;
      accentLight.color.copy(accent);
      accentLight.intensity = 22 + Math.sin(time * 1.3) * 3;
      accentFloor.copy(accent).multiplyScalar(2.2);
      ringMat.color.copy(accent).multiplyScalar(1.2).addScalar(0.6);
      dust.position.y = Math.sin(time * 0.15) * 0.3;
      dust.rotation.y = time * 0.004;
    },
  };
}

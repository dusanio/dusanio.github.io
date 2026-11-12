import * as THREE from 'three';
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { createEnvironment, EXHIBIT_POS, type EnvAssets } from './environment';
import { createExhibits, sampleGyro, sampleLogo } from './exhibits';
import { createPost } from './post';

export type StageMode = 'home' | 'project' | 'about';

export interface StageProject {
  slug: string;
  logo: string;
  accent: string;
}

export interface Stage {
  /** Show project `index` (home: browse; project: case-study framing). */
  setMode(mode: StageMode, index?: number): void;
  /** Screen x (CSS px) the exhibit should be centred on; the view glides there. */
  setCenter(x: number, gap?: number): void;
  /** Screen position (CSS px) of the exhibit's centre. */
  exhibitScreen(): { x: number; y: number };
  /** Screen position (CSS px) of the exhibit's anchor point. */
  anchor(): { x: number; y: number };
  readonly mobile: boolean;
}

interface Rig {
  pos: THREE.Vector3;
  look: THREE.Vector3;
  dim: number;
}

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');
const url = (p: string) => `${BASE}/scene/${p}`;

const ABOUT_ACCENT = '#dfe6ff';

function rigs(mobile: boolean): Record<StageMode, Rig> {
  if (mobile) {
    return {
      // exhibit in the upper part of the screen, text stacks below it
      home: { pos: new THREE.Vector3(0, 3.6, 16), look: new THREE.Vector3(0, 0.9, 0), dim: 0 },
      // case study / about: closer, logo large and bright in the top ~40% above the text
      project: { pos: new THREE.Vector3(0, 3.7, 15.5), look: new THREE.Vector3(0, -0.6, 0), dim: 0 },
      about: { pos: new THREE.Vector3(-0.6, 3.7, 15.5), look: new THREE.Vector3(0, -0.6, 0), dim: 0 },
    };
  }
  return {
    home: { pos: new THREE.Vector3(0, 3.5, 14), look: new THREE.Vector3(0, 4.0, 0), dim: 0 },
    // camera faces the exhibit; the view offset (setCenter) places it in the free space beside the content
    project: { pos: new THREE.Vector3(0.6, 3.6, 12.5), look: new THREE.Vector3(0, 3.9, 0), dim: 0.12 },
    about: { pos: new THREE.Vector3(-0.6, 3.5, 12.5), look: new THREE.Vector3(0, 3.9, 0), dim: 0.12 },
  };
}

export async function createStage(opts: {
  canvas: HTMLCanvasElement;
  projects: StageProject[];
  reducedMotion: boolean;
  onProgress?: (ratio: number) => void;
}): Promise<Stage> {
  const { canvas, projects, reducedMotion } = opts;
  // `mobile` = low-power device: fewer particles, no shadows. Fixed at startup.
  const mobile = window.matchMedia('(max-width: 768px)').matches || (navigator.maxTouchPoints > 1 && window.innerWidth < 1024);
  // Framing follows the *layout* (same 900px breakpoint as the CSS) and is re-checked on every resize.
  const narrow = () => window.innerWidth <= 900;

  // ---- load assets ---------------------------------------------------------
  const manager = new THREE.LoadingManager();
  manager.onProgress = (_u, loaded, total) => opts.onProgress?.(loaded / total);
  const tex = new THREE.TextureLoader(manager);
  const gltf = new GLTFLoader(manager).setMeshoptDecoder(MeshoptDecoder);
  const loadTex = (p: string) => tex.loadAsync(url(`textures/${p}.webp`));
  const loadGltf = (p: string) => gltf.loadAsync(url(`models/${p}.glb`)) as Promise<GLTF>;

  const img = new THREE.ImageLoader(manager);
  const logoImages = Promise.all(projects.map((p) => img.loadAsync(url(`logos/${p.logo}`))));
  const [wallDiff, wallNor, wallRough, wallAo, floorDiff, floorNor, floorRough, pachira, potted, fern, calathea, hdr] = await Promise.all([
    loadTex('concrete_slab_wall_diff'),
    loadTex('concrete_slab_wall_nor'),
    loadTex('concrete_slab_wall_rough'),
    loadTex('concrete_slab_wall_ao'),
    loadTex('concrete_floor_02_diff'),
    loadTex('concrete_floor_02_nor'),
    loadTex('concrete_floor_02_rough'),
    loadGltf('pachira_aquatica_01'),
    loadGltf('potted_plant_02'),
    loadGltf('fern_02'),
    loadGltf('calathea_orbifolia_01'),
    new RGBELoader(manager).loadAsync(url('env/night_1k.hdr')),
  ]);
  const assets: EnvAssets = {
    wall: { diff: wallDiff, nor: wallNor, rough: wallRough, ao: wallAo },
    floor: { diff: floorDiff, nor: floorNor, rough: floorRough },
    plants: { pachira, potted, fern, calathea },
  };

  // ---- renderer ------------------------------------------------------------
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, mobile ? 1.25 : 1.5));
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.95;
  renderer.shadowMap.enabled = !mobile;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const fogColor = new THREE.Color(0x07090d);
  const fogDensity = 0.035;
  scene.background = fogColor;
  scene.fog = new THREE.FogExp2(fogColor, fogDensity);

  const pmrem = new THREE.PMREMGenerator(renderer);
  hdr.mapping = THREE.EquirectangularReflectionMapping;
  scene.environment = pmrem.fromEquirectangular(hdr).texture;
  scene.environmentIntensity = 0.1;
  hdr.dispose();
  pmrem.dispose();

  const camera = new THREE.PerspectiveCamera(narrow() ? 58 : 47, window.innerWidth / window.innerHeight, 0.1, 80);

  const env = createEnvironment(assets, { mobile, fogColor, fogDensity });
  scene.add(env.group);

  const count = mobile ? 12000 : 24000;
  const clouds = new Map<string, Float32Array>();
  (await logoImages).forEach((image, i) => clouds.set(projects[i].slug, sampleLogo(image, count)));
  clouds.set('about', sampleGyro(count));
  const exhibits = createExhibits(clouds, count, renderer.getPixelRatio());
  exhibits.points.position.copy(EXHIBIT_POS);
  scene.add(exhibits.points);

  const post = createPost(renderer, scene, camera, mobile);

  // ---- state ---------------------------------------------------------------
  const RIGS_WIDE = rigs(false);
  const RIGS_NARROW = rigs(true);
  let RIGS = narrow() ? RIGS_NARROW : RIGS_WIDE;
  let mode: StageMode = 'home';
  let index = 0;
  let shapeKey = projects[0].slug;
  const accent = new THREE.Color(projects[0].accent);
  const accentTarget = accent.clone();
  exhibits.morphTo(projects[0].slug, accent, true);
  (exhibits.material.uniforms.uColorA.value as THREE.Color).copy(accent);

  const camPos = RIGS.home.pos.clone();
  const camLook = RIGS.home.look.clone();
  // entrance: start further back and higher, glide in
  if (!reducedMotion) camPos.add(new THREE.Vector3(0, 2.5, 9));
  let dim = 0;
  let spin = 0;
  const pointer = new THREE.Vector2();
  const pointerSmooth = new THREE.Vector2();

  window.addEventListener(
    'pointermove',
    (e) => pointer.set((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1),
    { passive: true },
  );
  // horizontal view shift (px): positive renders the scene further right
  let shiftTarget = 0;
  let gapPx = Infinity;
  let scale = narrow() ? 1.3 : 1.15;
  let shift = 0;
  const applyShift = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    if (Math.abs(shift) > 0.5) camera.setViewOffset(w, h, -shift, 0, w, h);
    else camera.clearViewOffset();
    camera.updateProjectionMatrix();
  };
  const applyView = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    camera.aspect = w / h;
    RIGS = narrow() ? RIGS_NARROW : RIGS_WIDE;
    camera.fov = narrow() ? 58 : 47;
    applyShift();
  };
  window.addEventListener('resize', () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    applyView();
    renderer.setSize(w, h, false);
    post.resize(w, h);
  });

  // ?probe: publish the exhibit's screen x on the canvas (layout tests)
  const probe = location.search.includes('probe');

  // ---- loop ----------------------------------------------------------------
  const clock = new THREE.Clock();
  const anchorLocal = new THREE.Vector3(0.9, 0.7, 0.3);
  const anchorWorld = new THREE.Vector3();
  const look = new THREE.Vector3();

  renderer.setAnimationLoop(() => {
    if (document.hidden) return;
    const dt = Math.min(clock.getDelta(), 0.05);
    const time = clock.elapsedTime;
    const motion = reducedMotion ? 0 : 1;

    const rig = RIGS[mode];
    const k = reducedMotion ? 1 : 1 - Math.exp(-dt * 1.6);
    camPos.lerp(rig.pos, k);
    camLook.lerp(rig.look, k);
    if (Math.abs(shiftTarget - shift) > 0.5) {
      shift += (shiftTarget - shift) * (reducedMotion ? 1 : 1 - Math.exp(-dt * 2.2));
      applyShift();
    }
    dim += (rig.dim - dim) * (1 - Math.exp(-dt * 3));
    pointerSmooth.lerp(pointer, 1 - Math.exp(-dt * 2.5));

    camera.position.copy(camPos);
    camera.position.x += pointerSmooth.x * 0.5 * motion;
    camera.position.y += (-pointerSmooth.y * 0.25 + Math.sin(time * 0.35) * 0.06) * motion;
    look.copy(camLook);
    camera.lookAt(look);

    accent.lerp(accentTarget, 1 - Math.exp(-dt * 2));
    exhibits.update(dt, time * motion);
    spin += dt * motion;
    exhibits.points.rotation.y = (Math.sin(spin * 0.35) * 0.45 + pointerSmooth.x * 0.35) * motion;
    exhibits.points.rotation.x = -pointerSmooth.y * 0.15 * motion;
    exhibits.points.position.y = EXHIBIT_POS.y + Math.sin(time * 0.7) * 0.08 * motion;

    // fit: keep the exhibit (≈3.1 units wide at scale 1) within ~72% of the free gap
    const base = narrow() ? 1.3 : 1.15;
    const dist = camera.position.distanceTo(exhibits.points.position);
    const pxPerUnit = window.innerHeight / 2 / (Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * dist);
    const fit = narrow() ? base : Math.min(base, (gapPx * 0.72) / (3.1 * pxPerUnit));
    scale += (Math.max(0.35, fit) - scale) * (reducedMotion ? 1 : 1 - Math.exp(-dt * 3));
    exhibits.points.scale.setScalar(scale);
    env.update(time * motion, accent);
    env.halo.rotation.z = time * 0.05 * motion;

    post.finish.uniforms.uTime.value = time;
    post.finish.uniforms.uDim.value = dim;
    post.composer.render(dt);
    if (probe) {
      anchorWorld.set(0, 0, 0).applyMatrix4(exhibits.points.matrixWorld).project(camera);
      canvas.dataset.exhibitX = String(Math.round((anchorWorld.x * 0.5 + 0.5) * window.innerWidth));
    }
  });

  return {
    mobile,
    setCenter(x, gap = Infinity) {
      shiftTarget = narrow() ? 0 : x - window.innerWidth / 2;
      gapPx = gap;
    },
    setMode(next, i = 0) {
      const p = next === 'about' ? null : projects[Math.max(0, Math.min(projects.length - 1, i))];
      const key = p ? p.slug : 'about';
      mode = next;
      index = i;
      accentTarget.set(p ? p.accent : ABOUT_ACCENT);
      if (key !== shapeKey) {
        shapeKey = key;
        exhibits.morphTo(key, accentTarget, reducedMotion);
      }
      void index;
    },
    exhibitScreen() {
      anchorWorld.set(0, 0, 0).applyMatrix4(exhibits.points.matrixWorld).project(camera);
      return { x: (anchorWorld.x * 0.5 + 0.5) * window.innerWidth, y: (-anchorWorld.y * 0.5 + 0.5) * window.innerHeight };
    },
    anchor() {
      anchorWorld.copy(anchorLocal).applyMatrix4(exhibits.points.matrixWorld).project(camera);
      return {
        x: (anchorWorld.x * 0.5 + 0.5) * window.innerWidth,
        y: (-anchorWorld.y * 0.5 + 0.5) * window.innerHeight,
      };
    },
  };
}

export function webglAvailable(): boolean {
  try {
    const c = document.createElement('canvas');
    return Boolean(c.getContext('webgl2'));
  } catch {
    return false;
  }
}

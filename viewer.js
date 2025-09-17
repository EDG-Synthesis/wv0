import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass }    from "three/addons/postprocessing/RenderPass.js";
import { SSAOPass }      from "three/addons/postprocessing/SSAOPass.js";

export function initViewer(containerId) {
  const container = document.getElementById(containerId);

  // Renderer
  const renderer = new THREE.WebGLRenderer({ 
    antialias: true, alpha: true, depth: true, logarithmicDepthBuffer: false 
  });
  renderer.physicallyCorrectLights = true;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(container.clientWidth, container.clientHeight, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.85;
  
  container.appendChild(renderer.domElement);

  // Scene + Camera
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    40, container.clientWidth / container.clientHeight, 0.1, 80
  );
  camera.position.set(2.8, 1.8, 3.2);

  // Postprocessing (SSAO)
  let composer = null, renderPass = null, ssaoPass = null;
  let aoEnabled = false; // start OFF; we'll toggle it on when happy
  //---debug---
  /* run diagAO() in console
    if depthOK is false, platform isn't capable.
  */
  window.diagAO = () => {
    const caps = renderer.capabilities;
    const webgl2 = !!caps.isWebGL2;
    const depthOK = !!ssaoPass?.depthRenderTarget?.depthTexture; // if undefined → no depth
    console.table({ webgl2, depthOK, pixelRatio: window.devicePixelRatio });
    if (ssaoPass) {
      const O = SSAOPass.OUTPUT;
      ssaoPass.output = O.SSAO;    // show mask
      renderOnce();
    }
  };
  //---end debug

  function ensureComposer() {
    if (composer) return;
    composer   = new EffectComposer(renderer);
    renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    ssaoPass = new SSAOPass(scene, camera, container.clientWidth, container.clientHeight);
    // Inch-scale, subtle, non-sooty starting point:
    ssaoPass.kernelRadius = 6;      // 5–8 works well indoors
    ssaoPass.minDistance  = 0.4;    // ignore < ~0.4"
    ssaoPass.maxDistance  = 1.6;    // search ~1.6"
    ssaoPass.output       = SSAOPass.OUTPUT.Default; 
    composer.addPass(ssaoPass);
  }

  // Controls
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = false;
  controls.target.set(0, 0.6, 0);
  controls.addEventListener("change", renderOnce);

  // ---Helpers & lighting
  function initKeyLight(kl, sc){
    kl.position.set(20, 20, 5);
    kl.castShadow = true;
    kl.shadow.mapSize.set(2048, 2048);   // 1024..4096 depending on perf
    kl.shadow.bias = -1e-4;              // fight shadow acne
    //kl.shadow.radius = 2; //softer shadows
    kl.shadow.normalBias = 0.005;
    kl.shadow.camera.left   = -sc;
    kl.shadow.camera.right  =  sc;
    kl.shadow.camera.top    =  sc;
    kl.shadow.camera.bottom = -sc;
    kl.shadow.camera.near   = 0.5;
    kl.shadow.camera.far    = 50;
    kl.shadow.camera.updateProjectionMatrix();
  }
  let ringLightGroup = null;
  function _toV3(v){ 
    return (v?.isVector3) ? v.clone() : new THREE.Vector3().fromArray(v||[0,0,0]); 
  }
  function makeRingLight({
    center, normal, radius,
    count=12, color=0xfffbed, intensity=1, distance=6, 
    decay=3, //2 is physically correct
    type="point", inward=true, castShadow=false
  }){
    const group = new THREE.Group(); group.name = "ringLight";
    const C = _toV3(center), N = _toV3(normal).normalize();
    // Orthonormal basis in the ring plane
    const tmp = Math.abs(N.y)>0.9 ? new THREE.Vector3(1,0,0) : new THREE.Vector3(0,1,0);
    const U = tmp.clone().cross(N).normalize();
    const V = N.clone().cross(U).normalize();

    const per = Math.max(1, count);
    const perI = intensity / per;

    for(let i=0;i<per;i++){
      const t = (i/per)*Math.PI*2;
      const p = C.clone().add(U.clone().multiplyScalar(Math.cos(t)*radius))
                        .add(V.clone().multiplyScalar(Math.sin(t)*radius));
      let L;
      if(type==="spot"){
        L = new THREE.SpotLight(color, perI, distance, Math.PI/2.2, 0.75, decay);
        L.castShadow = castShadow && (i % Math.ceil(per/6) === 0);
        L.position.copy(p);
        const tgt = new THREE.Object3D(); tgt.position.copy(inward ? C : C.clone().add(p.clone().sub(C).normalize()));
        group.add(tgt); L.target = tgt;
      }else{
        L = new THREE.PointLight(color, perI, distance, decay);
        L.castShadow = false; L.position.copy(p);
      }
      group.add(L);
    }
    return group;
  }
  function addRingLight(opts){
    removeRingLight();
    ringLightGroup = makeRingLight(opts);
    scene.add(ringLightGroup);
    renderOnce();
    return ringLightGroup;
  }
  function removeRingLight(){
    if(!ringLightGroup) return;
    scene.remove(ringLightGroup);
    ringLightGroup.traverse(o=>{ if(o.isLight && o.dispose) o.dispose(); });
    ringLightGroup = null; renderOnce();
  }

  scene.add(new THREE.AxesHelper(1.25));
  scene.add(new THREE.HemisphereLight(0xffffff, 0x333333, 0.4));
  // Key light for crisp specular highlights on metals
  const key = new THREE.DirectionalLight(0xffffff, 2.0);
  // Ortho shadow frustum (what area receives shadows)
  const d = 12;    // scene scale dependent
  initKeyLight(key,d);
  scene.add(key);


  // ---Environment (HDRI driving reflections; keep your gradient div background)
  const pmrem = new THREE.PMREMGenerator(renderer);
  pmrem.compileEquirectangularShader();
  const HDR_URL = "src/royal_esplanade_1k.hdr";


  function useRoomEnv() {
  const roomTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = roomTex;
  renderOnce();
  }

  new RGBELoader().setDataType(THREE.HalfFloatType).load(HDR_URL, (hdrTex) => {
      const envMap = pmrem.fromEquirectangular(hdrTex).texture;
      scene.environment = envMap;
      hdrTex.dispose();
      // pmrem.dispose();  // only dispose if you won’t call pmrem again
      renderOnce();
    }, undefined, (err) => {
      console.warn("HDR env failed; using RoomEnvironment fallback.", err);
      useRoomEnv();
    });

  // ---Resize
  function onResize() {
    const w = container.clientWidth;
    const h = container.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    composer?.setSize(w, h);
    ssaoPass?.setSize(w, h);
    renderOnce();
  }
  window.addEventListener("resize", onResize);

  //------SSAO debug shortcuts
  window.addEventListener("keydown", (e) => {
    if (e.altKey && e.key.toLowerCase() === "o") {
      aoEnabled = !aoEnabled;
      renderOnce();
    }
    if (e.altKey && e.key.toLowerCase() === "a" && ssaoPass) {
      const O = SSAOPass.OUTPUT;
      ssaoPass.output = (ssaoPass.output === O.SSAO) ? O.Default : O.SSAO;
      renderOnce();
    }
  });
  //---------end debug handler

  // On-demand render scheduler (coalesces bursts to a single frame)
  let raf = 0;
  function renderOnce() {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      if (aoEnabled){
        ensureComposer();
        composer.render();
      }
      else {renderer.render(scene, camera);}
    });
  }
  //api for setting the ambient occlusion
  function setAO(on, opts = {}) {
    aoEnabled = !!on;
    if (aoEnabled) {
      ensureComposer();
      Object.assign(ssaoPass, {
        kernelRadius: opts.kernelRadius ?? ssaoPass.kernelRadius,
        minDistance:  opts.minDistance  ?? ssaoPass.minDistance,
        maxDistance:  opts.maxDistance  ?? ssaoPass.maxDistance,
      });
    }
    renderOnce(); // redraw with/without AO
  }

  // Handy: frame the camera on any object
  function frameObject(object) {
    const box = new THREE.Box3().setFromObject(object);
    const size = box.getSize(new THREE.Vector3()).length();
    const center = box.getCenter(new THREE.Vector3());

    controls.target.copy(center);
    const distance = size * 0.3/ Math.tan(THREE.MathUtils.degToRad(camera.fov * 0.5));
    const dir = new THREE.Vector3(1, 0.1, 0.8).normalize();
    camera.position.copy(center).add(dir.multiplyScalar(distance));

    camera.near = Math.max(size / 100, 0.1);
    camera.far = Math.max(size * 10, 50);
    camera.updateProjectionMatrix();
    controls.update();
    renderOnce();
  }
  function fitShadowToBackdrops(options = {}) {
    const { mode = "fit", margin = 1.2, fixedD = 12 } = options;

    // 1) Union bbox of all backdrop slots
    const box = new THREE.Box3(), tmp = new THREE.Box3();
    let hasAny = false;
    scene.traverse(o => {
      if (!o.isGroup || typeof o.name !== "string") return;
      if (!o.name.startsWith("slot:backdrop")) return;
      tmp.setFromObject(o);
      if (!isFinite(tmp.min.x)) return;
      if (!hasAny) { box.copy(tmp); hasAny = true; } else { box.union(tmp); }
    });
    if (!hasAny) return;

    // Center/size in world space
    const size = new THREE.Vector3(), center = new THREE.Vector3();
    box.getSize(size); box.getCenter(center);

    // 2) Keep the same light direction & distance, but recenter it over the new scene
    const prevDir = new THREE.Vector3().subVectors(key.position, key.target.position).normalize();
    const dist    = key.position.distanceTo(center);
    key.target.position.copy(center);
    key.target.updateMatrixWorld();
    key.position.copy(center).add(prevDir.multiplyScalar(dist));
    key.updateMatrixWorld(true);
    key.shadow.updateMatrices?.(key);

    const cam = key.shadow.camera;

    if (mode === "fixed") {
      // Original fixed box (stable texel density)
      const d = fixedD;
      cam.left = -d; cam.right = d; cam.top = d; cam.bottom = -d;
      cam.near = Math.max(0.1, dist - d * 2);
      cam.far  = Math.max(cam.near + 0.1, dist + d * 2);
      cam.updateProjectionMatrix();
      renderOnce();
      return;
    }

    // 3) FIT mode: compute bbox in the LIGHT'S CAMERA SPACE, then set ortho frustum
    // Build the 8 world-space corners of the union box
    const corners = [
      new THREE.Vector3(box.min.x, box.min.y, box.min.z),
      new THREE.Vector3(box.min.x, box.min.y, box.max.z),
      new THREE.Vector3(box.min.x, box.max.y, box.min.z),
      new THREE.Vector3(box.min.x, box.max.y, box.max.z),
      new THREE.Vector3(box.max.x, box.min.y, box.min.z),
      new THREE.Vector3(box.max.x, box.min.y, box.max.z),
      new THREE.Vector3(box.max.x, box.max.y, box.min.z),
      new THREE.Vector3(box.max.x, box.max.y, box.max.z)
    ];

    // Ensure camera matrices are current, then transform corners into light-camera space
    cam.updateMatrixWorld(true);
    const view = cam.matrixWorldInverse; // world -> light-camera
    let minX = +Infinity, minY = +Infinity, minZ = +Infinity;
    let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
    for (const p of corners) {
      p.applyMatrix4(view);
      if (p.x < minX) minX = p.x; if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y; if (p.y > maxY) maxY = p.y;
      if (p.z < minZ) minZ = p.z; if (p.z > maxZ) maxZ = p.z;
    }

    // Expand around the center by the margin
    const cx = (minX + maxX) * 0.5, cy = (minY + maxY) * 0.5, cz = (minZ + maxZ) * 0.5;
    const hx = (maxX - minX) * 0.5 * margin;
    const hy = (maxY - minY) * 0.5 * margin;
    const hz = (maxZ - minZ) * 0.5 * margin;

    cam.left   = cx - hx;
    cam.right  = cx + hx;
    cam.bottom = cy - hy;
    cam.top    = cy + hy;

    // Camera looks down -Z; near/far are positive distances along -Z
    const nearZ = cz + hz;   // most positive (closest to the camera in +z direction)
    const farZ  = cz - hz;   // most negative (furthest away in -z)
    cam.near = Math.max(0.1, -nearZ);
    cam.far  = Math.max(cam.near + 0.1, -farZ);

    cam.updateProjectionMatrix();
    cam.updateMatrixWorld(true);
    key.updateMatrixWorld(true);
    key.shadow.needsUpdate = true;
    renderOnce();
  }




  return { renderer, scene, camera, controls, 
    renderOnce, frameObject, fitShadowToBackdrops, setAO,
    addRingLight, removeRingLight, 
  };
}

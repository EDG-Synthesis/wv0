import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

export function buildMats(ctx){
// ---------- Material library ----------
  const materials = {
    stucco: new THREE.MeshPhysicalMaterial({
      color: 0xf9f9f9, metalness: 0.0, roughness: 0.92, envMapIntensity: 0.35
    }),
    blacksteel: new THREE.MeshPhysicalMaterial({
      color: 0x595959, metalness: 1.0, roughness: 0.3, envMapIntensity: 1.0
    }),
    ssteel: new THREE.MeshPhysicalMaterial({
      color: 0xcdcdcd, metalness: 1.0, roughness: 0.4, envMapIntensity: 1.0
    }),
    plastic_wh: new THREE.MeshPhysicalMaterial({ 
      color: 0xe2dccb, metalness: 0.3, roughness: 0.5, envMapIntensity: 0.8
    }),
    plastic_char: new THREE.MeshPhysicalMaterial({ 
      color: 0x666666, metalness: 0.3, roughness: 0.4, envMapIntensity: 0.6
    }),
    golden: new THREE.MeshPhysicalMaterial({
      color: 0xa89051, metalness: 0.5, roughness:0.5, envMapIntensity:0.8
    }),
    petg_clear: new THREE.MeshPhysicalMaterial({
      color: 0xffffff,          // neutral base
      metalness: 0.0,
      roughness: 0.38,          // a touch of haze from layer lines
      envMapIntensity: 0.8,

      // transmission = physically-based transparency (needs an environment)
      transmission: 0.8,       // not perfectly clear like glass
      ior: 1.57,                // PETG ~1.57
      thickness: 0.25,           // world units; tweak to your model scale
      attenuationColor: 0xcfe8ff, // very slight blue tint common in clear PET
      attenuationDistance: 3.0   // higher = clearer / less color shift
      // optional: clearcoat: 0.4, clearcoatRoughness: 0.1 for a glossy topcoat
    }),
    rubber: new THREE.MeshPhysicalMaterial({
      color: 0x666666, 
      metalness: 0.1, 
      roughness:0.9, 
      envMapIntensity:0.8,
      side: THREE.DoubleSide,
    }),
    heathergreen: new THREE.MeshPhysicalMaterial({
      color: 0x799475, metalness: 0.1, roughness: 0.9, envMapIntensity: 1
    }),
    // add more finishes here later (wood, marble, etc.)
  };
  // --- Texture helpers ---
  const texLoader = new THREE.TextureLoader();
  const getAniso = () =>
    (ctx.renderer && ctx.renderer.capabilities && ctx.renderer.capabilities.getMaxAnisotropy)
      ? ctx.renderer.capabilities.getMaxAnisotropy()
      : 1;
  function colorTex(url) {
    const t = texLoader.load(url, () => ctx.renderOnce());   // refresh after async load
    t.colorSpace = THREE.SRGBColorSpace;                      // correct gamma for color maps
    t.anisotropy = getAniso();                                // crisper at grazing angles
    t.flipY = false;
    // t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;         // default; no tiling ("big map")
    return t;
  }

  // start: texture materials added to library
  materials.floor = new THREE.MeshPhysicalMaterial({
    map: colorTex("src/floor.jpg"),
    metalness: 0.0,
    roughness: 0.95,
    envMapIntensity: 0.30
  });
  const texFlr = materials.floor.map;
  texFlr.wrapS = texFlr.wrapT = THREE.RepeatWrapping; // allow tiling
  texFlr.center.set(0.5, 0.5);                      // rotate around center, not corner
  texFlr.repeat.set(6, 4);                          // UxV tiles (e.g., 3 across, 2 up)
  texFlr.rotation = Math.PI * 0.5;                  // 90° rotate grain
  texFlr.needsUpdate = true;

  materials.wainscot = new THREE.MeshPhysicalMaterial({
    map: colorTex("src/wainscot.jpg"),
    metalness: 0.0,
    roughness: 0.90,
    envMapIntensity: 0.30
  });
  const texWS = materials.wainscot.map;
  texWS.wrapS = texWS.wrapT = THREE.RepeatWrapping;
  texWS.center.set(0.5, 0.5);
  texWS.repeat.set(1.5, 1);                          // taller grain
  texWS.rotation = Math.PI * 0.5;                   
  texWS.needsUpdate = true;

  materials.marble = new THREE.MeshPhysicalMaterial({
    map: colorTex("src/marble.jpg"),
    metalness: 0.0,
    roughness: 0.90,
    envMapIntensity: 0.30
  });
  const texMarb = materials.marble.map;
  texMarb.wrapS = texMarb.wrapT = THREE.RepeatWrapping;
  texMarb.center.set(0.5, 0.5);
  texMarb.repeat.set(2, 2);
  texMarb.needsUpdate = true;

  materials.woodlite = new THREE.MeshPhysicalMaterial({
    map: colorTex("src/woodlite.jpg"),
    metalness: 0.0,
    roughness: 0.90,
    envMapIntensity: 0.30
  });
  const texWL = materials.woodlite.map;
  texWL.wrapS = texWL.wrapT = THREE.RepeatWrapping;
  texWL.center.set(0.5, 0.5);
  texWL.rotation = Math.PI * 0.5; 
  texWL.needsUpdate = true;

  materials.concrete = new THREE.MeshPhysicalMaterial({
    map: colorTex("src/concrete.jpg"),
    metalness: 0.0,
    roughness: 0.90,
    envMapIntensity: 0.30
  });
  const texConc = materials.concrete.map;
  texConc.wrapS = texConc.wrapT = THREE.RepeatWrapping;
  texConc.center.set(0.5, 0.5);
  texConc.repeat.set(2, 2);
  texConc.needsUpdate = true;

  materials.plaster = new THREE.MeshPhysicalMaterial({
    map: colorTex("src/plaster.jpg"),
    metalness: 0.1,
    roughness: 0.9,
    envMapIntensity: 0.30
  });
  const texPl = materials.plaster.map;
  texPl.wrapS = texPl.wrapT = THREE.RepeatWrapping;
  texPl.center.set(0.5, 0.5);
  texPl.repeat.set(4, 1);
  texPl.needsUpdate = true;
  // end: texture materials added to library ----
  Object.values(materials).forEach(m => { (m.userData ??= {}).shared = true; });
  return materials;
}

export function initModels(ctx) {
  const materials = buildMats(ctx);

  function resolveMaterial(mtl, fallbackKey) {
    if (!mtl) return materials[fallbackKey];
    if (typeof mtl === "string") return materials[mtl] || materials[fallbackKey];
    if (mtl && mtl.isMaterial) { (mtl.userData ??= {}).shared = true; return mtl; }
    return materials[fallbackKey];
  }

  //turn url spec (string | object | array) into a stable key
  function urlKey(spec) {
    if (!spec) return null;
    if (Array.isArray(spec)) {
      // IMPORTANT: preserve whether 'target' was set or not
      return JSON.stringify(spec.map(it => {
        if (typeof it === "string") return { url: it };
        return {
          url: it.url,
          material: it.material ?? null,
          id: it.id ?? null,
          // null = unset, true/false = explicit
          target: (it.target === true ? true : (it.target === false ? false : null)),
        };
      }));
    }
    if (typeof spec === "string") return spec;
    if (spec && typeof spec === "object" && "url" in spec) return urlKey(spec.url);
    return String(spec);
  }

  function applyMaterialToAll(root, mat) {
    if (!root || !mat) return;
    root.traverse(obj => {
      if (obj.isMesh) {
        obj.material = mat;
        obj.castShadow = obj.receiveShadow = true;
      }
    });
  }

  // --- Safe disposal helpers ---------------------------------------------------
  const TEX_KEYS = [
    "map","normalMap","roughnessMap","metalnessMap","aoMap","emissiveMap","bumpMap",
    "displacementMap","alphaMap","envMap","clearcoatMap","clearcoatNormalMap",
    "clearcoatRoughnessMap","sheenColorMap","sheenRoughnessMap","specularIntensityMap",
    "specularColorMap","transmissionMap","thicknessMap","anisotropyMap",
    "iridescenceMap","iridescenceThicknessMap"
  ];
  function eachMaterial(mat, cb) {
    if (!mat) return;
    if (Array.isArray(mat)) { for (const m of mat) if (m) cb(m); }
    else cb(mat);
  }
  function getMaterialTextures(mat) {
    const out = [];
    eachMaterial(mat, m => {
      for (const k of TEX_KEYS) {
        const t = m[k];
        if (t && t.isTexture) out.push([k, t]);
      }
    });
    return out;
  }
  function collectMatAndTexOutside(root, scene) {
    const mats = new Set();
    const texs = new Set();
    (function walk(n) {
      if (n === root) return; // do not descend into the subtree being removed
      if (n.isMesh && n.material) {
        eachMaterial(n.material, m => mats.add(m));
        for (const [, t] of getMaterialTextures(n.material)) texs.add(t);
      }
      for (const c of n.children) walk(c);
    })(scene);
    return { mats, texs };
  }
  //dispose model
  function disposeModel(root) {
    if (!root) return;

    const scene = ctx?.scene;
    const outside = scene
      ? collectMatAndTexOutside(root, scene)
      : { mats: new Set(), texs: new Set() };

    root.traverse(o => {
      if (!o.isMesh) return;

      // Geometry is safe to dispose (GLTF loader gives unique BufferGeometry per mesh)
      o.geometry?.dispose?.();

      const mat = o.material;
      if (!mat) return;

      // 1) Dispose textures only if NOT shared & NOT used elsewhere
      eachMaterial(mat, m => {
        if (m?.userData?.shared === true) return; // keep entire material & its maps
        for (const [key, tex] of getMaterialTextures(m)) {
          if (key === "envMap") continue;              // envMap is scene-wide; never here
          if (outside.texs.has(tex)) continue;         // used elsewhere → keep
          tex.dispose?.();
        }
      });

      // 2) Dispose material object only if NOT shared & NOT used elsewhere
      eachMaterial(mat, m => {
        if (m?.userData?.shared === true) return;
        if (outside.mats.has(m)) return;               // referenced outside → keep
        m.dispose?.();
      });
    });

    // Detach removed subtree from the scene/slot
    root.parent?.remove(root);
  }

  function uvIsDegenerate(attr) {
    let uMin=Infinity, uMax=-Infinity, vMin=Infinity, vMax=-Infinity;
    for (let i=0; i<attr.count; i++) {
      const u = attr.getX(i), v = attr.getY(i);
      if (u<uMin) uMin=u; if (u>uMax) uMax=u;
      if (v<vMin) vMin=v; if (v>vMax) vMax=v;
    }
    return (uMax - uMin < 1e-6) || (vMax - vMin < 1e-6);
  }
  // Create planar UVs when a geometry lacks them.
  // Strategy: project onto the two largest extents; the smallest extent is treated as the "normal".
  function ensureAutoUVs(root) {
    const vA = new THREE.Vector3(), vB = new THREE.Vector3(), vC = new THREE.Vector3();
    const n  = new THREE.Vector3();
  root.traverse(obj => {
    if (!obj.isMesh || !obj.geometry) return;

    let g = obj.geometry;

    // Skip if healthy UVs already exist
    if (g.attributes.uv && !uvIsDegenerate(g.attributes.uv)) return;

    // Work per-face → need non-indexed geometry
    if (g.index) g = obj.geometry = g.toNonIndexed();

    g.computeBoundingBox();
    const bb   = g.boundingBox;
    const size = new THREE.Vector3().subVectors(bb.max, bb.min);

    const pos  = g.attributes.position;
    const uvs  = new Float32Array(pos.count * 2);

    // helper to write UVs
    const setUV = (i, u, v) => { uvs[2*i] = u; uvs[2*i+1] = v; };

    // Per-face “best axis” (box) projection
    for (let i = 0; i < pos.count; i += 3) {
      vA.set(pos.getX(i+0), pos.getY(i+0), pos.getZ(i+0));
      vB.set(pos.getX(i+1), pos.getY(i+1), pos.getZ(i+1));
      vC.set(pos.getX(i+2), pos.getY(i+2), pos.getZ(i+2));

      n.copy(vC).sub(vB).cross(vA.clone().sub(vB)).normalize();

      // choose projection by dominant normal axis
      const ax = Math.abs(n.x), ay = Math.abs(n.y), az = Math.abs(n.z);
      let proj;
      if (ax >= ay && ax >= az) {
        // X-dominant → project to YZ
        proj = (v) => [ (v.z - bb.min.z) / (size.z || 1), (v.y - bb.min.y) / (size.y || 1) ];
      } else if (ay >= ax && ay >= az) {
        // Y-dominant → project to XZ
        proj = (v) => [ (v.x - bb.min.x) / (size.x || 1), (v.z - bb.min.z) / (size.z || 1) ];
      } else {
        // Z-dominant → project to XY
        proj = (v) => [ (v.x - bb.min.x) / (size.x || 1), (v.y - bb.min.y) / (size.y || 1) ];
      }

      const uvA = proj(vA), uvB = proj(vB), uvC = proj(vC);
      setUV(i+0, uvA[0], uvA[1]);
      setUV(i+1, uvB[0], uvB[1]);
      setUV(i+2, uvC[0], uvC[1]);
    }

    g.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
    g.attributes.uv.needsUpdate = true;
  });
  }

  // ---------- Slots (backdrop, part) ----------
  const gltfLoader = new GLTFLoader();

  const slots = {
    backdrop: {
      group: new THREE.Group(),
      model: null, url: null,
      defaultMat: "stucco",
      // frame backdrop only if the scene is otherwise empty
      shouldFrame: () => !slots.part.model
    },
    part: {
      group: new THREE.Group(),
      model: null, url: null,
      defaultMat: "stucco",
      shouldFrame: () => true
    }
  };
  function ensureSlot(slotName, base = "backdrop") {
    if (slots[slotName]) return slots[slotName];

    const src = slots[base] || {
      defaultMat: "stucco",
      shouldFrame: () => false
    };

    const slot = {
      group: new THREE.Group(),
      model: null,
      url: null,
      defaultMat: src.defaultMat || "stucco",
      // Only let the first backdrop auto-frame; others won’t re-frame the camera
      shouldFrame: () => slotName === "backdrop" || slotName === "backdrop-0"
    };
    slot.group.name = `slot:${slotName}`;
    ctx.scene.add(slot.group);
    slots[slotName] = slot;
    return slot;
  }

  ctx.scene.add(slots.backdrop.group, slots.part.group);
  let ringLightsEnabled = false;
  let ringPlacedKey = null;

  function setRingLightEnabled(on) {
    ringLightsEnabled = !!on;

    const part = ensureSlot("part");
    const currentKey = part?.model ? `${part.model.uuid}|ringlens` : null;

    if (!ringLightsEnabled) {
      ctx.removeRingLight?.();
      ringPlacedKey = null;
      return;
    }

    // Only place if this part hasn't already placed a ring
    if (currentKey && currentKey !== ringPlacedKey) {
      ctx.removeRingLight?.();
      placeRingLightAtPiece("part", "ringlens", {
        radiusScale: 1.14, count: 8, intensity: 0.6, type: "spot", castShadow: true
      });
      ringPlacedKey = currentKey;
    }
  }

  // ---------------------------------------------
  // Load model(s) into a slot
  // ---------------------------------------------
  function loadModel(slotName, urlSpec, mtl, opts = {}) {
    const slot = ensureSlot(slotName);
    if (!slot) { console.warn("Unknown model slot:", slotName); return; }

    // unload if falsy
    if (!urlSpec) { unloadModel(slotName); return; }

    const keyNow = urlKey(urlSpec);

    // Re-apply only material if identical spec already loaded
    if (slot.url === keyNow && slot.model) {
      // Swatch applies only to target piece (handled in setMaterial)
      ctx.renderOnce();
      return;
    }

    // Clear old content
    if (slot.model) {
      slot.group.remove(slot.model);
      disposeModel(slot.model);
    }
    slot.model = null;
    slot.url = null;
    slot.swatchTargetId = null;    // << reset target per load

    // Normalize to a list of items [{ url, material?, id?, target? }, ...]
    const items = Array.isArray(urlSpec)
      ? urlSpec.map((it, i) => (typeof it === "string" ? { url: it, id: `p${i}` } : { id: it.id ?? `p${i}`, ...it }))
      : [{ id: "p0", url: (typeof urlSpec === "string" ? urlSpec : urlSpec.url), material: (typeof urlSpec === "object" ? urlSpec.material : undefined), target: !!urlSpec?.target }];

    
    // Container for all pieces
    const multi = new THREE.Group();
    multi.name = `${slotName}:multi`;
    slot.model = multi;
    slot.group.add(multi);
    slot.url = keyNow;

    let remaining = items.length;
    const onDone = () => {
      if (--remaining > 0) return;

      // Only place lights when toggle is ON
      if (slotName === "part") {
        const hasRing = slot.model.children.some(ch => ch.userData?.pieceId === "ringlens");
        if (ringLightsEnabled && hasRing) {
          const key = `${slot.model.uuid}|ringlens`;
          if (key !== ringPlacedKey) {
            ctx.removeRingLight?.();
            placeRingLightAtPiece("part", "ringlens", {
              radiusScale: 1.14, count: 8, intensity: 0.6, type: "spot", castShadow: true
            });
            ringPlacedKey = key;
          }
        } else {
          ctx.removeRingLight?.();
          ringPlacedKey = null;
        }
      }

      if (slotName.startsWith("backdrop")) ctx.fitShadowToBackdrops?.({ mode: "fit", margin: 1.4 });
      if (opts.frame ?? slot.shouldFrame()) ctx.frameObject(slot.model,[0.5,0.5,3]);
      ctx.setLookMode();
      ctx.renderOnce();
    };


    // Load each piece
    for (const item of items) {
      const pieceId = item.id;
      const url = item.url;
      // Swatches apply by default only to the "part" slot.
      // For other slots (e.g., backdrops), require an explicit opt-in: target:true
      const swatchEligible = (slotName === "part")
        ? (item.target !== false)   // default-on for "part" unless target:false
        : (item.target === true);   // opt-in on non-"part" slots
      const fallbackKey = mtl || slot.defaultMat;
      const pieceMat = swatchEligible
        ? resolveMaterial(mtl,            slot.defaultMat)   // use current swatch
        : resolveMaterial(item.material,  fallbackKey);      // use spec or UI material

      gltfLoader.load(
        url,
        (gltf) => {
          // Wrap the piece to keep ID + swatch policy
          const wrapper = new THREE.Group();
          wrapper.name = `piece:${pieceId}`;
          wrapper.userData.pieceId    = pieceId;
          wrapper.userData.allowSwatch = swatchEligible;

          const node = gltf.scene;
          ensureAutoUVs(node);
          applyMaterialToAll(node, pieceMat);
          wrapper.add(node);

          multi.add(wrapper);
          onDone();
        },
        undefined,
        (err) => { console.error(`GLTF load failed for ${slotName} (${url}):`, err); onDone(); }
      );
    }
  }

  function unloadModel(slotName) {
    if (slotName === "part") {
      ctx.removeRingLight?.();
      ringPlacedKey = null;
    }
    const slot = ensureSlot(slotName);
    if (!slot || !slot.model) return;
    slot.group.remove(slot.model);
    disposeModel(slot.model);
    slot.model = null;
    slot.url = null;

    ctx.renderOnce();
  }

  function getUrl(slotName) {
    return ensureSlot(slotName)?.url ?? null;
  }

  // ---------------------------------------------
  // Set material for a slot.
  // - By default, applies to ALL pieces that allow swatch (target !== false).
  // - Pass opts.target = "pieceId" to override and paint just one piece.
  // ---------------------------------------------
  function setMaterial(slotName, mtl, opts = {}) {
    const slot = ensureSlot(slotName);
    if (!slot || !slot.model) return;

    const mat = resolveMaterial(mtl, slot.defaultMat);
    const wantId = opts.target ?? null;

    if (wantId) {
      const piece = slot.model.children.find(ch => ch.userData?.pieceId === wantId);
      if (piece) applyMaterialToAll(piece, mat);
    } else {
      // Default: apply to every piece that didn't opt out (target:false)
      for (const ch of slot.model.children) {
        if (ch.userData?.allowSwatch !== false) applyMaterialToAll(ch, mat);
      }
    }
    ctx.renderOnce();
  }

  function isLoaded(slotName) {
    return !!ensureSlot(slotName)?.model;
  }

  // === Pin a ring light to a loaded GLTF piece (models.js) =====================
  // pieceId must match the wrapper group you created per piece: wrapper.name = `piece:${pieceId}`
  function _findPiece(slotName, pieceId){
    const slot = ensureSlot(slotName);
    if(!slot || !slot.model) return null;
    return slot.model.children.find(ch => ch.userData?.pieceId === pieceId) || null;
  }
  // Derive world-space center, normal and an outer radius from the ring mesh
  function _ringInfoFromPiece(pieceGroup){
    // pick first Mesh under the group
    let mesh=null; pieceGroup.traverse(o=>{ if(!mesh && o.isMesh && o.geometry) mesh=o; });
    if(!mesh) return null;

    // local bbox (in geometry space)
    const g = mesh.geometry;
    if(!g.boundingBox) g.computeBoundingBox();
    const bb = g.boundingBox;
    const centerLocal = bb.getCenter(new THREE.Vector3());
    const sizeLocal   = bb.getSize(new THREE.Vector3());

    // world scale of the mesh (handles nested GLTF transforms)
    const s = new THREE.Vector3(); mesh.getWorldScale(s);
    const sizeWorld = new THREE.Vector3(sizeLocal.x*Math.abs(s.x), sizeLocal.y*Math.abs(s.y), sizeLocal.z*Math.abs(s.z));

    // axis with smallest world extent is the ring's thickness → its normal
    const ext = [sizeWorld.x, sizeWorld.y, sizeWorld.z];
    const minIdx = ext[0] <= ext[1] && ext[0] <= ext[2] ? 0 : (ext[1] <= ext[2] ? 1 : 2);
    const localAxis = [new THREE.Vector3(1,0,0), new THREE.Vector3(0,1,0), new THREE.Vector3(0,0,1)][minIdx];

    const nrmMat = new THREE.Matrix3().getNormalMatrix(mesh.matrixWorld);
    const normalWorld = localAxis.clone().applyMatrix3(nrmMat).normalize();

    // world center (transform local bbox center)
    const centerWorld = mesh.localToWorld(centerLocal.clone());

    // ring radius ≈ mean of the two larger half-extents
    const other = [0,1,2].filter(i=>i!==minIdx);
    const r = 0.25 * (ext[other[0]] + ext[other[1]]); // (halfA + halfB) == 0.25*(A+B)

    return { center: centerWorld, normal: normalWorld, radius: r };
  }
  // Public: place a ring light & optional emissive proxy at the given piece
  function placeRingLightAtPiece(slotName, pieceId, {
    radiusScale = 1.0,
    count       = 9,
    intensity   = 1,
    distanceMul = 6,
    type        = "point",  // "point" or "spot"
    offsetMul   = 0.01,      // offset along normal to avoid z-fighting
    castShadow = false
  } = {}){
    const piece = _findPiece(slotName, pieceId);
    if(!piece) return false;

    const info = _ringInfoFromPiece(piece);
    if(!info) return false;

    // Push slightly "behind" the lens relative to camera, so transmission samples it
    const cam = ctx.camera;
    const toCam = cam.position.clone().sub(info.center);
    const facing = Math.sign(info.normal.dot(toCam)) || 1;  // + → normal faces camera
    const offset = info.normal.clone().multiplyScalar(offsetMul * info.radius * -facing);
    const center = info.center.clone().add(offset);

    // Lights
    ctx.addRingLight({
      center: center.toArray(),
      normal: info.normal.toArray(),
      radius: info.radius * radiusScale,
      count, 
      intensity, 
      distance: info.radius * distanceMul, 
      type, 
      inward: true, 
      castShadow
    });

    return true;
  }


  // public API
  return {
    loadModel,           // loadModel("backdrop", url, "stucco")
    unloadModel,         // unloadModel("part")
    getUrl,              // getUrl("backdrop")
    setMaterial,         // setMaterial("part", "blacksteel")
    isLoaded,            // isLoaded("part")
    placeRingLightAtPiece, 
    setRingLightEnabled,
    materials            // expose library to add/inspect finishes
  };
}

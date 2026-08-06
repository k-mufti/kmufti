/* figure3d.js — Offscreen Three.js renderer for the 3D Meccha figure.
 *
 * Two modes:
 *   A) "procedural" — round 3D figure built from primitives (sphere, capsules)
 *   B) "relief" — flat STL relief models lit to show embossed depth
 *
 * Debug panel at ?debug lets you toggle and tweak.
 * Requires three.min.js + GLTFLoader.js loaded before this script.
 */
window.FIGURE3D = (function () {
  'use strict';

  const POSE_PATHS = [
    'figures/pose1.glb',
    'figures/pose2.glb',
    'figures/pose3.glb',
    'figures/pose4.glb',
  ];

  // Tunable defaults — recorded from user's debug session (subject A)
  const CFG = {
    mode: 'relief',   // 'procedural' (primitives) or 'relief' (your STL models)
    autoTune: true,   // derive lighting from the patch (debug panel can disable)
    color:        0xc8c8c0,
    roughness:    0.6,
    metalness:    0.05,
    mainLight:    0.19,
    fillLight:    0.56,
    ambientLight: 0.83,
    hemiLight:    1.11,
    camZoom:      0.80,
    // Body proportions (unit height ≈ 1.0) — tweakable in debug panel
    headR:    0.115,
    torsoLen: 0.34,
    torsoR:   0.10,
    armLen:   0.26,
    armR:     0.055,
    legLen:   0.28,
    legR:     0.062,
  };

  const poseCache = new Map();
  let renderer = null;

  function getRenderer() {
    if (!renderer) {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, preserveDrawingBuffer: true });
      renderer.setClearColor(0x000000, 0);
      renderer.setPixelRatio(1);
      if (renderer.outputEncoding !== undefined) renderer.outputEncoding = THREE.LinearEncoding;
    }
    return renderer;
  }

  function loadPose(path) {
    if (poseCache.has(path)) return poseCache.get(path);
    const p = new Promise((res, rej) => {
      const loader = new THREE.GLTFLoader();
      loader.load(path, (gltf) => {
        gltf.scene.traverse((c) => {
          if (c.isMesh && !c.geometry.attributes.normal) c.geometry.computeVertexNormals();
        });
        res(gltf.scene);
      }, undefined, rej);
    });
    poseCache.set(path, p);
    return p;
  }

  function preloadAll() { POSE_PATHS.forEach(loadPose); }

  // =========================================================================
  // PROCEDURAL FIGURE — built from smooth primitives (like the real game)
  // =========================================================================
  // Builds a figure group: sphere head, capsule torso, capsule limbs.
  // Pose is defined by limb angles.
  const POSES_PROCEDURAL = [
    // pose 1: neutral standing (like the real figure)
    { lArmAngle: -8, rArmAngle: 8, lLegAngle: -4, rLegAngle: 4, torsoTilt: 0 },
    // pose 2: walking
    { lArmAngle: -20, rArmAngle: 25, lLegAngle: 15, rLegAngle: -15, torsoTilt: 0 },
    // pose 3: one arm raised
    { lArmAngle: -150, rArmAngle: 10, lLegAngle: -5, rLegAngle: 5, torsoTilt: -3 },
    // pose 4: arms out
    { lArmAngle: -60, rArmAngle: 60, lLegAngle: -8, rLegAngle: 8, torsoTilt: 0 },
  ];

  function makeCapsule(radius, length, capSegs, radSegs) {
    // CapsuleGeometry is available in newer Three.js; for r128, build from cylinder + spheres
    const group = new THREE.Group();
    const cylGeo = new THREE.CylinderGeometry(radius, radius, length, radSegs || 12, 1);
    const cyl = new THREE.Mesh(cylGeo);
    group.add(cyl);
    const sphereGeo = new THREE.SphereGeometry(radius, radSegs || 12, capSegs || 8);
    const top = new THREE.Mesh(sphereGeo);
    top.position.y = length / 2;
    group.add(top);
    const bot = new THREE.Mesh(sphereGeo.clone());
    bot.position.y = -length / 2;
    group.add(bot);
    return group;
  }

  function buildProceduralFigure(poseIdx) {
    const pose = POSES_PROCEDURAL[poseIdx % POSES_PROCEDURAL.length];
    const figure = new THREE.Group();

    // Proportions come from CFG so they're tweakable in the debug panel.
    const headR = CFG.headR;
    const torsoLen = CFG.torsoLen;
    const torsoR = CFG.torsoR;
    const armLen = CFG.armLen;
    const armR = CFG.armR;
    const legLen = CFG.legLen;
    const legR = CFG.legR;

    // Head — slightly egg-shaped (taller than wide), overlapping torso top
    const headGeo = new THREE.SphereGeometry(headR, 20, 16);
    const head = new THREE.Mesh(headGeo);
    head.scale.set(0.95, 1.05, 0.95);
    head.position.y = torsoLen / 2 + headR * 0.75;   // sits on shoulders, no neck
    figure.add(head);

    // Torso
    const torso = makeCapsule(torsoR, torsoLen, 8, 16);
    if (pose.torsoTilt) torso.rotation.z = pose.torsoTilt * Math.PI / 180;
    figure.add(torso);

    // Arms hang from the shoulders, close to the body.
    // Position pivot at shoulder, rotate about it.
    function addLimb(len, rad, px, py, angleDeg) {
      const limb = makeCapsule(rad, len, 6, 12);
      const pivot = new THREE.Group();
      limb.position.y = -len / 2;          // hang downward from pivot
      pivot.add(limb);
      pivot.position.set(px, py, 0);
      pivot.rotation.z = angleDeg * Math.PI / 180;
      figure.add(pivot);
    }

    // Shoulders at top of torso
    addLimb(armLen, armR, -(torsoR + armR * 0.35), torsoLen * 0.42, pose.lArmAngle);
    addLimb(armLen, armR, (torsoR + armR * 0.35), torsoLen * 0.42, pose.rArmAngle);

    // Hips at bottom of torso
    addLimb(legLen, legR, -torsoR * 0.45, -torsoLen / 2 - legR * 0.2, pose.lLegAngle);
    addLimb(legLen, legR, torsoR * 0.45, -torsoLen / 2 - legR * 0.2, pose.rLegAngle);

    return figure;
  }

  // =========================================================================
  // SAMPLE LIGHTING from photo region
  // =========================================================================
  function sampleLighting(baseData, CW, CH, fx, fy, figW, figH) {
    const margin = Math.max(figW, figH);
    const sx = Math.max(0, fx - margin);
    const sy = Math.max(0, fy - margin);
    const ex = Math.min(CW, fx + figW + margin);
    const ey = Math.min(CH, fy + figH + margin);

    const sectors = new Float32Array(9);
    const sR = new Float32Array(9), sG = new Float32Array(9), sB = new Float32Array(9), sN = new Float32Array(9);
    const sw = (ex - sx) / 3, sh = (ey - sy) / 3;
    const step = 4;
    for (let y = sy; y < ey; y += step) {
      for (let x = sx; x < ex; x += step) {
        const i = (y * CW + x) * 4;
        const r = baseData[i], g = baseData[i + 1], b = baseData[i + 2];
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        const gi = Math.min(2, Math.floor((x - sx) / sw));
        const gj = Math.min(2, Math.floor((y - sy) / sh));
        const si = gj * 3 + gi;
        sectors[si] += lum; sR[si] += r; sG[si] += g; sB[si] += b; sN[si]++;
      }
    }
    let maxLum = 0, maxIdx = 4, totalR = 0, totalG = 0, totalB = 0, totalN = 0;
    for (let k = 0; k < 9; k++) {
      if (sN[k] > 0) {
        const avg = sectors[k] / sN[k];
        if (avg > maxLum) { maxLum = avg; maxIdx = k; }
        totalR += sR[k]; totalG += sG[k]; totalB += sB[k]; totalN += sN[k];
      }
    }
    const col = (maxIdx % 3) - 1;
    const row = -((maxIdx / 3 | 0) - 1);
    const n = sN[maxIdx] || 1;
    return {
      lightDir: [col * 0.7, row * 0.7, 0.8],
      lightColor: [sR[maxIdx] / n / 255, sG[maxIdx] / n / 255, sB[maxIdx] / n / 255],
      ambientColor: totalN
        ? [(totalR / totalN / 255) * 0.5, (totalG / totalN / 255) * 0.5, (totalB / totalN / 255) * 0.5]
        : [0.3, 0.3, 0.3],
    };
  }

  // Measure the background patch the figure sits in. These are the numbers that
  // actually predict good blend settings: the MEAN says how bright the figure
  // needs to be, the STD-DEV says how much texture there is to hide in (which
  // is the "noise" we'd otherwise be eyeballing).
  // LOCAL texture — the median std-dev within small tiles.
  //
  // This is the number that actually matters for camouflage, and it is NOT the
  // same as the std-dev of the whole patch. A patch that is half dark building
  // and half bright sky has a huge global std-dev from one hard edge while
  // being perfectly smooth everywhere — no camouflage at all. Choppy water is
  // the opposite: busy everywhere but with a compressed luminance range, so its
  // global std-dev is low. Taking the MEDIAN of per-tile std-devs ignores both
  // large-scale gradients and the few tiles containing an edge.
  function localTexture(baseData, CW, sx, sy, ex, ey) {
    const TILE = 12;
    const stds = [];
    for (let ty = sy; ty + TILE <= ey; ty += TILE) {
      for (let tx = sx; tx + TILE <= ex; tx += TILE) {
        let n = 0, s = 0, s2 = 0;
        for (let y = ty; y < ty + TILE; y++) {
          for (let x = tx; x < tx + TILE; x++) {
            const i = (y * CW + x) * 4;
            const lum = 0.299 * baseData[i] + 0.587 * baseData[i + 1] + 0.114 * baseData[i + 2];
            s += lum; s2 += lum * lum; n++;
          }
        }
        if (n > 1) {
          const m = s / n;
          stds.push(Math.sqrt(Math.max(0, s2 / n - m * m)));
        }
      }
    }
    if (!stds.length) return 0;
    stds.sort((a, b) => a - b);
    return stds[Math.floor(stds.length / 2)];
  }

  // Mean / spread / colour over an arbitrary rect.
  function rectStats(baseData, CW, sx, sy, ex, ey) {
    let n = 0, sum = 0, sumSq = 0, sR = 0, sG = 0, sB = 0;
    const step = 2;
    for (let y = sy; y < ey; y += step) {
      for (let x = sx; x < ex; x += step) {
        const i = (y * CW + x) * 4;
        const r = baseData[i], g = baseData[i + 1], b = baseData[i + 2];
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        sum += lum; sumSq += lum * lum;
        sR += r; sG += g; sB += b;
        n++;
      }
    }
    if (!n) return null;
    const mean = sum / n;
    return {
      meanLum: mean,
      contrast: Math.sqrt(Math.max(0, sumSq / n - mean * mean)),
      meanRGB: [sR / n, sG / n, sB / n],
      samples: n,
    };
  }

  // Measure the background the figure sits in. Reports the FOOTPRINT (pixels
  // directly behind the figure — what it has to match) separately from the
  // SURROUND (context ring), because a figure placed in flat sky next to a dark
  // jacket should be tuned for the sky, not for the average of both.
  function patchStats(baseData, CW, CH, fx, fy, figW, figH) {
    const clampX = (v) => Math.max(0, Math.min(CW, Math.round(v)));
    const clampY = (v) => Math.max(0, Math.min(CH, Math.round(v)));
    const fsx = clampX(fx), fsy = clampY(fy);
    const fex = clampX(fx + figW), fey = clampY(fy + figH);
    const m = Math.max(figW, figH) * 0.5;
    const ssx = clampX(fx - m), ssy = clampY(fy - m);
    const sex = clampX(fx + figW + m), sey = clampY(fy + figH + m);

    const foot = rectStats(baseData, CW, fsx, fsy, fex, fey);
    const surr = rectStats(baseData, CW, ssx, ssy, sex, sey);
    if (!foot) return null;

    const tex = localTexture(baseData, CW, fsx, fsy, fex, fey);

    // A footprint whose global spread dwarfs its local texture is straddling a
    // hard boundary (e.g. sky meeting a roofline) rather than sitting in one
    // consistent region — a materially different, harder placement.
    const straddling = foot.contrast > 25 && foot.contrast > tex * 2.5;

    return {
      meanLum: foot.meanLum,
      contrast: foot.contrast,
      texture: tex,
      meanRGB: foot.meanRGB,
      samples: foot.samples,
      surroundLum: surr ? surr.meanLum : foot.meanLum,
      straddling,
    };
  }

  // Bands for the LOCAL texture number (not the global spread).
  function textureLabel(t) {
    if (t < 4) return 'flat';
    if (t < 12) return 'low texture';
    if (t < 25) return 'medium texture';
    return 'high texture';
  }

  // =========================================================================
  // AUTO-TUNE — derive lighting from the measured patch
  // =========================================================================
  // Fitted to 10 hand-tuned scenes. Two relationships held across all of them:
  //
  //   1. "Flatness" = ambient / (main + fill + hemi) falls off steeply as the
  //      background gets more textured. Flat backgrounds need a flat figure —
  //      any shading gradient reads as an object sitting ON the photo. Textured
  //      backgrounds need a modelled figure, or it looks like a pasted sticker.
  //   2. The total light budget stays near ~3.4 regardless of scene; what
  //      changes is how it is split.
  //
  // Opacity is deliberately NOT set here — MECHA.calibratedCompose already
  // tunes it against measured visibility, which is a better signal than
  // anything derivable from the patch alone.
  function autoTune(stats) {
    const tex = stats.texture;

    const flatness = 4.5 * Math.exp(-tex / 12) + 0.15;
    const TOTAL = 3.4;
    const ambient = TOTAL * (flatness / (1 + flatness));
    const directional = TOTAL - ambient;

    // More texture -> more directional modelling, less soft fill.
    const t = Math.min(1, tex / 45);
    let mainShare = 0.20 + 0.25 * t;
    let fillShare = 0.35 - 0.10 * t;
    let hemiShare = Math.max(0, 1 - mainShare - fillShare);

    // Hemi is hardcoded blue-above / brown-below, so it doubles as a hue tint.
    // Give it more of the budget when the scene has a strong warm or cool cast.
    const [r, , b] = stats.meanRGB;
    const cast = Math.min(1, Math.abs(r - b) / 50);
    hemiShare *= 1 + 0.5 * cast;

    const sum = mainShare + fillShare + hemiShare;
    const k = sum > 0 ? directional / sum : 0;

    return {
      mainLight: mainShare * k,
      fillLight: fillShare * k,
      ambientLight: ambient,
      hemiLight: hemiShare * k,
      _flatness: flatness,
    };
  }

  // Measure the patch and push the derived lighting into CFG. No-op when the
  // debug panel has taken manual control.
  function applyAutoTune(baseData, CW, CH, fx, fy, figW, figH) {
    if (!CFG.autoTune) return null;
    const stats = patchStats(baseData, CW, CH, fx, fy, figW, figH);
    if (!stats) return null;
    const tuned = autoTune(stats);
    CFG.mainLight = tuned.mainLight;
    CFG.fillLight = tuned.fillLight;
    CFG.ambientLight = tuned.ambientLight;
    CFG.hemiLight = tuned.hemiLight;
    try { window.dispatchEvent(new Event('f3d-autotuned')); } catch (_e) {}
    return { stats, tuned };
  }

  // =========================================================================
  // RENDER — works for both procedural and relief models
  // =========================================================================
  function render(model, figW, figH, lighting, rotation) {
    const r = getRenderer();
    r.setSize(figW, figH);

    const scene = new THREE.Scene();

    let container;
    if (model.__procedural) {
      // Procedural: model is already a Group of primitives
      container = model.clone(true);
      // Apply material to all meshes
      container.traverse((child) => {
        if (child.isMesh) {
          child.material = new THREE.MeshLambertMaterial({
            color: CFG.color,   // matte, no specular — like matte clay/3D print
          });
        }
      });
      // Center
      const box = new THREE.Box3().setFromObject(container);
      const center = box.getCenter(new THREE.Vector3());
      container.position.sub(center);
      // Normalize to unit
      const box2 = new THREE.Box3().setFromObject(container);
      const sz = box2.getSize(new THREE.Vector3());
      const maxDim = Math.max(sz.x, sz.y, sz.z) || 1;
      container.scale.multiplyScalar(1 / maxDim);
    } else {
      // Relief GLB model
      const figure = new THREE.Group();
      model.traverse((child) => {
        if (child.isMesh) {
          const geo = child.geometry.clone();
          geo.computeVertexNormals();
          const mat = new THREE.MeshLambertMaterial({
            color: CFG.color,
          });
          const m = new THREE.Mesh(geo, mat);
          m.position.copy(child.position);
          m.rotation.copy(child.rotation);
          m.scale.copy(child.scale);
          figure.add(m);
        }
      });
      // Center on the INNER node, rotate on an OUTER node — rotation is
      // applied before position on the same node, which would fling the
      // centered model out of the camera frustum.
      const box = new THREE.Box3().setFromObject(figure);
      const center = box.getCenter(new THREE.Vector3());
      figure.position.sub(center);
      // Orient the STL figure: model is 36w x 80h x 15d with height along Z
      // and front along +X. Rotate so front faces the camera (+Z) and the
      // figure stands upright (+Y).
      const orient = new THREE.Group();
      orient.add(figure);
      orient.rotation.set(-Math.PI / 2, 0, Math.PI / 2);
      container = new THREE.Group();
      container.add(orient);
      const box2 = new THREE.Box3().setFromObject(container);
      const sz = box2.getSize(new THREE.Vector3());
      const maxDim = Math.max(sz.x, sz.y, sz.z) || 1;
      container.scale.multiplyScalar(1 / maxDim);
    }

    if (rotation) container.rotation.z = rotation;
    scene.add(container);

    // --- Lights ---
    const { lightDir, lightColor, ambientColor } = lighting;

    const dirLight = new THREE.DirectionalLight(
      new THREE.Color(lightColor[0], lightColor[1], lightColor[2]), CFG.mainLight
    );
    if (model.__procedural) {
      // For round figure: light from the photo's bright direction
      dirLight.position.set(lightDir[0], lightDir[1], lightDir[2]).normalize().multiplyScalar(5);
    } else {
      // For relief: strong raking light to show edges
      dirLight.position.set(lightDir[0] * 0.5 - 0.6, lightDir[1] * 0.5 + 0.5, 1.0).normalize().multiplyScalar(5);
    }
    scene.add(dirLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, CFG.fillLight);
    fillLight.position.set(-lightDir[0] * 0.5 + 0.5, -lightDir[1] * 0.5 - 0.3, 0.8).normalize().multiplyScalar(3);
    scene.add(fillLight);

    const ambient = new THREE.AmbientLight(
      new THREE.Color(ambientColor[0], ambientColor[1], ambientColor[2]),
      CFG.ambientLight
    );
    scene.add(ambient);

    const hemi = new THREE.HemisphereLight(0xb0c0e0, 0x4a3f30, CFG.hemiLight);
    scene.add(hemi);

    // --- Orthographic camera ---
    // Fit to the model's ACTUAL bounding box after orientation and rotation,
    // checking width as well as height. Previously the view was sized from
    // height alone, so a wide pose (pose 4's outstretched arms) overflowed the
    // frame sideways and got clipped at high zoom.
    const aspect = figW / figH;
    container.updateMatrixWorld(true);
    const fitBox = new THREE.Box3().setFromObject(container);
    const fitSize = fitBox.getSize(new THREE.Vector3());
    const needH = Math.max(
      fitSize.y || 1,
      aspect > 0 ? (fitSize.x || 1) / aspect : (fitSize.y || 1)
    ) * 1.04; // a little breathing room so limbs aren't flush to the edge
    const viewH = needH / CFG.camZoom;
    const cam = new THREE.OrthographicCamera(
      -viewH * aspect / 2, viewH * aspect / 2, viewH / 2, -viewH / 2, 0.01, 100
    );
    cam.position.set(0, 0, 50);
    cam.lookAt(0, 0, 0);

    r.render(scene, cam);

    const out = document.createElement('canvas');
    out.width = figW; out.height = figH;
    out.getContext('2d').drawImage(r.domElement, 0, 0);

    scene.traverse((obj) => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) obj.material.dispose();
    });

    return out;
  }

  // =========================================================================
  // Public: get the model to render (either procedural or GLB)
  // =========================================================================
  function getModel(poseIdx) {
    if (CFG.mode === 'procedural') {
      const fig = buildProceduralFigure(poseIdx);
      fig.__procedural = true;
      return Promise.resolve(fig);
    } else {
      return loadPose(POSE_PATHS[poseIdx % POSE_PATHS.length]);
    }
  }

  // =========================================================================
  // DEBUG PANEL
  // =========================================================================
  function initDebugPanel() {
    if (!new URLSearchParams(window.location.search).has('debug')) return;

    const panel = document.createElement('div');
    panel.id = 'f3d-debug';
    panel.innerHTML = `
      <style>
        #f3d-debug {
          position: fixed; top: 8px; right: 8px; z-index: 99999;
          background: rgba(0,0,0,0.92); color: #eee; font: 12px/1.4 monospace;
          padding: 10px; border: 1px solid #555; width: 310px;
          max-height: 90vh; overflow-y: auto; border-radius: 4px;
        }
        #f3d-debug h3 { margin: 0 0 8px; font-size: 13px; color: lime; }
        #f3d-debug label { display: flex; justify-content: space-between; align-items: center; margin: 3px 0; }
        #f3d-debug input[type=range] { width: 110px; }
        #f3d-debug select { background: #222; color: #eee; border: 1px solid #555; }
        #f3d-debug button { background: #333; color: #eee; border: 1px solid #666; padding: 4px 10px; cursor: pointer; margin: 2px; }
        #f3d-debug button:hover { background: #555; }
        #f3d-debug .preview-row { display: flex; gap: 6px; margin-top: 6px; }
        #f3d-debug canvas { border: 1px solid lime; display: block; }
        #f3d-debug .val { color: #aaa; min-width: 36px; text-align: right; font-size: 11px; }
      </style>
      <h3>FIGURE3D DEBUG</h3>
      <label>Auto-tune <input type="checkbox" id="f3d-auto" checked></label>
      <label>Mode <select id="f3d-mode"><option value="relief">B: Your STL model</option><option value="procedural">A: Procedural 3D</option></select></label>
      <label>Pose <select id="f3d-pose"><option value="0">1</option><option value="1">2</option><option value="2">3</option><option value="3">4</option></select></label>
      <label>Main light <input type="range" id="f3d-main" min="0" max="400" value="19"> <span class="val" id="f3d-main-v">0.19</span></label>
      <label>Fill light <input type="range" id="f3d-fill" min="0" max="200" value="56"> <span class="val" id="f3d-fill-v">0.56</span></label>
      <label>Ambient <input type="range" id="f3d-amb" min="0" max="800" value="83"> <span class="val" id="f3d-amb-v">0.83</span></label>
      <label>Hemi <input type="range" id="f3d-hemi" min="0" max="200" value="111"> <span class="val" id="f3d-hemi-v">1.11</span></label>
      <label>Zoom <input type="range" id="f3d-zoom" min="30" max="100" value="80"> <span class="val" id="f3d-zoom-v">0.80</span></label>
      <div style="color:lime;margin-top:6px;font-size:11px;">PROPORTIONS</div>
      <label>Head size <input type="range" id="f3d-headR" min="50" max="250" value="115"> <span class="val" id="f3d-headR-v">0.115</span></label>
      <label>Torso length <input type="range" id="f3d-torsoLen" min="100" max="500" value="340"> <span class="val" id="f3d-torsoLen-v">0.340</span></label>
      <label>Torso width <input type="range" id="f3d-torsoR" min="40" max="200" value="100"> <span class="val" id="f3d-torsoR-v">0.100</span></label>
      <label>Arm length <input type="range" id="f3d-armLen" min="80" max="400" value="260"> <span class="val" id="f3d-armLen-v">0.260</span></label>
      <label>Arm width <input type="range" id="f3d-armR" min="20" max="120" value="55"> <span class="val" id="f3d-armR-v">0.055</span></label>
      <label>Leg length <input type="range" id="f3d-legLen" min="80" max="450" value="280"> <span class="val" id="f3d-legLen-v">0.280</span></label>
      <label>Leg width <input type="range" id="f3d-legR" min="20" max="130" value="62"> <span class="val" id="f3d-legR-v">0.062</span></label>
      <label>Color <input type="color" id="f3d-color" value="#c8c8c0"></label>
      <label>Rotation <input type="range" id="f3d-rot" min="-45" max="45" value="0"> <span class="val" id="f3d-rot-v">0&deg;</span></label>
      <div><button id="f3d-render">Render Both</button> <button id="f3d-copy">Copy</button> <button id="f3d-close">X</button></div>
      <div><button id="f3d-save">⤓ Save PNG (transparent)</button></div>
      <div class="preview-row">
        <div><div style="color:#aaa;font-size:10px;text-align:center;">A: Procedural</div><canvas id="f3d-prevA" width="120" height="240"></canvas></div>
        <div><div style="color:#aaa;font-size:10px;text-align:center;">B: Relief</div><canvas id="f3d-prevB" width="120" height="240"></canvas></div>
      </div>
      <div id="f3d-info" style="margin-top:4px;color:#888;font-size:11px;"></div>
    `;
    document.body.appendChild(panel);

    const $ = (id) => document.getElementById(id);

    // Live re-render (debounced with rAF)
    let renderQueued = false;
    async function doRender() {
      renderQueued = false;
      const info = $('f3d-info');
      const poseIdx = parseInt($('f3d-pose').value);
      const rot = parseInt($('f3d-rot').value) * Math.PI / 180;
      const lighting = {
        lightDir: [0.4, 0.5, 1],
        lightColor: [1, 0.97, 0.92],
        ambientColor: [0.4, 0.4, 0.42],
      };
      const W = 120, H = 240;

      // Render A: Procedural
      try {
        const figA = buildProceduralFigure(poseIdx);
        figA.__procedural = true;
        const canvA = render(figA, W, H, lighting, rot);
        const prevA = $('f3d-prevA');
        prevA.width = W; prevA.height = H;
        prevA.getContext('2d').drawImage(canvA, 0, 0);
      } catch (e) { info.textContent = 'A error: ' + e.message; console.error(e); }

      // Render B: Relief
      try {
        const model = await loadPose(POSE_PATHS[poseIdx % POSE_PATHS.length]);
        const canvB = render(model, W, H, lighting, rot);
        const prevB = $('f3d-prevB');
        prevB.width = W; prevB.height = H;
        prevB.getContext('2d').drawImage(canvB, 0, 0);
      } catch (e) { info.textContent += ' | B error: ' + e.message; console.error(e); }

      info.textContent = `pose ${poseIdx + 1} · main ${CFG.mainLight.toFixed(2)} fill ${CFG.fillLight.toFixed(2)} amb ${CFG.ambientLight.toFixed(2)} hemi ${CFG.hemiLight.toFixed(2)}`;
    }
    function queueRender() {
      if (renderQueued) return;
      renderQueued = true;
      requestAnimationFrame(() => {
        doRender();
        window.dispatchEvent(new Event('f3d-cfg-changed'));
      });
    }

    // Reflect CFG back into the sliders (so auto-tuned values are visible).
    function syncSliders() {
      const map = [
        ['f3d-main', 'mainLight', 100], ['f3d-fill', 'fillLight', 100],
        ['f3d-amb', 'ambientLight', 100], ['f3d-hemi', 'hemiLight', 100],
        ['f3d-zoom', 'camZoom', 100],
      ];
      map.forEach(([id, key, scale]) => {
        const el = $(id), val = $(id + '-v');
        if (!el) return;
        el.value = Math.round(CFG[key] * scale);
        val.textContent = CFG[key].toFixed(2);
      });
    }
    window.addEventListener('f3d-autotuned', syncSliders);

    function bindSlider(id, key, scale) {
      const el = $(id), val = $(id + '-v');
      el.addEventListener('input', () => {
        // Touching a light slider means taking manual control.
        if (['mainLight', 'fillLight', 'ambientLight', 'hemiLight'].includes(key)) {
          CFG.autoTune = false;
          const cb = $('f3d-auto');
          if (cb) cb.checked = false;
        }
        CFG[key] = el.value / scale;
        val.textContent = (el.value / scale).toFixed(scale >= 1000 ? 3 : 2);
        queueRender();
      });
    }
    $('f3d-auto').addEventListener('change', (e) => {
      CFG.autoTune = e.target.checked;
      queueRender();
    });
    bindSlider('f3d-main', 'mainLight', 100);
    bindSlider('f3d-fill', 'fillLight', 100);
    bindSlider('f3d-amb', 'ambientLight', 100);
    bindSlider('f3d-hemi', 'hemiLight', 100);
    bindSlider('f3d-zoom', 'camZoom', 100);
    bindSlider('f3d-headR', 'headR', 1000);
    bindSlider('f3d-torsoLen', 'torsoLen', 1000);
    bindSlider('f3d-torsoR', 'torsoR', 1000);
    bindSlider('f3d-armLen', 'armLen', 1000);
    bindSlider('f3d-armR', 'armR', 1000);
    bindSlider('f3d-legLen', 'legLen', 1000);
    bindSlider('f3d-legR', 'legR', 1000);

    $('f3d-rot').addEventListener('input', (e) => {
      $('f3d-rot-v').textContent = e.target.value + '\u00b0';
      queueRender();
    });
    $('f3d-color').addEventListener('input', (e) => {
      CFG.color = parseInt(e.target.value.slice(1), 16);
      queueRender();
    });
    $('f3d-mode').addEventListener('change', (e) => { CFG.mode = e.target.value; queueRender(); });
    $('f3d-pose').addEventListener('change', queueRender);
    $('f3d-close').addEventListener('click', () => panel.remove());
    $('f3d-render').addEventListener('click', queueRender);

    // Render the CURRENT pose + settings at high resolution and download it.
    // Square canvas + the bbox-fitting camera means no pose or rotation gets
    // clipped. Background stays transparent so it can be dropped on any colour.
    $('f3d-save').addEventListener('click', async () => {
      const btn = $('f3d-save');
      const label = btn.textContent;
      btn.textContent = 'rendering…';
      try {
        const poseIdx = parseInt($('f3d-pose').value);
        const rot = parseInt($('f3d-rot').value) * Math.PI / 180;
        const lighting = {
          lightDir: [0.4, 0.5, 1],
          lightColor: [1, 1, 1],
          ambientColor: [0.35, 0.41, 0.50],
        };
        const S = 900;
        const src = CFG.mode === 'procedural'
          ? (() => { const f = buildProceduralFigure(poseIdx); f.__procedural = true; return f; })()
          : await loadPose(POSE_PATHS[poseIdx % POSE_PATHS.length]);
        const canv = render(src, S, S, lighting, rot);
        const a = document.createElement('a');
        a.href = canv.toDataURL('image/png');
        a.download = `meccha-pose${poseIdx + 1}-rot${$('f3d-rot').value}.png`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        btn.textContent = 'saved ✓';
      } catch (e) {
        console.error(e);
        btn.textContent = 'failed';
      }
      setTimeout(() => { btn.textContent = label; }, 1400);
    });

    // Copy the current tuning values as text, to share. Proportions are left
    // out on purpose (procedural-mode only). Includes the compositing settings
    // and auto-measured stats for the background patch behind the figure.
    $('f3d-copy').addEventListener('click', () => {
      const poseIdx = parseInt($('f3d-pose').value);
      const hex = '#' + (CFG.color >>> 0).toString(16).padStart(6, '0');
      const lines = [
        `Mode: ${CFG.mode}`,
        `Pose: ${poseIdx + 1}`,
        `Main light: ${CFG.mainLight.toFixed(2)}`,
        `Fill light: ${CFG.fillLight.toFixed(2)}`,
        `Ambient: ${CFG.ambientLight.toFixed(2)}`,
        `Hemi: ${CFG.hemiLight.toFixed(2)}`,
        `Zoom: ${CFG.camZoom.toFixed(2)}`,
        `Color: ${hex}`,
        `Rotation: ${$('f3d-rot').value}°`,
      ];

      // Compositing + measured background patch, pulled from the live round
      // (game.js exposes it as window.__mc when ?debug is on).
      const mc = window.__mc;
      const round = mc && mc.round;
      if (round) {
        lines.push(`Blend: ${round.blend != null ? round.blend : 'n/a'}`);
        lines.push(`Opacity: ${round.opacity != null ? Number(round.opacity).toFixed(2) : 'n/a'}`);
        const rb = round._rebuild;
        if (rb && rb.baseData) {
          const st = patchStats(rb.baseData, round.CW, round.CH,
            round.fx, round.fy, round.figW, round.figH);
          if (st) {
            const [r, g, b] = st.meanRGB.map((v) => Math.round(v));
            const rgbHex = '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');
            lines.push('--- patch (figure footprint) ---');
            lines.push(`Mean luminance: ${st.meanLum.toFixed(1)} (${(st.meanLum / 255).toFixed(2)})`);
            lines.push(`Local texture: ${st.texture.toFixed(1)} (${textureLabel(st.texture)})`);
            lines.push(`Contrast/spread: ${st.contrast.toFixed(1)}`);
            lines.push(`Mean RGB: ${rgbHex}`);
            lines.push(`Surround luminance: ${st.surroundLum.toFixed(1)}`);
            if (st.straddling) lines.push(`NOTE: straddling a hard edge`);
            lines.push(`Auto-tune: ${CFG.autoTune ? 'on' : 'off (manual)'}`);
          }
        }
      }

      const text = lines.join('\n');
      const btn = $('f3d-copy');
      const done = (ok) => {
        btn.textContent = ok ? 'Copied!' : 'Copy failed';
        setTimeout(() => { btn.textContent = 'Copy'; }, 1200);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => done(true), () => done(false));
      } else {
        // Fallback for contexts without the async clipboard API.
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        let ok = false;
        try { ok = document.execCommand('copy'); } catch (_e) {}
        document.body.removeChild(ta);
        done(ok);
      }
    });

    setTimeout(queueRender, 600);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDebugPanel);
  } else {
    setTimeout(initDebugPanel, 100);
  }

  return {
    POSE_PATHS, POSES_PROCEDURAL, CFG,
    loadPose, preloadAll,
    sampleLighting, patchStats, autoTune, applyAutoTune, render,
    getModel, buildProceduralFigure,
  };
})();

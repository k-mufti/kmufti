/* figure3d.js — Offscreen Three.js renderer for the 3D Meccha figure.
 *
 * Loads GLB models, renders with photo-sampled lighting.
 * Includes a debug panel when ?debug is in the URL.
 *
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

  // Tunable defaults — debug panel overrides these
  const CFG = {
    color:       0xd8d8d0,
    roughness:   0.55,
    metalness:   0.05,
    mainLight:   1.5,
    fillLight:   0.4,
    ambientLight: 1.0,
    hemiLight:   0.5,
    camZoom:     0.85,   // fraction of figH the model fills
  };

  const poseCache = new Map();
  let renderer = null;

  function getRenderer() {
    if (!renderer) {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, preserveDrawingBuffer: true });
      renderer.setClearColor(0x000000, 0);
      renderer.setPixelRatio(1);
      // Ensure output encoding is linear (r128)
      if (renderer.outputEncoding !== undefined) renderer.outputEncoding = THREE.LinearEncoding;
    }
    return renderer;
  }

  function loadPose(path) {
    if (poseCache.has(path)) return poseCache.get(path);
    const p = new Promise((res, rej) => {
      const loader = new THREE.GLTFLoader();
      loader.load(
        path,
        (gltf) => {
          console.log('[F3D] Loaded', path, '— meshes:');
          gltf.scene.traverse((c) => {
            if (c.isMesh) {
              console.log('  mesh:', c.name, 'verts:', c.geometry.attributes.position.count,
                'hasNormals:', !!c.geometry.attributes.normal);
              // Ensure normals exist
              if (!c.geometry.attributes.normal) c.geometry.computeVertexNormals();
            }
          });
          res(gltf.scene);
        },
        undefined,
        (err) => { console.error('[F3D] Load failed:', path, err); rej(err); }
      );
    });
    poseCache.set(path, p);
    return p;
  }

  function preloadAll() { POSE_PATHS.forEach(loadPose); }

  // Sample lighting from photo region
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

  // Core render — uses CFG values (debug panel overrides them)
  function render(model, figW, figH, lighting, rotation) {
    const r = getRenderer();
    r.setSize(figW, figH);

    const scene = new THREE.Scene();

    // Deep-clone: clone geometry + create fresh material per mesh
    const figure = new THREE.Group();
    model.traverse((child) => {
      if (child.isMesh) {
        const geo = child.geometry.clone();
        // Models exported from decimated STL have NO normals — must compute
        geo.computeVertexNormals();
        const mat = new THREE.MeshPhongMaterial({
          color: CFG.color,
          shininess: 30,
          specular: 0x444444,
          flatShading: false,
        });
        const m = new THREE.Mesh(geo, mat);
        m.position.copy(child.position);
        m.rotation.copy(child.rotation);
        m.scale.copy(child.scale);
        figure.add(m);
      }
    });

    // Center the figure at origin
    const box = new THREE.Box3().setFromObject(figure);
    const center = box.getCenter(new THREE.Vector3());
    const bsize = box.getSize(new THREE.Vector3());
    figure.position.sub(center);

    // The model's front faces +X, tallest along Z (height), Y is depth.
    // Rotate so camera looking down -Z sees the front:
    //   - Rotate -90 deg around Y so +X face → +Z face (towards camera)
    //   - Rotate -90 deg around X so Z-up → Y-up (standing upright in screen)
    figure.rotation.set(-Math.PI / 2, -Math.PI / 2, 0);

    // Wrap in a container for game rotation
    const container = new THREE.Group();
    container.add(figure);

    // Normalize to unit size after rotation
    const box2 = new THREE.Box3().setFromObject(container);
    const bsize2 = box2.getSize(new THREE.Vector3());
    const maxDim = Math.max(bsize2.x, bsize2.y, bsize2.z) || 1;
    container.scale.multiplyScalar(1 / maxDim);

    if (rotation) container.rotation.z = rotation;
    scene.add(container);

    // --- Lights ---
    const { lightDir, lightColor, ambientColor } = lighting;

    const dirLight = new THREE.DirectionalLight(
      new THREE.Color(lightColor[0], lightColor[1], lightColor[2]), CFG.mainLight
    );
    dirLight.position.set(lightDir[0], lightDir[1], lightDir[2]).normalize().multiplyScalar(5);
    scene.add(dirLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, CFG.fillLight);
    fillLight.position.set(-lightDir[0], -lightDir[1], 0.5).normalize().multiplyScalar(3);
    scene.add(fillLight);

    const ambient = new THREE.AmbientLight(
      new THREE.Color(ambientColor[0], ambientColor[1], ambientColor[2]), CFG.ambientLight
    );
    scene.add(ambient);

    const hemi = new THREE.HemisphereLight(0xb0c0e0, 0x4a3f30, CFG.hemiLight);
    scene.add(hemi);

    // --- Orthographic camera ---
    // Model is now ~1 unit tall. Camera frustum sized to show it.
    const viewH = 1 / CFG.camZoom;
    const aspect = figW / figH;
    const cam = new THREE.OrthographicCamera(
      -viewH * aspect / 2, viewH * aspect / 2, viewH / 2, -viewH / 2, 0.01, 100
    );
    cam.position.set(0, 0, 50);
    cam.lookAt(0, 0, 0);

    r.render(scene, cam);

    // Copy to output canvas
    const out = document.createElement('canvas');
    out.width = figW; out.height = figH;
    out.getContext('2d').drawImage(r.domElement, 0, 0);

    // Cleanup
    scene.traverse((obj) => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) obj.material.dispose();
    });

    return out;
  }

  // ========================================================================
  // DEBUG PANEL — only created when ?debug is in the URL
  // ========================================================================
  function initDebugPanel() {
    if (!new URLSearchParams(window.location.search).has('debug')) return;

    const panel = document.createElement('div');
    panel.id = 'f3d-debug';
    panel.innerHTML = `
      <style>
        #f3d-debug {
          position: fixed; top: 8px; right: 8px; z-index: 99999;
          background: rgba(0,0,0,0.92); color: #eee; font: 12px/1.4 monospace;
          padding: 10px; border: 1px solid #555; max-width: 320px;
          max-height: 90vh; overflow-y: auto;
        }
        #f3d-debug h3 { margin: 0 0 8px; font-size: 13px; color: lime; }
        #f3d-debug label { display: flex; justify-content: space-between; align-items: center; margin: 3px 0; }
        #f3d-debug input[type=range] { width: 120px; }
        #f3d-debug select { background: #222; color: #eee; border: 1px solid #555; }
        #f3d-debug button { background: #333; color: #eee; border: 1px solid #666; padding: 4px 10px; cursor: pointer; margin: 2px; }
        #f3d-debug button:hover { background: #555; }
        #f3d-debug canvas { border: 1px solid lime; margin-top: 6px; display: block; max-width: 100%; }
        #f3d-debug .val { color: #aaa; min-width: 40px; text-align: right; }
      </style>
      <h3>FIGURE3D DEBUG</h3>
      <label>Pose <select id="f3d-pose">${POSE_PATHS.map((p, i) => `<option value="${i}">Pose ${i + 1}</option>`).join('')}</select></label>
      <label>Roughness <input type="range" id="f3d-rough" min="0" max="100" value="55"> <span class="val" id="f3d-rough-v">0.55</span></label>
      <label>Metalness <input type="range" id="f3d-metal" min="0" max="100" value="5"> <span class="val" id="f3d-metal-v">0.05</span></label>
      <label>Main light <input type="range" id="f3d-main" min="0" max="300" value="150"> <span class="val" id="f3d-main-v">1.5</span></label>
      <label>Fill light <input type="range" id="f3d-fill" min="0" max="200" value="40"> <span class="val" id="f3d-fill-v">0.4</span></label>
      <label>Ambient <input type="range" id="f3d-amb" min="0" max="300" value="100"> <span class="val" id="f3d-amb-v">1.0</span></label>
      <label>Hemi light <input type="range" id="f3d-hemi" min="0" max="200" value="50"> <span class="val" id="f3d-hemi-v">0.5</span></label>
      <label>Zoom <input type="range" id="f3d-zoom" min="20" max="100" value="85"> <span class="val" id="f3d-zoom-v">0.85</span></label>
      <label>Color <input type="color" id="f3d-color" value="#d8d8d0"></label>
      <label>Rotation <input type="range" id="f3d-rot" min="-30" max="30" value="0"> <span class="val" id="f3d-rot-v">0</span></label>
      <div><button id="f3d-render">Re-render</button> <button id="f3d-close">Close</button></div>
      <canvas id="f3d-preview" width="220" height="440"></canvas>
      <div id="f3d-info" style="margin-top:4px;color:#888;font-size:11px;"></div>
    `;
    document.body.appendChild(panel);

    const $ = (id) => document.getElementById(id);

    // Slider helper
    function bindSlider(id, key, scale) {
      const el = $(id), val = $(id + '-v');
      el.addEventListener('input', () => {
        const v = el.value / scale;
        CFG[key] = v;
        val.textContent = v.toFixed(2);
      });
    }
    bindSlider('f3d-rough', 'roughness', 100);
    bindSlider('f3d-metal', 'metalness', 100);
    bindSlider('f3d-main', 'mainLight', 100);
    bindSlider('f3d-fill', 'fillLight', 100);
    bindSlider('f3d-amb', 'ambientLight', 100);
    bindSlider('f3d-hemi', 'hemiLight', 100);
    bindSlider('f3d-zoom', 'camZoom', 100);

    $('f3d-color').addEventListener('input', (e) => {
      CFG.color = parseInt(e.target.value.slice(1), 16);
    });

    $('f3d-close').addEventListener('click', () => panel.remove());

    $('f3d-render').addEventListener('click', async () => {
      const info = $('f3d-info');
      info.textContent = 'Rendering...';
      try {
        const poseIdx = parseInt($('f3d-pose').value);
        const rot = parseInt($('f3d-rot').value) * Math.PI / 180;
        const model = await loadPose(POSE_PATHS[poseIdx]);
        // Default lighting for debug preview (bright white, front-ish)
        const lighting = {
          lightDir: [0.5, 0.5, 1],
          lightColor: [1, 1, 1],
          ambientColor: [0.4, 0.4, 0.4],
        };
        const fig = render(model, 220, 440, lighting, rot);
        const preview = $('f3d-preview');
        preview.width = fig.width; preview.height = fig.height;
        preview.getContext('2d').drawImage(fig, 0, 0);
        info.textContent = `OK — ${fig.width}x${fig.height}, pose ${poseIdx + 1}`;
      } catch (err) {
        info.textContent = 'ERROR: ' + err.message;
        console.error(err);
      }
    });

    // Auto-render on load
    setTimeout(() => $('f3d-render').click(), 500);
  }

  // Init debug panel after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDebugPanel);
  } else {
    setTimeout(initDebugPanel, 100);
  }

  return {
    POSE_PATHS, CFG,
    loadPose, preloadAll,
    sampleLighting, render,
  };
})();

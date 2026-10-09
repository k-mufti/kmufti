// Food, as things you can pick up.
//
// There are 1,100 ingredients and 3,000 dishes, far too many to model. So
// every piece of food is a card, like the pantry's paper tiles: a photo of
// the thing from Wikipedia with its name underneath. It's a real object in
// the room - it has thickness, casts a shadow, tumbles when it's thrown -
// but what's on it is a picture.
//
// pictures.json says where each photo lives (node pictures.js fills it in).
// Photos load straight from Wikimedia the first time they're needed, and a
// card shows just its name until its photo arrives, or for good if it has
// none.
import * as THREE from "three";

const PICTURES = fetch("pictures.json").then((r) => r.json()).catch(() => ({}));
const pictureUrl = (src) => `https://upload.wikimedia.org/wikipedia/${src}`;

let REDRAW = () => {};
// scene3d passes in how to ask for a redraw, for photos that arrive late
export function onPicture(redraw) { REDRAW = redraw; }

/* ---------- the card's face ---------- */
const CW = 512, CH = 600;          // canvas size; the card is the same shape
const PAD = 22, PHOTO_H = 410;

// A cuisine's dish gets a band of its colors along the bottom edge.
const STRIPE_H = 30;
function blankFace(g, stripe) {
  g.clearRect(0, 0, CW, CH);
  g.fillStyle = "#f7f0e2";
  g.beginPath();
  g.roundRect(4, 4, CW - 8, CH - 8, 34);
  g.fill();
  if (stripe) {
    g.save();
    g.clip();
    const w = (CW - 8) / stripe.length;
    stripe.forEach((c, i) => { g.fillStyle = c; g.fillRect(4 + i * w, CH - 4 - STRIPE_H, w + 1, STRIPE_H); });
    g.restore();
  }
  g.strokeStyle = "#c9b995";
  g.lineWidth = 6;
  g.beginPath();
  g.roundRect(4, 4, CW - 8, CH - 8, 34);
  g.stroke();
}
const stripeOf = (name) => window.kitchenStripe?.(name) || null;
function writeName(g, name, cx, cy, maxW, start) {
  g.fillStyle = "#3a2a1c";
  g.textAlign = "center";
  g.textBaseline = "middle";
  let size = start;
  do {
    g.font = `600 ${size}px Inter, system-ui, sans-serif`;
    size -= 2;
  } while (g.measureText(name).width > maxW && size > 14);
  g.fillText(name, cx, cy);
}
// no photo (yet): just the name, big
function drawName(g, name) {
  const stripe = stripeOf(name);
  blankFace(g, stripe);
  writeName(g, name, CW / 2, (CH - (stripe ? STRIPE_H : 0)) / 2, CW - 70, 76);
}
// the photo, cropped to fill its window, with the name underneath
function drawPhoto(g, name, img) {
  const stripe = stripeOf(name);
  blankFace(g, stripe);
  const w = CW - PAD * 2, h = PHOTO_H;
  const k = Math.max(w / img.width, h / img.height);
  const sw = w / k, sh = h / k;
  g.save();
  g.beginPath();
  g.roundRect(PAD, PAD, w, h, 22);
  g.clip();
  g.drawImage(img, (img.width - sw) / 2, (img.height - sh) / 2, sw, sh, PAD, PAD, w, h);
  g.restore();
  writeName(g, name, CW / 2, PAD + h + (CH - PAD - h - (stripe ? STRIPE_H : 0)) / 2, CW - 50, 84);
}

// One face per name, shared by every copy of it: three eggs, one texture.
const FACES = new Map();
function faceFor(name) {
  if (FACES.has(name)) return FACES.get(name);
  const c = document.createElement("canvas");
  c.width = CW; c.height = CH;
  const g = c.getContext("2d");
  drawName(g, name);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  const face = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.7 });
  FACES.set(name, face);
  PICTURES.then((pics) => {
    if (!pics[name]) return;
    const img = new Image();
    img.crossOrigin = "anonymous";           // Wikimedia allows it; without it the canvas can't be used
    img.onload = () => { drawPhoto(g, name, img); tex.needsUpdate = true; REDRAW(); };
    img.src = pictureUrl(pics[name]);
  });
  return face;
}

/* ---------- the thing itself ---------- */
// It stands up and faces you, like a photo on a stand - lying flat, the
// camera would see it edge-on. scene3d turns it to face the camera.
const W = 0.19, H = W * (CH / CW), T = 0.012;
const CARD = new THREE.BoxGeometry(W, H, T);
const EDGE = new THREE.MeshStandardMaterial({ color: 0xe6dcc6, roughness: 0.8 });
const BACK = new THREE.MeshStandardMaterial({ color: 0xd9cdb3, roughness: 0.85 });

// A group standing on y=0, with what it is recorded on it.
export function foodMesh(name, kind) {
  // box faces: +x, -x, +y, -y, +z (the front, with the picture), -z
  const card = new THREE.Mesh(CARD, [EDGE, EDGE, EDGE, EDGE, faceFor(name), BACK]);
  card.position.y = H / 2;
  card.castShadow = card.receiveShadow = true;
  const holder = new THREE.Group();
  holder.add(card);
  holder.userData.food = { name, kind, shape: "card" };
  return holder;
}

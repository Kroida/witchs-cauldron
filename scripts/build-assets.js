import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';

const ROOT = process.cwd();
const conceituaisDir = path.join(ROOT, 'imagens', 'conceituais');
const imagensDir = path.join(ROOT, 'imagens');

const outImages = path.join(ROOT, 'src', 'assets', 'images');
const outPotions = path.join(ROOT, 'src', 'assets', 'potions');
const outUi = path.join(ROOT, 'src', 'assets', 'ui');
const outFx = path.join(ROOT, 'src', 'assets', 'fx');

[outImages, outPotions, outUi, outFx].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

function loadPng(filePath) {
  const buf = fs.readFileSync(filePath);
  return PNG.sync.read(buf);
}

function savePng(png, filePath) {
  const buf = PNG.sync.write(png);
  fs.writeFileSync(filePath, buf);
}

function crop(src, x, y, w, h) {
  const dest = new PNG({ width: w, height: h });
  for (let dy = 0; dy < h; dy++) {
    for (let dx = 0; dx < w; dx++) {
      const sx = x + dx;
      const sy = y + dy;
      const dIdx = (w * dy + dx) * 4;
      if (sx >= 0 && sx < src.width && sy >= 0 && sy < src.height) {
        const sIdx = (src.width * sy + sx) * 4;
        dest.data[dIdx] = src.data[sIdx];
        dest.data[dIdx + 1] = src.data[sIdx + 1];
        dest.data[dIdx + 2] = src.data[sIdx + 2];
        dest.data[dIdx + 3] = src.data[sIdx + 3];
      } else {
        dest.data[dIdx + 3] = 0;
      }
    }
  }
  return dest;
}

console.log('Loading source images...');
const concept2 = loadPng(path.join(conceituaisDir, 'ChatGPT Image Nov 7, 2026, 01_02_56 AM-2.png'));
const icon = loadPng(path.join(imagensDir, 'Icon.png'));

// 1. UI Elements
console.log('Extracting UI elements...');
const scoreBoard = crop(concept2, 1150, 100, 430, 620);
savePng(scoreBoard, path.join(outUi, 'score_board.png'));

const rankBtn = crop(concept2, 1150, 725, 390, 120);
savePng(rankBtn, path.join(outUi, 'rank_btn.png'));

const logoSign = crop(concept2, 25, 5, 380, 240);
savePng(logoSign, path.join(outUi, 'logo_sign.png'));

// 2. Shelf Frame & Background
console.log('Extracting Shelf...');
const shelfFull = crop(concept2, 440, 60, 680, 830);
savePng(shelfFull, path.join(outImages, 'shelf_full.png'));

const shelfHeader = crop(concept2, 510, 80, 540, 110);
savePng(shelfHeader, path.join(outUi, 'shelf_header.png'));

// 3. Extract the 9 slots from shelfFull
console.log('Extracting 9 potion slots...');
const slotCoords = [
  { id: 1, x: 55, y: 95, w: 160, h: 210 },
  { id: 2, x: 265, y: 95, w: 160, h: 210 },
  { id: 3, x: 475, y: 95, w: 160, h: 210 },
  { id: 4, x: 55, y: 325, w: 160, h: 210 },
  { id: 5, x: 265, y: 325, w: 160, h: 210 },
  { id: 6, x: 475, y: 325, w: 160, h: 210 },
  { id: 7, x: 55, y: 550, w: 160, h: 210 },
  { id: 8, x: 265, y: 550, w: 160, h: 210 },
  { id: 9, x: 475, y: 550, w: 160, h: 210 },
];

slotCoords.forEach(s => {
  const slotImg = crop(shelfFull, s.x, s.y, s.w, s.h);
  savePng(slotImg, path.join(outPotions, `slot_${s.id}_base.png`));
});

// 4. Generate Unlocked Potions with matching silhouettes and distinct magical colors & effects
console.log('Generating distinct unlocked potion sprites...');
// Color themes for the 9 potions:
// 1: Cosmic Violet / Magenta (original unlocked)
// 2: Golden Amber Honey (Poção da Serenidade)
// 3: Sapphire Celestial Blue (Orvalho Estelar)
// 4: Fiery Ruby Crimson (Essência de Fogo)
// 5: Emerald Green Elixir (Lágrima da Dríade)
// 6: Amethyst Purple Wind (Sopro da Meia-Noite)
// 7: Midnight Indigo Eclipse (Néctar do Eclipse)
// 8: Blazing Solar Phoenix (Lágrima de Fênix)
// 9: Prismatic Rainbow Chaos (Elixir do Caos Primordial)

const themes = [
  { id: 1, name: 'Poção Cósmica', hueShift: 0, rMult: 1.0, gMult: 1.0, bMult: 1.0 }, // Keep as slot 1
  { id: 2, name: 'Elixir da Serenidade', target: 'amber', r: 245, g: 158, b: 11 },
  { id: 3, name: 'Orvalho Estelar', target: 'blue', r: 14, g: 165, b: 233 },
  { id: 4, name: 'Essência de Fogo', target: 'red', r: 239, g: 68, b: 68 },
  { id: 5, name: 'Lágrima da Dríade', target: 'emerald', r: 16, g: 185, b: 129 },
  { id: 6, name: 'Sopro da Meia-Noite', target: 'amethyst', r: 168, g: 85, b: 247 },
  { id: 7, name: 'Néctar do Eclipse', target: 'indigo', r: 99, g: 102, b: 241 },
  { id: 8, name: 'Lágrima de Fênix', target: 'orange', r: 249, g: 115, b: 22 },
  { id: 9, name: 'Elixir do Caos', target: 'rainbow', r: 236, g: 72, b: 153 }
];

// For slot 1, the unlocked is slot_1_base.png
fs.copyFileSync(path.join(outPotions, 'slot_1_base.png'), path.join(outPotions, 'potion_1_unlocked.png'));
fs.copyFileSync(path.join(outPotions, 'slot_1_base.png'), path.join(outPotions, 'potion_1_locked.png')); // slot 1 starts unlocked

// Create unlocked versions for 2 to 9 by color grading and illuminating the bottle interior
for (let id = 2; id <= 9; id++) {
  const base = loadPng(path.join(outPotions, `slot_${id}_base.png`));
  const unlocked = new PNG({ width: base.width, height: base.height });
  const theme = themes[id - 1];

  // Also create a standalone padlock & chain overlay
  const chainsOverlay = new PNG({ width: base.width, height: base.height });

  for (let y = 0; y < base.height; y++) {
    for (let x = 0; x < base.width; x++) {
      const idx = (base.width * y + x) * 4;
      const r = base.data[idx];
      const g = base.data[idx + 1];
      const b = base.data[idx + 2];
      const a = base.data[idx + 3];

      // Detect golden padlock and chain
      // Golden pixels: high R, medium G, low B and above the plaque (y < 145)
      const isGolden = (r > 150 && g > 90 && b < 80 && (r - b) > 60 && y < 145);
      const isChainLink = (r > 80 && g > 50 && b < 40 && (r - b) > 30 && y < 145);

      if (isGolden || isChainLink) {
        chainsOverlay.data[idx] = r;
        chainsOverlay.data[idx + 1] = g;
        chainsOverlay.data[idx + 2] = b;
        chainsOverlay.data[idx + 3] = 255;
      } else {
        chainsOverlay.data[idx + 3] = 0;
      }

      // For unlocked bottle:
      // Leave plaque intact (y >= 140)
      if (y >= 140) {
        unlocked.data[idx] = r;
        unlocked.data[idx + 1] = g;
        unlocked.data[idx + 2] = b;
        unlocked.data[idx + 3] = a;
        continue;
      }

      // Inside bottle area:
      // Dark purple silhouette pixels have: b > r * 0.9, g < 80, total brightness between 25 and 180
      const isDarkBottle = (b >= 25 && b <= 210 && (b > g || r > g) && (r + g + b) < 420 && y > 20 && y < 145 && x > 25 && x < 135);

      if (isDarkBottle) {
        // Transform into radiant themed liquid with glass reflection!
        let tR = theme.r, tG = theme.g, tB = theme.b;
        if (theme.target === 'rainbow') {
          // Shifting rainbow gradient based on x and y
          const phase = (x / base.width) * Math.PI * 2;
          tR = Math.floor(128 + 127 * Math.sin(phase));
          tG = Math.floor(128 + 127 * Math.sin(phase + 2));
          tB = Math.floor(128 + 127 * Math.sin(phase + 4));
        }

        // Add specular glass shine along the left curve (x: 40-55)
        const shine = (x > 38 && x < 52 && y > 50 && y < 110) ? 90 : 0;
        const bottomGlow = (y > 90 && y < 130) ? 40 : 0;

        // If it was a golden chain pixel over the bottle, replace it with liquid
        const intensity = Math.max(0.4, (r + g + b) / 300);
        unlocked.data[idx] = Math.min(255, Math.floor(tR * intensity + shine + bottomGlow));
        unlocked.data[idx + 1] = Math.min(255, Math.floor(tG * intensity + shine + bottomGlow));
        unlocked.data[idx + 2] = Math.min(255, Math.floor(tB * intensity + shine + bottomGlow));
        unlocked.data[idx + 3] = 255;
      } else {
        // Outside bottle or wood
        unlocked.data[idx] = r;
        unlocked.data[idx + 1] = g;
        unlocked.data[idx + 2] = b;
        unlocked.data[idx + 3] = a;
      }
    }
  }

  savePng(unlocked, path.join(outPotions, `potion_${id}_unlocked.png`));
  savePng(chainsOverlay, path.join(outPotions, `chains_overlay_${id}.png`));
  fs.copyFileSync(path.join(outPotions, `slot_${id}_base.png`), path.join(outPotions, `potion_${id}_locked.png`));
}

// 5. Create Standalone Padlock & Broken Chain Shards
console.log('Generating padlock and shard sprites...');
const baseSlot2 = loadPng(path.join(outPotions, 'slot_2_base.png'));
const padlock = new PNG({ width: 44, height: 44 });
// Golden padlock center in slot 2 is at x: 78, y: 86
for (let dy = 0; dy < 44; dy++) {
  for (let dx = 0; dx < 44; dx++) {
    const sx = 78 - 22 + dx;
    const sy = 86 - 22 + dy;
    const dIdx = (44 * dy + dx) * 4;
    const sIdx = (baseSlot2.width * sy + sx) * 4;
    const r = baseSlot2.data[sIdx];
    const g = baseSlot2.data[sIdx + 1];
    const b = baseSlot2.data[sIdx + 2];
    const isGold = (r > 130 && g > 75 && b < 80);
    if (isGold || (r < 40 && g < 30 && b < 30 && dy > 15 && dy < 35 && dx > 15 && dx < 28)) { // Keyhole
      padlock.data[dIdx] = r;
      padlock.data[dIdx + 1] = g;
      padlock.data[dIdx + 2] = b;
      padlock.data[dIdx + 3] = 255;
    } else {
      padlock.data[dIdx + 3] = 0;
    }
  }
}
savePng(padlock, path.join(outPotions, 'padlock.png'));

// 6. Witch & Cat Layer from Icon.png
console.log('Processing Witch and Cat layers from Icon.png...');
savePng(icon, path.join(outImages, 'witch_cat_full.png'));

// Extract eyes for blinking animation
// In gif frames, we found frame_0 (eyes open) and frame_5 (eyes closed smiling)
const gifF0 = loadPng(path.join(ROOT, 'src', 'assets', 'gif-frames', 'frame_0.png'));
const gifF5 = loadPng(path.join(ROOT, 'src', 'assets', 'gif-frames', 'frame_5.png'));

// Extract witch eyes from frame 0 and frame 5
const witchEyeOpen = crop(gifF0, 130, 140, 65, 55);
const witchEyeClosed = crop(gifF5, 130, 140, 65, 55);
savePng(witchEyeOpen, path.join(outImages, 'witch_eyes_open.png'));
savePng(witchEyeClosed, path.join(outImages, 'witch_eyes_closed.png'));

// Extract cat face for blinking from frame 0 and frame 5
const catFace0 = crop(gifF0, 210, 240, 80, 80);
const catFace5 = crop(gifF5, 210, 240, 80, 80);
savePng(catFace0, path.join(outImages, 'cat_face_open.png'));
savePng(catFace5, path.join(outImages, 'cat_face_blink.png'));

// 7. Background with transparent window cutout
console.log('Creating background with transparent window cutout...');
const bgRoom = new PNG({ width: concept2.width, height: concept2.height });
for (let y = 0; y < concept2.height; y++) {
  for (let x = 0; x < concept2.width; x++) {
    const idx = (concept2.width * y + x) * 4;
    const r = concept2.data[idx];
    const g = concept2.data[idx + 1];
    const b = concept2.data[idx + 2];
    const a = concept2.data[idx + 3];

    // Check if pixel is inside the window pane area
    // Window region: x in 1475 to 1670, y in 0 to 420
    const inWindowBox = (x >= 1475 && x <= 1670 && y >= 10 && y <= 420);
    
    // Check if pixel is the sky/moon/distant castle in the window (purple sky or moon or castle, but NOT the candles or frame)
    const isSky = (b > 60 && (b > r || (r > 180 && g > 160 && b > 160))) && (y < 340 || x < 1560);
    const isCandle = (y > 330 && x > 1560 && r > 180 && g > 120 && b < 100);

    if (inWindowBox && isSky && !isCandle) {
      // Cut out for transparent sky canvas
      bgRoom.data[idx] = r;
      bgRoom.data[idx + 1] = g;
      bgRoom.data[idx + 2] = b;
      bgRoom.data[idx + 3] = 0; // Transparent!
    } else {
      bgRoom.data[idx] = r;
      bgRoom.data[idx + 1] = g;
      bgRoom.data[idx + 2] = b;
      bgRoom.data[idx + 3] = a;
    }
  }
}
savePng(bgRoom, path.join(outImages, 'bg_room.png'));

// 8. Generate Gacha FX (Radial Rays)
console.log('Generating Gacha Radial Rays...');
const raysSize = 512;
const rays = new PNG({ width: raysSize, height: raysSize });
const center = raysSize / 2;
const numRays = 16;
for (let y = 0; y < raysSize; y++) {
  for (let x = 0; x < raysSize; x++) {
    const idx = (raysSize * y + x) * 4;
    const dx = x - center;
    const dy = y - center;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > center) {
      rays.data[idx + 3] = 0;
      continue;
    }
    const angle = Math.atan2(dy, dx);
    const rayVal = (Math.sin(angle * numRays) + 1) / 2;
    const falloff = Math.max(0, 1 - dist / center);
    const alpha = Math.floor(rayVal * falloff * 200);

    rays.data[idx] = 255;
    rays.data[idx + 1] = 215;
    rays.data[idx + 2] = 0;
    rays.data[idx + 3] = alpha;
  }
}
savePng(rays, path.join(outFx, 'gacha_rays.png'));

console.log('Asset generation complete!');

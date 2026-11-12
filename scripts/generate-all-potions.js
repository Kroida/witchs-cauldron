import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';

const ROOT = process.cwd();
const outPotions = path.join(ROOT, 'src', 'assets', 'potions');
if (!fs.existsSync(outPotions)) fs.mkdirSync(outPotions, { recursive: true });

function loadPng(p) { return PNG.sync.read(fs.readFileSync(p)); }
function savePng(png, p) { fs.writeFileSync(p, PNG.sync.write(png)); }

// Clean up the amber potion with flood fill
console.log('Generating clean transparent bottle base...');
const rawAmber = loadPng(path.join(ROOT, 'src', 'assets', 'slices', 'potion_art_amber.png'));
const w = rawAmber.width, h = rawAmber.height;
const amberClean = new PNG({ width: w, height: h });

const visited = new Uint8Array(w * h);
const queue = [];
for (let x = 0; x < w; x++) { queue.push([x, 0]); queue.push([x, h - 1]); }
for (let y = 0; y < h; y++) { queue.push([0, y]); queue.push([w - 1, y]); }

function isBg(x, y) {
  const idx = (w * y + x) * 4;
  const r = rawAmber.data[idx], g = rawAmber.data[idx+1], b = rawAmber.data[idx+2];
  if (y > 160) return true; // bottom text
  if (r < 140 && g < 120 && b < 140) return false; // dark outline
  if (r > 130 && g < 60 && b > 130) return false; // purple ribbon
  if (r > 190 && g > 90 && b < 70) return false; // amber liquid
  if (r > 150 && g > 75 && b < 65 && y < 45) return false; // cork
  return true;
}

while (queue.length > 0) {
  const [cx, cy] = queue.pop();
  if (cx < 0 || cx >= w || cy < 0 || cy >= h) continue;
  const pos = cy * w + cx;
  if (visited[pos]) continue;
  visited[pos] = 1;
  if (isBg(cx, cy)) {
    rawAmber.data[pos * 4 + 3] = 0;
    queue.push([cx + 1, cy]); queue.push([cx - 1, cy]);
    queue.push([cx, cy + 1]); queue.push([cx, cy - 1]);
  }
}

for (let i = 0; i < rawAmber.data.length; i++) {
  amberClean.data[i] = rawAmber.data[i];
}
savePng(amberClean, path.join(outPotions, 'bottle_template_clean.png'));

// Color palettes for the 9 unlocked potions
const potionConfigs = [
  { id: 1, name: 'Poção Cósmica', type: 'original' },
  { id: 2, name: 'Elixir da Serenidade', type: 'amber' }, // original amber
  { id: 3, name: 'Orvalho Estelar', r: 30, g: 140, b: 245, glow: '#38bdf8' },
  { id: 4, name: 'Essência de Fogo', r: 245, g: 50, b: 50, glow: '#f43f5e' },
  { id: 5, name: 'Lágrima da Dríade', r: 35, g: 200, b: 120, glow: '#34d399' },
  { id: 6, name: 'Sopro da Meia-Noite', r: 175, g: 80, b: 245, glow: '#c084fc' },
  { id: 7, name: 'Néctar do Eclipse', r: 70, g: 85, b: 220, glow: '#818cf8' },
  { id: 8, name: 'Lágrima de Fênix', r: 255, g: 130, b: 20, glow: '#fb923c' },
  { id: 9, name: 'Elixir do Caos', type: 'rainbow', glow: '#f472b6' }
];

// Load slot 1 original unlocked
const slot1Concept = loadPng(path.join(ROOT, 'src', 'assets', 'slices', 'slot_1.png'));
// Save as potion_1_unlocked
savePng(slot1Concept, path.join(outPotions, 'potion_1_unlocked.png'));

// Generate potions 2 to 9
for (let i = 1; i < potionConfigs.length; i++) {
  const cfg = potionConfigs[i];
  const pot = new PNG({ width: w, height: h });

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (w * y + x) * 4;
      const a = amberClean.data[idx + 3];
      if (a === 0) {
        pot.data[idx + 3] = 0;
        continue;
      }
      const r = amberClean.data[idx];
      const g = amberClean.data[idx + 1];
      const b = amberClean.data[idx + 2];

      if (cfg.type === 'amber') {
        pot.data[idx] = r;
        pot.data[idx + 1] = g;
        pot.data[idx + 2] = b;
        pot.data[idx + 3] = a;
        continue;
      }

      // Check if it's the liquid part
      const isLiquid = (r > 180 && g > 80 && b < 80 && y > 75);
      const isLiquidLight = (r > 220 && g > 150 && b < 100 && y > 75);

      if (isLiquid) {
        if (cfg.type === 'rainbow') {
          const hue = (x / w) * Math.PI * 2;
          const bright = (r + g + b) / (255 * 3);
          pot.data[idx] = Math.min(255, Math.floor((128 + 127 * Math.sin(hue)) * bright * 1.5));
          pot.data[idx + 1] = Math.min(255, Math.floor((128 + 127 * Math.sin(hue + 2)) * bright * 1.5));
          pot.data[idx + 2] = Math.min(255, Math.floor((128 + 127 * Math.sin(hue + 4)) * bright * 1.5));
        } else {
          const factor = isLiquidLight ? 1.25 : 0.9;
          const lum = (r * 0.3 + g * 0.59 + b * 0.11) / 255;
          pot.data[idx] = Math.min(255, Math.floor(cfg.r * lum * factor));
          pot.data[idx + 1] = Math.min(255, Math.floor(cfg.g * lum * factor));
          pot.data[idx + 2] = Math.min(255, Math.floor(cfg.b * lum * factor));
        }
        pot.data[idx + 3] = a;
      } else {
        // Cork, glass highlight, ribbon
        pot.data[idx] = r;
        pot.data[idx + 1] = g;
        pot.data[idx + 2] = b;
        pot.data[idx + 3] = a;
      }
    }
  }

  savePng(pot, path.join(outPotions, `potion_${cfg.id}_unlocked.png`));
}

// Generate Chain Shards for shatter animation
console.log('Generating chain shatter particles...');
const shardSizes = [12, 16, 20];
shardSizes.forEach((sz, sIdx) => {
  const shard = new PNG({ width: sz, height: sz });
  for (let y = 0; y < sz; y++) {
    for (let x = 0; x < sz; x++) {
      const idx = (sz * y + x) * 4;
      const isGold = (x > 2 && x < sz - 2 && y > 2 && y < sz - 2);
      if (isGold) {
        shard.data[idx] = 255;
        shard.data[idx + 1] = 200 + Math.floor(Math.random() * 40);
        shard.data[idx + 2] = 40;
        shard.data[idx + 3] = 255;
      } else {
        shard.data[idx + 3] = 0;
      }
    }
  }
  savePng(shard, path.join(outPotions, `shard_${sIdx}.png`));
});

console.log('All 9 unlocked potions generated successfully!');

// Generates app icons (PNG) from scratch — no native deps, pure Node + zlib.
// Draws a full-bleed indigo gradient with a white "globe" mark (matches
// public/favicon.svg). Run:  node scripts/make-icons.mjs
//
// Outputs into public/:
//   apple-touch-icon.png (180), icon-192.png, icon-512.png

import { deflateSync } from "node:zlib";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const PUBLIC = join(dirname(fileURLToPath(import.meta.url)), "..", "public");

// ---- minimal PNG encoder (RGBA, 8-bit) ----
const crcTable = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const t = Buffer.from(type, "ascii");
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([t, data])), 0);
  return Buffer.concat([len, t, data, crc]);
}
function encodePNG(size, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // colour type RGBA
  const stride = size * 4;
  const raw = Buffer.alloc((stride + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (stride + 1)] = 0; // filter: none
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride);
  }
  const idat = deflateSync(raw, { level: 9 });
  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", idat),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

// ---- drawing ----
const lerp = (a, b, t) => a + (b - a) * t;
const TOP = [0x81, 0x8c, 0xf8]; // indigo-400
const BOT = [0x4f, 0x46, 0xe5]; // indigo-600

function render(size) {
  const ss = 3; // supersampling for smooth edges
  const out = Buffer.alloc(size * size * 4);
  const cx = size / 2;
  const cy = size / 2;
  const R = size * 0.3;
  const sw = size * 0.052;
  const a = R * 0.55;
  const b = R;
  const lineHalf = sw * 0.42;
  const ellThresh = sw / 2 / R;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let r = 0,
        g = 0,
        bl = 0;
      for (let sy = 0; sy < ss; sy++) {
        for (let sx = 0; sx < ss; sx++) {
          const px = x + (sx + 0.5) / ss;
          const py = y + (sy + 0.5) / ss;
          const t = py / size;
          let cr = lerp(TOP[0], BOT[0], t);
          let cg = lerp(TOP[1], BOT[1], t);
          let cb = lerp(TOP[2], BOT[2], t);
          const dx = px - cx;
          const dy = py - cy;
          const d = Math.hypot(dx, dy);
          let white = false;
          if (Math.abs(d - R) <= sw / 2) {
            white = true; // outer ring
          } else if (d < R - sw * 0.1) {
            if (Math.abs(dy) <= lineHalf) white = true; // equator
            else if (Math.abs(dx) <= lineHalf) white = true; // straight meridian
            else if (Math.abs(Math.hypot(dx / a, dy / b) - 1) <= ellThresh)
              white = true; // curved meridian
          }
          if (white) {
            cr = 255;
            cg = 255;
            cb = 255;
          }
          r += cr;
          g += cg;
          bl += cb;
        }
      }
      const n = ss * ss;
      const i = (y * size + x) * 4;
      out[i] = Math.round(r / n);
      out[i + 1] = Math.round(g / n);
      out[i + 2] = Math.round(bl / n);
      out[i + 3] = 255;
    }
  }
  return out;
}

for (const [name, size] of [
  ["apple-touch-icon.png", 180],
  ["icon-192.png", 192],
  ["icon-512.png", 512],
]) {
  writeFileSync(join(PUBLIC, name), encodePNG(size, render(size)));
  console.log(`wrote public/${name} (${size}x${size})`);
}

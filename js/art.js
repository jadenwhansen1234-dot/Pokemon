/* ============================================================
   POKÉMON ECLIPSE — art engine (terrain)
   Richer procedural pixel art for the overworld.
   ============================================================ */
'use strict';

var Art = globalThis.Art = globalThis.Art || {};

(function () {
  const T = 32;

  function hashStr(s) {
    let h = 2166136261;
    for (let i = 0; i < String(s).length; i++) { h ^= String(s).charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function seeded(x, y, s = 0) {
    let n = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(s | 0, 1442695041)) | 0;
    return () => {
      n = Math.imul(n ^ (n >>> 13), 1274126177);
      n = (n ^ (n >>> 16)) >>> 0;
      return n / 4294967296;
    };
  }
  function rgba(hex, a) { const [r, g, b] = hexToRgb(hex); return `rgba(${r},${g},${b},${a})`; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function centerText(ctx, text, x, y, font, color, align = 'center') {
    ctx.save(); ctx.font = font; ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = 'middle';
    ctx.fillText(text, x, y); ctx.restore();
  }

  const PAL = {
    grass:   { base:'#1f5c3f', dark:'#174a33', light:'#2b7250', hi:'#469b6b', tuft:'#357d54' },
    flower:  { base:'#205f42', dark:'#174a33', light:'#2c7351', hi:'#4aa16f', petals:['#f7a8c8','#ffd875','#e9f2ff','#c9a0ff','#ff9a76'] },
    path:    { base:'#b88954', dark:'#9b6c3d', light:'#d2a466', hi:'#e8c489', pebble:'#85603a' },
    sand:    { base:'#d6b775', dark:'#c3a05d', light:'#eed79b', hi:'#fff0c2', pebble:'#b08c50' },
    rock:    { base:'#525d6e', dark:'#3e4858', light:'#687487', hi:'#7f8da1', moss:'#4b795a' },
    cave:    { base:'#262c45', dark:'#1c2136', light:'#343b58', hi:'#454e70', glow:'#63d8ff' },
    caveP:   { base:'#4a4560', dark:'#35314a', light:'#5d5778', hi:'#746c92', line:'#272337' },
    snow:    { base:'#dcecf5', dark:'#c3d9e6', light:'#eefaff', hi:'#ffffff', shadow:'#a8c6d8' },
    water:   { base:'#1c6f9a', dark:'#15557b', light:'#2c8db8', hi:'#8fe6ff' },
    pier:    { base:'#8a5f3c', dark:'#6d482b', light:'#a8784d', hi:'#c29463' },
    floor:   { base:'#6b4a39', dark:'#54382b', light:'#7f5a45', hi:'#936a51' },
    wall:    { base:'#33354f', dark:'#242639', light:'#434766', hi:'#565b80' },
    brick:   { base:'#744a4e', dark:'#5a383d', light:'#8c5d61', hi:'#a57175' },
    ancient: { base:'#5d5a66', dark:'#45434f', light:'#716d7c', hi:'#8b8599', rune:'#7ce8ff' }
  };

  /* ------------------------------------------------ ground tiles */
  function grassTile(ctx, x, y, seed, flowers) {
    const p = flowers ? PAL.flower : PAL.grass;
    const r = seeded(x, y, seed);
    PX.rect(ctx, x, y, T, T, p.base);
    // broad tone variation
    for (let i = 0; i < 3; i++) {
      const cx = x + 5 + r() * 22, cy = y + 5 + r() * 22;
      PX.ell(ctx, cx, cy, 5 + r() * 7, 3 + r() * 4, r() > .5 ? p.light : p.dark);
    }
    // dither + blade texture
    for (let i = 0; i < 22; i++) {
      const px = x + Math.floor(r() * T), py = y + Math.floor(r() * T);
      PX.rect(ctx, px, py, r() > .7 ? 2 : 1, 1, r() > .55 ? p.light : p.dark);
    }
    for (let i = 0; i < 3; i++) {
      const bx = x + 4 + Math.floor(r() * 25), by = y + 6 + Math.floor(r() * 24);
      PX.line(ctx, bx, by, bx - 1, by - 4, p.tuft, 1);
      PX.line(ctx, bx + 1, by, bx + 1, by - 5, p.hi, 1);
      PX.line(ctx, bx + 2, by, bx + 4, by - 3, p.dark, 1);
    }
    if (flowers) {
      const petals = p.petals;
      const count = 2 + Math.floor(r() * 3);
      for (let i = 0; i < count; i++) {
        const fx = x + 5 + Math.floor(r() * 22), fy = y + 6 + Math.floor(r() * 20);
        const col = petals[Math.floor(r() * petals.length)];
        PX.rect(ctx, fx, fy + 1, 1, 4, p.dark);
        PX.rect(ctx, fx - 1, fy - 1, 3, 3, col);
        PX.rect(ctx, fx - 2, fy, 1, 1, col); PX.rect(ctx, fx + 2, fy, 1, 1, col);
        PX.rect(ctx, fx, fy - 2, 1, 1, col); PX.rect(ctx, fx, fy + 2, 1, 1, col);
        PX.rect(ctx, fx, fy, 1, 1, '#fff4c2');
      }
    }
    // pebbles / clover
    if (r() > .62) {
      const sx = x + 6 + Math.floor(r() * 20), sy = y + 8 + Math.floor(r() * 18);
      PX.ell(ctx, sx, sy, 2, 1, p.dark); PX.rect(ctx, sx - 1, sy - 1, 2, 1, p.hi);
    }
  }

  function tallGrassTile(ctx, x, y, seed) {
    const r = seeded(x, y, seed + 99);
    PX.rect(ctx, x, y, T, T, '#103a29');
    // Soft, mottled understory gives the patch depth without a hard tile edge.
    for (let i = 0; i < 6; i++) {
      const cx = x + 3 + Math.floor(r() * 26), cy = y + 7 + Math.floor(r() * 22);
      PX.ell(ctx, cx, cy, 3 + Math.floor(r() * 5), 2 + Math.floor(r() * 3), i % 3 ? '#174a31' : '#1b5234');
    }
    for (let i = 0; i < 14; i++) {
      const bx = x + 2 + Math.floor(r() * 28), by = y + 25 + Math.floor(r() * 7);
      const h = 8 + Math.floor(r() * 13);
      const shade = i % 4;
      const stem = shade === 0 ? '#286c43' : shade === 1 ? '#347d4d' : '#205a38';
      const edge = shade === 0 ? '#4ca66a' : shade === 1 ? '#62b978' : '#3a9258';
      // Three-leaf fans read clearly as grass while retaining crisp pixel edges.
      PX.line(ctx, bx, by, bx - 3, by - h + 3, stem, 2);
      PX.line(ctx, bx, by, bx, by - h, edge, 1);
      PX.line(ctx, bx + 1, by, bx + 4, by - h + 5, stem, 2);
      PX.rect(ctx, bx - 1, by - h + 1, 1, 2, '#8bd492');
    }
    // Low foreground blades and a dark base anchor the player inside the patch.
    PX.rect(ctx, x, y + 28, T, 4, 'rgba(7,28,19,.42)');
    for (let i = 0; i < 5; i++) {
      const bx = x + 2 + Math.floor(r() * 28), by = y + 31;
      const h = 5 + Math.floor(r() * 7);
      PX.line(ctx, bx, by, bx - 2, by - h, '#24653d', 2);
      PX.line(ctx, bx + 1, by, bx + 2, by - h - 2, i % 2 ? '#4ba969' : '#72c980', 1);
    }
    for (let i = 0; i < 5; i++) {
      const sx = x + 2 + Math.floor(r() * 28), sy = y + 18 + Math.floor(r() * 12);
      PX.rect(ctx, sx, sy, 1, 1, i % 2 ? '#75c47b' : '#b0dd83');
    }
  }

  function pathTile(ctx, x, y, seed, style) {
    const p = style === 'sand' ? PAL.sand : PAL.path;
    const r = seeded(x, y, seed);
    PX.rect(ctx, x, y, T, T, p.base);
    for (let i = 0; i < 4; i++) PX.ell(ctx, x + 4 + r() * 24, y + 4 + r() * 24, 4 + r() * 6, 3 + r() * 3, r() > .5 ? p.light : p.dark);
    for (let i = 0; i < 18; i++) PX.rect(ctx, x + Math.floor(r() * T), y + Math.floor(r() * T), 1, 1, r() > .5 ? p.light : p.dark);
    // scattered stones
    for (let i = 0; i < 3; i++) {
      if (r() > .4) {
        const sx = x + 5 + Math.floor(r() * 22), sy = y + 5 + Math.floor(r() * 22);
        PX.ell(ctx, sx, sy, 2, 1, p.pebble);
        PX.rect(ctx, sx - 1, sy - 1, 2, 1, p.hi);
      }
    }
    // faint wheel ruts
    if (style !== 'sand') {
      PX.rect(ctx, x, y + 10, T, 1, rgba('#7a512d', .16));
      PX.rect(ctx, x, y + 21, T, 1, rgba('#7a512d', .12));
    } else {
      PX.rect(ctx, x, y + 9, T, 1, rgba('#a9823f', .22));
      PX.rect(ctx, x, y + 20, T, 1, rgba('#fff0c2', .16));
    }
  }

  function sandTile(ctx, x, y, seed, pebbly) {
    const p = PAL.sand;
    const r = seeded(x, y, seed + 17);
    PX.rect(ctx, x, y, T, T, p.base);
    for (let i = 0; i < 3; i++) PX.ell(ctx, x + 4 + r() * 24, y + 4 + r() * 24, 5 + r() * 7, 2 + r() * 3, r() > .5 ? p.light : p.dark);
    // ripples
    for (let i = 0; i < 3; i++) {
      const wy = y + 6 + i * 9 + Math.floor(r() * 3);
      PX.rect(ctx, x + 3, wy, 10 + Math.floor(r() * 8), 1, rgba('#fff0c2', .22));
      PX.rect(ctx, x + 16, wy + 1, 9, 1, rgba('#a9823f', .18));
    }
    for (let i = 0; i < 10; i++) PX.rect(ctx, x + Math.floor(r() * T), y + Math.floor(r() * T), 1, 1, p.light);
    if (pebbly) {
      for (let i = 0; i < 4; i++) {
        const sx = x + 6 + Math.floor(r() * 20), sy = y + 6 + Math.floor(r() * 20);
        PX.ell(ctx, sx, sy, 2, 1, p.pebble); PX.rect(ctx, sx - 1, sy - 1, 2, 1, p.hi);
      }
    }
  }

  function rockTile(ctx, x, y, seed, mossy) {
    const p = PAL.rock;
    const r = seeded(x, y, seed + 5);
    PX.rect(ctx, x, y, T, T, p.base);
    for (let i = 0; i < 3; i++) PX.ell(ctx, x + 5 + r() * 22, y + 5 + r() * 22, 5 + r() * 6, 3 + r() * 3, r() > .5 ? p.light : p.dark);
    // cracks
    let cx = x + 4 + r() * 8, cy = y + 3 + r() * 8;
    for (let i = 0; i < 5; i++) { PX.rect(ctx, cx, cy, 1, 2, p.dark); cx += 2 + r() * 3; cy += 2 + r() * 2; }
    for (let i = 0; i < 12; i++) PX.rect(ctx, x + Math.floor(r() * T), y + Math.floor(r() * T), 1, 1, r() > .5 ? p.hi : p.dark);
    if (mossy) {
      for (let i = 0; i < 4; i++) PX.ell(ctx, x + 5 + r() * 22, y + 5 + r() * 22, 3 + r() * 4, 2, p.moss);
    }
  }

  function caveFloorTile(ctx, x, y, seed) {
    const p = PAL.cave;
    const r = seeded(x, y, seed + 31);
    PX.rect(ctx, x, y, T, T, p.base);
    for (let i = 0; i < 3; i++) PX.ell(ctx, x + 4 + r() * 24, y + 4 + r() * 24, 5 + r() * 6, 3 + r() * 3, r() > .5 ? p.light : p.dark);
    for (let i = 0; i < 14; i++) PX.rect(ctx, x + Math.floor(r() * T), y + Math.floor(r() * T), 1, 1, r() > .5 ? p.light : p.dark);
    if (r() > .55) {
      const bx = x + 6 + Math.floor(r() * 20), by = y + 6 + Math.floor(r() * 20);
      PX.rect(ctx, bx, by, 1, 3, rgba(p.glow, .5));
      PX.rect(ctx, bx - 1, by + 1, 3, 1, rgba(p.glow, .3));
    }
  }

  function cavePathTile(ctx, x, y, seed) {
    const p = PAL.caveP;
    const r = seeded(x, y, seed + 71);
    PX.rect(ctx, x, y, T, T, p.dark);
    PX.rect(ctx, x + 2, y + 2, T - 4, T - 4, p.base);
    PX.rect(ctx, x + 2, y + 2, T - 4, 2, p.light);
    PX.rect(ctx, x + 2, y + T - 4, T - 4, 2, p.dark);
    const split = 10 + Math.floor(r() * 12);
    PX.rect(ctx, x + split, y + 2, 1, T - 4, p.line);
    PX.rect(ctx, x + 2, y + 16, T - 4, 1, p.line);
    for (let i = 0; i < 6; i++) PX.rect(ctx, x + 3 + Math.floor(r() * 26), y + 3 + Math.floor(r() * 26), 1, 1, r() > .5 ? p.hi : p.dark);
  }

  function snowTile(ctx, x, y, seed, rocky) {
    const p = PAL.snow;
    const r = seeded(x, y, seed + 43);
    PX.rect(ctx, x, y, T, T, p.base);
    for (let i = 0; i < 3; i++) PX.ell(ctx, x + 4 + r() * 24, y + 5 + r() * 22, 6 + r() * 7, 3 + r() * 3, r() > .5 ? p.light : p.dark);
    for (let i = 0; i < 10; i++) PX.rect(ctx, x + Math.floor(r() * T), y + Math.floor(r() * T), 1, 1, r() > .5 ? p.hi : p.shadow);
    // drift shadow
    PX.rect(ctx, x, y + T - 2, T, 2, rgba(p.shadow, .35));
    if (rocky) {
      for (let i = 0; i < 3; i++) {
        const sx = x + 6 + Math.floor(r() * 20), sy = y + 7 + Math.floor(r() * 18);
        PX.ell(ctx, sx, sy, 3, 2, '#9fb6c6'); PX.rect(ctx, sx - 2, sy - 2, 4, 2, '#c8dce8');
      }
    }
  }

  function waterTile(ctx, x, y, seed) {
    const p = PAL.water;
    const r = seeded(x, y, seed + 88);
    PX.rect(ctx, x, y, T, T, p.base);
    for (let i = 0; i < 4; i++) PX.ell(ctx, x + 5 + r() * 22, y + 5 + r() * 22, 5 + r() * 7, 2 + r() * 2, r() > .5 ? p.light : p.dark);
    PX.rect(ctx, x + 4, y + 9 + Math.floor(r() * 3), 10, 1, rgba(p.hi, .28));
    PX.rect(ctx, x + 18, y + 22, 9, 1, rgba(p.hi, .22));
    PX.rect(ctx, x + 8, y + 26, 5, 1, rgba(p.dark, .5));
  }

  function pierTile(ctx, x, y, seed) {
    const p = PAL.pier;
    const r = seeded(x, y, seed + 12);
    PX.rect(ctx, x, y, T, T, p.dark);
    for (let i = 0; i < 4; i++) {
      PX.rect(ctx, x + i * 8, y + 1, 7, T - 2, i % 2 ? p.base : p.light);
      PX.rect(ctx, x + i * 8, y + 1, 7, 1, p.hi);
    }
    for (let i = 0; i < 5; i++) PX.rect(ctx, x + Math.floor(r() * 30), y + 4 + Math.floor(r() * 24), 2, 1, rgba('#4c3320', .25));
    PX.rect(ctx, x, y, T, 2, p.hi);
    PX.rect(ctx, x, y + T - 2, T, 2, p.dark);
  }

  function floorTile(ctx, x, y, seed) {
    const p = PAL.floor;
    const r = seeded(x, y, seed + 3);
    PX.rect(ctx, x, y, T, T, p.base);
    for (let i = 0; i < 2; i++) PX.rect(ctx, x, y + i * 16, T, 1, p.dark);
    PX.rect(ctx, x + 15, y, 1, T, rgba('#4a3025', .6));
    PX.rect(ctx, x + 4, y + 4, 10, 1, rgba(p.light, .5));
    PX.rect(ctx, x + 20, y + 20, 8, 1, rgba(p.light, .35));
    for (let i = 0; i < 5; i++) PX.rect(ctx, x + 3 + Math.floor(r() * 26), y + 3 + Math.floor(r() * 26), 1, 1, rgba('#3a241b', .3));
  }

  function wallTile(ctx, x, y, seed) {
    const p = PAL.wall;
    const r = seeded(x, y, seed + 8);
    PX.rect(ctx, x, y, T, T, p.base);
    PX.rect(ctx, x, y, T, 3, p.hi);
    PX.rect(ctx, x, y + T - 4, T, 4, p.dark);
    PX.rect(ctx, x + 4, y + 7, T - 8, 18, p.light);
    PX.rect(ctx, x + 5, y + 8, T - 10, 16, p.base);
    PX.rect(ctx, x + 4, y + 7, T - 8, 1, rgba('#8b90b8', .45));
    for (let i = 0; i < 3; i++) PX.rect(ctx, x + 7 + Math.floor(r() * 18), y + 11 + Math.floor(r() * 10), 1, 1, rgba('#1b1d30', .35));
  }

  function brickTile(ctx, x, y, seed) {
    const p = PAL.brick;
    const r = seeded(x, y, seed + 21);
    PX.rect(ctx, x, y, T, T, p.dark);
    for (let row = 0; row < 4; row++) {
      const off = row % 2 ? -8 : 0;
      for (let col = 0; col < 3; col++) {
        PX.rect(ctx, x + off + col * 16 + 1, y + row * 8 + 1, 14, 6, row % 2 ? p.base : p.light);
      }
    }
    for (let i = 0; i < 6; i++) PX.rect(ctx, x + Math.floor(r() * T), y + Math.floor(r() * T), 1, 1, rgba('#2f1c20', .3));
  }

  function ancientTile(ctx, x, y, seed) {
    const p = PAL.ancient;
    const r = seeded(x, y, seed + 55);
    PX.rect(ctx, x, y, T, T, p.dark);
    PX.rect(ctx, x + 1, y + 1, T - 2, T - 2, p.base);
    PX.rect(ctx, x + 1, y + 1, T - 2, 1, p.hi);
    PX.rect(ctx, x + 1, y + T - 2, T - 2, 1, p.dark);
    if (r() > .55) {
      const gx = x + 8 + Math.floor(r() * 14), gy = y + 8 + Math.floor(r() * 14);
      PX.rect(ctx, gx, gy, 1, 6, rgba(p.rune, .55));
      PX.rect(ctx, gx + 3, gy + 2, 1, 4, rgba(p.rune, .4));
      PX.rect(ctx, gx - 2, gy + 4, 7, 1, rgba(p.rune, .3));
    }
    for (let i = 0; i < 4; i++) PX.rect(ctx, x + 3 + Math.floor(r() * 26), y + 3 + Math.floor(r() * 26), 1, 1, rgba('#2e2c38', .4));
  }

  function doorstepTile(ctx, x, y, seed) {
    const r = seeded(x, y, seed + 6);
    PX.rect(ctx, x, y, T, T, '#a87a52');
    for (let i = 0; i < 4; i++) PX.rect(ctx, x + 2, y + 6 + i * 7, T - 4, 1, i % 2 ? '#936744' : '#bb8c5f');
    for (let i = 0; i < 6; i++) PX.rect(ctx, x + 3 + Math.floor(r() * 26), y + 3 + Math.floor(r() * 26), 1, 1, '#d3a878');
    PX.rect(ctx, x, y, T, 2, '#c99a6b');
  }

  function counterTile(ctx, x, y, seed) {
    PX.rect(ctx, x, y, T, T, '#4b3045');
    PX.rect(ctx, x, y, T, 12, '#8a5a68');
    PX.rect(ctx, x, y, T, 3, '#ab7484');
    PX.rect(ctx, x, y + 12, T, 2, '#2f1f2d');
    PX.rect(ctx, x + 6, y + 16, 20, 10, '#5c3b52');
    PX.rect(ctx, x + 7, y + 17, 18, 2, '#6d4862');
  }

  function roofTile(ctx, x, y, seed) {
    const p = PAL.brick;
    const r = seeded(x, y, seed + 41);
    PX.rect(ctx, x, y, T, T, '#4a2b32');
    for (let i = 0; i < 3; i++) {
      PX.rect(ctx, x, y + i * 11, T, 1, '#6b4149');
      PX.rect(ctx, x + ((i * 9) % 16), y + i * 11 + 2, 12, 8, i % 2 ? '#5c363f' : '#653c46');
    }
    for (let i = 0; i < 4; i++) PX.rect(ctx, x + Math.floor(r() * 30), y + Math.floor(r() * 30), 1, 1, rgba('#2c181d', .4));
  }

  function drawTile(ctx, tile, x, y, seed) {
    const tx = x * T, ty = y * T;
    switch (tile) {
      case 'grass': grassTile(ctx, tx, ty, seed); break;
      case 'grass_flower': grassTile(ctx, tx, ty, seed, true); break;
      case 'tall_grass': tallGrassTile(ctx, tx, ty, seed); break;
      case 'path': case 'path2': pathTile(ctx, tx, ty, seed); break;
      case 'sand': sandTile(ctx, tx, ty, seed); break;
      case 'sand_pebble': sandTile(ctx, tx, ty, seed, true); break;
      case 'sand_path': pathTile(ctx, tx, ty, seed, 'sand'); break;
      case 'rock': rockTile(ctx, tx, ty, seed); break;
      case 'snow': snowTile(ctx, tx, ty, seed); break;
      case 'snow_rock': snowTile(ctx, tx, ty, seed, true); break;
      case 'snow_path': snowTile(ctx, tx, ty, seed); pathTile(ctx, tx, ty, seed + 2, 'snow'); break;
      case 'cave_floor': caveFloorTile(ctx, tx, ty, seed); break;
      case 'cave_path': cavePathTile(ctx, tx, ty, seed); break;
      case 'water': waterTile(ctx, tx, ty, seed); break;
      case 'pier': pierTile(ctx, tx, ty, seed); break;
      case 'floor': floorTile(ctx, tx, ty, seed); break;
      case 'wall': wallTile(ctx, tx, ty, seed); break;
      case 'building_wall': brickTile(ctx, tx, ty, seed); break;
      case 'doorstep': doorstepTile(ctx, tx, ty, seed); break;
      case 'counter': counterTile(ctx, tx, ty, seed); break;
      case 'ancient_floor': ancientTile(ctx, tx, ty, seed); break;
      default:
        if (String(tile).endsWith('_roof')) roofTile(ctx, tx, ty, seed);
        else if (String(tile).includes('wall')) brickTile(ctx, tx, ty, seed);
        else grassTile(ctx, tx, ty, seed);
    }
  }

  /* ------------------------------------------------ transitions */
  function tileCat(tile) {
    if (!tile) return 'void';
    if (tile === 'water') return 'water';
    if (tile === 'pier') return 'pier';
    if (tile === 'path' || tile === 'path2' || tile === 'sand_path' || tile === 'snow_path' || tile === 'doorstep' || tile === 'cave_path') return 'path';
    if (tile === 'sand' || tile === 'sand_pebble') return 'sand';
    if (tile === 'snow' || tile === 'snow_rock') return 'snow';
    if (tile === 'rock') return 'rock';
    if (tile === 'cave_floor') return 'cave';
    if (tile === 'floor' || tile === 'counter') return 'floor';
    if (tile === 'wall' || tile.includes('wall') || tile.includes('roof')) return 'wall';
    if (tile === 'ancient_floor') return 'ancient';
    if (tile === 'tall_grass') return 'tall';
    return 'grass';
  }

  function fringeColors(tile) {
    const c = tileCat(tile);
    if (c === 'sand') return { tuft: '#c3a05d', hi: '#eed79b' };
    if (c === 'snow') return { tuft: '#c3d9e6', hi: '#ffffff' };
    if (c === 'rock') return { tuft: '#4b795a', hi: '#7f8da1' };
    if (c === 'cave') return { tuft: '#343b58', hi: '#454e70' };
    if (c === 'tall') return { tuft: '#1d5a38', hi: '#2f8a52' };
    if (c === 'ancient') return { tuft: '#45434f', hi: '#716d7c' };
    return { tuft: '#174a33', hi: '#469b6b' };
  }

  function transitions(ctx, map) {
    const { width, height, tiles } = map;
    const at = (x, y) => (x < 0 || y < 0 || x >= width || y >= height) ? null : tiles[y][x];
    for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
      const tile = tiles[y][x], cat = tileCat(tile), tx = x * T, ty = y * T;
      const nbs = [[x, y - 1, 'n'], [x + 1, y, 'e'], [x, y + 1, 's'], [x - 1, y, 'w']];
      for (const [nx, ny, side] of nbs) {
        const n = at(nx, ny); if (n === null) continue;
        const ncat = tileCat(n);
        if (ncat === cat) continue;
        // Keep path-on-path variants seamless.
        if (cat === 'path' && ncat === 'path') continue;
        if (cat === 'water' && ncat !== 'water') {
          const foam = 'rgba(160,235,255,.5)';
          if (side === 'n') PX.rect(ctx, tx, ty, T, 2, foam);
          if (side === 's') PX.rect(ctx, tx, ty + T - 2, T, 2, foam);
          if (side === 'w') PX.rect(ctx, tx, ty, 2, T, foam);
          if (side === 'e') PX.rect(ctx, tx + T - 2, ty, 2, T, foam);
          continue;
        }
        if (cat === 'path' && (ncat === 'grass' || ncat === 'tall' || ncat === 'sand' || ncat === 'snow' || ncat === 'rock')) {
          const c = fringeColors(n);
          const r = seeded(x, y, ncat.length * 7);
          for (let i = 0; i < 4; i++) {
            const off = Math.floor(r() * 28);
            if (side === 'n') { PX.rect(ctx, tx + off, ty, 2, 2, c.tuft); PX.rect(ctx, tx + off + 1, ty + 2, 1, 2, c.hi); }
            if (side === 's') { PX.rect(ctx, tx + off, ty + T - 2, 2, 2, c.tuft); PX.rect(ctx, tx + off + 1, ty + T - 4, 1, 2, c.hi); }
            if (side === 'w') { PX.rect(ctx, tx, ty + off, 2, 2, c.tuft); PX.rect(ctx, tx + 2, ty + off + 1, 2, 1, c.hi); }
            if (side === 'e') { PX.rect(ctx, tx + T - 2, ty + off, 2, 2, c.tuft); PX.rect(ctx, tx + T - 4, ty + off + 1, 2, 1, c.hi); }
          }
        }
        if (cat === 'wall' && ncat !== 'wall') {
          if (side === 's') PX.rect(ctx, tx, ty + T - 3, T, 3, 'rgba(5,7,14,.45)');
        }
      }
    }
  }

  /* ------------------------------------------------ static layer */
  const layerCache = new Map();
  function buildStaticLayer(map) {
    if (!map) return null;
    const cached = layerCache.get(map.id);
    if (cached) return cached;
    const PAD = 48;
    const c = document.createElement('canvas');
    c.width = map.width * T + PAD * 2; c.height = map.height * T + PAD * 2;
    const ctx = c.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.translate(PAD, PAD);
    const seed = (hashStr(map.id) % 99991) | 0;
    for (let y = 0; y < map.height; y++) for (let x = 0; x < map.width; x++) {
      drawTile(ctx, map.tiles[y][x], x, y, seed + x * 131 + y * 977);
    }
    transitions(ctx, map);
    // bake soft ambient occlusion at map borders
    const edge = ctx.createLinearGradient(0, 0, 0, 64);
    edge.addColorStop(0, 'rgba(4,6,16,.35)'); edge.addColorStop(1, 'rgba(4,6,16,0)');
    ctx.fillStyle = edge; ctx.fillRect(0, 0, map.width * T, 64);
    // props sorted so taller / lower objects paint last
    const props = map.objects.slice().sort((a, b) => (a.y + (a.height || 1)) - (b.y + (b.height || 1)));
    for (const o of props) Art.drawProp(ctx, o, map);
    c._pad = PAD;
    layerCache.set(map.id, c);
    return c;
  }

  Art.T = T;
  Art.PAL = PAL;
  Art.hashStr = hashStr;
  Art.seeded = seeded;
  Art.rgba = rgba;
  Art.lerp = lerp;
  Art.centerText = centerText;
  Art.drawTile = drawTile;
  Art.tileCat = tileCat;
  Art.buildStaticLayer = buildStaticLayer;
  Art._seeded = seeded;
})();

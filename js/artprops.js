/* ============================================================
   POKÉMON ECLIPSE — art engine (props)
   Trees, buildings, shrines, crystals, market stalls and more.
   ============================================================ */
'use strict';

(function () {
  const T = 32;
  const rgba = Art.rgba;
  const seeded = Art.seeded;

  function shadow(ctx, cx, cy, rx, ry, a = .3) {
    ctx.save();
    ctx.fillStyle = `rgba(4,8,16,${a})`;
    ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  const BUILDING = {
    house:       { roof:'#b4534f', roofD:'#7f363a', roofL:'#d97a70', wall:'#e9d9bd', wallD:'#c7b08c', trim:'#7d5135', accent:'#f5c542' },
    lab:         { roof:'#337a8a', roofD:'#1d505e', roofL:'#5fb8c4', wall:'#e6eef0', wallD:'#c0d2d6', trim:'#4a6a74', accent:'#7ce8ff' },
    shop:        { roof:'#b9793a', roofD:'#855322', roofL:'#e0a35a', wall:'#efdcb8', wallD:'#ccb488', trim:'#7a4a2a', accent:'#ffd166' },
    pokecenter:  { roof:'#ad4a5c', roofD:'#7a2e3c', roofL:'#d97a88', wall:'#f3e7e6', wallD:'#d0bcbc', trim:'#8a5a62', accent:'#ff5a6e' },
    gym:         { roof:'#4a7a4a', roofD:'#2c4e2e', roofL:'#74ad6a', wall:'#ddd6ba', wallD:'#b8b090', trim:'#5a4a2e', accent:'#8ee05a' },
    league_hall: { roof:'#4f5f9a', roofD:'#354067', roofL:'#8090c8', wall:'#dfe5f2', wallD:'#b4bdd4', trim:'#45506e', accent:'#f5c542' }
  };

  function drawBuilding(ctx, o) {
    const left = (o.x - 1) * T, top = (o.y - 1) * T, W = 4 * T, H = 3 * T;
    const p = BUILDING[o.type] || BUILDING.house;
    shadow(ctx, left + W / 2, top + H - 4, W * .47, 8, .32);

    // walls
    PX.rect(ctx, left + 4, top + 32, W - 8, H - 34, p.wallD);
    PX.rect(ctx, left + 6, top + 34, W - 12, H - 38, p.wall);
    PX.rect(ctx, left + 6, top + H - 16, W - 12, 12, p.wallD);
    PX.rect(ctx, left + 6, top + H - 18, W - 12, 2, p.trim);
    // siding
    for (let i = 0; i < 6; i++) PX.rect(ctx, left + 8, top + 38 + i * 8, W - 16, 1, rgba(p.wallD, .45));
    // corner trim
    PX.rect(ctx, left + 5, top + 30, 5, H - 32, p.trim);
    PX.rect(ctx, left + W - 10, top + 30, 5, H - 32, p.trim);

    // roof
    PX.tri(ctx, left - 8, top + 40, left + W / 2, top - 6, left + W + 8, top + 40, p.roofD);
    PX.tri(ctx, left + 2, top + 39, left + W / 2, top + 1, left + W - 2, top + 39, p.roof);
    PX.tri(ctx, left + 14, top + 36, left + W / 2 - 10, top + 8, left + W / 2 + 2, top + 12, p.roofL);
    PX.rect(ctx, left - 8, top + 39, W + 16, 4, p.roofD);
    PX.rect(ctx, left - 8, top + 39, W + 16, 1, p.roofL);
    // shingles
    for (let i = 0; i < 4; i++) {
      const yy = top + 16 + i * 6;
      PX.rect(ctx, left + 20 + i * 3, yy, W - 40 - i * 6, 1, rgba(p.roofD, .45));
    }
    // ridge cap
    PX.rect(ctx, left + W / 2 - 2, top + 2, 4, 10, p.roofD);
    PX.rect(ctx, left + W / 2 - 1, top + 2, 2, 7, p.roofL);

    // windows
    const winY = top + 50;
    for (const wx of [left + 18, left + W - 40]) {
      PX.rect(ctx, wx, winY, 22, 18, p.trim);
      PX.rect(ctx, wx + 2, winY + 2, 18, 14, '#87d8ef');
      PX.rect(ctx, wx + 2, winY + 2, 18, 5, '#bdf0ff');
      PX.rect(ctx, wx + 10, winY + 2, 2, 14, p.trim);
      PX.rect(ctx, wx + 2, winY + 8, 18, 1, p.trim);
      PX.rect(ctx, wx + 3, winY + 3, 4, 2, '#ffffff');
      // sill
      PX.rect(ctx, wx - 2, winY + 18, 26, 3, p.wallD);
    }

    // door
    const dx = left + 2 * T - 11, dy = top + H - 34;
    PX.rect(ctx, dx - 2, dy - 2, 26, 36, p.trim);
    PX.rect(ctx, dx, dy, 22, 32, '#5a3826');
    PX.rect(ctx, dx + 2, dy + 2, 18, 28, '#7a4f33');
    PX.rect(ctx, dx + 2, dy + 2, 18, 2, '#96694a');
    PX.rect(ctx, dx + 15, dy + 16, 2, 2, p.accent);
    PX.rect(ctx, dx - 4, dy + 32, 30, 3, p.wallD);
    PX.rect(ctx, dx + 4, dy + 6, 14, 8, rgba('#2a1a14', .5));

    // type-specific signage
    if (o.type === 'pokecenter') {
      PX.ell(ctx, left + 2 * T, top + 50, 9, 9, '#f5f5f5');
      PX.rect(ctx, left + 2 * T - 2, top + 39, 4, 22, '#e8445a');
      PX.rect(ctx, left + 2 * T - 9, top + 46, 18, 4, '#e8445a');
      PX.rect(ctx, left + 2 * T - 1, top + 41, 2, 18, '#ff8090');
    }
    if (o.type === 'lab') {
      // satellite dish
      PX.ell(ctx, left + 28, top + 10, 11, 6, '#cdd8de');
      PX.ell(ctx, left + 28, top + 9, 8, 4, '#eef8fb');
      PX.line(ctx, left + 28, top + 14, left + 28, top + 28, '#8a9aa4', 2);
      PX.rect(ctx, left + 25, top + 27, 7, 3, '#6c7c86');
      // round window
      PX.ell(ctx, left + 2 * T, top + 53, 10, 10, p.trim);
      PX.ell(ctx, left + 2 * T, top + 53, 7, 7, '#7ce8ff');
      PX.ell(ctx, left + 2 * T - 2, top + 51, 3, 2, '#e6ffff');
    }
    if (o.type === 'shop') {
      // awning
      for (let i = 0; i < 8; i++) PX.rect(ctx, left + 10 + i * 14, top + 44, 14, 9, i % 2 ? '#fff2d0' : '#d9694f');
      PX.rect(ctx, left + 10, top + 52, W - 20, 4, '#8a3a2a');
      PX.rect(ctx, left + 10, top + 52, W - 20, 1, '#ffe2a8');
      // crates
      PX.rect(ctx, left + 10, top + H - 22, 14, 14, '#9a6538');
      PX.rect(ctx, left + 11, top + H - 21, 12, 3, '#c28a52');
      PX.rect(ctx, left + 10, top + H - 14, 14, 2, '#734a28');
    }
    if (o.type === 'gym') {
      PX.ell(ctx, left + 2 * T, top + 48, 13, 11, '#2f4a30');
      PX.ell(ctx, left + 2 * T, top + 48, 10, 8, p.accent);
      PX.tri(ctx, left + 2 * T, top + 41, left + 2 * T - 7, top + 53, left + 2 * T + 7, top + 53, '#2f4a30');
      PX.rect(ctx, left + 2 * T - 1, top + 45, 2, 6, '#2f4a30');
      // banners
      PX.rect(ctx, left + 9, top + 56, 5, 22, '#c9c08a');
      PX.rect(ctx, left + W - 14, top + 56, 5, 22, '#c9c08a');
    }
    if (o.type === 'league_hall') {
      // columns
      for (const cx of [left + 14, left + W - 18]) {
        PX.rect(ctx, cx, top + 44, 6, 42, p.wallD);
        PX.rect(ctx, cx + 1, top + 44, 2, 42, '#f0f4fc');
        PX.rect(ctx, cx - 2, top + 42, 10, 3, p.accent);
      }
      PX.ell(ctx, left + 2 * T, top + 47, 11, 10, p.accent);
      PX.ell(ctx, left + 2 * T, top + 47, 7, 6, '#fff4c8');
      PX.rect(ctx, left + 2 * T - 1, top + 41, 2, 12, p.trim);
    }
    if (o.type === 'house') {
      // chimney + flower boxes
      PX.rect(ctx, left + W - 34, top + 6, 10, 22, '#7a4a3a');
      PX.rect(ctx, left + W - 36, top + 4, 14, 4, '#5a3428');
      for (const wx of [left + 18, left + W - 40]) {
        PX.rect(ctx, wx - 2, top + 68, 26, 4, '#7a4a2a');
        PX.rect(ctx, wx, top + 65, 4, 3, '#3d7a3a');
        PX.rect(ctx, wx + 8, top + 64, 3, 4, '#f5a0c0');
        PX.rect(ctx, wx + 17, top + 65, 4, 3, '#3d7a3a');
      }
    }
    // doorstep glow
    PX.rect(ctx, left + 2 * T - 14, top + H - 3, 28, 2, rgba(p.accent, .35));
  }

  function drawTree(ctx, o) {
    const cx = o.x * T + 16, by = o.y * T + 31;
    const big = o.type === 'old_tree';
    const scale = big ? 1.5 : 1;
    shadow(ctx, cx, by - 1, 15 * scale, 5 * scale, .3);
    // trunk
    PX.rect(ctx, cx - 4, by - 16, 8, 16, '#4a2e20');
    PX.rect(ctx, cx - 3, by - 16, 5, 14, '#6a442c');
    PX.rect(ctx, cx - 2, by - 15, 2, 9, '#8a5e3c');
    PX.rect(ctx, cx - 6, by - 2, 12, 3, '#3a2418');
    if (big) {
      PX.line(ctx, cx - 3, by - 12, cx - 12, by - 24, '#4a2e20', 4);
      PX.line(ctx, cx + 3, by - 13, cx + 12, by - 26, '#4a2e20', 4);
    }
    // canopy clusters
    const clusters = big
      ? [[0, -36, 20, 15], [-16, -26, 14, 12], [16, -27, 15, 12], [-8, -44, 13, 10], [10, -44, 12, 10], [0, -22, 17, 11]]
      : [[0, -27, 15, 13], [-9, -20, 11, 9], [9, -20, 11, 9], [0, -34, 11, 8]];
    for (const [dx, dy, rx, ry] of clusters) PX.ell(ctx, cx + dx, by + dy, rx + 2, ry + 2, '#0f3024');
    for (const [dx, dy, rx, ry] of clusters) PX.ell(ctx, cx + dx, by + dy, rx, ry, '#185039');
    // light tops
    for (const [dx, dy, rx, ry] of clusters) {
      PX.ell(ctx, cx + dx - 2, by + dy - 3, rx * .62, ry * .5, '#256b48');
      PX.ell(ctx, cx + dx - 4, by + dy - 5, rx * .34, ry * .26, '#3a8a59');
    }
    // leaf speckles
    for (let i = 0; i < 12; i++) {
      const r = seeded(o.x * 13 + i, o.y * 7, i * 91);
      const px = cx - 18 + r() * 36, py = by - (big ? 46 : 34) + r() * (big ? 34 : 26);
      PX.rect(ctx, px, py, 1, 1, i % 3 ? '#3f9a63' : '#7ac08a');
    }
  }

  function drawSign(ctx, o) {
    const x = o.x * T, y = o.y * T;
    shadow(ctx, x + 16, y + 30, 10, 3, .28);
    PX.rect(ctx, x + 14, y + 17, 5, 14, '#5a3a24');
    PX.rect(ctx, x + 15, y + 17, 2, 12, '#7a5234');
    PX.rect(ctx, x + 3, y + 7, 26, 15, '#5a3a24');
    PX.rect(ctx, x + 4, y + 8, 24, 13, '#c69a5c');
    PX.rect(ctx, x + 4, y + 8, 24, 3, '#e2bd82');
    PX.rect(ctx, x + 7, y + 13, 9, 1, '#7a5234');
    PX.rect(ctx, x + 7, y + 16, 14, 1, '#7a5234');
    PX.rect(ctx, x + 20, y + 12, 6, 4, '#8a5a34');
    PX.rect(ctx, x + 22, y + 13, 2, 2, '#e2bd82');
  }

  function drawFountain(ctx, o) {
    const cx = o.x * T + 16, cy = o.y * T + 18;
    shadow(ctx, cx, o.y * T + 29, 15, 5, .3);
    PX.ell(ctx, cx, cy + 5, 16, 8, '#3a4d60');
    PX.ell(ctx, cx, cy + 4, 14, 6, '#9bb7c8');
    PX.ell(ctx, cx, cy + 3, 11, 4, '#2c7fa0');
    PX.ell(ctx, cx - 2, cy + 2, 7, 2, '#4db6d6');
    PX.rect(ctx, cx - 2, cy - 13, 4, 15, '#b8ccd8');
    PX.rect(ctx, cx - 1, cy - 13, 2, 12, '#e0f0f8');
    PX.ell(ctx, cx, cy - 13, 6, 3, '#d8ecf4');
    PX.ell(ctx, cx, cy - 13, 4, 2, '#8fe6ff');
    PX.rect(ctx, cx - 1, cy - 24, 2, 9, 'rgba(160,235,255,.65)');
    PX.rect(ctx, cx - 5, cy - 20, 2, 2, 'rgba(160,235,255,.5)');
    PX.rect(ctx, cx + 4, cy - 19, 2, 2, 'rgba(160,235,255,.5)');
    // rim sparkle
    PX.rect(ctx, cx - 12, cy + 5, 4, 1, '#e8fbff');
    PX.rect(ctx, cx + 8, cy + 6, 3, 1, '#c8f4ff');
  }

  function drawCrystal(ctx, o) {
    const cx = o.x * T + 16, by = o.y * T + 26;
    shadow(ctx, cx, by + 3, 12, 4, .3);
    const shards = [[0, -18, 8, 18], [-10, -9, 6, 11], [10, -11, 6, 13]];
    for (const [dx, h, w, len] of shards) {
      PX.tri(ctx, cx + dx, by - len - 4, cx + dx - w, by, cx + dx + w, by, '#2f2350');
      PX.tri(ctx, cx + dx, by - len - 2, cx + dx - w + 1, by - 1, cx + dx + w - 1, by - 1, '#7a5cc8');
      PX.tri(ctx, cx + dx, by - len - 2, cx + dx - 2, by - 1, cx + dx + 1, by - 1, '#c9b4ff');
      PX.rect(ctx, cx + dx - 1, by - len, 2, len - 2, rgba('#8de0ff', .55));
    }
    // glow base
    PX.ell(ctx, cx, by - 1, 14, 4, rgba('#9b7bff', .35));
    PX.rect(ctx, cx - 2, by - 8, 2, 2, '#f4ecff');
  }

  function drawLantern(ctx, o) {
    const cx = o.x * T + 16, by = o.y * T + 30;
    shadow(ctx, cx, by, 7, 2, .3);
    PX.rect(ctx, cx - 2, by - 18, 4, 18, '#3a2830');
    PX.rect(ctx, cx - 1, by - 18, 1, 16, '#5a3e44');
    PX.rect(ctx, cx - 6, by - 4, 12, 3, '#2a1c24');
    PX.rect(ctx, cx - 6, by - 27, 12, 10, '#2a1c24');
    PX.rect(ctx, cx - 5, by - 26, 10, 8, '#ffcf6e');
    PX.rect(ctx, cx - 4, by - 25, 3, 5, '#fff0b0');
    PX.rect(ctx, cx - 6, by - 29, 12, 3, '#3a2830');
    PX.rect(ctx, cx - 1, by - 31, 2, 2, '#5a3e44');
    PX.rect(ctx, cx - 5, by - 17, 10, 2, '#3a2830');
    PX.ell(ctx, cx, by - 22, 12, 9, rgba('#ffb84d', .16));
  }

  function drawGlowMushroom(ctx, o) {
    const cx = o.x * T + 16, by = o.y * T + 28;
    shadow(ctx, cx, by + 2, 9, 3, .25);
    for (let i = 0; i < 3; i++) {
      const dx = (i - 1) * 8, h = 7 + i * 3;
      PX.rect(ctx, cx + dx - 1, by - h, 3, h, '#c8d8e8');
      PX.ell(ctx, cx + dx, by - h - 2, 6 - i, 4, '#2f4a7a');
      PX.ell(ctx, cx + dx - 1, by - h - 3, 4 - i, 2, '#7ce8ff');
      PX.rect(ctx, cx + dx - 2, by - h - 4, 2, 1, '#d8feff');
    }
    PX.ell(ctx, cx, by - 6, 15, 6, rgba('#7ce8ff', .10));
  }

  function drawHealingStation(ctx, o) {
    const x = o.x * T, y = o.y * T;
    shadow(ctx, x + 16, y + 29, 13, 4, .3);
    PX.rect(ctx, x + 5, y + 10, 22, 19, '#3a2036');
    PX.rect(ctx, x + 6, y + 11, 20, 17, '#e8e4f0');
    PX.rect(ctx, x + 6, y + 11, 20, 4, '#ffffff');
    PX.rect(ctx, x + 8, y + 16, 16, 10, '#5a3a56');
    PX.ell(ctx, x + 16, y + 20, 6, 5, '#ff9eb0');
    PX.rect(ctx, x + 15, y + 17, 2, 7, '#fff0f4');
    PX.rect(ctx, x + 12, y + 19, 8, 2, '#fff0f4');
    PX.rect(ctx, x + 7, y + 27, 18, 3, '#c8c2d8');
    PX.ell(ctx, x + 16, y + 16, 11, 6, rgba('#ff8aa0', .18));
  }

  function drawAltar(ctx, o) {
    const cx = o.x * T + 16, by = o.y * T + 30, kind = o.type;
    const colors = kind === 'soul_altar' ? ['#2a2440', '#6b5aa0', '#f5c542', '#fff1b0']
      : kind === 'relic_altar' ? ['#1f2a3c', '#4f6a8a', '#7ce8ff', '#e6ffff']
      : ['#2a2440', '#5a5080', '#c9a0ff', '#f4ecff'];
    shadow(ctx, cx, by, 15, 5, .32);
    PX.rect(ctx, cx - 16, by - 7, 32, 8, colors[0]);
    PX.rect(ctx, cx - 14, by - 10, 28, 5, colors[1]);
    PX.rect(ctx, cx - 14, by - 10, 28, 1, colors[3]);
    PX.rect(ctx, cx - 5, by - 24, 10, 15, colors[1]);
    PX.rect(ctx, cx - 4, by - 24, 3, 14, colors[3]);
    PX.ell(ctx, cx, by - 27, 7, 5, colors[2]);
    PX.ell(ctx, cx - 1, by - 28, 4, 2, colors[3]);
    PX.ell(ctx, cx, by - 27, 13, 8, rgba(colors[2], .18));
    PX.rect(ctx, cx - 13, by - 14, 2, 2, rgba(colors[2], .7));
    PX.rect(ctx, cx + 11, by - 14, 2, 2, rgba(colors[2], .7));
  }

  function drawArch(ctx, o) {
    const x = o.x * T, y = o.y * T;
    const wide = (o.width || 1) * T, tall = 64;
    const cx = x + wide / 2;
    shadow(ctx, cx, y + 30, wide * .5, 6, .3);
    if (o.type === 'obsidian_gate') {
      PX.rect(ctx, x + 4, y - 28, 8, 58, '#181428');
      PX.rect(ctx, x + wide - 12, y - 28, 8, 58, '#181428');
      PX.rect(ctx, x + 2, y - 34, wide - 4, 10, '#241c40');
      PX.rect(ctx, x + 6, y - 32, wide - 12, 3, '#4a3a78');
      PX.ell(ctx, cx, y - 14, 10, 8, '#9b7bff');
      PX.ell(ctx, cx, y - 14, 6, 5, '#e0d4ff');
      PX.rect(ctx, x + 8, y - 22, 3, 3, '#c9b4ff');
      PX.rect(ctx, x + wide - 11, y - 22, 3, 3, '#c9b4ff');
    } else if (o.type === 'victory_arch') {
      PX.rect(ctx, x + 2, y - 36, 9, 66, '#c8ccd8');
      PX.rect(ctx, x + wide - 11, y - 36, 9, 66, '#c8ccd8');
      PX.rect(ctx, x + 3, y - 36, 3, 64, '#eef2f8');
      PX.rect(ctx, x + wide - 10, y - 36, 3, 64, '#eef2f8');
      PX.rect(ctx, x, y - 42, wide, 8, '#f5c542');
      PX.rect(ctx, x + 4, y - 41, wide - 8, 2, '#fff2b8');
      PX.rect(ctx, x + 2, y - 30, wide - 4, 4, '#f5c542');
      PX.ell(ctx, cx, y - 34, 7, 7, '#fff2b8');
      PX.rect(ctx, cx - 1, y - 40, 2, 12, '#8a6a10');
    } else {
      PX.rect(ctx, x + 3, y - 30, 8, 60, '#5a5864');
      PX.rect(ctx, x + wide - 11, y - 30, 8, 60, '#5a5864');
      PX.rect(ctx, x, y - 36, wide, 8, '#706c7c');
      PX.rect(ctx, x + 3, y - 35, wide - 6, 2, '#8b8599');
      PX.rect(ctx, cx - 2, y - 26, 4, 4, '#7ce8ff');
      PX.rect(ctx, x + 5, y - 20, 2, 12, rgba('#7ce8ff', .5));
      PX.rect(ctx, x + wide - 7, y - 20, 2, 12, rgba('#7ce8ff', .5));
    }
    PX.rect(ctx, x + 5, y + 24, wide - 10, 4, 'rgba(4,6,16,.3)');
  }

  function drawShrine(ctx, o) {
    const cx = o.x * T + 16, by = o.y * T + 30;
    shadow(ctx, cx, by, 17, 5, .3);
    PX.rect(ctx, cx - 17, by - 5, 34, 6, '#3a2f3a');
    PX.rect(ctx, cx - 14, by - 7, 28, 3, '#5a4a58');
    // torii-like shrine
    PX.rect(ctx, cx - 15, by - 30, 5, 23, '#7a3a3a');
    PX.rect(ctx, cx + 10, by - 30, 5, 23, '#7a3a3a');
    PX.rect(ctx, cx - 18, by - 34, 36, 5, '#8a4444');
    PX.rect(ctx, cx - 18, by - 34, 36, 1, '#c06a60');
    PX.rect(ctx, cx - 13, by - 27, 26, 3, '#6a3038');
    PX.rect(ctx, cx - 8, by - 23, 16, 12, '#4a2f3a');
    PX.ell(ctx, cx, by - 18, 5, 4, '#7ce8ff');
    PX.ell(ctx, cx, by - 18, 3, 2, '#e8ffff');
    PX.ell(ctx, cx, by - 18, 11, 7, rgba('#7ce8ff', .16));
  }

  function drawFlowerBed(ctx, o) {
    const x = o.x * T, y = o.y * T;
    PX.rect(ctx, x + 3, y + 14, 26, 15, '#7a5234');
    PX.rect(ctx, x + 4, y + 15, 24, 13, '#5a3a24');
    PX.rect(ctx, x + 5, y + 17, 22, 10, '#3d6a3a');
    const cols = ['#f7a8c8', '#ffd875', '#e9f2ff', '#c9a0ff', '#ff9a76'];
    for (let i = 0; i < 9; i++) {
      const r = seeded(o.x * 9 + i, o.y * 4, i * 33);
      const fx = x + 7 + r() * 18, fy = y + 16 + r() * 10;
      PX.rect(ctx, fx, fy + 2, 1, 4, '#2c5a30');
      PX.rect(ctx, fx - 1, fy, 3, 2, cols[i % cols.length]);
      PX.rect(ctx, fx, fy - 1, 1, 4, cols[i % cols.length]);
    }
    PX.rect(ctx, x + 3, y + 28, 26, 2, '#8a5e3c');
  }

  function drawStall(ctx, o) {
    const x = o.x * T, y = o.y * T;
    shadow(ctx, x + 16, y + 29, 15, 4, .3);
    PX.rect(ctx, x + 4, y + 15, 24, 14, '#8a5a34');
    PX.rect(ctx, x + 5, y + 16, 22, 5, '#b07a44');
    PX.rect(ctx, x + 2, y + 7, 28, 4, '#5a3428');
    for (let i = 0; i < 4; i++) PX.rect(ctx, x + 2 + i * 7, y + 2, 7, 6, i % 2 ? '#f5c542' : '#c94f4f');
    PX.rect(ctx, x + 2, y + 2, 28, 2, '#ffe9a8');
    PX.rect(ctx, x + 4, y + 8, 2, 20, '#5a3428');
    PX.rect(ctx, x + 26, y + 8, 2, 20, '#5a3428');
    PX.rect(ctx, x + 8, y + 12, 5, 4, '#d96a4f');
    PX.rect(ctx, x + 15, y + 12, 4, 4, '#7ac06a');
    PX.rect(ctx, x + 21, y + 12, 4, 4, '#f5c542');
  }

  function drawPalm(ctx, o) {
    const cx = o.x * T + 16, by = o.y * T + 30;
    shadow(ctx, cx, by, 12, 4, .3);
    PX.line(ctx, cx, by, cx + 5, by - 20, '#6a4828', 6);
    PX.line(ctx, cx + 1, by - 1, cx + 5, by - 20, '#8a6238', 3);
    for (let i = 0; i < 5; i++) {
      const a = -Math.PI / 2 + (i - 2) * .62;
      const ex = cx + 5 + Math.cos(a) * 17, ey = by - 22 + Math.sin(a) * 9;
      PX.line(ctx, cx + 5, by - 20, ex, ey, '#2c6a3a', 5);
      PX.line(ctx, cx + 5, by - 21, ex, ey - 1, '#4a9a52', 2);
    }
    PX.ell(ctx, cx + 5, by - 22, 4, 3, '#8a5a2a');
    PX.rect(ctx, cx + 3, by - 24, 2, 2, '#c98a3a');
  }

  function drawSandstone(ctx, o) {
    const cx = o.x * T + 16, by = o.y * T + 28;
    shadow(ctx, cx, by + 1, 14, 4, .3);
    PX.ell(ctx, cx - 4, by - 6, 11, 8, '#9a6a38');
    PX.ell(ctx, cx - 4, by - 7, 10, 7, '#c48a4a');
    PX.ell(ctx, cx - 6, by - 10, 6, 3, '#e2b070');
    PX.ell(ctx, cx + 6, by - 2, 8, 6, '#8a5a30');
    PX.ell(ctx, cx + 6, by - 3, 7, 5, '#b87a42');
    PX.rect(ctx, cx - 13, by + 2, 26, 2, 'rgba(80,50,20,.35)');
  }

  function drawRuinColumn(ctx, o) {
    const cx = o.x * T + 16, by = o.y * T + 30;
    shadow(ctx, cx, by, 10, 3, .3);
    PX.rect(ctx, cx - 9, by - 7, 18, 7, '#3e3a48');
    PX.rect(ctx, cx - 8, by - 9, 16, 3, '#5a5664');
    PX.rect(ctx, cx - 6, by - 26, 12, 18, '#4a4654');
    PX.rect(ctx, cx - 5, by - 26, 3, 17, '#6a6474');
    for (let i = 0; i < 3; i++) PX.rect(ctx, cx - 6 + i * 5, by - 26, 1, 18, '#35323e');
    PX.rect(ctx, cx - 7, by - 28, 14, 3, '#5a5664');
    PX.rect(ctx, cx - 7, by - 28, 14, 1, '#7c7688');
    PX.rect(ctx, cx - 2, by - 22, 4, 1, '#7ce8ff');
    PX.rect(ctx, cx - 2, by - 18, 4, 1, rgba('#7ce8ff', .5));
  }

  function drawSummit(ctx, o) {
    const x = o.x * T, y = o.y * T;
    shadow(ctx, x + 16, y + 30, 18, 5, .3);
    PX.tri(ctx, x + 16, y - 34, x - 6, y + 30, x + 38, y + 30, '#59606e');
    PX.tri(ctx, x + 16, y - 32, x + 2, y + 12, x + 30, y + 12, '#79828e');
    PX.tri(ctx, x + 16, y - 34, x + 7, y - 8, x + 25, y - 8, '#e8f6fc');
    PX.tri(ctx, x + 16, y - 34, x + 12, y - 20, x + 20, y - 20, '#ffffff');
    PX.rect(ctx, x + 2, y + 26, 28, 4, '#4a505c');
    PX.rect(ctx, x + 11, y - 26, 2, 6, 'rgba(126,232,255,.5)');
  }

  function drawCliff(ctx, o) {
    const x = o.x * T, y = o.y * T;
    PX.rect(ctx, x, y + 2, T, 30, '#3e4858');
    PX.rect(ctx, x + 1, y + 3, T - 2, 28, '#525d6e');
    PX.rect(ctx, x + 2, y + 4, T - 4, 3, '#7f8da1');
    PX.rect(ctx, x + 2, y + 20, T - 4, 2, '#3e4858');
    PX.rect(ctx, x + 6, y + 9, 2, 10, '#3e4858');
    PX.rect(ctx, x + 20, y + 12, 2, 8, '#3e4858');
  }

  function drawHedge(ctx, o) {
    const wide = (o.width || 1) * T, x = o.x * T, y = o.y * T;
    shadow(ctx, x + wide / 2, y + 29, wide * .48, 4, .28);
    for (let i = 0; i < wide; i += 16) {
      PX.ell(ctx, x + i + 8, y + 18, 10, 11, '#1e4a30');
      PX.ell(ctx, x + i + 8, y + 17, 8, 9, '#2f6a42');
      PX.ell(ctx, x + i + 6, y + 13, 4, 3, '#4a8a56');
    }
    PX.rect(ctx, x, y + 27, wide, 3, 'rgba(4,8,16,.25)');
  }

  function drawDesk(ctx, o) {
    const x = o.x * T, y = o.y * T;
    shadow(ctx, x + 16, y + 29, 14, 3, .28);
    PX.rect(ctx, x + 3, y + 12, 26, 5, '#8a5a38');
    PX.rect(ctx, x + 3, y + 12, 26, 1, '#b07a4c');
    PX.rect(ctx, x + 5, y + 17, 4, 13, '#6a442c');
    PX.rect(ctx, x + 23, y + 17, 4, 13, '#6a442c');
    PX.rect(ctx, x + 9, y + 8, 12, 4, '#e8e4d8');
    PX.rect(ctx, x + 10, y + 9, 4, 1, '#9a9a9a');
    PX.rect(ctx, x + 15, y + 9, 4, 1, '#9a9a9a');
    PX.rect(ctx, x + 20, y + 6, 5, 5, '#4a6a8a');
  }

  function drawBookshelf(ctx, o) {
    const x = o.x * T, y = o.y * T;
    shadow(ctx, x + 16, y + 29, 14, 3, .28);
    PX.rect(ctx, x + 4, y + 2, 24, 28, '#4a2e20');
    PX.rect(ctx, x + 5, y + 3, 22, 26, '#6a442c');
    for (let s = 0; s < 3; s++) {
      PX.rect(ctx, x + 6, y + 6 + s * 8, 20, 6, '#3a2418');
      for (let i = 0; i < 5; i++) {
        const c = ['#b84a4a', '#4a7ab8', '#e0b84a', '#4aa06a', '#9a5ab8'][(s * 5 + i) % 5];
        PX.rect(ctx, x + 7 + i * 4, y + 6 + s * 8, 3, 5, c);
      }
    }
    PX.rect(ctx, x + 4, y + 2, 24, 2, '#8a5e3c');
  }

  function drawLighthouse(ctx, o) {
    const cx = o.x * T + 16, by = o.y * T + 30;
    shadow(ctx, cx, by, 15, 4, .3);
    // tower
    PX.tri(ctx, cx - 11, by, cx - 7, by - 52, cx + 7, by - 52, '#6a6a78');
    PX.tri(ctx, cx - 9, by, cx + 7, by - 52, cx + 9, by, '#8a8a98');
    PX.rect(ctx, cx - 7, by - 52, 14, 3, '#4a4a58');
    // stripes
    PX.rect(ctx, cx - 8, by - 30, 14, 4, '#c84a4a');
    PX.rect(ctx, cx - 7, by - 16, 13, 4, '#c84a4a');
    // lamp room
    PX.rect(ctx, cx - 8, by - 66, 16, 14, '#3a3a48');
    PX.rect(ctx, cx - 6, by - 64, 12, 10, '#ffe9a0');
    PX.rect(ctx, cx - 5, by - 63, 4, 6, '#fffbe0');
    PX.tri(ctx, cx - 10, by - 66, cx, by - 78, cx + 10, by - 66, '#4a4a58');
    PX.rect(ctx, cx - 1, by - 80, 2, 4, '#8a8a98');
    // windows/door
    PX.rect(ctx, cx - 2, by - 10, 4, 8, '#3a2a24');
    PX.ell(ctx, cx, by - 58, 16, 12, rgba('#ffe9a0', .12));
  }

  function drawProp(ctx, o, map) {
    switch (o.type) {
      case 'tree': case 'old_tree': drawTree(ctx, o); break;
      case 'sign': drawSign(ctx, o); break;
      case 'fountain': drawFountain(ctx, o); break;
      case 'crystal': drawCrystal(ctx, o); break;
      case 'glow_mushroom': drawGlowMushroom(ctx, o); break;
      case 'lantern': drawLantern(ctx, o); break;
      case 'healing_station': drawHealingStation(ctx, o); break;
      case 'relic_altar': case 'soul_altar': drawAltar(ctx, o); break;
      case 'obsidian_gate': case 'victory_arch': case 'ancient_gate': drawArch(ctx, o); break;
      case 'shrine': drawShrine(ctx, o); break;
      case 'flower_bed': drawFlowerBed(ctx, o); break;
      case 'market_stall': drawStall(ctx, o); break;
      case 'palm': drawPalm(ctx, o); break;
      case 'sandstone': drawSandstone(ctx, o); break;
      case 'ruin_column': drawRuinColumn(ctx, o); break;
      case 'summit_peak': drawSummit(ctx, o); break;
      case 'cliff': drawCliff(ctx, o); break;
      case 'hedge': drawHedge(ctx, o); break;
      case 'desk': drawDesk(ctx, o); break;
      case 'bookshelf': drawBookshelf(ctx, o); break;
      case 'lighthouse': drawLighthouse(ctx, o); break;
      case 'house': case 'lab': case 'shop': case 'pokecenter': case 'gym': case 'league_hall': drawBuilding(ctx, o); break;
      default: {
        const x = o.x * T, y = o.y * T;
        shadow(ctx, x + 16, y + 29, 11, 3, .28);
        PX.rect(ctx, x + 6, y + 10, 20, 20, '#4a3a34');
        PX.rect(ctx, x + 7, y + 11, 18, 18, '#7a5a44');
        PX.rect(ctx, x + 9, y + 13, 14, 2, '#9a7a5c');
        PX.rect(ctx, x + 9, y + 20, 14, 1, '#5a3e2e');
      }
    }
  }

  Art.drawProp = drawProp;
  Art.drawBuilding = drawBuilding;
  Art.drawTree = drawTree;
})();

/* ============================================================
   POKÉMON ECLIPSE — art engine (characters + atmosphere)
   ============================================================ */
'use strict';

(function () {
  const T = 32;
  const rgba = Art.rgba;
  const seeded = Art.seeded;

  function shadow(ctx, cx, cy, rx, ry, a = .28) {
    ctx.save();
    ctx.fillStyle = `rgba(4,8,16,${a})`;
    ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  /* ------------------------------------------------ character styles */
  const SKINS = ['#f4ceaa', '#e0ae82', '#c68a5c', '#a76a44', '#86502f', '#f8dcc2'];
  const HAIRS = ['#2a1a16', '#4a2c1e', '#7a4a24', '#c07a2e', '#e8e2d8', '#6b4aa0', '#2f5a7a', '#b84a5a'];
  const SHIRTS = ['#3a9ab8', '#c9573f', '#4a7a4a', '#8a5ab8', '#c9a13a', '#4a5f9a', '#b84a7a', '#3a7a6a'];
  const PANTS = ['#2d3550', '#3a2a2a', '#294a3a', '#40304a', '#3a3a44', '#24405a'];
  const SHOES = ['#20202c', '#3a2a22', '#2a2a3a', '#4a3028'];

  function styleFor(id, opts = {}) {
    if (opts.player) {
      return {
        skin: '#f4ceaa', hair: '#5a3520', shirt: '#3ea8c4', pants: '#293552', shoe: '#1c2130',
        accent: '#f5c542', hat: true, hatColor: '#f5c542', hairdo: 1, trainer: true, scarf: '#e85a6a'
      };
    }
    const h = Art.hashStr(id || 'npc') >>> 0;
    const pick = (arr, salt) => arr[((h >>> salt) + salt * 7) % arr.length];
    return {
      skin: pick(SKINS, 3), hair: pick(HAIRS, 7), shirt: pick(SHIRTS, 11), pants: pick(PANTS, 15),
      shoe: pick(SHOES, 19), accent: pick(HAIRS, 23), hairdo: h % 3,
      hat: opts.trainer && (h % 3 === 0), hatColor: pick(SHIRTS, 27),
      trainer: !!opts.trainer, scarf: opts.trainer ? pick(SHIRTS, 5) : null
    };
  }

  function drawCharacter(ctx, style, px, py, facing = 'down', phase = 1, time = 0) {
    const cx = Math.round(px + 16);
    const bottom = Math.round(py + 31);
    const moving = phase < 1;
    const bob = moving ? Math.round(Math.sin(phase * Math.PI) * 2) : (Math.sin(time * 2.2 + cx * .12) > .7 ? 1 : 0);
    const base = bottom - bob;
    const stride = moving ? Math.round(Math.sin(phase * Math.PI) * 3) : 0;
    const side = facing === 'left' || facing === 'right';
    const flip = facing === 'left';

    shadow(ctx, cx, bottom + 1, 9, 3.2, .3);

    // legs
    const legY = base - 11;
    PX.rect(ctx, cx - 6, legY, 5, 10 + (side ? stride : 0), style.pants);
    PX.rect(ctx, cx + 1, legY, 5, 10 - (side ? stride : 0), style.pants);
    PX.rect(ctx, cx - 6, legY + 10 + (side ? stride : 0), 5, 2, style.shoe);
    PX.rect(ctx, cx + 1, legY + 10 - (side ? stride : 0), 5, 2, style.shoe);
    if (!side) {
      PX.rect(ctx, cx - 5, legY + 5, 1, 4, rgba('#000000', .12));
      PX.rect(ctx, cx + 2, legY + 5, 1, 4, rgba('#000000', .12));
    }

    // torso with outline
    const ty = base - 22;
    PX.rect(ctx, cx - 7, ty - 1, 14, 13, 'rgba(12,12,22,.75)');
    PX.rect(ctx, cx - 6, ty, 12, 11, style.shirt);
    PX.rect(ctx, cx - 6, ty, 12, 2, rgba('#ffffff', .18));
    PX.rect(ctx, cx - 6, ty + 8, 12, 3, rgba('#000000', .14));
    // arms
    const armSwing = moving ? Math.round(Math.sin(phase * Math.PI) * 2) : 0;
    PX.rect(ctx, cx - 8, ty + 2, 2, 8 + armSwing, style.shirt);
    PX.rect(ctx, cx + 6, ty + 2, 2, 8 - armSwing, style.shirt);
    PX.rect(ctx, cx - 8, ty + 9 + armSwing, 2, 2, style.skin);
    PX.rect(ctx, cx + 6, ty + 9 - armSwing, 2, 2, style.skin);
    if (style.scarf) {
      PX.rect(ctx, cx - 6, ty, 12, 2, style.scarf);
      PX.rect(ctx, cx - 6, ty + 2, 3, 4, style.scarf);
    }

    // head
    const hy = base - 31;
    PX.rect(ctx, cx - 6, hy - 1, 12, 11, 'rgba(12,12,22,.75)');
    PX.rect(ctx, cx - 5, hy, 10, 9, style.skin);
    // ears
    PX.rect(ctx, cx - 6, hy + 3, 1, 3, style.skin);
    PX.rect(ctx, cx + 5, hy + 3, 1, 3, style.skin);

    if (facing === 'up') {
      // back of head
      PX.rect(ctx, cx - 5, hy, 10, 7, style.hair);
      PX.rect(ctx, cx - 5, hy + 5, 10, 3, style.hair);
      if (style.hairdo === 1) PX.rect(ctx, cx - 2, hy + 7, 4, 2, style.hair);
      if (style.hairdo === 2) { PX.rect(ctx, cx - 5, hy + 6, 3, 3, style.hair); PX.rect(ctx, cx + 2, hy + 6, 3, 3, style.hair); }
    } else if (side) {
      // profile
      PX.rect(ctx, cx - 5, hy, 10, 3, style.hair);
      if (flip) {
        PX.rect(ctx, cx + 1, hy + 1, 4, 8, style.hair);
        PX.rect(ctx, cx - 3, hy + 4, 1, 2, '#241a20');
        PX.rect(ctx, cx - 5, hy + 6, 2, 1, rgba('#a06050', .5));
      } else {
        PX.rect(ctx, cx - 5, hy + 1, 4, 8, style.hair);
        PX.rect(ctx, cx + 2, hy + 4, 1, 2, '#241a20');
        PX.rect(ctx, cx + 3, hy + 6, 2, 1, rgba('#a06050', .5));
      }
      PX.rect(ctx, cx - 5, hy, 10, 1, style.hair);
    } else {
      // facing down
      PX.rect(ctx, cx - 5, hy, 10, 3, style.hair);
      PX.rect(ctx, cx - 5, hy, 2, 5, style.hair);
      PX.rect(ctx, cx + 3, hy, 2, 5, style.hair);
      if (style.hairdo === 1) PX.rect(ctx, cx - 5, hy + 3, 3, 2, style.hair);
      if (style.hairdo === 2) { PX.rect(ctx, cx - 5, hy + 3, 2, 3, style.hair); PX.rect(ctx, cx + 3, hy + 3, 2, 3, style.hair); }
      PX.rect(ctx, cx - 3, hy + 4, 1, 2, '#241a20');
      PX.rect(ctx, cx + 2, hy + 4, 1, 2, '#241a20');
      PX.rect(ctx, cx - 1, hy + 7, 3, 1, rgba('#8a4a44', .55));
      PX.rect(ctx, cx - 4, hy + 6, 1, 1, rgba('#e88a8a', .45));
      PX.rect(ctx, cx + 3, hy + 6, 1, 1, rgba('#e88a8a', .45));
    }

    // hat
    if (style.hat) {
      const hc = style.hatColor || '#f5c542';
      PX.rect(ctx, cx - 6, hy - 2, 12, 3, hc);
      PX.rect(ctx, cx - 4, hy - 4, 8, 3, hc);
      PX.rect(ctx, cx - 6, hy - 1, 12, 1, rgba('#ffffff', .35));
      PX.rect(ctx, cx - 6, hy + 1, 12, 1, rgba('#000000', .25));
      if (facing === 'down') PX.rect(ctx, cx - 7, hy + 1, 6, 1, hc);
      if (facing === 'left') PX.rect(ctx, cx - 7, hy + 1, 8, 1, hc);
      if (facing === 'right') PX.rect(ctx, cx + 2, hy + 1, 8, 1, hc);
    }

    // trainer marker
    if (style.trainer && !style.hat) {
      PX.rect(ctx, cx + 4, ty + 1, 2, 2, style.accent);
    }
  }

  /* ------------------------------------------------ atmosphere */
  const PROFILES = {
    town:    { tint:'#332a62', alpha:.10, vig:.44, particles:'firefly', sun:'#ffd9a0', sunA:.10 },
    route:   { tint:'#2a4a7a', alpha:.05, vig:.36, particles:'pollen',  sun:'#ffe6a8', sunA:.12 },
    forest:  { tint:'#12223e', alpha:.23, vig:.52, particles:'firefly', sun:'#9ad8a0', sunA:.08 },
    cave:    { tint:'#070b20', alpha:.38, vig:.60, particles:'spore',   sun:null, sunA:0 },
    sand:    { tint:'#7a3e12', alpha:.12, vig:.42, particles:'dust',    sun:'#ffcf70', sunA:.18 },
    snow:    { tint:'#3f5f96', alpha:.16, vig:.44, particles:'snow',    sun:'#cfe8ff', sunA:.10 },
    paradox: { tint:'#230c40', alpha:.32, vig:.58, particles:'ember',   sun:'#a070ff', sunA:.08 },
    league:  { tint:'#2a3c78', alpha:.17, vig:.48, particles:'snow',    sun:'#a8c8ff', sunA:.10 },
    summit:  { tint:'#3a5a9a', alpha:.18, vig:.48, particles:'snow',    sun:'#d8ecff', sunA:.14 },
    gym:     { tint:'#1c1238', alpha:.18, vig:.48, particles:'mote',    sun:'#ffd9a0', sunA:.05 },
    indoor:  { tint:'#2a1c18', alpha:.06, vig:.52, particles:'mote',    sun:'#ffd9a0', sunA:.05 }
  };

  function profileFor(map) {
    if (!map) return PROFILES.route;
    if (map.id === 'clinic' || map.id === 'cedar_lab') return PROFILES.indoor;
    if (map.id === 'bramble_gym') return PROFILES.gym;
    return PROFILES[map.theme] || PROFILES.route;
  }

  function createParticles(map) {
    const prof = profileFor(map);
    const kind = prof.particles;
    const w = (map.width || 30) * T, h = (map.height || 22) * T;
    const r = seeded(hash(map.id), 7, 31);
    const count = kind === 'snow' ? 78 : kind === 'firefly' ? 26 : kind === 'ember' ? 34 : 46;
    const arr = [];
    for (let i = 0; i < count; i++) {
      const x = r() * w, y = r() * h;
      if (kind === 'firefly') arr.push({ x, y, vx: (r() - .5) * .16, vy: -.05 - r() * .12, ph: r() * 6.28, size: 1 + (r() > .6 ? 1 : 0), kind, color: r() > .3 ? '#ffe9a0' : '#8fffe0' });
      else if (kind === 'snow') arr.push({ x, y, vx: -.25 - r() * .25, vy: .28 + r() * .4, ph: r() * 6.28, size: r() > .75 ? 2 : 1, kind, color: '#f4fdff' });
      else if (kind === 'dust') arr.push({ x, y, vx: .5 + r() * .7, vy: -.03 + r() * .08, ph: r() * 6.28, size: 1, kind, color: '#ffe6b0' });
      else if (kind === 'ember') arr.push({ x, y, vx: (r() - .5) * .2, vy: -.35 - r() * .4, ph: r() * 6.28, size: r() > .55 ? 2 : 1, kind, color: r() > .5 ? '#c9a0ff' : '#ffb070' });
      else if (kind === 'spore') arr.push({ x, y, vx: (r() - .5) * .12, vy: -.06 - r() * .1, ph: r() * 6.28, size: r() > .7 ? 2 : 1, kind, color: r() > .5 ? '#7ce8ff' : '#8fffc8' });
      else if (kind === 'mote') arr.push({ x, y, vx: (r() - .5) * .1, vy: -.04 - r() * .06, ph: r() * 6.28, size: 1, kind, color: '#ffe9b8' });
      else arr.push({ x, y, vx: (r() - .5) * .18, vy: -.08 - r() * .08, ph: r() * 6.28, size: r() > .7 ? 2 : 1, kind, color: '#fff0c0' });
    }
    return arr;
  }

  function hash(x) { return Art.hashStr(String(x)); }

  function updateParticles(particles, dt, map) {
    const w = (map.width || 30) * T, h = (map.height || 22) * T;
    for (const p of particles) {
      p.x += p.vx * dt * .06;
      p.y += p.vy * dt * .06;
      p.ph += dt * .0022;
      if (p.kind === 'firefly') {
        p.vx += Math.sin(p.ph * 1.7) * .0015;
        p.vy += Math.cos(p.ph * 1.3) * .0012;
        p.vx = Math.max(-.35, Math.min(.35, p.vx));
        p.vy = Math.max(-.3, Math.min(.2, p.vy));
      }
      if (p.y < -6) { p.y = h + 4; p.x = Math.random() * w; }
      if (p.y > h + 6) { p.y = -4; p.x = Math.random() * w; }
      if (p.x < -6) p.x = w + 4;
      if (p.x > w + 6) p.x = -4;
    }
  }

  function drawParticles(ctx, particles, time, prof) {
    if (!particles || !particles.length) return;
    ctx.save();
    if (prof.particles === 'firefly' || prof.particles === 'ember' || prof.particles === 'spore') ctx.globalCompositeOperation = 'lighter';
    for (const p of particles) {
      const tw = .55 + .45 * Math.sin(time * 2.1 + p.ph * 2);
      if (p.kind === 'snow') {
        ctx.fillStyle = `rgba(244,253,255,${.4 + tw * .35})`;
        ctx.fillRect(p.x | 0, p.y | 0, p.size, p.size);
      } else if (p.kind === 'dust') {
        ctx.fillStyle = `rgba(255,230,176,${.18 + tw * .22})`;
        ctx.fillRect(p.x | 0, p.y | 0, p.size + 1, p.size);
      } else {
        const [cr, cg, cb] = hexToRgb(p.color);
        ctx.fillStyle = `rgba(${cr},${cg},${cb},${.25 + tw * .6})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size * .9, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = `rgba(${cr},${cg},${cb},${.08 + tw * .12})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2); ctx.fill();
      }
    }
    ctx.restore();
  }

  function drawWater(ctx, map, time) {
    ctx.save();
    for (let y = 0; y < map.height; y++) for (let x = 0; x < map.width; x++) {
      if (map.tiles[y][x] !== 'water') continue;
      const px = x * T, py = y * T;
      for (let i = 0; i < 2; i++) {
        const wx = px + 4 + ((time * 9 + x * 13 + y * 7 + i * 17) % 24);
        const wy = py + 8 + i * 11 + Math.sin(time * 1.5 + x + y) * 2;
        const a = .18 + .18 * Math.sin(time * 2 + x * .6 + i * 2);
        PX.rect(ctx, wx, wy, 6, 1, `rgba(160,235,255,${Math.max(.08, a)})`);
        PX.rect(ctx, wx + 6, wy + 1, 2, 1, `rgba(210,250,255,${Math.max(.05, a * .6)})`);
      }
      const gl = Math.sin(time * 1.8 + x * 1.3 + y * .7);
      if (gl > .75) PX.rect(ctx, px + 10 + (x % 3) * 5, py + 13 + (y % 4) * 4, 2, 1, 'rgba(230,255,255,.5)');
    }
    ctx.restore();
  }

  function drawTallGrass(ctx, map, time) {
    ctx.save();
    for (let y = 0; y < map.height; y++) for (let x = 0; x < map.width; x++) {
      if (map.tiles[y][x] !== 'tall_grass') continue;
      const px = x * T, py = y * T;
      for (let i = 0; i < 3; i++) {
        const bx = px + 5 + i * 9 + ((x * 5 + y * 3 + i * 7) % 5);
        const sway = Math.sin(time * 2.2 + x * .8 + y * .6 + i) * 2.2;
        const top = py + 10 + (i % 2) * 5;
        PX.line(ctx, bx, py + 30, bx + sway, top, i % 2 ? '#57c47a' : '#3a9e60', 1);
        PX.rect(ctx, bx + sway | 0, top, 1, 2, '#8ee0a0');
      }
    }
    ctx.restore();
  }

  function glowSpec(o) {
    switch (o.type) {
      case 'lantern': return { x: o.x * T + 16, y: o.y * T + 8, r: 54, color: '#ffb84d', a: .30, pulse: .25 };
      case 'crystal': return { x: o.x * T + 16, y: o.y * T + 12, r: 50, color: '#9b7bff', a: .30, pulse: .3 };
      case 'glow_mushroom': return { x: o.x * T + 16, y: o.y * T + 18, r: 40, color: '#7ce8ff', a: .24, pulse: .35 };
      case 'relic_altar': return { x: o.x * T + 16, y: o.y * T + 8, r: 46, color: '#7ce8ff', a: .3, pulse: .3 };
      case 'soul_altar': return { x: o.x * T + 16, y: o.y * T + 8, r: 48, color: '#f5c542', a: .3, pulse: .3 };
      case 'shrine': return { x: o.x * T + 16, y: o.y * T + 14, r: 44, color: '#7ce8ff', a: .26, pulse: .3 };
      case 'obsidian_gate': return { x: o.x * T + 16, y: o.y * T + 8, r: 50, color: '#9b7bff', a: .3, pulse: .35 };
      case 'victory_arch': return { x: o.x * T + 48, y: o.y * T + 2, r: 46, color: '#f5c542', a: .22, pulse: .2 };
      case 'ancient_gate': return { x: o.x * T + 16, y: o.y * T + 8, r: 46, color: '#7ce8ff', a: .24, pulse: .3 };
      case 'healing_station': return { x: o.x * T + 16, y: o.y * T + 18, r: 38, color: '#ff8aa0', a: .22, pulse: .3 };
      case 'lighthouse': return { x: o.x * T + 16, y: o.y * T - 36, r: 60, color: '#ffe9a0', a: .25, pulse: .2 };
      default: return o.glow ? { x: o.x * T + 16, y: o.y * T + 14, r: 42, color: '#ffd166', a: .2, pulse: .25 } : null;
    }
  }

  function drawGlows(ctx, map, time) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const o of map.objects) {
      const g = glowSpec(o);
      if (!g) continue;
      const pulse = 1 + Math.sin(time * 1.7 + o.x * .7 + o.y * .5) * g.pulse;
      const r = g.r * pulse;
      const grad = ctx.createRadialGradient(g.x, g.y, 0, g.x, g.y, r);
      const [cr, cg, cb] = hexToRgb(g.color);
      grad.addColorStop(0, `rgba(${cr},${cg},${cb},${g.a * pulse})`);
      grad.addColorStop(.35, `rgba(${cr},${cg},${cb},${g.a * .38 * pulse})`);
      grad.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.arc(g.x, g.y, r, 0, Math.PI * 2); ctx.fill();
      // ground pool
      ctx.save();
      ctx.translate(g.x, g.y + 18);
      ctx.scale(1, .35);
      const pool = ctx.createRadialGradient(0, 0, 0, 0, 0, r * .9);
      pool.addColorStop(0, `rgba(${cr},${cg},${cb},${g.a * .45 * pulse})`);
      pool.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
      ctx.fillStyle = pool;
      ctx.beginPath(); ctx.arc(0, 0, r * .9, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
    // lighthouse beam
    for (const o of map.objects) {
      if (o.type !== 'lighthouse') continue;
      const bx = o.x * T + 16, by = o.y * T - 36;
      const ang = time * .65;
      ctx.save();
      ctx.translate(bx, by);
      ctx.rotate(ang);
      const beam = ctx.createLinearGradient(0, 0, 190, 0);
      beam.addColorStop(0, 'rgba(255,240,180,.28)');
      beam.addColorStop(1, 'rgba(255,240,180,0)');
      ctx.fillStyle = beam;
      ctx.beginPath(); ctx.moveTo(0, -3); ctx.lineTo(190, -26); ctx.lineTo(190, 26); ctx.lineTo(0, 3); ctx.closePath(); ctx.fill();
      ctx.restore();
    }
    ctx.restore();
  }

  const ambientCache = new Map();
  function ambientOverlay(map, width, height) {
    const key = `${map.id}:${width}x${height}`;
    const cached = ambientCache.get(key);
    if (cached) return cached;
    const prof = profileFor(map);
    const indoor = map.id === 'clinic' || map.id === 'cedar_lab' || map.id === 'bramble_gym';
    const c = document.createElement('canvas');
    c.width = width; c.height = height;
    const g = c.getContext('2d');
    // atmospheric colour wash
    const [tr, tg, tb] = hexToRgb(prof.tint);
    g.fillStyle = `rgba(${tr},${tg},${tb},${prof.alpha})`;
    g.fillRect(0, 0, width, height);
    // sunlight / moonlight
    if (prof.sun) {
      const grad = g.createLinearGradient(0, 0, width * .7, height);
      const [sr, sg, sb] = hexToRgb(prof.sun);
      grad.addColorStop(0, `rgba(${sr},${sg},${sb},${prof.sunA})`);
      grad.addColorStop(.45, `rgba(${sr},${sg},${sb},${prof.sunA * .28})`);
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = grad; g.fillRect(0, 0, width, height);
    }
    if (indoor) {
      // warm ceiling lamp pools
      for (let i = 0; i < 3; i++) {
        const lx = width * (.22 + i * .28), ly = height * .34;
        const lamp = g.createRadialGradient(lx, ly, 0, lx, ly, 190);
        lamp.addColorStop(0, 'rgba(255,214,150,.14)');
        lamp.addColorStop(1, 'rgba(255,214,150,0)');
        g.fillStyle = lamp; g.fillRect(0, 0, width, height);
      }
    }
    // cinematic vignette
    const v = g.createRadialGradient(width * .5, height * .46, height * .28, width * .5, height * .5, height * .92);
    v.addColorStop(0, 'rgba(2,4,12,0)');
    v.addColorStop(.7, `rgba(2,4,12,${prof.vig * .35})`);
    v.addColorStop(1, `rgba(2,4,12,${prof.vig})`);
    g.fillStyle = v; g.fillRect(0, 0, width, height);
    ambientCache.set(key, c);
    return c;
  }

  function drawAmbient(ctx, map, width, height, time) {
    ctx.save();
    ctx.drawImage(ambientOverlay(map, width, height), 0, 0);
    // caustic light drift for water maps
    if (map.objects.some(o => o.type === 'fountain') || map.tiles.some(row => row.includes('water'))) {
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 2; i++) {
        const gx = width * (.22 + i * .34) + Math.sin(time * .3 + i) * 40;
        const grad = ctx.createLinearGradient(gx, 0, gx + 120, height);
        grad.addColorStop(0, 'rgba(160,235,255,.05)');
        grad.addColorStop(1, 'rgba(160,235,255,0)');
        ctx.fillStyle = grad; ctx.fillRect(0, 0, width, height);
      }
      ctx.globalCompositeOperation = 'source-over';
    }
    ctx.restore();
  }

  Art.styleFor = styleFor;
  Art.drawCharacter = drawCharacter;
  Art.createParticles = createParticles;
  Art.updateParticles = updateParticles;
  Art.drawParticles = drawParticles;
  Art.drawWater = drawWater;
  Art.drawTallGrass = drawTallGrass;
  Art.drawGlows = drawGlows;
  Art.drawAmbient = drawAmbient;
  Art.profileFor = profileFor;
})();

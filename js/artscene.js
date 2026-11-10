/* ============================================================
   POKÉMON ECLIPSE — art engine (battle arenas + title screen)
   ============================================================ */
'use strict';

(function () {
  const rgba = Art.rgba;

  function radial(ctx, x, y, r, color, alpha) {
    const [cr, cg, cb] = hexToRgb(color);
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(${cr},${cg},${cb},${alpha})`);
    g.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
    return g;
  }

  function cloud(ctx, x, y, s, alpha = .5) {
    ctx.save();
    ctx.fillStyle = `rgba(255,255,255,${alpha})`;
    for (const [dx, dy, rr] of [[-34, 6, 20], [-10, -4, 28], [18, 0, 24], [42, 8, 16], [2, 10, 26]]) {
      ctx.beginPath(); ctx.ellipse(x + dx * s, y + dy * s, rr * s, rr * s * .62, 0, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }

  function hills(ctx, w, baseY, color, amp, freq, phase) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, baseY);
    for (let x = 0; x <= w; x += 16) {
      const y = baseY - Math.sin(x * freq + phase) * amp - Math.sin(x * freq * 2.3 + phase * 1.7) * amp * .35;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, 720); ctx.lineTo(0, 720); ctx.closePath(); ctx.fill();
  }

  function trees(ctx, w, y, color, seed, scale = 1, density = .08) {
    const r = Art.seeded(seed, 3, 11);
    ctx.fillStyle = color;
    for (let x = -20; x < w + 40; x += 26 + r() * 34) {
      const h = (26 + r() * 30) * scale;
      const tw = (10 + r() * 8) * scale;
      if (r() > density) {
        ctx.beginPath(); ctx.moveTo(x, y + 10);
        ctx.lineTo(x - tw, y + 10); ctx.lineTo(x - tw * .2, y - h * .55); ctx.lineTo(x + tw * .3, y - h * .4); ctx.lineTo(x + tw, y + 10);
        ctx.closePath(); ctx.fill();
        ctx.beginPath(); ctx.arc(x, y - h * .7, tw * 1.2, 0, Math.PI * 2); ctx.fill();
      }
    }
  }

  function floorShadow(ctx, cx, cy, rx, ry) {
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rx);
    g.addColorStop(0, 'rgba(6,10,18,.42)');
    g.addColorStop(1, 'rgba(6,10,18,0)');
    ctx.fillStyle = g;
    ctx.save(); ctx.translate(cx, cy); ctx.scale(1, ry / rx); ctx.beginPath(); ctx.arc(0, 0, rx, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  }

  function platform(ctx, cx, cy, rx, ry, palette) {
    floorShadow(ctx, cx, cy + 6, rx * 1.15, ry * 1.5);
    ctx.fillStyle = palette[0];
    ctx.beginPath(); ctx.ellipse(cx, cy + 4, rx, ry, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = palette[1];
    ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = palette[2];
    ctx.beginPath(); ctx.ellipse(cx, cy - 4, rx * .86, ry * .74, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = palette[3] || 'rgba(255,255,255,.16)';
    ctx.beginPath(); ctx.ellipse(cx - rx * .16, cy - 9, rx * .46, ry * .32, 0, 0, Math.PI * 2); ctx.fill();
    // small stones / tufts
    for (let i = 0; i < 7; i++) {
      const r = Art.seeded(cx + i * 13, cy, 7);
      const px = cx - rx * .72 + r() * rx * 1.44, py = cy + ry * .45 + r() * ry * .35;
      ctx.fillStyle = palette[4] || 'rgba(0,0,0,.2)';
      ctx.fillRect(px, py, 3 + r() * 3, 2);
    }
  }

  const THEMES = {
    route:   { sky:['#69bce8','#a8e0f8','#e8f8ff'], sun:'#fff6c8', sunY:.24, hills:['#8fc4c0','#5f9f7a','#3a7456'], ground:['#5a9a58','#2f6a42','#1c4630'], plat:['#2c5c3a','#5a9a5a','#79b86c','rgba(255,255,255,.15)','rgba(20,50,30,.4)'], trees:'#2f6248' },
    town:    { sky:['#27275e','#8a5a9a','#f0a070'], sun:'#ffd390', sunY:.55, hills:['#5a5488','#3a4468','#2a3550'], ground:['#4a7a52','#2c543a','#1a3626'], plat:['#2a4a32','#4a7a4a','#669a5c','rgba(255,220,160,.14)','rgba(20,40,26,.4)'], trees:'#263c3c' },
    forest:  { sky:['#122c2a','#23503a','#4a7a52'], sun:'#c8f0b0', sunY:.16, hills:['#2a5a3c','#1d4530','#133224'], ground:['#356a44','#1d4530','#10281c'], plat:['#1a3a26','#356a44','#4c8a52','rgba(190,255,190,.12)','rgba(8,24,14,.45)'], trees:'#16382a' },
    cave:    { sky:['#0e1228','#1c2140','#2e3158'], sun:null, hills:['#2a2e50','#202442','#181c36'], ground:['#2a2c48','#1b1d34','#101122'], plat:['#20223c','#3a3c62','#4c4e78','rgba(140,220,255,.12)','rgba(6,8,20,.5)'], trees:null },
    sand:    { sky:['#e08a48','#f4bc70','#ffe6b0'], sun:'#fff0c0', sunY:.28, hills:['#e0b070','#c08a4a','#a06a34'], ground:['#d8aa62','#b07c3e','#7a5226'], plat:['#8a5c2e','#c08a4a','#d8a860','rgba(255,240,180,.2)','rgba(80,50,20,.35)'], trees:null },
    snow:    { sky:['#6a90c0','#a8c8e8','#e8f6ff'], sun:'#ffffff', sunY:.2, hills:['#b8ccdf','#8fa8c4','#6a86a8'], ground:['#e0eef6','#b8d0de','#8faab8'], plat:['#7a98b0','#c8dce8','#e8f6fc','rgba(255,255,255,.4)','rgba(90,120,140,.3)'], trees:'#5a7488' },
    paradox: { sky:['#0c0618','#2a124a','#5a2450'], sun:'#e8d8ff', sunY:.22, hills:['#3a2458','#2a1840','#1a0e2c'], ground:['#34204a','#1e1030','#120a22'], plat:['#1e1230','#3a2450','#543270','rgba(190,150,255,.16)','rgba(10,4,20,.5)'], trees:'#1c1030' },
    league:  { sky:['#2a2a5a','#6a5a98','#f0b078'], sun:'#ffe0a8', sunY:.52, hills:['#6a6488','#4a466a','#332f50'], ground:['#b8b0a8','#8a8288','#5a5464'], plat:['#5a5464','#9a9298','#c0b8b0','rgba(255,240,200,.2)','rgba(40,36,50,.35)'], trees:null },
    summit:  { sky:['#081028','#23406a','#8fb8d8'], sun:'#e8f4ff', sunY:.2, hills:['#5a7088','#3a5068','#253a50'], ground:['#d8e8f0','#a8c0d0','#7898a8'], plat:['#6a8498','#b8ccd8','#e0eef4','rgba(255,255,255,.4)','rgba(80,100,120,.3)'], trees:null },
    gym:     { sky:['#1a1630','#2c2448','#453860'], sun:null, hills:['#2c2448','#241e3c','#1a1630'], ground:['#6a5a4a','#4a3e36','#302822'], plat:['#3a2e28','#6a5a4a','#8a7460','rgba(255,220,160,.16)','rgba(20,14,10,.4)'], trees:null }
  };

  function drawBattleBackground(ctx, w, h, theme, time) {
    const th = THEMES[theme] || THEMES.route;
    const sky = ctx.createLinearGradient(0, 0, 0, h * .62);
    sky.addColorStop(0, th.sky[0]); sky.addColorStop(.55, th.sky[1]); sky.addColorStop(1, th.sky[2]);
    ctx.fillStyle = sky; ctx.fillRect(0, 0, w, h);

    // stars
    if (theme === 'paradox' || theme === 'summit' || theme === 'town') {
      const rr = Art.seeded(theme.length, 17, 3);
      for (let i = 0; i < 90; i++) {
        const x = rr() * w, y = rr() * h * .55;
        const tw = .25 + .75 * Math.abs(Math.sin(time * 1.3 + i));
        ctx.fillStyle = `rgba(235,240,255,${.25 + tw * .55})`;
        const s = rr() > .9 ? 2 : 1;
        ctx.fillRect(x, y, s, s);
      }
    }

    // sun / moon / eclipse
    if (th.sun) {
      const sx = w * .74, sy = h * th.sunY;
      ctx.fillStyle = radial(ctx, sx, sy, 150, th.sun, .35);
      ctx.fillRect(sx - 150, sy - 150, 300, 300);
      ctx.fillStyle = radial(ctx, sx, sy, 58, th.sun, .8);
      ctx.beginPath(); ctx.arc(sx, sy, 58, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = th.sun;
      ctx.beginPath(); ctx.arc(sx, sy, 34, 0, Math.PI * 2); ctx.fill();
      if (theme === 'paradox') {
        ctx.fillStyle = '#120a20';
        ctx.beginPath(); ctx.arc(sx + 12, sy - 8, 32, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = 'rgba(200,170,255,.7)'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(sx, sy, 38, 0, Math.PI * 2); ctx.stroke();
      }
    }

    // drifting clouds
    const cloudCount = theme === 'sand' ? 2 : theme === 'cave' || theme === 'gym' ? 0 : 5;
    for (let i = 0; i < cloudCount; i++) {
      const span = w + 260;
      const x = ((time * (7 + i * 3) + i * 230) % span) - 130;
      const y = 44 + i * 38 + Math.sin(time * .35 + i) * 5;
      cloud(ctx, x, y, .55 + i * .12, theme === 'paradox' ? .10 : .28);
    }

    // aurora for paradox
    if (theme === 'paradox') {
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 3; i++) {
        const grad = ctx.createLinearGradient(0, 80 + i * 30, w, 220 + i * 40);
        grad.addColorStop(0, 'rgba(90,40,160,0)');
        grad.addColorStop(.5, `rgba(${120 + i * 30},${70 + i * 20},255,.10)`);
        grad.addColorStop(1, 'rgba(90,40,160,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(0, 80 + i * 36);
        for (let x = 0; x <= w; x += 24) ctx.lineTo(x, 80 + i * 36 + Math.sin(x * .008 + time * .4 + i) * 28);
        ctx.lineTo(w, 250 + i * 30); ctx.lineTo(0, 250 + i * 30); ctx.closePath(); ctx.fill();
      }
      ctx.restore();
    }

    // god rays for forest
    if (theme === 'forest' || theme === 'town') {
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 4; i++) {
        const gx = w * (.2 + i * .2) + Math.sin(time * .2 + i) * 20;
        const grad = ctx.createLinearGradient(gx, 0, gx + 120, h * .8);
        grad.addColorStop(0, 'rgba(255,245,190,.10)');
        grad.addColorStop(1, 'rgba(255,245,190,0)');
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.moveTo(gx - 20, 0); ctx.lineTo(gx + 20, 0); ctx.lineTo(gx + 150, h * .9); ctx.lineTo(gx + 70, h * .9); ctx.closePath(); ctx.fill();
      }
      ctx.restore();
    }

    // distant mountains / hills
    if (theme === 'sand') {
      hills(ctx, w, h * .56, th.hills[0], 26, .006, 1.2);
      hills(ctx, w, h * .6, th.hills[1], 20, .009, 3.4);
    } else if (theme === 'snow' || theme === 'summit') {
      ctx.fillStyle = th.hills[0];
      ctx.beginPath(); ctx.moveTo(0, h * .58);
      for (let i = 0; i < 6; i++) {
        const bx = i * 200 - 60;
        ctx.lineTo(bx + 100, h * (.18 + (i % 3) * .08));
        ctx.lineTo(bx + 210, h * .58);
      }
      ctx.lineTo(w, h * .62); ctx.lineTo(0, h * .62); ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.55)';
      for (let i = 0; i < 6; i++) {
        const bx = i * 200 - 60, by = h * (.18 + (i % 3) * .08);
        ctx.beginPath(); ctx.moveTo(bx + 100, by); ctx.lineTo(bx + 76, by + 44); ctx.lineTo(bx + 100, by + 30); ctx.lineTo(bx + 124, by + 44); ctx.closePath(); ctx.fill();
      }
      hills(ctx, w, h * .62, th.hills[1], 18, .008, 2);
      hills(ctx, w, h * .66, th.hills[2], 12, .012, 4.5);
    } else {
      hills(ctx, w, h * .5, th.hills[0], 30, .005, .7);
      hills(ctx, w, h * .57, th.hills[1], 24, .008, 2.6);
      hills(ctx, w, h * .62, th.hills[2], 18, .011, 5.1);
      if (th.trees) trees(ctx, w, h * .615, th.trees, theme.length * 17, 1.1, .1);
    }

    // ground
    const gg = ctx.createLinearGradient(0, h * .6, 0, h);
    gg.addColorStop(0, th.ground[0]); gg.addColorStop(.5, th.ground[1]); gg.addColorStop(1, th.ground[2]);
    ctx.fillStyle = gg; ctx.fillRect(0, h * .6, w, h * .4);
    ctx.fillStyle = 'rgba(255,255,255,.07)'; ctx.fillRect(0, h * .6, w, 3);
    // ground texture
    const rr = Art.seeded(theme.length, 5, 9);
    for (let i = 0; i < 140; i++) {
      const x = rr() * w, y = h * .62 + rr() * h * .37;
      ctx.fillStyle = `rgba(0,0,0,${.03 + rr() * .05})`;
      ctx.fillRect(x, y, 2 + rr() * 5, 1);
    }

    // cave crystals
    if (theme === 'cave' || theme === 'paradox') {
      const colors = theme === 'cave' ? ['#4a8ab8', '#7ce8ff', '#2a4a78'] : ['#6a3a9a', '#c9a0ff', '#3a1a5a'];
      for (let i = 0; i < 9; i++) {
        const r = Art.seeded(i, theme.length, 13);
        const x = r() * w, base = h * .63 + r() * 40, hh = 20 + r() * 60;
        ctx.fillStyle = colors[2];
        ctx.beginPath(); ctx.moveTo(x, base); ctx.lineTo(x - 9, base); ctx.lineTo(x - 2, base - hh); ctx.lineTo(x + 7, base); ctx.closePath(); ctx.fill();
        ctx.fillStyle = colors[0];
        ctx.beginPath(); ctx.moveTo(x, base); ctx.lineTo(x - 2, base); ctx.lineTo(x + 2, base - hh * .85); ctx.lineTo(x + 5, base); ctx.closePath(); ctx.fill();
        ctx.fillStyle = colors[1];
        ctx.fillRect(x + 1, base - hh * .7, 2, hh * .4);
      }
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 5; i++) {
        const r = Art.seeded(i + 20, theme.length, 17);
        const x = r() * w, y = h * .62 + r() * 60;
        ctx.fillStyle = radial(ctx, x, y, 60, theme === 'cave' ? '#7ce8ff' : '#c9a0ff', .12);
        ctx.fillRect(x - 60, y - 60, 120, 120);
      }
      ctx.restore();
    }

    // league columns / gym spotlights
    if (theme === 'league') {
      for (const cx of [70, 190, w - 70, w - 190]) {
        ctx.fillStyle = '#d8d0c4'; ctx.fillRect(cx - 12, h * .3, 24, h * .31);
        ctx.fillStyle = '#f0e8dc'; ctx.fillRect(cx - 9, h * .3, 8, h * .31);
        ctx.fillStyle = '#b8b0a4'; ctx.fillRect(cx - 16, h * .29, 32, 9);
        ctx.fillStyle = '#c8c0b4'; ctx.fillRect(cx - 16, h * .6, 32, 9);
        ctx.fillStyle = '#8a3a4a'; ctx.fillRect(cx - 13, h * .33, 26, 40);
        ctx.fillStyle = '#f5c542'; ctx.fillRect(cx - 4, h * .35, 8, 8);
      }
    }
    if (theme === 'gym') {
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 3; i++) {
        const x = w * (.25 + i * .25);
        const g = ctx.createLinearGradient(x, 0, x + 60, h);
        g.addColorStop(0, 'rgba(255,220,150,.13)'); g.addColorStop(1, 'rgba(255,220,150,0)');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.moveTo(x - 30, 0); ctx.lineTo(x + 30, 0); ctx.lineTo(x + 170, h * .8); ctx.lineTo(x + 50, h * .8); ctx.closePath(); ctx.fill();
      }
      ctx.restore();
    }

    // foreground ridge
    if (theme === 'route' || theme === 'town' || theme === 'forest' || theme === 'snow' || theme === 'summit') {
      hills(ctx, w, h * .985, th.ground[2], 12, .01, 1.7);
    }
    if (theme === 'sand') {
      hills(ctx, w, h * .99, th.ground[2], 9, .013, 2.4);
    }

    // ambient drifting particles
    ctx.save();
    if (theme === 'paradox' || theme === 'cave' || theme === 'forest' || theme === 'town') ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 26; i++) {
      const r = Art.seeded(i, theme.length, 21);
      const speed = .12 + r() * .25;
      let x = (r() * w + time * (theme === 'sand' ? 38 : 6) * speed) % w;
      let y = h * (.2 + r() * .75) + Math.sin(time * .8 + i) * 10;
      if (theme === 'snow' || theme === 'summit') { y = (r() * h + time * 24 * speed) % h; x = (r() * w + Math.sin(time * .6 + i) * 16) % w; }
      const col = theme === 'snow' || theme === 'summit' ? '#ffffff'
        : theme === 'cave' ? '#7ce8ff' : theme === 'paradox' ? '#c9a0ff' : theme === 'sand' ? '#ffe0a0' : '#e8ffd0';
      ctx.fillStyle = rgba(col, theme === 'sand' ? .2 : .35);
      const s = theme === 'snow' ? 2 : 1;
      ctx.fillRect(x, y, s, s);
    }
    ctx.restore();

    // vignette
    const v = ctx.createRadialGradient(w * .5, h * .48, h * .3, w * .5, h * .5, h * .9);
    v.addColorStop(0, 'rgba(2,4,12,0)'); v.addColorStop(1, 'rgba(2,4,12,.5)');
    ctx.fillStyle = v; ctx.fillRect(0, 0, w, h);

    return {
      foe: { x: 720, y: 388, rx: 178, ry: 36 },
      ally: { x: 270, y: 624, rx: 212, ry: 46 },
      palette: th.plat
    };
  }

  function drawBattlePlatforms(ctx, arena) {
    platform(ctx, arena.foe.x, arena.foe.y, arena.foe.rx, arena.foe.ry, arena.palette);
    platform(ctx, arena.ally.x, arena.ally.y, arena.ally.rx, arena.ally.ry, arena.palette);
  }

  function battleThemeFor(map) {
    if (!map) return 'route';
    if (map.id === 'bramble_gym') return 'gym';
    if (map.id === 'clinic' || map.id === 'cedar_lab') return 'town';
    return map.theme || 'route';
  }

  /* ------------------------------------------------ title screen */
  function drawTitle(ctx, w, h, time) {
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, '#04060f'); sky.addColorStop(.42, '#101430');
    sky.addColorStop(.66, '#2a1846'); sky.addColorStop(1, '#080a16');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, w, h);

    // stars
    const r = Art.seeded(7, 13, 3);
    for (let i = 0; i < 260; i++) {
      const x = r() * w, y = r() * h * .78;
      const tw = .3 + .7 * Math.abs(Math.sin(time * (1 + (i % 5) * .4) + i));
      const s = r() > .93 ? 2 : 1;
      ctx.fillStyle = `rgba(${i % 11 === 0 ? '245,197,66' : '220,235,255'},${.18 + tw * .7})`;
      ctx.fillRect(x, y, s, s);
    }
    // milky way
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const band = ctx.createLinearGradient(0, 0, w, h * .8);
    band.addColorStop(0, 'rgba(80,120,220,0)');
    band.addColorStop(.45, 'rgba(100,130,230,.06)');
    band.addColorStop(.55, 'rgba(160,120,230,.07)');
    band.addColorStop(1, 'rgba(80,120,220,0)');
    ctx.fillStyle = band;
    ctx.save(); ctx.rotate(-.32); ctx.fillRect(-w * .2, h * .15, w * 1.6, h * .5); ctx.restore();
    ctx.restore();

    // aurora veil
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 3; i++) {
      const grad = ctx.createLinearGradient(0, 60 + i * 34, w, 200 + i * 50);
      grad.addColorStop(0, 'rgba(70,40,160,0)');
      grad.addColorStop(.4, `rgba(${90 + i * 40},${140 + i * 20},${220 - i * 30},.07)`);
      grad.addColorStop(.7, 'rgba(150,80,200,.06)');
      grad.addColorStop(1, 'rgba(70,40,160,0)');
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.moveTo(0, 80 + i * 30);
      for (let x = 0; x <= w; x += 26) ctx.lineTo(x, 80 + i * 30 + Math.sin(x * .007 + time * .35 + i * 1.6) * 30);
      ctx.lineTo(w, 260 + i * 40); ctx.lineTo(0, 260 + i * 40); ctx.closePath(); ctx.fill();
    }
    ctx.restore();

    // shooting stars
    for (let i = 0; i < 2; i++) {
      const period = 9 + i * 5;
      const p = (time + i * 4.3) % period;
      if (p < 1.1) {
        const t = p / 1.1;
        const sx = w * (.18 + i * .55) + t * 190, sy = h * (.12 + i * .08) + t * 60;
        const grad = ctx.createLinearGradient(sx, sy, sx - 120, sy - 38);
        grad.addColorStop(0, 'rgba(255,255,255,.9)'); grad.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.strokeStyle = grad; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx - 120, sy - 38); ctx.stroke();
      }
    }

    // eclipse
    const ex = w * .5, ey = h * .3, er = h * .155;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = radial(ctx, ex, ey, er * 3.2, '#8a6aff', .30);
    ctx.fillRect(ex - er * 3.2, ey - er * 3.2, er * 6.4, er * 6.4);
    // corona rays
    for (let i = 0; i < 28; i++) {
      const a = (i / 28) * Math.PI * 2 + time * .05;
      const len = er * (1.36 + .18 * Math.sin(time * 1.3 + i * 1.7));
      const grad = ctx.createLinearGradient(ex + Math.cos(a) * er, ey + Math.sin(a) * er, ex + Math.cos(a) * len, ey + Math.sin(a) * len);
      grad.addColorStop(0, 'rgba(220,210,255,.28)'); grad.addColorStop(1, 'rgba(160,120,255,0)');
      ctx.strokeStyle = grad; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(ex + Math.cos(a) * er * 1.02, ey + Math.sin(a) * er * 1.02);
      ctx.lineTo(ex + Math.cos(a) * len, ey + Math.sin(a) * len); ctx.stroke();
    }
    // glowing ring
    const ring = ctx.createRadialGradient(ex, ey, er * .88, ex, ey, er * 1.22);
    ring.addColorStop(0, 'rgba(255,240,200,0)');
    ring.addColorStop(.55, 'rgba(255,235,190,.55)');
    ring.addColorStop(.72, 'rgba(200,160,255,.35)');
    ring.addColorStop(1, 'rgba(140,100,255,0)');
    ctx.fillStyle = ring; ctx.beginPath(); ctx.arc(ex, ey, er * 1.24, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    // dark moon disc
    ctx.fillStyle = '#07080f';
    ctx.beginPath(); ctx.arc(ex, ey, er, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(245,197,66,.55)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(ex, ey, er + .5, 0, Math.PI * 2); ctx.stroke();
    // diamond ring flare
    const flare = .5 + .5 * Math.sin(time * .9);
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = radial(ctx, ex + er * .75, ey - er * .62, 22 + flare * 8, '#fff6d0', .9);
    ctx.fillRect(ex + er * .75 - 30, ey - er * .62 - 30, 60, 60);
    ctx.restore();

    // distant mountains
    const layers = [
      { y: h * .58, col: '#191a36', amp: 48, f: .004 },
      { y: h * .64, col: '#121428', amp: 34, f: .006 },
      { y: h * .72, col: '#0b0d1c', amp: 24, f: .009 }
    ];
    for (const l of layers) {
      ctx.fillStyle = l.col;
      ctx.beginPath(); ctx.moveTo(0, h);
      for (let x = 0; x <= w; x += 18) ctx.lineTo(x, l.y - Math.sin(x * l.f) * l.amp - Math.sin(x * l.f * 2.7) * l.amp * .3);
      ctx.lineTo(w, h); ctx.closePath(); ctx.fill();
    }
    // pine silhouettes
    ctx.fillStyle = '#060812';
    const rr = Art.seeded(31, 9, 5);
    for (let x = -20; x < w + 30; x += 28 + rr() * 34) {
      const bh = 60 + rr() * 70, by = h * .75 + rr() * 26;
      ctx.beginPath(); ctx.moveTo(x, by); ctx.lineTo(x - 10, by); ctx.lineTo(x, by - bh * .55); ctx.lineTo(x + 10, by); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(x, by - bh * .25); ctx.lineTo(x - 8, by - bh * .25); ctx.lineTo(x, by - bh); ctx.lineTo(x + 8, by - bh * .25); ctx.closePath(); ctx.fill();
    }
    // village lights
    for (let i = 0; i < 16; i++) {
      const x = w * .1 + rr() * w * .8, y = h * .79 + rr() * 26;
      ctx.fillStyle = `rgba(255,200,110,${.4 + .4 * Math.sin(time * 2 + i)})`;
      ctx.fillRect(x, y, 2, 2);
    }
    // foreground mist
    ctx.fillStyle = 'rgba(120,140,220,.05)';
    ctx.beginPath(); ctx.ellipse(w * .3, h * .84, w * .5, 60, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(120,140,220,.04)';
    ctx.beginPath(); ctx.ellipse(w * .75, h * .9, w * .45, 50, 0, 0, Math.PI * 2); ctx.fill();

    // floating motes
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 40; i++) {
      const r2 = Art.seeded(i, 71, 3);
      const x = (r2() * w + Math.sin(time * .4 + i) * 20) % w;
      const y = h * (.35 + r2() * .6) + Math.sin(time * .7 + i * 1.3) * 10;
      const a = .12 + .25 * Math.abs(Math.sin(time * 1.1 + i));
      ctx.fillStyle = `rgba(${i % 4 === 0 ? '245,197,66' : '150,180,255'},${a})`;
      ctx.fillRect(x, y, 1, 1);
    }
    ctx.restore();

    // vignette
    const v = ctx.createRadialGradient(w * .5, h * .42, h * .32, w * .5, h * .5, h * .95);
    v.addColorStop(0, 'rgba(2,3,10,0)'); v.addColorStop(1, 'rgba(2,3,10,.62)');
    ctx.fillStyle = v; ctx.fillRect(0, 0, w, h);

    // logo lockup
    const shimmer = .78 + .22 * Math.sin(time * 1.4);
    ctx.save();
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = '20px PixelTitle, monospace';
    ctx.fillStyle = `rgba(103,232,249,${shimmer})`;
    ctx.shadowColor = 'rgba(103,232,249,.85)'; ctx.shadowBlur = 18;
    ctx.fillText('POKÉMON', w * .5, h * .135);
    ctx.font = '44px PixelTitle, monospace';
    const lg = ctx.createLinearGradient(w * .32, h * .16, w * .68, h * .25);
    lg.addColorStop(0, '#fff6cf'); lg.addColorStop(.42, '#f5c542'); lg.addColorStop(.68, '#ffd875'); lg.addColorStop(1, '#b8862b');
    ctx.fillStyle = lg;
    ctx.shadowColor = 'rgba(245,197,66,.8)'; ctx.shadowBlur = 26;
    ctx.fillText('ECLIPSE', w * .5, h * .207);
    ctx.shadowBlur = 0;
    ctx.font = '15px PixelBody, monospace';
    ctx.fillStyle = 'rgba(220,228,255,.82)';
    ctx.fillText('A U R E L I A   G E N E S I S', w * .5, h * .253);
    ctx.restore();
  }

  Art.drawBattleBackground = drawBattleBackground;
  Art.drawBattlePlatforms = drawBattlePlatforms;
  Art.battleThemeFor = battleThemeFor;
  Art.drawTitle = drawTitle;
  Art.THEMES = THEMES;
})();

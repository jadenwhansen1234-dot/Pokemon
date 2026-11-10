/* ============================================================
   POKÉMON ECLIPSE — overworld runtime
   Smooth grid movement, baked terrain, animated light & weather.
   ============================================================ */
'use strict';

const World = (() => {
  const TILE = 32;
  const canvas = $('#game');
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  const state = {
    mapId: 'emberfall', x: 14, y: 18, facing: 'up', moving: false,
    moveLock: 0, encounterLock: 0, defeated: {}, flags: {}, lastMap: null,
    prevX: 14, prevY: 18, stepT: 1, time: 0, particles: []
  };
  let game = null;
  let playerStyle = null;
  let npcStyles = new Map();

  const dirs = { up: [0,-1], down: [0,1], left: [-1,0], right: [1,0] };

  function map() { return MAPS[state.mapId]; }
  function solid(x, y) {
    const m = map(); if (!m || y < 0 || x < 0 || x >= m.width || y >= m.height) return true;
    if (m.collision[y][x]) return true;
    return m.npcs.some(n => n.x === x && n.y === y);
  }
  function playerAt(x, y) { return state.x === x && state.y === y; }

  function refreshStyles() {
    playerStyle = Art.styleFor('player', { player: true });
    npcStyles = new Map();
    for (const m of Object.values(MAPS)) for (const n of m.npcs) {
      if (!npcStyles.has(n.id)) npcStyles.set(n.id, Art.styleFor(n.id, { trainer: !!n.trainer }));
    }
  }

  function resetView() {
    state.prevX = state.x; state.prevY = state.y; state.stepT = 1;
    state.particles = Art.createParticles(map());
  }

  function setMap(id, x, y) {
    if (!MAPS[id]) return;
    state.lastMap = state.mapId; state.mapId = id; state.x = x; state.y = y;
    state.moveLock = 350; state.encounterLock = 800;
    resetView();
    if (game) {
      UI.updateHud(MAPS[id].name, game.party);
      const theme = MAPS[id].theme;
      Sound.playTrack(theme === 'gym' ? 'battle' : theme === 'cave' ? 'cave' : theme === 'paradox' ? 'eclipse' : 'town');
    }
  }
  function transition(w) {
    fadeOut(() => { setMap(w.to, w.toX, w.toY); fadeIn(); toast(MAPS[w.to]?.name || ''); });
  }

  function facingTile() { const d = dirs[state.facing]; return [state.x + d[0], state.y + d[1]]; }

  async function interact() {
    if (!game || UI.active || Battle.busy) return;
    Sound.init();
    const [x, y] = facingTile(), m = map();
    const npc = m.npcs.find(n => n.x === x && n.y === y);
    if (npc) {
      if (npc.trainer && !state.defeated[npc.id]) {
        await UI.say(`${npc.name} steps forward!`, npc.name);
        const h = Battle.start({ trainerId: npc.trainer, party: game.party, inventory: game.inventory, player: game.player, area: map().id, onEnd: r => { if (r.outcome === 'win') state.defeated[npc.id] = true; } });
        await h.promise; saveGame();
      } else await UI.say(npc.dialogue || `${npc.name} smiles.`, npc.name);
      return;
    }
    const obj = m.objects.find(o => o.x === x && o.y === y);
    if (obj) {
      if (obj.interact === 'heal') {
        game.party.forEach(p => { p.hp = p.maxHp; p.status = null; });
        UI.updateHud(m.name, game.party);
        await UI.say('Your Pokémon are fully restored!', 'Nurse');
      } else if (obj.interact === 'relic') {
        const foundTruth = !!game.flags.relic_truth;
        const foundIdeal = !!game.flags.relic_ideal;
        game.inventory.relic_truth = 1;
        game.inventory.relic_ideal = 1;
        game.flags.relic_truth = true;
        game.flags.relic_ideal = true;
        await UI.say(foundTruth && foundIdeal
          ? 'The Twin Reliquary glows softly. Its two relics already rest in your Key Items.'
          : 'The Twin Reliquary awakens! You received the Relic of Truth and the Relic of Ideals.', 'Aurelia');
        if (typeof saveGame === 'function') saveGame();
      } else if (obj.interact === 'soul_ember') {
        const alreadyFound = !!game.flags.soul_ember;
        game.inventory.soul_ember = 1;
        game.flags.soul_ember = true;
        await UI.say(alreadyFound
          ? 'The altar’s ancient flame answers your presence. The Soul Ember is safe in your Key Items.'
          : 'A warm flame rises from the altar and settles into your hands. You received the Soul Ember!', 'Aurelia');
        if (typeof saveGame === 'function') saveGame();
      } else if (obj.text) await UI.say(obj.text, 'Aurelia');
      else await UI.say('A quiet power hums beneath this place.');
      return;
    }
    const warp = m.warps.find(w => w.x === x && w.y === y); if (warp) { transition(warp); return; }
  }

  function step(dx, dy) {
    if (state.moveLock > 0 || UI.active || Battle.busy) return false;
    state.facing = dx < 0 ? 'left' : dx > 0 ? 'right' : dy < 0 ? 'up' : 'down';
    const nx = state.x + dx, ny = state.y + dy, m = map();
    if (solid(nx, ny)) return false;
    state.prevX = state.x; state.prevY = state.y;
    state.x = nx; state.y = ny; state.moveLock = 125; state.stepT = 0;
    const warp = m.warps.find(w => w.x === nx && w.y === ny); if (warp) { transition(warp); return true; }
    const tile = m.tiles[ny][nx];
    if (m.encounter && tile === 'tall_grass' && state.encounterLock <= 0 && Math.random() < .14) encounter();
    return true;
  }

  async function encounter() {
    const table = ENCOUNTERS[map().encounter] || [];
    if (!table.length || !game.party.some(p => p.hp > 0)) return;
    const e = weighted(table);
    const h = Battle.start({ type: 'wild', wildSpecies: e.sp, level: randi(e.min, e.max), area: map().id, party: game.party, inventory: game.inventory, player: game.player, onEnd: () => saveGame() });
    await h.promise; state.encounterLock = 900;
  }

  function update(dt) {
    state.moveLock = Math.max(0, state.moveLock - dt);
    state.encounterLock = Math.max(0, state.encounterLock - dt);
    state.time += dt / 1000;
    if (state.stepT < 1) state.stepT = Math.min(1, state.stepT + dt / 125);
    const m = map();
    if (m && state.particles.length) Art.updateParticles(state.particles, dt, m);
  }

  function drawActor(ctx, style, px, py, facing, phase) {
    Art.drawCharacter(ctx, style, px, py, facing, phase, state.time);
  }

  function draw() {
    const m = map(); if (!m) return;
    if (!playerStyle) refreshStyles();
    const layer = Art.buildStaticLayer(m);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#06070d';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const OFFSET_Y = Math.max(0, Math.floor((canvas.height - m.height * TILE) / 2));
    ctx.save();
    ctx.translate(0, OFFSET_Y);
    if (layer) {
      const pad = layer._pad || 0;
      ctx.drawImage(layer, -pad, -pad);
    }

    Art.drawWater(ctx, m, state.time);
    Art.drawTallGrass(ctx, m, state.time);
    Art.drawGlows(ctx, m, state.time);

    // dynamic actors sorted by vertical position
    const t = state.stepT < 1 ? state.stepT : 1;
    const eased = t * t * (3 - 2 * t);
    const px = (state.prevX + (state.x - state.prevX) * eased) * TILE;
    const py = (state.prevY + (state.y - state.prevY) * eased) * TILE;
    const phase = state.stepT < 1 ? state.stepT : 1;
    const actors = [];
    for (const n of m.npcs) {
      const style = npcStyles.get(n.id) || Art.styleFor(n.id, { trainer: !!n.trainer });
      actors.push({ y: n.y * TILE, draw: () => Art.drawCharacter(ctx, style, n.x * TILE, n.y * TILE, n.direction || 'down', 1, state.time + Art.hashStr(n.id) % 7) });
    }
    actors.push({ y: py, draw: () => Art.drawCharacter(ctx, playerStyle, px, py, state.facing, phase, state.time) });
    actors.sort((a, b) => a.y - b.y);
    for (const a of actors) a.draw();

    // player's soft lantern light in dark places
    const prof = Art.profileFor(m);
    if (m.theme === 'cave' || m.theme === 'forest' || m.theme === 'paradox' || m.id === 'cavern') {
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      const g = ctx.createRadialGradient(px + 16, py + 16, 4, px + 16, py + 16, 64);
      g.addColorStop(0, 'rgba(255,225,160,.10)');
      g.addColorStop(1, 'rgba(255,225,160,0)');
      ctx.fillStyle = g; ctx.fillRect(px - 52, py - 52, 136, 136);
      ctx.restore();
    }

    // foreground weather particles
    Art.drawParticles(ctx, state.particles, state.time, prof);

    ctx.restore();

    // grade / vignette
    Art.drawAmbient(ctx, m, canvas.width, canvas.height, state.time);
  }

  function init(g) {
    game = g;
    if (!playerStyle) refreshStyles();
    if (!state.particles.length || !map()) resetView();
    state.prevX = state.x; state.prevY = state.y; state.stepT = 1;
    UI.updateHud(map().name, game.party);
  }

  return { state, init, draw, update, step, interact, setMap, encounter };
})();

/* ============================================================
   Pokémon Eclipse — turn-based battle system

   World integration contract (js/world.js is not present in this
   checkout):
   - Call Battle.start({ type:'wild', party, wild:{ species, level }, ... })
     or Battle.start({ type:'trainer', party, trainerId, ... }).
   - party is the live array of member objects: { species (or id), level,
     hp, maxHp, moves:[moveId,...], status?, xp? }. Missing combat fields
     are initialized in place; battle changes (HP, status, XP, evolution,
     captured team members, money) remain on the supplied objects/arrays.
   - Optional args: inventory (quantity map), player (object with money),
     trainer (trainer data object), `teamBattle:true` for two active Pokémon
     per side, and onEnd(result). Trainer teams are sent out sequentially.
     The returned session has `finished` and a promise that resolves to the
     final result. A wild encounter may also pass `canRun:false` or
     `canCapture:false`.
   - The global Battle API also exposes createMember(species, level, opts),
     wild(...), trainer(...), and active.
   ============================================================ */
'use strict';

const Battle = (() => {
  const IDLE = 'idle';
  let current = null;

  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
  const number = (value, fallback) => Number.isFinite(Number(value)) ? Number(value) : fallback;
  const titleCase = value => String(value || '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  const speciesOf = mon => mon?.species || mon?.id || mon?.speciesId || '';
  const speciesData = mon => SPECIES[speciesOf(mon)] || {};
  const moveId = move => typeof move === 'string' ? move : move?.id || move?.move || '';
  const validMove = id => MOVES[id] || null;
  const cloneTeamEntry = entry => Array.isArray(entry)
    ? { species: entry[0], level: entry[1] }
    : { ...(entry || {}) };

  function createMember(species, level = 5, options = {}) {
    const data = SPECIES[species];
    if (!data) throw new Error(`Unknown Pokémon species: ${species}`);
    const mon = {
      species, name: options.name || data.name, level: Math.max(1, number(level, 5)),
      xp: Math.max(0, number(options.xp, 0)), status: options.status || null,
      moves: (options.moves || data.moves || ['tackle']).slice(0, 4),
      maxHp: 1, hp: 1, stats: {},
      ...(options || {})
    };
    mon.species = species;
    mon.level = Math.max(1, Math.floor(number(mon.level, 5)));
    mon.moves = (Array.isArray(mon.moves) ? mon.moves : data.moves || ['tackle'])
      .map(moveId).filter(id => id && validMove(id)).slice(0, 4);
    if (!mon.moves.length) mon.moves = ['tackle'];
    refreshStats(mon, true);
    if (Number.isFinite(Number(options.maxHp))) mon.maxHp = Math.max(1, Number(options.maxHp));
    mon.hp = Math.max(0, Math.min(mon.maxHp, number(options.hp, mon.maxHp)));
    mon.status = options.status || null;
    mon.xp = Math.max(0, number(options.xp, mon.xp));
    mon.stages = mon.stages || {};
    mon.pp = mon.pp && typeof mon.pp === 'object' ? mon.pp : {};
    for (const id of mon.moves) {
      const move = validMove(id);
      if (move && !Number.isFinite(Number(mon.pp[id]))) mon.pp[id] = move.pp;
    }
    return mon;
  }

  function refreshStats(mon, preserveRatio = false) {
    const data = speciesData(mon);
    const base = Array.isArray(data.base) ? data.base : [45, 49, 49, 45, 65, 45];
    const level = Math.max(1, number(mon.level, 5));
    const oldMax = Math.max(1, number(mon.maxHp, 1));
    const oldHp = number(mon.hp, oldMax);
    const stats = {
      hp: Math.floor((2 * number(base[0], 45) * level) / 100) + level + 10,
      atk: Math.floor((2 * number(base[1], 49) * level) / 100) + 5,
      def: Math.floor((2 * number(base[2], 49) * level) / 100) + 5,
      spa: Math.floor((2 * number(base[3], 45) * level) / 100) + 5,
      spd: Math.floor((2 * number(base[4], 65) * level) / 100) + 5,
      spe: Math.floor((2 * number(base[5], 45) * level) / 100) + 5
    };
    mon.stats = stats;
    mon.maxHp = stats.hp;
    mon.hp = preserveRatio ? Math.max(0, Math.min(stats.hp, Math.round(oldHp / oldMax * stats.hp))) : stats.hp;
  }

  function ensureMember(mon) {
    if (!mon || typeof mon !== 'object') return null;
    const species = speciesOf(mon);
    const data = SPECIES[species];
    if (!data) return null;
    mon.species = species;
    mon.name = mon.name || data.name;
    mon.level = Math.max(1, Math.floor(number(mon.level, 5)));
    mon.xp = Math.max(0, number(mon.xp ?? mon.exp, 0));
    if (!Array.isArray(mon.moves)) mon.moves = (data.moves || ['tackle']).slice(0, 4);
    mon.moves = mon.moves.map(moveId).filter(id => id && validMove(id)).slice(0, 4);
    if (!mon.moves.length) mon.moves = ['tackle'];
    mon.status = mon.status || null;
    if (!mon.stats || !Number.isFinite(Number(mon.maxHp))) refreshStats(mon, false);
    else {
      mon.maxHp = Math.max(1, number(mon.maxHp, 1));
      mon.hp = Math.max(0, Math.min(mon.maxHp, number(mon.hp, mon.maxHp)));
    }
    mon.stages = mon.stages || {};
    mon.pp = mon.pp && typeof mon.pp === 'object' ? mon.pp : {};
    for (const id of mon.moves) {
      const move = validMove(id);
      if (move && !Number.isFinite(Number(mon.pp[id]))) mon.pp[id] = move.pp;
    }
    return mon;
  }

  function memberName(mon) { return mon.nickname || mon.name || speciesData(mon).name || titleCase(speciesOf(mon)); }
  function alive(mon) { return !!mon && number(mon.hp, 0) > 0; }
  function activeIndexes(team, count) {
    const indexes = [];
    for (let i = 0; i < team.length && indexes.length < count; i++) if (alive(team[i])) indexes.push(i);
    return indexes;
  }
  function say(session, text) {
    if (!session || session.ended) return Promise.resolve();
    session.message = String(text || '');
    render(session);
    return new Promise(resolve => { session.continueResolve = resolve; });
  }
  function advance(session) {
    if (session?.continueResolve) {
      const resolve = session.continueResolve;
      session.continueResolve = null;
      resolve();
    }
  }
  function message(session, text, delay = 0) {
    session.message = String(text || '');
    render(session);
    return delay ? sleep(delay) : Promise.resolve();
  }

  function ensureBattleStyles() {
    if (document.getElementById('battle-styles')) return;
    const style = document.createElement('style');
    style.id = 'battle-styles';
    style.textContent = `
      .battle-root{position:absolute;inset:0;z-index:5;overflow:hidden;background:#10172b;color:#f4f7ff;font-family:inherit}
      .battle-scene{position:absolute;inset:0;width:100%;height:100%;image-rendering:pixelated}
      .battle-status{position:absolute;z-index:1;width:min(34%,310px);padding:10px 12px;color:#18213a;background:linear-gradient(135deg,#fffef2,#e3e9f4);border:3px solid #293658;border-radius:12px;box-shadow:0 4px 0 #111a31;font:600 clamp(12px,1.8vw,18px)/1.4 system-ui,sans-serif}
      .battle-status.foe-status{top:8%;left:5%}.battle-status.ally-status{right:5%;top:48%}
      .battle-status span{float:right;color:#46516b;font-size:.8em}.battle-status small{display:block;text-align:right;font-size:.72em;color:#46516b}
      .battle-hp{height:9px;margin:6px 0 2px;background:#aab2c2;border:1px solid #67718a;border-radius:8px;overflow:hidden}.battle-hp i{display:block;height:100%;transition:width .25s}
      .battle-ui{position:absolute;z-index:2;left:2%;right:2%;bottom:2%;min-height:20%;display:grid;grid-template-columns:1.5fr 1fr;gap:12px;padding:12px;background:linear-gradient(135deg,rgba(18,26,52,.97),rgba(8,12,28,.98));border:3px solid #d5d9e8;border-radius:12px;box-shadow:0 0 0 3px #28365e,0 8px 20px #0008}
      .battle-text{display:flex;align-items:center;padding:8px;font:clamp(14px,2vw,21px)/1.45 system-ui,sans-serif;cursor:pointer}
      .battle-cmd{display:grid;grid-template-columns:1fr 1fr;gap:8px;align-content:center}
      .battle-cmd button{min-height:42px;padding:8px;color:#f5f7ff;background:linear-gradient(#364778,#202b4d);border:2px solid #7889bc;border-radius:8px;font:600 clamp(12px,1.7vw,17px) system-ui,sans-serif;cursor:pointer}
      .battle-cmd button:hover,.battle-cmd button:focus-visible{background:linear-gradient(#5268a5,#334574);outline:2px solid #ffe58a;outline-offset:1px}
      .battle-cmd button:disabled{opacity:.45;cursor:not-allowed}
      @media(max-width:560px){.battle-status{width:42%;padding:7px}.battle-ui{grid-template-columns:1fr;gap:4px;padding:8px}.battle-text{min-height:34px}.battle-cmd button{min-height:36px}}
    `;
    document.head.append(style);
  }
  function mount(session) {
    const frame = document.getElementById('gameframe');
    if (!frame) return;
    ensureBattleStyles();
    const root = document.createElement('div');
    root.className = 'battle-root';
    root.setAttribute('role', 'region');
    root.setAttribute('aria-label', 'Pokémon battle');
    root.innerHTML = `
      <canvas class="battle-scene" width="960" height="720" aria-hidden="true"></canvas>
      <div class="battle-status foe-status"></div><div class="battle-status ally-status"></div>
      <div class="battle-ui">
        <div class="battle-text" aria-live="polite"></div>
        <div class="battle-cmd"></div>
      </div>`;
    frame.append(root);
    session.root = root;
    session.scene = root.querySelector('.battle-scene');
    session.textNode = root.querySelector('.battle-text');
    session.commandNode = root.querySelector('.battle-cmd');
    session.foeStatus = root.querySelector('.foe-status');
    session.allyStatus = root.querySelector('.ally-status');
    session.sceneTime = 0;
    session.sceneStart = performance.now();
    const tickScene = now => {
      if (!session.root) return;
      session.sceneTime = (now - session.sceneStart) / 1000;
      drawScene(session);
      session.raf = requestAnimationFrame(tickScene);
    };
    session.raf = requestAnimationFrame(tickScene);
    session.keyHandler = event => {
      if (event.key === 'Enter' || event.key === ' ' || event.key.toLowerCase() === 'z') {
        if (session.continueResolve) { event.preventDefault(); advance(session); }
      }
      if (event.key === 'Escape' || event.key.toLowerCase() === 'x') {
        if (session.submenu) { event.preventDefault(); showCommands(session); }
      }
    };
    document.addEventListener('keydown', session.keyHandler, true);
    session.commandNode.addEventListener('click', event => {
      const button = event.target.closest('button[data-action]');
      if (button && !button.disabled) handleCommand(session, button.dataset.action);
    });
    session.textNode.addEventListener('click', () => advance(session));
  }

  function statusLabel(mon) {
    if (!mon?.status) return '';
    return ({ para:'PAR', burn:'BRN', poison:'PSN', sleep:'SLP', freeze:'FRZ' })[mon.status] || String(mon.status).toUpperCase();
  }
  function hpColor(mon) {
    const ratio = mon.maxHp ? mon.hp / mon.maxHp : 0;
    return ratio > .5 ? '#3ddc84' : ratio > .2 ? '#f5c542' : '#ef4444';
  }
  function statusMarkup(mon, enemy = false) {
    if (!mon) return '';
    const ratio = Math.max(0, Math.min(1, mon.hp / Math.max(1, mon.maxHp)));
    const data = speciesData(mon);
    return `<strong>${escapeHtml(memberName(mon))}</strong><span>Lv ${mon.level}${statusLabel(mon) ? ` · ${statusLabel(mon)}` : ''}</span>
      <div class="battle-hp"><i style="width:${ratio * 100}%;background:${hpColor(mon)}"></i></div>
      <small>${mon.hp} / ${mon.maxHp} HP</small>`;
  }
  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[char]);
  }
  function render(session) {
    if (!session?.root) return;
    session.textNode.textContent = session.message || '';
    const foe = session.foes[session.foeActive[0]];
    const ally = session.party[session.playerActive[0]];
    session.foeStatus.innerHTML = statusMarkup(foe, true);
    session.allyStatus.innerHTML = statusMarkup(ally, false);
    drawScene(session);
  }

  function battleTheme(session) {
    if (Art.battleThemeFor) {
      const map = MAPS[session.area] || MAPS[session.location] || null;
      if (map) return Art.battleThemeFor(map);
    }
    return session.areaTheme || 'route';
  }

  function drawScene(session) {
    const canvas = session.scene;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    const w = canvas.width, h = canvas.height;
    const time = session.sceneTime ?? performance.now() / 1000;
    const theme = battleTheme(session);
    let arena = null;
    if (Art.drawBattleBackground) arena = Art.drawBattleBackground(ctx, w, h, theme, time);
    else {
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, '#18204a'); grad.addColorStop(.55, '#527544'); grad.addColorStop(1, '#1a3429');
      ctx.fillStyle = grad; ctx.fillRect(0, 0, w, h);
    }
    if (arena && Art.drawBattlePlatforms) Art.drawBattlePlatforms(ctx, arena);

    const foes = session.foeActive.map(i => session.foes[i]).filter(Boolean);
    const allies = session.playerActive.map(i => session.party[i]).filter(Boolean);
    const foeX = arena ? arena.foe.x : 720, foeY = arena ? arena.foe.y : 388;
    const allyX = arena ? arena.ally.x : 270, allyY = arena ? arena.ally.y : 624;
    foes.forEach((mon, i) => {
      if (!alive(mon)) return;
      const bob = Math.sin(time * 1.6 + i) * 3;
      drawCreature(ctx, speciesOf(mon), foeX - 95 + i * 120, foeY - 183 + bob - i * 14, 190, { flip: true });
    });
    allies.forEach((mon, i) => {
      if (!alive(mon)) return;
      const bob = Math.sin(time * 1.9 + i * 1.4) * 2;
      drawCreature(ctx, speciesOf(mon), allyX - 115 + i * 124, allyY - 224 + bob - i * 16, 230);
    });
    if (arena) drawWeather(ctx, w, h, time, theme);
  }

  function drawWeather(ctx, w, h, time, theme) {
    ctx.save();
    if (theme === 'snow' || theme === 'summit') {
      for (let i = 0; i < 60; i++) {
        const s = i * 53.7;
        const x = (s * 7 + time * 26 + Math.sin(time * .7 + i) * 18) % w;
        const y = (s * 11 + time * 48 + i * 5) % h;
        ctx.fillStyle = `rgba(255,255,255,${.3 + .4 * Math.abs(Math.sin(time + i))})`;
        ctx.fillRect(x, y, i % 7 ? 1 : 2, i % 7 ? 1 : 2);
      }
    } else if (theme === 'sand') {
      for (let i = 0; i < 46; i++) {
        const s = i * 71.3;
        const x = (s * 5 + time * 120) % w;
        const y = (s * 13 + Math.sin(time + i) * 16) % h;
        ctx.fillStyle = 'rgba(255,232,176,.28)';
        ctx.fillRect(x, y, 3, 1);
      }
    } else if (theme === 'paradox') {
      for (let i = 0; i < 40; i++) {
        const s = i * 39.1;
        const x = (s * 9 + Math.sin(time * .5 + i) * 24) % w;
        const y = h - ((s * 17 + time * 30) % h);
        ctx.fillStyle = `rgba(220,170,255,${.2 + .3 * Math.abs(Math.sin(time * 1.4 + i))})`;
        ctx.fillRect(x, y, 2, 4);
      }
    }
    ctx.restore();
  }

  function setCommands(session, entries) {
    if (!session.commandNode) return;
    session.commandNode.replaceChildren();
    for (const entry of entries) {
      const button = document.createElement('button');
      button.type = 'button'; button.dataset.action = entry.action;
      button.textContent = entry.label; button.disabled = !!entry.disabled;
      session.commandNode.append(button);
    }
  }
  function showCommands(session) {
    if (session.ended) return;
    session.submenu = false;
    setCommands(session, [
      { action:'fight', label:'Fight' }, { action:'bag', label:'Bag' },
      { action:'party', label:'Pokémon' }, { action:'run', label:'Run', disabled:!session.wild || session.canRun === false }
    ]);
    render(session);
  }
  function ability(mon) { return ABILITIES[speciesData(mon).ability] || {}; }
  function types(mon) { return speciesData(mon).types || ['Normal']; }
  function stageMultiplier(stage) { return stage >= 0 ? (2 + stage) / 2 : 2 / (2 - stage); }
  function statValue(mon, stat) {
    const baseStat = number(mon.stats?.[stat], 50);
    let value = baseStat * stageMultiplier(number(mon.stages?.[stat], 0));
    if (stat === 'spe' && mon.status === 'para') value *= .5;
    if (stat === 'atk' && mon.status === 'burn') value *= .5;
    return Math.max(1, value);
  }
  function changeStage(session, mon, stat, amount, targetName) {
    if (!mon || !amount) return;
    const def = ability(mon);
    if (amount < 0 && def.clearBody) return;
    const before = number(mon.stages[stat], 0);
    const after = Math.max(-6, Math.min(6, before + amount));
    if (before === after) return;
    mon.stages[stat] = after;
    session.message = `${memberName(mon)}'s ${stat.toUpperCase()} ${after > before ? 'rose' : 'fell'}!`;
  }
  function updateHud(session) {
    const state = session.state;
    if (typeof UI !== 'undefined' && UI.updateHud) UI.updateHud(state.locationName || state.location || '', session.party);
  }
  function adjustItemCount(session, id, amount) {
    const bag = session.inventory;
    if (!bag) return;
    if (typeof bag[id] === 'number') bag[id] = Math.max(0, bag[id] + amount);
    else if (bag.items && typeof bag.items[id] === 'number') bag.items[id] = Math.max(0, bag.items[id] + amount);
    else bag[id] = Math.max(0, number(bag[id], 0) + amount);
  }
  function itemCount(session, id) {
    const bag = session.inventory || {};
    return number(bag[id] ?? bag.items?.[id], 0);
  }
  function pickEntry(title, entries) {
    if (!entries.length || typeof UI === 'undefined' || !UI.menu) return Promise.resolve(null);
    return UI.menu(title, entries);
  }
  function prompt(session, text) {
    return typeof UI !== 'undefined' && UI.say ? UI.say(text) : message(session, text);
  }
  function updateStatus(session, mon, status) {
    if (!mon || mon.status) return false;
    const immunity = ability(mon).statusImmune || [];
    if (immunity.includes(status)) return false;
    const ownTypes = types(mon);
    if ((status === 'burn' && ownTypes.includes('Fire')) ||
        (status === 'poison' && ownTypes.includes('Poison')) ||
        (status === 'para' && ownTypes.includes('Electric')) ||
        (status === 'freeze' && ownTypes.includes('Ice'))) return false;
    mon.status = status;
    const wording = { burn:'was burned', poison:'was poisoned', para:'is paralyzed', sleep:'fell asleep', freeze:'was frozen' };
    session.message = `${memberName(mon)} ${wording[status] || `was affected by ${status}`}!`;
    return true;
  }
  function applyMoveEffects(session, user, target, move, hit) {
    if (move.heal) {
      const amount = Math.max(1, Math.floor(user.maxHp * move.heal));
      const actual = Math.min(amount, user.maxHp - user.hp); user.hp += actual;
      session.message = actual ? `${memberName(user)} restored ${actual} HP!` : 'But it failed!';
    }
    for (const [stat, amount] of Object.entries(move.self || {})) changeStage(session, user, stat, amount);
    for (const [stat, amount] of Object.entries(move.foe || {})) changeStage(session, target, stat, amount);
    if (move.eff && (move.cat === 'status' || !hit || hit.damage > 0) && Math.random() * 100 < number(move.eff.chance, 100)) {
      if (move.eff.status) updateStatus(session, move.eff.target === 'self' ? user : target, move.eff.status);
      if (move.eff.stat) changeStage(session, move.eff.target === 'self' ? user : target, move.eff.stat, number(move.eff.stages, -1));
    }
  }
  function calculateDamage(user, target, move) {
    if (!move || !move.power) return { damage:0, effectiveness:1, critical:false };
    const def = ability(target), userAbility = ability(user);
    const atkStat = move.cat === 'spec' ? 'spa' : 'atk';
    const defStat = move.cat === 'spec' ? 'spd' : 'def';
    let effectiveness = typeEff(move.type, types(target));
    if (def.immune?.includes(move.type)) effectiveness = 0;
    if (def.absorb === move.type) return { damage:0, effectiveness:0, absorbed:true, heal:true, critical:false };
    let power = move.power;
    if (userAbility.pinch === move.type && user.hp <= user.maxHp / 3) power *= 1.5;
    if (userAbility.boost && (userAbility.boost.type === move.type || userAbility.boost.type === 'all')) power *= userAbility.boost.mult;
    if (def.resist?.[move.type]) effectiveness *= def.resist[move.type];
    if (def.multiscale && target.hp === target.maxHp) effectiveness *= .5;
    const critChance = .04 * (1 + number(move.crit, 0) + number(userAbility.crit, 0));
    const critical = Math.random() < critChance;
    const randomFactor = .85 + Math.random() * .15;
    const stab = types(user).includes(move.type) ? 1.5 : 1;
    const base = Math.floor((((2 * user.level / 5 + 2) * power * statValue(user, atkStat) / statValue(target, defStat)) / 50) + 2);
    const damage = effectiveness === 0 ? 0 : Math.max(1, Math.floor(base * effectiveness * stab * (critical ? 1.5 : 1) * randomFactor));
    return { damage, effectiveness, critical, absorbed:false };
  }
  async function performMove(session, user, target, id) {
    if (!alive(user) || !alive(target)) return;
    const move = validMove(id) || validMove('tackle');
    if (user.recharge) { user.recharge = false; await message(session, `${memberName(user)} must recharge!`); return; }
    const pp = number(user.pp?.[move.id], move.pp);
    if (pp <= 0) { await message(session, `${memberName(user)} has no ${move.name} PP left!`); return; }
    user.pp[move.id] = pp - 1;
    if (user.status === 'sleep') {
      if (Math.random() < .34) user.status = null;
      else { await message(session, `${memberName(user)} is fast asleep!`); return; }
    }
    if (user.status === 'freeze') {
      if (Math.random() < .2) user.status = null;
      else { await message(session, `${memberName(user)} is frozen solid!`); return; }
    }
    if (user.status === 'para' && Math.random() < .25) { await message(session, `${memberName(user)} is paralyzed! It can’t move!`); return; }
    if (Math.random() * 100 >= number(move.acc, 100)) { await message(session, `${memberName(user)} used ${move.name}, but it missed!`); return; }
    const result = calculateDamage(user, target, move);
    await message(session, `${memberName(user)} used ${move.name}!`);
    if (move.protect) {
      user.protected = true;
      await message(session, `${memberName(user)} protected itself!`);
      return;
    }
    if (target.protected) { await message(session, `${memberName(target)} protected itself!`); return; }
    if (result.absorbed && result.heal) {
      target.hp = Math.min(target.maxHp, target.hp + Math.max(1, Math.floor(target.maxHp / 4)));
      await message(session, `${memberName(target)} absorbed the attack and restored HP!`); return;
    }
    if (result.damage > 0) {
      let damage = result.damage;
      if (ability(target).sturdy && target.hp === target.maxHp && damage >= target.hp) damage = target.hp - 1;
      if (ability(target).disguise && !target.disguiseBroken) { target.disguiseBroken = true; damage = 0; await message(session, `${memberName(target)}'s disguise absorbed the hit!`); }
      else {
        target.hp = Math.max(0, target.hp - damage);
        if (result.critical) await message(session, 'A critical hit!');
        if (result.effectiveness > 1) await message(session, "It's super effective!");
        else if (result.effectiveness > 0 && result.effectiveness < 1) await message(session, "It's not very effective…");
        if (move.drain) user.hp = Math.min(user.maxHp, user.hp + Math.max(1, Math.floor(damage * move.drain)));
        if (move.recoil) user.hp = Math.max(0, user.hp - Math.max(1, Math.floor(damage * move.recoil)));
        if (move.contact) {
          const contact = ability(target);
          if (contact.contactRecoil) user.hp = Math.max(0, user.hp - Math.max(1, Math.floor(user.maxHp * contact.contactRecoil)));
          if (contact.contact && Math.random() * 100 < contact.contact.chance) updateStatus(session, user, contact.contact.status);
        }
      }
      const retaliatory = ability(target).onHitBy;
      if (retaliatory?.type === move.type) changeStage(session, target, retaliatory.stat, retaliatory.stages);
    }
    if (move.recharge) user.recharge = true;
    if (move.cat === 'status' || target.hp > 0) applyMoveEffects(session, user, target, move, result);
    updateHud(session); render(session);
    if (target.hp <= 0) await faint(session, target, user);
  }
  async function faint(session, mon, victor) {
    await message(session, `${memberName(mon)} fainted!`);
    if (victor && session.party.includes(victor) && session.foes.includes(mon)) await grantExperience(session, victor, mon);
  }
  async function grantExperience(session, winner, defeated) {
    const data = speciesData(defeated);
    const gain = Math.max(1, Math.floor(number(data.xpYield, 50) * defeated.level / 7 * (session.wild ? 1 : 1.5)));
    winner.xp = number(winner.xp, 0) + gain;
    await message(session, `${memberName(winner)} gained ${gain} EXP!`);
    while (winner.xp >= winner.level ** 3 && winner.level < 100) {
      winner.xp -= winner.level ** 3;
      winner.level++;
      const oldMax = winner.maxHp;
      refreshStats(winner, true);
      winner.hp = Math.min(winner.maxHp, winner.hp + winner.maxHp - oldMax);
      await message(session, `${memberName(winner)} grew to level ${winner.level}!`);
      const evo = speciesData(winner).evolve;
      if (evo && winner.level >= evo[1] && SPECIES[evo[0]]) await evolve(session, winner, evo[0]);
    }
    updateHud(session);
  }
  async function evolve(session, mon, species) {
    const oldName = memberName(mon), data = SPECIES[species];
    await message(session, `What? ${oldName} is evolving!`);
    mon.species = species; mon.name = data.name; mon.moves = (data.moves || mon.moves).slice(0, 4); mon.pp = {};
    mon.stages = {}; refreshStats(mon, true);
    await message(session, `Congratulations! ${oldName} evolved into ${data.name}!`);
  }
  async function end(session, result) {
    if (session.ended) return;
    session.ended = true; session.result = result;
    if (session.continueResolve) advance(session);
    if (session.keyHandler) document.removeEventListener('keydown', session.keyHandler, true);
    if (session.raf) cancelAnimationFrame(session.raf);
    if (session.root) session.root.remove();
    if (typeof UI !== 'undefined' && UI.close) UI.close();
    current = null;
    session.resolve(result);
    session.onEnd?.(result);
  }
  async function useItem(session, itemId, target) {
    const item = ITEMS[itemId];
    if (!item || itemCount(session, itemId) <= 0) return false;
    if (item.kind === 'ball') {
      if (!session.wild) { await message(session, 'You can’t catch a Trainer’s Pokémon!'); return false; }
      if (session.canCapture === false) { await message(session, 'You can’t catch Pokémon here!'); return false; }
      adjustItemCount(session, itemId, -1);
      if (typeof Sound !== 'undefined') Sound.sfx('ball');
      const wild = session.foes[session.foeActive[0]];
      const rate = number(speciesData(wild).catchRate, 45) * item.rate * (1 + (1 - wild.hp / wild.maxHp) * 2);
      if (Math.random() * 255 < rate || item.rate >= 255) {
        await message(session, `Gotcha! ${memberName(wild)} was caught!`);
        const captured = createMember(speciesOf(wild), wild.level, { hp:wild.hp, name:wild.name });
        if (session.party.length < 6) session.party.push(captured);
        else {
          const box = Array.isArray(session.state.pc) ? session.state.pc
            : Array.isArray(session.state.storage) ? session.state.storage
            : (session.state.storage = []);
          box.push(captured);
        }
        updateHud(session);
        await end(session, { outcome:'caught', captured });
      } else {
        await message(session, `Oh no! ${memberName(wild)} broke free!`);
      }
      return true;
    }
    if (!target) return false;
    if (item.kind === 'heal') {
      if (!alive(target)) return false;
      const amount = Math.min(target.maxHp - target.hp, number(item.heal, 0));
      if (!amount) return false;
      target.hp += amount;
    } else if (item.kind === 'revive') {
      if (alive(target)) return false;
      target.hp = Math.max(1, Math.floor(target.maxHp / 2));
    } else if (item.kind === 'cure' || item.kind === 'cure_one') {
      if (!target.status || (item.status && target.status !== item.status)) return false;
      target.status = null;
    } else if (item.kind === 'level') {
      if (target.level >= 100) return false;
      target.level++; refreshStats(target, true);
    } else return false;
    adjustItemCount(session, itemId, -1);
    updateHud(session);
    await message(session, `Used ${item.name} on ${memberName(target)}!`);
    return true;
  }
  async function openBag(session) {
    const keys = Object.keys(ITEMS).filter(id => itemCount(session, id) > 0 && ITEMS[id].kind !== 'key' && ITEMS[id].kind !== 'tm');
    const entries = keys.map(id => ({ label:`${ITEMS[id].name} ×${itemCount(session, id)}`, value:id }));
    entries.push({ label:'Back', value:'back' });
    const id = await pickEntry('Bag', entries);
    if (!id || id === 'back') { showCommands(session); return; }
    const item = ITEMS[id];
    let target = null;
    if (item.kind !== 'ball') target = await chooseParty(session, item.kind === 'revive' ? 'Choose a Pokémon to revive' : 'Choose a Pokémon', true, item.kind === 'revive');
    const used = await useItem(session, id, target);
    if (!session.ended && used) await enemyTurn(session);
    if (!session.ended) showCommands(session);
  }
  async function chooseParty(session, title = 'Choose a Pokémon', allowCancel = true, allowFainted = false) {
    const entries = session.party.map((mon, i) => ({
      label:`${memberName(mon)} Lv${mon.level} · ${mon.hp}/${mon.maxHp} HP${mon.status ? ` · ${statusLabel(mon)}` : ''}`,
      value:i, disabled:!allowFainted && !alive(mon)
    }));
    if (allowCancel) entries.push({ label:'Back', value:'back' });
    const index = await pickEntry(title, entries);
    return index === null || index === 'back' ? null : session.party[index];
  }
  async function openParty(session, forced = false) {
    const available = session.party.map((m,i)=>({m,i})).filter(({m,i}) => alive(m) && !session.playerActive.includes(i));
    const entries = available.map(({m,i}) => ({ label:`${memberName(m)} Lv${m.level} · ${m.hp}/${m.maxHp} HP`, value:i }));
    if (!forced) entries.push({ label:'Back', value:'back' });
    if (!entries.length) { await message(session, 'There are no other able Pokémon!'); if (!forced) showCommands(session); return; }
    const index = await pickEntry('Choose a Pokémon', entries);
    if (index === null || index === 'back') { if (forced) return openParty(session, true); showCommands(session); return; }
    const old = session.playerActive[0]; session.playerActive[0] = index;
    session.party[index].stages = {};
    await message(session, `Go! ${memberName(session.party[index])}!`);
    updateHud(session);
    if (!forced && old !== index) await enemyTurn(session);
    if (!session.ended) showCommands(session);
  }
  async function chooseMove(session) {
    const actors = session.playerActive.map(i => session.party[i]).filter(alive);
    const actions = [];
    for (const mon of actors) {
      const entries = mon.moves.map(id => {
        const move = validMove(id);
        return { label:`${move?.name || titleCase(id)} · ${number(mon.pp?.[id], move?.pp || 0)} PP`, value:id, disabled:!move || number(mon.pp?.[id], move?.pp || 0) <= 0 };
      });
      entries.push({ label:'Back', value:'back' });
      const id = await pickEntry(`Choose a move for ${memberName(mon)}`, entries);
      if (!id || id === 'back') { showCommands(session); return; }
      const targets = session.foeActive.filter(i => alive(session.foes[i]));
      let targetIndex = targets[0];
      if (targets.length > 1) {
        const target = await pickEntry('Choose a target', targets.map(i => ({ label:memberName(session.foes[i]), value:i })));
        if (target === null || target === undefined) { showCommands(session); return; }
        targetIndex = target;
      }
      actions.push({ user:mon, targetIndex, id });
    }
    session.commandNode.replaceChildren();
    await playerTurn(session, { type:'move', actions });
  }
  async function enemyTurn(session) {
    if (session.ended) return;
    const targets = session.playerActive.map(i => session.party[i]).filter(alive);
    const actions = session.foeActive.map(i => session.foes[i]).filter(alive).map(foe => {
      const options = foe.moves.map(validMove).filter(m => m && number(foe.pp?.[m.id], m.pp) > 0);
      const move = options.length ? options[Math.floor(Math.random() * options.length)] : validMove('tackle');
      return { user:foe, target:targets[Math.floor(Math.random() * targets.length)], move };
    }).filter(action => action.target);
    for (const action of actions) {
      if (!alive(action.user) || !alive(action.target)) continue;
      await performMove(session, action.user, action.target, action.move.id);
    }
    await resolveRound(session);
  }
  async function playerTurn(session, action) {
    if (action.type === 'move') {
      const turns = action.actions.map(({ user, targetIndex, id }) => ({
        user, target:session.foes[targetIndex], move:validMove(id) || validMove('tackle'), player:true
      }));
      for (const foe of session.foeActive.map(i => session.foes[i]).filter(alive)) {
        const targets = session.playerActive.map(i => session.party[i]).filter(alive);
        if (!targets.length) break;
        const options = foe.moves.map(validMove).filter(m => m && number(foe.pp?.[m.id], m.pp) > 0);
        const move = options.length ? options[Math.floor(Math.random() * options.length)] : validMove('tackle');
        turns.push({ user:foe, target:targets[Math.floor(Math.random() * targets.length)], move });
      }
      turns.sort((a, b) => number(b.move.prio, 0) - number(a.move.prio, 0) || statValue(b.user, 'spe') - statValue(a.user, 'spe'));
      for (const turn of turns) {
        if (!alive(turn.user) || !alive(turn.target)) continue;
        await performMove(session, turn.user, turn.target, turn.move.id);
        if (session.ended) return;
      }
    }
    await resolveRound(session);
  }
  async function resolveRound(session) {
    if (session.ended) return;
    if (session.foes.every(m => !alive(m))) return finishVictory(session);
    if (!session.teamBattle && !alive(session.party[session.playerActive[0]])) {
      const next = session.party.findIndex((m,i)=>alive(m) && i !== session.playerActive[0]);
      if (next < 0) return finishDefeat(session);
      await message(session, 'Choose another Pokémon.');
      return openParty(session, true);
    }
    if (session.teamBattle) {
      for (let slot = 0; slot < session.playerActive.length; slot++) {
        if (alive(session.party[session.playerActive[slot]])) continue;
        const used = new Set(session.playerActive.filter((_, i) => i !== slot));
        const next = session.party.findIndex((m, i) => alive(m) && !used.has(i));
        if (next >= 0) {
          session.playerActive[slot] = next;
          await message(session, `Go! ${memberName(session.party[next])}!`);
        }
      }
      for (let slot = 0; slot < session.foeActive.length; slot++) {
        if (alive(session.foes[session.foeActive[slot]])) continue;
        const used = new Set(session.foeActive.filter((_, i) => i !== slot));
        const next = session.foes.findIndex((m, i) => alive(m) && !used.has(i));
        if (next >= 0) {
          session.foeActive[slot] = next;
          await message(session, `${session.trainer.name || 'Trainer'} sent out ${memberName(session.foes[next])}!`);
        }
      }
    }
    const activeParty = [...new Set(session.playerActive)].map(i => session.party[i]).filter(Boolean);
    const activeFoes = [...new Set(session.foeActive)].map(i => session.foes[i]).filter(Boolean);
    for (const mon of [...activeParty, ...activeFoes]) {
      mon.protected = false;
      if (!alive(mon)) continue;
      const passive = ability(mon).healTurn;
      if (passive) mon.hp = Math.min(mon.maxHp, mon.hp + Math.max(1, Math.floor(mon.maxHp * passive)));
      if (mon.status === 'burn' || mon.status === 'poison') mon.hp = Math.max(0, mon.hp - Math.max(1, Math.floor(mon.maxHp / 8)));
      if (!alive(mon)) await faint(session, mon, session.foes.includes(mon) ? activeParty[0] : activeFoes[0]);
    }
    updateHud(session);
    if (session.party.every(m=>!alive(m))) return finishDefeat(session);
    if (session.foes.every(m=>!alive(m))) return finishVictory(session);
    if (session.teamBattle) {
      for (let slot = 0; slot < session.playerActive.length; slot++) {
        if (alive(session.party[session.playerActive[slot]])) continue;
        const used = new Set(session.playerActive.filter((_, i) => i !== slot));
        const next = session.party.findIndex((m, i) => alive(m) && !used.has(i));
        if (next >= 0) session.playerActive[slot] = next;
      }
      for (let slot = 0; slot < session.foeActive.length; slot++) {
        if (alive(session.foes[session.foeActive[slot]])) continue;
        const used = new Set(session.foeActive.filter((_, i) => i !== slot));
        const next = session.foes.findIndex((m, i) => alive(m) && !used.has(i));
        if (next >= 0) session.foeActive[slot] = next;
      }
    } else if (!alive(session.foes[session.foeActive[0]])) {
      const nextFoe = session.foes.findIndex(m => alive(m));
      if (nextFoe >= 0) {
        session.foeActive[0] = nextFoe;
        await message(session, `${session.trainer.name || 'Trainer'} sent out ${memberName(session.foes[nextFoe])}!`);
      }
    }
    render(session); showCommands(session);
  }
  async function finishVictory(session) {
    if (session.ended) return;
    if (!session.wild) {
      const reward = Math.max(0, number(session.trainer.reward, 0));
      session.player.money = number(session.player.money, 0) + reward;
      session.state.money = session.player.money;
      if (reward) await message(session, `You won ₽${reward}!`);
      if (session.trainer.win?.length) await message(session, session.trainer.win.join(' '));
    }
    await end(session, { outcome:'win', trainerId:session.trainerId });
  }
  async function finishDefeat(session) {
    const loss = Math.floor(Math.max(0, number(session.player.money, 0)) / 10);
    session.player.money = Math.max(0, number(session.player.money, 0) - loss); session.state.money = session.player.money;
    await message(session, 'All your Pokémon have fainted…');
    await end(session, { outcome:'loss', loss });
  }
  async function handleCommand(session, action) {
    if (session.ended) return;
    if (action === 'fight') return chooseMove(session);
    if (action === 'bag') return openBag(session);
    if (action === 'party') return openParty(session);
    if (action === 'run') {
      if (session.wild && session.canRun !== false) {
        const ally = session.party[session.playerActive[0]], foe = session.foes[session.foeActive[0]];
        if (Math.random() < .5 + (statValue(ally,'spe') - statValue(foe,'spe')) * 0.02) {
          await message(session, 'Got away safely!'); await end(session, { outcome:'run' });
        } else { await message(session, 'Couldn’t escape!'); await enemyTurn(session); }
      }
      if (!session.ended) showCommands(session);
    }
  }
  function makeTeam(entries) {
    return (entries || []).map(entry => {
      const raw = cloneTeamEntry(entry);
      if (raw.species || raw.id) return ensureMember(raw) || createMember(raw.species || raw.id, raw.level || 5, raw);
      return createMember(raw[0], raw[1] || 5);
    }).filter(Boolean);
  }
  function stateRefs(options) {
    const game = globalThis.Game || {};
    const state = options.state && typeof options.state === 'object' ? options.state : game;
    const party = options.party || state.party || state.team || [];
    const inventory = options.inventory || state.inventory || state.bag || {};
    const player = options.player || state.player || state;
    return { state, party, inventory, player };
  }
  function sessionHandle(session) {
    return {
      get finished() { return !!session.ended; },
      get result() { return session.result; },
      promise: session.promise,
      session,
      then(resolve, reject) { return session.promise.then(resolve, reject); }
    };
  }
  function start(options = {}) {
    if (current) return sessionHandle(current);
    const refs = stateRefs(options);
    refs.party.forEach(ensureMember);
    let wild = options.wildSpecies ? { species:options.wildSpecies, level:options.level || 5 } : options.wild;
    let isWild = !!wild || options.type === 'wild';
    let trainerId = options.trainerId || options.trainer?.id || null;
    const trainer = options.trainer || (trainerId && TRAINERS[trainerId]) || {};
    let foeEntries = isWild ? [wild || {}] : (options.foes || trainer.team || []);
    if (!isWild && !foeEntries.length && trainer.rival && typeof rivalTeam === 'function') {
      const starter = refs.party.find(mon => STARTER_COUNTER[speciesOf(mon)] || ['sobble_a','litten_a','treecko_a'].includes(speciesOf(mon)));
      foeEntries = rivalTeam(trainerId, starter && speciesOf(starter));
    }
    const foes = isWild ? [createMember(wild.species || wild.id, wild.level || options.level || 5, wild)] : makeTeam(foeEntries);
    if (!refs.party.length || !refs.party.some(alive) || !foes.length) {
      const result = { outcome:'invalid' };
      const promise = Promise.resolve(result);
      return { finished:true, result, promise, session:null, then(resolve, reject) { return promise.then(resolve, reject); } };
    }
    const session = {
      ...refs, party:refs.party, foes, wild:isWild, trainer, trainerId,
      area: options.area || null, location: options.location || null, areaTheme: options.theme || null,
      canRun:options.canRun, canCapture:options.canCapture, teamBattle:!!options.teamBattle,
      playerActive:activeIndexes(refs.party, options.teamBattle ? 2 : 1),
      foeActive:activeIndexes(foes, options.teamBattle ? 2 : 1),
      message:'', ended:false, root:null, onEnd:options.onEnd,
      resolve:null, promise:null
    };
    session.promise = new Promise(resolve => { session.resolve = resolve; });
    current = session;
    mount(session); render(session);
    if (typeof Sound !== 'undefined') Sound.sfx('encounter');
    const intro = isWild ? `A wild ${memberName(foes[0])} appeared!` : `${trainer.name || 'Trainer'} wants to battle!`;
    (async () => {
      await prompt(session, intro);
      if (!session.ended && !isWild && trainer.intro?.length) await prompt(session, trainer.intro.join(' '));
      if (!session.ended) { await message(session, `Go! ${memberName(refs.party[session.playerActive[0]])}!`); showCommands(session); }
    })().catch(error => {
      console.error('Battle startup failed:', error);
      end(session, { outcome:'error', error });
    });
    return sessionHandle(session);
  }
  return {
    start,
    get busy() { return !!current; },
    get active() { return current; },
    createMember,
    wild(species, level = 5, area = null) { return start({ wildSpecies:species, level, area }); },
    trainer(trainerId) { return start({ trainerId }); }
  };
})();

globalThis.Battle = Battle;

/* ============================================================
   POKÉMON ECLIPSE — game bootstrap, persistence, and controls
   ============================================================ */
'use strict';

const Game = {
  state: 'title',
  party: [],
  inventory: { potion: 3, poke_ball: 5 },
  player: { name: 'Aurelia', money: 3000 },
  flags: {},
  storage: [],
  started: false
};

globalThis.Game = Game;

const SAVE_KEY = 'pokemon_eclipse_aurelia_v1';
let titleActive = true;
let lastStep = 0;
let stepDelay = 0;

function starterEntries() {
  return [
    { label: 'Sobble', detail: 'Water / Ghost', sprite: 'sobble_a', value: 'sobble_a' },
    { label: 'Litten', detail: 'Fire / Ground', sprite: 'litten_a', value: 'litten_a' },
    { label: 'Treecko', detail: 'Grass / Fighting', sprite: 'treecko_a', value: 'treecko_a' }
  ];
}

function saveGame() {
  if (!Game.started) return false;
  const payload = {
    version: 1,
    party: Game.party,
    inventory: Game.inventory,
    player: Game.player,
    flags: Game.flags,
    storage: Game.storage,
    world: {
      mapId: World.state.mapId,
      x: World.state.x,
      y: World.state.y,
      facing: World.state.facing,
      defeated: World.state.defeated
    }
  };
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(payload)); toast('Game saved.'); return true; }
  catch (error) { toast('Unable to save in this browser.'); return false; }
}

globalThis.saveGame = saveGame;

function readSave() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) { return null; }
}

function applySave(save) {
  if (!save || !Array.isArray(save.party) || !save.party.length) return false;
  Game.party = save.party;
  // Accept the early prototype's `pokeball` key, but keep the canonical item ID.
  const savedInventory = Object.assign({}, save.inventory || {});
  if (savedInventory.pokeball != null && savedInventory.poke_ball == null) savedInventory.poke_ball = savedInventory.pokeball;
  delete savedInventory.pokeball;
  Game.inventory = Object.assign({ potion: 3, poke_ball: 5 }, savedInventory);
  Game.player = Object.assign({ name: 'Aurelia', money: 3000 }, save.player || {});
  Game.flags = Object.assign({}, save.flags || {});
  Game.storage = Array.isArray(save.storage) ? save.storage : (Array.isArray(save.pc) ? save.pc : []);
  Game.started = true;
  const w = save.world || {};
  World.state.defeated = Object.assign({}, w.defeated || {});
  World.state.flags = Game.flags;
  World.setMap(MAPS[w.mapId] ? w.mapId : 'emberfall', Number.isFinite(w.x) ? w.x : 14, Number.isFinite(w.y) ? w.y : 18);
  World.state.facing = w.facing || 'up';
  World.init(Game);
  return true;
}

async function chooseStarter() {
  const choice = await UI.menu('Choose your first partner', starterEntries(), {
    layout: 'starters',
    description: 'Every journey begins with trust. Select a Pokémon to travel with you.',
    footer: 'Arrow keys / WASD to choose · Z / Enter to confirm'
  });
  if (!choice) return false;
  Game.party = [Battle.createMember(choice, 5)];
  Game.inventory = { potion: 3, poke_ball: 5 };
  Game.player = { name: 'Aurelia', money: 3000 };
  Game.flags = { starter: choice, intro: true };
  Game.storage = [];
  Game.started = true;
  World.state.defeated = {};
  World.state.flags = Game.flags;
  World.setMap('emberfall', 14, 18);
  World.init(Game);
  saveGame();
  return true;
}

let titleStart = 0;

function titleCanvas() {
  titleStart = performance.now();
  drawTitleFrame(performance.now());
}

function drawTitleFrame(now) {
  const canvas = $('#game');
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  const time = (now - (titleStart || now)) / 1000;
  if (Art.drawTitle) Art.drawTitle(ctx, canvas.width, canvas.height, time);
  else { ctx.fillStyle = '#090d20'; ctx.fillRect(0, 0, canvas.width, canvas.height); }
}

async function beginNewGame() {
  titleActive = false;
  UI.close();
  Game.state = 'starting';
  if (await chooseStarter()) {
    Game.state = 'overworld';
    await UI.say('Welcome to Aurelia. Professor Cedar is waiting in the village lab.', 'Aurelia');
    World.draw();
  } else {
    titleActive = true; Game.state = 'title'; showTitle();
  }
}

async function continueGame() {
  const save = readSave();
  if (!save) { toast('No save data found.'); return; }
  titleActive = false; UI.close();
  if (applySave(save)) { Game.state = 'overworld'; World.draw(); toast('Save data loaded.'); }
  else { titleActive = true; showTitle(); toast('That save file is invalid.'); }
}

function showTitle() {
  titleActive = true; Game.state = 'title'; titleCanvas();
  const hasSave = !!readSave();
  UI.menu('Pokémon Eclipse', [
    { label: 'New Game', value: 'new' },
    { label: 'Continue', value: 'continue', disabled: !hasSave },
    { label: 'How to Play', value: 'help' }
  ], { layout: 'splash', description: 'Aurelia Genesis', footer: 'A journey beyond the eclipse' }).then(async choice => {
    if (!titleActive) return;
    if (choice === 'new') await beginNewGame();
    else if (choice === 'continue') await continueGame();
    else if (choice === 'help') {
      await UI.say('Move with arrows or WASD. Face a person or object and press Z or Enter to interact. Press X or Escape for your Pokémon menu. Tall grass hides wild Pokémon.', 'Guide');
      showTitle();
    }
  });
}

async function partyMenu() {
  const labels = Game.party.map(mon => `${mon.name} Lv.${mon.level}  ${Math.max(0, mon.hp)}/${mon.maxHp} HP`);
  labels.push({ label: 'Save Game', value: 'save' }, { label: 'Close', value: 'close' });
  const result = await UI.menu('Trainer Menu', labels, { footer: 'Z / Enter select · X / Esc close' });
  if (result === 'save') saveGame();
  else if (result && result !== 'close') {
    const mon = Game.party.find(p => p.name === result.split(' Lv.')[0]);
    if (mon) await UI.say(`${mon.name} is ready for adventure!`, 'Party');
  }
}

function onPress(key) {
  if (key === 'm') {
    Sound.musicOn = !Sound.musicOn;
    if (Sound.musicOn) Sound.playTrack(Game.state === 'overworld' ? 'town' : 'title');
    else Sound.stopMusic();
    toast(Sound.musicOn ? 'Music on.' : 'Music muted.');
    return;
  }
  if (titleActive || UI.active || Battle.busy) return;
  if (key === 'z' || key === 'enter') { World.interact(); return; }
  if (key === 'x' || key === 'escape') { partyMenu(); return; }
}

function heldMovement(now) {
  if (titleActive || UI.active || Battle.busy || Game.state !== 'overworld') return;
  if (now - lastStep < 135) return;
  let dx = 0, dy = 0;
  if (Input.down('arrowup', 'w')) dy = -1;
  else if (Input.down('arrowdown', 's')) dy = 1;
  else if (Input.down('arrowleft', 'a')) dx = -1;
  else if (Input.down('arrowright', 'd')) dx = 1;
  if (dx || dy) { World.step(dx, dy); lastStep = now; }
}

function loop(now) {
  requestAnimationFrame(loop);
  const dt = Math.min(100, now - (loop._last || now)); loop._last = now;
  try {
    heldMovement(now);
    if (titleActive) drawTitleFrame(now);
    else { World.update(dt); World.draw(); }
  } catch (error) {
    console.error('Frame error:', error);
  }
}

function boot() {
  Input.onPress(onPress);
  Sound.playTrack('title');
  showTitle();
  requestAnimationFrame(loop);
}

document.addEventListener('DOMContentLoaded', boot, { once: true });

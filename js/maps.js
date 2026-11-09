/* ============================================================
   POKÉMON ECLIPSE: AURELIA GENESIS — overworld map data

   Classic-script interface: MAPS is a global dictionary keyed by map id.
   Each map has { id, name, width, height, theme, encounter, tiles,
   collision, objects, npcs, doors, warps }. Tiles are row-major string IDs;
   collision is a matching row-major boolean grid (true = blocked). Object
   records are visual/collision props; NPCs use tile coordinates and an
   optional trainer id from data.js. A warp is triggered on its {x,y} tile
   and places the player at {toX,toY} in `to`. Door records additionally
   describe building entrances. The world renderer can draw the tile IDs as
   pixel-art terrain; all coordinates are in 32px tiles.
   ============================================================ */
'use strict';

var MAPS = {};

(function () {
  const W = 30, H = 22;
  const hash = (x, y, seed) => {
    let n = (x * 374761393 + y * 668265263 + seed * 1442695041) | 0;
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967295;
  };
  const make = (id, name, theme, encounter, ground = 'grass', width = W, height = H) => {
    const tiles = [], collision = [];
    for (let y = 0; y < height; y++) {
      const row = [], block = [];
      for (let x = 0; x < width; x++) {
        const v = hash(x, y, id.length + name.length);
        row.push(ground === 'grass' && v > .91 ? 'grass_flower' : ground === 'sand' && v > .9 ? 'sand_pebble' : ground === 'snow' && v > .9 ? 'snow_rock' : ground);
        block.push(false);
      }
      tiles.push(row); collision.push(block);
    }
    const map = { id, name, width, height, theme, encounter: encounter || null, tiles, collision, objects: [], npcs: [], doors: [], warps: [] };
    // Natural boundary keeps the player on the authored map.
    for (let x = 0; x < width; x++) { map.collision[0][x] = true; map.collision[height - 1][x] = true; }
    for (let y = 0; y < height; y++) { map.collision[y][0] = true; map.collision[y][width - 1] = true; }
    MAPS[id] = map;
    return map;
  };
  const paint = (m, x, y, tile, blocked = false) => {
    if (!m || x < 0 || y < 0 || x >= m.width || y >= m.height) return;
    m.tiles[y][x] = tile; m.collision[y][x] = blocked;
  };
  const rect = (m, x, y, w, h, tile, blocked = false) => {
    for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) paint(m, xx, yy, tile, blocked);
  };
  const path = (m, x1, y1, x2, y2, width = 2, tile = 'path') => {
    const minX = Math.min(x1, x2), maxX = Math.max(x1, x2), minY = Math.min(y1, y2), maxY = Math.max(y1, y2);
    for (let y = minY; y <= maxY; y++) for (let x = minX; x <= maxX; x++) {
      if ((x1 === x2 && Math.abs(x - x1) <= width - 1) || (y1 === y2 && Math.abs(y - y1) <= width - 1)) paint(m, x, y, tile, false);
    }
    // L-shaped path segment when both coordinates differ.
    if (x1 !== x2 && y1 !== y2) path(m, x1, y1, x2, y1, width, tile), path(m, x2, y1, x2, y2, width, tile);
  };
  const prop = (m, type, x, y, extra = {}) => {
    const blocked = extra.blocked !== false;
    m.objects.push(Object.assign({ type, x, y, blocked }, extra));
    if (blocked) paint(m, x, y, m.tiles[y] && m.tiles[y][x] || 'grass', true);
  };
  const npc = (m, id, name, x, y, extra = {}) => m.npcs.push(Object.assign({ id, name, x, y, direction: 'down', trainer: null, dialogue: '' }, extra));
  const edge = (m, side, id, x, y, ground = 'grass') => {
    if (side === 'north') { rect(m, x - 1, 0, 3, 2, ground); m.collision[0][x] = false; }
    if (side === 'south') { rect(m, x - 1, m.height - 2, 3, 2, ground); m.collision[m.height - 1][x] = false; }
    if (side === 'west') { rect(m, 0, y - 1, 2, 3, ground); m.collision[y][0] = false; }
    if (side === 'east') { rect(m, m.width - 2, y - 1, 2, 3, ground); m.collision[y][m.width - 1] = false; }
    m.warps.push({ x, y, to: id, toX: x, toY: side === 'north' ? m.height - 2 : side === 'south' ? 1 : y, kind: 'route' });
  };
  const treeLine = (m, gaps = []) => {
    for (let x = 1; x < m.width - 1; x++) {
      if (gaps.includes(x)) continue;
      prop(m, 'tree', x, 1, { blocked: true }); prop(m, 'tree', x, m.height - 2, { blocked: true });
    }
    for (let y = 2; y < m.height - 2; y++) { prop(m, 'tree', 1, y); prop(m, 'tree', m.width - 2, y); }
  };
  const house = (m, x, y, type = 'house') => {
    rect(m, x, y, 4, 3, 'building_wall', true);
    rect(m, x + 1, y + 1, 2, 1, type + '_roof', true);
    paint(m, x + 1, y + 2, 'doorstep', false);
    prop(m, type, x + 1, y + 1, { blocked: true, width: 3, height: 2 });
  };
  const link = (a, x, y, b, tx, ty, kind = 'route', label = '') => {
    // Warps on map edges are walkable; destination tiles are likewise kept clear.
    paint(a, x, y, a.tiles[y] && a.tiles[y][x] || 'path', false);
    paint(b, tx, ty, b.tiles[ty] && b.tiles[ty][tx] || 'path', false);
    a.warps.push({ x, y, to: b.id, toX: tx, toY: ty, kind, label });
    b.warps.push({ x: tx, y: ty, to: a.id, toX: x, toY: y, kind, label });
  };
  const door = (outside, x, y, inside, ix, iy, label) => {
    outside.doors.push({ x, y, to: inside.id, toX: ix, toY: iy, label: label || inside.name });
    inside.doors.push({ x: ix, y: iy, to: outside.id, toX: x, toY: y, label: label || outside.name });
    link(outside, x, y, inside, ix, iy, 'door', label);
  };
  const outdoor = (id, name, theme, encounter, ground = 'grass') => {
    const m = make(id, name, theme, encounter, ground);
    // Main travel lane, with a small plaza crossing for spaces that are not caves.
    path(m, 14, 1, 14, H - 2, 2, ground === 'sand' ? 'sand_path' : ground === 'snow' ? 'snow_path' : 'path');
    path(m, 2, 10, W - 3, 10, 2, ground === 'sand' ? 'sand_path' : ground === 'snow' ? 'snow_path' : 'path');
    treeLine(m, [14, 13, 15]);
    return m;
  };

  // Home region and first routes.
  const emberfall = outdoor('emberfall', 'Emberfall Village', 'town', null);
  house(emberfall, 5, 4, 'lab'); house(emberfall, 21, 4); house(emberfall, 5, 14, 'shop');
  prop(emberfall, 'flower_bed', 21, 15, { blocked: false }); prop(emberfall, 'sign', 14, 18, { blocked: false, text: 'EMBERFALL VILLAGE — Where every journey begins' });
  npc(emberfall, 'prof_cedar', 'Professor Cedar', 8, 8, { dialogue: 'Aurelia is full of places where the past and future meet. Start by following the southern road.' });
  npc(emberfall, 'neighbor_rae', 'Rae', 23, 11, { dialogue: 'The old grove is beautiful, but the lanterns there sometimes light themselves.' });
  const route1 = outdoor('route1', 'Sunlit Trail', 'route', 'route1');
  prop(route1, 'sign', 16, 8, { blocked: false, text: 'NORTH: EMBERFALL  /  SOUTH: VERDANT FOREST' });
  npc(route1, 'youngster_pip', 'Pip', 9, 7, { trainer: 'youngster_pip', direction: 'right' });
  npc(route1, 'lass_mia', 'Mia', 21, 14, { trainer: 'lass_mia', direction: 'left' });
  const forest = outdoor('forest', 'Verdant Forest', 'forest', 'forest');
  // Tall grass patches leave a navigable central trail.
  rect(forest, 4, 4, 7, 4, 'tall_grass'); rect(forest, 18, 12, 7, 5, 'tall_grass');
  rect(forest, 5, 14, 6, 3, 'tall_grass');
  prop(forest, 'old_tree', 17, 5, { blocked: true, width: 2, height: 3 });
  prop(forest, 'lantern', 12, 8, { blocked: false, glow: true }); prop(forest, 'lantern', 17, 13, { blocked: false, glow: true });
  prop(forest, 'sign', 14, 19, { blocked: false, text: 'TWILIGHT GROVE — Keep a light for those who wander' });
  npc(forest, 'bugcatcher_eli', 'Eli', 8, 11, { trainer: 'bugcatcher_eli', direction: 'right' });
  npc(forest, 'forest_keeper', 'Moss', 20, 7, { dialogue: 'The grove is listening. Treat every living thing gently.' });
  const bramble = outdoor('bramble_town', 'Bramble Town', 'town', null);
  house(bramble, 4, 4, 'pokecenter'); house(bramble, 21, 4, 'gym'); house(bramble, 21, 14, 'shop');
  prop(bramble, 'fountain', 14, 9, { blocked: true }); prop(bramble, 'sign', 14, 18, { blocked: false, text: 'BRAMBLE TOWN — Verdant Badge' });
  npc(bramble, 'healer_ivy', 'Nurse Ivy', 7, 10, { dialogue: 'Your Pokémon look ready for the road. Rest here whenever you need.' });

  // Eastern lowlands, coast, cave and Duneveil.
  const route2 = outdoor('route2', 'Silverleaf Road', 'route', 'route2');
  rect(route2, 3, 3, 5, 4, 'tall_grass'); rect(route2, 20, 13, 6, 5, 'tall_grass');
  prop(route2, 'sign', 15, 8, { blocked: false, text: 'ECHO CAVERN →  /  BRAMBLE TOWN ←' });
  npc(route2, 'sailor_bram', 'Bram', 7, 15, { trainer: 'sailor_bram', direction: 'right' });
  const cavern = outdoor('cavern', 'Echo Cavern', 'cave', 'cavern', 'rock');
  cavern.tiles.forEach((row, y) => row.forEach((_, x) => { if (x && y && x < W - 1 && y < H - 1) paint(cavern, x, y, 'cave_floor'); }));
  path(cavern, 2, 10, W - 3, 10, 2, 'cave_path'); path(cavern, 14, 2, 14, H - 2, 2, 'cave_path');
  for (const [x, y] of [[5,5],[6,5],[23,5],[24,5],[5,16],[6,16],[23,16],[24,16],[10,7],[20,14]]) prop(cavern, 'crystal', x, y, { blocked: true, glow: true });
  npc(cavern, 'hiker_gorran', 'Gorran', 8, 11, { trainer: 'hiker_gorran', direction: 'right' });
  const duneveil = outdoor('duneveil', 'Duneveil', 'town', null, 'sand');
  house(duneveil, 4, 4, 'pokecenter'); house(duneveil, 21, 4, 'gym'); house(duneveil, 5, 14, 'shop');
  prop(duneveil, 'market_stall', 19, 14, { blocked: true }); prop(duneveil, 'palm', 10, 7, { blocked: true });
  prop(duneveil, 'sign', 14, 18, { blocked: false, text: 'DUNVEIL — Bazaar of the Sun' });
  npc(duneveil, 'dancer_zahra', 'Zahra', 18, 10, { trainer: 'dancer_zahra', direction: 'left' });
  npc(duneveil, 'leader_sahir', 'Sahir', 23, 11, { trainer: 'leader_sahir', direction: 'left' });
  const route3 = outdoor('route3', 'Glasswind Pass', 'route', 'route3', 'sand');
  rect(route3, 4, 4, 6, 4, 'tall_grass'); rect(route3, 19, 12, 7, 5, 'tall_grass');
  prop(route3, 'sandstone', 8, 14, { blocked: true }); prop(route3, 'sign', 15, 8, { blocked: false, text: 'TWILIGHT GROVE — Beyond the dunes' });
  const ruins = outdoor('ruins', 'Sunken Ruins', 'paradox', 'ruins', 'rock');
  for (let x = 4; x < 11; x++) { prop(ruins, 'ruin_column', x, 5, { blocked: true }); prop(ruins, 'ruin_column', x, 15, { blocked: true }); }
  rect(ruins, 5, 6, 5, 1, 'ancient_floor'); rect(ruins, 5, 15, 5, 1, 'ancient_floor');
  prop(ruins, 'relic_altar', 22, 10, { blocked: true, interact: 'relic' }); prop(ruins, 'sign', 14, 18, { blocked: false, text: 'TWIN RELIQUARY — Resonance detected' });
  npc(ruins, 'scholar_orin', 'Orin', 9, 11, { trainer: 'scholar_orin', direction: 'right' });
  npc(ruins, 'grunt_3', 'Paradox Grunt', 20, 8, { trainer: 'grunt_3', direction: 'down' });
  npc(ruins, 'admin_sable', 'Sable', 22, 12, { trainer: 'admin_sable', direction: 'left' });
  const twilight = outdoor('twilight_grove', 'Twilight Grove', 'forest', 'forest');
  rect(twilight, 4, 4, 6, 5, 'tall_grass'); rect(twilight, 20, 12, 6, 5, 'tall_grass');
  for (const [x,y] of [[7,12],[10,6],[19,8],[23,9],[7,17],[24,17]]) prop(twilight, 'glow_mushroom', x, y, { blocked: false, glow: true });
  prop(twilight, 'shrine', 14, 5, { blocked: true });
  npc(twilight, 'hex_sera', 'Sera', 8, 11, { trainer: 'hex_sera', direction: 'right' });

  // Storm coast and mountain routes lead to the endgame region.
  const stormwatch = outdoor('stormwatch', 'Stormwatch Harbor', 'town', null);
  house(stormwatch, 4, 4, 'pokecenter'); house(stormwatch, 21, 4, 'gym');
  rect(stormwatch, 22, 15, 6, 4, 'water', true); rect(stormwatch, 22, 15, 6, 1, 'pier', false);
  prop(stormwatch, 'lighthouse', 7, 14, { blocked: true, glow: true }); prop(stormwatch, 'sign', 14, 18, { blocked: false, text: 'STORMWATCH — The sea remembers' });
  npc(stormwatch, 'leader_volt', 'Volt', 23, 11, { trainer: 'leader_volt', direction: 'left' });
  npc(stormwatch, 'grunt_4', 'Paradox Grunt', 8, 8, { trainer: 'grunt_4', direction: 'right' });
  const route4 = outdoor('route4', 'Thunderhead Way', 'route', 'route4', 'rock');
  rect(route4, 4, 4, 6, 4, 'tall_grass'); rect(route4, 19, 13, 7, 4, 'tall_grass');
  prop(route4, 'sign', 15, 8, { blocked: false, text: 'NORTH: OBSIDIAN PASS  /  SOUTH: STORMWATCH' });
  npc(route4, 'veteran_rooke', 'Rooke', 8, 13, { trainer: 'veteran_rooke', direction: 'right' });
  const obsidian = outdoor('obsidian_pass', 'Obsidian Pass', 'route', 'route5', 'rock');
  rect(obsidian, 4, 4, 5, 4, 'tall_grass'); rect(obsidian, 21, 13, 5, 4, 'tall_grass');
  prop(obsidian, 'cliff', 6, 13, { blocked: true }); prop(obsidian, 'obsidian_gate', 14, 4, { blocked: true });
  prop(obsidian, 'sign', 15, 18, { blocked: false, text: 'THE LEAGUE — Prove what you believe' });
  npc(obsidian, 'blackbelt_dain', 'Dain', 8, 9, { trainer: 'blackbelt_dain', direction: 'right' });
  npc(obsidian, 'grunt_5', 'Paradox Grunt', 21, 8, { trainer: 'grunt_5', direction: 'left' });
  const route5 = outdoor('route5', 'Eclipse Road', 'route', 'route5', 'snow');
  rect(route5, 4, 4, 6, 4, 'tall_grass'); rect(route5, 20, 13, 6, 4, 'tall_grass');
  prop(route5, 'sign', 15, 8, { blocked: false, text: 'AURELIA LEAGUE — North' });
  const league = outdoor('league', 'Aurelia Pokémon League', 'league', null, 'snow');
  house(league, 4, 4, 'pokecenter'); house(league, 21, 4, 'league_hall');
  prop(league, 'victory_arch', 14, 8, { blocked: true, width: 3, height: 2 });
  prop(league, 'sign', 14, 18, { blocked: false, text: 'AURELIA LEAGUE — Champions are made by their choices' });
  npc(league, 'ace_lyra', 'Lyra', 23, 11, { trainer: 'ace_lyra', direction: 'left' });
  npc(league, 'champion_seraphine', 'Seraphine', 14, 12, { trainer: 'champion_seraphine', direction: 'up' });
  const victory = outdoor('victory', 'Skyfall Summit', 'summit', 'victory', 'snow');
  rect(victory, 4, 4, 6, 4, 'tall_grass'); rect(victory, 20, 13, 6, 4, 'tall_grass');
  prop(victory, 'summit_peak', 14, 4, { blocked: true }); prop(victory, 'sign', 14, 18, { blocked: false, text: 'SKYFALL SUMMIT — The first light' });
  const route6 = outdoor('route6', 'Origin Path', 'paradox', 'route6', 'rock');
  rect(route6, 4, 4, 6, 4, 'tall_grass'); rect(route6, 20, 13, 6, 4, 'tall_grass');
  prop(route6, 'ancient_gate', 14, 4, { blocked: true });
  const origins = outdoor('origins', 'Aurelia Origins', 'paradox', 'origins', 'rock');
  rect(origins, 4, 4, 6, 4, 'tall_grass'); rect(origins, 20, 13, 6, 4, 'tall_grass');
  prop(origins, 'soul_altar', 14, 5, { blocked: true, interact: 'soul_ember' });
  npc(origins, 'aurelio', 'Aurelio', 14, 10, { trainer: 'aurelio', direction: 'up' });

  // Important interiors use independent tile grids and the same warp contract.
  const center = make('clinic', 'Pokémon Center', 'town', null, 'floor', 20, 14);
  rect(center, 0, 0, 20, 1, 'wall', true); rect(center, 0, 0, 1, 14, 'wall', true); rect(center, 19, 0, 1, 14, 'wall', true);
  rect(center, 8, 3, 4, 1, 'counter', true); prop(center, 'healing_station', 9, 2, { blocked: true, interact: 'heal' });
  npc(center, 'nurse', 'Nurse', 10, 4, { dialogue: 'Welcome! Your Pokémon are fully restored.' });
  const lab = make('cedar_lab', 'Professor Cedar’s Lab', 'town', null, 'floor', 20, 14);
  rect(lab, 0, 0, 20, 1, 'wall', true); rect(lab, 0, 0, 1, 14, 'wall', true); rect(lab, 19, 0, 1, 14, 'wall', true);
  prop(lab, 'desk', 8, 4, { blocked: true }); prop(lab, 'bookshelf', 3, 2, { blocked: true });
  npc(lab, 'cedar_inside', 'Professor Cedar', 10, 5, { dialogue: 'Listen to the places you visit. Aurelia has a way of answering back.' });
  const gym = make('bramble_gym', 'Bramble Gym', 'gym', null, 'floor', 22, 16);
  rect(gym, 0, 0, 22, 1, 'wall', true); rect(gym, 0, 0, 1, 16, 'wall', true); rect(gym, 21, 0, 1, 16, 'wall', true);
  for (let x = 4; x < 18; x += 4) prop(gym, 'hedge', x, 7, { blocked: true, width: 2 });
  npc(gym, 'flora_gym', 'Flora', 11, 4, { trainer: 'leader_flora', direction: 'down' });

  // Inter-region connections. Each pair includes a safe arrival tile.
  link(emberfall, 14, 20, route1, 14, 1); link(route1, 14, 20, forest, 14, 1);
  link(forest, 14, 20, bramble, 14, 1); link(bramble, 14, 20, route2, 14, 1);
  link(route2, 14, 20, cavern, 14, 1); link(cavern, 14, 20, duneveil, 14, 1);
  link(duneveil, 14, 20, route3, 14, 1); link(route3, 14, 20, ruins, 14, 1);
  link(ruins, 14, 20, twilight, 14, 1); link(twilight, 14, 20, stormwatch, 14, 1);
  link(stormwatch, 14, 20, route4, 14, 1); link(route4, 14, 1, obsidian, 14, 20);
  link(obsidian, 14, 20, route5, 14, 1); link(route5, 14, 1, league, 14, 20);
  link(league, 14, 20, victory, 14, 1); link(victory, 14, 20, route6, 14, 1);
  link(route6, 14, 20, origins, 14, 1);

  // Building entrances (visible doors are also represented in doors arrays).
  door(emberfall, 6, 6, lab, 10, 12, 'Professor Cedar’s Lab');
  door(bramble, 5, 6, center, 10, 12, 'Bramble Pokémon Center');
  door(duneveil, 5, 6, center, 10, 12, 'Duneveil Pokémon Center');
  door(stormwatch, 5, 6, center, 10, 12, 'Stormwatch Pokémon Center');
  door(league, 5, 6, center, 10, 12, 'League Pokémon Center');
  door(bramble, 22, 6, gym, 11, 14, 'Bramble Gym');
})();

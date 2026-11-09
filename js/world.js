/* ============================================================
   POKÉMON ECLIPSE — overworld runtime
   ============================================================ */
'use strict';

const World = (() => {
  const TILE = 32;
  const canvas = $('#game');
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  const state = {
    mapId: 'emberfall', x: 14, y: 18, facing: 'up', moving: false,
    moveLock: 0, encounterLock: 0, defeated: {}, flags: {}, lastMap: null
  };
  let game = null;

  const dirs = {
    up: [0,-1], down: [0,1], left: [-1,0], right: [1,0]
  };
  const colors = {
    grass:['#183f32','#205640'], path:['#a9784b','#c79358'], tall_grass:['#125439','#1f7045'],
    grass_flower:['#1d4d38','#d4a9d8'], sand:['#b68a50','#d9b66d'], sand_path:['#cba56a','#edd08c'],
    sand_pebble:['#c1985c','#e2c47d'], rock:['#39465c','#59677d'], cave_floor:['#252b43','#303957'],
    cave_path:['#4b4560','#635671'], snow:['#a9c5d4','#d8f1f1'], snow_path:['#c7e2e8','#f1ffff'],
    snow_rock:['#9cb6c1','#e0f6f5'], floor:['#39415c','#4f5875'], wall:['#20263d','#303851'],
    building_wall:['#563b52','#76526a'], doorstep:['#c88a5b','#e6ad72'], water:['#164d70','#267ca0'],
    pier:['#765037','#a9784b'], ancient_floor:['#4e4b54','#6d6770'], path2:['#80654c','#aa8962']
  };
  function map() { return MAPS[state.mapId]; }
  function solid(x,y) {
    const m=map(); if (!m || y<0 || x<0 || x>=m.width || y>=m.height) return true;
    if (m.collision[y][x]) return true;
    return m.npcs.some(n => n.x===x && n.y===y);
  }
  function playerAt(x,y) { return state.x===x && state.y===y; }
  function setMap(id,x,y) {
    if (!MAPS[id]) return;
    state.lastMap=state.mapId; state.mapId=id; state.x=x; state.y=y;
    state.moveLock=350; state.encounterLock=800;
    if (game) { UI.updateHud(MAPS[id].name, game.party); Sound.playTrack(MAPS[id].theme==='gym'?'battle':MAPS[id].theme==='cave'?'cave':MAPS[id].theme==='paradox'?'eclipse':'town'); }
  }
  function transition(w) {
    fadeOut(() => { setMap(w.to,w.toX,w.toY); fadeIn(); toast(MAPS[w.to]?.name || ''); });
  }
  function tileDraw(tile,x,y) {
    const [a,b]=colors[tile] || colors.grass;
    ctx.fillStyle=a; ctx.fillRect(x*TILE,y*TILE,TILE,TILE);
    ctx.fillStyle=b;
    const n=(x*17+y*31+tile.length*13)%7;
    if (n===0) ctx.fillRect(x*TILE+6,y*TILE+8,3,3);
    if (n===1 || tile==='tall_grass') { ctx.fillRect(x*TILE+8,y*TILE+16,2,10); ctx.fillRect(x*TILE+15,y*TILE+12,2,14); ctx.fillRect(x*TILE+23,y*TILE+17,2,9); }
    if (tile==='water') { ctx.fillRect(x*TILE+4,y*TILE+10,12,2); ctx.fillRect(x*TILE+18,y*TILE+21,10,2); }
  }
  function objectDraw(o) {
    const x=o.x*TILE,y=o.y*TILE;
    ctx.save();
    if (o.type==='tree'||o.type==='old_tree') { ctx.fillStyle='#3a241e';ctx.fillRect(x+13,y+15,7,17);ctx.fillStyle='#143d30';ctx.fillRect(x+4,y+4,24,20);ctx.fillStyle='#28634a';ctx.fillRect(x+8,y,17,18); }
    else if (o.type==='sign') { ctx.fillStyle='#6b432e';ctx.fillRect(x+14,y+16,4,16);ctx.fillStyle='#d4a85b';ctx.fillRect(x+4,y+7,24,12); }
    else if (o.type==='fountain') { ctx.fillStyle='#9bb7c8';ctx.fillRect(x+4,y+8,24,17);ctx.fillStyle='#67d7e8';ctx.fillRect(x+8,y+5,16,10); }
    else if (o.type.includes('crystal')||o.type==='glow_mushroom') { ctx.fillStyle='#9b7bff';ctx.beginPath();ctx.moveTo(x+16,y+2);ctx.lineTo(x+27,y+25);ctx.lineTo(x+7,y+25);ctx.fill();ctx.fillStyle='#d9c8ff';ctx.fillRect(x+14,y+8,4,12); }
    else if (o.type==='lantern') { ctx.fillStyle='#d78b38';ctx.fillRect(x+13,y+8,7,15);ctx.fillStyle='#fff0a0';ctx.fillRect(x+15,y+10,3,8);ctx.fillStyle='#60452b';ctx.fillRect(x+15,y+23,3,9); }
    else if (o.type==='healing_station') { ctx.fillStyle='#e65d76';ctx.fillRect(x+5,y+5,22,18);ctx.fillStyle='#fff1f4';ctx.fillRect(x+13,y+7,6,14);ctx.fillRect(x+9,y+11,14,6); }
    else if (o.type.includes('altar')||o.type.includes('gate')||o.type.includes('arch')) { ctx.fillStyle='#75638f';ctx.fillRect(x+4,y+8,24,24);ctx.fillStyle='#b8a8df';ctx.fillRect(x+9,y+3,14,8); }
    else if (o.type==='house'||o.type==='lab'||o.type==='pokecenter'||o.type==='gym'||o.type==='shop'||o.type==='league_hall') { ctx.fillStyle='#b84f62';ctx.fillRect(x+2,y+2,28,21);ctx.fillStyle='#f0bd62';ctx.fillRect(x+7,y+16,18,16); }
    else { ctx.fillStyle='#76627a';ctx.fillRect(x+5,y+6,22,24); }
    ctx.restore();
  }
  function npcDraw(n) { ctx.fillStyle='#171526';ctx.fillRect(n.x*TILE+10,n.y*TILE+7,13,22);ctx.fillStyle=n.trainer?'#ef9b57':'#63c9c4';ctx.fillRect(n.x*TILE+8,n.y*TILE+3,17,14);ctx.fillStyle='#ffe0b5';ctx.fillRect(n.x*TILE+12,n.y*TILE+5,9,9); }
  function playerDraw() { const x=state.x*TILE,y=state.y*TILE; ctx.fillStyle='#171526';ctx.fillRect(x+9,y+10,15,22);ctx.fillStyle='#e7b85f';ctx.fillRect(x+7,y+3,18,10);ctx.fillStyle='#7ed6e7';ctx.fillRect(x+10,y+14,13,12);ctx.fillStyle='#f5d2ad';ctx.fillRect(x+12,y+5,9,7); }
  function draw() {
    const m=map(); if (!m) return;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    for(let y=0;y<m.height;y++) for(let x=0;x<m.width;x++) tileDraw(m.tiles[y][x],x,y);
    m.objects.forEach(objectDraw); m.npcs.forEach(npcDraw); playerDraw();
    ctx.fillStyle='rgba(8,10,24,.35)'; ctx.fillRect(0,0,canvas.width,28);
    ctx.fillStyle='#f5c542';ctx.font='14px PixelTitle, monospace';ctx.fillText(m.name.toUpperCase(),12,19);
  }
  function facingTile() { const d=dirs[state.facing]; return [state.x+d[0],state.y+d[1]]; }
  async function interact() {
    if (!game || UI.active || Battle.busy) return;
    Sound.init(); const [x,y]=facingTile(),m=map();
    const npc=m.npcs.find(n=>n.x===x&&n.y===y);
    if(npc){
      if(npc.trainer && !state.defeated[npc.id]) { await UI.say(`${npc.name} steps forward!`,npc.name); const h=Battle.start({trainerId:npc.trainer,party:game.party,inventory:game.inventory,player:game.player,onEnd:r=>{if(r.outcome==='win')state.defeated[npc.id]=true;}}); await h.promise; saveGame(); }
      else await UI.say(npc.dialogue || `${npc.name} smiles.`,npc.name);
      return;
    }
    const obj=m.objects.find(o=>o.x===x&&o.y===y);
    if(obj){
      if(obj.interact==='heal'){game.party.forEach(p=>{p.hp=p.maxHp;p.status=null;}); await UI.say('Your Pokémon are fully restored!','Nurse');}
      else if(obj.text) await UI.say(obj.text,'Aurelia');
      else await UI.say('A quiet power hums beneath this place.');
      return;
    }
    const warp=m.warps.find(w=>w.x===x&&w.y===y); if(warp){transition(warp);return;}
  }
  function step(dx,dy) {
    if(state.moveLock>0||UI.active||Battle.busy) return false;
    state.facing=dx<0?'left':dx>0?'right':dy<0?'up':'down';
    const nx=state.x+dx,ny=state.y+dy,m=map();
    if(solid(nx,ny)) return false;
    state.x=nx;state.y=ny;state.moveLock=125;
    const warp=m.warps.find(w=>w.x===nx&&w.y===ny); if(warp){transition(warp);return true;}
    const tile=m.tiles[ny][nx];
    if(m.encounter && tile==='tall_grass' && state.encounterLock<=0 && Math.random()<.14) encounter();
    return true;
  }
  async function encounter(){ const table=ENCOUNTERS[map().encounter]||[]; if(!table.length||!game.party.some(p=>p.hp>0))return; const e=weighted(table); const h=Battle.start({type:'wild',wildSpecies:e.sp,level:randi(e.min,e.max),area:map().id,party:game.party,inventory:game.inventory,player:game.player,onEnd:()=>saveGame()}); await h.promise; state.encounterLock=900; }
  function update(dt){ state.moveLock=Math.max(0,state.moveLock-dt);state.encounterLock=Math.max(0,state.encounterLock-dt); }
  function init(g){game=g; UI.updateHud(map().name,game.party);}
  return {state,init,draw,update,step,interact,setMap,encounter};
})();

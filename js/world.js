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
  const tileNoise = (x,y,salt=0) => {
    const n = Math.sin((x + salt * 13.7) * 127.1 + (y + salt * 7.3) * 311.7) * 43758.5453;
    return n - Math.floor(n);
  };
  function tileDraw(tile,x,y,time=0) {
    const px=x*TILE, py=y*TILE, [a,b]=colors[tile] || colors.grass;
    ctx.fillStyle=a; ctx.fillRect(px,py,TILE,TILE);
    // Soft tile bevels and tiny, repeatable flecks turn the flat map into a textured world.
    ctx.fillStyle='rgba(255,255,255,.035)'; ctx.fillRect(px,py,TILE,2); ctx.fillRect(px,py,2,TILE);
    ctx.fillStyle='rgba(0,0,0,.08)'; ctx.fillRect(px,py+TILE-2,TILE,2); ctx.fillRect(px+TILE-2,py,2,TILE);
    const seed=tileNoise(x,y,tile.length);
    if (tile==='water') {
      ctx.fillStyle='rgba(75,190,224,.18)';
      ctx.fillRect(px+3,py+5+(Math.floor(time/500+x*9+y*7)%4),10,2);
      ctx.fillRect(px+17,py+20+(Math.floor(time/600+x*3+y*11)%4),12,2);
      ctx.fillStyle='rgba(166,238,244,.32)';
      if(seed>.35)ctx.fillRect(px+6,py+14,3,1);
      if(seed<.25)ctx.fillRect(px+23,py+8,2,1);
    } else if (tile==='tall_grass') {
      ctx.fillStyle='#0c472f'; ctx.fillRect(px+3,py+14,26,15);
      ctx.fillStyle=b;
      for(let i=0;i<5;i++) { const gx=px+4+i*6+(seed>.5?2:0), gy=py+12+Math.floor(tileNoise(x+i,y,3)*7); ctx.fillRect(gx,gy,2,15); ctx.fillRect(gx+2,gy+4,2,8); }
      ctx.fillStyle='rgba(167,237,146,.35)';ctx.fillRect(px+7,py+15,2,7);ctx.fillRect(px+20,py+19,2,6);
      ctx.fillStyle='rgba(0,0,0,.15)';ctx.fillRect(px+2,py+29,28,3);
    } else if (tile==='grass_flower') {
      ctx.fillStyle='#36835a';ctx.fillRect(px+5,py+8,2,2);ctx.fillRect(px+23,py+22,2,2);
      ctx.fillStyle='#f5bfd7';ctx.fillRect(px+14,py+12,3,3);ctx.fillRect(px+12,py+14,3,3);ctx.fillRect(px+16,py+14,3,3);
      ctx.fillStyle='#ffe18c';ctx.fillRect(px+14,py+14,3,3);
    } else if (tile==='sand_pebble'||tile==='snow_rock') {
      ctx.fillStyle=b;ctx.fillRect(px+6,py+8,4,2);ctx.fillRect(px+22,py+21,3,2);ctx.fillStyle='rgba(255,255,255,.32)';ctx.fillRect(px+7,py+7,2,1);
    } else {
      ctx.fillStyle=b;
      const count=tile==='rock'||tile==='cave_floor'?4:2;
      for(let i=0;i<count;i++) { const fx=px+3+Math.floor(tileNoise(x+i,y,1)*25), fy=py+4+Math.floor(tileNoise(x,y+i,2)*24); ctx.fillRect(fx,fy,tile==='rock'?4:2,2); }
      if(tile==='path'||tile==='sand_path'||tile==='snow_path'||tile==='cave_path') {
        ctx.fillStyle='rgba(255,255,255,.12)';ctx.fillRect(px+5,py+5,1,1);ctx.fillRect(px+22,py+17,2,1);
        ctx.fillStyle='rgba(71,43,32,.14)';ctx.fillRect(px+11,py+25,4,1);
      }
    }
  }
  function shadow(x,y,w=22,h=8) { ctx.fillStyle='rgba(5,10,18,.28)';ctx.beginPath();ctx.ellipse(x,y,w/2,h/2,0,0,Math.PI*2);ctx.fill(); }
  function treeDraw(o) {
    const x=o.x*TILE,y=o.y*TILE, old=o.type==='old_tree';
    shadow(x+16,y+29,30,9);
    ctx.fillStyle=old?'#432e29':'#493026';ctx.fillRect(x+12,y+18,9,14);ctx.fillStyle=old?'#765039':'#76503a';ctx.fillRect(x+14,y+19,3,11);
    const layers=old?[[-1,8,34,22,'#164437'],[2,2,29,23,'#236249'],[7,-3,20,20,'#327957']]:[[1,8,30,22,'#164532'],[3,3,26,22,'#226346'],[7,-2,19,19,'#347c53']];
    layers.forEach(([ox,oy,w,h,c],i)=>{ctx.fillStyle=c;ctx.fillRect(x+ox,y+oy,w,h);ctx.fillStyle=i===2?'#55a66c':'rgba(115,189,111,.42)';ctx.fillRect(x+ox+4,y+oy+3,Math.max(4,w*.36),3);ctx.fillStyle='rgba(0,0,0,.17)';ctx.fillRect(x+ox+2,y+oy+h-3,w-4,3);});
    if(old){ctx.fillStyle='#d0b77a';ctx.fillRect(x+11,y+10,4,3);ctx.fillRect(x+22,y+15,4,3);}
  }
  function buildingDraw(o) {
    const x=o.x*TILE,y=o.y*TILE,w=(o.width||3)*TILE,h=(o.height||2)*TILE;
    const palette=o.type==='pokecenter'?['#e45c70','#a83255']:o.type==='gym'?['#7159aa','#40306e']:o.type==='lab'?['#49a9a7','#286a79']:o.type==='shop'?['#dfa44e','#a86139']:['#c86c62','#824452'];
    shadow(x+w/2,y+h+2,w*.8,14);
    // gabled roof, layered fascia and a bright highlight ridge
    ctx.fillStyle=palette[1];ctx.fillRect(x-4,y+13,w+8,h-1);
    ctx.fillStyle=palette[0];ctx.beginPath();ctx.moveTo(x-7,y+17);ctx.lineTo(x+w/2,y-14);ctx.lineTo(x+w+7,y+17);ctx.closePath();ctx.fill();
    ctx.fillStyle='rgba(255,218,156,.46)';ctx.beginPath();ctx.moveTo(x-3,y+15);ctx.lineTo(x+w/2,y-9);ctx.lineTo(x+w/2+4,y+15);ctx.closePath();ctx.fill();
    ctx.fillStyle='rgba(28,27,51,.24)';ctx.beginPath();ctx.moveTo(x+w/2,y-14);ctx.lineTo(x+w+7,y+17);ctx.lineTo(x+w+7,y+21);ctx.lineTo(x+w/2,y-9);ctx.closePath();ctx.fill();
    ctx.fillStyle='#f2d594';ctx.fillRect(x+7,y+19,w-14,4);
    ctx.fillStyle='#f3d9ae';ctx.fillRect(x+9,y+23,w-18,h-23);
    ctx.fillStyle='#6b4050';ctx.fillRect(x+9,y+23,w-18,3);
    // windows and entrance
    ctx.fillStyle='#73d7e9';ctx.fillRect(x+17,y+28,17,13);ctx.fillStyle='rgba(255,255,255,.6)';ctx.fillRect(x+19,y+30,4,9);
    ctx.fillStyle='#73d7e9';ctx.fillRect(x+w-34,y+28,17,13);ctx.fillStyle='rgba(255,255,255,.55)';ctx.fillRect(x+w-32,y+30,4,9);
    ctx.fillStyle='#533347';ctx.fillRect(x+w/2-8,y+h-25,16,25);ctx.fillStyle='#e7ba75';ctx.fillRect(x+w/2-6,y+h-23,12,23);ctx.fillStyle='#8c5549';ctx.fillRect(x+w/2+3,y+h-12,2,2);
    ctx.fillStyle=palette[0];ctx.fillRect(x+w/2-11,y+h-28,22,4);
    if(o.type==='pokecenter'){ctx.fillStyle='#fff4e8';ctx.fillRect(x+w/2-2,y+4,4,13);ctx.fillRect(x+w/2-7,y+9,14,4);}
    if(o.type==='gym'){ctx.fillStyle='#f6d679';ctx.fillRect(x+w/2-8,y+2,16,5);}
  }
  function objectDraw(o) {
    const x=o.x*TILE,y=o.y*TILE;
    if(['house','lab','pokecenter','gym','shop','league_hall'].includes(o.type)){buildingDraw(o);return;}
    ctx.save();
    if(o.type==='tree'||o.type==='old_tree') treeDraw(o);
    else if(o.type==='sign') { shadow(x+16,y+30,20,5);ctx.fillStyle='#57392a';ctx.fillRect(x+13,y+15,6,17);ctx.fillStyle='#a86e3d';ctx.fillRect(x+5,y+7,22,13);ctx.fillStyle='#f0d18a';ctx.fillRect(x+7,y+9,18,8);ctx.fillStyle='#66422f';ctx.fillRect(x+12,y+12,8,2); }
    else if(o.type==='fountain') { shadow(x+16,y+29,31,9);ctx.fillStyle='#8b9db2';ctx.fillRect(x+3,y+16,26,12);ctx.fillStyle='#c2d5d9';ctx.fillRect(x+5,y+14,22,4);ctx.fillStyle='#55c6df';ctx.fillRect(x+7,y+8,18,8);ctx.fillStyle='#9ceeff';ctx.fillRect(x+13,y+4,6,11);ctx.fillStyle='rgba(255,255,255,.75)';ctx.fillRect(x+9,y+10,3,3); }
    else if(o.type.includes('crystal')||o.type==='glow_mushroom') { shadow(x+16,y+28,23,7);ctx.shadowColor='#9b7bff';ctx.shadowBlur=14;ctx.fillStyle='#8a69e8';ctx.beginPath();ctx.moveTo(x+16,y+1);ctx.lineTo(x+27,y+24);ctx.lineTo(x+20,y+28);ctx.lineTo(x+7,y+23);ctx.fill();ctx.shadowBlur=0;ctx.fillStyle='#dcd0ff';ctx.beginPath();ctx.moveTo(x+15,y+6);ctx.lineTo(x+18,y+21);ctx.lineTo(x+13,y+20);ctx.closePath();ctx.fill(); }
    else if(o.type==='lantern') { shadow(x+16,y+30,17,5);ctx.fillStyle='#61452f';ctx.fillRect(x+14,y+20,4,12);ctx.fillStyle='rgba(255,185,79,.14)';ctx.beginPath();ctx.arc(x+16,y+15,17,0,Math.PI*2);ctx.fill();ctx.fillStyle='#49372b';ctx.fillRect(x+10,y+7,12,16);ctx.fillStyle='#e59a43';ctx.fillRect(x+12,y+9,8,11);ctx.fillStyle='#fff2ae';ctx.fillRect(x+14,y+11,4,7); }
    else if(o.type==='flower_bed') {ctx.fillStyle='#765039';ctx.fillRect(x+2,y+19,28,10);ctx.fillStyle='#428355';ctx.fillRect(x+4,y+13,24,9);['#f5c8dc','#f3d47b','#a8d7f0'].forEach((c,i)=>{ctx.fillStyle=c;ctx.fillRect(x+6+i*7,y+11-(i%2)*3,4,4);ctx.fillRect(x+7+i*7,y+8-(i%2)*3,2,3);});}
    else if(o.type==='healing_station') { shadow(x+16,y+28,25,7);ctx.fillStyle='#df5570';ctx.fillRect(x+4,y+5,24,20);ctx.fillStyle='#fff1f4';ctx.fillRect(x+13,y+8,6,14);ctx.fillRect(x+9,y+12,14,6); }
    else if(o.type.includes('altar')||o.type.includes('gate')||o.type.includes('arch')) { shadow(x+16,y+30,30,7);ctx.fillStyle='#514466';ctx.fillRect(x+3,y+10,7,22);ctx.fillRect(x+22,y+10,7,22);ctx.fillStyle='#776995';ctx.fillRect(x+2,y+6,28,8);ctx.fillStyle='#c2b1ed';ctx.fillRect(x+7,y+4,18,5);ctx.fillStyle='#171830';ctx.fillRect(x+11,y+14,10,18); }
    else { shadow(x+16,y+29,22,6);ctx.fillStyle='#76627a';ctx.fillRect(x+5,y+8,22,22); }
    ctx.restore();
  }
  function personDraw(x,y,shirt,trainer,facing='down',time=0) {
    const px=x*TILE,py=y*TILE,bob=Math.sin(time/170+x*2+y)*1.2;
    shadow(px+16,py+30,21,7);
    ctx.fillStyle='#2d2130';ctx.fillRect(px+10,py+16+bob,12,13);ctx.fillStyle=trainer?'#d67c4e':'#8d5caa';ctx.fillRect(px+8,py+15+bob,16,12);
    ctx.fillStyle='#493b4e';ctx.fillRect(px+9,py+25+bob,6,7);ctx.fillRect(px+18,py+25+bob,6,7);
    ctx.fillStyle='#edbd92';ctx.fillRect(px+11,py+7+bob,10,10);
    ctx.fillStyle=shirt;ctx.fillRect(px+9,py+3+bob,14,7);ctx.fillRect(px+8,py+7+bob,16,3);
    ctx.fillStyle='#302239';ctx.fillRect(px+11,py+12+bob,2,2);ctx.fillRect(px+19,py+12+bob,2,2);
    ctx.fillStyle='#fff0d4';ctx.fillRect(px+12,py+12+bob,1,1);ctx.fillRect(px+20,py+12+bob,1,1);
    if(facing==='left'||facing==='right'){ctx.fillStyle='#f3d1a5';ctx.fillRect(px+(facing==='left'?6:23),py+18+bob,3,5);}
  }
  function npcDraw(n,time=0) { personDraw(n.x,n.y,n.trainer?'#e98a4f':'#42b9a9',!!n.trainer,n.direction||'down',time); }
  function playerDraw(time=0) {
    const x=state.x*TILE,y=state.y*TILE,bob=Math.sin(time/130)*1.3;
    shadow(x+16,y+30,22,7);
    ctx.fillStyle='#26344b';ctx.fillRect(x+10,y+17+bob,12,13);ctx.fillStyle='#29a9c0';ctx.fillRect(x+8,y+15+bob,16,13);
    ctx.fillStyle='#e3b772';ctx.fillRect(x+10,y+26+bob,6,6);ctx.fillRect(x+18,y+26+bob,6,6);
    ctx.fillStyle='#f0c49c';ctx.fillRect(x+11,y+7+bob,10,10);
    ctx.fillStyle='#443248';ctx.fillRect(x+9,y+4+bob,14,6);ctx.fillRect(x+8,y+7+bob,4,5);
    ctx.fillStyle='#eff4ff';ctx.fillRect(x+18,y+11+bob,2,2);ctx.fillStyle='#27344b';ctx.fillRect(x+19,y+11+bob,1,2);
    if(state.facing==='left') {ctx.fillStyle='#27344b';ctx.fillRect(x+10,y+11+bob,2,2);}
    // Backpack and shoulder strap give the tiny player silhouette a readable adventurer shape.
    ctx.fillStyle='#d58b43';ctx.fillRect(x+20,y+17+bob,4,7);ctx.fillStyle='#ffe0a0';ctx.fillRect(x+21,y+18+bob,2,2);
  }
  function draw(time=performance.now()) {
    const m=map(); if (!m) return;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    for(let y=0;y<m.height;y++) for(let x=0;x<m.width;x++) tileDraw(m.tiles[y][x],x,y,time);
    const actors=[...m.objects.map(o=>({y:o.y,draw:()=>objectDraw(o)})),...m.npcs.map(n=>({y:n.y,draw:()=>npcDraw(n,time)})),{y:state.y,draw:()=>playerDraw(time)}];
    actors.sort((a,b)=>a.y-b.y).forEach(actor=>actor.draw());
    // A restrained edge vignette adds depth without hiding the crisp pixel art.
    const vignette=ctx.createRadialGradient(480,350,230,480,350,650);vignette.addColorStop(0,'rgba(7,12,24,0)');vignette.addColorStop(1,'rgba(7,12,24,.30)');ctx.fillStyle=vignette;ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle='rgba(8,12,26,.76)';ctx.fillRect(0,0,canvas.width,34);ctx.fillStyle='rgba(103,232,249,.35)';ctx.fillRect(0,33,canvas.width,1);
    ctx.fillStyle='#f5c542';ctx.font='14px PixelTitle, monospace';ctx.fillText(m.name.toUpperCase(),18,22);
    ctx.fillStyle='rgba(224,234,255,.75)';ctx.font='18px PixelBody, monospace';ctx.textAlign='right';ctx.fillText('AURELIA REGION  •  '+(m.theme||'WILDS').toUpperCase(),canvas.width-16,24);ctx.textAlign='left';
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

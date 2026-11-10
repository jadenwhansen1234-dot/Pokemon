/* ============================================================
   POKÉMON ECLIPSE — pixel-art sprite factory
   All creatures & characters are drawn procedurally.
   ============================================================ */
'use strict';

function hexToRgb(h) {
  h = h.replace('#','');
  if (h.length === 3) h = h.split('').map(c=>c+c).join('');
  return [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)];
}
function rgbToHex(r,g,b) { return '#' + [r,g,b].map(v=>clamp(Math.round(v),0,255).toString(16).padStart(2,'0')).join(''); }
function shiftColor(hex, deg, satMul=1, lightMul=1) {
  let [r,g,b] = hexToRgb(hex).map(v=>v/255);
  const max = Math.max(r,g,b), min = Math.min(r,g,b);
  let h=0, s=0, l=(max+min)/2;
  if (max !== min) {
    const d = max-min;
    s = l > .5 ? d/(2-max-min) : d/(max+min);
    h = max===r ? ((g-b)/d+(g<b?6:0)) : max===g ? ((b-r)/d+2) : ((r-g)/d+4);
    h *= 60;
  }
  h = (h + deg + 360) % 360; s = clamp(s*satMul,0,1); l = clamp(l*lightMul,0,1);
  const c = (1-Math.abs(2*l-1))*s, x = c*(1-Math.abs((h/60)%2-1)), m = l-c/2;
  let rr=0,gg=0,bb=0;
  if (h<60){rr=c;gg=x;} else if(h<120){rr=x;gg=c;} else if(h<180){gg=c;bb=x;}
  else if(h<240){gg=x;bb=c;} else if(h<300){rr=x;bb=c;} else {rr=c;bb=x;}
  return rgbToHex((rr+m)*255,(gg+m)*255,(bb+m)*255);
}

const PX = {
  rect(c,x,y,w,h,col){ c.fillStyle=col; c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h)); },
  ell(c,cx,cy,rx,ry,col){
    c.fillStyle=col;
    for (let y=-Math.ceil(ry); y<=ry; y++){
      const hw = Math.floor(rx*Math.sqrt(Math.max(0,1-(y*y)/(ry*ry))));
      c.fillRect(Math.round(cx-hw), Math.round(cy+y), hw*2+1, 1);
    }
  },
  ring(c,cx,cy,rx,ry,col,w=2){ // outlined ellipse by layered ellipses
    PX.ell(c,cx,cy,rx,ry,col);
    PX.ell(c,cx,cy,rx-w,ry-w,'__clear__');
  },
  tri(c,x1,y1,x2,y2,x3,y3,col){
    c.fillStyle=col;
    const minY=Math.floor(Math.min(y1,y2,y3)), maxY=Math.ceil(Math.max(y1,y2,y3));
    for (let y=minY;y<=maxY;y++){
      const xs=[];
      const edges=[[x1,y1,x2,y2],[x2,y2,x3,y3],[x3,y3,x1,y1]];
      for(const [ax,ay,bx,by] of edges){
        if ((y>=ay&&y<=by)||(y>=by&&y<=ay)){
          if (by===ay) continue;
          xs.push(ax+(bx-ax)*((y-ay)/(by-ay)));
        }
      }
      if (xs.length>=2){ const xa=Math.round(Math.min(...xs)), xb=Math.round(Math.max(...xs)); c.fillRect(xa,y,xb-xa+1,1); }
    }
  },
  line(c,x1,y1,x2,y2,col,w=2){
    const dx=x2-x1, dy=y2-y1; const steps=Math.max(Math.abs(dx),Math.abs(dy),1);
    c.fillStyle=col;
    for(let i=0;i<=steps;i++){ const x=Math.round(x1+dx*i/steps), y=Math.round(y1+dy*i/steps); c.fillRect(x-Math.floor(w/2),y-Math.floor(w/2),w,w); }
  }
};

function spriteAlpha(hex, a) {
  const [r,g,b] = hexToRgb(hex);
  return `rgba(${r},${g},${b},${a})`;
}

/* draw an outlined blob: silhouette + fill + layered shading + highlights */
function blob(c,cx,cy,rx,ry,dark,base,light,opts={}) {
  // silhouette / contact outline
  PX.ell(c,cx,cy,rx+2,ry+2,dark);
  // base fill
  PX.ell(c,cx,cy,rx,ry,base);
  // broad underside shading
  PX.ell(c,cx,cy+ry*0.30,rx*0.94,ry*0.60,shiftColor(base,-7,.95,.81));
  // mid-body gradient band
  PX.ell(c,cx-rx*0.10,cy+ry*0.06,rx*0.78,ry*0.52,shiftColor(base,2,.88,.92));
  // warm belly
  PX.ell(c,cx-rx*0.05,cy+ry*0.55,rx*0.60,ry*0.30,opts.belly||shiftColor(base,8,.68,1.14));
  // top-left key light
  PX.ell(c,cx-rx*0.28,cy-ry*0.36,rx*0.52,ry*0.27,light);
  PX.ell(c,cx-rx*0.34,cy-ry*0.42,rx*0.30,ry*0.15,'#ffffff');
  // dither speckles along the shadow side for a soft pixel gradient
  for (let i=0;i<4;i++){
    const t=(i+1)/5;
    PX.rect(c,Math.round(cx+rx*(.35+t*.4)),Math.round(cy+ry*(.10+t*.45)),1,1,spriteAlpha(dark,.35));
  }
  if (opts.detail!==false) {
    PX.rect(c,Math.round(cx-rx*.34),Math.round(cy+ry*.30),Math.max(2,Math.round(rx*.3)),1,spriteAlpha(light,.30));
  }
}

function eye(c,x,y,rx,ry,opts={}) {
  const look = opts.look == null ? 0.4 : opts.look;
  const iris = opts.iris || '#22314a';
  // socket + sclera
  PX.ell(c,x,y,rx+1.4,ry+1.4,'#17121f');
  PX.ell(c,x,y,rx,ry,'#fbfdff');
  // iris gradient
  PX.ell(c,x+look*rx*.38,y+ry*.06,rx*.70,ry*.78,iris);
  PX.ell(c,x+look*rx*.38,y+ry*.16,rx*.46,ry*.52,shiftColor(iris,-18,1.1,.72));
  // pupil
  PX.ell(c,x+look*rx*.40,y+ry*.14,rx*.23,ry*.34,'#0a0e18');
  // catchlights
  PX.ell(c,x-rx*.20,y-ry*.30,rx*.34,ry*.30,'#ffffff');
  if (opts.pupilShine!==false) PX.ell(c,x+rx*.30,y+ry*.28,rx*.17,ry*.16,'#ffffff');
  // brow / upper lid shadow
  PX.rect(c,Math.round(x-rx),Math.round(y-ry-1),Math.round(rx*2+1),1,spriteAlpha('#17121f',.32));
}

function mouth(c,x,y,w,h,col='#2a1a24') { PX.ell(c,x,y,w,h,col); }

function makeCreatureCanvas(sp, opts={}) {
  const S = 160;
  const c = document.createElement('canvas'); c.width=S; c.height=S;
  const x = c.getContext('2d'); x.imageSmoothingEnabled=false;
  const shiny = !!opts.shiny;
  let [base,dark,light,accent,extra] = sp.cols;
  if (shiny) {
    base = shiftColor(base, 55, 1.15, 1.05);
    dark = shiftColor(dark, 55, 1.1, .9);
    light = shiftColor(light, 50, 1.1, 1.02);
    accent = shiftColor(accent, 125, 1.2, 1.05);
    extra = shiftColor(extra, 125, 1.1, 1.02);
  }
  const C = {base,dark,light,accent,extra,shiny};
  x.save();
  const scale = sp.scale || 1;
  // Render at 2x with a small safe margin for the outline pass.
  x.translate(S/2, S/2); x.scale(2*scale, 2*scale); x.translate(-36, -36);

  const shape = sp.shape || 'quad';
  const f = new Set(sp.features||[]);

  // --- shared feature helpers ---
  const wings = (cx,cy,span,drop,wingCol,edgeCol) => {
    PX.tri(x,cx,cy,cx-span,cy-drop,cx-span*.35,cy+drop*.9,edgeCol);
    PX.tri(x,cx,cy,cx-span*.92,cy-drop*.85,cx-span*.3,cy+drop*.55,wingCol);
    PX.tri(x,cx,cy,cx+span,cy-drop,cx+span*.35,cy+drop*.9,edgeCol);
    PX.tri(x,cx,cy,cx+span*.92,cy-drop*.85,cx+span*.3,cy+drop*.55,wingCol);
  };
  const horns = (cx,cy,spread,len,col=accent) => {
    PX.tri(x,cx-spread,cy,cx-spread*.5,cy-len,cx-spread*.15,cy,col);
    PX.tri(x,cx+spread,cy,cx+spread*.5,cy-len,cx+spread*.15,cy,col);
  };
  const flame = (cx,cy,size,col=accent,hi=extra) => {
    PX.ell(x,cx,cy+size*.3,size*.55,size*.5,col);
    PX.tri(x,cx-size*.55,cy+size*.2,cx,cy-size*.9,cx+size*.55,cy+size*.2,col);
    PX.tri(x,cx-size*.3,cy+size*.1,cx,cy-size*.5,cx+size*.25,cy+size*.1,hi);
    PX.ell(x,cx,cy+size*.32,size*.34,size*.26,hi);
  };
  const leaf = (cx,cy,w,h,rot=0,col=accent,vein=dark) => {
    // pixel leaf: pointed oval
    PX.ell(x,cx,cy,w,h,col);
    PX.tri(x,cx-w,cy,cx,cy-h*1.4,cx+w,cy,col);
    PX.line(x,cx,cy+h*.6,cx,cy-h*.8,vein,1);
  };
  const crystal = (cx,cy,w,h,col=accent,hi=extra) => {
    PX.tri(x,cx,cy-h,cx-w,cy+h*.15,cx+w,cy+h*.15,col);
    PX.tri(x,cx-w*.3,cy-h*.65,cx-w*.1,cy+h*.15,cx+w*.2,cy+h*.15,hi);
  };
  const eyeSet = (cx,cy,gap,rx=3,ry=4) => { eye(x,cx-gap,cy,rx,ry); eye(x,cx+gap,cy,rx,ry); };
  const spark = (sx,sy,s,col) => {
    PX.rect(x,sx-s,sy,2*s+1,1,col); PX.rect(x,sx,sy-s,1,2*s+1,col);
    PX.rect(x,sx,sy,1,1,'#ffffff');
  };
  const bubble = (sx,sy,r,col) => {
    PX.ell(x,sx,sy,r,r,spriteAlpha(col,.30));
    PX.ell(x,sx-r*.3,sy-r*.3,Math.max(1,r*.4),Math.max(1,r*.4),spriteAlpha('#ffffff',.75));
  };
  const typeFlair = type => {
    if (type === 'Fire') {
      PX.rect(x,10,52,2,2,spriteAlpha(accent,.85)); PX.rect(x,7,47,1,3,spriteAlpha(extra,.8));
      PX.rect(x,60,11,2,2,spriteAlpha(accent,.8)); PX.rect(x,64,16,1,2,spriteAlpha(extra,.7));
    } else if (type === 'Water') {
      bubble(10,26,3,accent); bubble(63,52,2.2,accent); bubble(58,8,1.6,extra);
    } else if (type === 'Grass') {
      PX.ell(x,9,24,4,2,shiftColor(accent,0,1,.9)); PX.tri(x,6,24,11,17,13,25,accent);
      PX.ell(x,61,52,3.5,2,accent); PX.tri(x,58,52,63,45,65,53,shiftColor(accent,12,1,.95));
    } else if (type === 'Electric') {
      spark(9,22,3,accent); spark(62,14,2,extra); spark(57,55,1.5,accent);
    } else if (type === 'Ghost') {
      PX.ell(x,11,50,4,4,spriteAlpha(accent,.32)); PX.ell(x,63,42,3,3,spriteAlpha(accent,.26));
      PX.ell(x,58,10,2.5,2.5,spriteAlpha(extra,.30));
    } else if (type === 'Ice') {
      spark(10,18,3,light); spark(63,46,2.4,extra); PX.rect(x,56,9,2,1,spriteAlpha(light,.8));
    } else if (type === 'Fairy') {
      spark(11,20,3,extra); spark(62,50,2.4,accent); PX.rect(x,58,9,1,1,'#ffffff');
    } else if (type === 'Psychic') {
      PX.ell(x,60,18,2.5,2.5,spriteAlpha(accent,.55)); PX.ell(x,9,44,2,2,spriteAlpha(extra,.45));
      PX.ell(x,60,18,5,5,spriteAlpha(accent,.16));
    } else if (type === 'Dragon') {
      PX.rect(x,9,34,2,1,spriteAlpha(accent,.6)); PX.rect(x,61,24,1,2,spriteAlpha(extra,.55));
      PX.rect(x,57,56,2,1,spriteAlpha(accent,.5));
    } else if (type === 'Dark' || type === 'Poison') {
      PX.ell(x,10,54,4,3,spriteAlpha(dark,.4)); PX.ell(x,62,50,3,2.5,spriteAlpha(accent,.30));
    } else if (type === 'Ground' || type === 'Rock') {
      PX.rect(x,12,62,2,1,spriteAlpha(dark,.5)); PX.rect(x,56,61,3,1,spriteAlpha(dark,.4));
      PX.rect(x,7,57,1,1,spriteAlpha(light,.5));
    } else if (type === 'Steel') {
      spark(11,30,2.2,light); spark(62,18,1.8,extra);
    } else if (type === 'Bug') {
      PX.rect(x,10,36,1,1,spriteAlpha(accent,.9)); PX.rect(x,61,40,1,1,spriteAlpha(extra,.8));
    } else if (type === 'Flying') {
      PX.rect(x,8,30,3,1,spriteAlpha(light,.45)); PX.rect(x,59,52,3,1,spriteAlpha(light,.35));
    } else if (type === 'Fighting') {
      PX.rect(x,10,30,2,1,spriteAlpha(accent,.55)); PX.rect(x,60,52,2,1,spriteAlpha(accent,.45));
    }
  };

  if (shape === 'quad') {
    // tail
    if (f.has('tail')||f.has('tailflame')) {
      PX.line(x,30,46,15,38,dark,7); PX.line(x,30,46,15,38,base,4);
      PX.ell(x,14,37,5,4,base); PX.ell(x,14,37,2,2,light);
      if (f.has('tailflame')) flame(12,30,7,accent,extra);
    }
    // legs
    PX.rect(x,29,46,7,12,dark); PX.rect(x,40,46,7,12,dark);
    PX.rect(x,30,46,5,11,base); PX.rect(x,41,46,5,11,base);
    PX.rect(x,30,55,6,3,dark); PX.rect(x,41,55,6,3,dark);
    if (f.has('claws')) { PX.rect(x,28,57,3,2,extra); PX.rect(x,45,57,3,2,extra); }
    // body
    blob(x,40,39,19,12,dark,base,light);
    // markings
    if (f.has('magma')) { PX.ell(x,32,39,5,3,accent); PX.ell(x,42,37,3,2,accent); }
    // head
    blob(x,55,27,14,12,dark,base,light);
    // snout
    if (f.has('snout')) { PX.ell(x,64,31,8,5,dark); PX.ell(x,64,30,7,4,base); PX.ell(x,64,29,3,1.5,light); }
    else { PX.ell(x,62,31,6,4,dark); PX.ell(x,62,30,5,3,base); }
    // ears
    if (f.has('ears')) {
      PX.tri(x,47,17,50,5,56,15,dark); PX.tri(x,48,16,51,8,55,15,base);
      PX.tri(x,65,16,62,4,70,14,dark); PX.tri(x,65,16,63,7,69,14,base);
      if (f.has('tailflame')) { PX.tri(x,50,14,51,8,54,14,accent); PX.tri(x,64,13,63,7,68,13,accent); }
    }
    if (f.has('mane')) { PX.ell(x,46,23,12,7,accent); PX.ell(x,46,23,9,4,light); }
    if (f.has('spikes')) { for(let i=0;i<3;i++) PX.tri(x,30+i*8,31,34+i*8,22,37+i*8,31,accent); }
    eyeSet(58,25,6,3,4);
    if (f.has('glasses')) { PX.rect(x,50,23,8,1,extra); PX.rect(x,64,23,8,1,extra); PX.rect(x,58,23,7,1,extra); }
    PX.ell(x,64,34,3,1.5,dark);
    if (f.has('claws')) { PX.rect(x,68,33,3,1,extra); }
  }

  else if (shape === 'biped' || shape === 'lizard') {
    // tail for lizard/biped
    if (f.has('tail')||f.has('tailflame')) {
      PX.line(x,30,47,14,41,dark,7); PX.line(x,30,47,14,41,base,4);
      if (f.has('blades')) { PX.tri(x,18,44,10,33,26,39,accent); PX.tri(x,20,44,14,36,26,41,light); }
      if (f.has('tailflame')) flame(12,34,7,accent,extra);
    }
    // legs
    PX.rect(x,28,47,8,13,dark); PX.rect(x,40,47,8,13,dark);
    PX.rect(x,29,47,6,12,base); PX.rect(x,41,47,6,12,base);
    PX.rect(x,27,58,8,3,dark); PX.rect(x,40,58,8,3,dark);
    // body
    blob(x,38,41,14,13,dark,base,light);
    // arms
    PX.line(x,28,36,20,46,dark,5); PX.line(x,28,36,20,46,base,3);
    PX.line(x,48,36,56,47,dark,5); PX.line(x,48,36,56,47,base,3);
    if (f.has('claws')) { PX.rect(x,17,45,4,2,extra); PX.rect(x,54,46,4,2,extra); }
    // neck + head
    blob(x,50,26,13,11,dark,base,light);
    // crest / fin / leaf
    if (f.has('fin')) { PX.tri(x,48,17,55,4,60,18,accent); PX.tri(x,50,17,55,8,58,18,light); }
    if (f.has('crest')) { PX.tri(x,44,15,47,3,53,14,accent); PX.tri(x,52,14,57,3,60,16,accent); }
    if (f.has('leaf')) { leaf(50,12,7,9,0,accent,light); leaf(58,16,5,7,.3,shiftColor(accent,20,.9,.9),light); }
    if (f.has('horn')) { PX.tri(x,58,16,62,8,66,18,accent); }
    if (f.has('blades')) { PX.tri(x,34,29,24,20,36,22,accent); PX.tri(x,36,28,28,23,37,24,light); }
    if (f.has('aura')) { PX.ell(x,50,36,10,4,'rgba(141,224,255,.35)'); }
    eyeSet(52,25,5,3,4);
    if (f.has('visor')) { PX.rect(x,43,21,17,4,'#0b1a2a'); PX.rect(x,44,22,7,2,accent); }
    if (f.has('mask')) { PX.ell(x,57,31,8,5,dark); PX.ell(x,57,30,6,3,light); }
    if (f.has('belt')) { PX.rect(x,26,47,25,4,dark); PX.rect(x,36,47,6,5,accent); }
    if (f.has('cloak')) { PX.tri(x,24,26,18,58,46,52,'rgba(120,220,230,.55)'); PX.tri(x,26,30,22,54,38,50,accent); }
    if (f.has('magma')) { PX.ell(x,33,42,5,3,accent); PX.rect(x,34,45,2,7,accent); }
    PX.ell(x,58,32,3,1.5,dark);
  }

  else if (shape === 'bird') {
    // tail feathers
    PX.tri(x,28,44,8,52,26,33,dark); PX.tri(x,28,42,12,48,28,31,base);
    PX.tri(x,27,39,7,38,25,29,accent); PX.tri(x,27,40,10,41,24,32,light);
    // wings
    if (f.has('wings')) {
      PX.tri(x,32,33,10,28,20,52,dark); PX.tri(x,32,34,15,31,22,49,base);
      PX.tri(x,40,34,56,24,48,54,dark); PX.tri(x,40,35,51,28,46,50,base);
      PX.line(x,16,33,24,48,dark,1); PX.line(x,49,29,45,48,dark,1);
    }
    if (f.has('fluff')) { PX.ell(x,33,36,13,10,light); PX.ell(x,33,36,11,8,'#ffffff'); }
    PX.rect(x,32,54,4,6,dark); PX.rect(x,41,54,4,6,dark);
    PX.rect(x,30,59,7,2,dark); PX.rect(x,41,59,7,2,dark);
    blob(x,38,40,16,14,dark,base,light);
    blob(x,52,25,11,10,dark,base,light);
    // beak
    PX.tri(x,61,24,68,27,61,30,accent); PX.tri(x,62,26,67,27,62,29,extra);
    // crest
    if (f.has('crest')) { PX.tri(x,46,16,50,4,55,16,accent); PX.tri(x,54,15,59,5,61,18,accent); }
    if (f.has('mask')) { PX.rect(x,45,19,15,4,dark); PX.rect(x,46,20,6,2,accent); }
    eye(x,52,23,3,4);
    if (f.has('ears')) { PX.tri(x,42,19,38,8,47,17,dark); PX.tri(x,43,18,40,11,46,17,base); PX.tri(x,56,18,60,7,63,19,dark); }
    // feet talons
    if (f.has('claws')) { PX.rect(x,29,61,3,2,extra); PX.rect(x,44,61,3,2,extra); }
  }

  else if (shape === 'bug') {
    // legs
    for (let i=0;i<3;i++){ PX.line(x,28+i*2,44+i*3,18+i*3,52+i*3,dark,2); PX.line(x,47-i*1,44+i*3,57-i*2,52+i*3,dark,2); }
    // wings
    if (f.has('wings')) {
      PX.tri(x,36,24,4,18,14,52,dark); PX.tri(x,35,25,9,21,17,48,base);
      PX.tri(x,40,24,68,16,60,52,dark); PX.tri(x,40,25,63,20,56,48,base);
      PX.rect(x,12,28,4,1,'rgba(255,255,255,.55)'); PX.rect(x,56,27,5,1,'rgba(255,255,255,.55)');
    }
    // body segments
    blob(x,36,41,12,13,dark,base,light);
    PX.ell(x,24,48,8,7,dark); PX.ell(x,24,47,7,6,base);
    PX.ell(x,46,47,8,7,dark); PX.ell(x,46,47,7,6,base);
    // bubble / fluff
    if (f.has('bubble')) { PX.ell(x,36,17,12,10,'#bfefff'); PX.ell(x,33,14,5,4,'#ffffff'); PX.ell(x,41,20,3,2,'rgba(255,255,255,.7)'); }
    if (f.has('fluff')) { PX.ell(x,36,28,15,9,light); PX.ell(x,36,28,12,7,'#ffffff'); }
    // head
    blob(x,52,33,11,9,dark,base,light);
    // antennae / horns
    PX.line(x,48,24,42,10,accent,2); PX.ell(x,41,9,2,2,extra);
    PX.line(x,56,24,61,10,accent,2); PX.ell(x,62,9,2,2,extra);
    if (f.has('horn')) { PX.tri(x,54,22,60,14,64,24,accent); }
    eye(x,50,31,3,4); eye(x,58,31,3,4);
    if (f.has('eyes')) { eye(x,48,31,2,3); eye(x,57,31,2,3); }
    PX.ell(x,58,38,2,1,dark);
    if (f.has('spikes')) { PX.tri(x,26,35,30,27,34,35,accent); }
  }

  else if (shape === 'serpent') {
    // coil
    PX.ell(x,37,53,23,9,dark); PX.ell(x,37,52,21,7,base); PX.ell(x,37,49,15,5,shiftColor(base,8,.9,.9));
    PX.ell(x,35,46,16,7,dark); PX.ell(x,35,45,14,5,base);
    // neck
    PX.line(x,44,44,50,25,dark,10); PX.line(x,44,44,50,25,base,6);
    // head
    blob(x,53,22,12,10,dark,base,light);
    if (f.has('whiskers')) { PX.line(x,59,27,66,30,accent,1); PX.line(x,58,31,65,35,accent,1); }
    if (f.has('fins')) { PX.tri(x,48,14,53,4,58,15,accent); PX.tri(x,56,15,62,6,64,18,accent); }
    if (f.has('horns')) { PX.tri(x,44,15,41,5,49,14,accent); PX.tri(x,60,14,65,4,68,16,accent); }
    if (f.has('scales')) { for(let i=0;i<4;i++) PX.ell(x,24+i*8,49,2,1,light); }
    eyeSet(51,21,4,3,4);
    PX.ell(x,61,28,3,1.5,dark);
    if (f.has('wings')) { PX.tri(x,38,24,24,12,30,38,dark); PX.tri(x,38,26,28,17,32,36,accent); }
  }

  else if (shape === 'blob') {
    if (f.has('roots')) { PX.line(x,28,54,22,62,dark,3); PX.line(x,44,54,50,62,dark,3); }
    if (f.has('wings')) { PX.tri(x,34,30,16,22,22,44,accent); PX.tri(x,44,30,62,22,56,44,accent); }
    blob(x,36,39,19,17,dark,base,light);
    if (f.has('shell')) { PX.ell(x,36,45,15,11,light); PX.ell(x,36,45,13,9,'#ffffff'); PX.tri(x,30,44,36,37,42,44,accent); }
    if (f.has('hood')) { PX.ell(x,36,26,16,13,accent); PX.ell(x,36,30,12,10,base); }
    if (f.has('leaves')) { leaf(30,20,7,9,-.4,accent,light); leaf(42,18,7,9,.3,accent,light); leaf(36,15,6,8,0,shiftColor(accent,20,.9,1.05),light); }
    if (f.has('flower')) { PX.ell(x,36,10,9,5,accent); PX.ell(x,36,10,5,2.5,extra); PX.ell(x,36,10,2,1,dark); }
    if (f.has('dress')) { PX.tri(x,24,42,36,60,48,42,light); PX.tri(x,27,44,36,58,45,44,accent); }
    if (f.has('ears')) { PX.tri(x,26,25,22,10,34,22,dark); PX.tri(x,46,25,50,10,56,22,dark); }
    if (f.has('horn')) { PX.tri(x,36,22,38,8,42,23,accent); }
    eyeSet(36,34,6,3,4);
    PX.ell(x,36,43,3,1.5,dark);
    if (f.has('eyes')) { eye(x,33,35,2,3); eye(x,41,35,2,3); }
    // feet
    PX.ell(x,28,55,5,3,dark); PX.ell(x,44,55,5,3,dark);
  }

  else if (shape === 'ghost') {
    if (f.has('gas')) { PX.ell(x,36,38,23,18,'rgba(120,80,160,.45)'); PX.ell(x,25,52,9,6,'rgba(120,80,160,.4)'); PX.ell(x,49,53,10,6,'rgba(120,80,160,.4)'); }
    // wispy bottom
    PX.tri(x,18,44,24,60,30,42,base); PX.tri(x,28,44,37,63,44,42,base); PX.tri(x,42,44,50,60,55,40,base);
    PX.ell(x,36,40,19,16,dark); PX.ell(x,36,39,17,14,base);
    PX.ell(x,32,34,10,6,light);
    if (f.has('flame')) { flame(36,14,10,accent,extra); PX.rect(x,34,22,4,8,light); }
    if (f.has('wax')) { PX.rect(x,30,27,12,14,light); PX.ell(x,36,27,6,3,extra); }
    if (f.has('chandelier')) { PX.rect(x,18,35,36,3,dark); PX.ell(x,20,36,3,4,light); PX.ell(x,52,36,3,4,light); PX.line(x,36,26,36,16,accent,3); }
    if (f.has('rag')) { PX.ell(x,36,34,17,14,base); PX.ell(x,36,30,13,9,light); PX.rect(x,22,38,28,8,base); PX.tri(x,20,42,26,54,32,42,base); PX.tri(x,40,42,46,54,52,42,base); PX.rect(x,29,20,6,3,dark); PX.rect(x,39,20,6,3,dark); eye(x,34,30,2,3,'#1a1420'); eye(x,44,30,2,3,'#1a1420'); }
    if (f.has('arms')) { PX.line(x,19,36,10,46,base,4); PX.line(x,53,36,62,46,base,4); }
    if (f.has('spikes')) { for(let i=0;i<4;i++) PX.tri(x,20+i*10,24,24+i*10,14,28+i*10,24,accent); }
    eyeSet(36,32,6,3,4);
    PX.ell(x,36,42,4,2,dark);
    if (f.has('eyes')) { eye(x,32,33,2,3); eye(x,41,33,2,3); }
  }

  else if (shape === 'fish') {
    PX.tri(x,18,40,2,28,10,46,dark); PX.tri(x,18,40,5,31,12,45,accent);
    PX.ell(x,38,38,19,14,dark); PX.ell(x,38,38,17,12,base);
    PX.ell(x,32,33,10,5,light);
    if (f.has('fins')) { PX.tri(x,36,22,44,10,50,24,accent); PX.tri(x,50,36,62,30,58,46,accent); }
    if (f.has('whiskers')) { PX.line(x,54,40,62,48,accent,1); PX.line(x,54,34,62,28,accent,1); }
    if (f.has('scales')) { for(let i=0;i<5;i++) PX.ell(x,28+i*5,38+((i%2)*2),1,1,light); }
    eye(x,48,34,3,4);
    PX.ell(x,54,43,3,1.5,dark);
  }

  else if (shape === 'armor') {
    // legs / base
    if (f.has('legs')) { PX.line(x,24,45,18,58,dark,5); PX.line(x,48,45,54,58,dark,5); PX.line(x,24,45,18,58,base,3); PX.line(x,48,45,54,58,base,3); }
    // shield
    if (f.has('shield')) {
      PX.tri(x,18,25,30,16,34,52,dark); PX.tri(x,20,27,29,19,32,49,base);
      PX.tri(x,20,27,28,22,29,40,light);
      PX.rect(x,24,36,4,2,accent);
    }
    // main body
    PX.rect(x,32,22,20,28,dark); PX.rect(x,34,24,16,24,base); PX.rect(x,35,25,7,7,light);
    if (f.has('cross')) { PX.rect(x,26,34,34,6,dark); PX.rect(x,28,35,30,4,base); }
    if (f.has('core')) { PX.ell(x,41,41,4,4,accent); PX.ell(x,41,41,2,2,extra); }
    // head / crown
    blob(x,44,20,10,8,dark,base,light);
    if (f.has('crown')) { PX.rect(x,34,10,20,3,accent); PX.tri(x,35,11,38,4,41,11,accent); PX.tri(x,42,11,45,3,48,11,accent); PX.tri(x,49,11,52,5,54,11,accent); }
    if (f.has('horn')) { PX.tri(x,52,15,58,8,58,20,accent); }
    // sword
    if (f.has('sword')) { PX.rect(x,56,18,3,28,light); PX.rect(x,55,18,5,2,accent); PX.rect(x,56,30,3,14,extra); }
    eyeSet(44,20,4,2,3);
    if (f.has('eyes')) { eye(x,42,20,2,3); eye(x,48,20,2,3); }
    if (f.has('wings')) { PX.tri(x,34,30,18,20,26,44,dark); PX.tri(x,34,31,22,24,28,42,accent); }
  }

  else if (shape === 'dragon') {
    // tail
    PX.line(x,24,48,8,52,dark,8); PX.line(x,24,48,8,52,base,5);
    PX.tri(x,9,52,2,44,8,58,dark); PX.tri(x,10,52,4,47,9,57,accent);
    // wings
    if (f.has('wings')) {
      PX.tri(x,38,30,8,10,20,50,dark); PX.tri(x,38,32,13,15,23,47,base);
      PX.tri(x,42,28,70,8,58,52,dark); PX.tri(x,42,30,65,13,55,48,base);
      PX.line(x,18,17,23,44,accent,1); PX.line(x,62,17,56,44,accent,1);
    }
    // legs
    PX.rect(x,26,47,9,15,dark); PX.rect(x,42,47,9,15,dark);
    PX.rect(x,27,47,7,14,base); PX.rect(x,43,47,7,14,base);
    PX.rect(x,24,61,9,3,dark); PX.rect(x,42,61,9,3,dark);
    if (f.has('claws')) { PX.rect(x,23,62,3,2,extra); PX.rect(x,46,62,3,2,extra); }
    // body + neck + head
    blob(x,39,42,16,14,dark,base,light);
    PX.line(x,46,34,51,21,dark,11); PX.line(x,46,34,51,21,base,7);
    blob(x,54,19,12,10,dark,base,light);
    // horns / crest
    if (f.has('horns')) { PX.tri(x,46,12,40,2,50,11,accent); PX.tri(x,57,11,62,1,66,13,accent); }
    if (f.has('crest')) { PX.tri(x,46,13,51,2,56,13,accent); }
    if (f.has('halo')) { PX.ell(x,54,5,13,3,'rgba(255,209,102,.65)'); PX.ell(x,54,5,11,2,'#fff8e0'); }
    if (f.has('armor')) { PX.rect(x,30,34,22,6,accent); PX.rect(x,33,36,6,4,extra); PX.rect(x,44,36,6,4,extra); }
    if (f.has('core')) { PX.ell(x,40,43,5,5,dark); PX.ell(x,40,43,3.5,3.5,accent); PX.ell(x,40,42,1.5,1.5,extra); }
    if (f.has('fins')) { PX.tri(x,38,30,32,16,44,26,accent); }
    if (f.has('spikes')) { for(let i=0;i<4;i++) PX.tri(x,28+i*5,30,30+i*5,20,33+i*5,30,accent); }
    if (f.has('crown')) { PX.rect(x,45,8,20,3,accent); PX.tri(x,47,9,50,2,53,9,accent); PX.tri(x,55,9,58,1,61,9,accent); }
    eyeSet(54,18,5,3,4);
    PX.ell(x,63,24,3,1.5,dark);
    if (f.has('mask')) { PX.ticks = 1; PX.rect(x,47,14,16,4,dark); PX.rect(x,48,15,6,2,accent); }
  }

  else { // generic blob fallback
    blob(x,36,36,18,18,dark,base,light);
    eyeSet(36,34,7,3,4);
  }

  // elemental flourishes around the sprite
  if (Array.isArray(sp.types) && sp.types[0]) typeFlair(sp.types[0]);

  // shiny sparkles in sprite corner
  if (shiny) {
    const sparkle = (sx,sy) => { PX.rect(x,sx-3,sy,7,1,'#fff7b0'); PX.rect(x,sx,sy-3,1,7,'#fff7b0'); PX.rect(x,sx-1,sy-1,3,3,'#ffffff'); };
    sparkle(60,10); sparkle(12,18);
  }
  x.restore();
  finishCreatureSprite(c, C);
  return c;
}

/* Add a crisp outer outline, top-left rim light and subtle inner shading. */
function finishCreatureSprite(canvas, C) {
  const w = canvas.width, h = canvas.height;
  const ctx = canvas.getContext('2d');
  let img;
  try { img = ctx.getImageData(0, 0, w, h); } catch (error) { return; }
  const src = img.data;
  const out = new Uint8ClampedArray(src);
  const [or, og, ob] = hexToRgb(shiftColor(C.dark, 0, 1, .62));
  const [lr, lg, lb] = hexToRgb(C.light);
  const alpha = (x, y) => (x < 0 || y < 0 || x >= w || y >= h) ? 0 : src[(y * w + x) * 4 + 3];
  const isOpaque = (x, y) => alpha(x, y) > 90;
  const neighbors = [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      if (src[i + 3] < 10) {
        let edge = false;
        for (const [dx, dy] of neighbors) {
          if (isOpaque(x + dx, y + dy)) { edge = true; break; }
        }
        if (edge) {
          out[i] = or; out[i + 1] = og; out[i + 2] = ob; out[i + 3] = 232;
        }
      } else if (src[i + 3] > 120 && (!isOpaque(x, y - 1) || !isOpaque(x - 1, y))) {
        const t = 0.30;
        out[i] = src[i] * (1 - t) + lr * t;
        out[i + 1] = src[i + 1] * (1 - t) + lg * t;
        out[i + 2] = src[i + 2] * (1 - t) + lb * t;
      }
    }
  }
  img.data.set(out);
  ctx.putImageData(img, 0, 0);
}

const CREATURE_CACHE = new Map();
function creatureCanvas(id, shiny = false, key = '') {
  const k = id + '|' + (shiny?'s':'n') + '|' + key;
  if (CREATURE_CACHE.has(k)) return CREATURE_CACHE.get(k);
  const sp = SPECIES[id];
  if (!sp) return null;
  const c = makeCreatureCanvas(sp, { shiny });
  CREATURE_CACHE.set(k, c);
  return c;
}
function drawCreature(ctx, id, x, y, size, opts = {}) {
  const sp = SPECIES[id];
  if (!sp) return;
  const c = creatureCanvas(id, opts.shiny || false, opts.cacheKey || '');
  if (!c) return;
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  if (opts.flip) { ctx.translate(x + size/2, 0); ctx.scale(-1,1); ctx.translate(-(x + size/2),0); }
  if (opts.alpha != null) ctx.globalAlpha = opts.alpha;
  ctx.drawImage(c, x, y, size, size);
  ctx.restore();
}

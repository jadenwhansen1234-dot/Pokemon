/* ============================================================
   POKÉMON ECLIPSE: AURELIA GENESIS — core utilities
   ============================================================ */
'use strict';

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

const wait = (ms) => new Promise(r => setTimeout(r, ms));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const rand = (a, b) => a + Math.random() * (b - a);
const randi = (a, b) => Math.floor(rand(a, b + 1));
const chance = (p) => Math.random() * 100 < p;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const cap = (s) => s ? s[0].toUpperCase() + s.slice(1) : s;

function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function weighted(list) {
  const weightOf = entry => {
    const value = Number(entry.weight ?? entry.w ?? 1);
    return Number.isFinite(value) && value > 0 ? value : 0;
  };
  const total = list.reduce((sum, entry) => sum + weightOf(entry), 0);
  if (!total) return pick(list);
  let r = Math.random() * total;
  for (const entry of list) { r -= weightOf(entry); if (r < 0) return entry; }
  return list[list.length - 1];
}
function roman(n) { return ['','I','II','III','IV','V','VI','VII','VIII'][n] || n; }
function fmtMoney(n) { return n.toLocaleString('en-US'); }
function displayName(sp) { return (sp.form ? sp.form + ' ' : '') + sp.name; }

/* ------------------------------------------------ types */
const TYPES = ['Normal','Fire','Water','Grass','Electric','Ice','Fighting','Poison','Ground','Flying','Psychic','Bug','Rock','Ghost','Dragon','Dark','Steel','Fairy'];

const TYPE_COLORS = {
  Normal:'#a8a878', Fire:'#f08030', Water:'#6890f0', Grass:'#78c850', Electric:'#f8d030',
  Ice:'#98d8d8', Fighting:'#c03028', Poison:'#a040a0', Ground:'#e0c068', Flying:'#a890f0',
  Psychic:'#f85888', Bug:'#a8b820', Rock:'#b8a038', Ghost:'#705898', Dragon:'#7038f8',
  Dark:'#705848', Steel:'#b8b8d0', Fairy:'#ee99ac'
};
const TYPE_DARK = {
  Normal:'#6d6d4e', Fire:'#9c3d0e', Water:'#2f56ad', Grass:'#3d7a24', Electric:'#a88b06',
  Ice:'#3f8f8f', Fighting:'#6e1610', Poison:'#5c1c5c', Ground:'#8a6f22', Flying:'#5a43a0',
  Psychic:'#a01c47', Bug:'#5c6610', Rock:'#6b5c18', Ghost:'#3a2b54', Dragon:'#3a1c8a',
  Dark:'#3a2c22', Steel:'#57576b', Fairy:'#a0526a'
};

const CHART = {
  Normal:   { Rock:.5, Ghost:0, Steel:.5 },
  Fire:     { Fire:.5, Water:.5, Grass:2, Ice:2, Bug:2, Rock:.5, Dragon:.5, Steel:2 },
  Water:    { Fire:2, Water:.5, Grass:.5, Ground:2, Rock:2, Dragon:.5 },
  Grass:    { Fire:.5, Water:2, Grass:.5, Poison:.5, Ground:2, Flying:.5, Bug:.5, Rock:2, Dragon:.5, Steel:.5 },
  Electric: { Water:2, Grass:.5, Electric:.5, Ground:0, Flying:2, Dragon:.5 },
  Ice:      { Fire:.5, Water:.5, Grass:2, Ice:.5, Ground:2, Flying:2, Dragon:2, Steel:.5 },
  Fighting: { Normal:2, Ice:2, Poison:.5, Flying:.5, Psychic:.5, Bug:.5, Rock:2, Ghost:0, Dark:2, Steel:2, Fairy:.5 },
  Poison:   { Grass:2, Poison:.5, Ground:.5, Rock:.5, Ghost:.5, Steel:0, Fairy:2 },
  Ground:   { Fire:2, Grass:.5, Electric:2, Poison:2, Flying:0, Bug:.5, Rock:2, Steel:2 },
  Flying:   { Grass:2, Electric:.5, Fighting:2, Bug:2, Rock:.5, Steel:.5 },
  Psychic:  { Fighting:2, Poison:2, Psychic:.5, Dark:0, Steel:.5 },
  Bug:      { Fire:.5, Grass:2, Fighting:.5, Poison:.5, Flying:.5, Psychic:2, Ghost:.5, Dark:2, Steel:.5, Fairy:.5 },
  Rock:     { Fire:2, Ice:2, Fighting:.5, Ground:.5, Flying:2, Bug:2, Steel:.5 },
  Ghost:    { Normal:0, Psychic:2, Ghost:2, Dark:.5 },
  Dragon:   { Dragon:2, Steel:.5, Fairy:0 },
  Dark:     { Fighting:.5, Psychic:2, Ghost:2, Dark:.5, Fairy:.5 },
  Steel:    { Fire:.5, Water:.5, Electric:.5, Ice:2, Rock:2, Steel:.5, Fairy:2 },
  Fairy:    { Fire:.5, Fighting:2, Poison:.5, Dragon:2, Dark:2, Steel:.5 }
};
function typeEff(atkType, defTypes) {
  let m = 1;
  for (const t of defTypes) { const row = CHART[atkType]; if (row && row[t] !== undefined) m *= row[t]; }
  return m;
}
function effLabel(m) {
  if (m === 0) return 'It had no effect…';
  if (m >= 4) return "It's ultra effective!";
  if (m > 1) return "It's super effective!";
  if (m < 1) return "It's not very effective…";
  return '';
}

/* ------------------------------------------------ audio */
const Sound = {
  ctx: null, master: null, musicGain: null, sfxGain: null,
  musicOn: true, sfxOn: true, track: null, loopTimer: null, noiseBuf: null, beat: 0,

  init() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    this.master = this.ctx.createGain(); this.master.gain.value = 0.55; this.master.connect(this.ctx.destination);
    this.musicGain = this.ctx.createGain(); this.musicGain.gain.value = this.musicOn ? 0.34 : 0; this.musicGain.connect(this.master);
    this.sfxGain = this.ctx.createGain(); this.sfxGain.gain.value = this.sfxOn ? 0.5 : 0; this.sfxGain.connect(this.master);
    // noise buffer
    const len = this.ctx.sampleRate * 0.6;
    this.noiseBuf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = this.noiseBuf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  },
  setMusic(on) { this.musicOn = on; if (this.musicGain) this.musicGain.gain.setTargetAtTime(on ? 0.34 : 0, this.ctx.currentTime, .05); },
  setSfx(on) { this.sfxOn = on; if (this.sfxGain) this.sfxGain.gain.setTargetAtTime(on ? 0.5 : 0, this.ctx.currentTime, .05); },
  note(freq, dur, type = 'square', vel = .2, when = 0, target = null, slide = 0) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime + when;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, freq + slide), t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vel, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur * 1.55);
    o.connect(g); g.connect(target || this.musicGain);
    o.start(t); o.stop(t + dur * 1.7);
  },
  drum(when = 0, kind = 'kick', vel = .35) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime + when;
    if (kind === 'kick') {
      const o = this.ctx.createOscillator(), g = this.ctx.createGain();
      o.type = 'sine'; o.frequency.setValueAtTime(130, t); o.frequency.exponentialRampToValueAtTime(38, t + .12);
      g.gain.setValueAtTime(vel, t); g.gain.exponentialRampToValueAtTime(0.001, t + .16);
      o.connect(g); g.connect(this.musicGain); o.start(t); o.stop(t + .18);
    } else {
      const s = this.ctx.createBufferSource(), g = this.ctx.createGain(), f = this.ctx.createBiquadFilter();
      s.buffer = this.noiseBuf; f.type = kind === 'hat' ? 'highpass' : 'bandpass'; f.frequency.value = kind === 'hat' ? 7500 : 1800;
      g.gain.setValueAtTime(vel, t); g.gain.exponentialRampToValueAtTime(0.001, t + (kind === 'hat' ? .05 : .12));
      s.connect(f); f.connect(g); g.connect(this.musicGain); s.start(t); s.stop(t + .14);
    }
  },
  midiFreq(m) { return 440 * Math.pow(2, (m - 69) / 12); },

  playTrack(name, opts = {}) {
    this.init();
    if (this.track === name && !opts.force) return;
    this.track = name;
    clearTimeout(this.loopTimer);
    if (!this.ctx) return;
    const tr = TRACKS[name] || TRACKS.town;
    this.beat = 0;
    const step = 60 / tr.bpm / 2;        // eighth-note
    const steps = tr.lead.length;
    const loopBeats = steps * step;

    const playLoop = () => {
      if (this.track !== name) return;
      const now = 0;
      // lead
      tr.lead.forEach((n, i) => {
        if (n === null || n === undefined) return;
        const f = this.midiFreq(tr.root + tr.scale[n % tr.scale.length] + 12 * Math.floor(n / tr.scale.length));
        this.note(f, step * 0.92, tr.leadWave || 'square', tr.leadVol || .16, i * step);
        if (tr.echo) this.note(f, step * .7, 'triangle', .05, i * step + step * 0.75);
      });
      // bass
      (tr.bass || []).forEach((n, i) => {
        if (n === null) return;
        const f = this.midiFreq(tr.root - 12 + tr.scale[n % tr.scale.length] + 12 * Math.floor(n / tr.scale.length));
        this.note(f, step * 1.8, 'triangle', .22, i * step * (tr.bassStep || 2));
      });
      // pad
      if (tr.pad) tr.pad.forEach((chord, i) => {
        chord.forEach(n => {
          const f = this.midiFreq(tr.root + tr.scale[0] + n);
          this.note(f, loopBeats / tr.pad.length * .95, 'sine', .055, i * loopBeats / tr.pad.length);
        });
      });
      // drums
      if (tr.drums) {
        for (let i = 0; i < steps; i++) {
          const d = tr.drums[i % tr.drums.length];
          if (d === 'k') this.drum(i * step, 'kick', .32);
          if (d === 's') this.drum(i * step, 'snare', .16);
          if (d === 'h') this.drum(i * step, 'hat', .07);
        }
      }
      this.loopTimer = setTimeout(playLoop, loopBeats * 1000 - 30);
    };
    playLoop();
  },
  stopMusic() { this.track = null; clearTimeout(this.loopTimer); },
  sfx(name) {
    this.init();
    if (!this.ctx || !this.sfxOn) return;
    const t = this.ctx.currentTime;
    const beep = (f, dur, type = 'square', vel = .16, when = 0, slide = 0) => this.note(f, dur, type, vel, when, this.sfxGain, slide);
    switch (name) {
      case 'blip': beep(760, .03, 'square', .06); break;
      case 'select': beep(520, .05, 'square', .12); beep(880, .07, 'square', .11, .05); break;
      case 'back': beep(420, .06, 'square', .1); beep(280, .07, 'square', .08, .05); break;
      case 'hit': this.drum(0, 'snare', .3); beep(180, .08, 'sawtooth', .16, 0, -80); break;
      case 'super': this.drum(0, 'snare', .4); beep(250, .12, 'sawtooth', .2, 0, -140); beep(120, .18, 'square', .15, .06, -60); break;
      case 'heal': [523,659,784,1047].forEach((f,i)=>beep(f,.16,'sine',.13,i*.09)); break;
      case 'ball': beep(300, .18, 'sine', .15, 0, 500); break;
      case 'catch': [523,659,784,1047,1319].forEach((f,i)=>beep(f,.18,'square',.12,i*.1)); break;
      case 'faint': beep(440, .5, 'square', .12, 0, -380); break;
      case 'level': [523,659,784,1047].forEach((f,i)=>beep(f,.14,'square',.15,i*.08)); break;
      case 'awaken': {
        const o = this.ctx.createOscillator(), g = this.ctx.createGain();
        o.type = 'sawtooth'; o.frequency.setValueAtTime(80, t); o.frequency.exponentialRampToValueAtTime(1400, t + .9);
        g.gain.setValueAtTime(.001, t); g.gain.exponentialRampToValueAtTime(.22, t + .2); g.gain.exponentialRampToValueAtTime(.001, t + 1.2);
        o.connect(g); g.connect(this.sfxGain); o.start(t); o.stop(t + 1.3);
        [392,523,659,784,1047].forEach((f,i)=>beep(f,.4,'square',.1,.35+i*.09));
        break;
      }
      case 'encounter': [784,659,784,988].forEach((f,i)=>beep(f,.11,'square',.16,i*.1)); break;
      case 'badge': [523,659,784,1047,1319,1568].forEach((f,i)=>beep(f,.22,'square',.13,i*.11)); break;
      case 'soul': [220,330,440,660,880].forEach((f,i)=>beep(f,.3,'sine',.1,i*.06)); break;
      case 'open': beep(620,.05,'square',.09); beep(930,.07,'square',.08,.04); break;
      case 'buy': beep(880,.06,'square',.12); beep(1175,.09,'square',.1,.06); break;
      case 'nope': beep(200,.12,'square',.14); break;
    }
  }
};

/* ------------------------------------------------ tracks (original chiptunes) */
const MAJ = [0,2,4,5,7,9,11,12,14,16];
const MIN = [0,2,3,5,7,8,10,12,14,15];
const TRACKS = {
  title: {
    bpm: 96, root: 57, scale: MIN, leadWave: 'square', leadVol: .15, echo: true,
    lead: [7,7,null,4,7,9,7,null, 5,5,null,2,5,7,5,null, 4,4,null,2,4,5,7,null, 7,9,11,12,11,9,7,null],
    bass: [0,null,0,null,5,null,5,null,3,null,3,null,4,null,4,null],
    pad: [[0,3,7],[5,8,12],[3,7,10],[4,7,11]],
    drums: ['k',null,'h',null,'s',null,'h',null]
  },
  town: {
    bpm: 120, root: 60, scale: MAJ, leadVol: .16, echo: true,
    lead: [4,4,7,4,9,7,4,null, 5,5,7,5,9,7,5,null, 4,4,7,9,11,9,7,4, 2,4,5,7,4,null,null,null],
    bass: [0,null,0,5, 0,null,4,null, 5,null,5,9, 7,null,4,null],
    pad: [[0,4,7],[5,9,12],[7,11,14],[4,7,11]],
    drums: ['k',null,'h','s','k','k','h','s']
  },
  route: {
    bpm: 138, root: 62, scale: MAJ, leadVol: .15, echo: true,
    lead: [7,9,11,12,11,9,7,4, 5,7,9,11,9,7,5,2, 4,7,9,11,12,11,9,7, 5,4,2,4,7,null,null,null],
    bass: [0,0,5,5,3,3,4,4, 0,0,5,5,3,3,4,4],
    drums: ['k','h','s','h','k','h','s','h']
  },
  forest: {
    bpm: 108, root: 59, scale: MIN, leadVol: .14, echo: true,
    lead: [0,2,3,5,null,3,2,0, 7,5,3,2,null,5,3,null, 4,5,7,8,null,7,5,4, 3,2,0,null,null,null,null,null],
    bass: [0,null,0,null,5,null,5,null,3,null,3,null,4,null,4,null],
    pad: [[0,3,7],[5,8,12],[3,6,10],[2,5,9]],
    drums: [null,null,'h',null,null,null,'h',null]
  },
  cave: {
    bpm: 100, root: 50, scale: MIN, leadVol: .13, echo: true,
    lead: [0,3,5,3,0,null,7,null, 5,3,2,3,5,null,3,null, 0,3,7,10,7,5,3,2, 0,null,null,null,null,null,null,null],
    bass: [0,null,null,0,3,null,null,3,5,null,null,5,4,null,null,4],
    drums: [null,null,null,null,'k',null,null,null]
  },
  battle: {
    bpm: 156, root: 57, scale: MIN, leadVol: .16, echo: true,
    lead: [7,7,10,7,12,10,7,5, 3,3,5,7,10,7,5,3, 7,10,12,14,12,10,7,5, 3,5,7,10,7,5,3,null],
    bass: [0,0,3,3,5,5,7,7, 0,0,3,3,5,5,4,4],
    drums: ['k','h','s','h','k','h','s','h']
  },
  gym: {
    bpm: 150, root: 55, scale: MIN, leadVol: .16, echo: true,
    lead: [7,7,9,7,12,9,7,5, 7,9,12,14,12,9,7,4, 5,7,9,12,9,7,5,4, 2,4,5,7,9,11,12,null],
    bass: [0,0,0,0,5,5,5,5,3,3,3,3,7,7,7,7],
    drums: ['k','h','s','h','k','k','s','h']
  },
  paradox: {
    bpm: 126, root: 53, scale: MIN, leadVol: .15, echo: true,
    lead: [0,null,1,0,6,5,0,null, 3,3,4,3,7,6,3,null, 5,null,6,5,10,9,5,null, 7,6,5,4,3,2,1,null],
    bass: [0,null,0,null,6,null,6,null,3,null,3,null,7,null,7,null],
    pad: [[0,6,8],[3,9,10],[5,8,11],[7,10,13]],
    drums: ['k',null,'s',null,'k','k','s',null]
  },
  league: {
    bpm: 112, root: 60, scale: MIN, leadVol: .16, echo: true,
    lead: [7,7,9,12,11,9,7,5, 4,4,5,7,9,7,5,4, 2,4,5,7,9,11,12,14, 12,11,9,7,5,4,2,null],
    bass: [0,null,0,5,0,null,7,null,3,null,3,7,5,null,5,4],
    pad: [[0,3,7],[5,8,12],[3,7,10],[7,10,14]],
    drums: ['k','h','s','h','k','h','s','h']
  },
  legendary: {
    bpm: 104, root: 48, scale: MIN, leadVol: .17, echo: true,
    lead: [0,7,12,10,7,3,7,10, 12,14,15,14,12,10,7,3, 5,7,10,12,15,14,12,10, 7,5,3,2,0,null,null,null],
    bass: [0,null,null,0,5,null,null,5,3,null,null,3,7,null,null,7],
    pad: [[0,7,12],[5,10,15],[3,7,10],[7,11,14]],
    drums: ['k',null,'s',null,'k',null,'s','h']
  },
  victory: {
    bpm: 144, root: 65, scale: MAJ, leadVol: .17, echo: true,
    lead: [7,9,11,12,11,12,14,16, 12,11,9,7,9,11,12,null, 4,7,9,11,12,14,16,19, 16,14,12,11,9,7,4,null],
    bass: [0,0,5,5,3,3,4,4,0,0,5,5,7,7,0,0],
    drums: ['k','h','s','h','k','h','s','h']
  },
  sad: {
    bpm: 76, root: 60, scale: MIN, leadVol: .12, echo: true,
    lead: [7,null,3,5,3,null,2,0, 4,null,3,2,0,null,null,null, 7,null,10,8,7,null,5,3, 2,3,5,3,2,0,null,null],
    bass: [0,null,null,null,5,null,null,null,3,null,null,null,4,null,null,null],
    pad: [[0,3,7],[5,8,12],[3,7,10],[4,7,11]]
  },
  postgame: {
    bpm: 118, root: 57, scale: MIN, leadVol: .15, echo: true,
    lead: [12,null,10,12,15,14,12,10, 7,null,8,7,10,9,7,5, 3,5,7,8,10,12,14,15, 12,10,7,5,3,null,null,null],
    bass: [0,null,5,null,3,null,7,null,0,null,5,null,3,null,7,null],
    pad: [[0,7,12],[3,8,12],[5,9,12],[7,10,14]],
    drums: ['k','h','s','h','k','h','s','h']
  },
  eclipse: {
    bpm: 132, root: 49, scale: MIN, leadVol: .17, echo: true,
    lead: [12,11,10,8,7,5,3,2, 0,2,3,5,7,8,10,12, 15,14,12,10,8,7,5,3, 2,3,5,7,8,10,12,null],
    bass: [0,0,0,0,5,5,5,5,3,3,3,3,7,7,7,7],
    pad: [[0,6,12],[3,7,10],[5,8,11],[7,11,14]],
    drums: ['k','h','s','h','k','k','s','h']
  }
};

/* ------------------------------------------------ input */
const Input = {
  held: {}, pressHandlers: [],
  init() {
    const block = ['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' ','Enter','Escape'];
    window.addEventListener('keydown', (e) => {
      if (document.activeElement && document.activeElement.tagName === 'INPUT') return;
      if (block.includes(e.key)) e.preventDefault();
      const k = e.key.toLowerCase();
      if (!this.held[k]) {
        this.held[k] = true;
        this.pressHandlers.forEach(fn => fn(k, e));
      }
      if (e.key === 'Shift') this.held.shift = true;
    });
    window.addEventListener('keyup', (e) => {
      const k = e.key.toLowerCase();
      this.held[k] = false;
      if (e.key === 'Shift') this.held.shift = false;
    });
    window.addEventListener('blur', () => { this.held = {}; });
  },
  onPress(fn) { this.pressHandlers.push(fn); },
  down(...keys) { return keys.some(k => this.held[k]); },
  anyMove() { return this.down('arrowup','w') || this.down('arrowdown','s') || this.down('arrowleft','a') || this.down('arrowright','d'); }
};
Input.init();

/* ------------------------------------------------ misc fx */
function toast(msg, ms = 2600) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('show'), ms);
}
function flashScreen() {
  const f = $('#flash'); f.classList.remove('go'); void f.offsetWidth; f.classList.add('go');
}
function fadeOut(cb, ms = 300) {
  const f = $('#fade'); f.classList.add('on'); setTimeout(cb, ms);
}
function fadeIn(ms = 300) {
  const f = $('#fade'); f.classList.remove('on');
}
function saveMeta(meta) { try { localStorage.setItem('aurelia_meta_v1', JSON.stringify(meta)); } catch (e) {} }
function loadMeta() { try { return JSON.parse(localStorage.getItem('aurelia_meta_v1') || 'null'); } catch (e) { return null; } }

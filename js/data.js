/* ============================================================
   POKÉMON ECLIPSE: AURELIA GENESIS — game data
   ============================================================ */
'use strict';

/* ------------------------------------------------------------
   MOVES
   ------------------------------------------------------------ */
const MOVES = {};
function mv(id, name, type, cat, power, acc, pp, extra = {}) {
  MOVES[id] = Object.assign({ id, name, type, cat, power, acc, pp, prio: 0, crit: 0 }, extra);
}
// Normal
mv('tackle','Tackle','Normal','phys',40,100,35);
mv('scratch','Scratch','Normal','phys',40,100,35);
mv('quick_attack','Quick Attack','Normal','phys',40,100,30,{prio:1});
mv('body_slam','Body Slam','Normal','phys',85,100,15,{eff:{status:'para',chance:30}});
mv('hyper_beam','Hyper Beam','Normal','spec',120,90,5,{recharge:true});
mv('growl','Growl','Normal','status',0,100,40,{foe:{atk:-1}});
mv('tail_whip','Tail Whip','Normal','status',0,100,30,{foe:{def:-1}});
mv('leer','Leer','Normal','status',0,100,30,{foe:{def:-1}});
mv('swords_dance','Swords Dance','Normal','status',0,100,20,{self:{atk:2}});
mv('agility','Agility','Normal','status',0,100,30,{self:{spe:2}});
mv('recover','Recover','Normal','status',0,100,10,{heal:.5});
mv('roost','Roost','Flying','status',0,100,10,{heal:.5});
mv('protect','Protect','Normal','status',0,100,10,{protect:true});
// Fire
mv('ember','Ember','Fire','spec',40,100,25,{eff:{status:'burn',chance:10}});
mv('flame_wheel','Flame Wheel','Fire','phys',60,100,25,{eff:{status:'burn',chance:10}});
mv('fire_fang','Fire Fang','Fire','phys',65,95,15,{eff:{status:'burn',chance:10}});
mv('flamethrower','Flamethrower','Fire','spec',90,100,15,{eff:{status:'burn',chance:10}});
mv('heat_wave','Heat Wave','Fire','spec',95,90,10,{eff:{status:'burn',chance:10}});
mv('inferno','Inferno','Fire','spec',100,85,5,{eff:{status:'burn',chance:100}});
mv('overheat','Overheat','Fire','spec',130,90,5,{self:{spa:-2}});
mv('will_o_wisp','Will-O-Wisp','Fire','status',0,85,15,{eff:{status:'burn',chance:100}});
// Water
mv('water_gun','Water Gun','Water','spec',40,100,25);
mv('bubble_beam','Bubble Beam','Water','spec',65,100,20,{foe:{spe:-1}});
mv('aqua_jet','Aqua Jet','Water','phys',40,100,20,{prio:1});
mv('surf','Surf','Water','spec',90,100,15);
mv('scald','Scald','Water','spec',80,100,15,{eff:{status:'burn',chance:30}});
mv('waterfall','Waterfall','Water','phys',80,100,15);
mv('hydro_pump','Hydro Pump','Water','spec',110,80,5);
// Grass
mv('absorb','Absorb','Grass','spec',20,100,25,{drain:.5});
mv('mega_drain','Mega Drain','Grass','spec',40,100,15,{drain:.5});
mv('razor_leaf','Razor Leaf','Grass','phys',55,95,25,{crit:1});
mv('leaf_blade','Leaf Blade','Grass','phys',90,100,15,{crit:1});
mv('energy_ball','Energy Ball','Grass','spec',90,100,10,{eff:{stat:'spd',stages:-1,target:'foe',chance:10}});
mv('giga_drain','Giga Drain','Grass','spec',75,100,10,{drain:.5});
mv('sleep_powder','Sleep Powder','Grass','status',0,75,15,{eff:{status:'sleep',chance:100}});
// Electric
mv('thunder_shock','Thunder Shock','Electric','spec',40,100,30,{eff:{status:'para',chance:10}});
mv('spark','Spark','Electric','phys',65,100,20,{eff:{status:'para',chance:30}});
mv('thunderbolt','Thunderbolt','Electric','spec',90,100,15,{eff:{status:'para',chance:10}});
mv('thunder','Thunder','Electric','spec',110,70,10,{eff:{status:'para',chance:30}});
mv('thunder_wave','Thunder Wave','Electric','status',0,90,20,{eff:{status:'para',chance:100}});
mv('discharge','Discharge','Electric','spec',80,100,15,{eff:{status:'para',chance:30}});
// Ice
mv('ice_shard','Ice Shard','Ice','phys',40,100,30,{prio:1});
mv('icy_wind','Icy Wind','Ice','spec',55,95,15,{foe:{spe:-1}});
mv('ice_beam','Ice Beam','Ice','spec',90,100,10,{eff:{stat:'spe',stages:-1,target:'foe',chance:10}});
mv('blizzard','Blizzard','Ice','spec',110,70,5,{eff:{stat:'spe',stages:-1,target:'foe',chance:10}});
mv('frost_breath','Frost Breath','Ice','spec',60,90,10,{crit:1});
// Fighting
mv('karate_chop','Karate Chop','Fighting','phys',50,100,25,{crit:1});
mv('low_kick','Low Kick','Fighting','phys',60,100,20);
mv('drain_punch','Drain Punch','Fighting','phys',75,100,10,{drain:.5});
mv('close_combat','Close Combat','Fighting','phys',120,100,5,{self:{def:-1,spd:-1}});
mv('aura_sphere','Aura Sphere','Fighting','spec',80,100,20);
mv('bulk_up','Bulk Up','Fighting','status',0,100,20,{self:{atk:1,def:1}});
// Poison
mv('poison_sting','Poison Sting','Poison','phys',15,100,35,{eff:{status:'poison',chance:30}});
mv('sludge_bomb','Sludge Bomb','Poison','spec',90,100,10,{eff:{status:'poison',chance:30}});
mv('toxic','Toxic','Poison','status',0,90,10,{eff:{status:'poison',chance:100}});
mv('gunk_shot','Gunk Shot','Poison','phys',120,80,5,{eff:{status:'poison',chance:30}});
// Ground
mv('mud_slap','Mud-Slap','Ground','spec',20,100,10,{foe:{acc:-1}});
mv('bulldoze','Bulldoze','Ground','phys',60,100,20,{foe:{spe:-1}});
mv('earthquake','Earthquake','Ground','phys',100,100,10);
mv('earth_power','Earth Power','Ground','spec',90,100,10,{eff:{stat:'spd',stages:-1,target:'foe',chance:10}});
mv('scorching_sands','Scorching Sands','Ground','spec',70,100,10,{eff:{status:'burn',chance:30}});
// Flying
mv('gust','Gust','Flying','spec',40,100,35);
mv('wing_attack','Wing Attack','Flying','phys',60,100,35);
mv('aerial_ace','Aerial Ace','Flying','phys',60,100,20);
mv('air_slash','Air Slash','Flying','spec',75,95,15);
mv('brave_bird','Brave Bird','Flying','phys',120,100,15,{recoil:.33});
// Psychic
mv('confusion','Confusion','Psychic','spec',50,100,25);
mv('psybeam','Psybeam','Psychic','spec',65,100,20);
mv('psychic','Psychic','Psychic','spec',90,100,10,{eff:{stat:'spd',stages:-1,target:'foe',chance:10}});
mv('psyshock','Psyshock','Psychic','spec',80,100,10);
mv('calm_mind','Calm Mind','Psychic','status',0,100,20,{self:{spa:1,spd:1}});
// Bug
mv('bug_bite','Bug Bite','Bug','phys',60,100,20);
mv('x_scissor','X-Scissor','Bug','phys',80,100,15);
mv('bug_buzz','Bug Buzz','Bug','spec',90,100,10,{eff:{stat:'spd',stages:-1,target:'foe',chance:10}});
mv('quiver_dance','Quiver Dance','Bug','status',0,100,20,{self:{spa:1,spd:1,spe:1}});
// Rock
mv('rock_throw','Rock Throw','Rock','phys',50,90,15);
mv('ancient_power','Ancient Power','Rock','spec',60,100,5,{eff:{stat:'all',stages:1,target:'self',chance:10}});
mv('rock_slide','Rock Slide','Rock','phys',75,90,10);
mv('stone_edge','Stone Edge','Rock','phys',100,80,5,{crit:1});
// Ghost
mv('lick','Lick','Ghost','phys',30,100,30,{eff:{status:'para',chance:30}});
mv('shadow_sneak','Shadow Sneak','Ghost','phys',40,100,30,{prio:1});
mv('shadow_ball','Shadow Ball','Ghost','spec',80,100,15,{eff:{stat:'spd',stages:-1,target:'foe',chance:20}});
mv('phantom_force','Phantom Force','Ghost','phys',90,100,10);
mv('hex','Hex','Ghost','spec',65,100,10);
// Dragon
mv('dragon_breath','Dragon Breath','Dragon','spec',60,100,20,{eff:{status:'para',chance:30}});
mv('dragon_claw','Dragon Claw','Dragon','phys',80,100,15);
mv('dragon_pulse','Dragon Pulse','Dragon','spec',85,100,10);
mv('dragon_dance','Dragon Dance','Dragon','status',0,100,20,{self:{atk:1,spe:1}});
mv('outrage','Outrage','Dragon','phys',120,100,10);
mv('draco_meteor','Draco Meteor','Dragon','spec',130,90,5,{self:{spa:-2}});
// Dark
mv('bite','Bite','Dark','phys',60,100,25);
mv('crunch','Crunch','Dark','phys',80,100,15,{eff:{stat:'def',stages:-1,target:'foe',chance:20}});
mv('dark_pulse','Dark Pulse','Dark','spec',80,100,15);
mv('sucker_punch','Sucker Punch','Dark','phys',70,100,5,{prio:1});
mv('foul_play','Foul Play','Dark','phys',95,100,15);
mv('nasty_plot','Nasty Plot','Dark','status',0,100,20,{self:{spa:2}});
// Steel
mv('metal_claw','Metal Claw','Steel','phys',50,95,35,{eff:{stat:'atk',stages:1,target:'self',chance:10}});
mv('iron_head','Iron Head','Steel','phys',80,100,15);
mv('flash_cannon','Flash Cannon','Steel','spec',80,100,10,{eff:{stat:'spd',stages:-1,target:'foe',chance:10}});
mv('iron_defense','Iron Defense','Steel','status',0,100,15,{self:{def:2}});
mv('meteor_mash','Meteor Mash','Steel','phys',90,90,10,{eff:{stat:'atk',stages:1,target:'self',chance:20}});
// Fairy
mv('fairy_wind','Fairy Wind','Fairy','spec',40,100,30);
mv('draining_kiss','Draining Kiss','Fairy','spec',50,100,10,{drain:.75});
mv('dazzling_gleam','Dazzling Gleam','Fairy','spec',80,100,10);
mv('moonblast','Moonblast','Fairy','spec',95,100,10,{eff:{stat:'spa',stages:-1,target:'foe',chance:30}});
mv('play_rough','Play Rough','Fairy','phys',90,90,10,{eff:{stat:'atk',stages:-1,target:'foe',chance:10}});
mv('baby_doll_eyes','Baby-Doll Eyes','Fairy','status',0,100,30,{prio:1,foe:{atk:-1}});
// signatures & awakened
mv('cipher_lance','Cipher Lance','Water','spec',85,100,10,{crit:1});
mv('caldera_slam','Caldera Slam','Fire','phys',95,100,10,{eff:{status:'burn',chance:30}});
mv('thorn_blade','Thorn Blade','Grass','phys',90,100,10,{crit:1});
mv('volt_relic','Volt Relic','Electric','phys',110,95,5,{eff:{status:'para',chance:30}});
mv('dawn_pyre','Dawn Pyre','Fire','spec',110,95,5,{eff:{status:'burn',chance:30}});
mv('frost_crown','Frost Crown','Ice','spec',100,95,5,{eff:{stat:'spd',stages:-1,target:'foe',chance:30}});
mv('lumen_storm','Lumen Storm','Electric','spec',105,95,5,{eff:{status:'para',chance:30}});
mv('aura_lance','Aura Lance','Fighting','spec',90,100,10,{crit:1});
mv('moonlit_grace','Moonlit Grace','Fairy','spec',95,100,10,{heal:.25});
mv('dune_fang','Dune Fang','Ground','phys',95,100,10,{crit:1});
mv('skyfall_dive','Skyfall Dive','Flying','phys',110,95,5,{recoil:.2});
mv('solar_flare','Solar Flare','Fire','spec',110,95,5,{eff:{status:'burn',chance:30}});
mv('ruin_slash','Ruin Slash','Dark','phys',95,100,10,{crit:1});
mv('shadow_ambush','Shadow Ambush','Ghost','phys',90,100,10,{prio:1});
mv('spectral_edge','Spectral Edge','Ghost','phys',100,95,5,{crit:1});
mv('nightfall_trick','Nightfall Trick','Dark','spec',95,100,10,{foe:{spa:-1}});
mv('frostbell','Frostbell','Ice','spec',90,100,10,{eff:{status:'freeze',chance:10}});
// awakened
mv('final_cipher','Final Cipher','Water','spec',120,100,5,{crit:1,desc:'The awakened agent fires a shot that pierces fate.'});
mv('eruption_fist','Eruption Fist','Fire','phys',125,100,5,{eff:{status:'burn',chance:40}});
mv('worldroot_cleave','Worldroot Cleave','Grass','phys',125,100,5,{crit:1});
mv('genesis_bolt','Genesis Bolt','Electric','spec',140,95,5,{eff:{status:'para',chance:30}});
mv('genesis_ember','Genesis Ember','Fire','spec',140,95,5,{eff:{status:'burn',chance:30}});
mv('hollow_frost','Hollow Frost','Ice','spec',135,95,5,{eff:{stat:'spd',stages:-1,target:'foe',chance:40}});
mv('aurora_thunder','Aurora Thunder','Electric','spec',130,95,5,{eff:{status:'para',chance:40}});
mv('aura_nova','Aura Nova','Fighting','spec',125,100,5,{crit:1});
mv('astral_lullaby','Astral Lullaby','Fairy','spec',125,100,5,{eff:{status:'sleep',chance:20}});
mv('continental_rend','Continental Rend','Ground','phys',130,95,5,{crit:1});
mv('genesis_press','Genesis Press','Steel','phys',130,95,5,{eff:{stat:'def',stages:-1,target:'foe',chance:30}});
mv('aurelian_skybreak','Aurelian Skybreak','Flying','phys',135,95,5,{recoil:.15});
mv('sunforge_halo','Sunforge Halo','Fire','spec',135,95,5,{eff:{status:'burn',chance:40}});
mv('omen_edge','Omen Edge','Dark','phys',125,100,5,{crit:1});
mv('eclipse_veil','Eclipse Veil','Ghost','phys',125,100,5,{eff:{stat:'atk',stages:-1,target:'foe',chance:40}});
mv('crown_of_ages','Crown of Ages','Ghost','phys',130,95,5,{crit:1});
mv('mirror_eclipse','Mirror Eclipse','Dark','spec',125,100,5,{eff:{stat:'spa',stages:-1,target:'foe',chance:30}});
mv('hollow_winter','Hollow Winter','Ice','spec',125,95,5,{eff:{status:'freeze',chance:20}});
mv('eclipse_wave','Eclipse Wave','Dragon','spec',120,100,5,{desc:'A shockwave of stolen light from the Eclipse Device.'});
mv('true_dawn','True Dawn','Fairy','spec',120,100,5,{desc:'Sacred light that remembers every life.'});

/* ------------------------------------------------------------
   ABILITIES
   ------------------------------------------------------------ */
const ABILITIES = {
  overgrow:      { name:'Overgrow', desc:'Powers up Grass moves when HP is low.', pinch:'Grass' },
  blaze:         { name:'Blaze', desc:'Powers up Fire moves when HP is low.', pinch:'Fire' },
  torrent:       { name:'Torrent', desc:'Powers up Water moves when HP is low.', pinch:'Water' },
  phantom_precision:{ name:'Phantom Precision', desc:'Raises critical-hit ratio. Signature ability of Aurelian Sobble.', crit:1 },
  magma_heart:   { name:'Magma Heart', desc:'Contact may burn the attacker.', contact:{status:'burn',chance:30} },
  verdant_vigor: { name:'Verdant Vigor', desc:'Restores a little HP every turn.', healTurn:.0625 },
  storm_engine:  { name:'Storm Engine', desc:'Powers up Electric moves. Legends say it hums with forgotten current.', boost:{type:'Electric',mult:1.3} },
  sunforged:     { name:'Sunforged', desc:'Powers up Fire moves and restores HP in sunlight.', boost:{type:'Fire',mult:1.3}, healTurn:.0625 },
  hollow_crown:  { name:'Hollow Crown', desc:'Powers up Ice moves and shrugs off the cold.', boost:{type:'Ice',mult:1.3}, statusImmune:['freeze'] },
  static:        { name:'Static', desc:'Contact may paralyze the attacker.', contact:{status:'para',chance:30} },
  intimidate:    { name:'Intimidate', desc:'Lowers the foe’s Attack on entry.', onEntry:'lowerAtk' },
  levitate:      { name:'Levitate', desc:'Immune to Ground-type moves.', immune:['Ground'] },
  water_bubble:  { name:'Water Bubble', desc:'Powers up Water moves and halves Fire damage.', boost:{type:'Water',mult:1.3}, resist:{Fire:.5} },
  gale_wings:    { name:'Gale Wings', desc:'Flying moves gain priority at full HP.', galeWings:true },
  rough_skin:    { name:'Rough Skin', desc:'Contact damages the attacker.', contactRecoil:.125 },
  fairy_aura:    { name:'Fairy Aura', desc:'Powers up Fairy moves.', boost:{type:'Fairy',mult:1.33} },
  disguise:      { name:'Disguise', desc:'The first hit is absorbed by its disguise.', disguise:true },
  justified:     { name:'Justified', desc:'Dark hits raise Attack.', onHitBy:{type:'Dark',stat:'atk',stages:1} },
  super_luck:    { name:'Super Luck', desc:'Raises critical-hit ratio.', crit:1 },
  flame_body:    { name:'Flame Body', desc:'Contact may burn the attacker.', contact:{status:'burn',chance:30} },
  phantom_guard: { name:'Phantom Guard', desc:'Powers up Ghost moves.', boost:{type:'Ghost',mult:1.3} },
  clear_body:    { name:'Clear Body', desc:'Prevents stat reduction.', clearBody:true },
  moxie:         { name:'Moxie', desc:'Attack rises after knocking out a foe.', moxie:true },
  dark_aura:     { name:'Dark Aura', desc:'Powers up Dark moves.', boost:{type:'Dark',mult:1.33} },
  rocky_payload: { name:'Rocky Payload', desc:'Powers up Rock moves.', boost:{type:'Rock',mult:1.3} },
  multiscale:    { name:'Multiscale', desc:'Halves damage at full HP.', multiscale:true },
  poison_touch:  { name:'Poison Touch', desc:'Contact may poison the attacker.', contact:{status:'poison',chance:30} },
  water_absorb:  { name:'Water Absorb', desc:'Water moves heal instead of harm.', absorb:'Water' },
  ice_body:      { name:'Ice Body', desc:'Restores a little HP every turn.', healTurn:.0625 },
  shield_dust:   { name:'Shield Dust', desc:'Blocks added effects of attacks.', shieldDust:true },
  flash_fire:    { name:'Flash Fire', desc:'Fire moves heal instead of harm.', absorb:'Fire' },
  limber:        { name:'Limber', desc:'Cannot be paralyzed.', statusImmune:['para'] },
  serene_grace:  { name:'Serene Grace', desc:'Doubles the chance of added effects.', serene:true },
  sturdy:        { name:'Sturdy', desc:'Survives a hit that would KO from full HP.', sturdy:true },
  primordial:    { name:'Primordial Pulse', desc:'Ancient power resonates: all moves are stronger.', boost:{type:'all',mult:1.15} },
  eclipse_soul:  { name:'Eclipse Soul', desc:'The divided light of Aurelia burns within.', boost:{type:'all',mult:1.2}, healTurn:.0625 },
  soul_awakened: { name:'Soul Awakened', desc:'Hidden potential unleashed.', boost:{type:'all',mult:1.15} },
  phantom_agent: { name:'Phantom Agent', desc:'Awakened precision. Critical hits land far more often.', crit:2, boost:{type:'Water',mult:1.2} },
  volcanic_titan:{ name:'Volcanic Titan', desc:'Awakened fury. Contact burns and Fire moves surge.', boost:{type:'Fire',mult:1.3}, contact:{status:'burn',chance:30} },
  sylvan_warden: { name:'Sylvan Warden', desc:'Awakened roots restore HP each turn.', healTurn:.09, boost:{type:'Grass',mult:1.25} },
  truth_engine:  { name:'Truth Engine', desc:'Awakened current powers up Electric and Steel moves.', boost:{type:'all',mult:1.15}, crit:1 },
  ideal_sun:     { name:'Ideal Sun', desc:'Awakened sunlight powers Fire and Fairy moves.', boost:{type:'all',mult:1.15}, healTurn:.08 },
  hollow_genesis:{ name:'Hollow Genesis', desc:'Awakened emptiness. Ice moves tear through resistances.', boost:{type:'Ice',mult:1.5}, crit:1 },
  aura_master:   { name:'Aura Master', desc:'Awakened aura empowers Fighting moves.', boost:{type:'Fighting',mult:1.4}, crit:1 },
  astral_grace:  { name:'Astral Grace', desc:'Awakened starlight empowers Fairy moves.', boost:{type:'Fairy',mult:1.4} },
  apex_predator: { name:'Apex Predator', desc:'Awakened instinct. Attack and Speed soar.', boost:{type:'Ground',mult:1.3}, crit:1 },
  genesis_core:  { name:'Genesis Core', desc:'Awakened computation empowers Steel moves.', boost:{type:'Steel',mult:1.4} },
  sky_sovereign: { name:'Sky Sovereign', desc:'Awakened wings empower Flying moves.', boost:{type:'Flying',mult:1.4} },
  solar_deity:   { name:'Solar Deity', desc:'Awakened sunfire empowers Fire moves.', boost:{type:'Fire',mult:1.45}, healTurn:.06 },
  omen_master:   { name:'Omen Master', desc:'Awakened doom. Critical hits are guaranteed more often.', crit:2 },
  veil_queen:    { name:'Veil Queen', desc:'Awakened shadow empowers Ghost moves.', boost:{type:'Ghost',mult:1.4} },
  king_eternal:  { name:'King Eternal', desc:'Awakened regalia empowers Ghost and Steel moves.', boost:{type:'all',mult:1.2}, crit:1 },
  mirror_soul:   { name:'Mirror Soul', desc:'Awakened illusions empower Dark moves.', boost:{type:'Dark',mult:1.4} },
  winter_crown:  { name:'Winter Crown', desc:'Awakened frost empowers Ice moves.', boost:{type:'Ice',mult:1.4} },
};

/* ------------------------------------------------------------
   SPECIES (existing Pokémon only — Aurelian forms are original)
   ------------------------------------------------------------ */
const SPECIES = {};
function sp(id, name, form, types, base, ability, moves, opts = {}) {
  SPECIES[id] = Object.assign({
    id, name, form: form || '', types, base, ability, moves,
    shape: 'quad', cols: ['#7a8a6a','#4a5a3a','#c8d8b8','#f5c542','#ffffff'],
    features: [], scale: 1, catchRate: 45, xpYield: 70,
    lore: 'A Pokémon native to the Aurelia Region.'
  }, opts);
  SPECIES[id].id = id;
}
const A = 'Aurelian';

/* ---- STARTERS: SOBBLE LINE (Water / Ghost) ---- */
sp('sobble_a','Sobble',A,['Water','Ghost'],[50,40,45,70,45,70],'phantom_precision',
  ['pound','water_gun','astonish','growl'],
  { evolve:['drizzile_a',16], shape:'lizard', cols:['#1c5e6d','#0b313c','#75dfd8','#9b7bff','#e9ffff'],
    features:['fin','tail','mask'], catchRate:45, xpYield:62,
    lore:'An Aurelian Sobble that slips through shadows like a secret. Its tears can bend light, hiding it from sight.' });
sp('drizzile_a','Drizzile',A,['Water','Ghost'],[65,55,55,95,60,90],'phantom_precision',
  ['water_gun','shadow_sneak','cipher_lance','nasty_plot'],
  { evolve:['inteleon_a',32], shape:'lizard', cols:['#174f63','#082733','#6fd8d4','#9b7bff','#e9ffff'],
    features:['fin','cloak','tail'], catchRate:45, xpYield:142,
    lore:'It keeps a ledger of every secret whispered near water. No one has ever caught it reading.' });
sp('inteleon_a','Inteleon',A,['Water','Ghost'],[72,82,65,125,70,122],'phantom_precision',
  ['cipher_lance','shadow_ball','ice_beam','nasty_plot'],
  { shape:'lizard', cols:['#123f55','#061c28','#67d7d8','#a78bfa','#f4ffff'],
    features:['fin','cloak','visor','tail'], catchRate:45, xpYield:265,
    lore:'The "Phantom of the Tide". Its fingertip rifle fires compressed droplets of ghost-light, and its cloak is woven from mist.' });

/* ---- STARTERS: LITTEN LINE (Fire / Ground) ---- */
sp('litten_a','Litten',A,['Fire','Ground'],[45,65,45,55,45,70],'blaze',
  ['scratch','ember','growl','bite'],
  { evolve:['torracat_a',17], shape:'quad', cols:['#2b1b18','#150c0a','#ff7a3d','#ffd166','#fff1d0'],
    features:['tailflame','ears','claws'], catchRate:45, xpYield:64,
    lore:'Aurelian Litten’s fur is laced with volcanic glass. It kneads the ground before sleeping, leaving rings of warm ash.' });
sp('torracat_a','Torracat',A,['Fire','Ground'],[65,85,55,75,55,90],'blaze',
  ['fire_fang','bite','flame_wheel','leer'],
  { evolve:['incineroar_a',34], shape:'quad', cols:['#331d17','#170b08','#ff8a4d','#ffd166','#ffe9c4'],
    features:['tailflame','ears','claws','magma'], catchRate:45, xpYield:154,
    lore:'Its bell can ring with the sound of a distant caldera. The hotter its heart burns, the brighter the bell glows.' });
sp('incineroar_a','Incineroar',A,['Fire','Ground'],[95,118,90,75,90,60],'magma_heart',
  ['caldera_slam','crunch','earthquake','bulk_up'],
  { shape:'biped', cols:['#351a13','#180a07','#ff6b2c','#ffc857','#fff0c9'],
    features:['tailflame','ears','claws','magma','belt'], catchRate:45, xpYield:272,
    lore:'The "Caldera King". It wrestles lava flows for sport and wears a belt of cooled obsidian as a trophy.' });

/* ---- STARTERS: TREECKO LINE (Grass / Fighting) ---- */
sp('treecko_a','Treecko',A,['Grass','Fighting'],[40,50,35,60,50,70],'verdant_vigor',
  ['tackle','absorb','leer','quick_attack'],
  { evolve:['grovyle_a',17], shape:'lizard', cols:['#3f7d3a','#1e4720','#a8e063','#f5c542','#f4ffe0'],
    features:['leaf','tail'], catchRate:45, xpYield:62,
    lore:'Aurelian Treecko trains beneath the oldest trees. The leaf on its tail records every promise it has kept.' });
sp('grovyle_a','Grovyle',A,['Grass','Fighting'],[55,70,45,80,60,95],'verdant_vigor',
  ['razor_leaf','low_kick','quick_attack','swords_dance'],
  { evolve:['sceptile_a',34], shape:'lizard', cols:['#356d33','#163a1a','#9ee05a','#f5c542','#f4ffe0'],
    features:['leaf','blades','tail'], catchRate:45, xpYield:151,
    lore:'It leaps between branches without a sound. Its blade-leaves are sharpened against ancient stone.' });
sp('sceptile_a','Sceptile',A,['Grass','Fighting'],[75,90,65,100,80,120],'verdant_vigor',
  ['thorn_blade','close_combat','leaf_blade','swords_dance'],
  { shape:'lizard', cols:['#2c5f2d','#103018','#8ee05a','#ffd166','#f4ffe0'],
    features:['leaf','blades','crest','tail'], catchRate:45, xpYield:284,
    lore:'The "Warden of the Wild". It guards Aurelia’s oldest groves and duels only those it deems worthy.' });

/* ---- LEGENDARY AURELIAN FORMS ---- */
sp('zekrom_a','Zekrom',A,['Electric','Steel'],[100,150,120,120,100,92],'storm_engine',
  ['volt_relic','dragon_claw','iron_head','thunder_wave'],
  { shape:'dragon', cols:['#202844','#0a0d1c','#3f5a8c','#4dd8ff','#f5c542'],
    features:['horns','wings','core','armor','tail'], catchRate:12, xpYield:340,
    lore:'The Storm Relic. Aurelian Zekrom slumbers beneath Stormwatch in a shell of black iron, dreaming of a storm that never ended. It embodies ideal truth: the world as it ought to be.' });
sp('reshiram_a','Reshiram',A,['Fire','Fairy'],[100,120,100,150,120,92],'sunforged',
  ['dawn_pyre','dragon_pulse','moonblast','will_o_wisp'],
  { shape:'dragon', cols:['#efe4cc','#b79a63','#fff8e6','#ff7a5c','#ffd166'],
    features:['wings','horns','core','halo','tail'], catchRate:12, xpYield:340,
    lore:'The Sun Relic. Aurelian Reshiram slept within Sunspire, its flame keeping the first sunrise alive. It embodies ideals: the world as it could be.' });
sp('kyurem_a','Kyurem',A,['Ice','Ghost'],[125,130,90,130,95,95],'hollow_crown',
  ['frost_crown','shadow_ball','dragon_pulse','blizzard'],
  { shape:'dragon', cols:['#b8d8e8','#5c7f99','#eefbff','#8b6fc4','#2a3c58'],
    features:['horns','wings','core','crown','tail'], catchRate:10, xpYield:350,
    lore:'The Hollow King. When Zekrom and Reshiram’s light was split, what remained became Kyurem: an absence shaped like a throne.' });

/* ---- WILD REGIONAL FORMS ---- */
sp('pidgey_a','Pidgey',A,['Flying','Psychic'],[40,45,40,50,40,56],'keen_eye_missing',
  ['gust','confusion','quick_attack','sand_attack_missing'],
  { evolve:['pidgeotto_a',18], shape:'bird', cols:['#b89b6a','#7a6440','#f0d9a8','#9b7bff','#fff6dd'],
    features:['wings','crest','tail'], catchRate:255, xpYield:50,
    lore:'Its third eye sees a heartbeat before it happens. Aurelian Pidgey are said to guide lost travellers home.' });
sp('pidgeotto_a','Pidgeotto',A,['Flying','Psychic'],[63,60,55,70,50,71],'keen_eye_missing',
  ['gust','psybeam','aerial_ace','calm_mind'],
  { evolve:['pidgeot_a',36], shape:'bird', cols:['#a8895c','#6a5536','#ecd29e','#9b7bff','#fff6dd'],
    features:['wings','crest','tail','mask'], catchRate:120, xpYield:122,
    lore:'It patrols the cliffs of Aurelia, tracing circles in the air that predict the next day’s weather.' });
sp('pidgeot_a','Pidgeot',A,['Flying','Psychic'],[83,80,75,105,70,101],'serene_grace',
  ['air_slash','psychic','aerial_ace','calm_mind'],
  { shape:'bird', cols:['#9a7b4f','#5c4a2e','#e8cf98','#a78bfa','#fff6dd'],
    features:['wings','crest','tail','mask'], catchRate:45, xpYield:240,
    lore:'The "Oracle of the Cliffs". It flies so high it can see both the sunrise and the moon at once.' });

sp('mareep_a','Mareep',A,['Electric','Fairy'],[55,40,40,65,45,35],'static',
  ['thunder_shock','fairy_wind','growl','thunder_wave'],
  { evolve:['flaaffy_a',15], shape:'quad', cols:['#f6e6a8','#c9a94e','#fffbe0','#7ee7ff','#ff9ec4'],
    features:['wool','tail','ears'], catchRate:235, xpYield:56,
    lore:'Its fleece stores moonlight instead of static. At night, Aurelian Mareep fields glow like fallen constellations.' });
sp('flaaffy_a','Flaaffy',A,['Electric','Fairy'],[70,55,55,80,60,45],'static',
  ['spark','dazzling_gleam','thunder_wave','growl'],
  { evolve:['ampharos_a',30], shape:'biped', cols:['#f3df9a','#c2a044','#fff8d0','#7ee7ff','#ff9ec4'],
    features:['wool','tail','ears','horn'], catchRate:120, xpYield:128,
    lore:'Its wool sheds tiny sparks of aurora. Shepherds weave the fibres into lanterns that never go out.' });
sp('ampharos_a','Ampharos',A,['Electric','Fairy'],[90,75,85,115,90,55],'static',
  ['lumen_storm','dazzling_gleam','thunderbolt','thunder_wave'],
  { shape:'biped', cols:['#f0d888','#b89434','#fff8d0','#7ee7ff','#ff9ec4'],
    features:['wool','tail','ears','horn','core'], catchRate:45, xpYield:255,
    lore:'The "Lighthouse of the Vale". Its tail-lamp can be seen from three towns away, and its light calms restless ghosts.' });

sp('rockruff_a','Rockruff',A,['Rock','Fighting'],[45,65,40,30,40,60],'sturdy',
  ['rock_throw','karate_chop','leer','quick_attack'],
  { evolve:['lycanroc_a',25], shape:'quad', cols:['#8a6a4f','#513a2a','#d8b48a','#ffb347','#fff1d6'],
    features:['ears','claws','tail'], catchRate:190, xpYield:56,
    lore:'It trains by headbutting desert stones. The chips it collects are arranged into tiny shrines.' });
sp('lycanroc_a','Lycanroc',A,['Rock','Fighting'],[75,115,65,55,65,112],'justified',
  ['stone_edge','close_combat','crunch','rock_slide'],
  { shape:'quad', cols:['#7a5940','#432f22','#d0a878','#ffb347','#fff1d6'],
    features:['ears','claws','tail','mane','spikes'], catchRate:75, xpYield:230,
    lore:'The "Dune Duelist". It fights only at dawn, and the scars on its forelegs map every duel it has won.' });

sp('sandile_a','Sandile',A,['Ground','Rock'],[50,72,35,35,35,65],'intimidate',
  ['mud_slap','bite','leer','rock_throw'],
  { evolve:['krokorok_a',22], shape:'quad', cols:['#d6a05c','#96652e','#f8dca8','#3a2a1a','#fff3d6'],
    features:['snout','tail','spikes'], catchRate:180, xpYield:58,
    lore:'Aurelian Sandile’s scales are fused from desert glass. It sunbathes with its mouth open to charge its bite.' });
sp('krokorok_a','Krokorok',A,['Ground','Rock'],[60,82,45,45,45,74],'intimidate',
  ['bulldoze','crunch','rock_slide','scorching_sands'],
  { evolve:['krookodile_a',38], shape:'biped', cols:['#c28f4f','#845426','#f0d09a','#3a2a1a','#fff3d6'],
    features:['snout','tail','spikes','glasses'], catchRate:90, xpYield:140,
    lore:'It wears shards of ruined glass over its eyes. The desert nomads consider it a sign of a coming sandstorm.' });
sp('krookodile_a','Krookodile',A,['Ground','Rock'],[95,117,80,65,70,92],'intimidate',
  ['earthquake','crunch','stone_edge','scorching_sands'],
  { shape:'biped', cols:['#b07c3e','#6e4319','#e8c88e','#3a2a1a','#fff3d6'],
    features:['snout','tail','spikes','glasses'], catchRate:45, xpYield:268,
    lore:'The "Glass Tyrant of Duneveil". Its hide turns blades of sunlight into armour, and its roar can crack sandstone.' });

sp('fletchling_a','Fletchling',A,['Fire','Flying'],[45,50,40,40,38,62],'flame_body',
  ['ember','gust','quick_attack','growl'],
  { evolve:['fletchinder_a',17], shape:'bird', cols:['#d9683a','#8a2e16','#ffd08a','#ffb347','#fff2d0'],
    features:['wings','tail','crest'], catchRate:255, xpYield:52,
    lore:'Its feathers shed harmless sparks when it is happy. Aurelian children chase them through the ash fields.' });
sp('fletchinder_a','Fletchinder',A,['Fire','Flying'],[62,73,55,56,52,84],'flame_body',
  ['flame_wheel','wing_attack','quick_attack','will_o_wisp'],
  { evolve:['talonflame_a',35], shape:'bird', cols:['#c9542c','#782612','#ffc47a','#ffb347','#fff2d0'],
    features:['wings','tail','crest','mask'], catchRate:120, xpYield:134,
    lore:'It hunts over cooling lava, snatching embers from the air and weaving them into its nest.' });
sp('talonflame_a','Talonflame',A,['Fire','Flying'],[78,81,71,74,69,126],'gale_wings',
  ['brave_bird','flamethrower','will_o_wisp','roost'],
  { shape:'bird', cols:['#b8431f','#641e0c','#ffb866','#ffd166','#fff2d0'],
    features:['wings','tail','crest','mask'], catchRate:45, xpYield:246,
    lore:'The "Ember Hawk". It dives at prey faster than a falling star, leaving a trail of blue fire.' });

sp('dewpider_a','Dewpider',A,['Bug','Water'],[38,40,52,40,72,27],'water_bubble',
  ['bug_bite','water_gun','bubble_beam','leer'],
  { evolve:['araquanid_a',22], shape:'bug', cols:['#4a9e9a','#1f5e5e','#a8f0e8','#8de0ff','#e8ffff'],
    features:['bubble','legs','eyes'], catchRate:200, xpYield:54,
    lore:'It carries a single drop of ancient water above its head. The drop never evaporates and never ripples.' });
sp('araquanid_a','Araquanid',A,['Bug','Water'],[68,70,92,50,132,42],'water_bubble',
  ['waterfall','x_scissor','bubble_beam','toxic'],
  { shape:'bug', cols:['#398985','#154848','#96e8e0','#8de0ff','#e8ffff'],
    features:['bubble','legs','eyes','spikes'], catchRate:75, xpYield:210,
    lore:'Its bubble is a reliquary. Inside is the memory of the sea that once covered all of Aurelia.' });

sp('noibat_a','Noibat',A,['Flying','Dragon'],[40,30,35,45,40,55],'infiltrator_missing',
  ['gust','dragon_breath','tackle','supersonic_missing'],
  { evolve:['noivern_a',28], shape:'bird', cols:['#6b5a9e','#382b63','#c8b8f0','#7ee7ff','#fff0ff'],
    features:['wings','ears','tail'], catchRate:190, xpYield:49,
    lore:'Aurelian Noibat nests in broken bells. Its cry replays fragments of the last song sung in the ruins.' });
sp('noivern_a','Noivern',A,['Flying','Dragon'],[85,70,80,97,80,123],'infiltrator_missing',
  ['air_slash','dragon_pulse','boomburst_missing','roost'],
  { shape:'bird', cols:['#5b4a8e','#2a2050','#bcaee8','#7ee7ff','#fff0ff'],
    features:['wings','ears','tail','mask'], catchRate:45, xpYield:245,
    lore:'The "Echo of the Spire". Its wings beat in the exact rhythm of the ancient reliquary bells.' });

sp('gible_a','Gible',A,['Dragon','Ground'],[58,70,45,40,45,42],'rough_skin',
  ['dragon_breath','mud_slap','bite','tackle'],
  { evolve:['gabite_a',24], shape:'lizard', cols:['#5a7a8a','#2c4652','#a8d0d8','#ffd166','#f0ffff'],
    features:['fin','tail','snout'], catchRate:45, xpYield:60,
    lore:'It burrows through sandstone using its dorsal fin as a plough. Its scales are prized by Duneveil jewellers.' });
sp('gabite_a','Gabite',A,['Dragon','Ground'],[68,90,65,50,55,82],'rough_skin',
  ['dragon_claw','earthquake','crunch','dragon_dance'],
  { evolve:['garchomp_a',48], shape:'lizard', cols:['#4a6a7a','#203844','#98c8d0','#ffd166','#f0ffff'],
    features:['fin','tail','snout','blades'], catchRate:45, xpYield:144,
    lore:'It hoards blue glass in its burrow. The arrangement of the shards is said to predict eclipses.' });
sp('garchomp_a','Garchomp',A,['Dragon','Ground'],[108,130,95,80,85,102],'rough_skin',
  ['dune_fang','earthquake','dragon_claw','stone_edge'],
  { shape:'dragon', cols:['#3f5f70','#17303c','#8ec0cc','#ffd166','#f0ffff'],
    features:['fin','tail','snout','blades','wings'], catchRate:45, xpYield:300,
    lore:'The "Glasswyrm". It swims through sand as if it were water, and its wake leaves dunes perfectly smooth.' });

sp('ralts_a','Ralts',A,['Psychic','Fairy'],[28,25,25,45,35,40],'serene_grace',
  ['confusion','fairy_wind','growl','calm_mind'],
  { evolve:['kirlia_a',20], shape:'blob', cols:['#e8f0f8','#a8bfd0','#ffffff','#ff9ec4','#ff5a7a'],
    features:['horn','dress','eyes'], catchRate:235, xpYield:40,
    lore:'Aurelian Ralts gathers around sleeping travellers, feeding on kind dreams and leaving tiny flowers behind.' });
sp('kirlia_a','Kirlia',A,['Psychic','Fairy'],[38,35,35,65,55,50],'serene_grace',
  ['psybeam','draining_kiss','calm_mind','baby_doll_eyes'],
  { evolve:['gardevoir_a',30], shape:'biped', cols:['#e0ecf4','#98b4c8','#ffffff','#ff9ec4','#ff5a7a'],
    features:['horn','dress','eyes'], catchRate:120, xpYield:97,
    lore:'It dances on the moonlit terraces of Twilight Grove. Each step leaves a ring of tiny white blooms.' });
sp('gardevoir_a','Gardevoir',A,['Psychic','Fairy'],[68,65,65,125,115,80],'fairy_aura',
  ['moonlit_grace','psychic','moonblast','calm_mind'],
  { shape:'biped', cols:['#d8e8f0','#8aa8c0','#ffffff','#ff9ec4','#ff5a7a'],
    features:['horn','dress','eyes','wings'], catchRate:45, xpYield:270,
    lore:'The "Oracle of Twilight". It can see a person’s true wish, and will quietly rearrange the world to grant it.' });

sp('gastly_a','Gastly',A,['Ghost','Poison'],[30,35,30,100,35,80],'levitate',
  ['lick','poison_sting','confusion','will_o_wisp'],
  { evolve:['haunter_a',25], shape:'ghost', cols:['#5a3a7a','#2a1a3a','#a888c8','#8de0ff','#e8d8ff'],
    features:['gas','eyes','mouth'], catchRate:190, xpYield:62,
    lore:'It haunts the inkwells of Ancient Ruins, drinking the shadows between written words.' });
sp('haunter_a','Haunter',A,['Ghost','Poison'],[45,50,45,115,55,95],'levitate',
  ['shadow_sneak','sludge_bomb','hex','toxic'],
  { evolve:['gengar_a',40], shape:'ghost', cols:['#4a2a6a','#20102e','#9878b8','#8de0ff','#e8d8ff'],
    features:['gas','eyes','mouth','hands'], catchRate:90, xpYield:142,
    lore:'Its hands are cold enough to freeze candle smoke. It collects the last words of forgotten kings.' });
sp('gengar_a','Gengar',A,['Ghost','Poison'],[60,65,60,130,75,110],'phantom_guard',
  ['shadow_ball','sludge_bomb','hex','nasty_plot'],
  { shape:'ghost', cols:['#3a1a5a','#160822','#8868a8','#8de0ff','#e8d8ff'],
    features:['gas','eyes','mouth','hands','spikes'], catchRate:45, xpYield:250,
    lore:'The "Laughing Eclipse". It steals the shadow of anyone who reads the ruins’ forbidden tablet.' });

sp('swablu_a','Swablu',A,['Fairy','Flying'],[45,40,60,50,75,50],'serene_grace',
  ['fairy_wind','gust','draining_kiss','roost'],
  { evolve:['altaria_a',30], shape:'bird', cols:['#e8f0f8','#b8c8dc','#ffffff','#ffd166','#ff9ec4'],
    features:['wings','fluff','tail'], catchRate:255, xpYield:56,
    lore:'Its cloud-like wings are said to carry the scent of the last rain. It cleans polluted streams by bathing in them.' });
sp('altaria_a','Altaria',A,['Fairy','Flying'],[82,70,90,95,105,80],'fairy_aura',
  ['moonblast','air_slash','draining_kiss','roost'],
  { shape:'bird', cols:['#dce8f8','#a8bcd8','#ffffff','#ffd166','#ff9ec4'],
    features:['wings','fluff','tail','crest'], catchRate:45, xpYield:242,
    lore:'The "Cloud Shepherd". It hums the oldest melody in Aurelia, and wherever the song reaches, flowers bloom.' });

sp('mimikyu_a','Mimikyu',A,['Ghost','Fairy'],[55,90,80,50,105,96],'disguise',
  ['shadow_ambush','play_rough','shadow_ball','baby_doll_eyes'],
  { shape:'ghost', cols:['#d8c898','#8a7648','#f8ecc8','#ff7a9e','#3a2a3a'],
    features:['rag','eyes','tail'], catchRate:45, xpYield:210,
    lore:'The children of Twilight Grove leave it offerings so it will not feel lonely. Its rag is stitched from a hundred festival banners.' });

sp('lucario_a','Lucario',A,['Fighting','Steel'],[70,110,70,115,70,90],'justified',
  ['aura_lance','flash_cannon','dragon_pulse','bulk_up'],
  { shape:'biped', cols:['#4a6a9a','#1e3050','#c8d8f0','#ffd166','#8de0ff'],
    features:['ears','aura','tail','spikes'], catchRate:45, xpYield:240,
    lore:'Aurelian Lucario reads the "echo" of a soul: the residue left behind by strong emotions. It never forgets a promise.' });

sp('absol_a','Absol',A,['Dark','Fairy'],[65,130,60,75,60,75],'super_luck',
  ['ruin_slash','play_rough','nightfall_trick','swords_dance'],
  { shape:'quad', cols:['#e8e8f0','#9aa8bc','#ffffff','#ff7a9e','#ffd166'],
    features:['horn','tail','mane','wings'], catchRate:30, xpYield:230,
    lore:'It appears only when a choice must be made. Aurelians say an Aurelian Absol does not warn of disaster — it warns of consequence.' });

sp('volcarona_a','Volcarona',A,['Bug','Fire'],[85,60,65,135,105,100],'flame_body',
  ['solar_flare','bug_buzz','quiver_dance','roost'],
  { shape:'bug', cols:['#e8d8b0','#b08040','#fff4d0','#ff6b3a','#8de0ff'],
    features:['wings','fluff','horn','eyes'], catchRate:45, xpYield:275,
    lore:'The "Sun Moth". Its wings are said to hold the first dawn. Aurelian priests preserved its scales alongside their most sacred texts.' });

sp('aegislash_a','Aegislash',A,['Steel','Ghost'],[60,50,140,50,140,60],'phantom_guard',
  ['spectral_edge','iron_head','shadow_ball','iron_defense'],
  { shape:'armor', cols:['#8a90a0','#4a5060','#d8dce8','#9b7bff','#f5c542'],
    features:['shield','sword','crown','eyes'], catchRate:45, xpYield:250,
    lore:'The "Throne Guard". It served the last queen of Aurelia and still stands watch over a kingdom that no longer exists.' });

sp('metagross_a','Metagross',A,['Steel','Psychic'],[80,135,130,95,90,70],'clear_body',
  ['genesis_press','psychic','meteor_mash','agility'],
  { shape:'armor', cols:['#4a7a8a','#24505e','#a8d8e0','#f5c542','#8de0ff'],
    features:['legs','cross','eyes','core'], catchRate:30, xpYield:300,
    lore:'Aurelian Metagross is built from the gears of the Sunken Spire. It remembers every calculation the ancient engineers ever made.' });

sp('salamence_a','Salamence',A,['Dragon','Flying'],[95,135,80,110,80,100],'moxie',
  ['skyfall_dive','dragon_claw','fire_fang','dragon_dance'],
  { shape:'dragon', cols:['#3a6a9a','#1a3a5a','#88c8e8','#ff6b3a','#f5c542'],
    features:['wings','horns','tail','claws'], catchRate:30, xpYield:300,
    lore:'The "Skyfall Sovereign". It nests on the highest peak of Aurelia and has never once been seen landing.' });

sp('zoroark_a','Zoroark',A,['Dark','Psychic'],[60,105,60,120,60,105],'super_luck',
  ['nightfall_trick','dark_pulse','psychic','nasty_plot'],
  { shape:'biped', cols:['#4a3a5a','#241a30','#9a88b0','#ff7a9e','#f5c542'],
    features:['mane','ears','claws','tail','mask'], catchRate:45, xpYield:240,
    lore:'It weaves illusions from the memories of the ruins. Some Arelian scholars believe the first Zoroark wrote the region’s oldest history.' });

sp('larvitar_a','Larvitar',A,['Rock','Dark'],[50,64,50,45,50,41],'rocky_payload',
  ['rock_throw','bite','leer','screech_missing'],
  { evolve:['pupitar_a',30], shape:'lizard', cols:['#6a7a5a','#3a4a30','#a8b898','#ff6b3a','#f0ffe0'],
    features:['horn','tail','spikes'], catchRate:45, xpYield:60,
    lore:'It eats the heart of mountains. The gems in its back are the compressed memories of everything it has devoured.' });
sp('pupitar_a','Pupitar',A,['Rock','Dark'],[70,84,70,65,70,51],'rocky_payload',
  ['rock_slide','crunch','scorching_sands','iron_defense'],
  { evolve:['tyranitar_a',55], shape:'armor', cols:['#5a6a4a','#303e26','#98a888','#ff6b3a','#f0ffe0'],
    features:['horn','spikes','eyes','core'], catchRate:45, xpYield:144,
    lore:'Its shell is a sealed reliquary. Those who listen closely can hear a heartbeat older than the region.' });
sp('tyranitar_a','Tyranitar',A,['Rock','Dark'],[100,134,110,95,100,61],'rocky_payload',
  ['stone_edge','crunch','earthquake','dragon_dance'],
  { shape:'dragon', cols:['#4a5a3a','#26301a','#8a9a78','#ff6b3a','#f0ffe0'],
    features:['horn','tail','spikes','claws','core'], catchRate:20, xpYield:310,
    lore:'The "Ruincaller". Where it walks, ancient roads rise from the earth, eager to be used one last time.' });

sp('dratini_a','Dratini',A,['Dragon','Fairy'],[41,64,45,50,50,50],'multiscale',
  ['dragon_breath','fairy_wind','thunder_wave','agility'],
  { evolve:['dragonair_a',30], shape:'serpent', cols:['#7ab8d8','#3a7898','#c8f0ff','#ff9ec4','#f5c542'],
    features:['fins','horn','tail'], catchRate:45, xpYield:60,
    lore:'Aurelian Dratini live in the moonlit pools beneath the Skyfall Summit. Their scales store starlight for a thousand years.' });
sp('dragonair_a','Dragonair',A,['Dragon','Fairy'],[61,84,65,70,70,70],'multiscale',
  ['dragon_pulse','draining_kiss','thunder_wave','dragon_dance'],
  { evolve:['dragonite_a',55], shape:'serpent', cols:['#68a8c8','#2e6888','#bce8ff','#ff9ec4','#f5c542'],
    features:['fins','horn','tail','wings'], catchRate:45, xpYield:147,
    lore:'It circles the summit in slow, luminous spirals. Each loop is a prayer for the safe return of something lost.' });
sp('dragonite_a','Dragonite',A,['Dragon','Fairy'],[91,134,95,100,100,80],'multiscale',
  ['outrage','moonblast','aerial_ace','dragon_dance'],
  { shape:'dragon', cols:['#5898b8','#225878','#a8e0ff','#ff9ec4','#f5c542'],
    features:['wings','horn','tail','fins','halo'], catchRate:30, xpYield:310,
    lore:'The "Gentle Star". It descends once a century to carry a stranded traveller home, and has never asked for thanks.' });

sp('oddish_a','Oddish',A,['Grass','Fairy'],[45,50,55,75,65,30],'poison_touch',
  ['absorb','fairy_wind','sleep_powder','acid_missing'],
  { evolve:['gloom_a',21], shape:'blob', cols:['#6aa84a','#346a24','#b8e878','#ff9ec4','#fff0f8'],
    features:['leaves','eyes','roots'], catchRate:255, xpYield:64,
    lore:'Aurelian Oddish blooms only under an eclipse. Its petals are used in Twilight Grove’s lantern festival.' });
sp('gloom_a','Gloom',A,['Grass','Fairy'],[60,65,70,85,75,40],'poison_touch',
  ['mega_drain','dazzling_gleam','sleep_powder','toxic'],
  { evolve:['vileplume_a',35], shape:'biped', cols:['#5a9840','#285a1e','#a8d868','#ff9ec4','#fff0f8'],
    features:['leaves','eyes','roots','flower'], catchRate:120, xpYield:138,
    lore:'Its drool is a powerful fertilizer. Farmers beg for a single drop, but Gloom only drools when it is sad.' });
sp('vileplume_a','Vileplume',A,['Grass','Fairy'],[75,80,85,110,90,50],'fairy_aura',
  ['moonblast','energy_ball','sleep_powder','giga_drain'],
  { shape:'biped', cols:['#4a8830','#1e4a16','#98c858','#ff9ec4','#fff0f8'],
    features:['leaves','eyes','flower','roots'], catchRate:45, xpYield:245,
    lore:'The "Eclipse Bloom". Its flower opens only when the moon crosses the sun, releasing a scent that makes lies impossible to speak.' });

sp('magikarp_a','Magikarp',A,['Water','Dragon'],[20,10,55,15,20,80],'water_absorb',
  ['tackle','splash_missing','dragon_breath','agility'],
  { evolve:['gyarados_a',20], shape:'fish', cols:['#e86a3a','#a83a1a','#ffb878','#f5c542','#fff0d8'],
    features:['fins','whiskers','scales'], catchRate:255, xpYield:40,
    lore:'Aurelian Magikarp scales are warm to the touch. They are said to carry a fragment of the sunken sun.' });
sp('gyarados_a','Gyarados',A,['Water','Dragon'],[95,125,79,60,100,81],'intimidate',
  ['waterfall','dragon_claw','crunch','dragon_dance'],
  { shape:'serpent', cols:['#2a6a9a','#123a5a','#68b8e0','#ff6b3a','#f5c542'],
    features:['fins','whiskers','scales','horns'], catchRate:45, xpYield:250,
    lore:'The "Storm Serpent of Brookhollow". When it rises from the bay, the tide forgets which way to go.' });

sp('psyduck_a','Psyduck',A,['Water','Psychic'],[50,52,48,65,50,55],'water_absorb',
  ['water_gun','confusion','tail_whip','calm_mind'],
  { evolve:['golduck_a',33], shape:'biped', cols:['#e8d858','#b0a020','#fff8b8','#5ac8e8','#ffffff'],
    features:['bill','hands','tail','eyes'], catchRate:190, xpYield:64,
    lore:'Aurelian Psyduck’s headache is a locked door. When it finally opens, the tide answers.' });
sp('golduck_a','Golduck',A,['Water','Psychic'],[80,82,78,95,80,85],'water_absorb',
  ['surf','psychic','scald','calm_mind'],
  { shape:'biped', cols:['#d8c848','#a09018','#fff0a8','#5ac8e8','#ffffff'],
    features:['bill','hands','tail','eyes','crest'], catchRate:75, xpYield:210,
    lore:'It swims at night with its eyes closed, navigating by the moon’s reflection on the seafloor.' });

sp('snorunt_a','Snorunt',A,['Ice','Ghost'],[50,50,50,50,50,50],'ice_body',
  ['ice_shard','lick','icy_wind','leer'],
  { evolve:['glalie_a',30], shape:'blob', cols:['#a8c8e8','#5a7a9a','#e8f8ff','#8b6fc4','#ffffff'],
    features:['hood','eyes','horns'], catchRate:190, xpYield:60,
    lore:'Aurelian Snorunt wear hoods of frozen mist. They appear on Frostpeak only when someone is about to make a difficult choice.' });
sp('glalie_a','Glalie',A,['Ice','Ghost'],[80,80,80,80,80,80],'ice_body',
  ['ice_beam','shadow_ball','crunch','iron_defense'],
  { shape:'armor', cols:['#98b8d8','#4a6a8a','#e8f8ff','#8b6fc4','#ffffff'],
    features:['horns','eyes','core','wings'], catchRate:75, xpYield:220,
    lore:'Its face is a mirror of the last person who looked into it. The reflection is always smiling, even when the person is not.' });
sp('frosmoth_a','Frosmoth',A,['Ice','Fairy'],[70,65,60,125,90,65],'shield_dust',
  ['frostbell','moonblast','bug_buzz','quiver_dance'],
  { shape:'bug', cols:['#d8e8f8','#8aa8c8','#ffffff','#ff9ec4','#8de0ff'],
    features:['wings','fluff','horn','eyes'], catchRate:75, xpYield:230,
    lore:'The "Winter Bell". Its wings ring softly when snow is about to fall, and the sound can mend a broken resolve.' });

sp('clefairy_a','Clefairy',A,['Fairy'],[70,45,48,60,65,35],'fairy_aura',
  ['fairy_wind','draining_kiss','baby_doll_eyes','calm_mind'],
  { evolve:['clefable_a',35], shape:'blob', cols:['#ffc8d8','#c88898','#fff0f4','#ff7a9e','#f5c542'],
    features:['ears','wings','tail','eyes'], catchRate:150, xpYield:70,
    lore:'Aurelian Clefairy dance on the moonlit terraces of Twilight Grove, leaving rings of mushrooms that never die.' });
sp('clefable_a','Clefable',A,['Fairy'],[95,70,73,95,90,60],'fairy_aura',
  ['moonblast','dazzling_gleam','calm_mind','recover'],
  { shape:'biped', cols:['#ffb8c8','#c07888','#fff0f4','#ff7a9e','#f5c542'],
    features:['ears','wings','tail','eyes'], catchRate:45, xpYield:242,
    lore:'The "Keeper of Wishes". It collects the wishes whispered to falling stars and hides them in its fur for safekeeping.' });

sp('litwick_a','Litwick',A,['Ghost','Fire'],[50,30,55,65,55,20],'flash_fire',
  ['ember','lick','will_o_wisp','confusion'],
  { evolve:['lampent_a',26], shape:'ghost', cols:['#e8e0f0','#9a88b0','#fff8ff','#ff9a3a','#8de0ff'],
    features:['flame','eyes','wax'], catchRate:190, xpYield:65,
    lore:'Aurelian Litwick burns the years of your life as fuel. It is considered rude to ask how old it is.' });
sp('lampent_a','Lampent',A,['Ghost','Fire'],[60,45,60,95,60,55],'flash_fire',
  ['flamethrower','shadow_ball','will_o_wisp','confusion'],
  { evolve:['chandelure_a',42], shape:'ghost', cols:['#d8d0e8','#8878a8','#fff8ff','#ff9a3a','#8de0ff'],
    features:['flame','eyes','wax','arms'], catchRate:90, xpYield:130,
    lore:'It follows mourners home. The flame it carries is not the soul of the dead, but the grief of the living.' });
sp('chandelure_a','Chandelure',A,['Ghost','Fire'],[70,55,70,145,90,80],'flash_fire',
  ['solar_flare','shadow_ball','will_o_wisp','calm_mind'],
  { shape:'ghost', cols:['#c8c0e0','#786898','#fff8ff','#ff8a2a','#8de0ff'],
    features:['flame','eyes','wax','arms','chandelier'], catchRate:45, xpYield:260,
    lore:'The "Last Lantern". It hangs in the ruined throne room, waiting for a monarch who promised to return.' });

sp('hawlucha_a','Hawlucha',A,['Fighting','Flying'],[78,92,75,74,63,118],'limber',
  ['flying_press_missing','close_combat','aerial_ace','swords_dance'],
  { shape:'bird', cols:['#4a9a6a','#1e5a3a','#a8e8b8','#ff6b3a','#f5c542'],
    features:['wings','mask','crest','claws'], catchRate:100, xpYield:200,
    lore:'The "Emerald Luchador". It wrestles the wind itself on the cliff edges of Aurelia and always wins by decision.' });

sp('togepi_a','Togepi',A,['Fairy'],[35,20,65,40,65,20],'serene_grace',
  ['fairy_wind','draining_kiss','growl','baby_doll_eyes'],
  { evolve:['togekiss_a',35], shape:'blob', cols:['#fff8e8','#e0c8a0','#ffffff','#ff7a9e','#5ac8e8'],
    features:['shell','wings','eyes'], catchRate:190, xpYield:49,
    lore:'Aurelian Togepi hatch from eggs found only in the ruins’ sunken gardens. They bring luck to whoever finds them, and then wander off.' });
sp('togekiss_a','Togekiss',A,['Fairy','Flying'],[85,50,95,120,115,80],'serene_grace',
  ['moonblast','air_slash','dazzling_gleam','roost'],
  { shape:'bird', cols:['#fff8e8','#e0c8a0','#ffffff','#ff7a9e','#5ac8e8'],
    features:['wings','shell','crest','eyes'], catchRate:30, xpYield:245,
    lore:'The "Mercy of Aurelia". It appears above battlefields where both sides have forgotten why they are fighting.' });

/* ---- legendary / mythical additions ---- */
sp('volcanion_a','Volcanion',A,['Fire','Water'],[80,110,120,130,90,70],'water_bubble',
  ['heat_wave','hydro_pump','scorching_sands','calm_mind'],
  { shape:'quad', cols:['#a84a2a','#5a2010','#f09058','#5ac8e8','#fff0d8'],
    features:['horns','core','spikes','tail'], catchRate:3, xpYield:330,
    lore:'The "Boiling Heart". It guards the steam vents beneath Ember Cavern and has never forgiven the ancient engineers for capping them.' });
sp('keldeo_a','Keldeo',A,['Water','Fighting'],[91,72,90,129,90,108],'justified',
  ['hydro_pump','aura_sphere','close_combat','calm_mind'],
  { shape:'quad', cols:['#4a8ab8','#1e4a78','#a8d8f0','#f5c542','#ffffff'],
    features:['horn','tail','mane','hooves'], catchRate:3, xpYield:290,
    lore:'The "Last Oath". It was the queen’s messenger, and still runs the old roads, carrying letters no one can read.' });

/* ------------------------------------------------------------
   FIX-UP: extra abilities & moves referenced above
   ------------------------------------------------------------ */
ABILITIES.keen_eye_missing = { name:'Keen Eye', desc:'Raises critical-hit ratio and never misses.', crit:1 };
ABILITIES.infiltrator_missing = { name:'Infiltrator', desc:'Slips past barriers; Flying moves are stronger.', boost:{type:'Flying',mult:1.2} };
mv('sand_attack_missing','Sand Attack','Ground','status',0,100,15,{foe:{acc:-1}});
mv('supersonic_missing','Supersonic','Normal','status',0,55,20,{foe:{spa:-1}});
mv('boomburst_missing','Boomburst','Normal','spec',140,100,5);
mv('splash_missing','Splash','Normal','status',0,100,40,{self:{}});
mv('screech_missing','Screech','Normal','status',0,85,40,{foe:{def:-2}});
mv('acid_missing','Acid','Poison','spec',40,100,30,{foe:{spd:-1}});
mv('flying_press_missing','Flying Press','Fighting','phys',100,95,10);

/* dex numbering in regional order */
Object.keys(SPECIES).forEach((id, i) => { SPECIES[id].dex = i + 1; });
const SPECIES_LIST = Object.values(SPECIES);

/* ------------------------------------------------------------
   SOUL AWAKENING FORMS
   ------------------------------------------------------------ */
const AWAKENINGS = {
  inteleon_a: {
    title:'Phantom Sovereign', types:['Water','Ghost'], ability:'phantom_agent', move:'final_cipher',
    mult:1.24, aura:'#7ee7ff', unlock:'soul',
    lore:'The mist cloak becomes a mantle of starlight. Inteleon’s rifle splits into a hundred afterimages, each one aiming at a different future.'
  },
  incineroar_a: {
    title:'Caldera Incarnate', types:['Fire','Ground'], ability:'volcanic_titan', move:'eruption_fist',
    mult:1.24, aura:'#ff9a3a', unlock:'soul',
    lore:'The obsidian belt cracks open and lava veins climb its arms. Incineroar’s roar becomes the sound of a mountain waking up.'
  },
  sceptile_a: {
    title:'Sylvan Warden', types:['Grass','Fighting'], ability:'sylvan_warden', move:'worldroot_cleave',
    mult:1.24, aura:'#a8ff6a', unlock:'soul',
    lore:'Roots and ancient ferns spiral around its limbs. Sceptile becomes the living heart of the forest it swore to protect.'
  },
  zekrom_a: {
    title:'Genesis Storm', types:['Electric','Steel'], ability:'truth_engine', move:'genesis_bolt',
    mult:1.32, aura:'#4dd8ff', unlock:'legend',
    lore:'The iron shell opens like a cathedral. Aurelian Zekrom becomes a storm wearing a crown of pylons, and the sky remembers every forgotten current.'
  },
  reshiram_a: {
    title:'Genesis Sun', types:['Fire','Fairy'], ability:'ideal_sun', move:'genesis_ember',
    mult:1.32, aura:'#ffd166', unlock:'legend',
    lore:'Its wings unfold into a dawn that has never happened. Aurelian Reshiram burns with every future that could still be chosen.'
  },
  kyurem_a: {
    title:'Hollow Genesis', types:['Ice','Ghost'], ability:'hollow_genesis', move:'hollow_frost',
    mult:1.3, aura:'#b8e8ff', unlock:'champion',
    lore:'The absence grows teeth. Kyurem becomes the shape of everything that was lost when the twin lights were divided.'
  },
  ampharos_a: {
    title:'Aurora Beacon', types:['Electric','Fairy'], ability:'truth_engine', move:'aurora_thunder',
    mult:1.22, aura:'#7ee7ff', unlock:'soul',
    lore:'Its tail-lamp blooms into a miniature aurora. Ships three seas away steer by its light.'
  },
  lucario_a: {
    title:'Aura Ascendant', types:['Fighting','Steel'], ability:'aura_master', move:'aura_nova',
    mult:1.24, aura:'#8de0ff', unlock:'soul',
    lore:'Aura pours from its chest like a second skeleton. Lucario sees the shape of every choice in the room.'
  },
  gardevoir_a: {
    title:'Astral Oracle', types:['Psychic','Fairy'], ability:'astral_grace', move:'astral_lullaby',
    mult:1.24, aura:'#ff9ec4', unlock:'soul',
    lore:'A halo of tiny moons orbits its head. Gardevoir sings the true name of everyone present, and for a moment no one can lie.'
  },
  garchomp_a: {
    title:'Apex Glasswyrm', types:['Dragon','Ground'], ability:'apex_predator', move:'continental_rend',
    mult:1.25, aura:'#ffd166', unlock:'soul',
    lore:'Its fins fuse into blades of fused sand. Garchomp leaves a canyon behind it wherever it chooses to run.'
  },
  metagross_a: {
    title:'Genesis Core', types:['Steel','Psychic'], ability:'genesis_core', move:'genesis_press',
    mult:1.25, aura:'#8de0ff', unlock:'soul',
    lore:'Every gear in its body turns at once. For one impossible second, Metagross calculates the exact weight of the sky.'
  },
  salamence_a: {
    title:'Sky Sovereign', types:['Dragon','Flying'], ability:'sky_sovereign', move:'aurelian_skybreak',
    mult:1.25, aura:'#88c8e8', unlock:'soul',
    lore:'Its wings eclipse the sun. Salamence does not fly through the sky; the sky rearranges itself around it.'
  },
  volcarona_a: {
    title:'Solar Deity', types:['Bug','Fire'], ability:'solar_deity', move:'sunforge_halo',
    mult:1.24, aura:'#ffb347', unlock:'soul',
    lore:'Six wings of living flame unfurl. Volcarona becomes a second sun, and the air smells of the first morning.'
  },
  absol_a: {
    title:'Omen Master', types:['Dark','Fairy'], ability:'omen_master', move:'omen_edge',
    mult:1.24, aura:'#ff7a9e', unlock:'soul',
    lore:'Its horn splits into a crescent of black glass. Absol no longer warns of disaster; it negotiates with it.'
  },
  mimikyu_a: {
    title:'Veil Queen', types:['Ghost','Fairy'], ability:'veil_queen', move:'eclipse_veil',
    mult:1.24, aura:'#9b7bff', unlock:'soul',
    lore:'The rag falls away, and what looks out is not a monster but a mirror. Mimikyu finally lets someone see it.'
  },
  frosmoth_a: {
    title:'Winter Crown', types:['Ice','Fairy'], ability:'winter_crown', move:'hollow_winter',
    mult:1.22, aura:'#b8e8ff', unlock:'soul',
    lore:'Its wings ring with the sound of a frozen bell tower. Snow begins to fall upward.'
  },
  aegislash_a: {
    title:'King Eternal', types:['Steel','Ghost'], ability:'king_eternal', move:'crown_of_ages',
    mult:1.26, aura:'#f5c542', unlock:'champion',
    lore:'The shield becomes a throne; the sword becomes a scepter. Aegislash remembers the name of every ruler it outlived.'
  },
  zoroark_a: {
    title:'Mirror Sovereign', types:['Dark','Psychic'], ability:'mirror_soul', move:'mirror_eclipse',
    mult:1.24, aura:'#c8a8ff', unlock:'champion',
    lore:'A thousand illusions fold into one perfect lie. Zoroark wears the face of the truth you were not ready to see.'
  },
  chandelure_a: {
    title:'Last Lantern', types:['Ghost','Fire'], ability:'solar_deity', move:'soul_requiem',
    mult:1.24, aura:'#ff8a2a', unlock:'champion',
    lore:'Every candle in the ruined palace lights at once. Chandelure becomes the last lantern of a kingdom that refuses to go dark.'
  }
};
mv('soul_requiem','Soul Requiem','Ghost','spec',130,95,5,{eff:{status:'burn',chance:30}});

/* ------------------------------------------------------------
   ITEMS
   ------------------------------------------------------------ */
const ITEMS = {
  potion:        { name:'Potion', icon:'🧪', price:300, kind:'heal', heal:20, desc:'Restores 20 HP to one Pokémon.' },
  super_potion:  { name:'Super Potion', icon:'🧴', price:700, kind:'heal', heal:60, desc:'Restores 60 HP to one Pokémon.' },
  hyper_potion:  { name:'Hyper Potion', icon:'🫙', price:1200, kind:'heal', heal:120, desc:'Restores 120 HP to one Pokémon.' },
  max_potion:    { name:'Max Potion', icon:'💠', price:2500, kind:'heal', heal:9999, desc:'Fully restores one Pokémon’s HP.' },
  revive:        { name:'Revive', icon:'✨', price:1500, kind:'revive', desc:'Revives a fainted Pokémon with half its HP.' },
  full_heal:     { name:'Full Heal', icon:'🌿', price:600, kind:'cure', desc:'Cures all status conditions.' },
  antidote:      { name:'Antidote', icon:'🟣', price:200, kind:'cure_one', status:'poison', desc:'Cures poison.' },
  poke_ball:     { name:'Poké Ball', icon:'⚪', price:200, kind:'ball', rate:1, desc:'A device for catching wild Pokémon.' },
  great_ball:    { name:'Great Ball', icon:'🔵', price:600, kind:'ball', rate:1.5, desc:'A better ball with a higher catch rate.' },
  ultra_ball:    { name:'Ultra Ball', icon:'🟡', price:1200, kind:'ball', rate:2.2, desc:'An exceptional ball with a high catch rate.' },
  aurelia_ball:  { name:'Aurelia Ball', icon:'🔶', price:0, kind:'ball', rate:5, desc:'A relic ball that resonates with ancient souls.' },
  master_ball:   { name:'Master Ball', icon:'🟪', price:0, kind:'ball', rate:255, desc:'The ultimate ball. It never fails.' },
  rare_candy:    { name:'Rare Candy', icon:'🍬', price:4800, kind:'level', desc:'Raises a Pokémon’s level by one.' },
  tm_ice_beam:   { name:'TM Ice Beam', icon:'💿', price:3000, kind:'tm', move:'ice_beam', desc:'Teaches Ice Beam. Replaces the fourth move.' },
  tm_earthquake: { name:'TM Earthquake', icon:'💿', price:3000, kind:'tm', move:'earthquake', desc:'Teaches Earthquake. Replaces the fourth move.' },
  tm_moonblast:  { name:'TM Moonblast', icon:'💿', price:3000, kind:'tm', move:'moonblast', desc:'Teaches Moonblast. Replaces the fourth move.' },
  tm_will_o_wisp:{ name:'TM Will-O-Wisp', icon:'💿', price:2000, kind:'tm', move:'will_o_wisp', desc:'Teaches Will-O-Wisp. Replaces the fourth move.' },
  soul_ember:    { name:'Soul Ember', icon:'🔥', price:0, kind:'key', desc:'The undying spark of Queen Aurelia. Unlocks Soul Awakening.' },
  relic_truth:   { name:'Relic of Truth', icon:'🔹', price:0, kind:'key', desc:'A shard of the first mirror. It hums when lies are spoken.' },
  relic_ideal:   { name:'Relic of Ideals', icon:'🔸', price:0, kind:'key', desc:'A shard of the first sunrise. It warms when a promise is kept.' },
  eclipse_key:   { name:'Eclipse Key', icon:'🌑', price:0, kind:'key', desc:'Opens the Sunken Spire beneath the Pokémon League.' },
  letter:        { name:'Old Letter', icon:'✉️', price:0, kind:'key', desc:'A letter addressed to someone in Willowbrook. The ink is still wet.' },
  lost_locket:   { name:'Lost Locket', icon:'📿', price:0, kind:'key', desc:'A locket found in Verdant Forest. It holds a faded photograph.' },
  berry_parcel:  { name:'Berry Parcel', icon:'🫐', price:0, kind:'key', desc:'A parcel of sun-berries for the Duneveil bazaar.' },
  egg:           { name:'Pokémon Egg', icon:'🥚', price:0, kind:'key', desc:'It moves faintly. Something is waiting to meet you.' }
};

const SHOP_STOCK = {
  basic: ['potion','poke_ball','antidote','great_ball'],
  tier2: ['super_potion','great_ball','full_heal','revive','tm_will_o_wisp'],
  tier3: ['hyper_potion','ultra_ball','revive','max_potion','tm_ice_beam','tm_earthquake','tm_moonblast'],
  league: ['hyper_potion','max_potion','full_heal','revive','ultra_ball','rare_candy','tm_ice_beam','tm_earthquake','tm_moonblast']
};

/* ------------------------------------------------------------
   TRAINERS
   ------------------------------------------------------------ */
const TRAINERS = {};
function tr(id, name, cls, sprite, team, opts = {}) {
  TRAINERS[id] = Object.assign({ id, name, cls, sprite, team, reward: 500, intro: [], win: [], lose: [], soul: false }, opts);
}
tr('rival_1','Nova','Rival','rival',[],{
  reward:400, rival:true, intro:['So you finally picked one. Good.','Then show me what it can do!'],
  win:['Hah! I knew I picked the better one.'], lose:['...Fine. You win this one.']
});
tr('rival_2','Nova','Rival','rival',[],{
  reward:1200, rival:true, intro:['I’ve been training too, you know.','Don’t you dare hold back.'],
  win:['That’s more like it. I’m still one step ahead!'], lose:['You’re getting scarily good.']
});
tr('rival_3','Nova','Rival','rival',[],{
  reward:2600, rival:true, soul:true, intro:['I saw what Team Paradox did at the reliquary.','I won’t let them rewrite anyone’s choices. Not even mine.'],
  win:['See? I can protect this region too.'], lose:['I needed that. Thank you.']
});
tr('rival_4','Nova','Rival','rival',[],{
  reward:4200, rival:true, soul:true, intro:['The League is right ahead.','One last match before we both become legends, yeah?'],
  win:['Go on. The Champion is waiting.'], lose:['I’ll be right behind you.']
});

/* GYM LEADERS */
tr('leader_flora','Flora','Gym Leader','leader_flora',[['oddish_a',11],['gloom_a',12],['vileplume_a',14]],{
  badge:1, reward:1500, intro:['Welcome to Willowbrook Gym!','Every garden begins with a single stubborn seed. Show me your roots!'],
  win:['Your roots run deep. Take the Verdant Badge!'], lose:['The forest remembers kindness. Come back stronger.']
});
tr('leader_maris','Maris','Gym Leader','leader_maris',[['psyduck_a',15],['magikarp_a',16],['gyarados_a',18]],{
  badge:2, reward:2200, intro:['The tide brought you here. Let’s see if you can swim.'],
  win:['You ride the current well. The Tide Badge is yours!'], lose:['The sea always gives another chance.']
});
tr('leader_ignis','Ignis','Gym Leader','leader_ignis',[['fletchinder_a',20],['lampent_a',21],['talonflame_a',23]],{
  badge:3, reward:3000, intro:['Ash in your lungs? Good. That means you’re alive.','Show me a flame that won’t blow out!'],
  win:['A steady flame. You’ve earned the Cinder Badge!'], lose:['A cold hearth teaches patience.']
});
tr('leader_sahara','Sahara','Gym Leader','leader_sahara',[['sandile_a',24],['krokorok_a',25],['krookodile_a',27]],{
  badge:4, reward:3800, intro:['The desert strips away everything unnecessary.','Let’s see what’s left of you.'],
  win:['You endure. The Dune Badge is yours.'], lose:['The sand remembers every footstep.']
});
tr('leader_eira','Eira','Gym Leader','leader_eira',[['snorunt_a',28],['glalie_a',29],['frosmoth_a',31]],{
  badge:5, reward:4600, soul:true, intro:['Frostpeak is quiet because the mountain is listening.','Prove your resolve before it does.'],
  win:['A warm heart in a cold place. Take the Frost Badge!'], lose:['Let the cold sharpen you.']
});
tr('leader_volt','Volt','Gym Leader','leader_volt',[['mareep_a',32],['flaaffy_a',33],['ampharos_a',35]],{
  badge:6, reward:5400, soul:true, intro:['This gym sits on a live wire. One wrong step and you’re history.','Let’s see if you can handle the current!'],
  win:['You’re a closed circuit. The Storm Badge is yours!'], lose:['Power without control is just a blackout.']
});
tr('leader_luma','Luma','Gym Leader','leader_luma',[['clefairy_a',36],['clefable_a',37],['mimikyu_a',39]],{
  badge:7, reward:6200, soul:true, intro:['Twilight Grove is where wishes go to be tested.','Tell me one true thing, and then we’ll battle.'],
  win:['A wish worth keeping. The Twilight Badge is yours!'], lose:['The truth can wait. Grow first.']
});
tr('leader_draven','Draven','Gym Leader','leader_draven',[['noivern_a',40],['garchomp_a',41],['salamence_a',43]],{
  badge:8, reward:7200, soul:true, intro:['Only dragons know how heavy a crown is.','Show me you can carry one.'],
  win:['The Obsidian Badge. You’ve earned the right to challenge the League.'], lose:['A dragon without resolve is just a lizard with wings.']
});

/* ELITE FOUR */
tr('elite_bastion','Bastion','Elite Four','elite_bastion',[['aegislash_a',47],['lucario_a',48],['metagross_a',50]],{
  reward:9000, elite:true, soul:true, intro:['Steel does not bend. It decides, and then it holds.','The League begins here.'],
  win:['A clean break. Go on.'], lose:['The wall holds.']
});
tr('elite_rhea','Rhea','Elite Four','elite_rhea',[['hawlucha_a',47],['krookodile_a',48],['lucario_a',50]],{
  reward:9000, elite:true, soul:true, intro:['Fighting is a conversation. Let’s see what your fists have to say.'],
  win:['A strong answer. Next room.'], lose:['Words are cheap. Train.']
});
tr('elite_morrigan','Morrigan','Elite Four','elite_morrigan',[['gengar_a',47],['chandelure_a',48],['mimikyu_a',50]],{
  reward:9000, elite:true, soul:true, intro:['Ghosts are just memories that refused to leave.','Won’t you join them for a while?'],
  win:['You didn’t look away. Impressive.'], lose:['Stay a little longer. Forever, perhaps.']
});
tr('elite_noctis','Noctis','Elite Four','elite_noctis',[['zoroark_a',48],['krookodile_a',49],['absol_a',50]],{
  reward:9000, elite:true, soul:true, intro:['Darkness is not the absence of light. It’s the room where light is tested.','Show me yours.'],
  win:['A light that doesn’t flinch. The Champion waits.'], lose:['The dark keeps what it catches.']
});
tr('champion_seraphine','Seraphine','Champion','champion',[['altaria_a',52],['volcarona_a',53],['gardevoir_a',53],['salamence_a',55]],{
  reward:20000, champion:true, soul:true,
  intro:['I’ve watched every badge you earned. Every choice you made.','This region has waited a long time for someone like you.','Now show me that the truth is worth protecting.'],
  win:['...So this is what it feels like to be believed in.','Then it’s time you learned the rest of the story.'],
  lose:['The Eclipse is patient. So am I.']
});
tr('seraphine_eclipse','Seraphine','Eclipse','champion_eclipse',[['zoroark_a',56],['volcarona_a',57],['gardevoir_a',57],['metagross_a',58],['salamence_a',59]],{
  reward:0, champion:true, soul:true, finalboss:true,
  intro:['You were supposed to be the variable I couldn’t predict.','I have seen every future Aurelia can endure. This is the only one where the pain stops.','I’m sorry. I’m not asking for forgiveness.'],
  win:['I… I can still hear them. The voices of everyone I couldn’t save.','Maybe… maybe the future was never mine to write.','Finish it. Before the Eclipse devours us all.'],
  lose:['This is the ending I saw. I’m sorry it had to be you.']
});

/* TEAM PARADOX */
tr('grunt_1','Paradox Grunt','Team Paradox','grunt',[['sandile_a',10],['gastly_a',11]],{
  reward:600, intro:['Team Paradox claims this shrine by order of Arbiter Vale!','Scram, kid.'],
  win:['The Arbiter will hear about this!'], lose:['Tch. Enjoy your little victory.']
});
tr('grunt_2','Paradox Grunt','Team Paradox','grunt',[['dewpider_a',11],['mareep_a',12]],{
  reward:700, intro:['You again? The relic belongs to the future, not the past!'],
  win:['Fine! It’s just a dusty old rock anyway.'], lose:['The future is already written.']
});
tr('grunt_3','Paradox Grunt','Team Paradox','grunt',[['krokorok_a',24],['haunter_a',25]],{
  reward:1100, intro:['The ruins are off-limits. Arbiter Sable is conducting an important experiment.'],
  win:['You’ll regret this when the world is rewritten!'], lose:['This changes nothing.']
});
tr('grunt_4','Paradox Grunt','Team Paradox','grunt',[['ampharos_a',31],['noibat_a',30]],{
  reward:1500, intro:['The Reliquary is ours. The storm obeys Team Paradox now!'],
  win:['Impossible! The current—it chose you?!'], lose:['The storm will remember this.']
});
tr('grunt_5','Paradox Grunt','Team Paradox','grunt',[['haunter_a',37],['krookodile_a',38]],{
  reward:1900, intro:['The Obsidian Gate stays closed. The Eclipse begins tonight!'],
  win:['You’re too late. The Champion already has the key.'], lose:['...She said you might come.']
});
tr('admin_sable','Sable','Paradox Admin','admin_sable',[['zoroark_a',25],['haunter_a',26],['absol_a',27]],{
  reward:2600, soul:true, intro:['So the little ember found its way into my ruins.','I am Sable. I keep the parts of history that refuse to stay buried.','Let me show you what truth looks like when no one is allowed to look away.'],
  win:['...You saw it. The whole ugly thing.','Perhaps you are the variable Vale feared.'], lose:['Truth is a blade. You are not holding the handle.']
});
tr('admin_fenn','Fenn','Paradox Admin','admin_fenn',[['mareep_a',22],['ampharos_a',23],['talonflame_a',24]],{
  reward:2400, soul:true, intro:['This machinery is older than the mountains, and it still turns.','I’m going to make it turn for us.'],
  win:['The resonance… it accepted you. Fascinating.'], lose:['Data doesn’t lie. You will lose eventually.']
});
tr('admin_fenn_2','Fenn','Paradox Admin','admin_fenn',[['flaaffy_a',35],['ampharos_a',36],['noivern_a',36]],{
  reward:3200, soul:true, intro:['The Twin Reliquary is awake. I can hear both of them arguing.','One last calibration. Then the Eclipse.'],
  win:['Both voices are singing now. The Champion will be pleased.'], lose:['The signal is degrading... I need more time.']
});

/* optional & story trainers */
tr('youngster_pip','Pip','Youngster','youngster',[['pidgey_a',5],['mareep_a',5]],{
  reward:220, intro:['My Pokémon are gonna be champions someday! Wanna help me practice?'],
  win:['Nice! I’m gonna train even harder.'], lose:['Aw, I thought I had you.']
});
tr('lass_mia','Mia','Lass','lass',[['oddish_a',6],['pidgey_a',6]],{
  reward:260, intro:['The tall grass is full of secrets. I know all of them!'],
  win:['Okay, maybe you know a few too.'], lose:['Told you the grass was tricky.']
});
tr('bugcatcher_eli','Eli','Bug Catcher','bugcatcher',[['dewpider_a',8],['oddish_a',8]],{
  reward:340, intro:['Aurelian Dewpider is the coolest Pokémon in the forest. Fight me about it.'],
  win:['You’re right. It’s still the coolest.'], lose:['Bugs always win in the forest!']
});
tr('sailor_bram','Bram','Sailor','sailor',[['psyduck_a',14],['magikarp_a',14]],{
  reward:520, intro:['The sea’s been strange lately. Pokémon won’t come near the docks.','A battle’ll clear my head!'],
  win:['Ha! You’ve got sea legs.'], lose:['Back to the docks for me.']
});
tr('swimmer_nyx','Nyx','Swimmer','swimmer',[['psyduck_a',16],['gyarados_a',18]],{
  reward:640, intro:['I swim the whole Aurelian coast every morning. Beat me and I’ll show you the hidden cove.'],
  win:['A promise is a promise. Check the northern rocks.'], lose:['The tide’s with me today.']
});
tr('hiker_gorran','Gorran','Hiker','hiker',[['rockruff_a',19],['sandile_a',20]],{
  reward:700, intro:['These boots have crossed every mountain in Aurelia. These Pokémon have too.'],
  win:['You’ve got mountain legs!'], lose:['The mountain always wins.']
});
tr('scholar_orin','Orin','Ruins Scholar','scholar',[['gastly_a',21],['noibat_a',22]],{
  reward:760, intro:['The murals say the twin legends argued about whether the future was fixed.','I have my own argument to settle. Battle me.'],
  win:['A compelling counterargument.'], lose:['The past always has more evidence.']
});
tr('dancer_zahra','Zahra','Dune Dancer','dancer',[['krokorok_a',24],['lycanroc_a',25]],{
  reward:900, intro:['In Duneveil, we dance for rain. But today, I dance for battle!'],
  win:['Your feet know the sand.'], lose:['The desert has two left feet for you.']
});
tr('ace_kael','Kael','Ace Trainer','ace',[['swablu_a',27],['gabite_a',28]],{
  reward:1100, intro:['I’ve got six badges and a bad attitude. Let’s go.'],
  win:['You’re the real deal.'], lose:['I’ll be back with seven badges.']
});
tr('veteran_rooke','Rooke','Veteran','veteran',[['ampharos_a',32],['talonflame_a',33]],{
  reward:1400, intro:['I’ve seen three Eclipses. None of them ended well.','Show me the new generation has teeth.'],
  win:['Sharp teeth indeed.'], lose:['Not yet, kid. Not yet.']
});
tr('hex_sera','Sera','Hex Maniac','hex',[['haunter_a',34],['chandelure_a',35]],{
  reward:1500, intro:['The trees here whisper the names of people who haven’t been born yet.','Do you want to hear yours?'],
  win:['...You heard it too, didn’t you?'], lose:['The forest will keep your name for later.']
});
tr('blackbelt_dain','Dain','Black Belt','blackbelt',[['krookodile_a',38],['hawlucha_a',39]],{
  reward:1700, intro:['The Obsidian Pass is a training ground. Every step is a rep. Fight me!'],
  win:['Your spirit’s got weight!'], lose:['Come back when your stance is steady.']
});
tr('ace_lyra','Lyra','Ace Trainer','ace',[['salamence_a',45],['metagross_a',45]],{
  reward:2400, intro:['Only the strongest reach the League. Consider me the door.'],
  win:['The door’s open. Don’t waste it.'], lose:['The League isn’t ready for you yet.']
});
tr('paradox_elite_1','Paradox Elite','Team Paradox','grunt',[['noivern_a',44],['absol_a',45],['krookodile_a',45]],{
  reward:2600, soul:true, intro:['Arbiter Vale has already entered the Spire. You’re too late.'],
  win:['The Eclipse cannot be stopped...'], lose:['The future is already over.']
});

/* postgame */
tr('rematch_flora','Flora','Gym Leader','leader_flora',[['vileplume_a',62],['togekiss_a',62],['sceptile_a',64]],{
  reward:12000, soul:true, postgame:true, intro:['The garden has grown since you left. So have I.'],
  win:['The forest is in good hands.'], lose:['Still growing, then.']
});
tr('rematch_seraphine','Seraphine','Champion','champion',[['volcarona_a',66],['gardevoir_a',66],['metagross_a',67],['salamence_a',68]],{
  reward:20000, soul:true, postgame:true, intro:['I’m not the Champion you remember. I’m trying to be someone new.','Will you help me test that?'],
  win:['Thank you. For giving me another tomorrow.'], lose:['I still have a long way to go.']
});
tr('aurelio','Aurelio','First Awakened','aurelio',[['dragonite_a',70],['tyranitar_a',70],['aegislash_a',71],['zekrom_a',72],['reshiram_a',72]],{
  reward:50000, soul:true, superboss:true, intro:['I was the first to hear the Soul Ember. I have waited three thousand years for someone who could carry it.','Show me that Aurelia has not forgotten how to choose.'],
  win:['Then the region is yours to dream. I can finally rest.'], lose:['The ember is not yet a sun.']
});

/* ------------------------------------------------------------
   WILD ENCOUNTER TABLES
   ------------------------------------------------------------ */
const ENCOUNTERS = {
  route1: [
    {sp:'pidgey_a',min:3,max:6,w:4}, {sp:'mareep_a',min:3,max:6,w:3},
    {sp:'oddish_a',min:3,max:6,w:3}, {sp:'rockruff_a',min:4,max:7,w:2},
    {sp:'treecko_a',min:4,max:6,w:1}
  ],
  forest: [
    {sp:'oddish_a',min:7,max:10,w:4}, {sp:'dewpider_a',min:7,max:10,w:3},
    {sp:'gastly_a',min:7,max:10,w:2}, {sp:'pidgey_a',min:7,max:9,w:2},
    {sp:'ralts_a',min:8,max:11,w:1}, {sp:'treecko_a',min:8,max:10,w:1}
  ],
  route2: [
    {sp:'psyduck_a',min:13,max:17,w:3}, {sp:'magikarp_a',min:13,max:17,w:3},
    {sp:'swablu_a',min:14,max:18,w:3}, {sp:'pidgeotto_a',min:15,max:18,w:2},
    {sp:'mareep_a',min:13,max:16,w:2}
  ],
  cavern: [
    {sp:'sandile_a',min:18,max:22,w:3}, {sp:'litwick_a',min:18,max:22,w:3},
    {sp:'noibat_a',min:19,max:23,w:2}, {sp:'gible_a',min:20,max:23,w:1},
    {sp:'rockruff_a',min:18,max:21,w:2}
  ],
  desert: [
    {sp:'sandile_a',min:21,max:26,w:3}, {sp:'rockruff_a',min:21,max:26,w:3},
    {sp:'gible_a',min:23,max:27,w:2}, {sp:'fletchling_a',min:21,max:25,w:2},
    {sp:'krokorok_a',min:25,max:28,w:1}
  ],
  ruins: [
    {sp:'gastly_a',min:23,max:27,w:3}, {sp:'ralts_a',min:23,max:27,w:3},
    {sp:'noibat_a',min:24,max:28,w:2}, {sp:'litwick_a',min:24,max:28,w:2},
    {sp:'togepi_a',min:25,max:28,w:1}
  ],
  route3: [
    {sp:'swablu_a',min:26,max:30,w:3}, {sp:'snorunt_a',min:26,max:30,w:3},
    {sp:'rockruff_a',min:27,max:31,w:2}, {sp:'gible_a',min:28,max:31,w:2},
    {sp:'fletchinder_a',min:28,max:31,w:1}
  ],
  route4: [
    {sp:'mareep_a',min:31,max:35,w:3}, {sp:'flaaffy_a',min:32,max:35,w:2},
    {sp:'haunter_a',min:31,max:35,w:2}, {sp:'noibat_a',min:31,max:34,w:2},
    {sp:'magikarp_a',min:30,max:34,w:1}
  ],
  route5: [
    {sp:'gastly_a',min:35,max:39,w:3}, {sp:'ralts_a',min:35,max:38,w:3},
    {sp:'swablu_a',min:35,max:39,w:2}, {sp:'absol_a',min:37,max:40,w:1},
    {sp:'litwick_a',min:36,max:39,w:2}
  ],
  route6: [
    {sp:'krokorok_a',min:39,max:43,w:3}, {sp:'haunter_a',min:39,max:42,w:3},
    {sp:'noibat_a',min:39,max:43,w:2}, {sp:'absol_a',min:41,max:44,w:1},
    {sp:'gabite_a',min:42,max:45,w:1}
  ],
  victory: [
    {sp:'gabite_a',min:44,max:48,w:3}, {sp:'haunter_a',min:44,max:47,w:2},
    {sp:'noibat_a',min:44,max:48,w:2}, {sp:'snorunt_a',min:43,max:46,w:2},
    {sp:'larvitar_a',min:46,max:49,w:1}
  ],
  summit: [
    {sp:'snorunt_a',min:58,max:62,w:3}, {sp:'frosmoth_a',min:59,max:63,w:2},
    {sp:'dratini_a',min:58,max:62,w:2}, {sp:'dragonair_a',min:60,max:64,w:1},
    {sp:'larvitar_a',min:60,max:64,w:1}
  ],
  origins: [
    {sp:'dratini_a',min:62,max:66,w:3}, {sp:'dragonair_a',min:63,max:67,w:2},
    {sp:'larvitar_a',min:62,max:66,w:3}, {sp:'pupitar_a',min:64,max:68,w:2},
    {sp:'togepi_a',min:62,max:66,w:2}, {sp:'absol_a',min:64,max:68,w:1}
  ]
};

/* ------------------------------------------------------------
   TRADES & SIDE QUESTS
   ------------------------------------------------------------ */
const TRADES = {
  bram_trade: { npc:'Bram', want:'psyduck_a', give:'rockruff_a', level:16, text:'My Psyduck misses the open sea. Would you trade me an Aurelian Psyduck? I’ll give you a Rockruff I raised on the cliffs.' },
  zahra_trade: { npc:'Zahra', want:'krokorok_a', give:'gible_a', level:26, text:'The desert glass sings when a Krokorok walks by. Bring me one, and this Aurelian Gible is yours.' },
  orin_trade: { npc:'Orin', want:'dratini_a', give:'larvitar_a', level:50, text:'A living Dratini would complete my thesis. In exchange, take this Larvitar from the deepest ruin.' }
};

const SIDEQUESTS = {
  locket: { title:'The Lost Locket', giver:'Mira', reward:'relic_ideal', rewardText:'Relic of Ideals' },
  berries: { title:'Sun-Berry Delivery', giver:'Talia', reward:'hyper_potion', rewardCount:3, rewardText:'3 Hyper Potions' },
  thesis: { title:'A Living Thesis', giver:'Orin', reward:'rare_candy', rewardCount:2, rewardText:'2 Rare Candies' }
};

/* Static encounters (legendary / rare) */
const STATIC_ENCOUNTERS = {
  zekrom: {species:'zekrom_a', level:50, shinyLocked:true, music:'legendary', title:'AURELIA ZEKROM', intro:'The iron shell splits. A storm older than the region looks at you with one golden eye.'},
  reshiram: {species:'reshiram_a', level:50, shinyLocked:true, music:'legendary', title:'AURELIA RESHIRAM', intro:'The shrine fills with warm light. A voice like a sunrise asks whether you came to remember or to forget.'},
  kyurem: {species:'kyurem_a', level:60, shinyLocked:true, music:'legendary', title:'AURELIA KYUREM', intro:'Snow falls upward. The Hollow King rises from a throne of absence, and the mountain holds its breath.'}
};

/* ------------------------------------------------------------
   RIVAL TEAM BUILDER
   ------------------------------------------------------------ */
const STARTER_COUNTER = { sobble_a:'treecko_a', litten_a:'sobble_a', treecko_a:'litten_a' };
const STARTER_FINAL = { sobble_a:'inteleon_a', litten_a:'incineroar_a', treecko_a:'sceptile_a' };
const STARTER_MID = { sobble_a:'drizzile_a', litten_a:'torracat_a', treecko_a:'grovyle_a' };
function rivalTeam(battleId, playerStarter) {
  const c = STARTER_COUNTER[playerStarter] || 'sobble_a';
  const mid = STARTER_MID[c] || 'drizzile_a';
  const fin = STARTER_FINAL[c] || 'inteleon_a';
  switch (battleId) {
    case 'rival_1': return [[c, 5]];
    case 'rival_2': return [['pidgeotto_a', 16], [mid, 18]];
    case 'rival_3': return [['noibat_a', 30], ['talonflame_a', 31], [fin, 33]];
    case 'rival_4': return [['altaria_a', 44], ['absol_a', 45], [fin, 46]];
    default: return [[c, 5]];
  }
}

/* ------------------------------------------------------------
   POKÉDEX / REGION TEXT
   ------------------------------------------------------------ */
const REGION_LORE = {
  title: 'The Aurelia Region',
  intro: 'A land of sunken spires and twin relics, where the oldest argument in history is still being settled: is the world shaped by what is true, or by what we believe it should be?',
  chapters: [
    { title:'The First Argument', text:'Long before the League, Queen Aurelia ruled a civilization that built its cities around two relics: the Storm Relic and the Sun Relic. One promised certainty. The other promised possibility. The queen refused to choose between them, and the kingdom flourished.' },
    { title:'The Eclipse', text:'When the twin relics were forced into resonance, the sky went dark for seven days. The queen spent her own soul to separate them, scattering her light into every living thing. That scattered light is what we now call Soul Awakening.' },
    { title:'Team Paradox', text:'A new organization believes the Eclipse was not a disaster but an unfinished edit. Led by a figure known only as Arbiter Vale, Team Paradox seeks to reunite the relics and rewrite the region — erasing suffering by erasing choice.' },
    { title:'The Chosen Ember', text:'Professor Cedar has spent her life tracing the queen’s scattered light. She believes a new Ember has appeared in Aurelia — someone who can awaken a Pokémon’s soul without losing their own.' }
  ]
};

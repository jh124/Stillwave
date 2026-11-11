export const VERSION = '2.2.1';
export const PASSAGES = 8;
export const PASSAGE_SECONDS = 75;
export const WORLD = {w:1600,h:1100};
export const REGIONS = [
  {id:'moss',name:'Mosslight Gardens',genre:'Lofi',subtitle:'Where the quiet things grow.',color:'#bce6cd',accent:'#dcbb82',bg:'#142e2c',bpm:76,root:57,scale:'minor',boss:'The Lantern Keeper',bossKind:'stag',gift:'instrument:rhodes',description:'Dusty keys, soft breakbeats, and a garden after rain.'},
  {id:'neon',name:'Afterglow City',genre:'Synthwave',subtitle:'The city is dreaming, too.',color:'#dfb6ef',accent:'#ffbcb8',bg:'#292540',bpm:84,root:54,scale:'minor',boss:'The Midnight Rider',bossKind:'fox',gift:'instrument:analog',description:'Warm analog chords beneath an endless violet sunset.'},
  {id:'pixel',name:'Littlebit Ruins',genre:'Chiptune',subtitle:'Small sounds. Ancient stories.',color:'#d5edaf',accent:'#f3d59f',bg:'#29362a',bpm:88,root:60,scale:'major',boss:'The Forgotten Cartridge',bossKind:'golem',gift:'instrument:chip',description:'Soft square waves and tiny melodies in a forgotten garden.'},
  {id:'tide',name:'Sundrift Coast',genre:'Bossa',subtitle:'Let the tide take its time.',color:'#f3d5a6',accent:'#a2ded3',bg:'#343226',bpm:78,root:55,scale:'major',boss:'The Pearl Leviathan',bossKind:'turtle',gift:'instrument:guitar',description:'Nylon strings, brushed percussion, and the salt in the air.'},
  {id:'snow',name:'Cloudrest Monastery',genre:'Ambient',subtitle:'There is music in the spaces.',color:'#c8cee9',accent:'#ded2ed',bg:'#282d41',bpm:64,root:62,scale:'dorian',boss:'The Keeper of Silence',bossKind:'owl',gift:'instrument:glass',description:'Slow clouds of sound and bells hanging in the mist.'},
  {id:'dawn',name:'The First Light',genre:'Downtempo',subtitle:'Every ending leaves an echo.',color:'#f1c7ce',accent:'#f5dea0',bg:'#39303d',bpm:80,root:53,scale:'major',boss:'The Sun in Bloom',bossKind:'phoenix',gift:'instrument:marimba',description:'All your little discoveries, finding their way home.'}
];
export const WEAPONS = {
  sword:{name:'Moonblade',type:'Sword',damage:36,cooldown:.62,range:120,desc:'A wide, forgiving arc. Higher damage, close to the music.',perk:'Cleave nearby foes · every third hit restores 1 health'},
  bow:{name:'Willowbow',type:'Bow & arrow',damage:22,cooldown:.48,range:580,desc:'A light, steady rhythm. Make a little room for yourself.',perk:'Long range · arrows pierce one extra foe'}
};
export const SCALES = {minor:[0,2,3,5,7,8,10],major:[0,2,4,5,7,9,11],dorian:[0,2,3,5,7,9,10],pentatonic:[0,3,5,7,10]};
export const KEYS = {'A':57,'C':60,'D':62,'E':52,'F':53,'G':55};
export const METERS = {'4/4':4,'3/4':3,'6/8':6,'5/4':5};
export const LAYERS = ['drums','chords','bass','melody','pad','arp'];
export const INSTRUMENTS = {
  felt:{name:'Felt piano',wave:'sine'},rhodes:{name:'Electric piano',wave:'sine'},analog:{name:'Analog synth',wave:'sawtooth'},chip:{name:'Soft 8-bit',wave:'square'},guitar:{name:'Nylon strings',wave:'triangle'},glass:{name:'Glass bells',wave:'sine'},marimba:{name:'Wooden marimba',wave:'sine'},bell:{name:'Music box',wave:'sine'},pluck:{name:'Muted pluck',wave:'triangle'},air:{name:'Cloud pad',wave:'sine'},round:{name:'Round bass',wave:'triangle'},sub:{name:'Sub bass',wave:'sine'}
};
const u=(id,name,kind,desc)=>({id,name,kind,desc});
export const UNLOCKS = [
 u('track:bass','Bass track','Track','A warm foundation beneath your chords.'),
 u('track:melody','Melody track','Track','Little melodies that never quite repeat.'),
 u('key:C','Key of C','Key','A new home for every note.'),
 u('effect:tempo','Tempo control','Control','Set a relaxed pace between 60 and 96 BPM.'),
 u('track:pad','Atmosphere track','Track','Long, soft chords to fill the spaces.'),
 u('effect:reverb','Reverb','Effect','Let your notes breathe in a bigger room.'),
 u('meter:3/4','Waltz time · 3/4','Time signature','Three gentle steps to each bar.'),
 u('track:arp','Arpeggio track','Track','A quietly unfolding pattern of notes.'),
 u('key:D','Key of D','Key','A little more light on the horizon.'),
 u('effect:swing','Swing','Control','Give the rhythm a gentle lean.'),
 u('instrument:bell','Music box','Instrument','Tiny, round, shimmering notes.'),
 u('effect:delay','Tape delay','Effect','Soft echoes that fall in time.'),
 u('key:E','Key of E','Key','A deeper shade of the same feeling.'),
 u('scale:dorian','Dorian mode','Scale','A hopeful color inside a minor world.'),
 u('meter:6/8','Drifting time · 6/8','Time signature','Two lilting groups of three.'),
 u('instrument:pluck','Muted pluck','Instrument','Small strings and a gentle attack.'),
 u('effect:density','Arrangement density','Control','Choose more space or more little details.'),
 u('key:G','Key of G','Key','A new color for your quiet moments.'),
 u('effect:warmth','Tape warmth','Effect','Round off the edges of your sound.'),
 u('scale:pentatonic','Pentatonic scale','Scale','Five notes, always finding their way together.'),
 u('key:F','Key of F','Key','A warm place for the melody to rest.'),
 u('meter:5/4','Wandering time · 5/4','Time signature','A little longer before the next breath.'),
 u('instrument:sub','Sub bass','Instrument','A soft, deep pulse.'),
 u('scale:major','Major mode','Scale','Open the windows. Let the light in.'),
 ...REGIONS.flatMap(r=>[u(r.gift,INSTRUMENTS[r.gift.split(':')[1]].name,'Instrument',r.description),u('genre:'+r.id,r.genre+' palette','Genre','Revisit this region’s sound in the studio.')])
];
export const BASE_UNLOCKS = ['track:drums','track:chords','instrument:felt','instrument:round','instrument:air','key:A','scale:minor','genre:moss'];
export const DEFAULT_MUSIC = {genre:0,bpm:76,key:'A',scale:'minor',meter:'4/4',swing:.08,reverb:.22,delay:0,warmth:.38,density:.62,bloom:0,chorus:0,volume:.65,layers:{drums:true,chords:true,bass:true,melody:true,pad:true,arp:false},instruments:{chords:'felt',bass:'round',melody:'felt',pad:'air',arp:'felt'},levels:{drums:.72,chords:.75,bass:.65,melody:.60,pad:.48,arp:.38}};
export function seeded(seed){let a=seed>>>0;return()=>{a+=0x6D2B79F5;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};}
export function clamp(v,a,b){return Number.isFinite(v)?Math.max(a,Math.min(b,v)):a;}
export function newSeed(){return globalThis.crypto?.getRandomValues ? globalThis.crypto.getRandomValues(new Uint32Array(1))[0] : (Date.now()^Math.floor(Math.random()*1e9))>>>0;}
export function safeMusic(input={},unlocks=BASE_UNLOCKS,free=false,steadyCleared=false){
 input=input&&typeof input==='object'?input:{};const owned=new Set(unlocks);const s=structuredClone(DEFAULT_MUSIC);const allowed=id=>free||owned.has(id);
 s.genre=clamp(Number(input.genre)||0,0,5)|0;
 if(!allowed('genre:'+REGIONS[s.genre].id))s.genre=0;
 s.bpm=allowed('effect:tempo')?clamp(Number(input.bpm)||76,60,96):REGIONS[s.genre].bpm;
 s.key=KEYS[input.key]&&allowed('key:'+input.key)?input.key:'A';
 s.scale=SCALES[input.scale]&&(input.scale==='minor'||allowed('scale:'+input.scale))?input.scale:'minor';
 s.meter=METERS[input.meter]&&(input.meter==='4/4'||allowed('meter:'+input.meter))?input.meter:'4/4';
 for(const k of ['swing','reverb','delay','warmth','density']) if(allowed('effect:'+k))s[k]=clamp(Number(input[k]??s[k]),0,k==='swing'?.28:k==='delay'?.45:1);
 // Completing the regular collection never grants the Steady studio rewards.
 for(const k of ['bloom','chorus'])s[k]=steadyCleared===true?clamp(Number(input[k]??0),0,1):0;
 s.volume=clamp(Number(input.volume??s.volume),0,1);
 for(const k of LAYERS){s.layers[k]=allowed('track:'+k)&&input.layers?.[k]!==false;s.levels[k]=clamp(Number(input.levels?.[k]??s.levels[k]),0,1);}
 for(const k of ['chords','bass','melody','pad','arp']){const inst=input.instruments?.[k];if(INSTRUMENTS[inst]&&allowed('instrument:'+inst))s.instruments[k]=inst;}
 return s;
}
export function progression(scale,bar,seed=0){const minor=scale==='minor'||scale==='pentatonic',choices=minor?[[0,5,2,6,0,3,5,4],[0,3,5,4,0,2,6,5],[0,2,5,6,0,5,3,4]]:[[0,4,5,3,0,5,1,4],[0,5,3,4,0,1,3,4],[0,3,4,5,0,5,1,4]];return choices[(seed>>>0)%choices.length][Math.floor(bar/2)%8];}
export function scaleNote(root,scale,degree){const notes=SCALES[scale]||SCALES.minor;return root+12*Math.floor(degree/notes.length)+notes[((degree%notes.length)+notes.length)%notes.length];}
export function campaignMinimumSeconds(){return REGIONS.length*PASSAGES*PASSAGE_SECONDS;}

export const BLESSINGS = {
 edge:{label:'Damage',color:'#f2a197',name:'Keen song',icon:'edge',desc:'13% more weapon damage.',short:'+13% damage'},
 heart:{label:'Health',color:'#9cdbad',name:'Hearthsong',icon:'heart',desc:'18 more maximum health.',short:'+18 health'},
 wind:{label:'Move',color:'#93c7ee',name:'Wandering air',icon:'wind',desc:'5.5% faster footsteps.',short:'+5.5% movement'},
 flow:{label:'Atk speed',color:'#edce83',name:'Quick refrain',icon:'flow',desc:'7% faster attack recovery, up to 45%.',short:'7% faster attacks'}
};
const chimeNames=['Lanternfall','Mossbound','Neonwake','Nightglass','Bitbloom','Oldspark','Tideglass','Sunwoven','Cloudsong','Hushbell','Dawnthread','Firstlight'];
export const WAYCHIMES=REGIONS.flatMap((region,area)=>[3,6].map((passage,stop)=>({id:`${region.id}-${passage}`,name:chimeNames[area*2+stop],area,passage,index:area*2+stop,color:region.accent})));
export function runeAt(area,passage){return WAYCHIMES.find(r=>r.area===area&&r.passage===passage)||null;}
export function cleanRunes(input={}){return Object.fromEntries(WAYCHIMES.filter(r=>Object.hasOwn(input||{},r.id)&&Object.hasOwn(BLESSINGS,input[r.id])).map(r=>[r.id,input[r.id]]));}
export function migrateBoons(boons=[],area=0,passage=0){const reached=WAYCHIMES.filter(r=>r.area<area||r.area===area&&r.passage<=passage);return Object.fromEntries((Array.isArray(boons)?boons:[]).slice(0,reached.length).flatMap((b,i)=>Object.hasOwn(BLESSINGS,b)?[[reached[i].id,b]]:[]));}
export function normalizeUnlocks(input=[]){const valid=new Set([...BASE_UNLOCKS,...UNLOCKS.map(u=>u.id)]);return [...new Set([...BASE_UNLOCKS,...(Array.isArray(input)?input:[]).filter(id=>valid.has(id))])];}
export function freshRunMusic(volume=.65){return safeMusic({...DEFAULT_MUSIC,volume},BASE_UNLOCKS);}
export function difficultyTuning(difficulty,area,passage){
 if(difficulty==='gentle')return {health:1,damage:1,extraEnemies:0,cap:9};
 const p=clamp(area,0,5)+clamp(passage,0,8)/8;
 return {health:1.12+.14*p+.028*p*p,damage:1.08+.13*p+.012*p*p,extraEnemies:1+Math.floor(p*.55),cap:11+Math.floor(p*1.4)};
}
export function fieldMusic(input={},unlocks=BASE_UNLOCKS,area=0){const sound=safeMusic(input,unlocks),region=REGIONS[area]||REGIONS[0];sound.genre=area;if(!unlocks.includes('effect:tempo'))sound.bpm=region.bpm;const regional=region.gift.split(':')[1];if(input?.instruments?.chords===regional)sound.instruments.chords=regional;return sound;}

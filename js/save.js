import {BASE_UNLOCKS,DEFAULT_MUSIC,UNLOCKS,REGIONS,WAYCHIMES,safeMusic,cleanRunes,migrateBoons,normalizeUnlocks,clamp,newSeed,fieldMusic} from './data.js?v=2.3.1';
export const SAVE_KEY='stillwave.archive.v1';
export const RUN_KEY='stillwave.run.v1';
const fresh=()=>({version:2,unlocks:[...BASE_UNLOCKS],runes:{},runs:0,kills:0,bosses:[],cleared:false,steadyCleared:false,bestArea:0,totalSeconds:0,music:safeMusic(DEFAULT_MUSIC,BASE_UNLOCKS),studioSeed:newSeed(),volume:.65,difficulty:'gentle',reducedMotion:false,autoAim:true,muted:false});
export function readArchive(storage=globalThis.localStorage){
 let data;try{data=JSON.parse(storage.getItem(SAVE_KEY));}catch{}const a=fresh();
 if(data&&[1,2].includes(data.version)){
  a.unlocks=normalizeUnlocks(data.unlocks);a.runes=cleanRunes(data.runes);
  a.bosses=(Array.isArray(data.bosses)?data.bosses:[]).filter(x=>REGIONS.some(r=>r.id===x));
  for(const k of ['runs','kills','bestArea','totalSeconds'])a[k]=Number.isFinite(data[k])?Math.max(0,data[k]):0;
  a.steadyCleared=data.steadyCleared===true;a.cleared=data.cleared===true||a.steadyCleared;if(a.cleared)a.unlocks=normalizeUnlocks(UNLOCKS.map(u=>u.id));
  a.difficulty=['gentle','standard'].includes(data.difficulty)?data.difficulty:'gentle';
  a.reducedMotion=data.reducedMotion===true;a.autoAim=data.autoAim!==false;a.muted=data.muted===true;
  a.music=safeMusic(data.music,a.unlocks,a.cleared,a.steadyCleared);a.volume=clamp(Number(data.volume??a.music.volume),0,1);a.music.volume=a.volume;
  a.studioSeed=Number.isFinite(data.studioSeed)?data.studioSeed>>>0:a.studioSeed;
 }
 return a;
}
export function writeArchive(a,storage=globalThis.localStorage){try{storage.setItem(SAVE_KEY,JSON.stringify(a));return true;}catch{return false;}}
export function grantUnlock(target,id){if(!id||target.unlocks.includes(id)||!UNLOCKS.some(u=>u.id===id))return null;target.unlocks.push(id);return UNLOCKS.find(u=>u.id===id);}
export function grantNext(target){const next=UNLOCKS.find(u=>!target.unlocks.includes(u.id)&&u.kind!=='Genre'&&!REGIONS.some(r=>r.gift===u.id));return next?grantUnlock(target,next.id):null;}
export function completeJourney(archive,difficulty){
 const firstSteady=difficulty==='standard'&&!archive.steadyCleared;
 archive.cleared=true;if(difficulty==='standard')archive.steadyCleared=true;
 UNLOCKS.forEach(u=>grantUnlock(archive,u.id));return firstSteady;
}
export function readRun(storage=globalThis.localStorage){
 try{const r=JSON.parse(storage.getItem(RUN_KEY));
  if(!r||![1,2].includes(r.version)||!Number.isInteger(r.area)||r.area<0||r.area>=6||!Number.isInteger(r.passage)||r.passage<0||r.passage>8||!Number.isFinite(r.seed)||!['sword','bow'].includes(r.weapon))return null;
  const run={version:2,seed:r.seed>>>0,weapon:r.weapon,difficulty:r.difficulty==='standard'?'standard':'gentle',area:r.area,passage:r.passage,elapsed:Number.isFinite(r.elapsed)?Math.max(0,r.elapsed):0,kills:Number.isFinite(r.kills)?Math.max(0,r.kills)|0:0,runes:r.version===1?migrateBoons(r.boons,r.area,r.passage):cleanRunes(r.runes),health:Number.isFinite(r.health)&&r.health>0?Math.min(326,r.health):110,herbs:Number.isFinite(r.herbs)?Math.max(0,Math.min(4,r.herbs))|0:3,unlocks:normalizeUnlocks(r.unlocks),musicSeed:Number.isFinite(r.musicSeed)?r.musicSeed>>>0:r.seed>>>0,pendingRune:null};
  if(r.version===1){for(let i=0;i<r.area*4+Math.floor(r.passage/2);i++)grantNext(run);for(let i=0;i<r.area;i++){grantUnlock(run,REGIONS[i].gift);grantUnlock(run,'genre:'+REGIONS[i].id);}}
  run.music=fieldMusic(r.version===1?{...DEFAULT_MUSIC,bpm:REGIONS[r.area].bpm,instruments:{...DEFAULT_MUSIC.instruments,chords:REGIONS[r.area].gift.split(':')[1]}}:r.music,run.unlocks,run.area);
  const pending=WAYCHIMES.find(w=>w.id===r.pendingRune&&w.area===run.area&&w.passage===run.passage);if(pending)run.pendingRune=pending.id;
  return run;
 }catch{return null;}
}
export function mergeRunRunes(archive,run){if(!run)return;archive.runes=cleanRunes({...run.runes,...archive.runes});run.runes={...archive.runes};}
export function writeRun(r,storage=globalThis.localStorage){try{storage.setItem(RUN_KEY,JSON.stringify(r));return true;}catch{return false;}}
export function clearRun(storage=globalThis.localStorage){try{storage.removeItem(RUN_KEY);}catch{}}

import {BASE_UNLOCKS,DEFAULT_MUSIC,UNLOCKS,REGIONS,safeMusic} from './data.js?v=1.0.2';
export const SAVE_KEY='stillwave.archive.v1';
export const RUN_KEY='stillwave.run.v1';
const fresh=()=>({version:1,unlocks:[...BASE_UNLOCKS],runs:0,kills:0,bosses:[],cleared:false,bestArea:0,totalSeconds:0,music:structuredClone(DEFAULT_MUSIC),difficulty:'standard',reducedMotion:false,autoAim:true});
export function readArchive(storage=globalThis.localStorage){
 let data;try{data=JSON.parse(storage.getItem(SAVE_KEY));}catch{}const a=fresh();
 if(data&&data.version===1){const valid=new Set([...BASE_UNLOCKS,...UNLOCKS.map(u=>u.id)]);a.unlocks=[...new Set([...BASE_UNLOCKS,...(Array.isArray(data.unlocks)?data.unlocks:[]).filter(x=>valid.has(x))])];a.bosses=(Array.isArray(data.bosses)?data.bosses:[]).filter(x=>REGIONS.some(r=>r.id===x));for(const k of ['runs','kills','bestArea','totalSeconds'])a[k]=Math.max(0,Number(data[k])||0);a.cleared=data.cleared===true;a.difficulty=['gentle','standard'].includes(data.difficulty)?data.difficulty:'standard';a.reducedMotion=data.reducedMotion===true;a.autoAim=data.autoAim!==false;a.music=safeMusic(data.music,a.unlocks);}
 return a;
}
export function writeArchive(a,storage=globalThis.localStorage){try{storage.setItem(SAVE_KEY,JSON.stringify(a));return true;}catch{return false;}}
export function grantUnlock(a,id){if(!id||a.unlocks.includes(id)||!UNLOCKS.some(u=>u.id===id))return null;a.unlocks.push(id);return UNLOCKS.find(u=>u.id===id);}
export function grantNext(a){const next=UNLOCKS.find(u=>!a.unlocks.includes(u.id)&&u.kind!=='Genre'&&!REGIONS.some(r=>r.gift===u.id));return next?grantUnlock(a,next.id):null;}
export function readRun(storage=globalThis.localStorage){try{const r=JSON.parse(storage.getItem(RUN_KEY));if(r?.version===1&&Number.isInteger(r.area)&&r.area>=0&&r.area<6&&Number.isInteger(r.passage)&&r.passage>=0&&r.passage<=8&&Number.isFinite(r.seed)&&['sword','bow'].includes(r.weapon))return {version:1,seed:r.seed>>>0,weapon:r.weapon,difficulty:r.difficulty==='gentle'?'gentle':'standard',area:r.area,passage:r.passage,elapsed:Number.isFinite(r.elapsed)?Math.max(0,r.elapsed):0,kills:Number.isFinite(r.kills)?Math.max(0,r.kills)|0:0,boons:(Array.isArray(r.boons)?r.boons:[]).filter(b=>['heart','edge','wind','flow'].includes(b)).slice(0,12),health:Number.isFinite(r.health)&&r.health>0?Math.min(326,r.health):110,herbs:Number.isFinite(r.herbs)?Math.max(0,Math.min(4,r.herbs))|0:3};}catch{}return null;}
export function writeRun(r,storage=globalThis.localStorage){try{storage.setItem(RUN_KEY,JSON.stringify(r));return true;}catch{return false;}}
export function clearRun(storage=globalThis.localStorage){try{storage.removeItem(RUN_KEY);}catch{}}

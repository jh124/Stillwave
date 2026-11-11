import test from 'node:test';
import assert from 'node:assert/strict';
import {BASE_UNLOCKS,DEFAULT_MUSIC,UNLOCKS,LAYERS,REGIONS,seeded,safeMusic,randomizeMusic} from '../js/data.js';

const all=[...BASE_UNLOCKS,...UNLOCKS.map(unlock=>unlock.id)];

test('studio randomization preserves every exact volume, including muted faders, without editing the previous mix',()=>{
 const original={...structuredClone(DEFAULT_MUSIC),volume:0,levels:{drums:0,chords:.175,bass:.83,melody:1,pad:.004,arp:.47}};
 const before=structuredClone(original);
 for(let seed=0;seed<64;seed++){
  const sound=randomizeMusic(original,all,true,true,seeded(seed));
  assert.equal(sound.volume,original.volume);
  assert.deepEqual(sound.levels,original.levels);
 }
 assert.deepEqual(original,before);
});

test('randomized controls respect discoveries and keep Steady rewards locked until a Steady clear',()=>{
 for(const unlocks of [BASE_UNLOCKS,[...BASE_UNLOCKS,'key:C','track:bass','instrument:rhodes','effect:tempo'],all])for(let seed=0;seed<64;seed++){
  const sound=randomizeMusic(DEFAULT_MUSIC,unlocks,false,false,seeded(seed));
  assert.deepEqual(sound,safeMusic(sound,unlocks));
  assert.equal(sound.bloom,0);assert.equal(sound.chorus,0);
  assert.ok(LAYERS.some(layer=>layer!=='drums'&&sound.layers[layer]));
 }
 const fresh=randomizeMusic(DEFAULT_MUSIC,BASE_UNLOCKS,false,false,seeded(15));
 assert.equal(fresh.genre,0);assert.equal(fresh.bpm,76);assert.equal(fresh.key,'A');assert.equal(fresh.meter,'4/4');
 assert.equal(fresh.delay,DEFAULT_MUSIC.delay);
 assert.equal(randomizeMusic(DEFAULT_MUSIC,all,true,false,seeded(15)).bloom,0);
 assert.equal(randomizeMusic(DEFAULT_MUSIC,all,true,false,seeded(15)).chorus,0);
});

test('a complete studio varies every available control while staying within the chill ranges',()=>{
 const sounds=Array.from({length:128},(_,seed)=>randomizeMusic(DEFAULT_MUSIC,all,true,true,seeded(seed)));
 for(const sound of sounds){
  assert.deepEqual(sound,safeMusic(sound,all,true,true));
  assert.ok(Number.isInteger(sound.bpm)&&sound.bpm>=60&&sound.bpm<=96);
  assert.ok(sound.density>=.2&&sound.density<=1);
 }
 assert.equal(new Set(sounds.map(sound=>sound.genre)).size,REGIONS.length);
 for(const key of ['bpm','key','scale','meter','swing','density','reverb','delay','warmth','bloom','chorus'])assert.ok(new Set(sounds.map(sound=>sound[key])).size>1,key);
 for(const layer of LAYERS)assert.equal(new Set(sounds.map(sound=>sound.layers[layer])).size,2,layer);
 for(const layer of LAYERS.filter(layer=>layer!=='drums'))assert.ok(new Set(sounds.map(sound=>sound.instruments[layer])).size>1,layer);
});

test('a roll that switches off all tracks still leaves a musical voice without raising its volume',()=>{
 const original={...structuredClone(DEFAULT_MUSIC),levels:{...DEFAULT_MUSIC.levels,chords:0}};
 const sound=randomizeMusic(original,BASE_UNLOCKS,false,false,()=>.99);
 assert.equal(sound.layers.chords,true);assert.equal(sound.layers.drums,false);
 assert.equal(sound.levels.chords,0);assert.equal(sound.volume,original.volume);
});

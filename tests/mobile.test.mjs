import test from 'node:test';
import assert from 'node:assert/strict';
import {MusicEngine,barSeconds} from '../js/music.js';
import {DEFAULT_MUSIC} from '../js/data.js';
import {mobileViewport,portraitBlocked,requestLandscapeLock} from '../js/mobile.js';

const settings=()=>({...structuredClone(DEFAULT_MUSIC),layers:Object.fromEntries(Object.keys(DEFAULT_MUSIC.layers).map(key=>[key,false]))});
function harness(plans=['running']){
 const events=[],contexts=[];let sessionType='auto';
 const session={get type(){return sessionType;},set type(value){events.push('session:'+value);sessionType=value;}};
 class Context{
  constructor(){this.state='suspended';this.sampleRate=44100;this.currentTime=0;this.destination={};this.plan=plans[contexts.length]||'running';contexts.push(this);events.push('context');}
  resume(){events.push('resume');if(this.plan==='pending'){this.state='interrupted';return new Promise(()=>{});}if(this.plan==='reject')return Promise.reject(new Error('gesture required'));this.state='running';return Promise.resolve();}
  suspend(){this.state='suspended';this.onstatechange?.();return Promise.resolve();}
  close(){this.state='closed';this.closed=true;return Promise.resolve();}
  createBuffer(){return {};}
  createBufferSource(){return {connect(){},disconnect(){},start(){events.push('prime');}};}
 }
 const platform={AudioContext:Context,navigator:{audioSession:session}};
 class Engine extends MusicEngine{
  createGraph(){events.push('graph');const param=()=>({setTargetAtTime(value){this.value=value;}});return {filter:{frequency:param()},wet:{gain:param()},delayMix:{gain:param()},feedback:{gain:param()},delay:{delayTime:param()},chorusMix:{gain:param()},master:{gain:param()}};}
 }
 return {events,contexts,platform,session,engine:new Engine(settings(),441,{platform,resumeTimeout:15})};
}

test('audio requests playback routing and resumes inside the initiating call before graph setup',async()=>{
 const h=harness();try{const started=h.engine.start();assert.equal(h.session.type,'playback');assert.ok(h.events.indexOf('resume')<h.events.indexOf('graph'));assert.ok(h.events.includes('prime'));assert.equal(await started,true);assert.equal(h.engine.audible,true);}finally{await h.engine.dispose();}
});
test('an interrupted resume settles and a second gesture can replace the stuck context',async()=>{
 const h=harness(['pending','running']);try{assert.equal(await h.engine.start(),false);assert.equal(h.engine.audible,false);const original=h.contexts[0];assert.equal(await h.engine.start(),true);assert.equal(original.closed,true);assert.equal(h.contexts.length,2);assert.equal(h.session.type,'playback');assert.equal(h.engine.seed,441);assert.equal(h.engine.settings.volume,.65);}finally{await h.engine.dispose();}
});
test('duplicate taps share an in-flight audio unlock instead of creating extra contexts',async()=>{
 const h=harness(['pending']);try{const first=h.engine.start(),second=h.engine.start();assert.equal(first,second);assert.equal(h.contexts.length,1);await first;}finally{await h.engine.dispose();}
});
test('suspension, mute and zero volume reflect actual audible state and can recover',async()=>{
 const h=harness();try{await h.engine.start();await h.engine.suspend();assert.equal(h.engine.audible,false);assert.equal(await h.engine.resume(),true);h.engine.mute(true);assert.equal(h.engine.audible,false);h.engine.mute(false);h.engine.set({...h.engine.settings,volume:0});assert.equal(h.engine.audible,false);h.engine.set({...h.engine.settings,volume:.4});assert.equal(h.engine.audible,true);}finally{await h.engine.dispose();}
});
test('a manual sound restart rebuilds audio while retaining the arrangement and mix',async()=>{
 const h=harness();try{await h.engine.start();h.engine.set({...h.engine.settings,bpm:88,chorus:.4});const original=h.engine.ctx;assert.equal(await h.engine.start({repair:true}),true);assert.equal(original.closed,true);assert.equal(h.engine.settings.bpm,88);assert.equal(h.engine.settings.chorus,.4);assert.equal(h.engine.seed,441);assert.ok(h.events.includes('session:auto'));}finally{await h.engine.dispose();}
});
test('old scheduled bars are skipped after a long interruption instead of playing a burst',async()=>{
 const h=harness();try{await h.engine.start();h.engine.ctx.currentTime=9000;h.engine.next=0;const before=h.engine.bar;h.engine.tick();assert.equal(h.engine.bar,before+1);assert.ok(h.engine.next>=9000);assert.ok(h.engine.next<9000+barSeconds(h.engine.settings)+.2);}finally{await h.engine.dispose();}
});
test('audio works with the WebKit constructor and without AudioSession support',async()=>{
 const h=harness();h.platform.webkitAudioContext=h.platform.AudioContext;delete h.platform.AudioContext;delete h.platform.navigator.audioSession;
 try{assert.equal(await h.engine.start(),true);assert.equal(h.engine.audible,true);}finally{await h.engine.dispose();}
});
test('phones and touch tablets use the landscape guard while desktop keeps its normal layout',()=>{
 assert.equal(mobileViewport(844,390),true);assert.equal(portraitBlocked(844,390),false);assert.equal(portraitBlocked(390,844),true);assert.equal(portraitBlocked(768,1024,true),true);assert.equal(mobileViewport(1363,936),false);assert.equal(portraitBlocked(936,1363),false);
});
test('native landscape lock follows fullscreen and unsupported browsers fail gracefully',async()=>{
 const calls=[],doc={fullscreenElement:null,documentElement:{requestFullscreen:async()=>{calls.push('fullscreen');doc.fullscreenElement={};}}};
 assert.equal(await requestLandscapeLock(doc,{lock:async value=>calls.push(value)}),true);assert.deepEqual(calls,['fullscreen','landscape']);assert.equal(await requestLandscapeLock(doc,{}),false);assert.equal(await requestLandscapeLock(doc,{lock:async()=>{throw new Error('unsupported');}}),false);
});

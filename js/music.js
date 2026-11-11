import {REGIONS,KEYS,METERS,seeded,scaleNote,progression,clamp} from './data.js?v=2.5.1';
export function beatSeconds(s){return 60/clamp(s.bpm,60,96)*(s.meter==='6/8'?.5:1);}
export function barSeconds(s){return beatSeconds(s)*METERS[s.meter];}
export function grooveTime(time,s){
 const beat=beatSeconds(s),phase=(time/beat)%1;
 // Delay the second eighth of each beat, including its subdivisions.
 // At maximum swing the eighths form a relaxed 2:1 shuffle.
 return time+(phase>=.5-1e-8&&phase<1-1e-8?beat*(clamp(s.swing||0,0,.28)/.28)/6:0);
}
export function delayParameters(s){const amount=clamp(s.delay||0,0,.45)/.45;return {time:beatSeconds(s)*.75,mix:amount*.60,feedback:.20+amount*.32};}
export function composeBar(s,seed,bar){
 const rng=seeded((seed+Math.floor(bar/4)*6719)>>>0),detail=seeded((seed+bar*7919)>>>0);
 const beats=METERS[s.meter]||4,beat=beatSeconds(s),step=beat/4,steps=beats*4,root=KEYS[s.key]||57,deg=progression(s.scale,bar,seed),events=[];
 const density=s.density??.62,genre=s.genre|0;
 const push=(layer,t,n,d,v=.5,inst)=>{if(s.layers[layer])events.push({layer,t:grooveTime(Math.max(0,t),s),note:n,duration:d,velocity:v*(s.levels[layer]??.6),instrument:inst||s.instruments[layer]});};
 const chord=[deg,deg+2,deg+4,...(genre===0||genre===3||genre===4?[deg+6]:[])],inversion=Math.floor(rng()*3);
 const groove=i=>i*step;
 if(s.layers.chords){const times=genre===3?[0,beat*1.5,beat*2.5].filter(t=>t<beat*beats):[0];for(const t of times){chord.forEach((n,i)=>push('chords',t+i*.008,scaleNote(root,s.scale,n)+(i<inversion?12:0),genre===3?beat*.9:beat*beats*.86,.27+detail()*.06));const bloom=clamp(s.bloom||0,0,1);if(bloom>0)for(const [i,n] of [deg+6,deg+8].filter(n=>!chord.includes(n)).entries())push('chords',t+.032+i*.008,scaleNote(root,s.scale,n),genre===3?beat*.9:beat*beats*.86,.24*bloom);}}
 if(s.layers.pad)for(const n of [deg,deg+4,deg+9])push('pad',0,scaleNote(root-12,s.scale,n),beat*beats*1.1,.19);
 if(s.layers.bass){for(let b=0;b<beats;b++){if(b===0||b===Math.floor(beats/2)||(genre===3&&b===beats-1))push('bass',b*beat,scaleNote(root-24,s.scale,deg+(b===beats-1?4:0)),beat*(genre===4?1.6:.8),.62);}}
 if(s.layers.drums){for(let i=0;i<steps;i++){
  const b=i/4;
  if(i===0||(genre!==4&&i===Math.floor(beats/2)*4)||(genre===0&&i===steps-3&&detail()<.38))push('drums',groove(i),'kick',.25,genre===4?.35:.67);
  if((s.meter==='6/8'&&i===12)||(s.meter!=='6/8'&&(b===1||b===3)))push('drums',groove(i),'snare',.18,genre===3?.25:.43);
  if(i%2===0&&genre!==4&&detail()<.60+density*.35)push('drums',groove(i),'hat',.06,i%4===0?.19:.12);
  if(genre===3&&(i===6||i===14))push('drums',groove(i),'rim',.1,.27);
  if(genre===4&&i===Math.floor(steps/2))push('drums',groove(i),'hat',.12,.07);
 }}
 const motif=Array.from({length:8},()=>[0,2,4,6,7,9,11][Math.floor(rng()*7)]);
 if(s.layers.melody)for(let i=0;i<steps;i+=genre===4?8:2){if(detail()>density*(genre===4?.7:.66))continue;const note=motif[(Math.floor(i/2)+bar%4)%8];push('melody',groove(i),scaleNote(root+12,s.scale,deg+note),step*(genre===4?9:2+detail()*3),.30+detail()*.12);}
 if(s.layers.arp)for(let i=0;i<steps;i+=2){if(detail()>.50+density*.45)continue;const n=chord[(Math.floor(i/2)+bar)%chord.length];push('arp',groove(i),scaleNote(root+12,s.scale,n),step*1.65,.21);}
 return events.sort((a,b)=>a.t-b.t);
}
function noise(ctx){const b=ctx.createBuffer(1,ctx.sampleRate,ctx.sampleRate),d=b.getChannelData(0),rng=seeded(801);for(let i=0;i<d.length;i++)d[i]=rng()*2-1;return b;}
function impulse(ctx){const len=Math.floor(ctx.sampleRate*2.7),b=ctx.createBuffer(2,len,ctx.sampleRate),rng=seeded(91);for(let c=0;c<2;c++){let last=0;const d=b.getChannelData(c);for(let i=0;i<len;i++){last=last*.45+(rng()*2-1)*.55;d[i]=last*Math.pow(1-i/len,3);}}return b;}
export function createMusicGraph(ctx,s,destination){
 const input=ctx.createGain(),filter=ctx.createBiquadFilter();filter.type='lowpass';filter.frequency.value=11000-(s.warmth||0)*8000;filter.Q.value=.45;
 const dry=ctx.createGain();dry.gain.value=.84;const convolver=ctx.createConvolver();convolver.buffer=impulse(ctx);const wet=ctx.createGain();wet.gain.value=(s.reverb||0)*.50;
 const echo=delayParameters(s),delay=ctx.createDelay(2),feedback=ctx.createGain(),delayMix=ctx.createGain(),echoLow=ctx.createBiquadFilter(),echoHigh=ctx.createBiquadFilter();delay.delayTime.value=echo.time;feedback.gain.value=echo.feedback;delayMix.gain.value=echo.mix;echoLow.type='lowpass';echoLow.frequency.value=3000;echoLow.Q.value=.4;echoHigh.type='highpass';echoHigh.frequency.value=160;echoHigh.Q.value=.4;
 const compressor=ctx.createDynamicsCompressor();compressor.threshold.value=-20;compressor.knee.value=20;compressor.ratio.value=3.2;compressor.attack.value=.012;compressor.release.value=.3;
 // A pair of slow, independently modulated taps adds a soft stereo chorus.
 // The original dry path is unchanged, so zero is a complete bypass.
 const chorusMix=ctx.createGain(),chorusStereo=ctx.createChannelMerger(2);chorusMix.gain.value=clamp(s.chorus||0,0,1)*.28;
 const chorusVoices=[{time:.021,rate:.17,depth:.003},{time:.029,rate:.13,depth:.0037}].map((voice,channel)=>{
  const tap=ctx.createDelay(.1),lfo=ctx.createOscillator(),depth=ctx.createGain();tap.delayTime.value=voice.time;lfo.frequency.value=voice.rate;depth.gain.value=voice.depth;
  lfo.connect(depth);depth.connect(tap.delayTime);filter.connect(tap);tap.connect(chorusStereo,0,channel);lfo.start();return {tap,lfo,depth};
 });chorusStereo.connect(chorusMix);chorusMix.connect(compressor);
 const master=ctx.createGain();master.gain.value=(s.volume??.65)*.8;
 input.connect(filter);filter.connect(dry);dry.connect(compressor);filter.connect(convolver);convolver.connect(wet);wet.connect(compressor);filter.connect(delay);delay.connect(echoLow);echoLow.connect(echoHigh);echoHigh.connect(feedback);feedback.connect(delay);echoHigh.connect(delayMix);delayMix.connect(compressor);compressor.connect(master);master.connect(destination);
 return {input,filter,wet,delay,feedback,delayMix,chorusMix,chorusVoices,master,noise:noise(ctx)};
}
function percussion(ctx,out,e,t,buf){
 const gain=ctx.createGain();gain.connect(out);const v=e.velocity;
 if(e.note==='kick'){const osc=ctx.createOscillator();osc.type='sine';osc.frequency.setValueAtTime(115,t);osc.frequency.exponentialRampToValueAtTime(44,t+.16);gain.gain.setValueAtTime(.001,t);gain.gain.linearRampToValueAtTime(v*.8,t+.005);gain.gain.exponentialRampToValueAtTime(.001,t+.29);osc.connect(gain);osc.start(t);osc.stop(t+.32);}
 else{const source=ctx.createBufferSource();source.buffer=buf;const f=ctx.createBiquadFilter();f.type=e.note==='hat'?'highpass':'bandpass';f.frequency.value=e.note==='hat'?6200:e.note==='rim'?1900:1650;f.Q.value=e.note==='rim'?6:.65;source.connect(f);f.connect(gain);const length=e.note==='hat'?.065:e.note==='rim'?.07:.17;gain.gain.setValueAtTime(Math.max(.001,v*.44),t);gain.gain.exponentialRampToValueAtTime(.001,t+length);source.start(t);source.stop(t+length+.01);if(e.note==='snare'){const o=ctx.createOscillator(),g=ctx.createGain();o.frequency.value=175;g.gain.setValueAtTime(v*.19,t);g.gain.exponentialRampToValueAtTime(.001,t+.12);o.connect(g);g.connect(out);o.start(t);o.stop(t+.13);}}
}
function tone(ctx,out,e,t){
 const f=440*Math.pow(2,(e.note-69)/12),v=Math.max(.001,e.velocity),inst=e.instrument||'felt',duration=Math.max(.07,e.duration),pad=e.layer==='pad',bass=e.layer==='bass';
 const g=ctx.createGain(),filter=ctx.createBiquadFilter();filter.type='lowpass';filter.frequency.setValueAtTime(pad?1100:bass?650:inst==='analog'?1500:inst==='chip'?1800:5500,t);filter.Q.value=.4;g.connect(filter);filter.connect(out);
 const attack=pad?.65:inst==='analog'?.055:.008,release=pad?.8:inst==='glass'?.8:.23,end=t+duration+release;
 g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(v*(pad?.65:bass?.75:.57),t+attack);g.gain.exponentialRampToValueAtTime(v*(pad?.40:.10),t+Math.max(attack+.01,duration));g.gain.exponentialRampToValueAtTime(.0001,end);
 let parts=inst==='glass'?[[1,.8],[2.76,.10],[5.4,.035]]:inst==='bell'?[[1,.8],[2,.18],[3,.045]]:inst==='rhodes'?[[1,.8],[2,.2],[3,.055]]:inst==='marimba'?[[1,.9],[4,.12]]:inst==='felt'?[[1,.85],[2,.12],[3,.035]]:inst==='analog'?[[1,.45],[1.003,.36]]:[[1,1]];
 for(const [ratio,amp]of parts){const o=ctx.createOscillator(),mix=ctx.createGain();o.type=inst==='analog'?'sawtooth':inst==='chip'?'square':['guitar','pluck','round'].includes(inst)?'triangle':'sine';o.frequency.value=f*ratio;mix.gain.value=amp;o.connect(mix);mix.connect(g);o.start(t);o.stop(end+.02);}
}
export function scheduleBar(ctx,graph,s,seed,bar,start,limit=Infinity){for(const e of composeBar(s,seed,bar)){if(start+e.t>=limit||e.velocity<=0)continue;if(e.layer==='drums')percussion(ctx,graph.input,e,start+e.t,graph.noise);else tone(ctx,graph.input,e,start+e.t);}}
export function encodeWav(channels,sampleRate){const length=channels[0].length,buffer=new ArrayBuffer(44+length*channels.length*2),v=new DataView(buffer);const text=(off,s)=>{for(let i=0;i<s.length;i++)v.setUint8(off+i,s.charCodeAt(i));};text(0,'RIFF');v.setUint32(4,buffer.byteLength-8,true);text(8,'WAVE');text(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,channels.length,true);v.setUint32(24,sampleRate,true);v.setUint32(28,sampleRate*channels.length*2,true);v.setUint16(32,channels.length*2,true);v.setUint16(34,16,true);text(36,'data');v.setUint32(40,length*channels.length*2,true);let off=44;for(let i=0;i<length;i++)for(let c=0;c<channels.length;c++){const sample=clamp(channels[c][i],-1,1);v.setInt16(off,Math.round(sample*(sample<0?32768:32767)),true);off+=2;}return buffer;}
export class MusicEngine{
 constructor(settings,seed,{platform=globalThis,resumeTimeout=1200}={}){this.settings=structuredClone(settings);this.seed=seed;this.platform=platform;this.resumeTimeout=resumeTimeout;this.ctx=null;this.graph=null;this.bar=0;this.next=0;this.muted=false;this.requested=false;this.failed=false;this.pending=null;this.timer=null;this.onBar=()=>{};this.onStateChange=()=>{};}
 get running(){return this.ctx?.state==='running';}
 get audible(){return this.running&&!this.muted&&this.settings.volume>0;}
 notify(){this.onStateChange(this.ctx?.state||'idle');}
 playbackSession(repair=false){try{const session=this.platform.navigator?.audioSession;if(session){if(repair)session.type='auto';session.type='playback';}}catch{}}
 createContext(){const C=this.platform.AudioContext||this.platform.webkitAudioContext;if(!C)throw new Error('This browser does not support Web Audio.');return new C();}
 createGraph(ctx){return createMusicGraph(ctx,this.settings,ctx.destination);}
 primeContext(ctx){
  // Start an inaudible source inside the tap, before yielding to any promise.
  const source=ctx.createBufferSource();source.buffer=ctx.createBuffer(1,1,ctx.sampleRate);source.connect(ctx.destination);source.onended=()=>source.disconnect();source.start(0);
 }
 discardContext(){const old=this.ctx;this.ctx=null;this.graph=null;this.pending=null;if(this.timer){clearInterval(this.timer);this.timer=null;}if(old){old.onstatechange=null;try{return Promise.resolve(old.close()).catch(()=>{});}catch{}}return Promise.resolve();}
 start({repair=false}={}){
  this.requested=true;if(this.pending&&!repair)return this.pending;
  this.playbackSession(repair||this.failed);
  if(repair||this.ctx?.state==='closed'||this.failed&&!this.running)this.discardContext();
  if(!this.ctx){const ctx=this.createContext();this.ctx=ctx;ctx.onstatechange=()=>{if(this.ctx!==ctx)return;if(ctx.state==='running'&&this.graph){this.next=ctx.currentTime+.04;this.tick();}this.notify();};}
  const ctx=this.ctx;
  // Safari must receive resume() synchronously from the initiating gesture.
  let resumed;try{resumed=ctx.resume();this.primeContext(ctx);if(!this.graph)this.graph=this.createGraph(ctx);}catch(error){this.failed=true;this.notify();return Promise.reject(error);}
  this.updateGraph();if(!this.timer)this.timer=setInterval(()=>this.tick(),40);this.notify();
  let timeout;
  const pending=Promise.race([Promise.resolve(resumed).then(()=>ctx.state==='running',()=>false),new Promise(resolve=>{timeout=setTimeout(()=>resolve(ctx.state==='running'),this.resumeTimeout);})]).then(ok=>{
   if(this.ctx===ctx){this.failed=!ok;if(ok){this.next=ctx.currentTime+.04;this.tick();}this.notify();}return ok;
  }).finally(()=>{clearTimeout(timeout);if(this.pending===pending)this.pending=null;});
  this.pending=pending;return pending;
 }
 tick(){if(!this.running||!this.graph)return;const now=this.ctx.currentTime;if(this.next<now-.08||this.next>now+barSeconds(this.settings)*2)this.next=now+.04;let scheduled=0;while(this.next<now+.16&&scheduled++<2){const s=this.settings;this.updateGraph();scheduleBar(this.ctx,this.graph,s,this.seed,this.bar,this.next);this.onBar(this.bar,s,this.next);this.next+=barSeconds(s);this.bar++;}}
 updateGraph(){if(!this.graph)return;const now=this.ctx.currentTime,g=this.graph,s=this.settings,echo=delayParameters(s);for(const [param,val]of [[g.filter.frequency,11000-s.warmth*8000],[g.wet.gain,s.reverb*.5],[g.delayMix.gain,echo.mix],[g.feedback.gain,echo.feedback],[g.delay.delayTime,echo.time],[g.chorusMix.gain,clamp(s.chorus||0,0,1)*.28],[g.master.gain,this.muted?0:s.volume*.8]])param.setTargetAtTime(val,now,.2);}
 set(s){this.settings=structuredClone(s);this.updateGraph();this.notify();}
 reseed(seed){this.seed=seed;}
 mute(m){this.muted=m;this.updateGraph();this.notify();}
 async suspend(){try{if(this.ctx&&this.ctx.state!=='closed')await this.ctx.suspend();}catch{}this.notify();}
 resume(){return this.requested?this.start():Promise.resolve(false);}
 async dispose(){this.requested=false;await this.discardContext();this.notify();}
 sfx(kind){if(!this.ctx||this.muted||!this.running)return;const t=this.ctx.currentTime;const notes=kind==='unlock'?[72,76,79,84]:kind==='heal'?[69,76]:kind==='hit'?[48]:kind==='dash'?[62]:[55];notes.forEach((n,i)=>tone(this.ctx,this.graph.input,{note:n,duration:kind==='unlock'?.3:.06,velocity:kind==='hit'?.045:.10,instrument:'bell',layer:'melody'},t+i*.085));}
}

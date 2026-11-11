import {WORLD,REGIONS,WEAPONS,PASSAGES,PASSAGE_SECONDS,seeded,newSeed,clamp} from './data.js?v=1.0.2';
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
export function placeEchoShrines(rng,spawn){
 const shrines=[],exit={x:WORLD.w*.5,y:170};
 const add=p=>{if(distance(p,spawn)<210||distance(p,exit)<175||shrines.some(s=>distance(p,s)<330))return;shrines.push({...p,active:false});};
 for(let i=0;i<96&&shrines.length<3;i++)add({x:WORLD.w*(.13+rng()*.74),y:WORLD.h*(.20+rng()*.65)});
 // Bounded fallback also handles a degenerate random source without hanging.
 for(const [x,y]of [[.18,.25],[.82,.25],[.18,.80],[.82,.80],[.5,.34]]){if(shrines.length===3)break;add({x:x*WORLD.w,y:y*WORLD.h});}
 return shrines;
}
export class Journey{
 constructor({seed=newSeed(),weapon='sword',difficulty='standard',area=0,passage=0,elapsed=0,kills=0,boons=[],health=110,herbs=3,onEvent=()=>{}}={}){
  Object.assign(this,{seed,weapon,difficulty,area,passage,elapsed,kills,boons,onEvent});this.rng=seeded(seed);this.state='playing';this.player={x:WORLD.w/2,y:WORLD.h/2,r:17,hp:health,maxHp:110,invincible:1.5,attack:0,dash:0,dashTime:0,dx:1,dy:0,facing:0,combo:0,herbs:clamp(herbs,0,4)};this.rebuildStats();this.enterRoom();
 }
 rebuildStats(){const p=this.player;p.maxHp=110+this.boons.filter(b=>b==='heart').length*18;p.hp=Math.min(p.maxHp,p.hp);this.damageBonus=1+this.boons.filter(b=>b==='edge').length*.13;this.speedBonus=1+this.boons.filter(b=>b==='wind').length*.055;this.coolBonus=1-this.boons.filter(b=>b==='flow').length*.07;}
 enterRoom(){
  const r=seeded((this.seed+this.area*10007+this.passage*1031)>>>0);this.roomRng=r;this.roomTime=0;this.wave=0;this.enemies=[];this.projectiles=[];this.telegraphs=[];this.effects=[];this.pickups=[];this.attackArcs=[];this.portal=false;this.echoes=0;this.roomKills=0;this.roomDamage=0;this.guardianDefeated=false;this.player.x=WORLD.w/2;this.player.y=WORLD.h*.68;this.player.invincible=2;
  this.isBoss=this.passage===PASSAGES;this.obstacles=[];this.decor=[];
  for(let i=0;i<48;i++){const x=100+r()*(WORLD.w-200),y=90+r()*(WORLD.h-180);if(Math.hypot(x-WORLD.w/2,y-WORLD.h*.68)<100)continue;const edge=x<260||x>WORLD.w-260||y<200||y>WORLD.h-160;this.decor.push({x,y,kind:Math.floor(r()*6),scale:.7+r()*.6,phase:r()*6.28,edge});}
  this.shrines=this.isBoss?[]:placeEchoShrines(r,this.player);
  this.roomFlavor=this.isBoss?'guardian':['Lantern walk','Wildflower drift','Quiet crossing','A slower current','Silver branches','The listening path','A little clearing','Echoes at dusk'][(this.passage+this.area*3)%8];
  this.roomModifier=this.isBoss?'none':['none','bloom','breeze'][Math.floor(r()*3)];
  this.onEvent({type:'room',area:this.area,passage:this.passage,boss:this.isBoss});
  if(this.isBoss)this.spawnBoss();else{this.spawnWave();if(this.roomModifier==='bloom')this.pickups.push({x:WORLD.w*.5,y:WORLD.h*.45,kind:'health',r:12,age:0});}
 }
 spawnEnemy(kind,special=false,x,y){
  const rng=this.roomRng,p=this.player;if(x===undefined){const angle=rng()*Math.PI*2;x=clamp(p.x+Math.cos(angle)*(360+rng()*160),120,WORLD.w-120);y=clamp(p.y+Math.sin(angle)*(300+rng()*120),120,WORLD.h-120);}
  const cfg={sprout:{hp:36,speed:57,r:18,damage:8},moth:{hp:29,speed:84,r:18,damage:6},snail:{hp:63,speed:38,r:22,damage:11},wisp:{hp:31,speed:45,r:17,damage:7},special:{hp:125,speed:49,r:25,damage:10}}[kind];
  const scale=1+this.area*.08+this.passage*.015;const e={x,y,...cfg,hp:cfg.hp*scale,maxHp:cfg.hp*scale,kind,special,phase:rng()*6.28,age:0,cooldown:1.3+rng()*1.5,windup:0,flash:0,knockX:0,knockY:0,alive:true,spawn:1.1};if(special){const variants=['chord','tempo','reverb','meter'];e.variant=variants[(Math.floor(this.passage/2)+this.area)%4];e.specialName={chord:'Chordkeeper',tempo:'Tempo Wanderer',reverb:'Echo Weaver',meter:'Meter Warden'}[e.variant];if(e.variant==='tempo')e.speed=75;if(e.variant==='meter')e.hp=e.maxHp*=1.2;}this.enemies.push(e);return e;
 }
 spawnWave(){
  const kinds=['sprout','moth','snail','wisp'];const count=3+Math.min(2,Math.floor(this.area/2))+(this.wave%3===2?1:0);
  for(let i=0;i<count;i++)this.spawnEnemy(kinds[(i+this.wave+this.passage+Math.floor(this.roomRng()*3))%4]);
  if(this.passage%2===1&&this.wave===3)this.spawnEnemy('special',true);
  this.wave++;this.onEvent({type:'wave',wave:this.wave});
 }
 spawnBoss(){const e=this.spawnEnemy('special',false,WORLD.w/2,WORLD.h*.3);e.boss=true;e.kind=REGIONS[this.area].bossKind;e.r=48;e.hp=e.maxHp=1500+this.area*180;e.speed=42+this.area*3;e.damage=13;e.cooldown=3.2;e.phaseNo=1;e.special=false;this.boss=e;this.onEvent({type:'boss',name:REGIONS[this.area].boss});}
 checkpoint(){return {version:1,seed:this.seed,weapon:this.weapon,difficulty:this.difficulty,area:this.area,passage:this.passage,elapsed:this.elapsed,kills:this.kills,boons:[...this.boons],health:this.player.hp,herbs:this.player.herbs};}
 input(input,dt){
  const p=this.player;let x=input.x||0,y=input.y||0,len=Math.hypot(x,y);if(len>1){x/=len;y/=len;len=1;}if(len>.04){p.dx=x/(len||1);p.dy=y/(len||1);}const speed=193*this.speedBonus*(this.roomModifier==='breeze'?1.10:1);
  if(input.dash&&p.dash<=0&&p.dashTime<=0){p.dashTime=.22;p.dash=2.0;p.invincible=Math.max(p.invincible,.36);this.onEvent({type:'dash'});}
  if(p.dashTime>0){p.x+=p.dx*speed*3.7*dt;p.y+=p.dy*speed*3.7*dt;this.effects.push({kind:'trail',x:p.x,y:p.y,life:.35,max:.35});}else{p.x+=x*speed*dt;p.y+=y*speed*dt;}
  p.x=clamp(p.x,80,WORLD.w-80);p.y=clamp(p.y,95,WORLD.h-70);
  for(const o of this.obstacles){const d=distance(p,o),min=p.r+o.r;if(d<min&&d>.01){p.x+=(p.x-o.x)/d*(min-d);p.y+=(p.y-o.y)/d*(min-d);}}
  if(Number.isFinite(input.aimX)&&Number.isFinite(input.aimY))p.facing=Math.atan2(input.aimY-p.y,input.aimX-p.x);
  if(input.attack&&p.attack<=0)this.attack(input);
  if(input.heal)this.heal();
  if(input.interact){if(this.portal&&distance(p,{x:WORLD.w*.5,y:170})<115)this.advance();else this.activateShrine();}
 }
 attack(input){
  const p=this.player,w=WEAPONS[this.weapon];let target=null;
  if(input.autoAim){target=this.enemies.filter(e=>e.alive&&e.spawn<=0).sort((a,b)=>distance(p,a)-distance(p,b))[0];if(target&&distance(p,target)<w.range+30)p.facing=Math.atan2(target.y-p.y,target.x-p.x);}
  p.attack=w.cooldown*Math.max(.55,this.coolBonus);let hit=false;
  if(this.weapon==='sword'){
   this.attackArcs.push({x:p.x,y:p.y,a:p.facing,life:.24,max:.24,r:w.range});
   for(const e of this.enemies){if(!e.alive||e.spawn>0)continue;const a=Math.atan2(e.y-p.y,e.x-p.x),diff=Math.atan2(Math.sin(a-p.facing),Math.cos(a-p.facing));if(distance(p,e)<w.range+e.r&&Math.abs(diff)<1.3){this.hitEnemy(e,w.damage*this.damageBonus,p.facing,155);hit=true;}}
   if(hit)p.combo++;if(hit&&p.combo%3===0)p.hp=Math.min(p.maxHp,p.hp+1);
  }else{this.projectiles.push({x:p.x+Math.cos(p.facing)*23,y:p.y+Math.sin(p.facing)*23,vx:Math.cos(p.facing)*690,vy:Math.sin(p.facing)*690,life:w.range/690,kind:'arrow',damage:w.damage*this.damageBonus,pierce:2,hit:new Set(),r:7});}
  this.effects.push({kind:'attack',x:p.x,y:p.y,life:.12,max:.12});
 }
 hitEnemy(e,damage,a,knock){e.hp-=damage;e.flash=.13;if(!e.boss){e.knockX=Math.cos(a)*knock;e.knockY=Math.sin(a)*knock;}this.effects.push({kind:'number',x:e.x,y:e.y-32,text:Math.round(damage),life:.65,max:.65});if(e.hp<=0)this.killEnemy(e);}
 killEnemy(e){if(!e.alive)return;e.alive=false;this.kills++;this.roomKills++;this.onEvent({type:'kill'});for(let i=0;i<9;i++)this.effects.push({kind:'spark',x:e.x,y:e.y,vx:(this.roomRng()-.5)*120,vy:(this.roomRng()-.5)*120,life:.6,max:.6});
  if(e.special)this.onEvent({type:'unlock'});
  if(e.boss){this.guardianDefeated=true;this.onEvent({type:'bossDefeated',area:this.area});this.enemies.forEach(other=>{if(!other.boss)other.alive=false;});this.projectiles=this.projectiles.filter(p=>p.kind==='arrow');this.telegraphs=[];this.complete();}
  else if(this.roomRng()<.19)this.pickups.push({x:e.x,y:e.y,kind:'health',r:12,age:0});
 }
 damagePlayer(n){const p=this.player;if(p.invincible>0||this.state!=='playing')return;p.hp=Math.max(0,p.hp-n*(this.difficulty==='gentle'?.58:1));p.invincible=1.1;this.roomDamage+=n;this.onEvent({type:'hurt'});this.effects.push({kind:'hurt',x:p.x,y:p.y,life:.45,max:.45});if(p.hp<=0){this.state='dead';this.onEvent({type:'death',elapsed:this.elapsed,kills:this.kills,area:this.area});}}
 heal(){const p=this.player;if(p.herbs<=0||p.hp>=p.maxHp||this.state!=='playing')return;p.herbs--;p.hp=Math.min(p.maxHp,p.hp+45);this.onEvent({type:'heal'});this.effects.push({kind:'heal',x:p.x,y:p.y,life:.8,max:.8});}
 activateShrine(){const p=this.player;const shrine=this.shrines.find(s=>!s.active&&distance(p,s)<95);if(shrine){shrine.active=true;this.echoes++;p.hp=Math.min(p.maxHp,p.hp+8);this.onEvent({type:'echo',count:this.echoes});this.effects.push({kind:'heal',x:shrine.x,y:shrine.y,life:1,max:1});}}
 complete(){if(this.portal)return;this.portal=true;this.player.hp=Math.min(this.player.maxHp,this.player.hp+(this.isBoss?40:16));if(this.passage%2===1)this.player.herbs=Math.min(4,this.player.herbs+1);this.onEvent({type:'clear',boss:this.isBoss,flawless:this.roomDamage===0});}
 advance(){if(!this.portal||this.state!=='playing')return;if(this.isBoss){if(this.area===REGIONS.length-1){this.state='won';this.onEvent({type:'victory',elapsed:this.elapsed,kills:this.kills});return;}this.area++;this.passage=0;this.player.hp=this.player.maxHp;this.player.herbs=Math.min(4,this.player.herbs+1);this.onEvent({type:'region',area:this.area});}else{this.passage++;if(this.passage===3||this.passage===6){this.state='boon';this.onEvent({type:'boon'});return;}}this.enterRoom();}
 chooseBoon(id){if(!['heart','edge','wind','flow'].includes(id)||this.state!=='boon')return;this.boons.push(id);this.rebuildStats();this.player.hp=Math.min(this.player.maxHp,this.player.hp+20);this.state='playing';this.enterRoom();}
 update(dt,input={}){
  if(this.state!=='playing')return;dt=clamp(dt,0,.05);this.elapsed+=dt;this.roomTime+=dt;const p=this.player;for(const k of ['attack','invincible','dash','dashTime'])p[k]=Math.max(0,p[k]-dt);this.input(input,dt);if(this.state!=='playing')return;
  if(!this.isBoss&&!this.portal&&this.wave<6&&this.roomTime>=this.wave*12&&this.enemies.filter(e=>e.alive).length<9)this.spawnWave();
  for(const e of this.enemies){if(!e.alive)continue;e.age+=dt;e.spawn-=dt;e.flash=Math.max(0,e.flash-dt);if(e.spawn>0)continue;const d=distance(e,p),a=Math.atan2(p.y-e.y,p.x-e.x);e.cooldown-=dt;
   e.x+=e.knockX*dt;e.y+=e.knockY*dt;e.knockX*=Math.exp(-dt*10);e.knockY*=Math.exp(-dt*10);
   if(e.windup>0){e.windup-=dt;if(e.windup<=0){if(e.attackType==='charge'){e.chargeTime=.55;e.chargeA=e.lockA;}else if(e.attackType==='shot'){this.enemyShot(e,e.lockA,e.special?5:1);}else if(e.attackType==='ring'){this.ringAttack(e);}else if(e.attackType==='bloom'){this.bloomAttack(e);}else if(e.attackType==='summon'){for(let i=0;i<3;i++)this.spawnEnemy(i%2?'moth':'sprout',false,clamp(e.x+(i-1)*100,100,WORLD.w-100),clamp(e.y+110,100,WORLD.h-100));}else if(d<e.r+65)this.damagePlayer(e.damage);}continue;}
   if(e.chargeTime>0){e.chargeTime-=dt;e.x+=Math.cos(e.chargeA)*360*dt;e.y+=Math.sin(e.chargeA)*360*dt;if(d<e.r+p.r+8)this.damagePlayer(e.damage);}
   else{let speed=e.speed*(this.difficulty==='gentle'?.88:1);const ranged=e.kind==='wisp'||e.special&&e.variant!=='tempo';const wanted=e.boss?220:ranged?240:e.r+p.r+18;if(d>wanted){e.x+=Math.cos(a)*speed*dt;e.y+=Math.sin(a)*speed*dt;}else if(ranged&&d<150){e.x-=Math.cos(a)*speed*.6*dt;e.y-=Math.sin(a)*speed*.6*dt;}
    if(e.boss&&e.cooldown<=0){e.phaseNo=e.hp<e.maxHp*.5?2:1;const cycle=Math.floor(e.age/4)%4;const patterns=[['ring','bloom','charge','summon'],['charge','shot','ring','bloom'],['bloom','summon','ring','charge'],['ring','shot','bloom','summon'],['bloom','ring','summon','shot'],['bloom','shot','charge','ring']];this.windUp(e,patterns[this.area][cycle],a,1.1);e.cooldown=e.phaseNo===2?2.9:3.7;}
    else if(!e.boss&&e.cooldown<=0&&(d<(ranged?550:180))){const attack=e.special?({chord:'summon',tempo:'charge',reverb:'shot',meter:'ring'}[e.variant]):ranged?'shot':e.kind==='moth'?'charge':'melee';this.windUp(e,attack,a,e.kind==='moth'?.85:.95);e.cooldown=e.special&&e.variant==='chord'?7:e.special?3.8:e.kind==='wisp'?3.2:2.5;if(e.special&&e.variant==='chord'){e.variant='reverb';}}
   }
   e.x=clamp(e.x,80,WORLD.w-80);e.y=clamp(e.y,95,WORLD.h-70);
  }
  // Gentle separation keeps clustered enemies readable and sword cleaves useful.
  const alive=this.enemies.filter(e=>e.alive);for(let i=0;i<alive.length;i++)for(let j=i+1;j<alive.length;j++){const a=alive[i],b=alive[j],d=distance(a,b),min=a.r+b.r+4;if(d<min&&d>.01){const push=(min-d)*.5,nx=(a.x-b.x)/d,ny=(a.y-b.y)/d;a.x+=nx*push;a.y+=ny*push;b.x-=nx*push;b.y-=ny*push;}}
  for(const shot of this.projectiles){shot.life-=dt;shot.x+=shot.vx*dt;shot.y+=shot.vy*dt;if(shot.life<=0)continue;if(shot.kind==='arrow'){for(const e of alive){if(shot.hit.has(e)||e.spawn>0||!e.alive)continue;if(distance(shot,e)<shot.r+e.r){shot.hit.add(e);this.hitEnemy(e,shot.damage,Math.atan2(shot.vy,shot.vx),90);shot.pierce--;if(shot.pierce<=0){shot.life=0;break;}}}}else if(distance(shot,p)<p.r+shot.r){this.damagePlayer(shot.damage);shot.life=0;}}
  for(const t of this.telegraphs){t.life-=dt;if(t.life<=0&&!t.triggered){t.triggered=true;if(distance(t,p)<t.r+p.r)this.damagePlayer(t.damage);this.effects.push({kind:'pulse',x:t.x,y:t.y,r:t.r,life:.6,max:.6});}}
  for(const pickup of this.pickups){pickup.age+=dt;if(distance(pickup,p)<40){p.hp=Math.min(p.maxHp,p.hp+10);pickup.collected=true;this.effects.push({kind:'heal',x:p.x,y:p.y,life:.6,max:.6});}}
  for(const fx of this.effects){fx.life-=dt;if(fx.vx){fx.x+=fx.vx*dt;fx.y+=fx.vy*dt;}if(fx.kind==='number')fx.y-=20*dt;}for(const a of this.attackArcs)a.life-=dt;
  this.effects=this.effects.filter(f=>f.life>0);this.projectiles=this.projectiles.filter(f=>f.life>0);this.telegraphs=this.telegraphs.filter(t=>!t.triggered);this.attackArcs=this.attackArcs.filter(a=>a.life>0);this.pickups=this.pickups.filter(p=>!p.collected);this.enemies=this.enemies.filter(e=>e.alive);
  if(!this.isBoss&&!this.portal&&this.roomTime>=PASSAGE_SECONDS&&this.wave>=6&&!this.enemies.length&&this.echoes>=3)this.complete();
 }
 windUp(e,type,a,length){e.windup=length;e.windupMax=length;e.attackType=type;e.lockA=a;if(type==='bloom'){const count=e.boss?4+this.area:2;for(let i=0;i<count;i++){const target=i===0?this.player:{x:200+this.roomRng()*1200,y:200+this.roomRng()*700};this.telegraphs.push({x:target.x,y:target.y,r:e.boss?65:45,life:1.35,max:1.35,damage:e.damage});}}}
 enemyShot(e,a,count=1){for(let i=0;i<count;i++){const spread=(i-(count-1)/2)*.23;this.projectiles.push({x:e.x,y:e.y,vx:Math.cos(a+spread)*155,vy:Math.sin(a+spread)*155,r:8,life:5.5,kind:'orb',damage:e.damage});}}
 ringAttack(e){const count=e.boss?10+this.area*2:7;for(let i=0;i<count;i++){const a=i/count*Math.PI*2+e.age*.12;this.projectiles.push({x:e.x,y:e.y,vx:Math.cos(a)*125,vy:Math.sin(a)*125,r:9,life:5.8,kind:'orb',damage:e.damage});}}
 bloomAttack(e){if(e.boss&&e.phaseNo===2)this.enemyShot(e,Math.atan2(this.player.y-e.y,this.player.x-e.x),5);}
}

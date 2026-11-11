// Development-only controls, excluded from the production build.
import {Journey} from './js/engine.js?v=2.0.0';
let active;
const enter=Journey.prototype.enterRoom;
Journey.prototype.enterRoom=function(...args){active=this;return enter.apply(this,args);};
const panel=document.createElement('aside');
panel.setAttribute('aria-label','Development controls');
panel.style.cssText='position:fixed;bottom:8px;left:50%;transform:translateX(-50%);z-index:5000;display:flex;gap:5px;background:#102820ee;padding:6px;border:1px solid #d2cfaa;border-radius:7px;font:11px system-ui';
for(const [label,action] of [
 ['Defeat traveler',()=>{if(active?.state==='playing'){active.player.invincible=0;active.damagePlayer(9999);}}],
 ['Reach Waychime',()=>{if(active?.state==='playing'){active.passage=2;active.portal=true;active.advance();}}],
 ['Complete journey',()=>{if(active?.state==='playing'){active.area=5;active.passage=8;active.isBoss=true;active.portal=true;active.advance();}}]
]){
 const button=document.createElement('button');button.textContent=label;
 button.style.cssText='padding:7px;background:#cbd8b9;border-radius:4px;color:#17332a';
 button.onclick=action;panel.append(button);
}
document.body.append(panel);

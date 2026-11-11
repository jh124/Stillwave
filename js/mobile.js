export function mobileViewport(width,height,coarse=false){return coarse||(Math.min(width,height)<=520&&Math.max(width,height)<=1100);}
export function portraitBlocked(width,height,coarse=false){return mobileViewport(width,height,coarse)&&height>width;}
export async function requestLandscapeLock(doc,orientation){
 if(typeof orientation?.lock!=='function')return false;
 try{if(!doc.fullscreenElement&&doc.documentElement.requestFullscreen)await doc.documentElement.requestFullscreen();await orientation.lock('landscape');return true;}catch{return false;}
}

export class MobileLayout{
 constructor({onChange=()=>{},beforePortrait=()=>{}}={}){
  this.onChange=onChange;this.beforePortrait=beforePortrait;this.active=false;this.blocked=false;
  this.prompt=document.getElementById('rotatePrompt');this.button=document.getElementById('rotateFullscreen');
  this.prompt.addEventListener('cancel',event=>event.preventDefault());
  this.button.hidden=!matchMedia('(pointer:coarse)').matches||typeof document.documentElement.requestFullscreen!=='function'||typeof screen.orientation?.lock!=='function';
  this.button.onclick=()=>this.requestLandscape();
  this.update=this.update.bind(this);window.addEventListener('resize',this.update);window.visualViewport?.addEventListener('resize',this.update);screen.orientation?.addEventListener('change',this.update);
 }
 update(){
  const width=document.documentElement.clientWidth,height=Math.round(window.visualViewport?.height||window.innerHeight),coarse=matchMedia('(pointer:coarse)').matches;
  this.active=mobileViewport(width,height,coarse);const blocked=portraitBlocked(width,height,coarse),changed=blocked!==this.blocked;
  document.body.classList.toggle('mobile-layout',this.active);document.body.classList.toggle('portrait-blocked',blocked);document.documentElement.style.setProperty('--app-height',height+'px');
  if(blocked&&changed)this.beforePortrait();this.blocked=blocked;
  if(blocked&&!this.prompt.open)this.prompt.showModal();else if(!blocked&&this.prompt.open)this.prompt.close();
  this.onChange();
 }
 async requestLandscape(){
  if(!this.active||!matchMedia('(pointer:coarse)').matches||window.top!==window.self)return false;const locked=await requestLandscapeLock(document,screen.orientation);if(locked)this.update();return locked;
 }
}

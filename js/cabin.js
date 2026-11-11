// Living illustration, with an exact 24-second cycle and a still-image fallback.
export const CABIN_LOOP_SECONDS=24;
export function cabinPhase(milliseconds){return ((milliseconds/1000)%CABIN_LOOP_SECONDS+CABIN_LOOP_SECONDS)%CABIN_LOOP_SECONDS/CABIN_LOOP_SECONDS;}
export function cabinCrop(width,height,imageWidth,imageHeight,positionX=.5){
 const scale=Math.max(width/imageWidth,height/imageHeight),w=imageWidth*scale,h=imageHeight*scale;
 return {x:-(width-w)*positionX/w,y:-(height-h)*.5/h,width:width/w,height:height/h};
}
const TAU=Math.PI*2;
export function flameMotion(phase,seed=0){
 const angle=phase*TAU;
 return {sway:.6*Math.sin(angle*19+seed)+.25*Math.sin(angle*37+seed*1.7),stretch:1+.07*Math.sin(angle*23+seed*.7)+.035*Math.sin(angle*41+seed*1.3),glow:.85+.08*Math.sin(angle*17+seed)+.045*Math.sin(angle*31+seed*1.9)};
}
const fireLights=[
 {bounds:[77,603,103,133],opening:[[82,644],[90,627],[109,612],[130,608],[151,613],[169,629],[175,651],[177,702],[166,714],[86,734]],center:[125,671],radius:125,sway:2.6,seed:0,hearth:true},
 {bounds:[431,494,61,62],opening:[[435,501],[486,497],[490,548],[432,554]],center:[461,525],radius:73,sway:.8,seed:1.7},
 {bounds:[793,230,42,47],opening:[[795,235],[830,231],[833,272],[797,276]],center:[814,255],radius:48,sway:.65,seed:3.4},
 {bounds:[1297,162,51,58],opening:[[1300,166],[1344,162],[1347,212],[1302,219]],center:[1320,191],radius:73,sway:.75,seed:5.1},
 {bounds:[346,370,27,31],opening:[[349,374],[370,371],[372,397],[348,400]],center:[359,385],radius:33,sway:.5,seed:6.8}
];
const traveler=[[639,452],[696,448],[742,473],[735,527],[724,550],[760,589],[790,613],[819,595],[839,590],[846,605],[830,632],[811,646],[814,676],[784,717],[743,733],[684,749],[635,744],[580,740],[564,697],[565,653],[587,598],[610,583],[608,546],[620,526],[614,495]];
const panes=[[[179,122],[223,130],[222,211],[167,210]],[[235,131],[322,143],[325,214],[235,212]],[[334,145],[355,152],[368,216],[336,215]],[[163,227],[222,230],[220,324],[146,326]],[[234,230],[325,232],[328,324],[234,324]],[[338,232],[370,234],[380,324],[339,324]],[[145,343],[219,343],[215,524],[127,539]],[[234,343],[328,342],[331,513],[231,526]],[[341,341],[385,343],[391,505],[343,511]]];
function path(points){const p=new Path2D();points.forEach(([x,y],i)=>p[i?'lineTo':'moveTo'](x,y));p.closePath();return p;}
function mask(){
 const canvas=document.createElement('canvas');canvas.width=1536;canvas.height=1024;
 const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.fillStyle='#fff';ctx.filter='blur(7px)';ctx.fill(path(traveler));
 return ctx.getImageData(0,0,1536,1024).data;
}
function smooth(low,high,value){const t=Math.max(0,Math.min(1,(value-low)/(high-low)));return t*t*(3-2*t);}
function lampFrame(image,light){
 const [x,y,width,height]=light.bounds,canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
 const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,x,y,width,height,0,0,width,height);const pixels=ctx.getImageData(0,0,width,height);
 // Restore dark metal, window bars, and logs over the moving light behind them.
 for(let i=0;i<pixels.data.length;i+=4){const brightness=pixels.data[i]*.3+pixels.data[i+1]*.59+pixels.data[i+2]*.11;pixels.data[i+3]=Math.round((1-smooth(58,160,brightness))*255);}
 ctx.putImageData(pixels,0,0);return canvas;
}
function triangle(ctx,image,source,destination){
 const [s0,s1,s2]=source,[d0,d1,d2]=destination;
 const sx1=s1.x-s0.x,sy1=s1.y-s0.y,sx2=s2.x-s0.x,sy2=s2.y-s0.y,det=sx1*sy2-sx2*sy1;
 const dx1=d1.x-d0.x,dy1=d1.y-d0.y,dx2=d2.x-d0.x,dy2=d2.y-d0.y;
 const a=(dx1*sy2-dx2*sy1)/det,b=(dy1*sy2-dy2*sy1)/det,c=(dx2*sx1-dx1*sx2)/det,d=(dy2*sx1-dy1*sx2)/det;
 const cx=(d0.x+d1.x+d2.x)/3,cy=(d0.y+d1.y+d2.y)/3;
 ctx.save();ctx.beginPath();destination.forEach((p,i)=>{const vx=p.x-cx,vy=p.y-cy,length=Math.hypot(vx,vy);ctx[i?'lineTo':'moveTo'](p.x+vx/length*.35,p.y+vy/length*.35);});ctx.closePath();ctx.clip();
 ctx.transform(a,b,c,d,d0.x-a*s0.x-c*s0.y,d0.y-b*s0.x-d*s0.y);ctx.drawImage(image,0,0);ctx.restore();
}
function mesh(ctx,image,rect,columns,rows,displace){
 const [x,y,width,height]=rect,points=[];
 for(let row=0;row<=rows;row++)for(let column=0;column<=columns;column++){
  const sx=x+column/columns*width,sy=y+row/rows*height,[dx,dy]=displace(sx,sy);points.push({source:{x:sx,y:sy},destination:{x:sx+dx,y:sy+dy},moving:Math.abs(dx)+Math.abs(dy)>.001});
 }
 for(let row=0;row<rows;row++)for(let column=0;column<columns;column++){
  const a=row*(columns+1)+column,b=a+1,c=a+columns+1,d=c+1;
  for(const indices of [[a,b,c],[b,d,c]]){const vertices=indices.map(i=>points[i]);if(vertices.some(v=>v.moving))triangle(ctx,image,vertices.map(v=>v.source),vertices.map(v=>v.destination));}
 }
}
export class CabinAnimation{
 constructor(canvas,image){
  this.canvas=canvas;this.image=image;this.ready=false;this.disabled=false;this.reduced=false;this.pending=null;this.last=-Infinity;this.start=null;
 }
 setReducedMotion(reduced){this.reduced=reduced;if(reduced)this.canvas.classList.remove('active');}
 async prepare(){
  try{
   await this.image.decode();const plate=new Image();plate.src=new URL('../assets/cabin-steam-plate.webp',import.meta.url).href;await plate.decode();
   this.ctx=this.canvas.getContext('2d',{alpha:false});if(!this.ctx)throw new Error('Canvas unavailable');
   this.travelerMask=mask();this.glass=new Path2D();for(const pane of panes)this.glass.addPath(path(pane));this.foliage=new Path2D();for(const pane of panes.slice(3))this.foliage.addPath(path(pane));
   this.fireLights=fireLights.map(light=>({...light,clip:path(light.opening),frame:lampFrame(this.image,light)}));
   // Feather the generated clean plate into only the old steam area.
   this.plate=document.createElement('canvas');this.plate.width=96;this.plate.height=96;const pc=this.plate.getContext('2d');pc.drawImage(plate,0,0);
   pc.globalCompositeOperation='destination-in';const gradient=pc.createRadialGradient(43,43,19,43,43,43);gradient.addColorStop(0,'#fff');gradient.addColorStop(1,'#fff0');pc.fillStyle=gradient;pc.fillRect(0,0,96,77);pc.clearRect(0,77,96,19);
   this.ready=true;this.canvas.dataset.animation='ready';
  }catch(error){this.disabled=true;this.canvas.dataset.animation='fallback';this.canvas.dataset.animationError=error.message;this.canvas.classList.remove('active');}
 }
 paint(phase){
  const ctx=this.ctx,image=this.image,angle=phase*TAU;
  ctx.drawImage(image,0,0,1536,1024);
  const rock=Math.sin(angle*3);
  mesh(ctx,image,[548,424,320,352],12,13,(x,y)=>{const alpha=this.travelerMask[(Math.round(y)*1536+Math.round(x))*4+3]/255,upper=1-smooth(565,750,y);return [(y-742)*.012*rock*alpha*upper,(666-x)*.004*rock*alpha*upper];});
  const breeze=Math.sin(angle*2)*2.8+Math.sin(angle*4)*.65;
  ctx.save();ctx.clip(this.foliage);mesh(ctx,image,[120,220,282,324],7,9,(x,y)=>[breeze*(.55+.45*Math.sin(y*.022)),Math.sin(angle*2)*.65]);ctx.restore();
  ctx.drawImage(this.plate,944,512);
  // Drops traverse an integer number of periods per cycle, with the window frame fixed.
  ctx.save();ctx.clip(this.glass);ctx.lineCap='round';
  for(let layer=0;layer<3;layer++){
   const spacing=19+layer*11,period=97+layer*43;
   for(let column=3;column<22;column++){
    const seed=(Math.sin((column+layer*79)*127.1+311.7)*43758.5453)%1+1,x=(column+.18+.64*(seed%1))*spacing;
    for(let band=-1;band<7;band++){
     const y=(band+(phase*(23-layer*5)+seed)%1)*period-80,length=12+layer*4;
     ctx.strokeStyle=`rgba(177,215,215,${.12+(seed%1)*.13})`;ctx.lineWidth=.55+layer*.2;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+length*.035,y+length);ctx.stroke();
    }
   }
  }
  ctx.restore();
  for(let i=0;i<12;i++){
   const age=(phase*4+i/12)%1,drift=Math.sin(age*TAU*1.2+angle*4+i*.32)*(2+age*7),x=985+drift,y=590-age*88,radius=5+age*5,opacity=Math.sin(age*Math.PI)**1.5*.13;
   ctx.save();ctx.translate(x,y);ctx.scale((2.4+age*3.8)/radius,1);const g=ctx.createRadialGradient(0,0,0,0,0,radius);g.addColorStop(0,`rgba(234,235,218,${opacity})`);g.addColorStop(1,'rgba(234,235,218,0)');ctx.fillStyle=g;ctx.fillRect(-radius,-radius,radius*2,radius*2);ctx.restore();
  }
  this.paintFire(phase);
 }
 paintFire(phase){
  const ctx=this.ctx,angle=phase*TAU;
  for(const light of this.fireLights){
   const motion=flameMotion(phase,light.seed),[x,y,width,height]=light.bounds;
   ctx.save();ctx.clip(light.clip);
   mesh(ctx,this.image,light.bounds,light.hearth?6:2,light.hearth?8:3,(px,py)=>{
    const rise=1-smooth(y,y+height,py),ripple=.7+.3*Math.sin(py*.16+angle*13+light.seed);
    return [motion.sway*light.sway*rise*ripple,(1-motion.stretch)*height*.5*rise];
   });
   ctx.drawImage(light.frame,x,y);
   ctx.globalCompositeOperation='screen';ctx.globalAlpha=.025+motion.glow*.045;ctx.drawImage(this.image,x,y,width,height,x,y,width,height);ctx.restore();
   // A restrained warm reflection follows each flame's own flicker.
   const [cx,cy]=light.center,radius=light.radius,opacity=(light.hearth?.045:.026)*motion.glow;
   ctx.save();ctx.globalCompositeOperation='screen';const glow=ctx.createRadialGradient(cx,cy,0,cx,cy,radius);glow.addColorStop(0,`rgba(255,167,63,${opacity})`);glow.addColorStop(.45,`rgba(255,145,46,${opacity*.36})`);glow.addColorStop(1,'rgba(255,145,46,0)');ctx.fillStyle=glow;ctx.fillRect(cx-radius,cy-radius,radius*2,radius*2);ctx.restore();
  }
 }
 draw(now,{visible=true,positionX=.5}={}){
  if(!visible||this.reduced||this.disabled)return;
  if(!this.ready){this.pending??=this.prepare();return;}
  if(now-this.last<1000/24)return;this.last=now;this.start??=now;
  const box=this.canvas.getBoundingClientRect();if(!box.width||!box.height)return;
  const ratio=Math.min(1.25,window.devicePixelRatio||1,1600/box.width),width=Math.round(box.width*ratio),height=Math.round(box.height*ratio),ctx=this.ctx;
  if(this.canvas.width!==width||this.canvas.height!==height){this.canvas.width=width;this.canvas.height=height;}
  const crop=cabinCrop(box.width,box.height,1536,1024,positionX),scale=width/(crop.width*1536);
  ctx.setTransform(scale,0,0,scale,-crop.x*1536*scale,-crop.y*1024*scale);this.paint(cabinPhase(now-this.start));ctx.resetTransform();this.canvas.classList.add('active');
 }
}

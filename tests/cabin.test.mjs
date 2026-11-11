import test from 'node:test';
import assert from 'node:assert/strict';
import {cabinCrop,cabinPhase,CABIN_LOOP_SECONDS} from '../js/cabin.js';

test('the cabin loop has identical phases at its seam and at later complete cycles',()=>{
 for(const time of [0,125,3000,12345,23999])assert.ok(Math.abs(cabinPhase(time)-cabinPhase(time+CABIN_LOOP_SECONDS*1000))<1e-12);
 assert.equal(cabinPhase(0),0);assert.equal(cabinPhase(24000),0);assert.equal(cabinPhase(-1000),23/24);
});
test('animated cabin coordinates match the still image and interaction areas at every viewport crop',()=>{
 for(const [width,height] of [[1363,936],[1920,1080],[844,390],[667,320],[390,844]]){
  const positionX=width<=760?.63:.5,crop=cabinCrop(width,height,1536,1024,positionX);
  const scale=Math.max(width/1536,height/1024),imageWidth=1536*scale,imageHeight=1024*scale,offsetX=(width-imageWidth)*positionX,offsetY=(height-imageHeight)/2;
  for(const [x,y] of [[.54,.56],[.735,.40],[.644,.576],[.19,.35]]){
   assert.ok(Math.abs((x-crop.x)/crop.width*width-(offsetX+x*imageWidth))<1e-9);
   assert.ok(Math.abs((y-crop.y)/crop.height*height-(offsetY+y*imageHeight))<1e-9);
  }
 }
});

import {cp, mkdir, rm, readdir, readFile, writeFile} from 'node:fs/promises';
import {VERSION} from '../js/data.js';
const out = new URL('../dist/', import.meta.url);
await rm(out, {recursive:true,force:true});
await mkdir(out,{recursive:true});
for (const entry of ['index.html','styles.css','icon.svg','js','assets']) await cp(new URL('../'+entry,import.meta.url),new URL(entry,out),{recursive:true});
// Give module dependencies the same release URL so returning players receive the update together.
for(const file of await readdir(new URL('js/',out))){if(!file.endsWith('.js'))continue;const path=new URL('js/'+file,out),source=await readFile(path,'utf8');await writeFile(path,source.replace(/(from\s*['"])(\.{1,2}\/[^'"?]+\.js)(['"])/g,(_,start,path,end)=>`${start}${path}?v=${VERSION}${end}`));}
console.log('Stillwave built into dist/');

import {cp, mkdir, rm} from 'node:fs/promises';
const out = new URL('../dist/', import.meta.url);
await rm(out, {recursive:true,force:true});
await mkdir(out,{recursive:true});
for (const entry of ['index.html','styles.css','mobile.css','manifest.webmanifest','icon.svg','favicon.ico','js','assets']) await cp(new URL('../'+entry,import.meta.url),new URL(entry,out),{recursive:true});
console.log('Stillwave built into dist/');

import {readFile,writeFile,copyFile} from 'node:fs/promises';
const root=new URL('../',import.meta.url),dist=new URL('dist/',root);
const index=await readFile(new URL('index.html',root),'utf8');
await writeFile(new URL('qa-game.html',dist),index.replace('<script type="module" src="./js/app.js', '<script type="module" src="./qa-controls.js"></script>\n<script type="module" src="./js/app.js'));
for(const [source,target] of [['browser.html','qa.html'],['qa-controls.js','qa-controls.js'],['audio-effects.html','audio-effects.html']])await copyFile(new URL('tests/'+source,root),new URL(target,dist));
console.log('Development fixtures ready at /qa.html. Run npm run build before publication.');

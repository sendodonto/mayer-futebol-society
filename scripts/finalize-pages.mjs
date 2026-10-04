import { readFileSync,writeFileSync } from 'node:fs';
const base=process.env.PAGES_BASE_PATH||'/mayer-futebol-society/';
if(!base.startsWith('/')||!base.endsWith('/')||base.includes('..'))throw new Error('PAGES_BASE_PATH must be an absolute URL pathname ending in /');
const viewer='pages-dist/viewer.html';
writeFileSync(viewer,readFileSync(viewer,'utf8').replaceAll("'/models/'",JSON.stringify(base+'models/')).replaceAll("'/images/'",JSON.stringify(base+'images/')));
const index='pages-dist/index.html';
writeFileSync(index,readFileSync(index,'utf8').replace('href="/images/mayer-mark.png"',`href="${base}images/mayer-mark.png"`));
writeFileSync('pages-dist/.nojekyll','');
console.log(`GitHub Pages assets prepared for ${base}`);

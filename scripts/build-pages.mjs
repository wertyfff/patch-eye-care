import { mkdir, readFile, writeFile, cp } from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const base='/patch-eye-care/';
const out=path.join(root,'docs');
await mkdir(out,{recursive:true});
for(const name of ['app.js','styles.css','catalog.css','motion.js','motion.css','favicon.svg'])await cp(path.join(root,name),path.join(out,name));
await cp(path.join(root,'assets'),path.join(out,'assets'),{recursive:true});
const html=(await readFile(path.join(root,'index.html'),'utf8')).replace('<base href="/">',`<base href="${base}">`);
await writeFile(path.join(out,'index.html'),html);
await writeFile(path.join(out,'.nojekyll'),'');
for(const id of ['aqua','glow','graphite','rose']){
  const dir=path.join(out,'product',id);await mkdir(dir,{recursive:true});await writeFile(path.join(dir,'index.html'),html);
}
await writeFile(path.join(out,'404.html'),html);
console.log(`GitHub Pages output: docs/ (base ${base})`);

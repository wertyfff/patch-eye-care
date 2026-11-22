import http from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'../docs');
const prefix='/patch-eye-care/';
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.woff2':'font/woff2'};
http.createServer(async(req,res)=>{
 try{
  const route=new URL(req.url,'http://localhost').pathname;
  if(!route.startsWith(prefix)){res.writeHead(404);res.end();return;}
  let file=path.resolve(root,decodeURIComponent(route.slice(prefix.length))||'.');
  if(file!==root&&!file.startsWith(root+path.sep))throw new Error('Invalid path');
  if((await stat(file)).isDirectory())file=path.join(file,'index.html');
  const body=await readFile(file);res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-cache'});res.end(body);
 }catch{res.writeHead(404);res.end('Not found');}
}).listen(4174,'127.0.0.1',()=>console.log('Pages preview: http://127.0.0.1:4174/patch-eye-care/'));

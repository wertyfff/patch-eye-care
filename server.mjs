import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('.', import.meta.url));
const port = Number(process.env.PORT || 4173);
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.ico': 'image/x-icon' };
http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    let route = decodeURIComponent(url.pathname);
    if (route === '/' || /^\/product\/[a-z-]+\/?$/.test(route)) route = '/index.html';
    const file = path.resolve(root, '.' + route);
    const publicRoute = ['/index.html', '/styles.css', '/catalog.css', '/motion.css', '/app.js', '/motion.js', '/favicon.svg'].includes(route);
    const assetFile = file.startsWith(path.join(root, 'assets') + path.sep);
    if (!file.startsWith(root) || !(publicRoute || assetFile)) {
      res.writeHead(404); res.end('Not found'); return;
    }
    if (!(await stat(file)).isFile()) throw new Error('Not a file');
    res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff' });
    res.end(await readFile(file));
  } catch { res.writeHead(404); res.end('Not found'); }
}).listen(port, '127.0.0.1', () => console.log(`ПАТЧ — http://127.0.0.1:${port}`));

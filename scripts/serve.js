import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
const repositoryRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const root = process.argv.includes('--built') ? resolve(repositoryRoot, 'dist') : repositoryRoot;
const types = { '.html': 'text/html;charset=utf-8', '.js': 'text/javascript;charset=utf-8', '.css': 'text/css;charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json', '.json': 'application/json' };
const server = http.createServer(async (request, response) => {
  try {
    let pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    // Also expose a repository subpath for Pages regression tests.
    if (pathname.startsWith('/Dang/') || pathname.startsWith('/DANG/')) pathname = pathname.slice(5);
    if (pathname.endsWith('/')) pathname += 'index.html';
    const path = resolve(root, '.' + pathname);
    if (!path.startsWith(root + sep)) throw new Error('invalid-path');
    const content = await readFile(path);
    response.writeHead(200, { 'Content-Type': types[extname(path)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    response.end(content);
  } catch { response.writeHead(404); response.end('Not found'); }
});
server.listen(Number(process.env.PORT || 4173), '127.0.0.1', () => process.stdout.write('Dang: http://127.0.0.1:4173/Dang/\n'));

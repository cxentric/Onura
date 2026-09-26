// Production server: serves the built app from ./build and the /api routes.
// Usage: npm run build && npm run serve
import 'dotenv/config';
import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { apiMiddleware } from './api.mjs';

const BUILD_DIR = resolve(fileURLToPath(new URL('../build', import.meta.url)));
const PORT = Number(process.env.PORT) || 3000;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.map': 'application/json',
  '.woff2': 'font/woff2',
};

async function serveFile(res, filePath) {
  res.setHeader('Content-Type', MIME_TYPES[extname(filePath)] || 'application/octet-stream');
  if (filePath.startsWith(join(BUILD_DIR, 'assets') + sep)) {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  }
  createReadStream(filePath).pipe(res);
}

async function serveStatic(req, res) {
  const urlPath = decodeURIComponent(req.url.split('?')[0]);
  const filePath = normalize(join(BUILD_DIR, urlPath));
  if (filePath.startsWith(BUILD_DIR + sep)) {
    const info = await stat(filePath).catch(() => null);
    if (info?.isFile()) return serveFile(res, filePath);
  }
  // SPA fallback so client-side routes like /messaging-chat work on refresh.
  serveFile(res, join(BUILD_DIR, 'index.html'));
}

createServer((req, res) => {
  apiMiddleware(req, res, () => {
    serveStatic(req, res).catch(error => {
      console.error(error);
      res.statusCode = 500;
      res.end('Internal server error');
    });
  });
}).listen(PORT, () => {
  console.log(`CXentric running at http://localhost:${PORT}`);
  if (!process.env.OPENAI_API_KEY) console.warn('Warning: OPENAI_API_KEY is not set; AI features will fail.');
});

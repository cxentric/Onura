import * as ai from './openai.mjs';

const MAX_BODY_BYTES = 16 * 1024;
const MAX_TEXT_LENGTH = 4000;

// Simple in-memory per-IP rate limit so the endpoints can't be used to drain the OpenAI budget.
const RATE_WINDOW_MS = 60 * 1000;
const RATE_MAX_REQUESTS = Number(process.env.AI_RATE_LIMIT_PER_MINUTE) || 20;
const hits = new Map();

function isRateLimited(ip) {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || now - entry.start > RATE_WINDOW_MS) {
    hits.set(ip, { start: now, count: 1 });
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_MAX_REQUESTS;
}

setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of hits) {
    if (now - entry.start > RATE_WINDOW_MS) hits.delete(ip);
  }
}, RATE_WINDOW_MS).unref();

function readJson(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', chunk => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(Object.assign(new Error('Request body too large.'), { status: 413 }));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      try {
        resolve(chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : {});
      } catch {
        reject(Object.assign(new Error('Invalid JSON body.'), { status: 400 }));
      }
    });
    req.on('error', reject);
  });
}

function requireText(value, field) {
  if (typeof value !== 'string' || !value.trim()) {
    throw Object.assign(new Error(`"${field}" is required.`), { status: 400 });
  }
  if (value.length > MAX_TEXT_LENGTH) {
    throw Object.assign(new Error(`"${field}" must be at most ${MAX_TEXT_LENGTH} characters.`), { status: 400 });
  }
  return value;
}

function sendJson(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

const routes = {
  '/api/ai/chat': async body => ({ content: await ai.chatCompletion(requireText(body.message, 'message')) }),
  '/api/ai/hashtags': async body => ({ hashtags: await ai.generateHashtags(requireText(body.content, 'content')) }),
  '/api/ai/image': async body => ({ url: await ai.generateImage(requireText(body.prompt, 'prompt'), body.size) }),
  '/api/ai/moderate': async body => ({ result: await ai.moderateText(requireText(body.text, 'text')) }),
  '/api/ai/networking-suggestions': async body => ({
    content: await ai.getNetworkingSuggestions(requireText(body.profile, 'profile')),
  }),
  '/api/ai/content-ideas': async body =>
    ai.generateContentIdeas(requireText(body.topic, 'topic'), typeof body.contentType === 'string' ? body.contentType.slice(0, 50) : 'post'),
};

async function streamChat(body, res) {
  const message = requireText(body.message, 'message');
  let started = false;
  try {
    await ai.streamChatCompletion(message, chunk => {
      if (!started) {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('Cache-Control', 'no-cache');
        started = true;
      }
      res.write(chunk);
    });
    if (!started) res.statusCode = 200;
    res.end();
  } catch (error) {
    if (!started) throw error;
    // Headers already sent; just close the stream.
    console.error('[api] stream error:', error.message);
    res.end();
  }
}

/**
 * Connect-style middleware: works as Vite dev middleware and in the production server.
 */
export function apiMiddleware(req, res, next) {
  const path = req.url.split('?')[0];
  if (!path.startsWith('/api/')) return next();

  const isStream = path === '/api/ai/chat/stream';
  const handler = routes[path];
  if (!isStream && !handler) return sendJson(res, 404, { error: 'Not found.' });
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed.' });

  const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress;
  if (isRateLimited(ip)) {
    return sendJson(res, 429, { error: 'Too many AI requests. Please wait a minute and try again.' });
  }

  readJson(req)
    .then(body => (isStream ? streamChat(body, res) : handler(body).then(data => sendJson(res, 200, data))))
    .catch(error => {
      const status = error.status && error.status >= 400 && error.status < 600 ? error.status : 500;
      console.error(`[api] ${path} failed:`, error.message);
      // Don't leak upstream/internal details for server errors.
      const message = status < 500 || status === 429 ? error.message : 'AI service is temporarily unavailable. Please try again later.';
      if (!res.headersSent) sendJson(res, status, { error: message });
    });
}

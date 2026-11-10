// 管理画面用のローカルサーバー（このMacの中だけで動きます）
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const { renderPage } = require('./render');

const ROOT = __dirname;
const PORT = Number(process.env.PORT) || 4173;
const DATA = path.join(ROOT, 'data', 'content.json');
const UPLOADS = path.join(ROOT, 'uploads');
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.gif': 'image/gif', '.svg': 'image/svg+xml', '.ico': 'image/x-icon',
};
const IMG_EXT = ['.png', '.jpg', '.jpeg', '.webp', '.gif'];

const readContent = () => JSON.parse(fs.readFileSync(DATA, 'utf8'));
function build(content) {
  fs.writeFileSync(path.join(ROOT, 'index.html'), renderPage(content));
}
function send(res, code, body, type = 'application/json; charset=utf-8') {
  res.writeHead(code, { 'Content-Type': type, 'Cache-Control': 'no-store' });
  res.end(typeof body === 'string' || Buffer.isBuffer(body) ? body : JSON.stringify(body));
}
function readBody(req, limit) {
  return new Promise((resolve, reject) => {
    const chunks = []; let size = 0;
    req.on('data', (c) => { size += c.length; if (size > limit) { reject(new Error('too large')); req.destroy(); } else chunks.push(c); });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}
// 他のサイトから勝手に保存されないよう、管理画面からの通信だけ受け付ける
function fromAdmin(req) {
  const host = req.headers.host || '';
  const origin = req.headers.origin;
  return req.headers['x-admin'] === '1' && /^(127\.0\.0\.1|localhost):\d+$/.test(host) && (!origin || origin === `http://${host}`);
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://x');
    const p = decodeURIComponent(url.pathname);

    if (p === '/api/content' && req.method === 'GET') return send(res, 200, readContent());

    if (p === '/api/content' && req.method === 'POST') {
      if (!fromAdmin(req)) return send(res, 403, { error: 'forbidden' });
      const content = JSON.parse((await readBody(req, 2 * 1024 * 1024)).toString('utf8'));
      if (!content || typeof content !== 'object' || Array.isArray(content)) return send(res, 400, { error: 'bad data' });
      if (fs.existsSync(DATA)) fs.copyFileSync(DATA, path.join(ROOT, 'data', 'content.backup.json'));
      fs.writeFileSync(DATA, JSON.stringify(content, null, 2) + '\n');
      build(content);
      return send(res, 200, { ok: true });
    }

    if (p === '/api/upload' && req.method === 'POST') {
      if (!fromAdmin(req)) return send(res, 403, { error: 'forbidden' });
      const original = decodeURIComponent(req.headers['x-filename'] || 'image');
      const ext = path.extname(original).toLowerCase();
      if (!IMG_EXT.includes(ext)) return send(res, 400, { error: '画像は JPG / PNG / WebP / GIF が使えます' });
      const buf = await readBody(req, 12 * 1024 * 1024);
      const base = path.basename(original, ext).replace(/[^a-zA-Z0-9_-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'image';
      const name = `${Date.now()}-${base}${ext}`;
      fs.mkdirSync(UPLOADS, { recursive: true });
      fs.writeFileSync(path.join(UPLOADS, name), buf);
      return send(res, 200, { ok: true, path: `uploads/${name}` });
    }

    if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, { error: 'method not allowed' });

    let rel = p;
    if (rel === '/') rel = '/index.html';
    if (rel === '/admin') { res.writeHead(302, { Location: '/admin/' }); return res.end(); }
    if (rel.endsWith('/')) rel += 'index.html';
    const file = path.normalize(path.join(ROOT, rel));
    const top = path.relative(ROOT, file).split(path.sep)[0];
    const allowed = ['index.html', 'assets', 'uploads', 'admin'];
    if (!file.startsWith(ROOT + path.sep) || !allowed.includes(top) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
      return send(res, 404, 'Not Found', 'text/plain; charset=utf-8');
    }
    send(res, 200, fs.readFileSync(file), TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream');
  } catch (e) {
    send(res, e.message === 'too large' ? 413 : 500, { error: e.message === 'too large' ? 'ファイルが大きすぎます（12MBまで）' : String(e.message || e) });
  }
});

if (process.argv.includes('--build')) {
  build(readContent());
  console.log('index.html を作り直しました');
} else {
  build(readContent());
  server.listen(PORT, '127.0.0.1', () => {
    console.log(`サイト    : http://127.0.0.1:${PORT}/`);
    console.log(`管理画面  : http://127.0.0.1:${PORT}/admin/`);
    console.log('終了するときは、この画面で control + C を押してください');
  });
}
